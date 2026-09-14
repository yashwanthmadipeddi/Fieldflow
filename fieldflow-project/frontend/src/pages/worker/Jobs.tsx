import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import type { ServiceRequest, User } from "../../types";
import { apiFetch } from "../../api/client";

type RequestsResponse =
  | ServiceRequest[]
  | { results?: ServiceRequest[] };

const nextByStatus: Record<string, string> = {
  ASSIGNED: "ACCEPTED",
  ACCEPTED: "SCHEDULED",
  SCHEDULED: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
};

export default function Jobs({ user }: { user: User }) {
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [error, setError] = useState("");

  const load = async () => {
    const data = await apiFetch<RequestsResponse>("/workorders/requests/");
    setItems(Array.isArray(data) ? data : data.results ?? []);
  };

  useEffect(() => {
    load().catch((e) => {
      setError(e instanceof Error ? e.message : "Unable to load jobs");
      setItems([]);
    });
  }, []);

  const advance = async (item: ServiceRequest) => {
    const next = nextByStatus[item.status];

    if (!next) return;

    try {
      setError("");

      await apiFetch(
        `/workorders/requests/${item.id}/status/`,
        {
          method: "POST",
          body: JSON.stringify({ status: next }),
        }
      );

      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to update job"
      );
    }
  };

  return (
    <Layout user={user}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MY WORK</span>
          <h2>Assigned jobs</h2>
          <p>
            Keep every status transition intentional and traceable.
          </p>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="stack">
        {items.map((item) => (
          <div className="panel" key={item.id}>
            <div className="list-row">
              <div>
                <strong>
                  #{item.id} · {item.service_name}
                </strong>
                <span>
                  {item.address} · {item.customer_name}
                </span>
              </div>

              <span className={`status ${item.status.toLowerCase()}`}>
                {item.status.replace("_", " ")}
              </span>
            </div>

            <div className="action-row">
              <span className="muted">
                Priority {item.priority}
              </span>

              {nextByStatus[item.status] && (
                <button
                  className="primary small"
                  onClick={() => advance(item)}
                >
                  Mark{" "}
                  {nextByStatus[item.status]
                    .replace("_", " ")
                    .toLowerCase()}
                </button>
              )}
            </div>
          </div>
        ))}

        {items.length === 0 && !error && (
          <div className="panel empty">
            No jobs assigned.
          </div>
        )}
      </div>
    </Layout>
  );
}
