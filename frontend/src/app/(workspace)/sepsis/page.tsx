"use client";
import { Activity, AlertTriangle, TrendingUp, Brain, Heart } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const PATIENTS = [
  { name:"Ahmad Al-Rashid", bed:"ICU-4", risk:0.84, prediction:"Sepsis likely within 4h", drivers:["WBC 18.4","Lactate 3.2","Temp 39.1","HR 122","BP 88/52"], action:"⚠ Bundle activated 09:14" },
  { name:"Sara Al-Ghamdi",  bed:"Med-7B", risk:0.62, prediction:"Deterioration risk 4-6h", drivers:["NEWS2 score 7","SpO2 dropping 91%","RR 26"], action:"Rapid Response notified" },
  { name:"Khalid Al-Dosari",bed:"Surg-2", risk:0.34, prediction:"Watch — borderline", drivers:["WBC 11.8","Temp 37.9","Mild tachycardia"], action:"Increase monitoring frequency" },
  { name:"Omar Al-Shehri",  bed:"Med-3A", risk:0.18, prediction:"Stable", drivers:[], action:"Routine monitoring" },
];

export default function SepsisPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:10 }}><Brain style={{ width:24, height:24, color:"#f43f5e" }}/>Sepsis & Clinical Deterioration AI</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Real-time risk scoring · 4-6 hour predictive horizon · NEWS2 + ML model · Surviving Sepsis bundle auto-trigger</p>
      </div>

      <Card style={{ padding:16, marginBottom:14, background:"linear-gradient(90deg, rgba(244,63,94,0.08), rgba(244,63,94,0.02))", border:"1px solid rgba(244,63,94,0.2)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <AlertTriangle style={{ width:24, height:24, color:"#f43f5e" }} />
          <div style={{ flex:1 }}>
            <p style={{ fontSize:14, fontWeight:800, color:"#f1f5f9", margin:0 }}>1 patient at high sepsis risk · 2 patients at deterioration risk</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:"3px 0 0" }}>Model: CyMed-DeteriorationNet v3.2 · AUC 0.94 · Updated every 15 min</p>
          </div>
        </div>
      </Card>

      <div style={{ display:"grid", gap:10 }}>
        {PATIENTS.map(p => {
          const color = p.risk >= 0.7 ? "#f43f5e" : p.risk >= 0.5 ? "#f87171" : p.risk >= 0.3 ? "#fbbf24" : "#4ade80";
          return (
            <Card key={p.name} style={{ padding:18, borderLeft:`3px solid ${color}` }}>
              <div style={{ display:"grid", gridTemplateColumns:"180px 100px 1fr 1fr 240px", gap:16, alignItems:"center" }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>{p.name}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>Bed {p.bed}</p>
                </div>
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>Risk Score</p>
                  <p style={{ fontSize:28, color, margin:0, fontWeight:900 }}>{(p.risk*100).toFixed(0)}<span style={{ fontSize:14 }}>%</span></p>
                </div>
                <div>
                  <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:"0 0 4px", textTransform:"uppercase", fontWeight:700 }}>Prediction</p>
                  <p style={{ fontSize:12, color:color, fontWeight:700, margin:0 }}>{p.prediction}</p>
                </div>
                <div>
                  <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:"0 0 4px", textTransform:"uppercase", fontWeight:700 }}>Top Risk Drivers</p>
                  <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                    {p.drivers.length > 0 ? p.drivers.map(d => <span key={d} style={{ fontSize:10, background:`${color}15`, color, borderRadius:5, padding:"1px 7px", fontWeight:600 }}>{d}</span>) : <span style={{ fontSize:11, color:"#4ade80" }}>None identified</span>}
                  </div>
                </div>
                <div style={{ background:`${color}08`, border:`1px solid ${color}25`, borderRadius:8, padding:"8px 12px" }}>
                  <p style={{ fontSize:11, color:color, margin:0, fontWeight:700 }}>{p.action}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
