"use client";
import { useState } from "react";
import { FileText, Shield, CheckCircle2, Clock, AlertTriangle, Plus } from "lucide-react";

type Status = "draft" | "irb_review" | "approved" | "amendment_pending" | "expired" | "closed";
type Study = { id:string; title:string; pi:string; phase:string; status:Status; irbApproval?:string; nextReview?:string; enrolled:number; target:number; sites:number; };

const STUDIES: Study[] = [
  { id:"CYM-2026-001", title:"Phase II trial of GLP-1 + SGLT-2 combination in T2DM with NAFLD", pi:"Dr. Al-Rashid", phase:"Phase II", status:"approved", irbApproval:"2026-02-14", nextReview:"2027-02-14", enrolled:84, target:120, sites:3 },
  { id:"CYM-2026-002", title:"Randomized comparison of TAVR vs SAVR in intermediate-risk AS",  pi:"Dr. Al-Ghamdi",phase:"Phase III",status:"approved", irbApproval:"2026-01-22", nextReview:"2027-01-22", enrolled:142, target:200, sites:5 },
  { id:"CYM-2026-003", title:"Observational registry — Diabetic foot ulcer outcomes in MENA",  pi:"Dr. Hassan",   phase:"Observational",status:"amendment_pending", irbApproval:"2025-08-10", enrolled:480, target:1000, sites:8 },
  { id:"CYM-2026-004", title:"Pilot — Digital therapeutic for hypertension self-management",     pi:"Dr. Al-Otaibi",phase:"Pilot",       status:"irb_review", enrolled:0, target:60, sites:1 },
  { id:"CYM-2026-005", title:"Pediatric long-COVID symptom prevalence study",                    pi:"Dr. Al-Khalifa",phase:"Observational",status:"draft",   enrolled:0, target:300, sites:2 },
];

const STATUS_META: Record<Status,{c:string;bg:string;label:string}> = {
  draft:{c:"#94a3b8",bg:"rgba(148,163,184,0.1)",label:"Draft"},
  irb_review:{c:"#fbbf24",bg:"rgba(251,191,36,0.1)",label:"IRB Under Review"},
  approved:{c:"#4ade80",bg:"rgba(74,222,128,0.1)",label:"Approved & Active"},
  amendment_pending:{c:"#fb923c",bg:"rgba(251,146,60,0.1)",label:"Amendment Pending"},
  expired:{c:"#f87171",bg:"rgba(248,113,113,0.1)",label:"Expired — Renewal Needed"},
  closed:{c:"#a78bfa",bg:"rgba(167,139,250,0.1)",label:"Closed"},
};

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function ProtocolPage() {
  const [active, setActive] = useState<Study>(STUDIES[0]);
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Protocol & IRB Management</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Protocol submission · IRB review · Amendments · Annual review · Trial Master File</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }} />New Protocol</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"380px 1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {STUDIES.map(s => {
            const sm = STATUS_META[s.status];
            return (
              <Card key={s.id} style={{ padding:14, cursor:"pointer", border:`1px solid ${active.id===s.id?"rgba(230,126,34,0.3)":"rgba(255,255,255,0.07)"}`, background:active.id===s.id?"rgba(230,126,34,0.07)":"rgba(255,255,255,0.03)" }} onClick={()=>setActive(s)}>
                <p style={{ fontSize:10, fontFamily:"monospace", color:"#a855f7", margin:0 }}>{s.id}</p>
                <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:"4px 0 4px" }}>{s.title}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 6px" }}>{s.pi} · {s.phase}</p>
                <span style={{ fontSize:9, background:sm.bg, color:sm.c, borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{sm.label}</span>
              </Card>
            );
          })}
        </div>

        <Card style={{ padding:22 }}>
          <h2 style={{ fontSize:17, fontWeight:800, color:"#f1f5f9", margin:"0 0 6px" }}>{active.title}</h2>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"0 0 18px" }}>{active.id} · {active.pi} · {active.phase}</p>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
            <div style={{ background:"rgba(34,211,238,0.04)", borderLeft:"3px solid #22d3ee", borderRadius:10, padding:12 }}><p style={{ fontSize:9, color:"rgba(34,211,238,0.7)", margin:0, textTransform:"uppercase", fontWeight:700 }}>Enrolled</p><p style={{ fontSize:18, color:"#22d3ee", margin:"3px 0 0", fontWeight:800 }}>{active.enrolled} / {active.target}</p></div>
            <div style={{ background:"rgba(167,139,250,0.04)", borderLeft:"3px solid #a78bfa", borderRadius:10, padding:12 }}><p style={{ fontSize:9, color:"rgba(167,139,250,0.7)", margin:0, textTransform:"uppercase", fontWeight:700 }}>Sites</p><p style={{ fontSize:18, color:"#a78bfa", margin:"3px 0 0", fontWeight:800 }}>{active.sites}</p></div>
            <div style={{ background:"rgba(74,222,128,0.04)", borderLeft:"3px solid #4ade80", borderRadius:10, padding:12 }}><p style={{ fontSize:9, color:"rgba(74,222,128,0.7)", margin:0, textTransform:"uppercase", fontWeight:700 }}>IRB Approved</p><p style={{ fontSize:13, color:"#4ade80", margin:"3px 0 0", fontWeight:700 }}>{active.irbApproval ?? "—"}</p></div>
            <div style={{ background:"rgba(251,191,36,0.04)", borderLeft:"3px solid #fbbf24", borderRadius:10, padding:12 }}><p style={{ fontSize:9, color:"rgba(251,191,36,0.7)", margin:0, textTransform:"uppercase", fontWeight:700 }}>Next Review</p><p style={{ fontSize:13, color:"#fbbf24", margin:"3px 0 0", fontWeight:700 }}>{active.nextReview ?? "—"}</p></div>
          </div>

          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 12px" }}>Submission History</h3>
          {[
            { date:"2026-02-14", type:"Initial IRB Approval",     status:"approved" },
            { date:"2026-04-22", type:"Amendment v1.1 — inclusion criteria", status:"approved" },
            { date:"2026-06-10", type:"Amendment v1.2 — extension to 30 sites", status:"under_review" },
          ].map((s,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", marginBottom:6, background:"rgba(255,255,255,0.02)", borderRadius:10, borderLeft:`3px solid ${s.status==="approved"?"#4ade80":"#fbbf24"}` }}>
              {s.status === "approved" ? <CheckCircle2 style={{ width:14, height:14, color:"#4ade80" }} /> : <Clock style={{ width:14, height:14, color:"#fbbf24" }} />}
              <span style={{ fontSize:12, color:"#f1f5f9", flex:1 }}>{s.type}</span>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>{s.date}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
