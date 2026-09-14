import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import type { Service, User } from "../../types";
import { apiFetch } from "../../api/client";

type ServicesResponse =
  | Service[]
  | {
      results?: Service[];
    };

export default function Request({ user }: { user: User }) {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({
    service: "",
    description: "",
    address: "",
    preferred_start: "",
    priority: "2",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    apiFetch<ServicesResponse>("/services/catalog/")
      .then((data) => {
        if (!mounted) return;

        if (Array.isArray(data)) {
          setServices(data);
        } else {
          setServices(Array.isArray(data.results) ? data.results : []);
        }
      })
      .catch((err) => {
        if (!mounted) return;

        setServices([]);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load services."
        );
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.service) {
      setError("Please select a service.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await apiFetch("/workorders/requests/", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          service: Number(form.service),
          priority: Number(form.priority),
          preferred_start: form.preferred_start
            ? new Date(form.preferred_start).toISOString()
            : null,
        }),
      });

      navigate("/customer/requests");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout user={user}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">NEW SERVICE REQUEST</span>
          <h2>Tell us what you need.</h2>
          <p>
            Give the team enough detail to assign the right worker quickly.
          </p>
        </div>
      </div>

      <form className="panel form-grid" onSubmit={submit}>
        <label>
          Service
          <select
            value={form.service}
            onChange={(e) =>
              setForm({ ...form, service: e.target.value })
            }
            required
            disabled={loading || submitting}
          >
            <option value="">
              {loading ? "Loading services..." : "Select a service"}
            </option>

            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} · ?
                {Number(service.base_price).toLocaleString("en-IN")}
              </option>
            ))}
          </select>
        </label>

        <label>
          Priority
          <select
            value={form.priority}
            onChange={(e) =>
              setForm({ ...form, priority: e.target.value })
            }
            disabled={submitting}
          >
            <option value="1">Urgent</option>
            <option value="2">Normal</option>
            <option value="3">Flexible</option>
          </select>
        </label>

        <label className="full">
          Address
          <textarea
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
            required
            disabled={submitting}
          />
        </label>

        <label className="full">
          Describe the issue
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            minLength={10}
            required
            disabled={submitting}
          />
        </label>

        <label>
          Preferred start
          <input
            type="datetime-local"
            value={form.preferred_start}
            onChange={(e) =>
              setForm({
                ...form,
                preferred_start: e.target.value,
              })
            }
            disabled={submitting}
          />
        </label>

        {error && (
          <div className="error-box full">
            {error}
          </div>
        )}

        {!loading && services.length === 0 && !error && (
          <div className="error-box full">
            No active services are currently available.
          </div>
        )}

        <div className="full action-row">
          <button
            className="primary"
            type="submit"
            disabled={loading || submitting || services.length === 0}
          >
            {submitting ? "Submitting..." : "Submit request"}
          </button>
        </div>
      </form>
    </Layout>
  );
}
