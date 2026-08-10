import React, { useMemo, useState } from "react";
import { Brain, Heart, Cloud, Bone, Stethoscope, ArrowRight, Info } from "lucide-react";

const organs = [
  {
    id: "brain",
    label: "Brain",
    icon: Brain,
    position: { top: "10%", left: "50%" },
    summary: "The brain is the body's control center. It processes thoughts, memories, emotions, and coordinates every movement.",
    details: [
      "Contains billions of neurons that transmit information.",
      "Responsible for memory, learning, and decision-making.",
      "Protects the body by controlling the nervous system and reflexes.",
    ],
  },
  {
    id: "heart",
    label: "Heart",
    icon: Heart,
    position: { top: "33%", left: "50%" },
    summary: "The heart is a powerful muscle that pumps blood through your entire body, delivering oxygen and nutrients.",
    details: [
      "Has four chambers: two atria and two ventricles.",
      "Circulates oxygen-rich blood to organs and tissues.",
      "Works with lungs to support respiration and energy production.",
    ],
  },
  {
    id: "lungs",
    label: "Lungs",
    icon: Cloud,
    position: { top: "45%", left: "30%" },
    summary: "The lungs are essential for breathing. They exchange oxygen and carbon dioxide with every breath.",
    details: [
      "Air enters through the nose and mouth and travels to the alveoli.",
      "Oxygen is absorbed into the bloodstream and carbon dioxide is expelled.",
      "Healthy lungs support physical activity and immune health.",
    ],
  },
  {
    id: "bones",
    label: "Bones",
    icon: Bone,
    position: { top: "55%", left: "60%" },
    summary: "Bones provide structure, protect organs, and enable movement through a system of joints and muscles.",
    details: [
      "The adult body has 206 bones connected by joints.",
      "Bones store calcium and support blood cell production.",
      "Strong bones are building blocks for mobility and posture.",
    ],
  },
  {
    id: "digestive",
    label: "Digestive system",
    icon: Stethoscope,
    position: { top: "64%", left: "45%" },
    summary: "The digestive system turns food into energy and nutrients while removing waste from the body.",
    details: [
      "Starts in the mouth and continues through the stomach and intestines.",
      "Helps the body absorb vitamins, minerals, proteins, and carbohydrates.",
      "A healthy diet supports digestion and gut wellness.",
    ],
  },
];

export default function HealthEducation() {
  const [selected, setSelected] = useState(organs[1]);

  const organButtons = useMemo(() => organs, []);

  return (
    <div className="max-w-7xl mx-auto" data-testid="health-education-page">
      <div className="glass-strong rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-14 h-14 rounded-3xl bg-slate-100 grid place-items-center">
          <Info className="w-6 h-6 text-slate-700" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Visual Health Education</h1>
          <p className="text-sm text-slate-500 mt-1">
            Learn about the body with an interactive diagram. Click an organ to see key facts and healthy tips.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_0.65fr]">
        <div className="glass rounded-3xl p-6">
          <div className="relative rounded-3xl bg-slate-950 overflow-hidden border border-slate-800" style={{ minHeight: 560 }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_28%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.12),_transparent_30%)]" />
            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center text-white">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-300 mb-3">Human body guide</div>
              <div className="relative w-full max-w-md mx-auto">
                <div className="mx-auto h-[420px] w-[280px] rounded-[60px] bg-slate-900/90 border border-slate-700 shadow-2xl" />
                {organButtons.map((organ) => {
                  const Icon = organ.icon;
                  const isSelected = selected.id === organ.id;
                  return (
                    <button
                      key={organ.id}
                      type="button"
                      onClick={() => setSelected(organ)}
                      className={`absolute rounded-full border-2 p-3 shadow-lg transition ${
                        isSelected ? "bg-emerald-500 border-emerald-300 text-white scale-110" : "bg-white/90 border-white text-slate-900 hover:scale-105"
                      }`}
                      style={organ.position}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 rounded-3xl bg-slate-900/90 border border-white/10 p-5 text-left shadow-xl">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Tap any organ</div>
                <div className="mt-2 text-xl font-semibold text-white">{selected.label}</div>
                <p className="mt-3 text-slate-300 text-sm">{selected.summary}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <selected.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Selected organ</div>
                <div className="text-2xl font-semibold text-slate-900">{selected.label}</div>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-slate-700">
              {selected.details.map((item) => (
                <div key={item} className="rounded-3xl bg-slate-50 p-4 text-sm leading-6">{item}</div>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Healthy learning</div>
            <div className="mt-3 text-slate-900 font-semibold">Why this matters</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Visual learning makes anatomy more memorable. This page helps you explore major organ systems without medical diagnosis.
            </p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">Focus on breathing, circulation, and digestion for everyday wellness.</div>
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">Share a body part with loved ones to explain symptoms or care needs.</div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Quick topics</div>
                <div className="mt-2 font-semibold text-slate-900">Explore body systems</div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>
            <div className="mt-4 grid gap-3">
              {organs.map((organ) => (
                <button
                  key={organ.id}
                  type="button"
                  onClick={() => setSelected(organ)}
                  className={`w-full rounded-3xl border px-4 py-3 text-left transition ${
                    selected.id === organ.id ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <organ.icon className="w-4 h-4 text-slate-600" />
                    <span className="font-medium text-slate-900">{organ.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 glass rounded-3xl p-5 text-xs text-slate-500">
        <strong>Note:</strong> This interactive page is for learning and awareness. It does not provide medical diagnosis or treatment guidance.
      </div>
    </div>
  );
}
