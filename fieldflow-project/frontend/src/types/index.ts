export type Role = "OWNER" | "WORKER" | "CUSTOMER";

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  phone: string;
  business_name: string;
}

export interface Service {
  id: number;
  owner: number;
  owner_name: string;
  name: string;
  description: string;
  base_price: string;
  estimated_minutes: number;
  active: boolean;
}

export interface Assignment {
  id: number;
  request: number;
  worker: number;
  worker_name: string;
  assigned_by: number;
  assigned_by_name: string;
  assigned_at: string;
  accepted_at: string | null;
  scheduled_start: string | null;
}

export interface StatusHistory {
  id: number;
  from_status: string;
  to_status: string;
  changed_by: number;
  changed_by_name: string;
  note: string;
  created_at: string;
}

export interface ServiceRequest {
  id: number;
  customer: number;
  customer_name: string;
  service: number;
  service_name: string;
  description: string;
  address: string;
  preferred_start: string | null;
  priority: number;
  status: string;
  assignment?: Assignment;
  status_history: StatusHistory[];
  invoice_total: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkerRecommendation {
  worker: number;
  name: string;
  score: number;
  skill_matches: number;
  active_jobs: number;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
