"use client";

import { useEffect, useRef, useState } from "react";
import {
  AreaChart, Area, LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

/* ── Live clock ── */
function LiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <span className="font-mono tabular-nums" style={{ color: "#22d3ee" }}>
      {t.toLocaleTimeString("en-SA", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

/* ── Sparkline that auto-animates ── */
function Sparkline({ color, base, variance }: { color: string; base: number; variance: number }) {
  const [data, setData] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({ v: base + (Math.random() - 0.5) * variance }))
  );
  useEffect(() => {
    const id = setInterval(() => {
      setData(p => [...p.slice(1), { v: base + (Math.random() - 0.5) * variance }]);
    }, 1200);
    return () => clearInterval(id);
  }, [base, variance]);
  return (
    <ResponsiveContainer width="100%" height={44}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg${color.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#sg${color.replace(/[^a-z0-9]/gi, "")})`} dot={false} isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ── Revenue chart data ── */
const REVENUE_DATA = [
  { m: "J", actual: 1.8, target: 2.0 }, { m: "M", actual: 1.9, target: 2.1 },
  { m: "M", actual: 2.1, target: 2.1 }, { m: "J", actual: 2.3, target: 2.2 },
  { m: "S", actual: 2.6, target: 2.3 }, { m: "N", actual: 2.84, target: 2.4 },
];

/* ── Alerts ── */
const ALERTS = [
  { id:1, level:"critical", src:"ICU Bay 4",   msg:"HR 148bpm — VTach pattern. Immediate review needed.", time:"Just now" },
  { id:2, level:"critical", src:"ED Triage",   msg:"NEWS2 score 8. Sepsis risk 87%. Cultures + antibiotics.",  time:"2m ago" },
  { id:3, level:"warning",  src:"Pharmacy",    msg:"Drug interaction: Warfarin + Ciprofloxacin MRN-10387.",     time:"5m ago" },
];

/* ── Wards ── */
const WARDS = [
  { name:"ICU",      occ:19, total:20, color:"#ef4444" },
  { name:"General",  occ:68, total:80, color:"#60a5fa" },
  { name:"Maternity",occ:22, total:30, color:"#a78bfa" },
  { name:"ED",       occ:31, total:40, color:"#fbbf24" },
  { name:"Oncology", occ:17, total:20, color:"#a78bfa" },
];

const DOT_COLOR: Record<string, string> = {
  critical: "#ef4444",
  warning:  "#fbbf24",
  info:     "#22d3ee",
};

/* ── Card shell ── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
      {children}
    </p>
  );
}

export default function CommandCenter() {
  const [acked, setAcked] = useState<number[]>([]);

  return (
    <div className="p-7 min-h-screen" style={{ background: "#080d18" }}>

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" }}>
            Command Center
          </h1>
          <div className="flex items-center gap-2 mt-1" style={{ fontSize: 13, color: "rgba(255,255,255,0.38)" }}>
            <span>Al-Riyadh Medical Center</span>
            <span>·</span>
            <LiveClock />
            <span>AM</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.25)" }}
          >
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#22d3ee" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#22d3ee" }}>Live · 284 patients today</span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)" }}
          >
            <span style={{ fontSize: 12, color: "#4ade80" }}>✓</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#4ade80" }}>System Healthy</span>
          </div>
        </div>
      </div>

      {/* ── 4 KPI cards ── */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label:"Active Patients",   value:"12,847", sub:"System-wide",         trend:"↑ 3.2% vs yesterday", trendOk:true,  warn:null,           color:"#60a5fa", base:12847, variance:200 },
          { label:"ICU Occupancy",     value:"96%",    sub:"20/20 beds",          trend:null,                  trendOk:false, warn:"Critical capacity", color:"#ef4444", base:96,    variance:1   },
          { label:"AI Decisions",      value:"4,291",  sub:"Today",               trend:"↑ 22% vs avg",        trendOk:true,  warn:null,           color:"#a78bfa", base:4291,  variance:80  },
          { label:"Claims Accepted",   value:"94.2%",  sub:"NPHIES today",        trend:"↑ 3% above avg",      trendOk:true,  warn:null,           color:"#4ade80", base:94.2,  variance:0.8 },
        ].map((k) => (
          <Card key={k.label} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{k.label}</p>
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", lineHeight: 1, marginBottom: 2 }}>{k.value}</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>{k.sub}</p>
            <Sparkline color={k.color} base={k.base} variance={k.variance} />
            {k.warn && (
              <div className="flex items-center gap-1.5 mt-1">
                <span style={{ fontSize: 11, color: "#ef4444" }}>⚠ {k.warn}</span>
              </div>
            )}
            {k.trend && (
              <p style={{ fontSize: 11, color: k.trendOk ? "#4ade80" : "#f87171", marginTop: 4 }}>{k.trend}</p>
            )}
          </Card>
        ))}
      </div>

      {/* ── AI Briefing ── */}
      <Card className="p-5 mb-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.4),rgba(168,85,247,0.4))", border: "1px solid rgba(139,92,246,0.4)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="#c4b5fd" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>CyMed AI Briefing</span>
              <span
                className="px-2.5 py-0.5 rounded-full"
                style={{ fontSize: 10, fontWeight: 700, background: "rgba(139,92,246,0.2)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.35)" }}
              >
                Claude AI
              </span>
              <span className="ml-auto" style={{ fontSize: 11, color: "rgba(255,255,255,0.28)" }}>Generated just now</span>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.65 }}>
              ICU at 96% capacity — surge protocol activation recommended. Revenue tracking 8.4% above annual target.
              Sepsis risk patient in ED requires immediate antibiotics. Drug interaction flagged for MRN-10387.
              NPHIES claim rate at 94.2% — highest in 8 months.
            </p>
          </div>
        </div>
      </Card>

      {/* ── Bottom 3-col grid ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Revenue vs Target */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
            </svg>
            <SectionLabel>Revenue vs Target</SectionLabel>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "rgba(255,255,255,0.5)" }}
              />
              <Area type="monotone" dataKey="target" stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="4 3" fill="none" dot={false} />
              <Area type="monotone" dataKey="actual" stroke="#22d3ee" strokeWidth={2} fill="url(#revGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* AI Clinical Alerts */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <SectionLabel>AI Clinical Alerts</SectionLabel>
            </div>
            <span
              className="px-2 py-0.5 rounded-full"
              style={{ fontSize: 10, fontWeight: 700, background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
            >
              {ALERTS.filter(a => a.level === "critical" && !acked.includes(a.id)).length} Critical
            </span>
          </div>
          <div className="space-y-3">
            {ALERTS.map(a => (
              <div
                key={a.id}
                className="flex gap-3 p-3 rounded-xl"
                style={{
                  background: `${DOT_COLOR[a.level]}0d`,
                  border: `1px solid ${DOT_COLOR[a.level]}28`,
                  opacity: acked.includes(a.id) ? 0.4 : 1,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                  style={{ background: DOT_COLOR[a.level], boxShadow: `0 0 6px ${DOT_COLOR[a.level]}` }}
                />
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 12, fontWeight: 600, color: DOT_COLOR[a.level], marginBottom: 2 }}>{a.src}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{a.msg}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>{a.time}</p>
                </div>
                {!acked.includes(a.id) && (
                  <button
                    onClick={() => setAcked(p => [...p, a.id])}
                    style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap", marginTop: 2 }}
                  >
                    Ack
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Bed Board */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
              <path d="M2 9h20v13H2zM2 9V5a2 2 0 012-2h4a2 2 0 012 2v4M12 9V5a2 2 0 012-2h4a2 2 0 012 2v4" />
            </svg>
            <SectionLabel>Bed Board</SectionLabel>
          </div>
          <div className="space-y-4">
            {WARDS.map(w => {
              const pct = Math.round((w.occ / w.total) * 100);
              return (
                <div key={w.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{w.name}</span>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{w.occ}/{w.total}</span>
                      <span
                        className="px-2 py-0.5 rounded-full"
                        style={{
                          fontSize: 10, fontWeight: 700,
                          background: `${w.color}20`,
                          color: w.color,
                          border: `1px solid ${w.color}35`,
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: w.color,
                        boxShadow: `0 0 8px ${w.color}50`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Live Vitals footer strip ── */}
      <div className="mt-5 p-4 rounded-xl flex items-center gap-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#ef4444" }} />
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          Live Patient Vitals — ICU Bays 1–6
        </span>
        <span
          className="px-2 py-0.5 rounded-full"
          style={{ fontSize: 10, fontWeight: 700, background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          1 Critical
        </span>
        <div className="flex-1 flex items-center gap-2 overflow-hidden">
          {["HR 148", "SpO₂ 98%", "BP 142", "RR 18", "Temp 38.9°C", "GCS 14"].map((v, i) => (
            <span key={i} className="px-2.5 py-1 rounded-lg flex-shrink-0" style={{ fontSize: 11, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
              Bay {i+1} · {v}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
