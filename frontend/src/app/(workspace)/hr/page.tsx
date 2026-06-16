"use client";
import { useState } from "react";
import { Users, Calendar, Award, Clock, UserPlus, AlertCircle, Loader2 } from "lucide-react";
import { useERP, hr } from "@/lib/erp";

interface Employee {
  id: number;
  name: string;
  job_title?: string;
  department_id?: [number, string];
  work_email?: string;
}

interface LeaveRequest {
  id: number;
  employee_id: [number, string];
  holiday_status_id: [number, string];
  date_from: string;
  date_to: string;
  number_of_days: number;
  state: string;
}

const TABS = ["Staff Directory", "Duty Roster", "Leave Requests", "Training & Certs"];

const STATE_LABELS: Record<string, string> = {
  draft: "Draft",
  confirm: "Pending",
  validate: "Approved",
  refuse: "Refused",
  cancel: "Cancelled",
};

const STATE_COLORS: Record<string, string> = {
  draft: "bg-slate-700/50 text-slate-300",
  confirm: "bg-amber-900/50 text-amber-400",
  validate: "bg-emerald-900/50 text-emerald-400",
  refuse: "bg-red-900/50 text-red-400",
  cancel: "bg-slate-700/50 text-slate-400",
};

export default function HRPage() {
  const [tab, setTab] = useState(0);

  const employees = useERP<Employee[]>(() => hr.employees());
  const leaves = useERP<LeaveRequest[]>(() => hr.leaveRequests());

  const onDuty = employees.data?.length ?? 0;
  const pendingLeave = leaves.data?.filter(l => l.state === 'confirm').length ?? 0;

  const KPIS = [
    { label: "Total Staff", value: String(employees.data?.length ?? 0), sub: "Active headcount", icon: Users, color: "from-orange-500 to-amber-600" },
    { label: "On Duty Today", value: String(onDuty), sub: `${employees.data?.length ? Math.round((onDuty / employees.data.length) * 100) : 0}% attendance`, icon: Clock, color: "from-blue-500 to-indigo-600" },
    { label: "Pending Leave", value: String(pendingLeave), sub: "Awaiting approval", icon: Calendar, color: "from-amber-500 to-orange-600" },
    { label: "Certs Expiring", value: "—", sub: "Training module", icon: AlertCircle, color: "from-red-500 to-rose-600" },
  ];

  const handleApprove = async (id: number) => {
    try { await hr.approveLeave(id); await leaves.refresh(); }
    catch (e) { console.error("Approve failed:", e); }
  };

  const handleRefuse = async (id: number) => {
    try { await hr.refuseLeave(id); await leaves.refresh(); }
    catch (e) { console.error("Refuse failed:", e); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Human Resources</h1>
            <p className="text-slate-400 text-sm mt-1">Staff lifecycle · Scheduling · Leave · Training</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <UserPlus className="w-4 h-4" /> Add Employee
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
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="font-semibold text-white">Staff Directory</span>
              <span className="text-xs text-slate-400">{employees.data?.length ?? 0} shown</span>
            </div>
            {employees.isLoading ? (
              <div className="p-12 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading from ERP…</div>
            ) : employees.error ? (
              <div className="p-12 text-center text-red-400">Could not reach ERP engine. Is the backend running?</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50">
                  <tr className="text-xs text-slate-400 uppercase tracking-wider">
                    <th className="text-left p-3">Employee</th>
                    <th className="text-left p-3">Job Title</th>
                    <th className="text-left p-3">Department</th>
                    <th className="text-left p-3">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(employees.data ?? []).map((e) => (
                    <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3">
                        <div className="font-medium text-white">{e.name}</div>
                        <div className="text-xs text-slate-500">EMP-{String(e.id).padStart(4, '0')}</div>
                      </td>
                      <td className="p-3 text-slate-300">{e.job_title || "—"}</td>
                      <td className="p-3 text-slate-300">{e.department_id?.[1] || "—"}</td>
                      <td className="p-3 text-slate-400 text-xs">{e.work_email || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 2 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Leave Requests</div>
            {leaves.isLoading ? (
              <div className="p-12 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading…</div>
            ) : (
              <div className="divide-y divide-slate-800">
                {(leaves.data ?? []).map((l) => (
                  <div key={l.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{l.employee_id[1]}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {l.holiday_status_id[1]} · {l.number_of_days} days · {l.date_from} → {l.date_to}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${STATE_COLORS[l.state] ?? STATE_COLORS.draft}`}>
                        {STATE_LABELS[l.state] ?? l.state}
                      </span>
                      {l.state === "confirm" && (
                        <>
                          <button onClick={() => handleApprove(l.id)} className="text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">Approve</button>
                          <button onClick={() => handleRefuse(l.id)} className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">Reject</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {(leaves.data ?? []).length === 0 && (
                  <div className="p-12 text-center text-slate-500">No leave requests yet</div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <div className="text-slate-400">Weekly roster calendar — drag-drop scheduling coming soon</div>
          </div>
        )}

        {tab === 3 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <div className="text-slate-400">Certification tracking via HR Skills module</div>
          </div>
        )}
      </div>
    </div>
  );
}
