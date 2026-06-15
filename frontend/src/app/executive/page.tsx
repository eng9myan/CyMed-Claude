"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDown, ArrowUp, Bot, Brain,
  Building2, ChevronRight, Clock, CreditCard, Dna, Heart,
  Layers, Pill, RefreshCw, Shield, Sparkles, TrendingUp, Users, Zap,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

/* ─── Mock data ─── */
const REVENUE_DATA = [
  { m: "Jan", revenue: 38.2, target: 36 },
  { m: "Feb", revenue: 41.5, target: 38 },
  { m: "Mar", revenue: 39.8, target: 39 },
  { m: "Apr", revenue: 44.1, target: 41 },
  { m: "May", revenue: 46.7, target: 43 },
  { m: "Jun", revenue: 49.3, target: 45 },
  { m: "Jul", revenue: 47.2, target: 46 },
  { m: "Aug", revenue: 51.8, target: 48 },
  { m: "Sep", revenue: 53.4, target: 50 },
  { m: "Oct", revenue: 55.9, target: 52 },
  { m: "Nov", revenue: 58.3, target: 54 },
  { m: "Dec", revenue: 60.1, target: 56 },
];

const OCCUPANCY_DATA = [
  { d: "Mon", icu: 91, gen: 78, em: 65 },
  { d: "Tue", icu: 88, gen: 82, em: 71 },
  { d: "Wed", icu: 94, gen: 80, em: 69 },
  { d: "Thu", icu: 96, gen: 85, em: 73 },
  { d: "Fri", icu: 92, gen: 87, em: 80 },
  { d: "Sat", icu: 85, gen: 84, em: 75 },
  { d: "Sun", icu: 89, gen: 79, em: 68 },
];

const DEPT_DATA = [
  { name: "Cardiology",   revenue: 18.4, patients: 1240 },
  { name: "Oncology",     revenue: 22.1, patients: 890  },
  { name: "Orthopedics",  revenue: 14.7, patients: 1560 },
  { name: "Neurology",    revenue: 16.2, patients: 980  },
  { name: "Maternity",    revenue: 11.3, patients: 2340 },
  { name: "Emergency",    revenue: 8.9,  patients: 4210 },
];

const AI_INSIGHTS = [
  { icon: "⚠️", type: "alert",     color: "amber",  text: "ICU capacity at 96% — recommend activating surge protocol for beds 12–18." },
  { icon: "📈", type: "trend",     color: "cyan",   text: "Cardiology revenue +12% vs Q3. Cathlab throughput improvement driving growth." },
  { icon: "💊", type: "pharma",    color: "violet", text: "Drug shortage alert: Amoxicillin 500mg — 3-day supply remaining. Auto-PO initiated." },
  { icon: "🔬", type: "quality",   color: "teal",   text: "Lab TAT improved to 38min avg, below 45min target. Quality KPI met for Nov." },
  { icon: "💰", type: "finance",   color: "emerald",text: "NPHIES claim acceptance 94.2% this week — highest in 8 months. Denial prevention AI contributing." },
  { icon: "👥", type: "staffing",  color: "rose",   text: "Predicted 23% patient volume surge next Monday. Recommend adding 4 ED nurses." },
];

const KPI_CARDS = [
  {
    label: "Enterprise Revenue",
    value: "$452M",
    sub: "YTD",
    change: "+8.4%",
    up: true,
    color: "cyan",
    icon: <CreditCard className="w-5 h-5" />,
    chartColor: "oklch(0.78 0.19 200)",
    sparkData: [28, 32, 31, 35, 38, 42, 44, 46, 49, 52, 55, 58],
  },
  {
    label: "Active Patients",
    value: "12,847",
    sub: "System-wide",
    change: "+3.2%",
    up: true,
    color: "teal",
    icon: <Users className="w-5 h-5" />,
    chartColor: "oklch(0.72 0.17 180)",
    sparkData: [80, 85, 82, 88, 90, 86, 91, 89, 92, 95, 93, 96],
  },
  {
    label: "Bed Occupancy",
    value: "87.3%",
    sub: "Avg all wards",
    change: "-1.2%",
    up: false,
    color: "amber",
    icon: <Activity className="w-5 h-5" />,
    chartColor: "oklch(0.82 0.18 70)",
    sparkData: [78, 80, 82, 85, 88, 87, 89, 90, 88, 87, 87, 87],
  },
  {
    label: "AI Decisions",
    value: "4,291",
    sub: "Today",
    change: "+22%",
    up: true,
    color: "violet",
    icon: <Brain className="w-5 h-5" />,
    chartColor: "oklch(0.65 0.25 280)",
    sparkData: [15, 20, 25, 30, 28, 35, 38, 36, 42, 44, 40, 48],
  },
];

/* ─── Animated number ─── */
function AnimatedNumber({ target, prefix = "", suffix = "" }: { target: string; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState("0");
  const numericTarget = parseFloat(target.replace(/[^0-9.]/g, ""));

  useEffect(() => {
    let start = 0;
    const end = numericTarget;
    const duration = 1200;
    const step = (end - start) / (duration / 16);
    let current = start;
    const timer = setInterval(() => {
      current += step;
      if (current >= end) { current = end; clearInterval(timer); }
      const formatted = target.includes(",")
        ? Math.floor(current).toLocaleString()
        : target.includes(".")
          ? current.toFixed(1)
          : Math.floor(current).toString();
      setDisplay(formatted);
    }, 16);
    return () => clearInterval(timer);
  }, [target, numericTarget]);

  const nonNumericStart = target.match(/^[^0-9]*/)?.[0] ?? "";
  const nonNumericEnd   = target.match(/[^0-9.]+$/)?.[0] ?? "";

  return <>{nonNumericStart}{display}{nonNumericEnd}</>;
}

/* ─── Sparkline ─── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 80, H = 28;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-20 h-7" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
    </svg>
  );
}

/* ─── Custom chart tooltip ─── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <p className="font-semibold mb-1" style={{ color: "oklch(0.85 0.01 240)" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
          {p.name === "revenue" ? "M" : p.name.includes("gen") || p.name.includes("icu") ? "%" : ""}
        </p>
      ))}
    </div>
  );
}

/* ─── AI Briefing typewriter ─── */
const BRIEFING_TEXT = `Good morning. Enterprise revenue is tracking 8.4% above annual target — driven by Cardiology cathlab throughput and improved NPHIES acceptance rates. Critical attention required: ICU at 96% capacity. Recommend activating surge protocol. Drug shortage for Amoxicillin 500mg detected — automatic purchase order initiated. Staffing model predicts elevated ED volume Monday; 4 additional nurses recommended. Overall system health: 94.1 / 100.`;

function AiBriefing() {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed("");
    setDone(false);
    const id = setInterval(() => {
      if (idx.current >= BRIEFING_TEXT.length) { clearInterval(id); setDone(true); return; }
      setDisplayed(BRIEFING_TEXT.slice(0, idx.current + 1));
      idx.current++;
    }, 18);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="text-sm leading-7" style={{ color: "oklch(0.70 0.015 240)" }}>
      {displayed}
      {!done && <span className="typing-cursor" />}
    </p>
  );
}

const COLOR_MAP: Record<string, string> = {
  cyan:    "oklch(0.78 0.19 200)",
  teal:    "oklch(0.72 0.17 180)",
  violet:  "oklch(0.65 0.25 280)",
  amber:   "oklch(0.82 0.18 70)",
  emerald: "oklch(0.73 0.19 155)",
  rose:    "oklch(0.70 0.20 350)",
  coral:   "oklch(0.68 0.22 30)",
};

export default function ExecutiveDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <div className="min-h-full p-6 space-y-6 bg-mesh">

      {/* Page header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-5 h-5" style={{ color: "oklch(0.65 0.25 280)" }} />
            <h1 className="text-xl font-bold" style={{ color: "oklch(0.94 0.008 240)" }}>
              Executive Intelligence
            </h1>
            <span className="badge-ai ml-1">AI-Powered</span>
          </div>
          <p className="text-sm" style={{ color: "oklch(0.48 0.018 240)" }}>
            {now.toLocaleDateString("en-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            {" · "}
            {now.toLocaleTimeString("en-SA", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <button onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: "oklch(1 0 0 / 0.05)", border: "1px solid oklch(1 0 0 / 0.1)", color: "oklch(0.70 0.015 240)" }}>
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi, i) => (
          <div key={kpi.label}
            className={`glass-card metric-card p-5 animate-fade-up delay-${i * 75}`}
            style={{ animationFillMode: "both" }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate mb-0.5" style={{ color: "oklch(0.48 0.018 240)" }}>
                  {kpi.label}
                </p>
                <div className="text-2xl font-bold" style={{ color: "oklch(0.94 0.008 240)" }}>
                  <AnimatedNumber target={kpi.value} />
                </div>
                <p className="text-xs mt-0.5" style={{ color: "oklch(0.42 0.015 240)" }}>{kpi.sub}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${COLOR_MAP[kpi.color]}20`,
                  border: `1px solid ${COLOR_MAP[kpi.color]}30`,
                  color: COLOR_MAP[kpi.color],
                }}>
                {kpi.icon}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-1 text-xs font-semibold ${kpi.up ? "" : ""}`}
                style={{ color: kpi.up ? "oklch(0.73 0.19 155)" : "oklch(0.68 0.22 30)" }}>
                {kpi.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {kpi.change} vs last period
              </div>
              <Sparkline data={kpi.sparkData} color={kpi.chartColor} />
            </div>
          </div>
        ))}
      </div>

      {/* AI Executive Briefing */}
      <div className="ai-panel p-6 animate-fade-up delay-300" style={{ animationFillMode: "both" }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 glow-violet"
            style={{ background: "oklch(0.65 0.25 280 / 0.2)", border: "1px solid oklch(0.65 0.25 280 / 0.35)" }}>
            <Sparkles className="w-5 h-5" style={{ color: "oklch(0.78 0.22 280)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold" style={{ color: "oklch(0.82 0.20 280)" }}>
                AI Executive Briefing
              </span>
              <span className="badge-ai">Claude AI</span>
              <div className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: "oklch(0.42 0.015 240)" }}>
                <Clock className="w-3 h-3" />
                Generated just now
              </div>
            </div>
            <AiBriefing />
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue trend */}
        <div className="xl:col-span-2 glass-card p-5 animate-fade-up delay-400" style={{ animationFillMode: "both" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "oklch(0.88 0.01 240)" }}>Revenue vs Target</h3>
              <p className="text-xs mt-0.5" style={{ color: "oklch(0.48 0.018 240)" }}>Monthly SAR (millions)</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full" style={{ background: "oklch(0.78 0.19 200)" }} />
                <span style={{ color: "oklch(0.55 0.018 240)" }}>Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full" style={{ background: "oklch(1 0 0 / 0.2)" }} />
                <span style={{ color: "oklch(0.55 0.018 240)" }}>Target</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="oklch(0.78 0.19 200)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="oklch(0.78 0.19 200)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
              <XAxis dataKey="m" tick={{ fontSize: 10, fill: "oklch(0.42 0.015 240)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "oklch(0.42 0.015 240)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="oklch(0.78 0.19 200)" strokeWidth={2}
                fill="url(#revGrad)" name="revenue" />
              <Line type="monotone" dataKey="target" stroke="oklch(1 0 0 / 0.2)" strokeWidth={1.5}
                strokeDasharray="4 4" dot={false} name="target" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bed occupancy */}
        <div className="glass-card p-5 animate-fade-up delay-500" style={{ animationFillMode: "both" }}>
          <div className="mb-5">
            <h3 className="text-sm font-semibold" style={{ color: "oklch(0.88 0.01 240)" }}>Bed Occupancy</h3>
            <p className="text-xs mt-0.5" style={{ color: "oklch(0.48 0.018 240)" }}>7-day by ward (%)</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={OCCUPANCY_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
              <XAxis dataKey="d" tick={{ fontSize: 10, fill: "oklch(0.42 0.015 240)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "oklch(0.42 0.015 240)" }} axisLine={false} tickLine={false} domain={[60, 100]} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="icu" fill="oklch(0.68 0.22 30 / 0.7)" radius={[3, 3, 0, 0]} name="icu" maxBarSize={16} />
              <Bar dataKey="gen" fill="oklch(0.78 0.19 200 / 0.7)" radius={[3, 3, 0, 0]} name="gen" maxBarSize={16} />
              <Bar dataKey="em"  fill="oklch(0.82 0.18 70 / 0.7)"  radius={[3, 3, 0, 0]} name="em"  maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2 text-[10px]" style={{ color: "oklch(0.48 0.018 240)" }}>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "oklch(0.68 0.22 30)" }} />ICU</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "oklch(0.78 0.19 200)" }} />General</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "oklch(0.82 0.18 70)" }} />ED</span>
          </div>
        </div>
      </div>

      {/* AI Insights + Dept performance */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* AI Insights feed */}
        <div className="glass-card p-5 animate-fade-up delay-500" style={{ animationFillMode: "both" }}>
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-4 h-4" style={{ color: "oklch(0.65 0.25 280)" }} />
            <h3 className="text-sm font-semibold" style={{ color: "oklch(0.88 0.01 240)" }}>AI Action Items</h3>
            <span className="ml-auto badge-ai">6 active</span>
          </div>
          <div className="space-y-2.5">
            {AI_INSIGHTS.map((insight, i) => (
              <div key={i}
                className="flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer hover:border-opacity-50"
                style={{
                  background: `${COLOR_MAP[insight.color]}08`,
                  border: `1px solid ${COLOR_MAP[insight.color]}18`,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = `${COLOR_MAP[insight.color]}15`;
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${COLOR_MAP[insight.color]}35`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = `${COLOR_MAP[insight.color]}08`;
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${COLOR_MAP[insight.color]}18`;
                }}>
                <span className="text-base flex-shrink-0">{insight.icon}</span>
                <p className="text-xs leading-relaxed" style={{ color: "oklch(0.68 0.015 240)" }}>
                  {insight.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Department performance */}
        <div className="glass-card p-5 animate-fade-up delay-600" style={{ animationFillMode: "both" }}>
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4" style={{ color: "oklch(0.78 0.19 200)" }} />
            <h3 className="text-sm font-semibold" style={{ color: "oklch(0.88 0.01 240)" }}>Department Performance</h3>
          </div>
          <div className="space-y-3">
            {DEPT_DATA.map(dept => {
              const pct = (dept.revenue / 25) * 100;
              return (
                <div key={dept.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium" style={{ color: "oklch(0.72 0.015 240)" }}>{dept.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px]" style={{ color: "oklch(0.48 0.018 240)" }}>
                        {dept.patients.toLocaleString()} pts
                      </span>
                      <span className="text-xs font-bold" style={{ color: "oklch(0.85 0.01 240)" }}>
                        ${dept.revenue}M
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "oklch(1 0 0 / 0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, oklch(0.78 0.19 200), oklch(0.65 0.25 280))`,
                        boxShadow: "0 0 8px oklch(0.78 0.19 200 / 0.4)",
                      }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* System health score */}
          <div className="mt-5 p-4 rounded-xl"
            style={{ background: "linear-gradient(135deg, oklch(0.73 0.19 155 / 0.1), oklch(0.78 0.19 200 / 0.07))", border: "1px solid oklch(0.73 0.19 155 / 0.2)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: "oklch(0.55 0.018 240)" }}>System Health Score</p>
                <div className="text-3xl font-bold mt-1 gradient-text-ai">94.1</div>
                <p className="text-xs" style={{ color: "oklch(0.55 0.018 240)" }}>/ 100 · Excellent</p>
              </div>
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="oklch(1 0 0 / 0.06)" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15.915" fill="none"
                    stroke="oklch(0.73 0.19 155)"
                    strokeWidth="3"
                    strokeDasharray={`${94.1} ${100 - 94.1}`}
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 4px oklch(0.73 0.19 155 / 0.6))" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="w-5 h-5" style={{ color: "oklch(0.73 0.19 155)" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
