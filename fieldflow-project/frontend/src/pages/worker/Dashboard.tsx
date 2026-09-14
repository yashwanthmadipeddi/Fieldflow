import { Briefcase, CheckCircle2, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import StatCard from "../../components/StatCard";
import type { ServiceRequest, User } from "../../types";
import { apiFetch } from "../../api/client";

type RequestsResponse =
  | ServiceRequest[]
  | { results?: ServiceRequest[] };

export default function Dashboard({ user }: { user: User }) {
  const [items, setItems] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    apiFetch<RequestsResponse>("/workorders/requests/")
      .then((data) => {
        setItems(Array.isArray(data) ? data : data.results ?? []);
      })
      .catch(() => {
        setItems([]);
      });
  }, []);

  const active = items.filter((i) =>
    ["ASSIGNED", "ACCEPTED", "SCHEDULED", "IN_PROGRESS"].includes(i.status)
  ).length;

  const completed = items.filter((i) =>
    ["COMPLETED", "VERIFIED"].includes(i.status)
  ).length;

  return (
    <Layout user={user}>
      <div className="hero">
        <div>
          <span className="eyebrow">WORKER WORKSPACE</span>
          <h2>Own your jobs.</h2>
          <p>
            Accept work, update progress, and close the loop with clear proof.
          </p>
        </div>
      </div>

      <div className="stats">
        <StatCard
          label="Assigned"
          value={items.length}
          icon={<Briefcase size={20} />}
        />
        <StatCard
          label="Active"
          value={active}
          icon={<Clock3 size={20} />}
        />
        <StatCard
          label="Completed"
          value={completed}
          icon={<CheckCircle2 size={20} />}
        />
      </div>

      <div className="panel">
        <h3>Current assignments</h3>

        {items.map((item) => (
          <div className="list-row" key={item.id}>
            <div>
              <strong>
                #{item.id} · {item.service_name}
              </strong>
              <span>{item.address}</span>
            </div>

            <span className={`status ${item.status.toLowerCase()}`}>
              {item.status.replace("_", " ")}
            </span>
          </div>
        ))}

        {items.length === 0 && (
          <div className="empty">No assignments yet.</div>
        )}
      </div>
    </Layout>
  );
}
