"use client";
import { useState } from "react";
import { Users, Calendar, ClipboardList, Award, Clock, TrendingUp, UserPlus, AlertCircle } from "lucide-react";

const STAFF = [
  { id: "EMP-001", name: "Dr. Ahmed Al-Rashid", role: "Physician", dept: "Internal Medicine", status: "Active", shift: "Morning", leave: null },
  { id: "EMP-002", name: "Nurse Fatima Al-Zahra", role: "Nurse", dept: "ICU", status: "Active", shift: "Night", leave: null },
  { id: "EMP-003", name: "Dr. Khalid Al-Otaibi", role: "Surgeon", dept: "Surgery", status: "On Leave", shift: "—", leave: "Annual" },
  { id: "EMP-004", name: "Sara Al-Ghamdi", role: "Pharmacist", dept: "Pharmacy", status: "Active", shift: "Evening", leave: null },
  { id: "EMP-005", name: "Mohammed Al-Harbi", role: "Lab Technician", dept: "Laboratory", status: "Active", shift: "Morning", leave: null },
];

const LEAVE_REQUESTS = [
  { id: "LV-001", employee: "Dr. Khalid Al-Otaibi", type: "Annual", days: 14, from: "2026-06-20", to: "2026-07-04", status: "approved" },
  { id: "LV-002", employee: "Nurse Hanan Al-Dosari", type: "Sick", days: 3, from: "2026-06-15", to: "2026-06-17", status: "pending" },
  { id: "LV-003", employee: "Sara Al-Ghamdi", type: "Emergency", days: 1, from: "2026-06-16", to: "2026-06-16", status: "pending" },
];

const TRAINING_DUE = [
  { name: "BLS Recertification", employee: "Nurse Fatima Al-Zahra", due: "2026-07-01", urgent: true },
  { name: "ACLS Renewal", employee: "Dr. Ahmed Al-Rashid", due: "2026-07-15", urgent: false },
  { name: "Fire Safety", employee: "Mohammed Al-Harbi", due: "2026-08-01", urgent: false },
];

const KPIS = [
  { label: "Total Staff", value: "284", sub: "Active headcount", icon: Users, color: "from-orange-500 to-amber-600" },
  { label: "On Duty Today", value: "198", sub: "69.7% attendance rate", icon: Clock, color: "from-blue-500 to-indigo-600" },
  { label: "Pending Leave", value: "7", sub: "Requests awaiting approval", icon: Calendar, color: "from-amber-500 to-orange-600" },
  { label: "Certs Expiring", value: "12", sub: "Within 30 days", icon: AlertCircle, color: "from-red-500 to-rose-600" },
];

const TABS = ["Staff Directory", "Duty Roster", "Leave Requests", "Training & Certs"];

export default function HRPage() {
  const [tab, setTab] = useState(0);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Human Resources</h1>
            <p className="text-slate-400 text-sm mt-1">Staff lifecycle · Scheduling · Leave · Training</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <UserPlus className="w-4 h-4" /> Add Employee
          </button>
        </div>

        {/* KPIs */}
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

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === i ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Staff Directory */}
        {tab === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="font-semibold text-white">Staff Directory</span>
              <span className="text-xs text-slate-400">{STAFF.length} shown</span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50">
                <tr className="text-xs text-slate-400 uppercase tracking-wider">
                  <th className="text-left p-3">Employee</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Department</th>
                  <th className="text-left p-3">Shift</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {STAFF.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <div className="font-medium text-white">{s.name}</div>
                      <div className="text-xs text-slate-500">{s.id}</div>
                    </td>
                    <td className="p-3 text-slate-300">{s.role}</td>
                    <td className="p-3 text-slate-300">{s.dept}</td>
                    <td className="p-3 text-slate-400">{s.shift}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${s.status === "Active" ? "bg-emerald-900/50 text-emerald-400" : "bg-amber-900/50 text-amber-400"}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Leave Requests */}
        {tab === 2 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Leave Requests</div>
            <div className="divide-y divide-slate-800">
              {LEAVE_REQUESTS.map((l) => (
                <div key={l.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">{l.employee}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{l.type} · {l.days} days · {l.from} → {l.to}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${l.status === "approved" ? "bg-emerald-900/50 text-emerald-400" : "bg-amber-900/50 text-amber-400"}`}>
                      {l.status}
                    </span>
                    {l.status === "pending" && (
                      <>
                        <button className="text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">Approve</button>
                        <button className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">Reject</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Training */}
        {tab === 3 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Certifications Due</div>
            <div className="divide-y divide-slate-800">
              {TRAINING_DUE.map((t, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className={`w-5 h-5 ${t.urgent ? "text-red-400" : "text-amber-400"}`} />
                    <div>
                      <div className="font-medium text-white">{t.name}</div>
                      <div className="text-xs text-slate-400">{t.employee}</div>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${t.urgent ? "text-red-400" : "text-amber-400"}`}>Due {t.due}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roster placeholder */}
        {tab === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <div className="text-slate-400">Weekly roster calendar — drag-drop scheduling coming soon</div>
          </div>
        )}
      </div>
    </div>
  );
}
