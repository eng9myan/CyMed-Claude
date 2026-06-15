"use client";
import { useState } from "react";
import { Bug as Virus, AlertTriangle, TrendingUp, Map, Activity } from "lucide-react";

type Disease = { name:string; category:string; cases7d:number; cases30d:number; trend:"up"|"down"|"stable"; rNumber?:number; alertLevel:"normal"|"elevated"|"outbreak" };

const DISEASES: Disease[] = [
  { name:"Influenza A",        category:"Respiratory", cases7d:240, cases30d:840,  trend:"up",     rNumber:1.42, alertLevel:"elevated" },
  { name:"COVID-19",           category:"Respiratory", cases7d:38,  cases30d:142,  trend:"down",   rNumber:0.91, alertLevel:"normal" },
  { name:"Dengue",             category:"Vector-borne",cases7d:12,  cases30d:34,   trend:"up",     rNumber:1.18, alertLevel:"elevated" },
  { name:"Salmonella enteritis",category:"Food-borne", cases7d:62,  cases30d:84,   trend:"up",     alertLevel:"outbreak" },
  { name:"Measles",            category:"VPD",         cases7d:3,   cases30d:8,    trend:"stable", alertLevel:"normal" },
  { name:"MERS-CoV",           category:"Respiratory", cases7d:0,   cases30d:0,    trend:"stable", alertLevel:"normal" },
  { name:"Hepatitis A",        category:"Food-borne",  cases7d:8,   cases30d:24,   trend:"stable", alertLevel:"normal" },
  { name:"TB (active)",        category:"Respiratory", cases7d:4,   cases30d:18,   trend:"stable", alertLevel:"normal" },
];

const ALERTS = [
  { id:"OB001", disease:"Salmonella enteritis", location:"Riyadh — Industrial District restaurants",  cases:62, status:"Cluster confirmed", action:"Inspection team dispatched 2026-06-12" },
  { id:"OB002", disease:"Dengue", location:"Eastern Province — Jubail",  cases:12, status:"Aedes mosquito breeding sites identified", action:"Vector control programme activated" },
];

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function SurveillancePage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Disease Surveillance</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Syndromic surveillance · Outbreak detection · Notifiable disease auto-reporting · R-number tracking · Geographic heat maps</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Active Outbreaks</p><p style={{ fontSize:24, fontWeight:800, color:"#f43f5e", margin:"4px 0 0" }}>{DISEASES.filter(d=>d.alertLevel==="outbreak").length}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Elevated Alerts</p><p style={{ fontSize:24, fontWeight:800, color:"#fb923c", margin:"4px 0 0" }}>{DISEASES.filter(d=>d.alertLevel==="elevated").length}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Total Cases (7d)</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>{DISEASES.reduce((s,d)=>s+d.cases7d,0)}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>R-Number &gt; 1</p><p style={{ fontSize:24, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>{DISEASES.filter(d=>d.rNumber&&d.rNumber>1).length}</p></Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Notifiable Disease Tracker</h3>
          {DISEASES.map(d => {
            const c = d.alertLevel === "outbreak" ? "#f43f5e" : d.alertLevel === "elevated" ? "#fb923c" : "#4ade80";
            return (
              <div key={d.name} style={{ padding:"10px 12px", marginBottom:7, background:"rgba(255,255,255,0.02)", borderRadius:10, borderLeft:`3px solid ${c}`, display:"flex", alignItems:"center" }}>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:0 }}>{d.name}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{d.category}</p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ textAlign:"right" }}><p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>7d</p><p style={{ fontSize:14, color:"#f1f5f9", margin:0, fontWeight:700 }}>{d.cases7d}</p></div>
                  <div style={{ textAlign:"right" }}><p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>R₀</p><p style={{ fontSize:14, color:d.rNumber&&d.rNumber>1?"#f87171":"#4ade80", margin:0, fontWeight:700 }}>{d.rNumber ?? "—"}</p></div>
                  <TrendingUp style={{ width:13, height:13, color:d.trend==="up"?"#f87171":d.trend==="down"?"#4ade80":"rgba(255,255,255,0.4)", transform:d.trend==="down"?"rotate(180deg)":d.trend==="stable"?"rotate(90deg)":"none" }} />
                </div>
              </div>
            );
          })}
        </Card>

        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Active Outbreak Alerts</h3>
          {ALERTS.map(a => (
            <div key={a.id} style={{ padding:14, marginBottom:10, background:"rgba(248,113,113,0.05)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <AlertTriangle style={{ width:14, height:14, color:"#f87171" }} />
                <span style={{ fontSize:13, fontWeight:800, color:"#f87171" }}>{a.disease}</span>
                <span style={{ fontSize:9, color:"rgba(255,255,255,0.4)", fontFamily:"monospace", marginLeft:"auto" }}>{a.id}</span>
              </div>
              <p style={{ fontSize:12, color:"#f1f5f9", margin:"0 0 4px" }}>📍 {a.location}</p>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:"0 0 6px" }}>{a.cases} cases · {a.status}</p>
              <p style={{ fontSize:11, color:"#4ade80", margin:0 }}>→ {a.action}</p>
            </div>
          ))}

          <div style={{ background:"linear-gradient(135deg, rgba(34,211,238,0.06), rgba(167,139,250,0.04))", border:"1px solid rgba(34,211,238,0.15)", borderRadius:12, padding:30, marginTop:14, textAlign:"center" }}>
            <Map style={{ width:32, height:32, color:"#22d3ee", margin:"0 auto 8px" }} />
            <p style={{ fontSize:12, color:"#f1f5f9", margin:0, fontWeight:700 }}>Geographic Heat Map</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"4px 0 0" }}>Real-time case density visualization</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
