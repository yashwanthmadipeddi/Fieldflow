import { BriefcaseBusiness, CheckCircle2, Clock3, Users } from "lucide-react";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import StatCard from "../../components/StatCard";
import { apiFetch } from "../../api/client";
import type { ServiceRequest, User } from "../../types";

type ListResponse<T> = T[] | { results?: T[] };

export default function Dashboard({ user }: { user: User }) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<ListResponse<ServiceRequest>>("/workorders/requests/")
      .then((data) => {
        setRequests(
          Array.isArray(data) ? data : data.results ?? []
        );
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load requests."
        );
        setRequests([]);
      });
  }, []);

  const active = requests.filter(
    (r) => !["VERIFIED", "CANCELLED"].includes(r.status)
  ).length;

  const completed = requests.filter(
    (r) => ["COMPLETED", "VERIFIED"].includes(r.status)
  ).length;

  return (
    <Layout user={user}>
      <div className="hero">
        <div>
          <span className="eyebrow">OPERATIONS OVERVIEW</span>
          <h2>{user.business_name || "Your business"}</h2>
          <p>
            Keep requests moving from intake to verified completion.
          </p>
        </div>

        <a className="primary small" href="/owner/services">
          Manage services
        </a>
      </div>

      <div className="stats">
        <StatCard
          label="Total requests"
          value={requests.length}
          icon={<BriefcaseBusiness size={20} />}
        />

        <StatCard
          label="Active jobs"
          value={active}
          icon={<Clock3 size={20} />}
        />

        <StatCard
          label="Completed"
          value={completed}
          icon={<CheckCircle2 size={20} />}
        />

        <StatCard
          label="Team"
          value="Live"
          hint="Manage workers"
          icon={<Users size={20} />}
        />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Recent service requests</h3>
            <p>
              Latest customer demand across your service catalog.
            </p>
          </div>
        </div>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {requests.slice(0, 6).map((request) => (
          <div className="list-row" key={request.id}>
            <div>
              <strong>
                #{request.id} · {request.service_name}
              </strong>
              <span>
                {request.customer_name} · Priority {request.priority}
              </span>
            </div>

            <span
              className={`status ${request.status.toLowerCase()}`}
            >
              {request.status.replace("_", " ")}
            </span>
          </div>
        ))}

        {requests.length === 0 && !error && (
          <div className="empty">
            No requests yet. Once customers submit work, they appear here.
          </div>
        )}
      </div>
    </Layout>
  );
}
