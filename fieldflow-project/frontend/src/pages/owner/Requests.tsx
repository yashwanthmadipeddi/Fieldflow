import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import type { ServiceRequest, User } from "../../types";
import { apiFetch } from "../../api/client";

type Worker = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
};

type ListResponse<T> = T[] | { results?: T[] };

export default function Requests({ user }: { user: User }) {
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");

    try {
      const [requestsData, workersData] = await Promise.all([
        apiFetch<ListResponse<ServiceRequest>>("/workorders/requests/"),
        apiFetch<ListResponse<Worker>>("/auth/workers/"),
      ]);

      setItems(
        Array.isArray(requestsData)
          ? requestsData
          : requestsData.results ?? []
      );

      setWorkers(
        Array.isArray(workersData)
          ? workersData
          : workersData.results ?? []
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to load requests"
      );
      setItems([]);
      setWorkers([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const assign = async (id: number, worker: string) => {
    if (!worker) return;

    try {
      setError("");

      await apiFetch("/workorders/assignments/assign/", {
        method: "POST",
        body: JSON.stringify({
          request: id,
          worker: Number(worker),
        }),
      });

      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to assign worker"
      );
    }
  };

  return (
    <Layout user={user}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">OPERATIONS QUEUE</span>
          <h2>Service requests</h2>
          <p>
            Review demand, assign the right worker, and control workflow state.
          </p>
        </div>
      </div>

      <div className="stack">
        {error && <div className="error-box">{error}</div>}

        {items.map((item) => {
          const history = Array.isArray(item.status_history)
            ? item.status_history
            : [];

          return (
            <div className="panel" key={item.id}>
              <div className="list-row">
                <div>
                  <strong>
                    #{item.id} · {item.service_name}
                  </strong>
                  <span>
                    {item.customer_name} · {item.address}
                  </span>
                </div>

                <span className={`status ${item.status.toLowerCase()}`}>
                  {item.status.replace("_", " ")}
                </span>
              </div>

              <div className="form-grid">
                <label>
                  Assign worker
                  <select
                    defaultValue={item.assignment?.worker ?? ""}
                    onChange={(e) => assign(item.id, e.target.value)}
                  >
                    <option value="">Select worker</option>

                    {workers.map((worker) => (
                      <option key={worker.id} value={worker.id}>
                        {worker.first_name || worker.username}{" "}
                        {worker.last_name}
                      </option>
                    ))}
                  </select>
                </label>

                <div>
                  <span className="eyebrow">Priority</span>
                  <p>
                    {item.priority === 1
                      ? "Urgent"
                      : item.priority === 2
                        ? "Normal"
                        : "Flexible"}
                  </p>
                </div>
              </div>

              <div className="timeline">
                {history.slice(-3).map((historyItem) => (
                  <div key={historyItem.id}>
                    <b>{historyItem.to_status.replace("_", " ")}</b>
                    <span>
                      {new Date(historyItem.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {items.length === 0 && !error && (
          <div className="panel empty">
            No service requests are waiting.
          </div>
        )}
      </div>
    </Layout>
  );
}
