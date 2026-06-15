"use client";
import { useState } from "react";
import { Package, AlertTriangle, Thermometer, RotateCcw, TrendingDown, ArrowRightLeft, Scan } from "lucide-react";

const KPIS = [
  { label: "Total SKUs", value: "3,841", sub: "Active items", icon: Package, color: "from-blue-500 to-indigo-600" },
  { label: "Low Stock Alerts", value: "23", sub: "Below reorder point", icon: AlertTriangle, color: "from-red-500 to-rose-600" },
  { label: "Near Expiry", value: "47", sub: "Expiring in 30 days", icon: TrendingDown, color: "from-amber-500 to-orange-600" },
  { label: "Inventory Value", value: "SAR 8.4M", sub: "At cost across all stores", icon: Scan, color: "from-emerald-500 to-teal-600" },
];

const STOCK = [
  { sku: "MED-001234", name: "Amoxicillin 500mg Capsules", category: "Medication", store: "Main Pharmacy", qty: 2840, unit: "Caps", expiry: "2027-03-01", reorder: 500, status: "ok" },
  { sku: "MED-002891", name: "Insulin Glargine 100U/ml", category: "Medication", store: "Pharmacy Satellite ICU", qty: 48, unit: "Pens", expiry: "2026-08-15", reorder: 100, status: "low" },
  { sku: "CON-001102", name: "Surgical Gloves Sterile Size 7.5", category: "Consumable", store: "Theatre Store", qty: 1200, unit: "Pairs", expiry: "2028-01-01", reorder: 300, status: "ok" },
  { sku: "VAC-000021", name: "Pfizer-BioNTech COVID-19 Vaccine", category: "Vaccine", store: "Cold Chain Store", qty: 0, unit: "Vials", expiry: "2026-09-01", reorder: 50, status: "stockout" },
  { sku: "REA-003312", name: "Troponin I High Sensitivity Kit", category: "Reagent", store: "Laboratory Store", qty: 84, unit: "Tests", expiry: "2026-07-01", reorder: 100, status: "low" },
  { sku: "CON-004201", name: "IV Cannula 18G", category: "Consumable", store: "Main Store", qty: 4200, unit: "Pcs", expiry: "2029-06-01", reorder: 1000, status: "ok" },
];

const MOVEMENTS = [
  { id: "MV-001", type: "receive", item: "Amoxicillin 500mg", qty: 500, from: "—", to: "Main Pharmacy", ref: "GRN-202606-XX1", time: "10:24" },
  { id: "MV-002", type: "issue", item: "IV Cannula 18G", qty: 20, from: "Main Store", to: "Ward 3B", ref: "ENC-2026-0892", time: "10:41" },
  { id: "MV-003", type: "transfer", item: "Insulin Glargine", qty: 12, from: "Main Pharmacy", to: "Satellite ICU", ref: "TRF-202606-001", time: "11:02" },
  { id: "MV-004", type: "disposal", item: "Pfizer COVID Vaccine (expired)", qty: 24, from: "Cold Chain Store", to: "—", ref: "DISP-202606-001", time: "11:30" },
];

const ALERTS = [
  { type: "low_stock", item: "Insulin Glargine 100U/ml", store: "Satellite ICU", qty: 48, threshold: 100, urgency: "high" },
  { type: "low_stock", item: "Troponin I HS Kit", store: "Laboratory", qty: 84, threshold: 100, urgency: "high" },
  { type: "near_expiry", item: "Insulin Glargine 100U/ml", store: "Satellite ICU", qty: 48, expiry: "2026-08-15", urgency: "medium" },
  { type: "stockout", item: "Pfizer COVID Vaccine", store: "Cold Chain Store", qty: 0, threshold: 50, urgency: "critical" },
];

const STATUS_COLORS: Record<string, string> = {
  ok: "bg-emerald-900/50 text-emerald-400",
  low: "bg-amber-900/50 text-amber-400",
  stockout: "bg-red-900/50 text-red-400",
};

const MOVE_COLORS: Record<string, string> = {
  receive: "text-emerald-400",
  issue: "text-blue-400",
  transfer: "text-purple-400",
  disposal: "text-red-400",
};

const TABS = ["Stock Levels", "Movements", "Alerts"];

export default function InventoryPage() {
  const [tab, setTab] = useState(0);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
            <p className="text-slate-400 text-sm mt-1">Stock Levels · Movements · Alerts · FEFO Tracking</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <ArrowRightLeft className="w-4 h-4" /> Record Movement
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
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Current Stock</div>
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50">
                <tr className="text-xs text-slate-400 uppercase tracking-wider">
                  <th className="text-left p-3">SKU</th>
                  <th className="text-left p-3">Item</th>
                  <th className="text-left p-3">Store</th>
                  <th className="text-right p-3">Qty</th>
                  <th className="text-right p-3">Reorder</th>
                  <th className="text-left p-3">Expiry</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {STOCK.map((s) => (
                  <tr key={s.sku} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 text-xs font-mono text-slate-400">{s.sku}</td>
                    <td className="p-3">
                      <div className="text-white font-medium">{s.name}</div>
                      <div className="text-xs text-slate-500">{s.category}</div>
                    </td>
                    <td className="p-3 text-slate-300 text-xs">{s.store}</td>
                    <td className="p-3 text-right">
                      <span className={`font-bold ${s.qty === 0 ? "text-red-400" : s.qty < s.reorder ? "text-amber-400" : "text-white"}`}>
                        {s.qty}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">{s.unit}</span>
                    </td>
                    <td className="p-3 text-right text-slate-400 text-xs">{s.reorder}</td>
                    <td className="p-3 text-slate-400 text-xs">{s.expiry}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Today's Movements</div>
            <div className="divide-y divide-slate-800">
              {MOVEMENTS.map((m) => (
                <div key={m.id} className="p-4 flex items-center gap-4">
                  <span className={`text-xs font-bold uppercase w-16 ${MOVE_COLORS[m.type]}`}>{m.type}</span>
                  <div className="flex-1">
                    <div className="text-white font-medium">{m.item}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{m.from} → {m.to} · Ref: {m.ref}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">{m.qty} units</div>
                    <div className="text-xs text-slate-500">{m.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 2 && (
          <div className="space-y-3">
            {ALERTS.map((a, i) => (
              <div key={i} className={`bg-slate-900 border rounded-xl p-4 flex items-center justify-between ${
                a.urgency === "critical" ? "border-red-500/50" : a.urgency === "high" ? "border-amber-500/30" : "border-slate-800"
              }`}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                    a.urgency === "critical" ? "text-red-400" : a.urgency === "high" ? "text-amber-400" : "text-yellow-400"
                  }`} />
                  <div>
                    <div className="font-medium text-white">{a.item}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{a.store} · {a.type.replace("_", " ")}</div>
                    {"qty" in a && <div className="text-xs text-slate-500">Current: {a.qty} {a.threshold ? `· Threshold: ${a.threshold}` : ""}</div>}
                  </div>
                </div>
                <button className="text-xs px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 border border-orange-500/30 rounded-lg transition-colors">
                  Auto-Requisition
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
