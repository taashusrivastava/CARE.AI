import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Heart, MessageCircle, Stethoscope, Activity, User, Users, MapPin, Pill, CalendarClock, LogOut, Menu, X } from "lucide-react";
import SosButton from "@/components/SosButton";

const links = [
  { to: "/app", label: "Dashboard", icon: Heart, exact: true },
  { to: "/app/chat", label: "AI Assistant", icon: MessageCircle },
  { to: "/app/symptoms", label: "Symptom Checker", icon: Stethoscope },
  { to: "/app/risk", label: "Risk Predictors", icon: Activity },
  { to: "/app/nearby", label: "Nearby Hospitals", icon: MapPin },
  { to: "/app/medicines", label: "Medicines", icon: Pill },
  { to: "/app/appointments", label: "Appointments", icon: CalendarClock },
  { to: "/app/contacts", label: "Emergency Contacts", icon: Users },
  { to: "/app/profile", label: "Profile", icon: User },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const doLogout = () => { logout(); nav("/"); };

  return (
    <div className="pastel-bg">
      <div className="lg:hidden sticky top-0 z-40 glass-strong px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-rose-200 grid place-items-center">
            <Heart className="w-5 h-5 text-rose-700" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl">CareAI</span>
        </div>
        <button data-testid="mobile-menu-toggle" onClick={() => setOpen(!open)} className="p-2 rounded-xl bg-white/70">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex">
        <aside data-testid="sidebar" className={(open ? "block" : "hidden") + " lg:block fixed lg:sticky top-0 lg:top-0 h-screen w-72 z-30 p-4"}>
          <div className="glass-strong rounded-3xl p-5 h-full flex flex-col">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-11 h-11 rounded-2xl bg-rose-200 grid place-items-center shadow-lg shadow-rose-200/50">
                <Heart className="w-6 h-6 text-rose-700" strokeWidth={2.5} />
              </div>
              <div>
                <div className="font-display text-2xl leading-none">CareAI</div>
                <div className="text-xs text-slate-500 mt-1">Health, gently.</div>
            </div>

            <nav className="mt-6 flex-1 space-y-1">
              {links.map(({ to, label, icon: Icon, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  data-testid={"nav-" + label.toLowerCase().replace(/\s+/g, "-")}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 " +
                    (isActive
                      ? "bg-rose-100 text-rose-900 shadow-sm"
                      : "text-slate-600 hover:bg-white/70 hover:text-slate-900")
                  }
                >
                  <Icon className="w-5 h-5" strokeWidth={2.4} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-4 p-3 rounded-2xl bg-white/70 border border-white">
              <div className="text-xs text-slate-500">Signed in as</div>
              <div className="font-semibold text-slate-800 truncate">{user?.full_name}</div>
              <div className="text-xs text-slate-500 truncate">{user?.email}</div>
              <button data-testid="logout-btn" onClick={doLogout}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
        </aside>

        <main className="flex-1 min-w-0 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      <SosButton />
    </div>
  );
}
