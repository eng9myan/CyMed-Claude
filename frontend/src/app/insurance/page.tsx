"use client";

import { useState } from "react";
import {
  Shield, CheckCircle2, XCircle, Clock, AlertTriangle,
  Search, Plus, CreditCard, Users, BarChart3, FileText,
  RefreshCw, TrendingUp, TrendingDown, Filter,
  Camera, Send, RotateCcw, Banknote, Globe,
} from "lucide-react";

type PolicyStatus = "active" | "inactive" | "pending" | "terminated";
type ClaimStatus  = "draft" | "submitted" | "pending" | "paid" | "denied" | "partial" | "appealed";
type AuthStatus   = "draft" | "submitted" | "pending" | "approved" | "denied";

type Payer = {
  id: string; name: string; shortCode: string; country: string;
  standard: string; avgDays: number; denialRate: number;
  isActive: boolean;
};

type Policy = {
  id: string; patient: string; mrn: string;
  payerName: string; planName: string; memberID: string;
  priority: "primary"|"secondary"; status: PolicyStatus;
  effectiveDate: string; deductibleMet: number; deductibleTotal: number;
  oopMet: number; oopTotal: number; copayPCP: number;
};

type Claim = {
  id: string; claimNumber: string; patient: string; payer: string;
  serviceDate: string; billed: number; allowed: number; paid: number;
  patientResp: number; status: ClaimStatus; daysOutstanding: number;
  denialCode?: string; denialReason?: string;
};

type PriorAuth = {
  id: string; patient: string; service: string; provider: string;
  status: AuthStatus; submittedDate: string; expiresAt?: string;
  authNumber?: string;
};

const PAYERS: Payer[] = [
  { id:"PY1", name:"Bupa Arabia",        shortCode:"BUPA",     country:"SA", standard:"NPHIES",   avgDays:18, denialRate:8.2,  isActive:true },
  { id:"PY2", name:"Tawuniya",           shortCode:"TAWUNIYA", country:"SA", standard:"NPHIES",   avgDays:24, denialRate:11.5, isActive:true },
  { id:"PY3", name:"MedGulf",            shortCode:"MEDGULF",  country:"SA", standard:"NPHIES",   avgDays:32, denialRate:14.2, isActive:true },
  { id:"PY4", name:"Daman Insurance",    shortCode:"DAMAN",    country:"AE", standard:"HAAD",     avgDays:21, denialRate:9.8,  isActive:true },
  { id:"PY5", name:"NHS England",        shortCode:"NHS",      country:"GB", standard:"NHS-ECS",  avgDays:14, denialRate:3.2,  isActive:true },
  { id:"PY6", name:"Aetna",              shortCode:"AETNA",    country:"US", standard:"CMS-1500", avgDays:28, denialRate:12.4, isActive:true },
  { id:"PY7", name:"Cigna",              shortCode:"CIGNA",    country:"US", standard:"CMS-1500", avgDays:30, denialRate:10.8, isActive:true },
  { id:"PY8", name:"MOH Kuwait",         shortCode:"MOH-KW",   country:"KW", standard:"MOH-KW",   avgDays:42, denialRate:6.5,  isActive:true },
];

const POLICIES: Policy[] = [
  { id:"P1", patient:"Ahmad Al-Rashid",  mrn:"MRN-10492", payerName:"Bupa Arabia", planName:"Platinum Plus", memberID:"BUP-8842310", priority:"primary",   status:"active",   effectiveDate:"2026-01-01", deductibleMet:2400, deductibleTotal:5000, oopMet:3200, oopTotal:10000, copayPCP:50 },
  { id:"P2", patient:"Fatima Al-Zahra",  mrn:"MRN-10485", payerName:"Tawuniya",    planName:"Family Care",  memberID:"TAW-5512098", priority:"primary",   status:"active",   effectiveDate:"2026-03-01", deductibleMet:850,  deductibleTotal:3000, oopMet:1200, oopTotal:7500,  copayPCP:30 },
  { id:"P3", patient:"Khalid Al-Dosari", mrn:"MRN-10488", payerName:"MedGulf",     planName:"Essential",     memberID:"MGF-7745321", priority:"primary",   status:"pending",  effectiveDate:"2026-06-01", deductibleMet:0,    deductibleTotal:2500, oopMet:0,    oopTotal:5000,  copayPCP:40 },
  { id:"P4", patient:"Sara Al-Ghamdi",   mrn:"MRN-10490", payerName:"Daman",       planName:"Comprehensive", memberID:"DAM-9821445", priority:"primary",   status:"active",   effectiveDate:"2026-01-15",deductibleMet:1800, deductibleTotal:4000, oopMet:2100, oopTotal:8000,  copayPCP:25 },
  { id:"P5", patient:"Ahmad Al-Rashid",  mrn:"MRN-10492", payerName:"Tawuniya",    planName:"Supplement",    memberID:"TAW-2210567", priority:"secondary", status:"active",   effectiveDate:"2026-02-01", deductibleMet:0,    deductibleTotal:1000, oopMet:0,    oopTotal:3000,  copayPCP:20 },
];

const CLAIMS: Claim[] = [
  { id:"C1", claimNumber:"CLM-2026-08471", patient:"Ahmad Al-Rashid",  payer:"Bupa Arabia", serviceDate:"2026-06-10", billed:4850, allowed:4200, paid:3780, patientResp:420, status:"paid",     daysOutstanding:3 },
  { id:"C2", claimNumber:"CLM-2026-08472", patient:"Fatima Al-Zahra",  payer:"Tawuniya",    serviceDate:"2026-06-11", billed:1280, allowed:1100, paid:0,    patientResp:0,   status:"pending",  daysOutstanding:2 },
  { id:"C3", claimNumber:"CLM-2026-08465", patient:"Sara Al-Ghamdi",   payer:"Daman",       serviceDate:"2026-06-08", billed:15400,allowed:0,    paid:0,    patientResp:0,   status:"denied",   daysOutstanding:5, denialCode:"CO-50", denialReason:"Non-covered service: prior authorization not obtained" },
  { id:"C4", claimNumber:"CLM-2026-08440", patient:"Khalid Al-Dosari", payer:"MedGulf",     serviceDate:"2026-06-05", billed:850,  allowed:720,  paid:680,  patientResp:40,  status:"paid",     daysOutstanding:8 },
  { id:"C5", claimNumber:"CLM-2026-08423", patient:"Omar Al-Shehri",   payer:"Bupa Arabia", serviceDate:"2026-06-02", billed:6750, allowed:5800, paid:2900, patientResp:0,   status:"partial",  daysOutstanding:11 },
  { id:"C6", claimNumber:"CLM-2026-08401", patient:"Layla Al-Otaibi",  payer:"Aetna",       serviceDate:"2026-05-28", billed:2100, allowed:0,    paid:0,    patientResp:0,   status:"denied",   daysOutstanding:16, denialCode:"CO-197", denialReason:"Precertification absent" },
  { id:"C7", claimNumber:"CLM-2026-08395", patient:"Mohammed Al-Harbi",payer:"Tawuniya",    serviceDate:"2026-05-26", billed:9200, allowed:8100, paid:0,    patientResp:0,   status:"appealed", daysOutstanding:18 },
];

const PRIOR_AUTHS: PriorAuth[] = [
  { id:"PA1", patient:"Sara Al-Ghamdi",   service:"Chemotherapy — Carboplatin", provider:"Dr. Al-Rashid",  status:"approved", submittedDate:"2026-06-05", expiresAt:"2026-12-05", authNumber:"AUTH-892140" },
  { id:"PA2", patient:"Khalid Al-Dosari", service:"MRI Knee with contrast",     provider:"Dr. Al-Harbi",   status:"pending",  submittedDate:"2026-06-11" },
  { id:"PA3", patient:"Ahmad Al-Rashid",  service:"Cardiac CT Angiography",     provider:"Dr. Al-Ghamdi",  status:"submitted",submittedDate:"2026-06-12" },
  { id:"PA4", patient:"Fatima Al-Zahra",  service:"Bariatric Surgery",          provider:"Dr. Al-Mutawa",  status:"denied",   submittedDate:"2026-05-20" },
];

const STATUS_META: Record<string,{color:string;bg:string;label:string}> = {
  active:    { color:"#4ade80", bg:"rgba(74,222,128,0.1)",  label:"Active" },
  inactive:  { color:"#94a3b8", bg:"rgba(148,163,184,0.1)", label:"Inactive" },
  pending:   { color:"#fbbf24", bg:"rgba(251,191,36,0.1)",  label:"Pending" },
  terminated:{ color:"#f87171", bg:"rgba(248,113,113,0.1)", label:"Terminated" },
  draft:     { color:"#94a3b8", bg:"rgba(148,163,184,0.1)", label:"Draft" },
  submitted: { color:"#22d3ee", bg:"rgba(34,211,238,0.1)",  label:"Submitted" },
  paid:      { color:"#4ade80", bg:"rgba(74,222,128,0.1)",  label:"Paid" },
  partial:   { color:"#fb923c", bg:"rgba(251,146,60,0.1)",  label:"Partial" },
  denied:    { color:"#f87171", bg:"rgba(248,113,113,0.1)", label:"Denied" },
  appealed:  { color:"#a78bfa", bg:"rgba(167,139,250,0.1)", label:"Appealed" },
  approved:  { color:"#4ade80", bg:"rgba(74,222,128,0.1)",  label:"Approved" },
};

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

export default function InsurancePage() {
  const [tab, setTab] = useState<"overview"|"policies"|"claims"|"auths"|"payers">("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // KPIs
  const totalBilled = CLAIMS.reduce((s,c)=>s+c.billed, 0);
  const totalPaid   = CLAIMS.reduce((s,c)=>s+c.paid,   0);
  const totalOutstanding = CLAIMS.filter(c=>!["paid","denied"].includes(c.status)).reduce((s,c)=>s+c.billed-c.paid, 0);
  const deniedAmount = CLAIMS.filter(c=>c.status==="denied").reduce((s,c)=>s+c.billed, 0);
  const denialRate = (CLAIMS.filter(c=>c.status==="denied").length / CLAIMS.length) * 100;
  const collectionRate = (totalPaid / totalBilled) * 100;
  const activePolicies = POLICIES.filter(p=>p.status==="active").length;
  const pendingAuths = PRIOR_AUTHS.filter(a=>["pending","submitted"].includes(a.status)).length;

  return (
    <div style={{ padding:"24px", minHeight:"100vh", background:"#080d18" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:10 }}>
            <Shield style={{ width:24, height:24, color:"#34d399" }} />
            Insurance & Revenue Cycle
          </h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>
            Payers · Policies · Eligibility · Prior Auth · Claims · Denials — multi-country (NPHIES, NHS, CMS-1500, HAAD, MOH-KW)
          </p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", borderRadius:10, padding:"8px 14px", color:"#4ade80", fontSize:12, fontWeight:600, cursor:"pointer" }}>
            <RefreshCw style={{ width:14, height:14 }} /> Real-time Eligibility
          </button>
          <button style={{ display:"flex", alignItems:"center", gap:7, background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
            <Plus style={{ width:14, height:14 }} /> New Claim
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:20, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        {(["overview","policies","claims","auths","payers"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:"10px 18px", background:"none", border:"none", borderBottom:`2px solid ${tab===t?"#e67e22":"transparent"}`,
              color: tab===t?"#e67e22":"rgba(255,255,255,0.4)", fontSize:13, fontWeight: tab===t?700:500, cursor:"pointer", textTransform:"capitalize", marginBottom:-1 }}>
            {t === "auths" ? "Prior Auth" : t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          {/* KPIs */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:10, marginBottom:20 }}>
            {[
              { l:"Total Billed",       v:`SAR ${(totalBilled/1000).toFixed(1)}K`,  c:"#22d3ee" },
              { l:"Collected",          v:`SAR ${(totalPaid/1000).toFixed(1)}K`,    c:"#4ade80" },
              { l:"Outstanding (AR)",   v:`SAR ${(totalOutstanding/1000).toFixed(1)}K`, c:"#fbbf24" },
              { l:"Denied Amount",      v:`SAR ${(deniedAmount/1000).toFixed(1)}K`, c:"#f87171" },
              { l:"Collection Rate",    v:`${collectionRate.toFixed(0)}%`,          c:"#4ade80" },
              { l:"Denial Rate",        v:`${denialRate.toFixed(1)}%`,              c:"#f87171" },
            ].map(s => (
              <Card key={s.l} style={{ padding:"14px 16px" }}>
                <p style={{ fontSize:22, fontWeight:800, color:s.c, margin:0 }}>{s.v}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{s.l}</p>
              </Card>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {/* AR Aging */}
            <Card style={{ padding:18 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px", display:"flex", alignItems:"center", gap:7 }}>
                <BarChart3 style={{ width:14, height:14, color:"#22d3ee" }} /> Accounts Receivable Aging
              </h3>
              {[
                { bucket:"0–30 days",   amt:42500, color:"#4ade80" },
                { bucket:"31–60 days",  amt:18200, color:"#fbbf24" },
                { bucket:"61–90 days",  amt:8400,  color:"#fb923c" },
                { bucket:"91–120 days", amt:3200,  color:"#f87171" },
                { bucket:"121+ days",   amt:1850,  color:"#f43f5e" },
              ].map(b => {
                const max = 50000;
                return (
                  <div key={b.bucket} style={{ marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,0.55)" }}>{b.bucket}</span>
                      <span style={{ fontSize:12, color:b.color, fontWeight:700 }}>SAR {b.amt.toLocaleString()}</span>
                    </div>
                    <div style={{ height:8, background:"rgba(255,255,255,0.06)", borderRadius:6, overflow:"hidden" }}>
                      <div style={{ height:"100%", background:b.color, width:`${(b.amt/max)*100}%`, borderRadius:6 }} />
                    </div>
                  </div>
                );
              })}
            </Card>

            {/* Top denial reasons */}
            <Card style={{ padding:18 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px", display:"flex", alignItems:"center", gap:7 }}>
                <AlertTriangle style={{ width:14, height:14, color:"#f87171" }} /> Top Denial Reasons (30 days)
              </h3>
              {[
                { code:"CO-50",  reason:"Non-covered service: prior auth missing", count:12, amt:32400 },
                { code:"CO-197", reason:"Precertification absent",                 count:8,  amt:18200 },
                { code:"CO-29",  reason:"Time limit for filing has expired",       count:5,  amt:9800 },
                { code:"CO-16",  reason:"Claim lacks information for processing",  count:4,  amt:7200 },
                { code:"CO-109", reason:"Service not covered by this payer",       count:3,  amt:5600 },
              ].map(d => (
                <div key={d.code} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 12px", marginBottom:6, background:"rgba(248,113,113,0.04)", border:"1px solid rgba(248,113,113,0.12)", borderRadius:10 }}>
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:0 }}>{d.code} — {d.reason}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>{d.count} claims · SAR {d.amt.toLocaleString()}</p>
                  </div>
                  <button style={{ fontSize:10, background:"rgba(167,139,250,0.15)", border:"1px solid rgba(167,139,250,0.3)", borderRadius:6, padding:"3px 10px", color:"#a78bfa", fontWeight:600, cursor:"pointer" }}>
                    Appeal
                  </button>
                </div>
              ))}
            </Card>

            {/* Payer scorecard */}
            <Card style={{ padding:18, gridColumn:"1 / -1" }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px", display:"flex", alignItems:"center", gap:7 }}>
                <Globe style={{ width:14, height:14, color:"#22d3ee" }} /> Payer Performance Scorecard
              </h3>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr style={{ color:"rgba(255,255,255,0.4)", fontSize:10, textTransform:"uppercase", letterSpacing:"0.07em" }}>
                      <th style={{ textAlign:"left", padding:"8px 12px" }}>Payer</th>
                      <th style={{ textAlign:"left", padding:"8px 12px" }}>Country</th>
                      <th style={{ textAlign:"left", padding:"8px 12px" }}>Standard</th>
                      <th style={{ textAlign:"right", padding:"8px 12px" }}>Avg Days to Pay</th>
                      <th style={{ textAlign:"right", padding:"8px 12px" }}>Denial Rate</th>
                      <th style={{ textAlign:"center", padding:"8px 12px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PAYERS.map(p => (
                      <tr key={p.id} style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding:"10px 12px", color:"#f1f5f9", fontWeight:600 }}>{p.name}</td>
                        <td style={{ padding:"10px 12px", color:"rgba(255,255,255,0.55)" }}>{p.country}</td>
                        <td style={{ padding:"10px 12px" }}>
                          <span style={{ fontSize:10, background:"rgba(34,211,238,0.12)", color:"#22d3ee", borderRadius:5, padding:"2px 8px", fontWeight:600 }}>{p.standard}</span>
                        </td>
                        <td style={{ padding:"10px 12px", textAlign:"right", color: p.avgDays>30?"#fbbf24":"#4ade80", fontWeight:600 }}>{p.avgDays} days</td>
                        <td style={{ padding:"10px 12px", textAlign:"right", color: p.denialRate>10?"#f87171":"#4ade80", fontWeight:600 }}>{p.denialRate}%</td>
                        <td style={{ padding:"10px 12px", textAlign:"center" }}>
                          <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background: p.isActive?"#4ade80":"#94a3b8" }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}

      {tab === "policies" && (
        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>Patient Policies — {activePolicies} active</h3>
            <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"0 12px" }}>
              <Search style={{ width:13, height:13, color:"rgba(255,255,255,0.3)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient or member ID..." style={{ background:"none", border:"none", color:"#f1f5f9", fontSize:12, outline:"none", padding:"8px 0", width:240 }} />
            </div>
          </div>
          {POLICIES.filter(p => !search || p.patient.toLowerCase().includes(search.toLowerCase()) || p.memberID.includes(search)).map(p => {
            const sm = STATUS_META[p.status];
            const dedPct = (p.deductibleMet / p.deductibleTotal) * 100;
            const oopPct = (p.oopMet / p.oopTotal) * 100;
            return (
              <div key={p.id} style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"grid", gridTemplateColumns:"260px 200px 1fr 80px", gap:18, alignItems:"center" }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>{p.patient}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>{p.mrn} · Member {p.memberID}</p>
                  <div style={{ display:"flex", gap:6, marginTop:5 }}>
                    <span style={{ fontSize:9, background:sm.bg, color:sm.color, borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{sm.label}</span>
                    <span style={{ fontSize:9, background: p.priority==="primary"?"rgba(230,126,34,0.12)":"rgba(167,139,250,0.12)", color: p.priority==="primary"?"#e67e22":"#a78bfa", borderRadius:5, padding:"2px 7px", fontWeight:700, textTransform:"uppercase" }}>{p.priority}</span>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:0 }}>{p.payerName}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>{p.planName}</p>
                  <p style={{ fontSize:9, color:"rgba(255,255,255,0.3)", margin:"2px 0 0" }}>Eff. {p.effectiveDate} · Copay PCP SAR {p.copayPCP}</p>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                      <span style={{ fontSize:10, color:"rgba(255,255,255,0.5)" }}>Deductible</span>
                      <span style={{ fontSize:10, color:"#22d3ee", fontWeight:700 }}>SAR {p.deductibleMet}/{p.deductibleTotal}</span>
                    </div>
                    <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden" }}>
                      <div style={{ height:"100%", background:"#22d3ee", width:`${dedPct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                      <span style={{ fontSize:10, color:"rgba(255,255,255,0.5)" }}>OOP Max</span>
                      <span style={{ fontSize:10, color:"#fbbf24", fontWeight:700 }}>SAR {p.oopMet}/{p.oopTotal}</span>
                    </div>
                    <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden" }}>
                      <div style={{ height:"100%", background:"#fbbf24", width:`${oopPct}%` }} />
                    </div>
                  </div>
                </div>
                <button style={{ fontSize:11, background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.25)", borderRadius:8, padding:"6px 0", color:"#4ade80", fontWeight:600, cursor:"pointer" }}>
                  Verify
                </button>
              </div>
            );
          })}
        </Card>
      )}

      {tab === "claims" && (
        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:10 }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0, marginRight:"auto" }}>Claims — {CLAIMS.length} total</h3>
            {["all","pending","paid","denied","appealed"].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                style={{ padding:"5px 12px", borderRadius:8, border:`1px solid ${statusFilter===f?"#e67e22":"rgba(255,255,255,0.08)"}`,
                  background:statusFilter===f?"rgba(230,126,34,0.12)":"transparent", color:statusFilter===f?"#e67e22":"rgba(255,255,255,0.4)", fontSize:11, fontWeight:600, cursor:"pointer", textTransform:"capitalize" }}>
                {f}
              </button>
            ))}
          </div>
          {CLAIMS.filter(c => statusFilter==="all" || c.status === statusFilter).map(c => {
            const sm = STATUS_META[c.status];
            return (
              <div key={c.id} style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display:"grid", gridTemplateColumns:"220px 200px 1fr 100px", gap:18, alignItems:"center" }}>
                  <div>
                    <p style={{ fontSize:12, fontWeight:700, color:"#22d3ee", margin:0, fontFamily:"monospace" }}>{c.claimNumber}</p>
                    <p style={{ fontSize:12, color:"#f1f5f9", margin:"2px 0 0" }}>{c.patient}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>{c.payer} · Service {c.serviceDate}</p>
                  </div>
                  <div>
                    <span style={{ fontSize:10, background:sm.bg, color:sm.color, borderRadius:5, padding:"2px 8px", fontWeight:700 }}>{sm.label}</span>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"4px 0 0" }}>{c.daysOutstanding} days outstanding</p>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                    {[
                      { l:"Billed",   v:c.billed,      col:"rgba(255,255,255,0.5)" },
                      { l:"Allowed",  v:c.allowed,     col:"#22d3ee" },
                      { l:"Paid",     v:c.paid,        col:"#4ade80" },
                      { l:"Pt Resp.", v:c.patientResp, col:"#fbbf24" },
                    ].map(f => (
                      <div key={f.l}>
                        <p style={{ fontSize:9, color:"rgba(255,255,255,0.3)", margin:0, textTransform:"uppercase", letterSpacing:"0.05em" }}>{f.l}</p>
                        <p style={{ fontSize:12, fontWeight:700, color:f.col, margin:"2px 0 0" }}>SAR {f.v.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                    {c.status === "denied" && (
                      <button style={{ fontSize:10, background:"rgba(167,139,250,0.15)", border:"1px solid rgba(167,139,250,0.3)", borderRadius:7, padding:"5px 10px", color:"#a78bfa", fontWeight:700, cursor:"pointer" }}>
                        Appeal
                      </button>
                    )}
                    {c.status === "draft" && (
                      <button style={{ fontSize:10, background:"#e67e22", color:"white", border:"none", borderRadius:7, padding:"5px 10px", fontWeight:700, cursor:"pointer" }}>Submit</button>
                    )}
                    <button style={{ fontSize:10, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:7, padding:"5px 10px", color:"rgba(255,255,255,0.5)", cursor:"pointer" }}>View</button>
                  </div>
                </div>
                {c.denialCode && (
                  <div style={{ marginTop:8, padding:"7px 12px", background:"rgba(248,113,113,0.05)", border:"1px solid rgba(248,113,113,0.15)", borderRadius:8 }}>
                    <p style={{ fontSize:11, color:"#f87171", margin:0 }}>
                      <strong>{c.denialCode}</strong> · {c.denialReason}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </Card>
      )}

      {tab === "auths" && (
        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>Prior Authorizations — {pendingAuths} pending</h3>
            <button style={{ display:"flex", alignItems:"center", gap:6, background:"#e67e22", color:"white", border:"none", borderRadius:9, padding:"6px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              <Plus style={{ width:13, height:13 }} /> Submit Auth Request
            </button>
          </div>
          {PRIOR_AUTHS.map(pa => {
            const sm = STATUS_META[pa.status] ?? STATUS_META.pending;
            return (
              <div key={pa.id} style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"grid", gridTemplateColumns:"260px 1fr 200px 100px", gap:16, alignItems:"center" }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>{pa.patient}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>{pa.provider}</p>
                </div>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:0 }}>{pa.service}</p>
                  {pa.authNumber && <p style={{ fontSize:10, color:"#4ade80", margin:"2px 0 0", fontFamily:"monospace" }}>Auth: {pa.authNumber}</p>}
                </div>
                <div>
                  <span style={{ fontSize:10, background:sm.bg, color:sm.color, borderRadius:5, padding:"2px 8px", fontWeight:700 }}>{sm.label}</span>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"4px 0 0" }}>Submitted {pa.submittedDate}</p>
                  {pa.expiresAt && <p style={{ fontSize:10, color:"#fbbf24", margin:"2px 0 0" }}>Valid until {pa.expiresAt}</p>}
                </div>
                <button style={{ fontSize:11, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"6px 0", color:"rgba(255,255,255,0.55)", cursor:"pointer" }}>
                  Details
                </button>
              </div>
            );
          })}
        </Card>
      )}

      {tab === "payers" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
          {PAYERS.map(p => (
            <Card key={p.id} style={{ padding:18 }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
                <div>
                  <p style={{ fontSize:15, fontWeight:800, color:"#f1f5f9", margin:0 }}>{p.name}</p>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:"2px 0 0", fontFamily:"monospace" }}>{p.shortCode}</p>
                </div>
                <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background: p.isActive?"#4ade80":"#94a3b8" }} />
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
                <span style={{ fontSize:9, background:"rgba(34,211,238,0.12)", color:"#22d3ee", borderRadius:5, padding:"2px 8px", fontWeight:700 }}>{p.standard}</span>
                <span style={{ fontSize:9, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.45)", borderRadius:5, padding:"2px 8px" }}>{p.country}</span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:8, padding:"8px 12px" }}>
                  <p style={{ fontSize:9, color:"rgba(255,255,255,0.3)", margin:0 }}>Avg Pay</p>
                  <p style={{ fontSize:14, fontWeight:800, color: p.avgDays>30?"#fbbf24":"#4ade80", margin:0 }}>{p.avgDays}d</p>
                </div>
                <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:8, padding:"8px 12px" }}>
                  <p style={{ fontSize:9, color:"rgba(255,255,255,0.3)", margin:0 }}>Denial Rate</p>
                  <p style={{ fontSize:14, fontWeight:800, color: p.denialRate>10?"#f87171":"#4ade80", margin:0 }}>{p.denialRate}%</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
