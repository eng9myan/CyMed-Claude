"use client";

import { useState } from "react";
import {
  FlaskConical, Search, CheckCircle2, Clock, AlertTriangle,
  Microscope, Beaker, RefreshCw, TrendingUp, Activity, Zap,
  Download, ChevronRight, Bell,
} from "lucide-react";

const ORDERS = [
  { id: "LAB-2026-8801", patient: "Ahmed Al-Rashid", mrn: "MRN-10234", test: "HbA1c", category: "Chemistry", ordered_by: "Dr. Al-Otaibi", priority: "routine", status: "resulted", result: "8.2%", ref: "4.0–5.6%", critical: true, dept: "Endocrinology" },
  { id: "LAB-2026-8802", patient: "Fatima Al-Zahra", mrn: "MRN-10235", test: "INR / PT", category: "Coagulation", ordered_by: "Dr. Al-Harbi", priority: "urgent", status: "in_progress", result: null, ref: "0.8–1.1", critical: false, dept: "Cardiology" },
  { id: "LAB-2026-8803", patient: "Khalid Al-Otaibi", mrn: "MRN-10236", test: "CBC with Differential", category: "Hematology", ordered_by: "Dr. Al-Ghamdi", priority: "routine", status: "resulted", result: "WBC 11.2 × 10³/µL ↑", ref: "4.5–11.0", critical: false, dept: "General Medicine" },
  { id: "LAB-2026-8804", patient: "Sara Al-Ghamdi", mrn: "MRN-10237", test: "CA-125", category: "Tumor Markers", ordered_by: "Dr. Al-Rashid", priority: "urgent", status: "collected", result: null, ref: "<35 U/mL", critical: false, dept: "Oncology" },
  { id: "LAB-2026-8805", patient: "Mohammed Al-Harbi", mrn: "MRN-10238", test: "Troponin I (hsTnI)", category: "Cardiac", ordered_by: "Dr. Al-Harbi", priority: "stat", status: "resulted", result: "0.048 ng/mL ↑↑", ref: "<0.012", critical: true, dept: "Emergency" },
  { id: "LAB-2026-8806", patient: "Noura Al-Shehri", mrn: "MRN-10239", test: "Lipid Panel", category: "Chemistry", ordered_by: "Dr. Al-Zahrani", priority: "routine", status: "pending", result: null, ref: "Various", critical: false, dept: "Internal Medicine" },
  { id: "LAB-2026-8807", patient: "Abdullah Al-Dosari", mrn: "MRN-10240", test: "eGFR + Creatinine", category: "Renal", ordered_by: "Dr. Al-Otaibi", priority: "routine", status: "resulted", result: "eGFR 22 mL/min ↓↓", ref: ">60 mL/min", critical: true, dept: "Nephrology" },
];

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending:     { label: "Pending Collection", cls: "bg-slate-500/20 text-slate-400" },
  collected:   { label: "Collected", cls: "bg-blue-500/20 text-blue-400" },
  in_progress: { label: "In Progress", cls: "bg-amber-500/20 text-amber-400" },
  resulted:    { label: "Resulted", cls: "bg-emerald-500/20 text-emerald-400" },
};

const TAT_DATA = [
  { test: "STAT Troponin", target: 60, actual: 48 },
  { test: "CBC", target: 120, actual: 95 },
  { test: "BMP", target: 120, actual: 108 },
  { test: "Blood Culture", target: 1440, actual: 1380 },
  { test: "Coagulation", target: 90, actual: 76 },
];

export default function LaboratoryPage() {
  const [orders, setOrders] = useState(ORDERS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  const critical = orders.filter(o => o.critical && o.status === "resulted" && !acknowledged.has(o.id));
  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const match = !q || o.patient.toLowerCase().includes(q) || o.test.toLowerCase().includes(q) || o.id.includes(q);
    const matchF = filter === "all" || o.status === filter || (filter === "critical" && o.critical);
    return match && matchF;
  });

  function acknowledge(id: string) {
    setAcknowledged(prev => new Set([...prev, id]));
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Laboratory Information System</h1>
          <p className="text-slate-400 text-sm mt-0.5">LIMS • Critical Values • TAT Monitoring • FHIR Observations</p>
        </div>
        <div className="flex gap-3">
          {critical.length > 0 && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/40 text-red-400 text-sm px-4 py-2 rounded-xl animate-pulse font-semibold">
              <Bell className="w-4 h-4" /> {critical.length} Critical Value{critical.length > 1 ? "s" : ""}
            </div>
          )}
          <button className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 text-sm px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition">
            <RefreshCw className="w-4 h-4" /> Sync LIMS
          </button>
        </div>
      </div>

      {/* Critical Value Alerts */}
      {critical.length > 0 && (
        <div className="space-y-2">
          {critical.map(o => (
            <div key={o.id} className="bg-red-500/10 border border-red-500/40 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-red-300">CRITICAL VALUE — {o.test}</p>
                  <p className="text-red-400/80 text-sm">{o.patient} ({o.mrn}) • Result: <strong>{o.result}</strong> • Ref: {o.ref}</p>
                </div>
              </div>
              <button
                onClick={() => acknowledge(o.id)}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
              >
                Acknowledge &amp; Notify
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: orders.length, color: "from-blue-500 to-indigo-600", icon: FlaskConical },
          { label: "In Progress", value: orders.filter(o => o.status === "in_progress" || o.status === "collected").length, color: "from-amber-500 to-orange-600", icon: Clock },
          { label: "Resulted Today", value: orders.filter(o => o.status === "resulted").length, color: "from-emerald-500 to-teal-600", icon: CheckCircle2 },
          { label: "Critical Unack.", value: critical.length, color: "from-red-500 to-rose-600", icon: AlertTriangle },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-5`} />
            <div className="relative flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${s.color}`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Orders Table */}
        <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              <Microscope className="w-4 h-4 text-blue-400" /> Lab Orders
            </h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="bg-slate-800 border border-slate-700 text-sm text-slate-300 pl-9 pr-4 py-2 rounded-xl w-44 outline-none focus:border-blue-500 placeholder:text-slate-600"
                />
              </div>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-sm text-slate-300 px-3 py-2 rounded-xl outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resulted">Resulted</option>
                <option value="critical">Critical Only</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-800/50">
            {filtered.map(order => {
              const meta = STATUS_META[order.status] ?? STATUS_META.pending;
              return (
                <div key={order.id} className={`p-4 hover:bg-slate-800/40 transition ${order.critical && !acknowledged.has(order.id) ? "border-l-2 border-red-500" : ""}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-slate-500">{order.id}</span>
                        {order.priority === "stat" && <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">STAT</span>}
                        {order.priority === "urgent" && <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">URGENT</span>}
                        {order.critical && order.status === "resulted" && (
                          <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">⚠ CRITICAL</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {order.patient.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{order.patient}</p>
                          <p className="text-xs text-slate-500">{order.mrn} • {order.dept} • {order.ordered_by}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <Beaker className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="font-semibold text-blue-300">{order.test}</span>
                        <span className="text-slate-500 text-xs">{order.category}</span>
                      </div>
                      {order.result && (
                        <div className={`mt-2 px-3 py-1.5 rounded-xl inline-flex items-center gap-2 text-sm font-semibold ${order.critical ? "bg-red-500/10 border border-red-500/30 text-red-300" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"}`}>
                          <Activity className="w-3.5 h-3.5" />
                          {order.result}
                          <span className="text-slate-500 font-normal text-xs">Ref: {order.ref}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.cls}`}>{meta.label}</span>
                      {order.status === "resulted" && (
                        <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition">
                          <Download className="w-3 h-3" /> PDF Report
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TAT Monitor */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Turnaround Time
          </h3>
          <div className="space-y-4">
            {TAT_DATA.map(t => {
              const pct = Math.min(100, (t.actual / t.target) * 100);
              const ok = t.actual <= t.target;
              return (
                <div key={t.test}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{t.test}</span>
                    <span className={ok ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                      {t.actual}m / {t.target}m
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Test Volumes Today</h4>
            {[
              { cat: "Chemistry", count: 142 },
              { cat: "Hematology", count: 98 },
              { cat: "Microbiology", count: 34 },
              { cat: "Coagulation", count: 27 },
            ].map(v => (
              <div key={v.cat} className="flex justify-between text-sm py-1.5 border-b border-slate-800/50">
                <span className="text-slate-400">{v.cat}</span>
                <span className="font-bold text-slate-200">{v.count}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold py-2 rounded-xl transition">
            Export FHIR DiagnosticReport
          </button>
        </div>
      </div>
    </div>
  );
}
