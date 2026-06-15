"use client";
import { useState } from "react";
import { BookOpen, TrendingUp, TrendingDown, DollarSign, FileText, RefreshCw, CheckCircle2, AlertTriangle, BarChart3 } from "lucide-react";

const KPIS = [
  { label: "Total Revenue MTD", value: "SAR 4.2M", sub: "+8.3% vs last month", icon: TrendingUp, color: "from-emerald-500 to-teal-600" },
  { label: "Total Expenses MTD", value: "SAR 3.1M", sub: "74% of revenue", icon: TrendingDown, color: "from-red-500 to-rose-600" },
  { label: "Net Profit MTD", value: "SAR 1.1M", sub: "26% margin", icon: DollarSign, color: "from-orange-500 to-amber-600" },
  { label: "Unposted Journals", value: "4", sub: "Pending approval", icon: FileText, color: "from-amber-500 to-orange-600" },
];

const JOURNALS = [
  { id: "JE-202606-A1B2C3", date: "2026-06-14", description: "Monthly payroll — June 2026", source: "payroll", status: "posted", debit: 1240000, credit: 1240000 },
  { id: "JE-202606-D4E5F6", date: "2026-06-13", description: "Pharmacy inventory receipt — PO-202606-XX1", source: "inventory", status: "posted", debit: 84500, credit: 84500 },
  { id: "JE-202606-G7H8I9", date: "2026-06-15", description: "Insurance AR — NPHIES batch 2026-06-14", source: "billing", status: "draft", debit: 380000, credit: 380000 },
  { id: "JE-202606-J1K2L3", date: "2026-06-15", description: "Medical equipment depreciation — June", source: "assets", status: "draft", debit: 42000, credit: 42000 },
];

const AP_AGING = [
  { bucket: "Current", amount: 284000, color: "bg-emerald-500" },
  { bucket: "1–30 days", amount: 142000, color: "bg-yellow-500" },
  { bucket: "31–60 days", amount: 68000, color: "bg-orange-500" },
  { bucket: "60+ days", amount: 21000, color: "bg-red-500" },
];

const AR_AGING = [
  { bucket: "Current", amount: 920000, color: "bg-emerald-500" },
  { bucket: "1–30 days", amount: 410000, color: "bg-yellow-500" },
  { bucket: "31–60 days", amount: 180000, color: "bg-orange-500" },
  { bucket: "60+ days", amount: 74000, color: "bg-red-500" },
];

const TRIAL_BALANCE = [
  { code: "1001", name: "Cash and Bank", type: "Asset", debit: 2840000, credit: 0 },
  { code: "1100", name: "Accounts Receivable", type: "Asset", debit: 1584000, credit: 0 },
  { code: "2001", name: "Accounts Payable", type: "Liability", debit: 0, credit: 515000 },
  { code: "4001", name: "Patient Revenue", type: "Income", debit: 0, credit: 4200000 },
  { code: "5001", name: "Salaries & Benefits", type: "Expense", debit: 1860000, credit: 0 },
  { code: "5100", name: "Supplies & Consumables", type: "Expense", debit: 840000, credit: 0 },
  { code: "5200", name: "Depreciation", type: "Expense", debit: 42000, credit: 0 },
];

const TABS = ["Journals", "Trial Balance", "AP Aging", "AR Aging"];

export default function AccountingPage() {
  const [tab, setTab] = useState(0);
  const totalAP = AP_AGING.reduce((s, r) => s + r.amount, 0);
  const totalAR = AR_AGING.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Accounting & Finance</h1>
            <p className="text-slate-400 text-sm mt-1">General Ledger · AP · AR · Financial Statements</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <BookOpen className="w-4 h-4" /> New Journal
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
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Journal Entries</div>
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50">
                <tr className="text-xs text-slate-400 uppercase tracking-wider">
                  <th className="text-left p-3">Entry #</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-left p-3">Source</th>
                  <th className="text-right p-3">Debit</th>
                  <th className="text-right p-3">Credit</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {JOURNALS.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 text-xs text-slate-400 font-mono">{j.id}</td>
                    <td className="p-3 text-slate-300">{j.date}</td>
                    <td className="p-3 text-white">{j.description}</td>
                    <td className="p-3"><span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">{j.source}</span></td>
                    <td className="p-3 text-right text-slate-300">SAR {j.debit.toLocaleString()}</td>
                    <td className="p-3 text-right text-slate-300">SAR {j.credit.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit ${j.status === "posted" ? "bg-emerald-900/50 text-emerald-400" : "bg-amber-900/50 text-amber-400"}`}>
                        {j.status === "posted" ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {j.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Trial Balance — June 2026</div>
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50">
                <tr className="text-xs text-slate-400 uppercase tracking-wider">
                  <th className="text-left p-3">Code</th>
                  <th className="text-left p-3">Account</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-right p-3">Debit (SAR)</th>
                  <th className="text-right p-3">Credit (SAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {TRIAL_BALANCE.map((r) => (
                  <tr key={r.code} className="hover:bg-slate-800/30">
                    <td className="p-3 text-xs text-slate-500 font-mono">{r.code}</td>
                    <td className="p-3 text-white">{r.name}</td>
                    <td className="p-3 text-xs text-slate-400">{r.type}</td>
                    <td className="p-3 text-right text-slate-300">{r.debit ? r.debit.toLocaleString() : "—"}</td>
                    <td className="p-3 text-right text-slate-300">{r.credit ? r.credit.toLocaleString() : "—"}</td>
                  </tr>
                ))}
                <tr className="bg-slate-800/50 font-bold">
                  <td colSpan={3} className="p-3 text-white text-right">Totals</td>
                  <td className="p-3 text-right text-orange-400">{TRIAL_BALANCE.reduce((s,r)=>s+r.debit,0).toLocaleString()}</td>
                  <td className="p-3 text-right text-orange-400">{TRIAL_BALANCE.reduce((s,r)=>s+r.credit,0).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {[2, 3].includes(tab) && (() => {
          const data = tab === 2 ? AP_AGING : AR_AGING;
          const total = tab === 2 ? totalAP : totalAR;
          const label = tab === 2 ? "Accounts Payable Aging" : "Accounts Receivable Aging";
          return (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="font-semibold text-white mb-4">{label}</div>
              <div className="space-y-4">
                {data.map((r) => (
                  <div key={r.bucket}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{r.bucket}</span>
                      <span className="text-white font-medium">SAR {r.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${r.color} rounded-full`} style={{ width: `${(r.amount / total) * 100}%` }} />
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold">
                  <span className="text-slate-300">Total Outstanding</span>
                  <span className="text-white">SAR {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
