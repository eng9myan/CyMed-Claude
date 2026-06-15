"use client";
import { useState } from "react";
import { DollarSign, Users, Calculator, FileText, CheckCircle2, Clock, TrendingUp, Download } from "lucide-react";

const KPIS = [
  { label: "Total Payroll MTD", value: "SAR 4.82M", sub: "284 employees", icon: DollarSign, color: "from-orange-500 to-amber-600" },
  { label: "GOSI Contribution", value: "SAR 386K", sub: "11.75% employer + 9.75% employee", icon: TrendingUp, color: "from-blue-500 to-indigo-600" },
  { label: "Pending Approval", value: "1", sub: "June 2026 run", icon: Clock, color: "from-amber-500 to-orange-600" },
  { label: "EOSB Accrual", value: "SAR 1.2M", sub: "Cumulative liability", icon: Calculator, color: "from-purple-500 to-violet-600" },
];

const PAYROLL_RUNS = [
  { period: "June 2026", staff: 284, gross: 4820000, deductions: 668000, net: 4152000, status: "draft", created: "2026-06-15" },
  { period: "May 2026", staff: 282, gross: 4780000, deductions: 663000, net: 4117000, status: "paid", created: "2026-05-15" },
  { period: "April 2026", staff: 280, gross: 4710000, deductions: 654000, net: 4056000, status: "paid", created: "2026-04-15" },
];

const ENTRIES = [
  { id: "EMP-001", name: "Dr. Ahmed Al-Rashid", role: "Physician", basic: 28000, allowances: 14000, overtime: 2100, deductions: 3108, net: 40992 },
  { id: "EMP-002", name: "Nurse Fatima Al-Zahra", role: "Nurse", basic: 14000, allowances: 7000, overtime: 1050, deductions: 1554, net: 20496 },
  { id: "EMP-004", name: "Sara Al-Ghamdi", role: "Pharmacist", basic: 18000, allowances: 9000, overtime: 0, deductions: 1755, net: 25245 },
  { id: "EMP-005", name: "Mohammed Al-Harbi", role: "Lab Tech", basic: 12000, allowances: 6000, overtime: 900, deductions: 1287, net: 17613 },
];

const EOSB_RECORDS = [
  { name: "Khalid Al-Dosari", role: "Nurse", years: 7.5, basic: 15000, amount: 112500, reason: "resignation", status: "pending" },
  { name: "Abdullah Al-Shehri", role: "Admin", years: 12.2, basic: 20000, amount: 244000, reason: "retirement", status: "approved" },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-amber-900/50 text-amber-400",
  approved: "bg-blue-900/50 text-blue-400",
  paid: "bg-emerald-900/50 text-emerald-400",
  pending: "bg-amber-900/50 text-amber-400",
};

const TABS = ["Payroll Runs", "Salary Details", "EOSB"];

export default function PayrollPage() {
  const [tab, setTab] = useState(0);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Payroll</h1>
            <p className="text-slate-400 text-sm mt-1">Monthly Runs · Salary Structures · EOSB · WPS</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Calculator className="w-4 h-4" /> Run Payroll
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
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Payroll Runs</div>
            <div className="divide-y divide-slate-800">
              {PAYROLL_RUNS.map((r) => (
                <div key={r.period} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{r.period}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{r.staff} employees · Created {r.created}</div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <div className="text-xs text-slate-500">Gross</div>
                      <div className="text-sm font-medium text-white">SAR {(r.gross / 1000).toFixed(0)}K</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Deductions</div>
                      <div className="text-sm font-medium text-red-400">-SAR {(r.deductions / 1000).toFixed(0)}K</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Net</div>
                      <div className="text-sm font-bold text-emerald-400">SAR {(r.net / 1000).toFixed(0)}K</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                      {r.status === "draft" && (
                        <button className="text-xs px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">Approve</button>
                      )}
                      {r.status === "paid" && (
                        <button className="flex items-center gap-1 text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">
                          <Download className="w-3 h-3" /> WPS File
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="font-semibold text-white">June 2026 — Salary Details</span>
              <span className="text-xs text-slate-400">All amounts in SAR</span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50">
                <tr className="text-xs text-slate-400 uppercase tracking-wider">
                  <th className="text-left p-3">Employee</th>
                  <th className="text-right p-3">Basic</th>
                  <th className="text-right p-3">Allowances</th>
                  <th className="text-right p-3">Overtime</th>
                  <th className="text-right p-3">Deductions</th>
                  <th className="text-right p-3">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ENTRIES.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <div className="font-medium text-white">{e.name}</div>
                      <div className="text-xs text-slate-500">{e.role}</div>
                    </td>
                    <td className="p-3 text-right text-slate-300">{e.basic.toLocaleString()}</td>
                    <td className="p-3 text-right text-slate-300">{e.allowances.toLocaleString()}</td>
                    <td className="p-3 text-right text-blue-400">{e.overtime > 0 ? `+${e.overtime.toLocaleString()}` : "—"}</td>
                    <td className="p-3 text-right text-red-400">-{e.deductions.toLocaleString()}</td>
                    <td className="p-3 text-right font-bold text-emerald-400">{e.net.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 2 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">End-of-Service Benefits (EOSB)</div>
            <div className="divide-y divide-slate-800">
              {EOSB_RECORDS.map((r, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">{r.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {r.role} · {r.years} years · {r.reason} · Last basic: SAR {r.basic.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-slate-500">EOSB Amount</div>
                      <div className="font-bold text-orange-400">SAR {r.amount.toLocaleString()}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                    {r.status === "pending" && (
                      <button className="text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">Approve</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-800/30">
              <div className="text-xs text-slate-500">EOSB calculated per Saudi Labour Law Article 84: ⅓ month per year (yrs 2–5), ⅔ month per year (yrs 5–10), 1 month per year (10+ years)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
