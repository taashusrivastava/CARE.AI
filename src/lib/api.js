import axios from "axios";

// Resolve the backend URL at runtime with a safe development fallback.
// CRA bakes process.env.REACT_APP_BACKEND_URL at build time, so if it is
// missing or points to a deployment that no longer exists, we fall back to
// the local backend to avoid "AxiosError: Network Error".
function resolveBase() {
  const envBase = process.env.REACT_APP_BACKEND_URL;
  if (envBase && envBase.startsWith("http")) return envBase;
  // Default to the local FastAPI backend during development.
  return "http://localhost:8000";
}

const BASE = resolveBase();
export const API_BASE = `${BASE}/api`;

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("careai_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export function setToken(t) {
  if (t) localStorage.setItem("careai_token", t);
  else localStorage.removeItem("careai_token");
}

export function getToken() {
  return localStorage.getItem("careai_token");
}

