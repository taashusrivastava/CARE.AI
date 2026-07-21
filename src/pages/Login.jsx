import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Heart, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      nav("/app");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="pastel-bg grid place-items-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-2xl bg-rose-200 grid place-items-center">
            <Heart className="w-5 h-5 text-rose-700" strokeWidth={2.6}/>
          </div>
          <span className="font-display text-2xl">CareAI</span>
        </Link>
        <div className="glass-strong rounded-3xl p-8">
          <h1 className="font-display text-3xl">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to continue your care journey.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
              <div className="mt-1 flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/80 border border-white focus-within:ring-4 focus-within:ring-rose-200">
                <Mail className="w-4 h-4 text-slate-400"/>
                <input data-testid="login-email" required type="email" value={email} onChange={(e)=>setEmail(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm" placeholder="you@example.com"/>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
              <div className="mt-1 flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/80 border border-white focus-within:ring-4 focus-within:ring-rose-200">
                <Lock className="w-4 h-4 text-slate-400"/>
                <input data-testid="login-password" required type="password" value={password} onChange={(e)=>setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm" placeholder="••••••••"/>
              </div>
            </div>
            <button data-testid="login-submit" disabled={busy} type="submit"
              className="w-full py-3 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition disabled:opacity-60">
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <div className="text-sm text-slate-600 mt-6 text-center">
            New here? <Link to="/register" className="font-bold text-rose-600" data-testid="link-register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

