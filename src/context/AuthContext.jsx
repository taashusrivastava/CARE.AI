import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setToken, getToken } from "@/lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = getToken();
    if (!t) { setLoading(false); return; }
    api.get("/auth/me").then((r) => setUser(r.data)).catch(() => setToken(null)).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.token);
    const me = await api.get("/auth/me");
    setUser(me.data);
    return me.data;
  };

  const register = async (full_name, email, password) => {
    const { data } = await api.post("/auth/register", { full_name, email, password });
    setToken(data.token);
    const me = await api.get("/auth/me");
    setUser(me.data);
    return me.data;
  };

  const logout = () => { setToken(null); setUser(null); };

  return <AuthCtx.Provider value={{ user, setUser, login, register, logout, loading }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

