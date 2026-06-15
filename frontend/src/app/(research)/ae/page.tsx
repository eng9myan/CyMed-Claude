"use client";
import { useState } from "react";
import { AlertTriangle, FileText, Send, Plus } from "lucide-react";

type Severity = 1|2|3|4|5;
type SAEStatus = "draft"|"submitted"|"reported_to_irb"|"reported_to_fda"|"closed";
type AE = { id:string; subject:string; study:string; eventDate:string; description:string; ctcae:string; grade:Severity; causality:string; outcome:string; serious:boolean; status:SAEStatus; };

const AES: AE[] = [
  { id:"AE-2026-0084", subject:"Subject 062", study:"CYM-2026-001", eventDate:"2026-06-12", description:"Severe nausea and vomiting × 3 days post-dose", ctcae:"Nausea / Vomiting", grade:3, causality:"Probably related", outcome:"Recovered", serious:false, status:"submitted" },
  { id:"AE-2026-0083", subject:"Subject 058", study:"CYM-2026-001", eventDate:"2026-06-11", description:"Acute pancreatitis — hospitalized, ICU 3 days", ctcae:"Pancreatitis", grade:4, causality:"Probably related", outcome:"Recovering", serious:true, status:"reported_to_fda" },
  { id:"AE-2026-0082", subject:"Subject 142", study:"CYM-2026-002", eventDate:"2026-06-10", description:"Stroke — left MCA, hemiparesis", ctcae:"Cerebrovascular accident", grade:4, causality:"Possibly related", outcome:"Ongoing rehabilitation", serious:true, status:"reported_to_irb" },
  { id:"AE-2026-0081", subject:"Subject 047", study:"CYM-2026-001", eventDate:"2026-06-08", description:"Mild headache resolving with OTC analgesics", ctcae:"Headache", grade:1, causality:"Possibly related", outcome:"Recovered", serious:false, status:"closed" },
];

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const GRADE_COLORS = ["", "#4ade80", "#fbbf24", "#fb923c", "#f87171", "#f43f5e"];

export default function AEReportingPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Adverse Event Reporting</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>SAE notification · CTCAE toxicity grading · MedWatch / CIOMS I · Causality assessment · Regulatory tracking</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>Report New AE</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Total AEs (30d)</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>{AES.length}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Serious (SAE)</p><p style={{ fontSize:24, fontWeight:800, color:"#f43f5e", margin:"4px 0 0" }}>{AES.filter(a=>a.serious).length}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Grade 4-5</p><p style={{ fontSize:24, fontWeight:800, color:"#f87171", margin:"4px 0 0" }}>{AES.filter(a=>a.grade>=4).length}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Awaiting Submission</p><p style={{ fontSize:24, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>{AES.filter(a=>a.status==="draft").length}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>FDA Reported</p><p style={{ fontSize:24, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>{AES.filter(a=>a.status==="reported_to_fda").length}</p></Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>Adverse Event Registry</h3>
        </div>
        {AES.map(a => {
          const gc = GRADE_COLORS[a.grade];
          return (
            <div key={a.id} style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)", borderLeft:a.serious?"3px solid #f43f5e":"3px solid transparent" }}>
              <div style={{ display:"grid", gridTemplateColumns:"200px 1fr 160px 140px", gap:16, alignItems:"center" }}>
                <div>
                  <p style={{ fontSize:10, fontFamily:"monospace", color:"#22d3ee", margin:0 }}>{a.id}</p>
                  <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:"3px 0 0" }}>{a.subject}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{a.study}</p>
                </div>
                <div>
                  <p style={{ fontSize:12, color:"#f1f5f9", margin:0 }}>{a.description}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.5)", margin:"3px 0 0" }}>CTCAE: {a.ctcae} · {a.causality} · Outcome: {a.outcome}</p>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  <span style={{ fontSize:11, background:`${gc}18`, color:gc, borderRadius:5, padding:"3px 10px", fontWeight:800, textAlign:"center" }}>CTCAE Grade {a.grade}</span>
                  {a.serious && <span style={{ fontSize:10, background:"rgba(244,63,94,0.15)", color:"#f43f5e", borderRadius:5, padding:"2px 8px", fontWeight:700, textAlign:"center" }}>⚠ SERIOUS</span>}
                </div>
                <span style={{ fontSize:11, background:"rgba(167,139,250,0.12)", color:"#a78bfa", borderRadius:5, padding:"3px 10px", fontWeight:700, textAlign:"center" }}>{a.status.replace(/_/g," ").toUpperCase()}</span>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
