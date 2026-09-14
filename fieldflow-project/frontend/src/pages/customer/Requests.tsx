import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import type { ServiceRequest, User } from "../../types";
import { apiFetch } from "../../api/client";

type RequestsResponse =
  | ServiceRequest[]
  | {
      results?: ServiceRequest[];
    };

export default function Requests({ user }: { user: User }) {
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [error, setError] = useState("");

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
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load requests."
        );
        setItems([]);
      });
  }, []);

  return (
    <Layout user={user}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">SERVICE HISTORY</span>
          <h2>My requests</h2>
          <p>Track every service request you have submitted.</p>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="stack">
        {items.map((item) => (
          <div className="panel" key={item.id}>
            <div className="list-row">
              <div>
                <strong>
                  #{item.id} · {item.service_name || "Service"}
                </strong>

                <span>
                  {item.address || "No address provided"}
                </span>
              </div>

              <span
                className={`status ${
                  item.status
                    ? item.status.toLowerCase()
                    : "pending"
                }`}
              >
                {(item.status || "PENDING").replace("_", " ")}
              </span>
            </div>

            <div className="muted">
              {item.description || "No additional description."}
            </div>
          </div>
        ))}

        {items.length === 0 && !error && (
          <div className="panel empty">
            No service requests yet.
          </div>
        )}
      </div>
    </Layout>
  );
}
