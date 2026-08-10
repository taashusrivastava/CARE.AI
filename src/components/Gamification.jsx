import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Target, Award, Sparkles } from "lucide-react";

const BADGES = [
  { id: "first_week", label: "First Week", desc: "Complete your first 7 days of tracking", icon: Award },
  { id: "consistent", label: "Consistent Tracker", desc: "Track 7+ days in a row", icon: Sparkles },
  { id: "explorer", label: "Health Explorer", desc: "Use 3 different care tools", icon: Target },
  { id: "organizer", label: "Report Organizer", desc: "Add or review 3 health reports", icon: Flame },
];

function daysBetween(a, b) {
  const d1 = new Date(a).setHours(0, 0, 0, 0);
  const d2 = new Date(b).setHours(0, 0, 0, 0);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

export default function Gamification() {
  const [streak, setStreak] = useState(0);
  const [lastTracked, setLastTracked] = useState(null);
  const [trackedDays, setTrackedDays] = useState([]);
  const [exploreCount, setExploreCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("care_gamification") || "{}");
    setStreak(data.streak || 0);
    setLastTracked(data.lastTracked || null);
    setTrackedDays(data.trackedDays || []);
    setExploreCount(data.exploreCount || 0);
    setReportsCount(data.reportsCount || 0);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "care_gamification",
      JSON.stringify({ streak, lastTracked, trackedDays, exploreCount, reportsCount })
    );
  }, [streak, lastTracked, trackedDays, exploreCount, reportsCount]);

  const awardBadge = (id) => {
    const unlocked = JSON.parse(localStorage.getItem("care_badges") || "[]");
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      localStorage.setItem("care_badges", JSON.stringify(unlocked));
      return true;
    }
    return false;
  };

  const badges = () => {
    const unlocked = JSON.parse(localStorage.getItem("care_badges") || "[]");
    return BADGES.map((b) => ({ ...b, unlocked: unlocked.includes(b.id) }));
  };

  const logToday = () => {
    const today = new Date().toISOString();
    const days = [...trackedDays];
    const last = lastTracked;
    if (!last || daysBetween(last, today) > 0) {
      days.push(today);
      setTrackedDays(days);
      if (!last || daysBetween(last, today) === 1) {
        const next = streak + 1;
        setStreak(next);
        if (next >= 7) awardBadge("first_week");
        if (next >= 7) awardBadge("consistent");
      } else {
        setStreak(1);
      }
      setLastTracked(today);
    }
  };

  const simulateExplore = () => {
    const next = exploreCount + 1;
    setExploreCount(next);
    if (next >= 3) awardBadge("explorer");
  };

  const simulateReport = () => {
    const next = reportsCount + 1;
    setReportsCount(next);
    if (next >= 3) awardBadge("organizer");
  };

  const unlocked = badges();

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">🏅 Health Streak</div>
          <div className="mt-1 text-2xl font-display">{streak} day{streak === 1 ? "" : "s"}</div>
          <div className="text-xs text-slate-500">{lastTracked ? `Last tracked: ${new Date(lastTracked).toLocaleDateString()}` : "No tracking yet"}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold">🎯 Goals</div>
          <div className="mt-1 text-sm text-slate-600">Complete weekly tracking: {Math.min(streak,7)}/7</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="w-full bg-white/40 rounded-full h-2 overflow-hidden">
          <div className="h-2 bg-rose-500" style={{ width: `${Math.min((streak / 7) * 100, 100)}%` }} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button onClick={logToday} className="px-3 py-2 rounded-full bg-rose-500 text-white text-sm font-semibold">Log today's tracking</button>
        <button onClick={simulateExplore} className="px-3 py-2 rounded-full bg-slate-100 text-slate-800 text-sm">Explore tool</button>
        <button onClick={simulateReport} className="px-3 py-2 rounded-full bg-slate-100 text-slate-800 text-sm">Add report</button>
      </div>

      <div className="mt-4">
        <div className="text-sm font-semibold mb-2">🏆 Badges</div>
        <div className="grid grid-cols-2 gap-3">
          {unlocked.map((b) => (
            <div key={b.id} className={`p-3 rounded-lg flex items-start gap-3 ${b.unlocked ? "bg-white/90 border" : "bg-white/20 border-dashed"}`}>
              <div className="w-10 h-10 grid place-items-center rounded-lg bg-rose-50">
                <b.icon className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <div className="font-semibold">{b.label}</div>
                <div className="text-xs text-slate-500">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-500">Badges reward healthy, consistent tracking and exploration — not extreme or unhealthy behavior.</div>
    </div>
  );
}
