import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ShieldCheck, Users, Plus, Trash2, Edit3, Phone, CheckSquare } from "lucide-react";
import { toast } from "sonner";

const PERMISSIONS = [
  { key: "appointment_reminders", label: "Appointment reminders" },
  { key: "emergency_contact", label: "Emergency contact" },
  { key: "health_records", label: "Health records" },
];

const EMPTY = {
  name: "",
  phone: "",
  relationship: "",
  permissions: [],
};

export default function Caregivers() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);

  const load = () => api.get("/caregivers").then((r) => setItems(r.data)).catch(() => setItems([]));

  useEffect(() => {
    load();
  }, []);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const togglePermission = (permission) => {
    setForm((prev) => {
      const has = prev.permissions.includes(permission);
      return {
        ...prev,
        permissions: has
          ? prev.permissions.filter((p) => p !== permission)
          : [...prev.permissions, permission],
      };
    });
  };

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return toast.error("Caregiver name and phone are required.");

    try {
      if (editingId) {
        await api.put(`/caregivers/${editingId}`, form);
        toast.success("Caregiver updated.");
      } else {
        await api.post("/caregivers", form);
        toast.success("Caregiver added.");
      }
      resetForm();
      load();
    } catch {
      toast.error("Unable to save caregiver.");
    }
  };

  const edit = (item) => {
    setForm({
      name: item.name,
      phone: item.phone,
      relationship: item.relationship || "",
      permissions: item.permissions || [],
    });
    setEditingId(item.id);
  };

  const remove = async (id) => {
    try {
      await api.delete(`/caregivers/${id}`);
      toast.success("Caregiver removed.");
      load();
    } catch {
      toast.error("Unable to remove caregiver.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto" data-testid="caregivers-page">
      <div className="glass-strong rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-slate-100 grid place-items-center">
          <ShieldCheck className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-display text-3xl">Caregiver Mode</h1>
          <p className="text-sm text-slate-500 mt-1">
            Designate a trusted caregiver and select exactly what information they may access.
          </p>
        </div>
      </div>

      <form onSubmit={save} className="mt-6 glass rounded-3xl p-6 grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
            <input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none focus:border-emerald-400"
              placeholder="Caregiver name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none focus:border-emerald-400"
              placeholder="Phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Relationship</label>
            <input
              value={form.relationship}
              onChange={(e) => setField("relationship", e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none focus:border-emerald-400"
              placeholder="Relationship (e.g. Parent, Friend)"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <div>
              <div className="text-sm font-semibold text-slate-900">Permissions</div>
              <div className="text-xs text-slate-500">Explicit consent controls what the caregiver may see.</div>
            </div>
          </div>

          <div className="space-y-3">
            {PERMISSIONS.map((permission) => (
              <button
                key={permission.key}
                type="button"
                onClick={() => togglePermission(permission.key)}
                className={`flex w-full items-center justify-between rounded-3xl border px-4 py-3 text-left transition ${
                  form.permissions.includes(permission.key)
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="font-medium text-slate-900">{permission.label}</div>
                  <div className="text-xs text-slate-500">Enable if this caregiver may receive or access this data.</div>
                </div>
                <CheckSquare className={`w-5 h-5 ${form.permissions.includes(permission.key) ? "text-emerald-600" : "text-slate-300"}`} />
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
              <Plus className="w-4 h-4" /> {editingId ? "Update caregiver" : "Add caregiver"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Cancel edit
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.length === 0 && (
          <div className="glass rounded-3xl p-6 text-slate-500 md:col-span-2">
            No caregivers yet. Add a trusted person and choose what info they may access.
          </div>
        )}

        {items.map((item) => (
          <div key={item.id} className="glass rounded-3xl p-5 border border-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-xl text-slate-900">{item.name}</div>
                <div className="text-sm text-slate-500">{item.relationship || "Caregiver"}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                  {item.permissions.length > 0 ? (
                    item.permissions.map((permission) => {
                      const label = PERMISSIONS.find((perm) => perm.key === permission)?.label || permission;
                      return (
                        <span key={permission} className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                          {label}
                        </span>
                      );
                    })
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">No permissions selected</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => edit(item)} className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => remove(item.id)} className="rounded-2xl border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-700">
              <div className="rounded-3xl bg-slate-50 p-4 flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{item.phone}</span>
              </div>
              {item.relationship && (
                <div className="rounded-3xl bg-slate-50 p-4 text-slate-700">
                  Relationship: <span className="font-semibold text-slate-900">{item.relationship}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
