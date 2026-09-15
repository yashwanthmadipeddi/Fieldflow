import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BriefcaseBusiness, Building2, Loader2, UserRound } from "lucide-react";
import { login } from "../../api/client";

type DemoRole = "CUSTOMER" | "OWNER" | "WORKER";

const demos: Record<DemoRole, { label: string; username: string; password: string; description: string }> = {
  CUSTOMER: {
    label: "Customer",
    username: "demo_customer",
    password: "DemoCustomer123!",
    description: "Create service requests and track jobs.",
  },
  OWNER: {
    label: "Business Owner",
    username: "demo_owner",
    password: "DemoOwner123!",
    description: "Manage services, requests, and workers.",
  },
  WORKER: {
    label: "Field Worker",
    username: "demo_worker_1",
    password: "DemoWorker123!",
    description: "View assignments and update job progress.",
  },
};

const roleIcon = (role: DemoRole) => {
  if (role === "OWNER") return <Building2 size={20} />;
  if (role === "WORKER") return <BriefcaseBusiness size={20} />;
  return <UserRound size={20} />;
};

export default function Login({ onLogin }: { onLogin: () => Promise<void> }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState<DemoRole | null>(null);

  const destination = (role: DemoRole) =>
    role === "OWNER" ? "/owner" : role === "WORKER" ? "/worker" : "/customer";

  const signIn = async (user: string, pass: string, role?: DemoRole) => {
    setError("");
    if (role) setDemoBusy(role);
    else setBusy(true);

    try {
      const loggedInUser = await login(user, pass);
      await onLogin();
      navigate(destination(loggedInUser.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setBusy(false);
      setDemoBusy(null);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await signIn(username, password);
  };

  return (
    <div className="auth-shell">
      <div className="auth-card auth-card-demo">
        <div className="brand brand-dark">
          <div className="brand-mark">F</div>
          <div>
            <strong>FieldFlow</strong>
            <span>Service Operations</span>
          </div>
        </div>

        <div className="auth-heading">
          <p className="eyebrow">ROLE-BASED FIELD SERVICE PLATFORM</p>
          <h1>Welcome to FieldFlow</h1>
          <p className="muted">Choose a demo workspace to explore the complete service workflow.</p>
        </div>

        <div className="demo-section">
          <div className="section-label">
            <span>Explore the demo</span>
            <small>No credentials to type</small>
          </div>

          <div className="demo-grid">
            {(Object.keys(demos) as DemoRole[]).map((role) => {
              const demo = demos[role];
              const loading = demoBusy === role;
              return (
                <button
                  key={role}
                  type="button"
                  className="demo-role-card"
                  onClick={() => signIn(demo.username, demo.password, role)}
                  disabled={busy || demoBusy !== null}
                >
                  <span className="demo-role-icon">{roleIcon(role)}</span>
                  <span className="demo-role-copy">
                    <strong>{demo.label}</strong>
                    <small>{demo.description}</small>
                  </span>
                  <span className="demo-arrow">{loading ? <Loader2 size={17} className="spin" /> : "â†’"}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="login-divider"><span>or sign in manually</span></div>

        <form onSubmit={submit} className="stack">
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
          </label>
          <label>
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" required />
          </label>
          {error && <div className="error-box">{error}</div>}
          <button className="primary" disabled={busy || demoBusy !== null}>
            {busy ? "Signing inâ€¦" : "Sign in"}
          </button>
        </form>

        <div className="workflow-note">
          <strong>Demo workflow</strong>
          <span>Customer request â†’ Owner assignment â†’ Worker completion</span>
        </div>

        <p className="auth-footer">New to FieldFlow? <Link to="/register">Create an account</Link></p>
      </div>
    </div>
  );
}

