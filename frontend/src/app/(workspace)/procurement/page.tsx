"use client";
import { useState } from "react";
import { ShoppingCart, Truck, CheckCircle2, Clock, AlertTriangle, FileText, Package, TrendingDown } from "lucide-react";

const KPIS = [
  { label: "Open Requisitions", value: "18", sub: "Awaiting approval", icon: FileText, color: "from-blue-500 to-indigo-600" },
  { label: "Active POs", value: "34", sub: "SAR 2.1M total value", icon: ShoppingCart, color: "from-orange-500 to-amber-600" },
  { label: "Pending GRNs", value: "9", sub: "Awaiting receipt", icon: Truck, color: "from-purple-500 to-violet-600" },
  { label: "Avg Lead Time", value: "4.2 days", sub: "Approved vendors", icon: Clock, color: "from-emerald-500 to-teal-600" },
];

const REQUISITIONS = [
  { id: "PR-202606-A1B2C3", dept: "ICU", items: 6, total: 84500, date: "2026-06-14", status: "approved", urgency: "normal" },
  { id: "PR-202606-D4E5F6", dept: "Pharmacy", items: 12, total: 210000, date: "2026-06-15", status: "submitted", urgency: "urgent" },
  { id: "PR-202606-G7H8I9", dept: "Laboratory", items: 4, total: 32000, date: "2026-06-15", status: "draft", urgency: "normal" },
  { id: "PR-202606-J1K2L3", dept: "Surgery", items: 8, total: 156000, date: "2026-06-13", status: "approved", urgency: "stat" },
];

const PURCHASE_ORDERS = [
  { id: "PO-202606-XX1", vendor: "Al-Dawaa Medical Supplies", items: 6, total: 97175, date: "2026-06-14", delivery: "2026-06-18", status: "sent" },
  { id: "PO-202606-XX2", vendor: "IQVIA Arabia", items: 12, total: 241500, date: "2026-06-15", delivery: "2026-06-20", status: "approved" },
  { id: "PO-202606-XX3", vendor: "Integrated Gulf Biosystems", items: 4, total: 36800, date: "2026-06-13", delivery: "2026-06-17", status: "partial" },
];

const VENDORS = [
  { name: "Al-Dawaa Medical Supplies", cr: "1010123456", score: 4.8, terms: "Net 30", status: "Approved" },
  { name: "IQVIA Arabia", cr: "1010234567", score: 4.6, terms: "Net 45", status: "Approved" },
  { name: "Integrated Gulf Biosystems", cr: "1010345678", score: 4.2, terms: "Net 30", status: "Approved" },
  { name: "Medi Gulf Trading", cr: "1010456789", score: 3.9, terms: "Net 15", status: "Pending" },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-700 text-slate-300",
  submitted: "bg-blue-900/50 text-blue-400",
  approved: "bg-emerald-900/50 text-emerald-400",
  rejected: "bg-red-900/50 text-red-400",
  sent: "bg-indigo-900/50 text-indigo-400",
  partial: "bg-amber-900/50 text-amber-400",
  received: "bg-emerald-900/50 text-emerald-400",
};

const URGENCY_COLORS: Record<string, string> = {
  normal: "text-slate-400",
  urgent: "text-amber-400",
  stat: "text-red-400",
};

const TABS = ["Requisitions", "Purchase Orders", "Vendors"];

export default function ProcurementPage() {
  const [tab, setTab] = useState(0);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Procurement</h1>
            <p className="text-slate-400 text-sm mt-1">Requisitions · Purchase Orders · GRN · Vendors</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <FileText className="w-4 h-4" /> New Requisition
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
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Purchase Requisitions</div>
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50">
                <tr className="text-xs text-slate-400 uppercase tracking-wider">
                  <th className="text-left p-3">PR #</th>
                  <th className="text-left p-3">Department</th>
                  <th className="text-right p-3">Items</th>
                  <th className="text-right p-3">Est. Value</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {REQUISITIONS.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 text-xs font-mono text-slate-400">{r.id}</td>
                    <td className="p-3">
                      <span className="text-white">{r.dept}</span>
                      <span className={`ml-2 text-xs font-medium ${URGENCY_COLORS[r.urgency]}`}>{r.urgency !== "normal" ? r.urgency.toUpperCase() : ""}</span>
                    </td>
                    <td className="p-3 text-right text-slate-300">{r.items}</td>
                    <td className="p-3 text-right text-slate-300">SAR {r.total.toLocaleString()}</td>
                    <td className="p-3 text-slate-400">{r.date}</td>
                    <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[r.status]}`}>{r.status}</span></td>
                    <td className="p-3">
                      {r.status === "submitted" && (
                        <button className="text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">Approve</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Purchase Orders</div>
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50">
                <tr className="text-xs text-slate-400 uppercase tracking-wider">
                  <th className="text-left p-3">PO #</th>
                  <th className="text-left p-3">Vendor</th>
                  <th className="text-right p-3">Total (SAR)</th>
                  <th className="text-left p-3">Order Date</th>
                  <th className="text-left p-3">Delivery</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {PURCHASE_ORDERS.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 text-xs font-mono text-slate-400">{p.id}</td>
                    <td className="p-3 text-white">{p.vendor}</td>
                    <td className="p-3 text-right text-slate-300">{p.total.toLocaleString()}</td>
                    <td className="p-3 text-slate-400">{p.date}</td>
                    <td className="p-3 text-slate-400">{p.delivery}</td>
                    <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[p.status]}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 2 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Approved Vendor List</div>
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50">
                <tr className="text-xs text-slate-400 uppercase tracking-wider">
                  <th className="text-left p-3">Vendor</th>
                  <th className="text-left p-3">CR Number</th>
                  <th className="text-center p-3">Score</th>
                  <th className="text-left p-3">Terms</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {VENDORS.map((v) => (
                  <tr key={v.name} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 text-white font-medium">{v.name}</td>
                    <td className="p-3 text-xs font-mono text-slate-400">{v.cr}</td>
                    <td className="p-3 text-center">
                      <span className={`text-sm font-bold ${v.score >= 4.5 ? "text-emerald-400" : v.score >= 4.0 ? "text-amber-400" : "text-red-400"}`}>
                        {v.score}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{v.terms}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${v.status === "Approved" ? "bg-emerald-900/50 text-emerald-400" : "bg-amber-900/50 text-amber-400"}`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
