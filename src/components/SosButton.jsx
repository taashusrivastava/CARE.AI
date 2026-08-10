import React, { useEffect, useState } from "react";
import { Siren, Phone, MessageSquare, X } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

function playTone(frequency, duration = 0.18, volume = 0.35) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
    oscillator.onended = () => context.close();
  } catch {
    // Ignore audio failures on unsupported browsers.
  }
}

function playSosSound() {
  playTone(740, 0.16, 0.5);
}

export default function SosButton() {
  const [open, setOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [settingFor, setSettingFor] = useState(null);
  const [reminderTime, setReminderTime] = useState("");
  const [reminderRepeat, setReminderRepeat] = useState("once");

  useEffect(() => {
    if (open) {
      playSosSound();
      api.get("/contacts").then(r => setContacts(r.data)).catch(() => setContacts([]));
    }
  }, [open]);

  return (
    <>
      <button
        data-testid="sos-button"
        onClick={() => setOpen(!open)}
        className="relative fixed bottom-6 right-6 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)] flex items-center justify-center z-50 text-white font-black text-xl border-4 border-white/50 hover:scale-105 active:scale-95 transition-transform sos-pulse"
      >
        <span className="absolute -left-2 top-3 w-4 h-4 rounded-full bg-white/80 doodle-ring"></span>
        <span className="absolute right-2 -top-1 w-3 h-3 rounded-full bg-white/90 doodle-dot"></span>
        {open ? <X className="w-8 h-8" /> : <Siren className="w-8 h-8" />}
      </button>

      {open && (
        <div className="fixed bottom-28 right-6 z-50 glass-strong rounded-3xl p-4 w-72 shadow-2xl border border-red-200 relative overflow-hidden">
          <span className="absolute -top-4 left-6 w-10 h-10 rounded-full bg-rose-200/80 doodle-dot"></span>
          <span className="absolute -right-4 top-12 w-6 h-6 rounded-full bg-white/80 doodle-ring"></span>
          <div className="flex items-center gap-2 mb-3">
            <Siren className="w-5 h-5 text-red-600" />
            <span className="font-display text-lg text-red-700">Emergency</span>
          </div>
          {contacts.length === 0 ? (
            <div className="text-sm text-slate-600 text-center py-4">
              No emergency contacts saved.<br />
              <span className="text-xs text-slate-500">Add contacts in the Contacts page.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-2 rounded-2xl bg-white/80">
                  <div>
                    <div className="text-sm font-semibold truncate">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.relationship || ""}</div>
                  </div>
                  <div className="flex gap-1 shrink-0 items-center">
                    <a href={`tel:${c.phone}`} className="p-2 rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                      <Phone className="w-4 h-4" />
                    </a>
                    <a href={`sms:${c.phone}`} className="p-2 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200">
                      <MessageSquare className="w-4 h-4" />
                    </a>
                    <button onClick={() => setSettingFor(c)} className="p-2 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200">
                      Set reminder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {settingFor && (
            <div className="mt-3 bg-white/90 p-3 rounded-2xl border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Set reminder to call {settingFor.name}</div>
                  <div className="text-xs text-slate-500">Phone: {settingFor.phone}</div>
                </div>
                <button onClick={() => setSettingFor(null)} className="text-xs text-slate-500">Cancel</button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="text-xs text-slate-600">Time</label>
                <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="px-2 py-1 rounded bg-white border" />
                <label className="text-xs text-slate-600">Repeat</label>
                <select value={reminderRepeat} onChange={(e) => setReminderRepeat(e.target.value)} className="px-2 py-1 rounded bg-white border">
                  <option value="once">Once</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button onClick={async () => {
                  try {
                    const days = reminderRepeat === 'daily' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] : [];
                    const body = { title: `Call ${settingFor.name}`, schedule_time: reminderTime || '09:00', days, notes: `Call ${settingFor.name} at ${settingFor.phone}`, contact_phone: settingFor.phone };
                    await api.post('/reminders', body);
                    toast.success('Reminder created');
                    setSettingFor(null);
                  } catch (e) {
                    toast.error('Failed to create reminder');
                  }
                }} className="px-3 py-2 rounded bg-rose-500 text-white">Create reminder</button>
              </div>
            </div>
          )}
          <div className="mt-3 text-[10px] text-slate-500 text-center">
            For immediate emergencies, call local emergency services.
          </div>
        </div>
      )}
    </>
  );
}
