"use client";
import { useState } from "react";
import { ShoppingCart, Truck, Clock, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { useERP, procurement } from "@/lib/erp";

interface PurchaseOrder {
  id: number;
  name: string;
  partner_id?: [number, string];
  date_order: string;
  amount_total: number;
  state: string;
}

interface Vendor {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  vat?: string;
  country_id?: [number, string];
}

const TABS = ["Requisitions", "Purchase Orders", "Vendors"];

const STATE_COLORS: Record<string, string> = {
  draft: "bg-slate-700 text-slate-300",
  sent: "bg-blue-900/50 text-blue-400",
  to_approve: "bg-amber-900/50 text-amber-400",
  purchase: "bg-emerald-900/50 text-emerald-400",
  done: "bg-emerald-900/50 text-emerald-400",
  cancel: "bg-red-900/50 text-red-400",
};

export default function ProcurementPage() {
  const [tab, setTab] = useState(0);

  const pos = useERP<PurchaseOrder[]>(() => procurement.purchaseOrders());
  const vendors = useERP<Vendor[]>(() => procurement.vendors());

  const draftPOs = (pos.data ?? []).filter(p => p.state === 'draft' || p.state === 'sent').length;
  const activePOs = (pos.data ?? []).filter(p => p.state === 'purchase').length;
  const totalValue = (pos.data ?? []).filter(p => p.state === 'purchase').reduce((s, p) => s + p.amount_total, 0);

  const KPIS = [
    { label: "Open Requisitions", value: String(draftPOs), sub: "Awaiting approval", icon: FileText, color: "from-blue-500 to-indigo-600" },
    { label: "Active POs", value: String(activePOs), sub: `SAR ${(totalValue / 1e6).toFixed(1)}M total`, icon: ShoppingCart, color: "from-orange-500 to-amber-600" },
    { label: "Pending GRNs", value: "—", sub: "Awaiting receipt", icon: Truck, color: "from-purple-500 to-violet-600" },
    { label: "Active Vendors", value: String(vendors.data?.length ?? 0), sub: "Approved", icon: Clock, color: "from-emerald-500 to-teal-600" },
  ];

  const handleConfirm = async (id: number) => {
    try { await procurement.confirmPO(id); await pos.refresh(); }
    catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Procurement</h1>
            <p className="text-slate-400 text-sm mt-1">Requisitions · Purchase Orders · GRN · Vendors</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
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
              className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === i ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"}`}>{t}</button>
          ))}
        </div>

        {(tab === 0 || tab === 1) && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">{tab === 0 ? "Purchase Requisitions" : "Purchase Orders"}</div>
            {pos.isLoading ? <div className="p-12 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></div> : (
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50 text-xs text-slate-400 uppercase">
                  <tr><th className="text-left p-3">Reference</th><th className="text-left p-3">Vendor</th><th className="text-left p-3">Date</th><th className="text-right p-3">Total</th><th className="text-left p-3">Status</th><th className="text-left p-3">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(pos.data ?? []).filter(p => tab === 0 ? ['draft', 'sent', 'to_approve'].includes(p.state) : p.state === 'purchase' || p.state === 'done').map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono text-xs text-slate-400">{p.name}</td>
                      <td className="p-3 text-white">{p.partner_id?.[1] ?? "—"}</td>
                      <td className="p-3 text-slate-400">{p.date_order?.split(' ')[0]}</td>
                      <td className="p-3 text-right text-slate-300">SAR {p.amount_total.toLocaleString()}</td>
                      <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${STATE_COLORS[p.state] ?? STATE_COLORS.draft}`}>{p.state}</span></td>
                      <td className="p-3">{p.state === 'sent' || p.state === 'to_approve' ? <button onClick={() => handleConfirm(p.id)} className="text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"><CheckCircle2 className="w-3 h-3 inline mr-1"/>Approve</button> : null}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 2 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Approved Vendor List</div>
            {vendors.isLoading ? <div className="p-12 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></div> : (
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50 text-xs text-slate-400 uppercase">
                  <tr><th className="text-left p-3">Vendor</th><th className="text-left p-3">Email</th><th className="text-left p-3">Phone</th><th className="text-left p-3">VAT</th><th className="text-left p-3">Country</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(vendors.data ?? []).map((v) => (
                    <tr key={v.id} className="hover:bg-slate-800/30">
                      <td className="p-3 text-white font-medium">{v.name}</td>
                      <td className="p-3 text-slate-400 text-xs">{v.email ?? "—"}</td>
                      <td className="p-3 text-slate-400 text-xs">{v.phone ?? "—"}</td>
                      <td className="p-3 font-mono text-xs text-slate-400">{v.vat ?? "—"}</td>
                      <td className="p-3 text-slate-400">{v.country_id?.[1] ?? "—"}</td>
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
