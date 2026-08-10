import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { CalendarClock, Plus, Trash2, Pencil, CheckCircle, Info } from "lucide-react";
import { toast } from "sonner";

const PREP_EMPTY = {
  main_concern: "",
  symptoms: "",
  started_when: "",
  better_worse: "",
  questions: "",
  relevant_records: "",
  recent_measurements: "",
};

export default function Appointments() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ doctor: "", hospital: "", date: "", time: "", reason: "" });
  const [prepForm, setPrepForm] = useState(PREP_EMPTY);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [prepSummary, setPrepSummary] = useState(null);

  const load = () => api.get("/appointments").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.doctor || !form.date || !form.time) return toast.error("Doctor, date & time required");
    await api.post("/appointments", form);
    setForm({ doctor: "", hospital: "", date: "", time: "", reason: "" });
    load();
    toast.success("Appointment saved");
  };

  const del = async (id) => { await api.delete(`/appointments/${id}`); load(); };

  const prepare = (appointment) => {
    setActiveAppointment(appointment);
    setPrepSummary(null);
    setPrepForm(PREP_EMPTY);
  };

  const createSummary = () => {
    if (!prepForm.main_concern || !prepForm.symptoms) return toast.error("Enter the main concern and symptoms first.");
    const symptomsList = prepForm.symptoms.split(",").map((item) => item.trim()).filter(Boolean);
    const questionsList = prepForm.questions.split("\n").map((item) => item.trim()).filter(Boolean);
    const summary = {
      main_concern: prepForm.main_concern,
      timeline: `Started: ${prepForm.started_when || "Not specified"}.`,
      better_worse: prepForm.better_worse || "Not specified.",
      questions: questionsList,
      relevant_records: prepForm.relevant_records || "None noted.",
      recent_measurements: prepForm.recent_measurements || "No recent measurements provided.",
      appointment: activeAppointment,
      symptoms: symptomsList,
    };
    setPrepSummary(summary);
  };

  const submitPreparation = async () => {
    if (!activeAppointment) return;
    try {
      await api.post(`/appointments/${activeAppointment.id}/preparation`, {
        main_concern: prepForm.main_concern,
        symptoms: prepForm.symptoms.split(",").map((item) => item.trim()).filter(Boolean),
        started_when: prepForm.started_when,
        better_worse: prepForm.better_worse,
        questions: prepForm.questions.split("\n").map((item) => item.trim()).filter(Boolean),
        relevant_records: prepForm.relevant_records,
        recent_measurements: prepForm.recent_measurements,
      });
      toast.success("Appointment summary saved.");
    } catch {
      toast.error("Failed to save preparation.");
    }
  };

  const selectedCount = useMemo(() => items.length, [items]);

  return (
    <div className="max-w-7xl mx-auto" data-testid="appointments-page">
      <div className="glass-strong rounded-3xl p-6 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-purple-100 grid place-items-center">
          <CalendarClock className="w-5 h-5 text-purple-700" strokeWidth={2.5}/>
        </div>
        <div>
          <h1 className="font-display text-3xl">Appointments</h1>
          <p className="text-sm text-slate-500">Keep every visit organized.</p>
        </div>
      </div>

      <form onSubmit={add} className="mt-6 glass rounded-3xl p-6 grid md:grid-cols-6 gap-3">
        <input data-testid="appt-doctor" placeholder="Doctor" value={form.doctor} onChange={(e)=>setForm({...form, doctor: e.target.value})} className="md:col-span-3 px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="appt-hospital" placeholder="Hospital / Clinic" value={form.hospital} onChange={(e)=>setForm({...form, hospital: e.target.value})} className="md:col-span-3 px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="appt-date" type="date" value={form.date} onChange={(e)=>setForm({...form, date: e.target.value})} className="md:col-span-2 px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="appt-time" type="time" value={form.time} onChange={(e)=>setForm({...form, time: e.target.value})} className="md:col-span-2 px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="appt-reason" placeholder="Reason" value={form.reason} onChange={(e)=>setForm({...form, reason: e.target.value})} className="md:col-span-2 px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <button data-testid="appt-add" type="submit" className="md:col-span-6 py-2.5 rounded-full bg-rose-400 text-white font-bold hover:scale-[1.01] transition inline-flex items-center justify-center gap-2">
          <Plus className="w-4 h-4"/> Book appointment
        </button>
      </form>

      <div className="mt-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Upcoming visits</div>
              <div className="text-2xl font-semibold text-slate-900">Your appointments</div>
            </div>
            <div className="text-sm text-slate-500">{items.length} scheduled</div>
          </div>

          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500">No appointments yet. Add one above and prepare for your visit.</div>
          ) : (
            <div className="space-y-4">
              {items.map((a) => (
                <div key={a.id} className="rounded-3xl border border-slate-200 p-5 hover:shadow-lg transition">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-display text-xl text-slate-900">{a.doctor}</div>
                      <div className="text-sm text-slate-500">{a.hospital}</div>
                      <div className="text-sm mt-1"><b>{a.date}</b> at <b>{a.time}</b></div>
                      {a.reason && <div className="text-sm text-slate-600 mt-1">{a.reason}</div>}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <button onClick={() => prepare(a)} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                        <Pencil className="w-4 h-4" /> Prepare
                      </button>
                      <button onClick={() => del(a.id)} className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 transition">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="rounded-2xl bg-purple-100 p-3 text-purple-700">
              <QuestionMarkCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Doctor Preparation</div>
              <div className="text-2xl font-semibold text-slate-900">Appointment summary</div>
            </div>
          </div>

          {!activeAppointment ? (
            <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
              Select an appointment and enter your symptoms, timeline, and doctor questions.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Preparing for</div>
                <div className="mt-1 font-semibold text-slate-900">{activeAppointment.doctor} • {activeAppointment.date} at {activeAppointment.time}</div>
                {activeAppointment.hospital && <div className="text-sm text-slate-600 mt-1">{activeAppointment.hospital}</div>}
              </div>

              <div className="space-y-4">
                <Field label="Main concern" value={prepForm.main_concern} onChange={(value) => setPrepForm((prev) => ({ ...prev, main_concern: value }))} placeholder="What is the primary reason for this visit?" />
                <Field label="Symptoms" value={prepForm.symptoms} onChange={(value) => setPrepForm((prev) => ({ ...prev, symptoms: value }))} placeholder="List any symptoms separated by commas" />
                <Field label="Started when" value={prepForm.started_when} onChange={(value) => setPrepForm((prev) => ({ ...prev, started_when: value }))} placeholder="When did symptoms begin?" />
                <Field label="What makes it better / worse" value={prepForm.better_worse} onChange={(value) => setPrepForm((prev) => ({ ...prev, better_worse: value }))} placeholder="Note triggers, relief, or worsening factors" textarea />
                <TextArea label="Questions for doctor" value={prepForm.questions} onChange={(value) => setPrepForm((prev) => ({ ...prev, questions: value }))} placeholder="Write one question per line" />
                <TextArea label="Relevant records" value={prepForm.relevant_records} onChange={(value) => setPrepForm((prev) => ({ ...prev, relevant_records: value }))} placeholder="Recent diagnoses, medications, or results" />
                <TextArea label="Recent measurements" value={prepForm.recent_measurements} onChange={(value) => setPrepForm((prev) => ({ ...prev, recent_measurements: value }))} placeholder="Blood pressure, sugar, weight, etc." />
              </div>

              <div className="flex flex-col gap-3">
                <button type="button" onClick={createSummary} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition">
                  <Info className="w-4 h-4" /> Generate summary
                </button>
                <button type="button" onClick={submitPreparation} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition">
                  Save summary
                </button>
              </div>

              {prepSummary && (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="text-sm uppercase tracking-[0.24em] text-emerald-700">Generated appointment summary</div>
                  <div className="mt-4 space-y-3 text-slate-700">
                    <SummaryLine label="Main concern" value={prepSummary.main_concern} />
                    <SummaryLine label="Symptoms timeline" value={prepSummary.timeline} />
                    <SummaryLine label="What helps / worsens" value={prepSummary.better_worse} />
                    <SummaryList label="Questions for doctor" items={prepSummary.questions} />
                    <SummaryLine label="Relevant records" value={prepSummary.relevant_records} />
                    <SummaryLine label="Recent measurements" value={prepSummary.recent_measurements} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, textarea }) {
  return (
    <label className="block text-sm text-slate-700">
      <div className="font-semibold mb-2">{label}</div>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} placeholder={placeholder}
          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400" />
      )}
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder }) {
  return (
    <label className="block text-sm text-slate-700">
      <div className="font-semibold mb-2">{label}</div>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder}
        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400" />
    </label>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-900">{label}</div>
      <div className="text-sm text-slate-700 mt-1">{value}</div>
    </div>
  );
}

function SummaryList({ label, items }) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-900">{label}</div>
      {items.length === 0 ? (
        <div className="text-sm text-slate-700 mt-1">None</div>
      ) : (
        <ul className="mt-2 space-y-2 text-sm text-slate-700">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2"><span className="mt-1 h-1 w-1 rounded-full bg-slate-500" />{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

