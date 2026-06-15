"use client";
import { Brain, CheckCircle2, AlertTriangle, Scan } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const AI_READS = [
  { id:"AI-26841", modality:"CXR", patient:"Ahmad Al-Rashid", model:"CyMed-CXR-v4", findings:[{label:"Pneumonia (right lower)", confidence:94, flag:true},{label:"Cardiomegaly", confidence:62, flag:false},{label:"Pleural effusion", confidence:18, flag:false}], status:"radiologist_review" },
  { id:"AI-26842", modality:"CT Head", patient:"Sara Al-Ghamdi", model:"CyMed-CT-Head-v3", findings:[{label:"Intracerebral hemorrhage", confidence:96, flag:true},{label:"Midline shift 4mm", confidence:88, flag:true},{label:"Mass effect", confidence:71, flag:true}], status:"critical_alert" },
  { id:"AI-26843", modality:"Mammo", patient:"Layla Al-Otaibi", model:"CyMed-Mammo-v5", findings:[{label:"Dense breast tissue (Type C)", confidence:98, flag:false},{label:"Suspicious mass URQ left", confidence:84, flag:true},{label:"Architectural distortion", confidence:42, flag:false}], status:"radiologist_review" },
  { id:"AI-26844", modality:"CXR", patient:"Omar Al-Shehri", model:"CyMed-CXR-v4", findings:[{label:"No acute findings", confidence:91, flag:false}], status:"auto_released" },
];

const METRICS = [
  { name:"Pneumonia detection (CXR)", sensitivity:94, specificity:91, npv:96, reads:8400 },
  { name:"Hemorrhage detection (CT Head)", sensitivity:97, specificity:94, npv:99, reads:2200 },
  { name:"Mammography lesion (cancer)", sensitivity:88, specificity:84, npv:97, reads:6200 },
  { name:"Pulmonary embolism (CTPA)", sensitivity:92, specificity:89, npv:98, reads:1800 },
];

export default function AIImagingPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:10 }}><Brain style={{ width:24, height:24, color:"#a78bfa" }}/>AI-Assisted Medical Imaging</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>CXR · CT Head · Mammography · Triage · Critical findings flagged · Performance tracking · FDA-cleared models</p>
      </div>

      <Card style={{ padding:16, marginBottom:14, background:"rgba(244,63,94,0.05)", border:"1px solid rgba(244,63,94,0.2)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <AlertTriangle style={{ width:18, height:18, color:"#f43f5e" }} />
          <p style={{ fontSize:13, fontWeight:700, color:"#f43f5e", margin:0 }}>1 critical AI alert — STAT CT Head (intracerebral hemorrhage 96%) — radiologist notified 09:24</p>
        </div>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.7)", margin:0, textTransform:"uppercase", letterSpacing:"0.07em" }}>Recent AI Reads</h3>
          {AI_READS.map(r => {
            const critical = r.status === "critical_alert";
            return (
              <Card key={r.id} style={{ padding:14, borderLeft:critical?"3px solid #f43f5e":"3px solid transparent" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                  <div>
                    <p style={{ fontSize:11, fontFamily:"monospace", color:"#22d3ee", margin:0 }}>{r.id}</p>
                    <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:"2px 0 0" }}>{r.patient} · {r.modality}</p>
                  </div>
                  <span style={{ fontSize:9, background:critical?"rgba(244,63,94,0.15)":r.status==="auto_released"?"rgba(74,222,128,0.12)":"rgba(251,191,36,0.12)", color:critical?"#f43f5e":r.status==="auto_released"?"#4ade80":"#fbbf24", borderRadius:5, padding:"3px 8px", fontWeight:700, textTransform:"uppercase" }}>{r.status.replace("_"," ")}</span>
                </div>
                <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:"0 0 6px" }}>Model: {r.model}</p>
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  {r.findings.map(f => (
                    <div key={f.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"4px 0" }}>
                      <span style={{ fontSize:11, color: f.flag?"#f87171":"rgba(255,255,255,0.65)", fontWeight: f.flag?600:400 }}>{f.flag && "⚠ "}{f.label}</span>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ width:50, height:5, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                          <div style={{ height:"100%", background:f.confidence>=85?"#f87171":f.confidence>=60?"#fbbf24":"#4ade80", width:`${f.confidence}%` }} />
                        </div>
                        <span style={{ fontSize:10, color:"rgba(255,255,255,0.5)", width:36, textAlign:"right" }}>{f.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>AI Model Performance (90 days)</h3>
          {METRICS.map(m => (
            <div key={m.name} style={{ padding:14, marginBottom:8, background:"rgba(255,255,255,0.02)", borderRadius:10 }}>
              <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:"0 0 8px" }}>{m.name}</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
                <div><p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>Sens</p><p style={{ fontSize:14, color:"#4ade80", margin:0, fontWeight:800 }}>{m.sensitivity}%</p></div>
                <div><p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>Spec</p><p style={{ fontSize:14, color:"#22d3ee", margin:0, fontWeight:800 }}>{m.specificity}%</p></div>
                <div><p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>NPV</p><p style={{ fontSize:14, color:"#a78bfa", margin:0, fontWeight:800 }}>{m.npv}%</p></div>
                <div><p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>Reads</p><p style={{ fontSize:14, color:"#fbbf24", margin:0, fontWeight:800 }}>{m.reads.toLocaleString()}</p></div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
