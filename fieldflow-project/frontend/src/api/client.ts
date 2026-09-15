import type { User } from "../types";

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "/api/v1";

const ACCESS_KEY = "fieldflow_access";
const REFRESH_KEY = "fieldflow_refresh";

let refreshPromise: Promise<string> | null = null;

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function refreshAccessToken(): Promise<string> {
  const refresh = localStorage.getItem(REFRESH_KEY);

  if (!refresh) {
    throw new Error("No refresh token available");
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
    })
      .then(async (response) => {
        const data = await parseResponse(response);

        if (
          !response.ok ||
          !data ||
          typeof data !== "object" ||
          !("access" in data)
        ) {
          throw new Error("Session expired");
        }

        const access = String((data as { access: unknown }).access);
        localStorage.setItem(ACCESS_KEY, access);

        if ("refresh" in data && (data as { refresh?: unknown }).refresh) {
          localStorage.setItem(
            REFRESH_KEY,
            String((data as { refresh: unknown }).refresh)
          );
        }

        return access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const isLoginOrRegister =
    path === "/auth/login/" || path === "/auth/register/";

  const token = isLoginOrRegister
    ? null
    : localStorage.getItem(ACCESS_KEY);

  const headers = new Headers(options.headers);

  if (
    !headers.has("Content-Type") &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    headers.delete("Authorization");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && path === "/auth/me/") {
    clearTokens();
    throw new Error("Session expired. Please sign in again.");
  }

  if (response.status === 401 && retry && !path.includes("/auth/")) {
    try {
      const newAccess = await refreshAccessToken();

      const retryHeaders = new Headers(options.headers);

      if (
        !retryHeaders.has("Content-Type") &&
        !(options.body instanceof FormData)
      ) {
        retryHeaders.set("Content-Type", "application/json");
      }

      retryHeaders.set("Authorization", `Bearer ${newAccess}`);

      const retryResponse = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: retryHeaders,
      });

      const retryData = await parseResponse(retryResponse);

      if (!retryResponse.ok) {
        const message =
          typeof retryData === "object" &&
          retryData &&
          "detail" in retryData
            ? String((retryData as { detail: unknown }).detail)
            : "Request failed";

        throw new Error(message);
      }

      return retryData as T;
    } catch {
      clearTokens();

      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href = "/login";
      }

      throw new Error("Session expired. Please sign in again.");
    }
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data &&
      "detail" in data
        ? String((data as { detail: unknown }).detail)
        : "Request failed";

    throw new Error(message);
  }

  return data as T;
}

export async function login(username: string, password: string) {
  clearTokens();

  const result = await apiFetch<{
    access: string;
    refresh: string;
    user: User;
  }>("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  localStorage.setItem(ACCESS_KEY, result.access);
  localStorage.setItem(REFRESH_KEY, result.refresh);

  return result.user;
}

export async function register(payload: Record<string, unknown>) {
  clearTokens();

  return apiFetch<User>("/auth/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function me() {
  return apiFetch<User>("/auth/me/");
}

export function logout() {
  clearTokens();
}
