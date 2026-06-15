"use client";

import { useState } from "react";
import {
  ArrowRightLeft, ShieldCheck, Clock, CheckCircle2, XCircle,
  AlertTriangle, Plus, Send, FileText, Stethoscope, User, Search,
  ChevronRight, Calendar, MessageSquare,
} from "lucide-react";

type RefStatus = "draft" | "sent" | "scheduled" | "completed" | "declined" | "no_show";
type AuthStatus = "not_required" | "draft" | "submitted" | "pending" | "approved" | "denied" | "expired";
type Direction = "outbound" | "inbound";

type Referral = {
  id: string; direction: Direction; patient: string; mrn: string;
  fromProvider: string; toProvider: string; specialty: string;
  reason: string; clinicalSummary: string;
  status: RefStatus; priority: "routine"|"urgent"|"stat";
  createdAt: string; appointmentAt?: string;
  authRequired: boolean; authStatus: AuthStatus; authNumber?: string;
  payer: string;
};

const STATUS_META: Record<RefStatus,{c:string;bg:string;label:string}> = {
  draft:     { c:"#94a3b8", bg:"rgba(148,163,184,0.1)", label:"Draft" },
  sent:      { c:"#22d3ee", bg:"rgba(34,211,238,0.1)",  label:"Sent" },
  scheduled: { c:"#a78bfa", bg:"rgba(167,139,250,0.1)", label:"Scheduled" },
  completed: { c:"#4ade80", bg:"rgba(74,222,128,0.1)",  label:"Completed" },
  declined:  { c:"#f87171", bg:"rgba(248,113,113,0.1)", label:"Declined" },
  no_show:   { c:"#fb923c", bg:"rgba(251,146,60,0.1)",  label:"No-show" },
};

const AUTH_META: Record<AuthStatus,{c:string;label:string}> = {
  not_required: { c:"rgba(255,255,255,0.4)", label:"Not Required" },
  draft:        { c:"#94a3b8", label:"Auth Draft" },
  submitted:    { c:"#22d3ee", label:"Submitted" },
  pending:      { c:"#fbbf24", label:"Pending Auth" },
  approved:     { c:"#4ade80", label:"Approved" },
  denied:       { c:"#f87171", label:"Auth Denied" },
  expired:      { c:"#fb923c", label:"Expired" },
};

const REFERRALS: Referral[] = [
  { id:"R001", direction:"outbound", patient:"Ahmad Al-Rashid", mrn:"MRN-10492", fromProvider:"Dr. Al-Mutawa (PCP)", toProvider:"Dr. Al-Ghamdi", specialty:"Cardiology", reason:"Chest pain, abnormal ECG", clinicalSummary:"55M w/ exertional CP, 2-cm ST depression in inferior leads on stress test. HTN, DLP. Refer for cath eval.", status:"scheduled", priority:"urgent", createdAt:"2026-06-10", appointmentAt:"2026-06-16 10:00", authRequired:true, authStatus:"approved", authNumber:"AUTH-892140", payer:"Bupa Arabia" },
  { id:"R002", direction:"outbound", patient:"Fatima Al-Zahra",  mrn:"MRN-10485", fromProvider:"Dr. Al-Mutawa (PCP)", toProvider:"Dr. Hassan",   specialty:"Endocrinology", reason:"Uncontrolled T2DM, HbA1c 11.2", clinicalSummary:"42F T2DM 8y, on metformin+gliclazide max dose. Considering GLP-1 vs insulin. SDOH: food insecurity flagged.", status:"sent", priority:"routine", createdAt:"2026-06-12", authRequired:false, authStatus:"not_required", payer:"Tawuniya" },
  { id:"R003", direction:"outbound", patient:"Khalid Al-Dosari", mrn:"MRN-10488", fromProvider:"Dr. Al-Mutawa (PCP)", toProvider:"Dr. Al-Harbi", specialty:"Orthopaedics",  reason:"Right knee OA, refractory pain", clinicalSummary:"68M, BMI 31. Right knee OA Kellgren grade 3. Failed conservative — PT 12wk, NSAIDs, IA steroid. Consider TKR.", status:"sent", priority:"routine", createdAt:"2026-06-11", authRequired:true, authStatus:"pending", payer:"MedGulf" },
  { id:"R004", direction:"outbound", patient:"Sara Al-Ghamdi",   mrn:"MRN-10490", fromProvider:"Dr. Al-Mutawa (PCP)", toProvider:"Dr. Al-Rashid",specialty:"Oncology",      reason:"Breast lump, suspicious mammo BI-RADS 4", clinicalSummary:"48F, palpable mass URQ left breast 2.3cm, mammo BI-RADS 4B, no axillary LN. Urgent biopsy + onco eval.", status:"sent", priority:"stat", createdAt:"2026-06-13", authRequired:true, authStatus:"denied", payer:"Daman" },
  { id:"R005", direction:"inbound",  patient:"Mohammed Al-Harbi", mrn:"MRN-10238", fromProvider:"Dr. Al-Otaibi (Endo)", toProvider:"Dr. Al-Mutawa", specialty:"Internal Medicine", reason:"Co-management, hyperthyroidism", clinicalSummary:"35M Graves disease, on methimazole 20mg/d. Stable. Continue Q3-mo TFTs.", status:"scheduled", priority:"routine", createdAt:"2026-06-08", appointmentAt:"2026-06-18 14:30", authRequired:false, authStatus:"not_required", payer:"Bupa Arabia" },
  { id:"R006", direction:"inbound",  patient:"Layla Al-Otaibi",   mrn:"MRN-10239", fromProvider:"Dr. Hassan (Cardio)", toProvider:"Dr. Al-Mutawa", specialty:"Internal Medicine", reason:"HTN management post-stent", clinicalSummary:"62F, s/p LAD stent 03/2026. On DAPT, statin, ACEi. BP labile. Optimize meds.", status:"completed", priority:"routine", createdAt:"2026-06-01", authRequired:false, authStatus:"not_required", payer:"Tawuniya" },
  { id:"R007", direction:"outbound", patient:"Omar Al-Shehri",    mrn:"MRN-10486", fromProvider:"Dr. Al-Mutawa (PCP)", toProvider:"Dr. Al-Zahrani",specialty:"Gastroenterology",reason:"Iron deficiency anaemia, no obvious source", clinicalSummary:"55M, Hb 8.2, MCV 72, ferritin 6. No GI symptoms. Refer for EGD+colonoscopy.", status:"declined", priority:"routine", createdAt:"2026-05-28", authRequired:true, authStatus:"denied", payer:"Aetna" },
];

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function ReferralsPage() {
  const [dir, setDir]       = useState<"all"|Direction>("all");
  const [statusF, setStatusF] = useState<string>("all");
  const [active, setActive] = useState<Referral|null>(REFERRALS[0]);
  const [search, setSearch] = useState("");

  const filtered = REFERRALS.filter(r =>
    (dir === "all" || r.direction === dir) &&
    (statusF === "all" || r.status === statusF) &&
    (!search || r.patient.toLowerCase().includes(search.toLowerCase()) || r.mrn.includes(search))
  );

  const counts = {
    out: REFERRALS.filter(r=>r.direction==="outbound").length,
    inb: REFERRALS.filter(r=>r.direction==="inbound").length,
    pendAuth: REFERRALS.filter(r=>r.authStatus==="pending"||r.authStatus==="submitted").length,
    denied: REFERRALS.filter(r=>r.authStatus==="denied").length,
  };

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Prior Auth & Referrals</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Outbound · Inbound · Auth Submission · Tracking · Specialist Communication</p>
        </div>
        <button style={{ display:"flex", alignItems:"center", gap:7, background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          <Plus style={{ width:14, height:14 }} /> New Referral
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:18 }}>
        {[
          { l:"Outbound", v:counts.out, c:"#22d3ee" },
          { l:"Inbound", v:counts.inb, c:"#a78bfa" },
          { l:"Pending Auth", v:counts.pendAuth, c:"#fbbf24" },
          { l:"Auth Denied", v:counts.denied, c:"#f87171" },
          { l:"Completed Today", v:1, c:"#4ade80" },
        ].map(s => (
          <Card key={s.l} style={{ padding:"12px 16px" }}>
            <p style={{ fontSize:22, fontWeight:800, color:s.c, margin:0 }}>{s.v}</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{s.l}</p>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"380px 1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"0 14px" }}>
            <Search style={{ width:14, height:14, color:"rgba(255,255,255,0.3)" }} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patient or MRN..." style={{ flex:1, background:"none", border:"none", color:"#f1f5f9", fontSize:13, outline:"none", padding:"10px 0" }} />
          </div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {(["all","outbound","inbound"] as const).map(d => (
              <button key={d} onClick={()=>setDir(d)} style={{ padding:"4px 10px", borderRadius:8, border:`1px solid ${dir===d?"#e67e22":"rgba(255,255,255,0.08)"}`, background:dir===d?"rgba(230,126,34,0.15)":"transparent", color:dir===d?"#e67e22":"rgba(255,255,255,0.35)", fontSize:10, fontWeight:600, cursor:"pointer", textTransform:"capitalize" }}>{d}</button>
            ))}
            {Object.keys(STATUS_META).map(s => (
              <button key={s} onClick={()=>setStatusF(s)} style={{ padding:"4px 10px", borderRadius:8, border:`1px solid ${statusF===s?"#e67e22":"rgba(255,255,255,0.08)"}`, background:statusF===s?"rgba(230,126,34,0.15)":"transparent", color:statusF===s?"#e67e22":"rgba(255,255,255,0.35)", fontSize:10, fontWeight:600, cursor:"pointer", textTransform:"capitalize" }}>{s}</button>
            ))}
          </div>
          {filtered.map(r => {
            const sm = STATUS_META[r.status];
            const am = AUTH_META[r.authStatus];
            const isA = active?.id === r.id;
            return (
              <Card key={r.id} style={{ padding:14, cursor:"pointer", border:`1px solid ${isA?"rgba(230,126,34,0.3)":r.priority==="stat"?"rgba(244,63,94,0.3)":"rgba(255,255,255,0.07)"}`, background:isA?"rgba(230,126,34,0.07)":"rgba(255,255,255,0.03)", borderLeft:`3px solid ${r.priority==="stat"?"#f43f5e":r.priority==="urgent"?"#fbbf24":"transparent"}` }} onClick={()=>setActive(r)}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    {r.direction==="outbound" ? <ArrowRightLeft style={{ width:13, height:13, color:"#22d3ee" }} /> : <ArrowRightLeft style={{ width:13, height:13, color:"#a78bfa", transform:"rotate(180deg)" }} />}
                    <span style={{ fontSize:12, fontWeight:700, color:"#f1f5f9" }}>{r.patient}</span>
                  </div>
                  {r.priority!=="routine" && <span style={{ fontSize:9, background: r.priority==="stat"?"rgba(244,63,94,0.15)":"rgba(251,191,36,0.15)", color: r.priority==="stat"?"#f43f5e":"#fbbf24", borderRadius:5, padding:"1px 6px", fontWeight:800, textTransform:"uppercase" }}>{r.priority}</span>}
                </div>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.55)", margin:"0 0 4px" }}>→ {r.specialty} · {r.toProvider}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"0 0 7px" }}>{r.reason}</p>
                <div style={{ display:"flex", gap:5 }}>
                  <span style={{ fontSize:9, background:sm.bg, color:sm.c, borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{sm.label}</span>
                  {r.authRequired && <span style={{ fontSize:9, background:r.authStatus==="approved"?"rgba(74,222,128,0.12)":r.authStatus==="denied"?"rgba(248,113,113,0.12)":"rgba(251,191,36,0.12)", color:am.c, borderRadius:5, padding:"2px 7px", fontWeight:700 }}><ShieldCheck style={{ width:9, height:9, display:"inline", marginRight:3 }} />{am.label}</span>}
                </div>
              </Card>
            );
          })}
        </div>

        {active && (
          <Card style={{ padding:0, overflow:"hidden", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"16px 22px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <h2 style={{ fontSize:17, fontWeight:800, color:"#f1f5f9", margin:0 }}>{active.patient}</h2>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"3px 0 0" }}>{active.mrn} · {active.specialty} · {active.payer}</p>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"7px 14px", color:"rgba(255,255,255,0.6)", fontSize:12, cursor:"pointer" }}><MessageSquare style={{ width:12, height:12 }} />Message</button>
                <button style={{ display:"flex", alignItems:"center", gap:5, background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}><Send style={{ width:12, height:12 }} />Send Referral</button>
              </div>
            </div>
            <div style={{ padding:22, display:"grid", gap:18, overflowY:"auto" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div style={{ background:"rgba(34,211,238,0.04)", border:"1px solid rgba(34,211,238,0.15)", borderRadius:12, padding:14 }}>
                  <p style={{ fontSize:10, color:"rgba(34,211,238,0.7)", margin:0, textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>From</p>
                  <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"4px 0 0" }}>{active.fromProvider}</p>
                </div>
                <div style={{ background:"rgba(167,139,250,0.04)", border:"1px solid rgba(167,139,250,0.15)", borderRadius:12, padding:14 }}>
                  <p style={{ fontSize:10, color:"rgba(167,139,250,0.7)", margin:0, textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>To</p>
                  <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"4px 0 0" }}>{active.toProvider}</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Reason</p>
                <p style={{ fontSize:13, color:"#f1f5f9", margin:0, fontWeight:600 }}>{active.reason}</p>
              </div>
              <div>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Clinical Summary</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.7)", margin:0, lineHeight:1.6, background:"rgba(255,255,255,0.02)", padding:"12px 14px", borderRadius:10 }}>{active.clinicalSummary}</p>
              </div>

              {active.authRequired && (
                <div style={{ background:active.authStatus==="approved"?"rgba(74,222,128,0.05)":active.authStatus==="denied"?"rgba(248,113,113,0.05)":"rgba(251,191,36,0.05)", border:`1px solid ${active.authStatus==="approved"?"rgba(74,222,128,0.2)":active.authStatus==="denied"?"rgba(248,113,113,0.2)":"rgba(251,191,36,0.2)"}`, borderRadius:12, padding:16 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <ShieldCheck style={{ width:16, height:16, color:AUTH_META[active.authStatus].c }} />
                      <span style={{ fontSize:13, fontWeight:700, color:"#f1f5f9" }}>Prior Authorization — {AUTH_META[active.authStatus].label}</span>
                    </div>
                    {active.authNumber && <span style={{ fontSize:11, color:"#4ade80", fontFamily:"monospace", fontWeight:700 }}>{active.authNumber}</span>}
                  </div>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:0 }}>Payer: <strong style={{ color:"#f1f5f9" }}>{active.payer}</strong> · Submitted via NPHIES</p>
                  {active.authStatus==="denied" && (
                    <div style={{ marginTop:10, display:"flex", gap:8 }}>
                      <button style={{ fontSize:11, background:"rgba(167,139,250,0.2)", border:"1px solid rgba(167,139,250,0.35)", borderRadius:8, padding:"6px 14px", color:"#a78bfa", fontWeight:700, cursor:"pointer" }}>File Appeal</button>
                      <button style={{ fontSize:11, background:"rgba(34,211,238,0.15)", border:"1px solid rgba(34,211,238,0.3)", borderRadius:8, padding:"6px 14px", color:"#22d3ee", fontWeight:600, cursor:"pointer" }}>Peer-to-Peer Review</button>
                    </div>
                  )}
                </div>
              )}

              {active.appointmentAt && (
                <div style={{ background:"rgba(167,139,250,0.05)", border:"1px solid rgba(167,139,250,0.2)", borderRadius:12, padding:14, display:"flex", alignItems:"center", gap:12 }}>
                  <Calendar style={{ width:18, height:18, color:"#a78bfa" }} />
                  <div>
                    <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:0 }}>Specialist Appointment Scheduled</p>
                    <p style={{ fontSize:11, color:"#a78bfa", margin:"2px 0 0" }}>{active.appointmentAt}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
