"use client";

import { useState } from "react";
import {
  UserCheck, Star, AlertTriangle, CheckCircle2, FileText,
  TrendingUp, BarChart3, Award, Filter, MessageSquare,
} from "lucide-react";

type RadPeerScore = 1 | 2 | 3 | 4;
type ReviewStatus = "pending" | "in_review" | "completed" | "discrepancy" | "disputed";

type Review = {
  id: string; studyId: string; patient: string; modality: string;
  originalRadiologist: string; reviewer: string; submittedDate: string;
  reviewedDate?: string; status: ReviewStatus;
  radpeerScore?: RadPeerScore; clinicallySignificant?: boolean;
  discrepancyType?: string; comments?: string;
};

type RadiologistStats = {
  name: string; totalReads: number; reviewed: number;
  scoreDistribution: { score: RadPeerScore; count: number }[];
  discrepancyRate: number; agreementRate: number;
};

const REVIEWS: Review[] = [
  { id:"PR-2026-0481", studyId:"STU-26431", patient:"Ahmad Al-Rashid", modality:"CT Chest", originalRadiologist:"Dr. Al-Ghamdi", reviewer:"Dr. Hassan", submittedDate:"2026-06-08", reviewedDate:"2026-06-12", status:"completed", radpeerScore:1, clinicallySignificant:false, comments:"Agree with findings. Bilateral lower lobe consolidation consistent with pneumonia. Well-described." },
  { id:"PR-2026-0482", studyId:"STU-26432", patient:"Fatima Al-Zahra", modality:"MRI Brain", originalRadiologist:"Dr. Hassan", reviewer:"Dr. Al-Ghamdi", submittedDate:"2026-06-09", reviewedDate:"2026-06-13", status:"discrepancy", radpeerScore:3, clinicallySignificant:true, discrepancyType:"Significant misinterpretation — missed finding", comments:"Original report missed 4mm right frontal microbleed on SWI sequence. Patient on anticoagulation, clinically significant. Recommend addendum + clinical notification." },
  { id:"PR-2026-0483", studyId:"STU-26435", patient:"Khalid Al-Dosari", modality:"X-Ray Knee", originalRadiologist:"Dr. Al-Otaibi", reviewer:"Dr. Al-Ghamdi", submittedDate:"2026-06-10", reviewedDate:"2026-06-13", status:"completed", radpeerScore:2, clinicallySignificant:false, comments:"Agree — Kellgren grade 3 OA changes. Minor: would also mention mild patellofemoral joint narrowing." },
  { id:"PR-2026-0484", studyId:"STU-26438", patient:"Sara Al-Ghamdi", modality:"Mammography", originalRadiologist:"Dr. Al-Otaibi", reviewer:"Dr. Al-Ghamdi", submittedDate:"2026-06-11", status:"in_review" },
  { id:"PR-2026-0485", studyId:"STU-26440", patient:"Omar Al-Shehri", modality:"CT Abdomen", originalRadiologist:"Dr. Hassan", reviewer:"Dr. Al-Rashid", submittedDate:"2026-06-12", status:"pending" },
  { id:"PR-2026-0486", studyId:"STU-26442", patient:"Layla Al-Otaibi", modality:"PET-CT", originalRadiologist:"Dr. Al-Rashid", reviewer:"Dr. Al-Ghamdi", submittedDate:"2026-06-12", reviewedDate:"2026-06-13", status:"disputed", radpeerScore:3, clinicallySignificant:true, discrepancyType:"Disagreement on lesion characterization", comments:"Reviewer believes left axillary node SUV 4.8 represents reactive vs metastatic. Original report stated likely metastatic. Submitted to committee for adjudication." },
];

const RADS: RadiologistStats[] = [
  { name:"Dr. Al-Ghamdi", totalReads:1842, reviewed:184,
    scoreDistribution:[{score:1,count:165},{score:2,count:16},{score:3,count:3},{score:4,count:0}],
    discrepancyRate:1.6, agreementRate:98.4 },
  { name:"Dr. Hassan", totalReads:1654, reviewed:165,
    scoreDistribution:[{score:1,count:139},{score:2,count:18},{score:3,count:7},{score:4,count:1}],
    discrepancyRate:4.8, agreementRate:95.2 },
  { name:"Dr. Al-Otaibi", totalReads:1421, reviewed:142,
    scoreDistribution:[{score:1,count:126},{score:2,count:13},{score:3,count:3},{score:4,count:0}],
    discrepancyRate:2.1, agreementRate:97.9 },
  { name:"Dr. Al-Rashid", totalReads:980, reviewed:98,
    scoreDistribution:[{score:1,count:82},{score:2,count:13},{score:3,count:3},{score:4,count:0}],
    discrepancyRate:3.1, agreementRate:96.9 },
];

const SCORE_INFO = [
  { s:1, label:"Concur",                  desc:"Agree with interpretation",                    c:"#4ade80" },
  { s:2, label:"Discrepancy — minor",     desc:"Diagnosis unlikely to be made by most",        c:"#fbbf24" },
  { s:3, label:"Discrepancy — significant",desc:"Diagnosis should be made most of the time",   c:"#fb923c" },
  { s:4, label:"Discrepancy — major",     desc:"Diagnosis should be made by virtually all",    c:"#f43f5e" },
];

const STATUS_META: Record<ReviewStatus,{c:string;bg:string;label:string}> = {
  pending:     { c:"rgba(255,255,255,0.4)", bg:"rgba(255,255,255,0.05)", label:"Pending" },
  in_review:   { c:"#22d3ee", bg:"rgba(34,211,238,0.1)",  label:"In Review" },
  completed:   { c:"#4ade80", bg:"rgba(74,222,128,0.1)",  label:"Completed — Concur" },
  discrepancy: { c:"#fb923c", bg:"rgba(251,146,60,0.1)",  label:"Discrepancy Found" },
  disputed:    { c:"#f43f5e", bg:"rgba(244,63,94,0.12)",  label:"Under Dispute" },
};

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function PeerReviewPage() {
  const [tab, setTab] = useState<"reviews"|"radiologists">("reviews");
  const [active, setActive] = useState<Review>(REVIEWS[1]);

  const completed = REVIEWS.filter(r=>r.status==="completed").length;
  const discrep = REVIEWS.filter(r=>r.status==="discrepancy" || r.status==="disputed").length;
  const pending = REVIEWS.filter(r=>r.status==="pending" || r.status==="in_review").length;
  const totalReviews = REVIEWS.length;

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Radiologist QA / Peer Review</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>ACR RADPEER scoring · Discrepancy tracking · Workload balancing · Near-miss documentation</p>
        </div>
        <button style={{ display:"flex", alignItems:"center", gap:7, background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          <FileText style={{ width:14, height:14 }} /> Assign Review
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        {[
          { l:"Reviews This Period", v:totalReviews, c:"#22d3ee" },
          { l:"Concur (Score 1)", v:completed, c:"#4ade80" },
          { l:"Discrepancies", v:discrep, c:"#fb923c" },
          { l:"Awaiting Review", v:pending, c:"#fbbf24" },
        ].map(s => (
          <Card key={s.l} style={{ padding:"12px 16px" }}>
            <p style={{ fontSize:22, fontWeight:800, color:s.c, margin:0 }}>{s.v}</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{s.l}</p>
          </Card>
        ))}
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:16, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        {(["reviews","radiologists"] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{ padding:"9px 18px", background:"none", border:"none", borderBottom:`2px solid ${tab===t?"#e67e22":"transparent"}`, color:tab===t?"#e67e22":"rgba(255,255,255,0.4)", fontSize:12, fontWeight:tab===t?700:500, cursor:"pointer", textTransform:"capitalize", marginBottom:-1 }}>{t}</button>
        ))}
      </div>

      {tab === "reviews" ? (
        <div style={{ display:"grid", gridTemplateColumns:"360px 1fr", gap:16 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {REVIEWS.map(r => {
              const sm = STATUS_META[r.status];
              const isA = active.id === r.id;
              return (
                <Card key={r.id} style={{ padding:14, cursor:"pointer", border:`1px solid ${isA?"rgba(230,126,34,0.3)":r.status==="discrepancy"||r.status==="disputed"?"rgba(251,146,60,0.25)":"rgba(255,255,255,0.07)"}`, background:isA?"rgba(230,126,34,0.07)":"rgba(255,255,255,0.03)" }} onClick={()=>setActive(r)}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:10, fontFamily:"monospace", color:"#22d3ee" }}>{r.id}</span>
                    <span style={{ fontSize:9, background:sm.bg, color:sm.c, borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{sm.label}</span>
                  </div>
                  <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:0 }}>{r.patient}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{r.modality}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"4px 0 0" }}>By {r.originalRadiologist} · Reviewer {r.reviewer}</p>
                  {r.radpeerScore && (
                    <div style={{ marginTop:6, display:"inline-flex", alignItems:"center", gap:4, padding:"3px 8px", borderRadius:5, background:`${SCORE_INFO[r.radpeerScore-1].c}15`, color:SCORE_INFO[r.radpeerScore-1].c, fontWeight:700, fontSize:10 }}>
                      <Star style={{ width:9, height:9, fill:SCORE_INFO[r.radpeerScore-1].c }} /> Score {r.radpeerScore}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <Card style={{ padding:0, overflow:"hidden" }}>
            <div style={{ padding:"16px 22px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <h2 style={{ fontSize:17, fontWeight:800, color:"#f1f5f9", margin:0 }}>{active.id}</h2>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"3px 0 0" }}>{active.patient} · {active.modality} · Study {active.studyId}</p>
            </div>
            <div style={{ padding:22, display:"grid", gap:18 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div style={{ background:"rgba(34,211,238,0.05)", border:"1px solid rgba(34,211,238,0.15)", borderRadius:12, padding:14 }}>
                  <p style={{ fontSize:10, color:"rgba(34,211,238,0.7)", margin:0, textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Original Radiologist</p>
                  <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"4px 0 0" }}>{active.originalRadiologist}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>Submitted {active.submittedDate}</p>
                </div>
                <div style={{ background:"rgba(167,139,250,0.05)", border:"1px solid rgba(167,139,250,0.15)", borderRadius:12, padding:14 }}>
                  <p style={{ fontSize:10, color:"rgba(167,139,250,0.7)", margin:0, textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Peer Reviewer</p>
                  <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"4px 0 0" }}>{active.reviewer}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>{active.reviewedDate ? `Reviewed ${active.reviewedDate}` : "Pending review"}</p>
                </div>
              </div>

              <div>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"0 0 10px", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>ACR RADPEER Score</p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                  {SCORE_INFO.map(s => {
                    const selected = active.radpeerScore === s.s;
                    return (
                      <div key={s.s} style={{ padding:"12px 14px", borderRadius:10, background:selected?`${s.c}15`:"rgba(255,255,255,0.02)", border:`1px solid ${selected?`${s.c}40`:"rgba(255,255,255,0.06)"}`, cursor:"pointer" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <Star style={{ width:13, height:13, color:s.c, fill:selected?s.c:"transparent" }} />
                          <span style={{ fontSize:13, fontWeight:800, color:selected?s.c:"rgba(255,255,255,0.6)" }}>Score {s.s}</span>
                        </div>
                        <p style={{ fontSize:11, color:selected?"#f1f5f9":"rgba(255,255,255,0.5)", margin:"4px 0 0", fontWeight:600 }}>{s.label}</p>
                        <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>{s.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {active.discrepancyType && (
                <div style={{ background:"rgba(251,146,60,0.05)", border:"1px solid rgba(251,146,60,0.25)", borderRadius:12, padding:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <AlertTriangle style={{ width:14, height:14, color:"#fb923c" }} />
                    <span style={{ fontSize:12, fontWeight:700, color:"#fb923c" }}>Discrepancy Type</span>
                  </div>
                  <p style={{ fontSize:12, color:"#f1f5f9", margin:0, fontWeight:600 }}>{active.discrepancyType}</p>
                  {active.clinicallySignificant && (
                    <p style={{ fontSize:11, color:"#f43f5e", margin:"6px 0 0", fontWeight:700 }}>⚠ Clinically Significant — addendum & notification required</p>
                  )}
                </div>
              )}

              {active.comments && (
                <div>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Reviewer Comments</p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.7)", margin:0, lineHeight:1.55, padding:"12px 14px", background:"rgba(255,255,255,0.02)", borderRadius:10 }}>{active.comments}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
          {RADS.map(r => (
            <Card key={r.name} style={{ padding:18 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:"rgba(230,126,34,0.15)", display:"flex", alignItems:"center", justifyContent:"center", color:"#e67e22", fontSize:14, fontWeight:800 }}>{r.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:800, color:"#f1f5f9", margin:0 }}>{r.name}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{r.totalReads.toLocaleString()} total reads · {r.reviewed} peer-reviewed</p>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ fontSize:18, fontWeight:800, color:r.agreementRate>=98?"#4ade80":r.agreementRate>=95?"#fbbf24":"#f87171", margin:0 }}>{r.agreementRate}%</p>
                  <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>Agreement</p>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                {r.scoreDistribution.map(d => (
                  <div key={d.score} style={{ background:"rgba(255,255,255,0.02)", borderRadius:8, padding:"10px 12px", textAlign:"center" }}>
                    <Star style={{ width:11, height:11, color:SCORE_INFO[d.score-1].c, fill:SCORE_INFO[d.score-1].c, margin:"0 auto 4px" }} />
                    <p style={{ fontSize:16, fontWeight:800, color:SCORE_INFO[d.score-1].c, margin:0 }}>{d.count}</p>
                    <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>Score {d.score}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:10, padding:"8px 12px", background: r.discrepancyRate>4?"rgba(248,113,113,0.05)":"rgba(74,222,128,0.05)", border:`1px solid ${r.discrepancyRate>4?"rgba(248,113,113,0.15)":"rgba(74,222,128,0.15)"}`, borderRadius:8 }}>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.5)", margin:0 }}>Discrepancy rate: <strong style={{ color:r.discrepancyRate>4?"#f87171":"#4ade80" }}>{r.discrepancyRate}%</strong> (target &lt; 5%)</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
