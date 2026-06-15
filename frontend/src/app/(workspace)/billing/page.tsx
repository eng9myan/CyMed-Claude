"use client";

import { useState, useEffect, useRef } from "react";
import {
  DollarSign, FileText, TrendingUp, AlertTriangle, CheckCircle2,
  Search, Filter, RefreshCw, Send, Clock, XCircle, ChevronDown,
  Zap, Building2, Receipt, CreditCard, ArrowUpRight, BarChart3,
} from "lucide-react";

const DEMO_CLAIMS = [
  { id: "CLM-2026-001", mrn: "MRN-10234", patient: "Ahmed Al-Rashid", encounter: "ED-2026-0412", icd11: "5A11", icd10: "E11.9", desc: "Type 2 Diabetes", cpt: "99284", fee: 1850, insurance: "Bupa Arabia", payer_id: "BUPA-SA", status: "ready", days: 0 },
  { id: "CLM-2026-002", mrn: "MRN-10235", patient: "Fatima Al-Zahra", encounter: "IP-2026-0108", icd11: "BA80", icd10: "I21.3", desc: "Acute MI (NSTEMI)", cpt: "93571", fee: 18500, insurance: "Tawuniya", payer_id: "TAWN-SA", status: "pending_auth", days: 2 },
  { id: "CLM-2026-003", mrn: "MRN-10236", patient: "Khalid Al-Otaibi", encounter: "OP-2026-0523", icd11: "JA00", icd10: "J06.9", desc: "Upper Respiratory Infection", cpt: "99213", fee: 450, insurance: "MedGulf", payer_id: "MEDG-SA", status: "submitted", days: 5 },
  { id: "CLM-2026-004", mrn: "MRN-10237", patient: "Sara Al-Ghamdi", encounter: "IP-2026-0089", icd11: "CA40", icd10: "C50.912", desc: "Breast Cancer", cpt: "19301", fee: 32000, insurance: "AXA Cooperative", payer_id: "AXA-SA", status: "denied", days: 14, denial: "CO-4 - Service not covered under plan" },
  { id: "CLM-2026-005", mrn: "MRN-10238", patient: "Mohammed Al-Harbi", encounter: "ED-2026-0391", icd11: "8B20", icd10: "I63.9", desc: "Cerebral Infarction", cpt: "99285", fee: 4200, insurance: "Walaa Insurance", payer_id: "WALA-SA", status: "paid", days: 22, paid: 3780 },
  { id: "CLM-2026-006", mrn: "MRN-10239", patient: "Noura Al-Shehri", encounter: "OP-2026-0601", icd11: "5B81", icd10: "E78.5", desc: "Hyperlipidemia", cpt: "99214", fee: 620, insurance: "BUPA Arabia", payer_id: "BUPA-SA", status: "ready", days: 0 },
  { id: "CLM-2026-007", mrn: "MRN-10240", patient: "Abdullah Al-Dosari", encounter: "IP-2026-0122", icd11: "GB04", icd10: "N18.4", desc: "Chronic Kidney Disease Stg4", cpt: "90935", fee: 8800, insurance: "Tawuniya", payer_id: "TAWN-SA", status: "submitted", days: 8 },
];

const AR_AGING = [
  { bucket: "0–30 days", amount: 284500, count: 42, color: "bg-emerald-500" },
  { bucket: "31–60 days", amount: 138200, count: 21, color: "bg-yellow-500" },
  { bucket: "61–90 days", amount: 72100, count: 14, color: "bg-orange-500" },
  { bucket: "91–120 days", amount: 31400, count: 8, color: "bg-red-400" },
  { bucket: "120+ days", amount: 18700, count: 5, color: "bg-red-700" },
];

const KPIS = [
  { label: "Gross Charges MTD", value: "SAR 2.84M", sub: "+12.4% vs last month", icon: TrendingUp, color: "from-orange-500 to-amber-600" },
  { label: "Net Collections", value: "SAR 2.31M", sub: "81.3% collection rate", icon: DollarSign, color: "from-emerald-500 to-teal-600" },
  { label: "Denied Claims", value: "3.2%", sub: "↓ 0.8% from last month", icon: XCircle, color: "from-red-500 to-rose-600" },
  { label: "Avg Days to Pay", value: "14.7 days", sub: "NPHIES electronic claims", icon: Clock, color: "from-blue-500 to-indigo-600" },
];

const STATUS_META: Record<string, { label: string; cls: string }> = {
  ready:        { label: "Ready to Submit", cls: "bg-blue-100 text-blue-700" },
  pending_auth: { label: "Pending Pre-Auth", cls: "bg-amber-100 text-amber-700" },
  submitted:    { label: "Submitted", cls: "bg-indigo-100 text-indigo-700" },
  denied:       { label: "Denied", cls: "bg-red-100 text-red-700" },
  paid:         { label: "Paid", cls: "bg-emerald-100 text-emerald-700" },
};

export default function BillingPage() {
  const [claims, setClaims] = useState(DEMO_CLAIMS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedClaim, setSelectedClaim] = useState<typeof DEMO_CLAIMS[0] | null>(null);
  const [aiAppeal, setAiAppeal] = useState("");
  const [appealLoading, setAppealLoading] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const totalAR = AR_AGING.reduce((s, b) => s + b.amount, 0);

  const filtered = claims.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.patient.toLowerCase().includes(q) || c.id.includes(q) || c.icd10.includes(q);
    const matchS = filterStatus === "all" || c.status === filterStatus;
    return matchQ && matchS;
  });

  async function submitToNPHIES(claim: typeof DEMO_CLAIMS[0]) {
    setSubmitting(claim.id);
    await new Promise(r => setTimeout(r, 1800));
    setClaims(prev => prev.map(c => c.id === claim.id ? { ...c, status: "submitted", days: 0 } : c));
    setSubmitting(null);
  }

  async function generateAIAppeal(claim: typeof DEMO_CLAIMS[0]) {
    setSelectedClaim(claim);
    setAppealLoading(true);
    setAiAppeal("");
    await new Promise(r => setTimeout(r, 600));
    const text = `**AI-Generated Appeal Letter — ${new Date().toLocaleDateString()}**\n\nDear ${claim.insurance} Medical Review Team,\n\nWe are writing to formally appeal the denial of claim ${claim.id} for patient ${claim.patient} (MRN: ${claim.mrn}) for services rendered on encounter ${claim.encounter}.\n\n**Denial Reason:** ${claim.denial}\n\n**Clinical Justification:**\nThe procedure (CPT ${claim.cpt}) was medically necessary for the management of ${claim.desc} (ICD-10: ${claim.icd10} / ICD-11: ${claim.icd11}). The treating physician documented clinical indicators meeting the established criteria per Saudi MoH Clinical Practice Guidelines.\n\n**Supporting Evidence:**\n• Patient presented with documented symptoms consistent with ${claim.desc}\n• Laboratory results within the encounter record confirm clinical necessity\n• Treatment aligns with CBAHI-accredited clinical pathways\n• NPHIES pre-authorization was obtained (if applicable)\n\n**Regulatory Basis:**\nPer the Unified Health Insurance Conditions and Standards (UHICS) Article 8, paragraph 3, insurers must cover medically necessary services. We respectfully request that the denial be reversed and the claim of SAR ${claim.fee.toLocaleString()} be processed for reimbursement.\n\nThis appeal was prepared with AI assistance (CyMed AI Gateway) and reviewed by the Revenue Cycle team.\n\nSincerely,\nRevenue Cycle Management — CyMed Health System`;
    setAiAppeal(text);
    setAppealLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Revenue Cycle Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">NPHIES • ZATCA Phase 2 • AI-Powered Denial Appeals</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm px-4 py-2 rounded-xl transition">
            <RefreshCw className="w-4 h-4" /> Sync NPHIES
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 text-sm px-4 py-2 rounded-xl font-semibold transition hover:opacity-90">
            <Send className="w-4 h-4" /> Batch Submit
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {KPIS.map(kpi => (
          <div key={kpi.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-5`} />
            <div className="relative">
              <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${kpi.color} mb-3`}>
                <kpi.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{kpi.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{kpi.value}</p>
              <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />{kpi.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* AR Aging */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-orange-400" /> AR Aging Analysis
          </h3>
          <div className="space-y-3">
            {AR_AGING.map(b => (
              <div key={b.bucket}>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{b.bucket}</span>
                  <span className="text-slate-300 font-medium">SAR {(b.amount / 1000).toFixed(0)}K ({b.count} claims)</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${b.color} rounded-full`} style={{ width: `${(b.amount / totalAR) * 100}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-800 flex justify-between text-sm">
              <span className="text-slate-400">Total AR</span>
              <span className="font-bold text-white">SAR {(totalAR / 1000).toFixed(0)}K</span>
            </div>
          </div>
        </div>

        {/* Payer Mix */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" /> Payer Mix
          </h3>
          <div className="space-y-2.5">
            {[
              { name: "Bupa Arabia", pct: 34, color: "bg-blue-500" },
              { name: "Tawuniya", pct: 28, color: "bg-indigo-500" },
              { name: "MedGulf", pct: 16, color: "bg-violet-500" },
              { name: "AXA Cooperative", pct: 12, color: "bg-purple-500" },
              { name: "Other Insurers", pct: 7, color: "bg-slate-500" },
              { name: "Self-Pay / OSHC", pct: 3, color: "bg-orange-500" },
            ].map(p => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="w-24 text-xs text-slate-400 shrink-0">{p.name}</div>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.pct}%` }} />
                </div>
                <span className="text-xs text-slate-300 w-8 text-right">{p.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* ZATCA Compliance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" /> ZATCA Phase 2 Status
          </h3>
          <div className="space-y-3">
            {[
              { label: "e-Invoices Generated", value: "1,284", status: "ok" },
              { label: "Cryptographic Stamp", value: "Active", status: "ok" },
              { label: "CSID Status", value: "Valid", status: "ok" },
              { label: "QR Code Compliance", value: "100%", status: "ok" },
              { label: "Pending Clearance", value: "12", status: "warn" },
              { label: "Last Sync", value: "2m ago", status: "ok" },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">{item.label}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.status === "ok" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold py-2 rounded-xl transition">
            Generate Invoice XML
          </button>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="font-semibold text-slate-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-400" /> Claims Worklist
          </h3>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search patient, claim ID, ICD..."
                className="bg-slate-800 border border-slate-700 text-sm text-slate-300 pl-9 pr-4 py-2 rounded-xl w-60 outline-none focus:border-orange-500 placeholder:text-slate-600"
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-sm text-slate-300 px-3 py-2 rounded-xl outline-none"
            >
              <option value="all">All Status</option>
              <option value="ready">Ready to Submit</option>
              <option value="pending_auth">Pending Pre-Auth</option>
              <option value="submitted">Submitted</option>
              <option value="denied">Denied</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Claim ID</th>
                <th className="text-left px-5 py-3">Patient</th>
                <th className="text-left px-5 py-3">Diagnosis</th>
                <th className="text-left px-5 py-3">ICD-10 → ICD-11</th>
                <th className="text-left px-5 py-3">Payer</th>
                <th className="text-right px-5 py-3">Amount (SAR)</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map(claim => {
                const meta = STATUS_META[claim.status];
                return (
                  <tr key={claim.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-slate-300">{claim.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-200">{claim.patient}</div>
                      <div className="text-xs text-slate-500">{claim.mrn}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-300">{claim.desc}</div>
                      <div className="text-xs text-slate-500">CPT {claim.cpt}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">{claim.icd10}</span>
                        <span className="text-slate-600">→</span>
                        <span className="font-mono text-xs bg-blue-900/50 px-2 py-0.5 rounded text-blue-300">{claim.icd11}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-sm">{claim.insurance}</td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-bold text-slate-200">{claim.fee.toLocaleString()}</span>
                      {claim.paid && (
                        <div className="text-xs text-emerald-400">{claim.paid.toLocaleString()} paid</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.cls}`}>
                        {meta.label}
                      </span>
                      {claim.days > 0 && <div className="text-xs text-slate-600 mt-0.5">{claim.days}d</div>}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {claim.status === "ready" && (
                          <button
                            onClick={() => submitToNPHIES(claim)}
                            disabled={submitting === claim.id}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                          >
                            {submitting === claim.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                            Submit
                          </button>
                        )}
                        {claim.status === "denied" && (
                          <button
                            onClick={() => generateAIAppeal(claim)}
                            className="bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition hover:opacity-90 flex items-center gap-1"
                          >
                            <Zap className="w-3 h-3" /> AI Appeal
                          </button>
                        )}
                        {(claim.status === "submitted" || claim.status === "paid") && (
                          <span className="text-slate-600 text-xs">
                            {claim.status === "paid" ? <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" /> : <Clock className="w-4 h-4 text-indigo-400 inline" />}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Appeal Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-400" /> AI Denial Appeal Generator
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">{selectedClaim.id} — {selectedClaim.patient}</p>
              </div>
              <button onClick={() => setSelectedClaim(null)} className="text-slate-500 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950 rounded-xl p-4 font-mono text-sm text-slate-300 whitespace-pre-wrap min-h-[300px]">
              {appealLoading ? (
                <div className="flex items-center gap-3 text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
                  Generating appeal with Claude AI…
                </div>
              ) : aiAppeal}
            </div>

            {!appealLoading && aiAppeal && (
              <div className="flex gap-3 mt-4">
                <button className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold py-2.5 rounded-xl text-sm hover:opacity-90 transition flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Submit Appeal to NPHIES
                </button>
                <button className="px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 py-2.5 rounded-xl text-sm transition">
                  Copy
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
