import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Bell, Plus, Trash2, Pencil, Pill, CalendarClock, FlaskConical, Droplets, Footprints, Moon, FileText, Check } from "lucide-react";
import { toast } from "sonner";

function playTone(frequency, duration = 0.16, volume = 0.3) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
    oscillator.onended = () => context.close();
  } catch {
    // Fall back silently if audio is blocked.
  }
}

function playReminderSound() {
  playTone(520, 0.14, 0.28);
}

const REMINDER_TYPES = [
  { key: "medication", label: "Medication", icon: Pill, color: "bg-rose-100 text-rose-700" },
  { key: "appointment", label: "Appointment", icon: CalendarClock, color: "bg-sky-100 text-sky-700" },
  { key: "follow_up_test", label: "Follow-up Test", icon: FlaskConical, color: "bg-amber-100 text-amber-700" },
  { key: "hydration", label: "Hydration", icon: Droplets, color: "bg-blue-100 text-blue-700" },
  { key: "activity", label: "Activity", icon: Footprints, color: "bg-emerald-100 text-emerald-700" },
  { key: "sleep", label: "Sleep Routine", icon: Moon, color: "bg-indigo-100 text-indigo-700" },
  { key: "report_follow_up", label: "Report Follow-up", icon: FileText, color: "bg-violet-100 text-violet-700" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const EMPTY_FORM = {
  type: "medication",
  title: "",
  schedule_time: "09:00",
  days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  notes: "",
  enabled: true,
};

export default function Reminders() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const load = () => api.get("/reminders").then(r => setItems(r.data)).catch(() => toast.error("Could not load reminders"));
  useEffect(() => { load(); }, []);

  const playedOnce = useRef(new Set());

  const isReminderDue = (reminder, now) => {
    if (!reminder.enabled || !reminder.schedule_time || !reminder.days?.length) return false;
    const dayName = now.toLocaleDateString(undefined, { weekday: 'short' });
    if (!reminder.days.includes(dayName)) return false;
    const [hour, minute] = reminder.schedule_time.split(":").map(Number);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return false;
    return now.getHours() === hour && now.getMinutes() === minute;
  };

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      items.forEach((reminder) => {
        if (isReminderDue(reminder, now)) {
          const key = `${reminder.id}-${now.toISOString().slice(0, 16)}`;
          if (!playedOnce.current.has(key)) {
            playedOnce.current.add(key);
            playReminderSound();
            toast.success(`Reminder: ${reminder.title}`);
          }
        }
      });
    };
    const timer = setInterval(checkReminders, 20_000);
    checkReminders();
    return () => clearInterval(timer);
  }, [items]);

  const typeMeta = (key) => REMINDER_TYPES.find(t => t.key === key) || REMINDER_TYPES[0];

  const toggleDay = (d) => {
    setForm(f => ({
      ...f,
      days: f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Add a title");
    try {
      if (editingId) {
        await api.put(`/reminders/${editingId}`, form);
        toast.success("Reminder updated");
      } else {
        await api.post("/reminders", form);
        toast.success("Reminder created");
      }
      playReminderSound();
      setForm(EMPTY_FORM);
      setEditingId(null);
      load();
    } catch { toast.error("Something went wrong"); }
  };

  const toggleEnabled = async (r) => {
    await api.put(`/reminders/${r.id}`, { ...r, enabled: !r.enabled });
    playReminderSound();
    load();
  };

  const del = async (id) => { await api.delete(`/reminders/${id}`); load(); toast.success("Reminder deleted"); };

  const edit = (r) => {
    setEditingId(r.id);
    setForm({ type: r.type, title: r.title, schedule_time: r.schedule_time, days: r.days || [], notes: r.notes || "", enabled: r.enabled });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const enabledCount = items.filter(i => i.enabled).length;

  return (
    <div className="relative max-w-5xl mx-auto" data-testid="reminders-page">
      <span className="absolute -top-6 left-8 w-16 h-16 rounded-full bg-rose-200/70 doodle-dot"></span>
      <span className="absolute top-24 right-6 w-10 h-10 rounded-full bg-amber-200/80 doodle-ring"></span>
      <div className="glass-strong rounded-3xl p-6 flex items-center gap-3 relative overflow-hidden">
        <div className="absolute -right-8 top-10 w-16 h-16 rounded-full bg-blue-100/80 doodle-dot"></div>
        <div className="w-11 h-11 rounded-2xl bg-rose-100 grid place-items-center">
          <Bell className="w-5 h-5 text-rose-700" strokeWidth={2.5}/>
        </div>
        <div>
          <h1 className="font-display text-3xl">Smart Reminders</h1>
          <p className="text-sm text-slate-500">
            {items.length} reminder{items.length !== 1 ? "s" : ""} · {enabledCount} active
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 glass rounded-3xl p-6 grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Reminder type</label>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {REMINDER_TYPES.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                type="button"
                onClick={() => setForm(f => ({ ...f, type: key }))}
                className={"flex items-center gap-2 px-3 py-2 rounded-2xl border text-sm font-semibold transition " +
                  (form.type === key ? "ring-2 ring-rose-400 border-rose-300 bg-white" : "bg-white/70 border-white hover:bg-white")}
              >
                <span className={"w-7 h-7 rounded-xl grid place-items-center " + color}><Icon className="w-4 h-4"/></span>
                {label}
              </button>
            ))}
          </div>
        </div>

        <input
          placeholder="Reminder title (e.g. Take Vitamin D)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm md:col-span-2"
        />

        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Time
          <input type="time" value={form.schedule_time}
            onChange={(e) => setForm({ ...form, schedule_time: e.target.value })}
            className="px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm" />
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Notes (optional)
          <input placeholder="e.g. With breakfast"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm" />
        </label>

        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Repeat on</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {DAYS.map((d) => (
              <button key={d} type="button" onClick={() => toggleDay(d)}
                className={"px-3 py-1.5 rounded-full text-sm font-semibold border transition " +
                  (form.days.includes(d) ? "bg-rose-500 text-white border-rose-500" : "bg-white/70 text-slate-500 border-white hover:bg-white")}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <button type="submit"
          className="md:col-span-2 py-2.5 rounded-full bg-rose-400 text-white font-bold hover:scale-[1.01] transition inline-flex items-center justify-center gap-2">
          {editingId ? <><Check className="w-4 h-4"/> Update reminder</> : <><Plus className="w-4 h-4"/> Add reminder</>}
        </button>
      </form>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {items.length === 0 && (
          <div className="glass rounded-3xl p-6 text-slate-500 md:col-span-2 text-center py-12">
            No reminders yet. Create your first smart reminder above.
          </div>
        )}
        {items.map((r) => {
          const meta = typeMeta(r.type);
          const Icon = meta.icon;
          return (
            <div key={r.id} className={"glass rounded-3xl p-5 transition relative overflow-hidden " + (r.enabled ? "" : "opacity-60")}>
              <span className="absolute -top-3 left-3 w-10 h-10 rounded-full bg-rose-100/80 doodle-dot"></span>
              <span className="absolute -bottom-4 right-5 w-8 h-8 rounded-full bg-sky-100/80 doodle-ring"></span>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className={"w-10 h-10 rounded-2xl grid place-items-center shrink-0 " + meta.color}>
                    <Icon className="w-5 h-5"/>
                  </span>
                  <div className="min-w-0">
                    <div className="font-display text-lg truncate">{r.title}</div>
                    <div className="text-xs text-slate-500">{meta.label} · {r.schedule_time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => edit(r)} className="p-2 rounded-xl bg-white/80 text-slate-600 hover:bg-white" aria-label="Edit">
                    <Pencil className="w-4 h-4"/>
                  </button>
                  <button onClick={() => del(r.id)} className="p-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200" aria-label="Delete">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              </div>

              {r.days && r.days.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.days.map((d) => (
                    <span key={d} className="px-2 py-0.5 rounded-full bg-white/80 text-xs text-slate-600">{d}</span>
                  ))}
                </div>
              )}
              {r.notes && <div className="mt-2 text-sm text-slate-600">{r.notes}</div>}

              <button
                onClick={() => toggleEnabled(r)}
                className={"mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition " +
                  (r.enabled ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-slate-200 text-slate-600 hover:bg-slate-300")}>
                <Bell className="w-4 h-4"/>
                {r.enabled ? "Reminder ON" : "Reminder OFF"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
