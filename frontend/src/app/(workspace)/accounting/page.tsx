"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { useERP, finance } from "@/lib/erp";

interface JournalEntry {
  id: number;
  name: string;
  date: string;
  partner_id?: [number, string];
  amount_total: number;
  state: string;
  move_type: string;
}

interface APInvoice {
  id: number;
  name: string;
  partner_id?: [number, string];
  invoice_date: string;
  amount_total: number;
  payment_state: string;
  state: string;
}

interface ARInvoice extends APInvoice {}

const TABS = ["Journals", "Trial Balance", "AP Aging", "AR Aging"];

const STATE_COLORS: Record<string, string> = {
  draft: "bg-amber-900/50 text-amber-400",
  posted: "bg-emerald-900/50 text-emerald-400",
  cancel: "bg-slate-700/50 text-slate-400",
  paid: "bg-emerald-900/50 text-emerald-400",
  partial: "bg-blue-900/50 text-blue-400",
  not_paid: "bg-red-900/50 text-red-400",
};

function StateBadge({ state }: { state: string }) {
  return <span className={`text-xs px-2 py-1 rounded-full ${STATE_COLORS[state] ?? STATE_COLORS.draft}`}>{state.replace("_", " ")}</span>;
}

export default function AccountingPage() {
  const [tab, setTab] = useState(0);

  const journals = useERP<JournalEntry[]>(() => finance.journalEntries());
  const apInvoices = useERP<APInvoice[]>(() => finance.apInvoices());
  const arInvoices = useERP<ARInvoice[]>(() => finance.arInvoices());
  const accounts = useERP(() => finance.accounts());

  const revenue = (arInvoices.data ?? []).filter(i => i.state === 'posted').reduce((s, i) => s + i.amount_total, 0);
  const expenses = (apInvoices.data ?? []).filter(i => i.state === 'posted').reduce((s, i) => s + i.amount_total, 0);
  const unposted = (journals.data ?? []).filter(j => j.state === 'draft').length;

  const KPIS = [
    { label: "Revenue MTD", value: `SAR ${(revenue / 1000).toFixed(0)}K`, sub: `${(arInvoices.data ?? []).length} invoices`, icon: TrendingUp, color: "from-emerald-500 to-teal-600" },
    { label: "Expenses MTD", value: `SAR ${(expenses / 1000).toFixed(0)}K`, sub: `${(apInvoices.data ?? []).length} bills`, icon: TrendingDown, color: "from-red-500 to-rose-600" },
    { label: "Net Profit MTD", value: `SAR ${((revenue - expenses) / 1000).toFixed(0)}K`, sub: revenue ? `${Math.round(((revenue - expenses) / revenue) * 100)}% margin` : "—", icon: DollarSign, color: "from-orange-500 to-amber-600" },
    { label: "Unposted Journals", value: String(unposted), sub: "Pending approval", icon: FileText, color: "from-amber-500 to-orange-600" },
  ];

  const handlePost = async (id: number) => {
    try { await finance.postEntry(id); await journals.refresh(); }
    catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Accounting</h1>
            <p className="text-slate-400 text-sm mt-1">Journals · Trial Balance · AP/AR · Bank Reconciliation</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <FileText className="w-4 h-4" /> New Journal Entry
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
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Journal Entries</div>
            {journals.isLoading ? <div className="p-12 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/>Loading…</div> : journals.error ? <div className="p-12 text-center text-red-400">Cannot reach ERP engine</div> : (
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50 text-xs text-slate-400 uppercase tracking-wider">
                  <tr><th className="text-left p-3">Reference</th><th className="text-left p-3">Date</th><th className="text-left p-3">Partner</th><th className="text-right p-3">Amount</th><th className="text-left p-3">Status</th><th className="text-left p-3">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(journals.data ?? []).map((j) => (
                    <tr key={j.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono text-xs text-slate-400">{j.name}</td>
                      <td className="p-3 text-slate-400">{j.date}</td>
                      <td className="p-3 text-slate-300">{j.partner_id?.[1] ?? "—"}</td>
                      <td className="p-3 text-right text-white">SAR {j.amount_total.toLocaleString()}</td>
                      <td className="p-3"><StateBadge state={j.state}/></td>
                      <td className="p-3">{j.state === 'draft' && <button onClick={() => handlePost(j.id)} className="text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"><CheckCircle2 className="w-3 h-3 inline mr-1"/>Post</button>}</td>
                    </tr>
                  ))}
                  {(journals.data ?? []).length === 0 && <tr><td colSpan={6} className="p-12 text-center text-slate-500">No journal entries</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Chart of Accounts</div>
            {accounts.isLoading ? <div className="p-12 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></div> : (
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50 text-xs text-slate-400 uppercase">
                  <tr><th className="text-left p-3">Code</th><th className="text-left p-3">Account</th><th className="text-left p-3">Type</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(accounts.data as { id: number; code: string; name: string; account_type: string }[] ?? []).map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono text-xs text-slate-400">{a.code}</td>
                      <td className="p-3 text-white">{a.name}</td>
                      <td className="p-3 text-slate-400">{a.account_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 2 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Accounts Payable</div>
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50 text-xs text-slate-400 uppercase">
                <tr><th className="text-left p-3">Bill #</th><th className="text-left p-3">Vendor</th><th className="text-left p-3">Date</th><th className="text-right p-3">Amount</th><th className="text-left p-3">Payment</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(apInvoices.data ?? []).map((i) => (
                  <tr key={i.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-xs text-slate-400">{i.name}</td>
                    <td className="p-3 text-white">{i.partner_id?.[1] ?? "—"}</td>
                    <td className="p-3 text-slate-400">{i.invoice_date}</td>
                    <td className="p-3 text-right text-white">SAR {i.amount_total.toLocaleString()}</td>
                    <td className="p-3"><StateBadge state={i.payment_state || 'not_paid'}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 3 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-semibold text-white">Accounts Receivable</div>
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50 text-xs text-slate-400 uppercase">
                <tr><th className="text-left p-3">Invoice #</th><th className="text-left p-3">Patient/Payer</th><th className="text-left p-3">Date</th><th className="text-right p-3">Amount</th><th className="text-left p-3">Payment</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(arInvoices.data ?? []).map((i) => (
                  <tr key={i.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-xs text-slate-400">{i.name}</td>
                    <td className="p-3 text-white">{i.partner_id?.[1] ?? "—"}</td>
                    <td className="p-3 text-slate-400">{i.invoice_date}</td>
                    <td className="p-3 text-right text-emerald-400 font-medium">SAR {i.amount_total.toLocaleString()}</td>
                    <td className="p-3"><StateBadge state={i.payment_state || 'not_paid'}/></td>
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
