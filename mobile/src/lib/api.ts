import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "./constants";
import { getAuthToken } from "./storage";

// Single axios instance for the app. Bearer token is attached automatically
// from secure-store on every request. The web backend's lib/session.ts
// requireUserId() accepts Authorization: Bearer (added in Phase 5a) — so all
// existing /api/* routes work for mobile transparently.

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type ApiError = {
  status: number;
  reason: string;
  raw?: unknown;
};

// All Presenz API routes return { ok: boolean, reason?: string, ... }. This
// helper unwraps the envelope so call sites can do `const r = await call();
// if (!r.ok) ...` consistently.
export async function apiCall<T = Record<string, unknown>>(
  method: "GET" | "POST",
  path: string,
  body?: unknown,
): Promise<({ ok: true } & T) | { ok: false; reason: string; status: number }> {
  try {
    const res = await api.request({ method, url: path, data: body });
    return res.data;
  } catch (err) {
    const e = err as AxiosError<{ ok: false; reason?: string }>;
    const status = e.response?.status ?? 0;
    const reason = e.response?.data?.reason ?? (e.code === "ECONNABORTED" ? "timeout" : "network");
    return { ok: false, reason, status };
  }
}
