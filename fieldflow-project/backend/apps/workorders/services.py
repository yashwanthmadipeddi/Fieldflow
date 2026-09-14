from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.accounts.models import User
from apps.services.models import WorkerSkill
from .models import Assignment, ServiceRequest, StatusHistory

ALLOWED_TRANSITIONS = {
    ServiceRequest.Status.PENDING: {ServiceRequest.Status.REVIEWING, ServiceRequest.Status.CANCELLED},
    ServiceRequest.Status.REVIEWING: {ServiceRequest.Status.ASSIGNED, ServiceRequest.Status.CANCELLED},
    ServiceRequest.Status.ASSIGNED: {ServiceRequest.Status.ACCEPTED, ServiceRequest.Status.CANCELLED},
    ServiceRequest.Status.ACCEPTED: {ServiceRequest.Status.SCHEDULED, ServiceRequest.Status.CANCELLED},
    ServiceRequest.Status.SCHEDULED: {ServiceRequest.Status.IN_PROGRESS, ServiceRequest.Status.CANCELLED},
    ServiceRequest.Status.IN_PROGRESS: {ServiceRequest.Status.COMPLETED, ServiceRequest.Status.CANCELLED},
    ServiceRequest.Status.COMPLETED: {ServiceRequest.Status.VERIFIED},
    ServiceRequest.Status.VERIFIED: set(),
    ServiceRequest.Status.CANCELLED: set(),
}

@transaction.atomic
def change_status(request_obj: ServiceRequest, new_status: str, actor, note: str = ""):
    if new_status == request_obj.status:
        return request_obj
    if new_status not in ALLOWED_TRANSITIONS.get(request_obj.status, set()):
        raise ValidationError(f"Cannot change status from {request_obj.status} to {new_status}.")
    if actor.role == User.Role.CUSTOMER and new_status not in {ServiceRequest.Status.CANCELLED, ServiceRequest.Status.VERIFIED}:
        raise ValidationError("Customers can only cancel or verify a job.")
    if actor.role == User.Role.WORKER and new_status not in {
        ServiceRequest.Status.ACCEPTED,
        ServiceRequest.Status.SCHEDULED,
        ServiceRequest.Status.IN_PROGRESS,
        ServiceRequest.Status.COMPLETED,
        ServiceRequest.Status.CANCELLED,
    }:
        raise ValidationError(
            "Workers can accept, schedule, start, complete, or cancel their assigned job."
        )
    if actor.role == User.Role.OWNER and request_obj.service.owner_id != actor.id:
        raise ValidationError("You do not own this service request.")
    old = request_obj.status
    request_obj.status = new_status
    request_obj.updated_at = timezone.now()
    request_obj.save(update_fields=["status", "updated_at"])
    StatusHistory.objects.create(request=request_obj, from_status=old, to_status=new_status, changed_by=actor, note=note)
    recipients = {request_obj.customer_id}
    if hasattr(request_obj, "assignment"):
        recipients.add(request_obj.assignment.worker_id)
    from apps.notifications.models import Notification
    for user_id in recipients:
        if user_id != actor.id:
            Notification.objects.create(user_id=user_id, title="Job status updated", message=f"Job #{request_obj.id} changed from {old} to {new_status}.")
    return request_obj

@transaction.atomic
def assign_worker(request_obj: ServiceRequest, worker: User, owner, scheduled_start=None):
    if owner.role != User.Role.OWNER:
        raise ValidationError("Only owners can assign workers.")
    if request_obj.service.owner_id != owner.id:
        raise ValidationError("This request does not belong to your business.")
    if request_obj.status not in {ServiceRequest.Status.PENDING, ServiceRequest.Status.REVIEWING, ServiceRequest.Status.ASSIGNED}:
        raise ValidationError("This request is not currently assignable.")
    if worker.role != User.Role.WORKER or not worker.is_active:
        raise ValidationError("Selected user is not an active worker.")
    if scheduled_start is not None:
        conflict = Assignment.objects.filter(worker=worker, scheduled_start=scheduled_start).exists()
        if conflict:
            raise ValidationError("Worker already has an assignment at that time.")
    previous_status = request_obj.status
    assignment, created = Assignment.objects.update_or_create(request=request_obj, defaults={"worker": worker, "assigned_by": owner, "scheduled_start": scheduled_start})
    request_obj.status = ServiceRequest.Status.ASSIGNED
    request_obj.save(update_fields=["status", "updated_at"])
    if previous_status != ServiceRequest.Status.ASSIGNED:
        StatusHistory.objects.create(request=request_obj, from_status=previous_status, to_status=ServiceRequest.Status.ASSIGNED, changed_by=owner, note="Worker assigned")
    from apps.notifications.models import Notification
    Notification.objects.create(user=worker, title="New job assigned", message=f"Job #{request_obj.id} has been assigned to you.")
    return assignment

def recommend_workers(request_obj):
    workers = User.objects.filter(role=User.Role.WORKER, is_active=True).prefetch_related("skills", "assignments")
    desired = request_obj.service.name.lower()
    ranked = []
    for worker in workers:
        skill_score = sum(1 for s in worker.skills.all() if s.name.lower() in desired or desired in s.name.lower())
        workload = worker.assignments.filter(request__status__in=[ServiceRequest.Status.ASSIGNED, ServiceRequest.Status.ACCEPTED, ServiceRequest.Status.SCHEDULED, ServiceRequest.Status.IN_PROGRESS]).count()
        score = skill_score * 20 + max(0, 20 - workload * 4)
        ranked.append((score, worker, skill_score, workload))
    ranked.sort(key=lambda x: x[0], reverse=True)
    return [{"worker": w.id, "name": w.get_full_name() or w.username, "score": score, "skill_matches": skills, "active_jobs": workload} for score, w, skills, workload in ranked[:5]]
