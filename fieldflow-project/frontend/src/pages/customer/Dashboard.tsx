import { ClipboardList, Plus, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import StatCard from "../../components/StatCard";
import type { ServiceRequest, User } from "../../types";
import { apiFetch } from "../../api/client";

type RequestsResponse =
  | ServiceRequest[]
  | {
      results?: ServiceRequest[];
    };

export default function Dashboard({ user }: { user: User }) {
  const [items, setItems] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    apiFetch<RequestsResponse>("/workorders/requests/")
      .then((data) => {
        setItems(
          Array.isArray(data)
            ? data
            : Array.isArray(data.results)
              ? data.results
              : []
        );
      })
      .catch(() => {
        setItems([]);
      });
  }, []);

  const active = items.filter(
    (item) => !["VERIFIED", "CANCELLED"].includes(item.status)
  ).length;

  const done = items.filter(
    (item) => item.status === "VERIFIED"
  ).length;

  return (
    <Layout user={user}>
      <div className="hero">
        <div>
          <span className="eyebrow">CUSTOMER WORKSPACE</span>
          <h2>Good day, {user.first_name || user.username}.</h2>
          <p>
            Request help, track active jobs, and keep a clean service history.
          </p>
        </div>

        <Link className="primary small" to="/customer/request">
          <Plus size={16} />
          New request
        </Link>
      </div>

      <div className="stats">
        <StatCard
          label="My requests"
          value={items.length}
          icon={<ClipboardList size={20} />}
        />

        <StatCard
          label="Active"
          value={active}
          icon={<ClipboardList size={20} />}
        />

        <StatCard
          label="Verified"
          value={done}
          icon={<ShieldCheck size={20} />}
        />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Recent requests</h3>
            <p>
              Track the latest work submitted to your service providers.
            </p>
          </div>
        </div>

        {items.slice(0, 6).map((item) => (
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
          <div className="empty">
            No service requests yet.
          </div>
        )}
      </div>
    </Layout>
  );
}
