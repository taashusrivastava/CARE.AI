import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Network, Search, MousePointerClick, Info } from "lucide-react";

const TYPE_LABELS = {
  symptom: "Symptom",
  system: "Body System",
  topic: "Health Topic",
  test: "Test",
  specialist: "Specialist",
  facility: "Facility",
};

const W = 1000;
const H = 620;

// Simple circular layout grouped by type, arranged in layers.
function layoutNodes(nodes, edges) {
  const types = ["symptom", "system", "topic", "test", "specialist", "facility"];
  const byType = {};
  nodes.forEach((n) => {
    (byType[n.type] = byType[n.type] || []).push(n);
  });

  const positions = {};
  const centerX = W / 2;
  const centerY = H / 2;

  // Layer radii by type order
  const radius = { symptom: 250, topic: 150, system: 70, test: 220, specialist: 190, facility: 260 };
  const order = ["system", "topic", "symptom", "test", "specialist", "facility"];

  order.forEach((type) => {
    const list = byType[type] || [];
    const count = list.length;
    const r = radius[type] || 200;
    list.forEach((n, i) => {
      const angle = (i / Math.max(1, count)) * Math.PI * 2 - Math.PI / 2;
      positions[n.id] = { x: centerX + r * Math.cos(angle), y: centerY + r * Math.sin(angle) };
    });
  });

  return positions;
}

export default function KnowledgeGraph() {
  const [data, setData] = useState(null);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(true);
  const svgRef = useRef(null);

  useEffect(() => {
    api.get("/graph")
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setBusy(false));
  }, []);

  const positions = useMemo(() => (data ? layoutNodes(data.nodes, data.edges) : {}), [data]);

  const nodeById = useMemo(() => {
    const m = {};
    (data?.nodes || []).forEach((n) => (m[n.id] = n));
    return m;
  }, [data]);

  // Compute connected node ids for the selected node
  const connected = useMemo(() => {
    if (!selected || !data) return new Set();
    const s = new Set([selected]);
    data.edges.forEach((e) => {
      if (e.source === selected) s.add(e.target);
      if (e.target === selected) s.add(e.source);
    });
    return s;
  }, [selected, data]);

  const filteredNodes = useMemo(() => {
    if (!data) return [];
    const term = q.trim().toLowerCase();
    if (!term) return data.nodes;
    return data.nodes.filter((n) => n.label.toLowerCase().includes(term));
  }, [data, q]);

  const filteredIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const visibleEdges = useMemo(() => {
    if (!data) return [];
    return data.edges.filter((e) => filteredIds.has(e.source) && filteredIds.has(e.target));
  }, [data, filteredIds]);

  const handleClick = (id) => setSelected(id === selected ? null : id);

  const connectedNeighbors = useMemo(() => {
    if (!selected || !data) return [];
    const s = new Set([selected]);
    data.edges.forEach((e) => {
      if (e.source === selected) s.add(e.target);
      if (e.target === selected) s.add(e.source);
    });
    return data.nodes.filter((n) => s.has(n.id) && n.id !== selected);
  }, [selected, data]);

  return (
    <div className="max-w-7xl mx-auto" data-testid="knowledge-graph-page">
      <div className="glass-strong rounded-3xl p-6 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-indigo-100 grid place-items-center">
          <Network className="w-5 h-5 text-indigo-700" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-display text-3xl">Health Knowledge Graph</h1>
          <p className="text-sm text-slate-500">
            Explore how symptoms, body systems, health topics, tests, specialists & facilities connect.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 glass rounded-3xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/90 border border-white flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            data-testid="graph-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a symptom, topic, test, specialist…"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(TYPE_LABELS).map(([t, label]) => {
            const color = data?.types?.[t] || "#64748b";
            return (
              <span key={t} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span className="w-3 h-3 rounded-full" style={{ background: color }} />
                {label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Graph canvas */}
      <div className="mt-4 glass rounded-3xl p-2 overflow-hidden">
        {busy ? (
          <div className="text-center text-slate-500 py-20">
            <div className="animate-pulse text-2xl mb-2">+</div>
            <div>Building the knowledge graph…</div>
          </div>
        ) : !data ? (
          <div className="text-center text-slate-500 py-20">
            <div className="text-2xl mb-2">⚠️</div>
            <div>Could not load the knowledge graph.</div>
          </div>
        ) : (
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-white/40 rounded-2xl"
            onClick={() => setSelected(null)} data-testid="graph-canvas">
            {/* Edges */}
            {visibleEdges.map((e, i) => {
              const a = positions[e.source];
              const b = positions[e.target];
              if (!a || !b) return null;
              const active = selected && (e.source === selected || e.target === selected);
              const dim = selected && !active;
              return (
                <g key={i} opacity={dim ? 0.12 : active ? 1 : 0.35}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={active ? "#6366f1" : "#94a3b8"} strokeWidth={active ? 2.5 : 1.2}
                    onClick={(ev) => { ev.stopPropagation(); }} />
                  {active && (
                    <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 4} textAnchor="middle"
                      fontSize="10" fill="#6366f1" fontWeight="600">
                      {e.relation}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((n) => {
              const p = positions[n.id];
              if (!p) return null;
              const isSel = selected === n.id;
              const isConn = selected && connected.has(n.id);
              const dim = selected && !isSel && !isConn;
              const inSearch = q.trim() && filteredIds.has(n.id);
              const r = n.type === "system" ? 26 : n.type === "topic" ? 22 : 15;
              return (
                <g key={n.id} transform={`translate(${p.x},${p.y})`} opacity={dim ? 0.15 : 1}
                  onClick={(ev) => { ev.stopPropagation(); handleClick(n.id); }}
                  className="cursor-pointer" data-testid={`node-${n.type}`}>
                  <circle r={r + (isSel ? 4 : isConn ? 2 : 0)} fill={n.color} opacity={isConn && !isSel ? 0.85 : 1}
                    stroke={isSel ? "#1e293b" : "#fff"} strokeWidth={isSel ? 3 : 2} />
                  <text textAnchor="middle" dy={r + 14} fontSize="11" fontWeight="600" fill="#334155">
                    {n.label.length > 20 ? n.label.slice(0, 19) + "…" : n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        {/* Selected node details */}
        <div className="glass rounded-3xl p-5" data-testid="graph-detail">
          {selected && nodeById[selected] ? (
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: nodeById[selected].color }} />
                <h3 className="font-display text-xl">{nodeById[selected].label}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {TYPE_LABELS[nodeById[selected].type]}
                </span>
              </div>
              <div className="mt-4 text-sm text-slate-600">
                <div className="font-semibold text-slate-800 mb-2">Directly connected to:</div>
                {connectedNeighbors.length === 0 ? (
                  <div className="text-slate-500">No connections.</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {connectedNeighbors.map((nb) => (
                      <button key={nb.id} onClick={() => handleClick(nb.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-indigo-50 transition">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: nb.color }} />
                        {nb.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-sm flex items-center gap-2">
              <MousePointerClick className="w-4 h-4" />
              Click any node to inspect its connections.
            </div>
          )}
        </div>

        {/* Stats / disclaimer */}
        <div className="glass rounded-3xl p-5 text-xs text-slate-500">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-slate-700">About this graph</span>
          </div>
          {data && (
            <p>
              {data.nodes.length} nodes and {data.edges.length} relationships,
              connecting symptoms to their likely health topics, the body systems involved,
              the tests used to investigate them, the specialists who treat them, and where you can seek care.
              This is a simplified educational map — always consult a qualified healthcare professional.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
