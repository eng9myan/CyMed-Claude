"use client";
import { Brain, TrendingUp, AlertTriangle, Activity } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const MODELS = [
  { name:"30-Day Readmission Risk",      auc:0.84, lastTrained:"2026-05-22", inputs:"412 features", patients:32400, sensitivity:78, specificity:81, status:"production" },
  { name:"Length-of-Stay Predictor",     auc:0.79, lastTrained:"2026-05-22", inputs:"284 features", patients:32400, sensitivity:74, specificity:82, status:"production" },
  { name:"ED Frequent Utilizer Risk",     auc:0.88, lastTrained:"2026-06-01", inputs:"96 features",  patients:18400, sensitivity:84, specificity:79, status:"production" },
  { name:"No-Show Risk",                  auc:0.81, lastTrained:"2026-04-15", inputs:"42 features",  patients:48000, sensitivity:72, specificity:85, status:"production" },
  { name:"Diabetes Complication Risk",    auc:0.86, lastTrained:"2026-05-30", inputs:"168 features", patients:24000, sensitivity:81, specificity:84, status:"production" },
  { name:"Sepsis 4-hour Predictor",       auc:0.94, lastTrained:"2026-06-08", inputs:"38 vitals/labs", patients:4200, sensitivity:91, specificity:88, status:"production" },
  { name:"Heart Failure 30d Mortality",   auc:0.82, lastTrained:"2026-03-10", inputs:"124 features", patients:8400, sensitivity:76, specificity:80, status:"validation" },
  { name:"Post-Op Complication Risk",     auc:0.77, lastTrained:"2026-02-22", inputs:"218 features", patients:6800, sensitivity:71, specificity:78, status:"shadow" },
];

export default function MLPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:10 }}><Brain style={{ width:24, height:24, color:"#a855f7" }}/>Predictive ML Models</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Readmission · LOS · ED utilization · Complications · Sepsis · Mortality · Real-time scoring & alerting</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Production Models</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>{MODELS.filter(m=>m.status==="production").length}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Avg AUC</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>{(MODELS.reduce((s,m)=>s+m.auc,0)/MODELS.length).toFixed(2)}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Total Predictions (mo)</p><p style={{ fontSize:24, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>4.8M</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Models Retraining</p><p style={{ fontSize:24, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>2</p></Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>Model Registry</h3>
        </div>
        {MODELS.map(m => (
          <div key={m.name} style={{ padding:"16px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"grid", gridTemplateColumns:"1fr 80px 80px 80px 100px 100px", gap:14, alignItems:"center" }}>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>{m.name}</p>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{m.inputs} · Trained {m.lastTrained}</p>
            </div>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>AUC</p>
              <p style={{ fontSize:14, color:m.auc>=0.85?"#4ade80":m.auc>=0.75?"#fbbf24":"#f87171", margin:0, fontWeight:800 }}>{m.auc}</p>
            </div>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>Sens</p>
              <p style={{ fontSize:14, color:"#22d3ee", margin:0, fontWeight:700 }}>{m.sensitivity}%</p>
            </div>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>Spec</p>
              <p style={{ fontSize:14, color:"#22d3ee", margin:0, fontWeight:700 }}>{m.specificity}%</p>
            </div>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>Patients</p>
              <p style={{ fontSize:12, color:"#a78bfa", margin:0, fontWeight:700 }}>{(m.patients/1000).toFixed(1)}K</p>
            </div>
            <span style={{ fontSize:10, background:m.status==="production"?"rgba(74,222,128,0.12)":m.status==="validation"?"rgba(251,191,36,0.12)":"rgba(167,139,250,0.12)", color:m.status==="production"?"#4ade80":m.status==="validation"?"#fbbf24":"#a78bfa", borderRadius:5, padding:"3px 10px", fontWeight:700, textAlign:"center", textTransform:"uppercase" }}>{m.status}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
