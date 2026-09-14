import { useEffect, useState, type FormEvent } from "react";
import Layout from "../../components/Layout";
import type { Service, User } from "../../types";
import { apiFetch } from "../../api/client";

type ListResponse<T> = T[] | { results?: T[] };

export default function Services({ user }: { user: User }) {
  const [items, setItems] = useState<Service[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    base_price: "",
    estimated_minutes: "60",
  });
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const data = await apiFetch<ListResponse<Service>>("/services/catalog/");

      setItems(
        Array.isArray(data) ? data : data.results ?? []
      );
    } catch (err) {
      setItems([]);
      setMsg(
        err instanceof Error
          ? err.message
          : "Unable to load services."
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg("");

    try {
      await apiFetch("/services/catalog/", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          estimated_minutes: Number(form.estimated_minutes),
          base_price: form.base_price,
        }),
      });

      setForm({
        name: "",
        description: "",
        base_price: "",
        estimated_minutes: "60",
      });

      setMsg("Service added.");
      await load();
    } catch (err) {
      setMsg(
        err instanceof Error
          ? err.message
          : "Unable to add service."
      );
    }
  };

  return (
    <Layout user={user}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">SERVICE CATALOG</span>
          <h2>Offerings</h2>
          <p>
            Define what your business delivers and how long it typically takes.
          </p>
        </div>
      </div>

      <div className="two-col">
        <form className="panel stack" onSubmit={submit}>
          <h3>Add a service</h3>

          <label>
            Name
            <input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />
          </label>

          <div className="form-grid">
            <label>
              Base price
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.base_price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    base_price: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Est. minutes
              <input
                type="number"
                min="15"
                value={form.estimated_minutes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    estimated_minutes: e.target.value,
                  })
                }
                required
              />
            </label>
          </div>

          {msg && (
            <div
              className={
                msg === "Service added."
                  ? "success-box"
                  : "error-box"
              }
            >
              {msg}
            </div>
          )}

          <button className="primary" type="submit">
            Add service
          </button>
        </form>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Current services</h3>
              <p>{items.length} active records</p>
            </div>
          </div>

          {items.map((service) => (
            <div className="list-row" key={service.id}>
              <div>
                <strong>{service.name}</strong>
                <span>
                  {service.description || "No description"}
                </span>
              </div>

              <span className="price">
                ₹{Number(service.base_price).toLocaleString("en-IN")}
              </span>
            </div>
          ))}

          {items.length === 0 && (
            <div className="empty">
              Create your first service.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
