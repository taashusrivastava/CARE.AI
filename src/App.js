import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AppShell from "@/components/AppShell";
import Dashboard from "@/pages/Dashboard";
import Chat from "@/pages/Chat";
import Symptoms from "@/pages/Symptoms";
import Risk from "@/pages/Risk";
import Profile from "@/pages/Profile";
import Contacts from "@/pages/Contacts";
import Nearby from "@/pages/Nearby";
import Medicines from "@/pages/Medicines";
import Appointments from "@/pages/Appointments";

function Protected({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="p-10 text-slate-500">Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return children;
}

export default function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<Protected><AppShell /></Protected>}>
              <Route path="/app" element={<Dashboard />} />
              <Route path="/app/chat" element={<Chat />} />
              <Route path="/app/symptoms" element={<Symptoms />} />
              <Route path="/app/risk" element={<Risk />} />
              <Route path="/app/profile" element={<Profile />} />
              <Route path="/app/contacts" element={<Contacts />} />
              <Route path="/app/nearby" element={<Nearby />} />
              <Route path="/app/medicines" element={<Medicines />} />
              <Route path="/app/appointments" element={<Appointments />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </div>
  );
}

