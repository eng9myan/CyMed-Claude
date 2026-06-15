"use client";

import { useState } from "react";
import {
  Pill, Search, CheckCircle2, Clock, AlertTriangle, XCircle,
  RefreshCw, Zap, PackageCheck, FlaskConical, BarChart3, ShieldAlert,
  ChevronRight, User,
} from "lucide-react";

const QUEUE = [
  { id: "RX-2026-4421", patient: "Ahmed Al-Rashid", mrn: "MRN-10234", drug: "Metformin 1000mg", route: "PO", freq: "BID", qty: 60, status: "new", priority: "routine", doctor: "Dr. Al-Otaibi", cds: null, dept: "Endocrinology" },
  { id: "RX-2026-4422", patient: "Fatima Al-Zahra", mrn: "MRN-10235", drug: "Warfarin 5mg", route: "PO", freq: "OD", qty: 30, status: "new", priority: "urgent", doctor: "Dr. Al-Harbi", cds: { severity: "hard", msg: "DRUG INTERACTION: Warfarin + Ibuprofen — increased bleeding risk. Hold and verify." }, dept: "Cardiology" },
  { id: "RX-2026-4423", patient: "Khalid Al-Otaibi", mrn: "MRN-10236", drug: "Amoxicillin 500mg", route: "PO", freq: "TID", qty: 21, status: "verified", priority: "routine", doctor: "Dr. Al-Ghamdi", cds: null, dept: "General Medicine" },
  { id: "RX-2026-4424", patient: "Sara Al-Ghamdi", mrn: "MRN-10237", drug: "Morphine 10mg/mL", route: "IV", freq: "PRN", qty: 10, status: "dispensed", priority: "stat", doctor: "Dr. Al-Rashid", cds: null, dept: "Oncology", controlled: true },
  { id: "RX-2026-4425", patient: "Mohammed Al-Harbi", mrn: "MRN-10238", drug: "Atorvastatin 40mg", route: "PO", freq: "ON", qty: 30, status: "new", priority: "routine", doctor: "Dr. Al-Zahrani", cds: null, dept: "Internal Medicine" },
  { id: "RX-2026-4426", patient: "Noura Al-Shehri", mrn: "MRN-10239", drug: "Insulin Glargine 100IU/mL", route: "SC", freq: "OD", qty: 5, status: "verified", priority: "urgent", doctor: "Dr. Al-Otaibi", cds: null, dept: "Endocrinology" },
];

const INVENTORY = [
  { name: "Metformin 1000mg", stock: 2400, unit: "tabs", threshold: 200, status: "ok" },
  { name: "Atorvastatin 40mg", stock: 1850, unit: "tabs", threshold: 200, status: "ok" },
  { name: "Amoxicillin 500mg", stock: 340, unit: "caps", threshold: 300, status: "warn" },
  { name: "Warfarin 5mg", stock: 120, unit: "tabs", threshold: 150, status: "low" },
  { name: "Morphine 10mg/mL", stock: 48, unit: "vials", threshold: 20, status: "ok" },
  { name: "Insulin Glargine", stock: 32, unit: "pens", threshold: 30, status: "warn" },
];

const STATUS_META: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  new:       { label: "Pending Verification", cls: "bg-amber-500/20 text-amber-400", icon: <Clock className="w-3 h-3" /> },
  verified:  { label: "Verified", cls: "bg-blue-500/20 text-blue-400", icon: <CheckCircle2 className="w-3 h-3" /> },
  dispensed: { label: "Dispensed", cls: "bg-emerald-500/20 text-emerald-400", icon: <PackageCheck className="w-3 h-3" /> },
  on_hold:   { label: "On Hold", cls: "bg-red-500/20 text-red-400", icon: <XCircle className="w-3 h-3" /> },
};

export default function PharmacyPage() {
  const [queue, setQueue] = useState(QUEUE);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = queue.filter(rx => {
    const q = search.toLowerCase();
    const match = !q || rx.patient.toLowerCase().includes(q) || rx.drug.toLowerCase().includes(q) || rx.id.includes(q);
    const matchF = filter === "all" || rx.status === filter;
    return match && matchF;
  });

  function verify(id: string) {
    setQueue(prev => prev.map(rx => rx.id === id ? { ...rx, status: "verified" } : rx));
  }
  function dispense(id: string) {
    setQueue(prev => prev.map(rx => rx.id === id ? { ...rx, status: "dispensed" } : rx));
  }
  function hold(id: string) {
    setQueue(prev => prev.map(rx => rx.id === id ? { ...rx, status: "on_hold" } : rx));
  }

  const stats = {
    pending: queue.filter(r => r.status === "new").length,
    cdsAlerts: queue.filter(r => r.cds).length,
    verified: queue.filter(r => r.status === "verified").length,
    dispensed: queue.filter(r => r.status === "dispensed").length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pharmacy — Dispensing Workflow</h1>
          <p className="text-slate-400 text-sm mt-0.5">CPOE • CDS Verification • Controlled Drugs • Inventory</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 text-sm px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition">
          <RefreshCw className="w-4 h-4" /> Refresh Queue
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Pending Verification", value: stats.pending, color: "from-amber-500 to-orange-600", icon: Clock },
          { label: "CDS Alerts", value: stats.cdsAlerts, color: "from-red-500 to-rose-600", icon: ShieldAlert },
          { label: "Verified / Ready", value: stats.verified, color: "from-blue-500 to-indigo-600", icon: CheckCircle2 },
          { label: "Dispensed Today", value: stats.dispensed, color: "from-emerald-500 to-teal-600", icon: PackageCheck },
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
        {/* Dispensing Queue */}
        <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              <Pill className="w-4 h-4 text-orange-400" /> Prescription Queue
            </h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="bg-slate-800 border border-slate-700 text-sm text-slate-300 pl-9 pr-4 py-2 rounded-xl w-44 outline-none focus:border-orange-500 placeholder:text-slate-600"
                />
              </div>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-sm text-slate-300 px-3 py-2 rounded-xl outline-none"
              >
                <option value="all">All</option>
                <option value="new">Pending</option>
                <option value="verified">Verified</option>
                <option value="dispensed">Dispensed</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-800/50">
            {filtered.map(rx => {
              const meta = STATUS_META[rx.status] ?? STATUS_META.new;
              return (
                <div key={rx.id} className={`p-4 hover:bg-slate-800/40 transition ${rx.cds ? "border-l-2 border-red-500" : ""}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-slate-500">{rx.id}</span>
                        {rx.controlled && (
                          <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-2 py-0.5 rounded-full">
                            ⚠ Controlled
                          </span>
                        )}
                        {rx.priority === "stat" && (
                          <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                            STAT
                          </span>
                        )}
                        {rx.priority === "urgent" && (
                          <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">
                            URGENT
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {rx.patient.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{rx.patient}</p>
                          <p className="text-xs text-slate-500">{rx.mrn} • {rx.dept} • {rx.doctor}</p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-orange-400 shrink-0" />
                        <span className="font-semibold text-orange-300">{rx.drug}</span>
                        <span className="text-slate-500 text-sm">{rx.route} • {rx.freq} • Qty: {rx.qty}</span>
                      </div>

                      {rx.cds && (
                        <div className="mt-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 flex items-start gap-2">
                          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <p className="text-red-300 text-xs font-medium">{rx.cds.msg}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.cls}`}>
                        {meta.icon}{meta.label}
                      </span>
                      <div className="flex gap-1.5">
                        {rx.status === "new" && !rx.cds && (
                          <button onClick={() => verify(rx.id)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                            Verify
                          </button>
                        )}
                        {rx.status === "new" && rx.cds && (
                          <button onClick={() => hold(rx.id)} className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                            Hold
                          </button>
                        )}
                        {rx.status === "verified" && (
                          <button onClick={() => dispense(rx.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                            <PackageCheck className="w-3 h-3" /> Dispense
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" /> Drug Inventory
          </h3>
          <div className="space-y-3">
            {INVENTORY.map(item => (
              <div key={item.name} className={`p-3 rounded-xl border ${item.status === "low" ? "border-red-500/30 bg-red-500/5" : item.status === "warn" ? "border-amber-500/30 bg-amber-500/5" : "border-slate-800 bg-slate-800/30"}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-300 text-sm font-medium">{item.name}</span>
                  <span className={`text-xs font-bold ${item.status === "low" ? "text-red-400" : item.status === "warn" ? "text-amber-400" : "text-emerald-400"}`}>
                    {item.status === "low" ? "LOW STOCK" : item.status === "warn" ? "REORDER" : "OK"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.status === "low" ? "bg-red-500" : item.status === "warn" ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(100, (item.stock / (item.threshold * 10)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{item.stock} {item.unit}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-semibold py-2 rounded-xl transition">
            Generate Purchase Order
          </button>
        </div>
      </div>
    </div>
  );
}
