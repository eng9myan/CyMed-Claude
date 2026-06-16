"use client";
import { useState } from "react";
import { DollarSign, Users, Calculator, Clock, Loader2 } from "lucide-react";
import { useERP, hr } from "@/lib/erp";

interface Employee {
  id: number;
  name: string;
  job_title?: string;
  department_id?: [number, string];
}

const TABS = ["Payroll Runs", "Salary Details", "EOSB"];

const SAR_FX = 1.0;
const DEFAULT_BASIC = 14000;

export default function PayrollPage() {
  const [tab, setTab] = useState(0);

  const employees = useERP<Employee[]>(() => hr.employees());

  const headcount = employees.data?.length ?? 0;
  const grossEstimate = headcount * (DEFAULT_BASIC + 7000) * SAR_FX;
  const gosi = grossEstimate * 0.1175;
  const eosbAccrual = grossEstimate * 0.5;

  const KPIS = [
    { label: "Total Payroll MTD", value: `SAR ${(grossEstimate / 1e6).toFixed(2)}M`, sub: `${headcount} employees`, icon: DollarSign, color: "from-orange-500 to-amber-600" },
    { label: "GOSI Contribution", value: `SAR ${(gosi / 1000).toFixed(0)}K`, sub: "11.75% employer share", icon: Users, color: "from-blue-500 to-indigo-600" },
    { label: "Pending Approval", value: "1", sub: "Current month run", icon: Clock, color: "from-amber-500 to-orange-600" },
    { label: "EOSB Accrual", value: `SAR ${(eosbAccrual / 1e6).toFixed(2)}M`, sub: "Cumulative liability", icon: Calculator, color: "from-purple-500 to-violet-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Payroll</h1>
            <p className="text-slate-400 text-sm mt-1">Monthly Runs · Salary Structures · EOSB · WPS</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
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
              className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === i ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"}`}>{t}</button>
          ))}
        </div>

        {tab === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <Calculator className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <div className="text-slate-400">Run a new payroll cycle to see entries here</div>
            <button className="mt-4 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              <Calculator className="w-4 h-4" /> Run Current Month
            </button>
          </div>
        )}

        {tab === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="font-semibold text-white">Employees on Payroll</span>
              <span className="text-xs text-slate-400">{headcount} staff · all amounts SAR</span>
            </div>
            {employees.isLoading ? <div className="p-12 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></div> : (
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50 text-xs text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="text-left p-3">Employee</th>
                    <th className="text-left p-3">Role</th>
                    <th className="text-left p-3">Department</th>
                    <th className="text-right p-3">Basic</th>
                    <th className="text-right p-3">Allowances</th>
                    <th className="text-right p-3">Est. Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(employees.data ?? []).map((e) => (
                    <tr key={e.id} className="hover:bg-slate-800/30">
                      <td className="p-3">
                        <div className="font-medium text-white">{e.name}</div>
                        <div className="text-xs text-slate-500">EMP-{String(e.id).padStart(4, '0')}</div>
                      </td>
                      <td className="p-3 text-slate-300">{e.job_title ?? "—"}</td>
                      <td className="p-3 text-slate-300">{e.department_id?.[1] ?? "—"}</td>
                      <td className="p-3 text-right text-slate-300">{DEFAULT_BASIC.toLocaleString()}</td>
                      <td className="p-3 text-right text-slate-300">7,000</td>
                      <td className="p-3 text-right font-bold text-emerald-400">{((DEFAULT_BASIC + 7000) * 0.88).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 2 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">End-of-Service Benefits</div>
            <div className="p-12 text-center text-slate-400">
              <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <div>EOSB calculated per Saudi Labour Law Article 84</div>
              <div className="text-xs text-slate-500 mt-2">⅓ month/year (years 2–5) · ⅔ month/year (years 5–10) · 1 month/year (10+ years)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
