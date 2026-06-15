"use client";

import { useState, useEffect } from "react";
import { Globe, TrendingUp, TrendingDown, Users, Building2, Activity, AlertTriangle, BarChart3, Heart, Shield } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const DISEASE_DATA = [
  { month:"Jan", diabetes:4821, hypertension:7230, cad:1892, covid:324 },
  { month:"Feb", diabetes:4956, hypertension:7180, cad:1876, covid:298 },
  { month:"Mar", diabetes:5102, hypertension:7340, cad:1923, covid:412 },
  { month:"Apr", diabetes:5088, hypertension:7290, cad:1901, covid:380 },
  { month:"May", diabetes:5230, hypertension:7510, cad:1950, covid:340 },
  { month:"Jun", diabetes:5345, hypertension:7620, cad:1987, covid:290 },
];

const REGIONAL_DATA = [
  { region:"Riyadh",  cases:18420, beds:4200, occupancy:78 },
  { region:"Jeddah",  cases:14230, beds:3100, occupancy:82 },
  { region:"Dammam",  cases:9870,  beds:2200, occupancy:74 },
  { region:"Makkah",  cases:8940,  beds:1900, occupancy:88 },
  { region:"Medina",  cases:6320,  beds:1400, occupancy:71 },
  { region:"Tabuk",   cases:3180,  beds:800,  occupancy:65 },
];

const VACCINATION_DATA = [
  { name:"Flu",    pct:68, target:80, color:"#E67E22" },
  { name:"Hep B",  pct:91, target:95, color:"#5DADE2" },
  { name:"MMR",    pct:87, target:95, color:"#2ECC71" },
  { name:"COVID",  pct:74, target:85, color:"#9B59B6" },
];

function StatCard({ label, value, sub, trend, color }: { label: string; value: string; sub?: string; trend?: number; color?: string }) {
  return (
    <div className="glass-card rounded-2xl p-5" style={{ borderTop: `2px solid ${color || "#E67E22"}40` }}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,.4)" }}>{label}</div>
          <div className="text-2xl font-bold text-white">{value}</div>
          {sub && <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,.4)" }}>{sub}</div>}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold ${trend >= 0 ? "text-red-400" : "text-green-400"}`}>
            {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}

export default function NationalPage() {
  const [activeDisease, setActiveDisease] = useState("diabetes");

  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5" style={{ color: "#E67E22" }} />
            <h1 className="text-xl font-bold text-white">National Health Dashboard</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
              style={{ background: "rgba(230,126,34,.12)", color: "#E67E22", border: "1px solid rgba(230,126,34,.2)" }}>
              Ministry of Health View
            </span>
          </div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,.4)" }}>
            Kingdom of Saudi Arabia · Real-time population health surveillance
          </p>
        </div>
        <div className="text-xs px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(46,204,113,.08)", color: "#2ECC71", border: "1px solid rgba(46,204,113,.2)" }}>
          NPHIES Connected
        </div>
      </div>

      {/* National KPIs */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard label="Total Facilities"   value="2,847"     sub="247 hospitals"       trend={3}   color="#5DADE2" />
        <StatCard label="Active Patients"    value="847,230"   sub="Across all regions"  trend={8}   color="#E67E22" />
        <StatCard label="Beds Available"     value="18,420"    sub="of 32,100 total"      trend={-5}  color="#2ECC71" />
        <StatCard label="ER Wait (Avg)"      value="28 min"    sub="National average"    trend={-12} color="#F39C12" />
        <StatCard label="Vaccination Rate"   value="78.4%"     sub="Target: 85%"          trend={2}   color="#9B59B6" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Disease Surveillance */}
        <div className="col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4" style={{ color: "#E67E22" }} />
            <span className="text-sm font-semibold text-white">Chronic Disease Surveillance</span>
            <div className="ml-auto flex gap-1">
              {["diabetes","hypertension","cad","covid"].map(d => (
                <button key={d} onClick={() => setActiveDisease(d)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold capitalize transition-all"
                  style={activeDisease === d
                    ? { background: "rgba(230,126,34,.15)", color: "#E67E22", border: "1px solid rgba(230,126,34,.25)" }
                    : { color: "rgba(255,255,255,.4)" }}>
                  {d === "cad" ? "CAD" : d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={DISEASE_DATA}>
              <defs>
                <linearGradient id="diseaseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E67E22" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#E67E22" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="rgba(255,255,255,.2)" tick={{ fill: "rgba(255,255,255,.4)", fontSize: 10 }} />
              <YAxis stroke="rgba(255,255,255,.2)" tick={{ fill: "rgba(255,255,255,.4)", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "rgba(8,13,26,.95)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8 }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#E67E22" }}
              />
              <Area type="monotone" dataKey={activeDisease} stroke="#E67E22" fill="url(#diseaseGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Vaccination Coverage */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4" style={{ color: "#5DADE2" }} />
            <span className="text-sm font-semibold text-white">Vaccination Coverage</span>
          </div>
          <div className="space-y-4">
            {VACCINATION_DATA.map(v => (
              <div key={v.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "rgba(255,255,255,.7)" }}>{v.name}</span>
                  <span className="font-semibold" style={{ color: v.color }}>{v.pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.07)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${v.pct}%`, background: v.color }} />
                </div>
                <div className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,.3)" }}>
                  Target: {v.target}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regional breakdown */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4" style={{ color: "#E67E22" }} />
          <span className="text-sm font-semibold text-white">Regional Capacity & Occupancy</span>
        </div>
        <div className="grid grid-cols-6 gap-3">
          {REGIONAL_DATA.map(r => {
            const occColor = r.occupancy >= 85 ? "#E74C3C" : r.occupancy >= 75 ? "#F39C12" : "#2ECC71";
            return (
              <div key={r.region} className="p-3 rounded-xl text-center"
                style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)" }}>
                <div className="text-xs font-semibold text-white mb-2">{r.region}</div>
                <div className="relative w-14 h-14 mx-auto mb-2">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="16" fill="none"
                      stroke={occColor} strokeWidth="3"
                      strokeDasharray={`${r.occupancy} 100`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[11px] font-bold" style={{ color: occColor }}>{r.occupancy}%</span>
                  </div>
                </div>
                <div className="text-[10px]" style={{ color: "rgba(255,255,255,.4)" }}>{r.cases.toLocaleString()} cases</div>
                <div className="text-[9px]" style={{ color: "rgba(255,255,255,.3)" }}>{r.beds.toLocaleString()} beds</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Surveillance Alerts */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4" style={{ color: "#F39C12" }} />
          <span className="text-sm font-semibold text-white">AI Surveillance Alerts</span>
        </div>
        <div className="space-y-2">
          {[
            { level:"warning", region:"Makkah", msg:"Bed occupancy at 88% — approaching critical threshold. Recommend activating surge protocol.", time:"2h ago" },
            { level:"info",    region:"Riyadh", msg:"Diabetes new case rate increased 4.8% vs prior month. Recommend community screening campaign.", time:"6h ago" },
            { level:"info",    region:"Jeddah", msg:"Flu vaccination coverage at 68% — 12% below national target. Outreach required.", time:"12h ago" },
          ].map((a, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: a.level === "warning" ? "rgba(243,156,18,.08)" : "rgba(93,173,226,.06)",
                border: `1px solid ${a.level === "warning" ? "rgba(243,156,18,.2)" : "rgba(93,173,226,.15)"}` }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: a.level === "warning" ? "#F39C12" : "#5DADE2" }} />
              <div className="flex-1">
                <div className="text-xs font-semibold text-white mb-0.5">{a.region}</div>
                <div className="text-[11px]" style={{ color: "rgba(255,255,255,.6)" }}>{a.msg}</div>
              </div>
              <span className="text-[9px] flex-shrink-0" style={{ color: "rgba(255,255,255,.3)" }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
