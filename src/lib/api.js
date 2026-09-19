import axios from "axios";

// Use the deployed backend URL when provided.
// Otherwise, use the local FastAPI backend during development.
function resolveBase() {
  const envBase = process.env.REACT_APP_BACKEND_URL;

  if (envBase && envBase.startsWith("http")) {
    return envBase.replace(/\/$/, "");
  }

  return "http://localhost:8000";
}

const BASE = resolveBase();

export const API_BASE = `${BASE}/api`;

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("careai_token");

  if (t) {
    cfg.headers.Authorization = `Bearer ${t}`;
  }

  return cfg;
});

export function setToken(t) {
  if (t) {
    localStorage.setItem("careai_token", t);
  } else {
    localStorage.removeItem("careai_token");
  }
}

export function getToken() {
  return localStorage.getItem("careai_token");
}