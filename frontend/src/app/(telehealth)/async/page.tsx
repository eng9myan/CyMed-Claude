"use client";

import { useState } from "react";
import { Camera, Clock, CheckCircle2, Send, Plus, Filter, Stethoscope, AlertTriangle, Image } from "lucide-react";

type Specialty = "Dermatology" | "Ophthalmology" | "Wound Care" | "General";
type ReqStatus = "submitted" | "in_review" | "responded" | "needs_visit";

type Request = {
  id: string; patient: string; specialty: Specialty; reason: string;
  submittedAt: string; sla: string; status: ReqStatus; assignedTo?: string;
  photoCount: number; symptoms: string;
  response?: string;
};

const REQS: Request[] = [
  { id:"AF001", patient:"Ahmad Al-Rashid", specialty:"Dermatology", reason:"Persistent rash on arms × 3 weeks", submittedAt:"2026-06-13 10:14", sla:"48h", status:"in_review", assignedTo:"Dr. Al-Ghamdi (Derm)", photoCount:4, symptoms:"Itchy, scaly patches on forearms. Worse at night. No new soaps/detergents." },
  { id:"AF002", patient:"Fatima Al-Zahra", specialty:"Ophthalmology", reason:"Red eye, photosensitive", submittedAt:"2026-06-13 09:42", sla:"24h", status:"submitted", photoCount:2, symptoms:"Left eye red, mild pain, photophobia. No discharge. Onset yesterday morning." },
  { id:"AF003", patient:"Sara Al-Ghamdi", specialty:"Wound Care", reason:"Diabetic foot ulcer photo follow-up", submittedAt:"2026-06-12 16:30", sla:"24h", status:"responded", assignedTo:"WC Nurse Layla", photoCount:6, symptoms:"Weekly photo update — left plantar foot ulcer. No new pain.", response:"Wound shows healing — granulation tissue improving. Continue NPWT, next photo in 7 days. No clinic visit needed." },
  { id:"AF004", patient:"Khalid Al-Dosari", specialty:"Dermatology", reason:"New mole, evaluating for changes", submittedAt:"2026-06-11 14:15", sla:"48h", status:"needs_visit", assignedTo:"Dr. Al-Ghamdi (Derm)", photoCount:8, symptoms:"5mm pigmented lesion on back. Asymmetric, irregular border.", response:"⚠ ABCDE features warrant in-person dermoscopy. Booking dermatology clinic appointment within 2 weeks." },
  { id:"AF005", patient:"Omar Al-Shehri", specialty:"General", reason:"Skin lesion identification", submittedAt:"2026-06-10 19:22", sla:"48h", status:"responded", assignedTo:"Dr. Al-Mutawa (PCP)", photoCount:3, symptoms:"Small lesion on chin, recently appeared", response:"Appears consistent with benign seborrheic keratosis. No treatment needed. Re-photograph if changes." },
];

const SPEC_META: Record<Specialty,{c:string}> = {
  Dermatology:{c:"#f472b6"}, Ophthalmology:{c:"#22d3ee"}, "Wound Care":{c:"#fb923c"}, General:{c:"#a78bfa"},
};

const STATUS_META: Record<ReqStatus,{c:string;bg:string;label:string}> = {
  submitted:  {c:"#22d3ee",bg:"rgba(34,211,238,0.1)",label:"Submitted"},
  in_review:  {c:"#fbbf24",bg:"rgba(251,191,36,0.1)",label:"In Review"},
  responded:  {c:"#4ade80",bg:"rgba(74,222,128,0.1)",label:"Responded"},
  needs_visit:{c:"#fb923c",bg:"rgba(251,146,60,0.1)",label:"Needs In-Person"},
};

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function StoreForwardPage() {
  const [active, setActive] = useState<Request>(REQS[0]);

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Store-and-Forward Telemedicine</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Async photo/video submission · Symptom questionnaire · Clinician review SLA · Dermatology · Ophthalmology · Wound Care</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }} />New Request</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"380px 1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {REQS.map(r => {
            const sm = STATUS_META[r.status];
            const spm = SPEC_META[r.specialty];
            return (
              <Card key={r.id} style={{ padding:14, cursor:"pointer", border:`1px solid ${active.id===r.id?"rgba(230,126,34,0.3)":"rgba(255,255,255,0.07)"}`, background:active.id===r.id?"rgba(230,126,34,0.07)":"rgba(255,255,255,0.03)" }} onClick={()=>setActive(r)}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:11, fontFamily:"monospace", color:"#22d3ee" }}>{r.id}</span>
                  <span style={{ fontSize:9, background:sm.bg, color:sm.c, borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{sm.label}</span>
                </div>
                <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:0 }}>{r.patient}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{r.reason}</p>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:8 }}>
                  <span style={{ fontSize:9, background:`${spm.c}18`, color:spm.c, borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{r.specialty}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, color:"rgba(255,255,255,0.4)" }}>
                    <Image style={{ width:10, height:10 }} />{r.photoCount} photos · SLA {r.sla}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card style={{ padding:22 }}>
          <h2 style={{ fontSize:17, fontWeight:800, color:"#f1f5f9", margin:"0 0 4px" }}>{active.id} — {active.patient}</h2>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"0 0 18px" }}>{active.reason} · Submitted {active.submittedAt}</p>

          <div style={{ marginBottom:18 }}>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Submitted Photos ({active.photoCount})</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
              {Array.from({length: Math.min(4, active.photoCount)}).map((_,i) => (
                <div key={i} style={{ aspectRatio:"1", background:"linear-gradient(135deg, rgba(34,211,238,0.08), rgba(167,139,250,0.05))", border:"1px dashed rgba(255,255,255,0.1)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Camera style={{ width:20, height:20, color:"rgba(255,255,255,0.3)" }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:18 }}>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Patient Symptoms</p>
            <p style={{ fontSize:12, color:"#f1f5f9", margin:0, lineHeight:1.6, padding:"12px 14px", background:"rgba(34,211,238,0.04)", borderLeft:"3px solid #22d3ee", borderRadius:8 }}>{active.symptoms}</p>
          </div>

          {active.response ? (
            <div>
              <p style={{ fontSize:10, color:"rgba(74,222,128,0.7)", margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700, display:"flex", alignItems:"center", gap:5 }}><Stethoscope style={{ width:10, height:10 }} />Clinician Response · {active.assignedTo}</p>
              <p style={{ fontSize:12, color:"#f1f5f9", margin:0, lineHeight:1.6, padding:"12px 14px", background:"rgba(74,222,128,0.05)", border:"1px solid rgba(74,222,128,0.15)", borderRadius:10 }}>{active.response}</p>
            </div>
          ) : (
            <div>
              <textarea placeholder="Write your clinical response..." rows={4} style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", color:"#f1f5f9", fontSize:12, outline:"none", resize:"vertical" }} />
              <div style={{ display:"flex", gap:8, marginTop:10 }}>
                <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><Send style={{ width:13, height:13 }} />Send Response</button>
                <button style={{ background:"rgba(251,146,60,0.1)", border:"1px solid rgba(251,146,60,0.3)", color:"#fb923c", borderRadius:10, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer" }}>Refer to In-Person Visit</button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
