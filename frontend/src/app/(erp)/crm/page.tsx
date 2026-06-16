"use client";
import { useState } from "react";
import { TrendingUp, DollarSign, Mail, Phone, Users, Loader2 } from "lucide-react";
import { useERP, crm } from "@/lib/erp";

interface Lead {
  id: number;
  name: string;
  partner_name?: string;
  email_from?: string;
  phone?: string;
  expected_revenue: number;
  stage_id?: [number, string];
  user_id?: [number, string];
}

interface Opportunity {
  id: number;
  name: string;
  partner_id?: [number, string];
  expected_revenue: number;
  probability: number;
  stage_id?: [number, string];
  date_deadline?: string;
}

const TABS = ["Leads", "Opportunities"];

export default function CRMPage() {
  const [tab, setTab] = useState(0);

  const leads = useERP<Lead[]>(() => crm.leads());
  const opps = useERP<Opportunity[]>(() => crm.opportunities());

  const pipeline = (opps.data ?? []).reduce((s, o) => s + (o.expected_revenue * (o.probability / 100)), 0);

  const KPIS = [
    { label: "Active Leads", value: String(leads.data?.length ?? 0), sub: "Top of funnel", icon: Users, color: "from-blue-500 to-indigo-600" },
    { label: "Open Opportunities", value: String(opps.data?.length ?? 0), sub: "Pipeline", icon: TrendingUp, color: "from-orange-500 to-amber-600" },
    { label: "Weighted Pipeline", value: `SAR ${(pipeline / 1e6).toFixed(2)}M`, sub: "Probability-adjusted", icon: DollarSign, color: "from-emerald-500 to-teal-600" },
    { label: "Conversion Rate", value: "—", sub: "Coming soon", icon: TrendingUp, color: "from-purple-500 to-violet-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Patient Relations / CRM</h1>
            <p className="text-slate-400 text-sm mt-1">Leads · Opportunities · Outreach · Patient Engagement</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Users className="w-4 h-4" /> Add Lead
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
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Leads</div>
            {leads.isLoading ? <div className="p-12 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></div> : (
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50 text-xs text-slate-400 uppercase">
                  <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Contact</th><th className="text-right p-3">Expected</th><th className="text-left p-3">Stage</th><th className="text-left p-3">Owner</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(leads.data ?? []).map((l) => (
                    <tr key={l.id} className="hover:bg-slate-800/30">
                      <td className="p-3">
                        <div className="text-white font-medium">{l.name}</div>
                        <div className="text-xs text-slate-500">{l.partner_name ?? "—"}</div>
                      </td>
                      <td className="p-3 text-xs">
                        {l.email_from && <div className="flex items-center gap-1 text-slate-400"><Mail className="w-3 h-3"/>{l.email_from}</div>}
                        {l.phone && <div className="flex items-center gap-1 text-slate-400 mt-1"><Phone className="w-3 h-3"/>{l.phone}</div>}
                      </td>
                      <td className="p-3 text-right text-emerald-400 font-medium">SAR {l.expected_revenue.toLocaleString()}</td>
                      <td className="p-3 text-slate-300">{l.stage_id?.[1] ?? "—"}</td>
                      <td className="p-3 text-slate-400 text-xs">{l.user_id?.[1] ?? "—"}</td>
                    </tr>
                  ))}
                  {(leads.data ?? []).length === 0 && <tr><td colSpan={5} className="p-12 text-center text-slate-500">No leads yet</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Opportunities</div>
            {opps.isLoading ? <div className="p-12 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></div> : (
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50 text-xs text-slate-400 uppercase">
                  <tr><th className="text-left p-3">Opportunity</th><th className="text-left p-3">Partner</th><th className="text-right p-3">Revenue</th><th className="text-center p-3">Probability</th><th className="text-left p-3">Deadline</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(opps.data ?? []).map((o) => (
                    <tr key={o.id} className="hover:bg-slate-800/30">
                      <td className="p-3 text-white">{o.name}</td>
                      <td className="p-3 text-slate-300">{o.partner_id?.[1] ?? "—"}</td>
                      <td className="p-3 text-right text-emerald-400 font-medium">SAR {o.expected_revenue.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-amber-400">{o.probability}%</span>
                      </td>
                      <td className="p-3 text-slate-400 text-xs">{o.date_deadline ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
