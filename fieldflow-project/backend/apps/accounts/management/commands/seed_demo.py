from django.core.management.base import BaseCommand
from apps.accounts.models import User
from apps.services.models import Service, WorkerSkill

class Command(BaseCommand):
    help = "Create deterministic demo users, workers, skills, and services for local evaluation."

    def handle(self, *args, **options):
        owner, _ = User.objects.get_or_create(username="demo_owner", defaults={"first_name":"Anil","last_name":"Sharma","email":"owner@example.com","role":"OWNER","business_name":"FieldFlow Services"})
        owner.role="OWNER"; owner.business_name="FieldFlow Services"; owner.set_password("DemoOwner123!"); owner.save()

        customer, _ = User.objects.get_or_create(username="demo_customer", defaults={"first_name":"Ajay","last_name":"Kumar","email":"customer@example.com","role":"CUSTOMER"})
        customer.role="CUSTOMER"; customer.set_password("DemoCustomer123!"); customer.save()

        workers=[]
        for username, first, last, skill in [("demo_worker_1","Ravi","Kumar","AC Repair"),("demo_worker_2","Priya","Reddy","Plumbing")]:
            worker,_=User.objects.get_or_create(username=username,defaults={"first_name":first,"last_name":last,"email":f"{username}@example.com","role":"WORKER"})
            worker.role="WORKER"; worker.set_password("DemoWorker123!"); worker.save(); workers.append(worker)
            WorkerSkill.objects.get_or_create(worker=worker,name=skill,defaults={"level":4})

        Service.objects.get_or_create(owner=owner,name="AC Repair",defaults={"description":"Inspection, service, and basic repair.","base_price":"700.00","estimated_minutes":90})
        Service.objects.get_or_create(owner=owner,name="Plumbing",defaults={"description":"Household plumbing diagnostics and repair.","base_price":"500.00","estimated_minutes":60})
        self.stdout.write(self.style.SUCCESS("Demo data ready."))
        self.stdout.write("Owner: demo_owner / DemoOwner123!")
        self.stdout.write("Worker: demo_worker_1 / DemoWorker123!")
        self.stdout.write("Customer: demo_customer / DemoCustomer123!")
