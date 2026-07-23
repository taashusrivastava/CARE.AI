import React, { useEffect, useState } from "react";
import { Siren, Phone, MessageSquare, X } from "lucide-react";
import { api } from "@/lib/api";

export default function SosButton() {
  const [open, setOpen] = useState(false);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    if (open) {
      api.get("/contacts").then(r => setContacts(r.data)).catch(() => setContacts([]));
    }
  }, [open]);

  return (
    <>
      <button
        data-testid="sos-button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)] flex items-center justify-center z-50 text-white font-black text-xl border-4 border-white/50 hover:scale-105 active:scale-95 transition-transform animate-pulse"
      >
        {open ? <X className="w-8 h-8" /> : <Siren className="w-8 h-8" />}
      </button>

      {open && (
        <div className="fixed bottom-28 right-6 z-50 glass-strong rounded-3xl p-4 w-72 shadow-2xl border border-red-200">
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
                  <div className="flex gap-1 shrink-0">
                    <a href={`tel:${c.phone}`} className="p-2 rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                      <Phone className="w-4 h-4" />
                    </a>
                    <a href={`sms:${c.phone}`} className="p-2 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200">
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
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
