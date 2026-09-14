import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { User } from "../types";

export default function ProtectedRoute({ user, children, role }: { user: User | null; children: ReactNode; role?: User["role"] }) {
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === "OWNER" ? "/owner" : user.role === "WORKER" ? "/worker" : "/customer"} replace />;
  return <>{children}</>;
}
