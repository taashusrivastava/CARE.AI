import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL || "";
export const API_BASE = BASE ? `${BASE}/api` : "/api";

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

