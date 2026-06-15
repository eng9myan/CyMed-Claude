"use client";
import { useState } from "react";
import { Cpu, Wrench, AlertTriangle, CheckCircle2, TrendingDown, Calendar, QrCode, BarChart3 } from "lucide-react";

const KPIS = [
  { label: "Total Assets", value: "1,284", sub: "Registered in system", icon: Cpu, color: "from-blue-500 to-indigo-600" },
  { label: "In Service", value: "1,198", sub: "93.3% operational", icon: CheckCircle2, color: "from-emerald-500 to-teal-600" },
  { label: "Under Maintenance", value: "71", sub: "5.5% downtime", icon: Wrench, color: "from-amber-500 to-orange-600" },
  { label: "Warranties Expiring", value: "14", sub: "Within 90 days", icon: AlertTriangle, color: "from-red-500 to-rose-600" },
];

const ASSETS = [
  { tag: "AST-00142", name: "Siemens Healthineers CT Scanner", category: "Imaging", dept: "Radiology", cost: 4200000, book: 2940000, status: "in_service", next_maint: "2026-08-01" },
  { tag: "AST-00089", name: "Philips IntelliVue MX800 Monitor", category: "Monitoring", dept: "ICU", cost: 85000, book: 42500, status: "in_service", next_maint: "2026-07-15" },
  { tag: "AST-00231", name: "GE Healthcare Ventilator CARESCAPE R860", category: "Life Support", dept: "ICU", cost: 320000, book: 224000, status: "maintenance", next_maint: "2026-06-16" },
  { tag: "AST-00301", name: "Roche Cobas 8000 Analyzer", category: "Lab Equipment", dept: "Laboratory", cost: 1800000, book: 1440000, status: "in_service", next_maint: "2026-09-01" },
  { tag: "AST-00412", name: "Olympus Endoscopy Tower", category: "Surgical", dept: "Surgery", cost: 650000, book: 520000, status: "in_service", next_maint: "2026-10-01" },
];

const MAINTENANCE = [
  { id: "MO-001", asset: "GE Ventilator CARESCAPE R860", type: "corrective", tech: "BioMed Dept", scheduled: "2026-06-16", status: "in_progress", cost: 0 },
  { id: "MO-002", asset: "Siemens CT Scanner", type: "preventive", tech: "Siemens FSE", scheduled: "2026-08-01", status: "open", cost: 0 },
  { id: "MO-003", asset: "Philips MX800 Monitor", type: "calibration", tech: "Philips Service", scheduled: "2026-07-15", status: "open", cost: 0 },
  { id: "MO-004", asset: "Roche Cobas 8000", type: "preventive", tech: "Roche Engineer", scheduled: "2026-09-01", status: "open", cost: 0 },
];

const DEP_SUMMARY = [
  { category: "Imaging Equipment", total_cost: 8400000, accumulated: 2940000, book_value: 5460000 },
  { category: "Monitoring Equipment", total_cost: 1200000, accumulated: 480000, book_value: 720000 },
  { category: "Lab Equipment", total_cost: 3600000, accumulated: 720000, book_value: 2880000 },
  { category: "Surgical Equipment", total_cost: 2100000, accumulated: 420000, book_value: 1680000 },
  { category: "Life Support", total_cost: 960000, accumulated: 192000, book_value: 768000 },
];

const STATUS_COLORS: Record<string, string> = {
  in_service: "bg-emerald-900/50 text-emerald-400",
  maintenance: "bg-amber-900/50 text-amber-400",
  decommissioned: "bg-slate-700 text-slate-400",
  open: "bg-blue-900/50 text-blue-400",
  in_progress: "bg-amber-900/50 text-amber-400",
  completed: "bg-emerald-900/50 text-emerald-400",
};

const TYPE_COLORS: Record<string, string> = {
  preventive: "text-blue-400",
  corrective: "text-red-400",
  calibration: "text-purple-400",
};

const TABS = ["Asset Register", "Maintenance", "Depreciation"];

export default function AssetsPage() {
  const [tab, setTab] = useState(0);
  const totalCost = DEP_SUMMARY.reduce((s, r) => s + r.total_cost, 0);
  const totalBook = DEP_SUMMARY.reduce((s, r) => s + r.book_value, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Fixed Assets</h1>
            <p className="text-slate-400 text-sm mt-1">Asset Register · Maintenance · Depreciation · AMC</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <QrCode className="w-4 h-4" /> Register Asset
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPIS.map((k) => (
            <div key={k.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${k.color} flex items-center justify-center mb-3`}>
                <k.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{k.value}</div>
              <div className="text-xs text-slate-400 mt-1">{k.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{k.sub}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === i ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Asset Register</div>
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50">
                <tr className="text-xs text-slate-400 uppercase tracking-wider">
                  <th className="text-left p-3">Tag</th>
                  <th className="text-left p-3">Asset</th>
                  <th className="text-left p-3">Department</th>
                  <th className="text-right p-3">Cost (SAR)</th>
                  <th className="text-right p-3">Book Value</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Next Maint.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ASSETS.map((a) => (
                  <tr key={a.tag} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 text-xs font-mono text-slate-400">{a.tag}</td>
                    <td className="p-3">
                      <div className="text-white font-medium">{a.name}</div>
                      <div className="text-xs text-slate-500">{a.category}</div>
                    </td>
                    <td className="p-3 text-slate-300">{a.dept}</td>
                    <td className="p-3 text-right text-slate-300">{a.cost.toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <span className={`font-medium ${(a.book / a.cost) > 0.7 ? "text-emerald-400" : (a.book / a.cost) > 0.4 ? "text-amber-400" : "text-red-400"}`}>
                        {a.book.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[a.status]}`}>
                        {a.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 text-xs">{a.next_maint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Maintenance Orders</div>
            <div className="divide-y divide-slate-800">
              {MAINTENANCE.map((m) => (
                <div key={m.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Wrench className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-white">{m.asset}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        <span className={`font-medium ${TYPE_COLORS[m.type]}`}>{m.type}</span>
                        {" · "}{m.tech}{" · "}Scheduled {m.scheduled}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[m.status]}`}>
                    {m.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <div className="text-xs text-slate-400 mb-1">Total Asset Cost</div>
                <div className="text-xl font-bold text-white">SAR {(totalCost / 1e6).toFixed(1)}M</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <div className="text-xs text-slate-400 mb-1">Net Book Value</div>
                <div className="text-xl font-bold text-emerald-400">SAR {(totalBook / 1e6).toFixed(1)}M</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <div className="text-xs text-slate-400 mb-1">Accumulated Depreciation</div>
                <div className="text-xl font-bold text-amber-400">SAR {((totalCost - totalBook) / 1e6).toFixed(1)}M</div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 font-semibold text-white">Depreciation by Category</div>
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50">
                  <tr className="text-xs text-slate-400 uppercase tracking-wider">
                    <th className="text-left p-3">Category</th>
                    <th className="text-right p-3">Cost (SAR)</th>
                    <th className="text-right p-3">Accumulated</th>
                    <th className="text-right p-3">Book Value</th>
                    <th className="text-left p-3 w-32">% Depreciated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {DEP_SUMMARY.map((r) => {
                    const pct = Math.round((r.accumulated / r.total_cost) * 100);
                    return (
                      <tr key={r.category} className="hover:bg-slate-800/30">
                        <td className="p-3 text-white">{r.category}</td>
                        <td className="p-3 text-right text-slate-300">{r.total_cost.toLocaleString()}</td>
                        <td className="p-3 text-right text-amber-400">{r.accumulated.toLocaleString()}</td>
                        <td className="p-3 text-right text-emerald-400">{r.book_value.toLocaleString()}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-slate-400 w-8">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
