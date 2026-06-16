"use client";
import { useState } from "react";
import { Cpu, Wrench, AlertTriangle, CheckCircle2, QrCode, Loader2 } from "lucide-react";
import { useERP } from "@/lib/erp";
import { searchRead } from "@/lib/erp/client";

interface Asset {
  id: number;
  name: string;
  state?: string;
  original_value?: number;
  book_value?: number;
  acquisition_date?: string;
  asset_type?: string;
}

const TABS = ["Asset Register", "Maintenance", "Depreciation"];

const STATE_COLORS: Record<string, string> = {
  draft: "bg-slate-700/50 text-slate-400",
  open: "bg-emerald-900/50 text-emerald-400",
  close: "bg-blue-900/50 text-blue-400",
  paused: "bg-amber-900/50 text-amber-400",
};

export default function AssetsPage() {
  const [tab, setTab] = useState(0);

  const assets = useERP<Asset[]>(() =>
    searchRead<Asset>(
      'account.asset',
      [['state', '!=', 'draft']],
      ['name', 'state', 'original_value', 'book_value', 'acquisition_date', 'asset_type'],
      { order: 'acquisition_date desc', limit: 100 }
    ).catch(() => [])
  );

  const total = assets.data?.length ?? 0;
  const inService = (assets.data ?? []).filter(a => a.state === 'open').length;
  const totalCost = (assets.data ?? []).reduce((s, a) => s + (a.original_value ?? 0), 0);
  const bookValue = (assets.data ?? []).reduce((s, a) => s + (a.book_value ?? 0), 0);

  const KPIS = [
    { label: "Total Assets", value: String(total), sub: "Registered", icon: Cpu, color: "from-blue-500 to-indigo-600" },
    { label: "In Service", value: String(inService), sub: total ? `${Math.round((inService/total)*100)}% operational` : "—", icon: CheckCircle2, color: "from-emerald-500 to-teal-600" },
    { label: "Under Maintenance", value: String((assets.data ?? []).filter(a => a.state === 'paused').length), sub: "Downtime", icon: Wrench, color: "from-amber-500 to-orange-600" },
    { label: "Warranties Expiring", value: "—", sub: "Within 90 days", icon: AlertTriangle, color: "from-red-500 to-rose-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Fixed Assets</h1>
            <p className="text-slate-400 text-sm mt-1">Asset Register · Maintenance · Depreciation · AMC</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
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
              className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === i ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"}`}>{t}</button>
          ))}
        </div>

        {tab === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Asset Register</div>
            {assets.isLoading ? <div className="p-12 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></div> : (
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50 text-xs text-slate-400 uppercase">
                  <tr><th className="text-left p-3">Asset</th><th className="text-left p-3">Acquired</th><th className="text-right p-3">Cost (SAR)</th><th className="text-right p-3">Book Value</th><th className="text-left p-3">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(assets.data ?? []).map((a) => {
                    const ratio = a.original_value ? (a.book_value ?? 0) / a.original_value : 0;
                    return (
                      <tr key={a.id} className="hover:bg-slate-800/30">
                        <td className="p-3">
                          <div className="text-white font-medium">{a.name}</div>
                          <div className="text-xs text-slate-500">AST-{String(a.id).padStart(5, '0')}</div>
                        </td>
                        <td className="p-3 text-slate-400 text-xs">{a.acquisition_date ?? "—"}</td>
                        <td className="p-3 text-right text-slate-300">{(a.original_value ?? 0).toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <span className={`font-medium ${ratio > 0.7 ? "text-emerald-400" : ratio > 0.4 ? "text-amber-400" : "text-red-400"}`}>
                            {(a.book_value ?? 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${STATE_COLORS[a.state ?? 'draft']}`}>{a.state ?? "—"}</span></td>
                      </tr>
                    );
                  })}
                  {(assets.data ?? []).length === 0 && <tr><td colSpan={5} className="p-12 text-center text-slate-500">No assets registered yet</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <Wrench className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <div className="text-slate-400">Maintenance orders managed via Maintenance module</div>
          </div>
        )}

        {tab === 2 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">Total Asset Cost</div>
              <div className="text-xl font-bold text-white">SAR {(totalCost / 1e6).toFixed(1)}M</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">Net Book Value</div>
              <div className="text-xl font-bold text-emerald-400">SAR {(bookValue / 1e6).toFixed(1)}M</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">Accumulated Depreciation</div>
              <div className="text-xl font-bold text-amber-400">SAR {((totalCost - bookValue) / 1e6).toFixed(1)}M</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
