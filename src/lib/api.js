import axios from "axios";

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

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("careai_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function setToken(token) {
  if (token) {
    localStorage.setItem("careai_token", token);
  } else {
    localStorage.removeItem("careai_token");
  }
}

export function getToken() {
  return localStorage.getItem("careai_token");
}