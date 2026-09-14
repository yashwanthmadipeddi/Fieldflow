import { LogOut, Menu, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "../types";
import { logout } from "../api/client";

interface Props { user: User; children: ReactNode; }

export default function Layout({ user, children }: Props) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const links = user.role === "OWNER"
    ? [["Dashboard", "/owner"], ["Services", "/owner/services"], ["Requests", "/owner/requests"]]
    : user.role === "WORKER"
    ? [["Dashboard", "/worker"], ["My Jobs", "/worker/jobs"], ["Skills", "/worker/skills"]]
    : [["Dashboard", "/customer"], ["New Request", "/customer/request"], ["My Requests", "/customer/requests"]];

  const handleLogout = () => { logout(); navigate("/login"); };
  return (
    <div className="app-shell">
      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="brand"><div className="brand-mark">F</div><div><strong>FieldFlow</strong><span>Service Operations</span></div></div>
        <nav>{links.map(([label, to]) => <Link key={to} to={to} onClick={() => setOpen(false)}>{label}</Link>)}</nav>
        <div className="sidebar-footer"><div className="user-chip"><span className="avatar">{(user.first_name || user.username).slice(0,1).toUpperCase()}</span><div><strong>{user.first_name || user.username}</strong><small>{user.role}</small></div></div><button className="icon-button" onClick={handleLogout} aria-label="Log out"><LogOut size={18}/></button></div>
      </aside>
      <main className="main-content">
        <header className="topbar"><button className="mobile-menu icon-button" onClick={() => setOpen(v => !v)}>{open ? <X/> : <Menu/>}</button><div className="topbar-copy"><span className="eyebrow">{user.role} WORKSPACE</span><h1>Operate with clarity.</h1></div><div className="topbar-user">{user.business_name || "FieldFlow"}</div></header>
        <section className="content">{children}</section>
      </main>
    </div>
  );
}
