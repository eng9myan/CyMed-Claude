"use client";
import { useState } from "react";
import { TrendingUp, Target, Award, AlertTriangle, DollarSign, Users } from "lucide-react";

type Contract = { id:string; name:string; payer:string; type:string; lives:number; revenue:number; quality:number; savings:number; status:"on_track"|"at_risk"|"exceeding"; };

const CONTRACTS: Contract[] = [
  { id:"VBC1", name:"Diabetes Bundled Care",  payer:"Bupa Arabia", type:"BPCI", lives:2840, revenue:4250000, quality:87, savings:312000, status:"on_track" },
  { id:"VBC2", name:"ACO REACH — Primary Care",payer:"NPHIES",     type:"ACO REACH", lives:8240, revenue:12400000, quality:91, savings:842000, status:"exceeding" },
  { id:"VBC3", name:"CHF Readmission Bundle",  payer:"Tawuniya",   type:"BPCI",  lives:1240, revenue:2180000, quality:78, savings:-45000, status:"at_risk" },
  { id:"VBC4", name:"Joint Replacement CJR",   payer:"Daman",      type:"CJR",   lives:480,  revenue:1850000, quality:84, savings:142000, status:"on_track" },
];

const QUALITY_MEASURES = [
  { name:"HbA1c control (<8%)",          actual:78, target:75, c:"#4ade80" },
  { name:"BP control (<140/90)",          actual:82, target:80, c:"#4ade80" },
  { name:"Eye exam (annual)",             actual:71, target:70, c:"#4ade80" },
  { name:"Nephropathy screening",         actual:68, target:75, c:"#f87171" },
  { name:"Foot exam (annual)",            actual:64, target:75, c:"#f87171" },
  { name:"Statin therapy",                actual:88, target:85, c:"#4ade80" },
];

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function VBCPage() {
  const [active, setActive] = useState<Contract>(CONTRACTS[1]);
  const totalLives = CONTRACTS.reduce((s,c)=>s+c.lives,0);
  const totalSavings = CONTRACTS.reduce((s,c)=>s+c.savings,0);
  const avgQuality = Math.round(CONTRACTS.reduce((s,c)=>s+c.quality,0) / CONTRACTS.length);

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Value-Based Care Tracking</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>ACO REACH · CJR · BPCI · Quality measures · Shared savings · Attributed panels · MLR tracking</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><Users style={{ width:14, height:14, color:"#22d3ee", marginBottom:6 }}/><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Attributed Lives</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>{totalLives.toLocaleString()}</p></Card>
        <Card style={{ padding:"14px 18px" }}><DollarSign style={{ width:14, height:14, color:"#4ade80", marginBottom:6 }}/><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Shared Savings YTD</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>SAR {(totalSavings/1000).toFixed(0)}K</p></Card>
        <Card style={{ padding:"14px 18px" }}><Award style={{ width:14, height:14, color:"#fbbf24", marginBottom:6 }}/><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Avg Quality Score</p><p style={{ fontSize:24, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>{avgQuality}%</p></Card>
        <Card style={{ padding:"14px 18px" }}><AlertTriangle style={{ width:14, height:14, color:"#f87171", marginBottom:6 }}/><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>At-Risk Contracts</p><p style={{ fontSize:24, fontWeight:800, color:"#f87171", margin:"4px 0 0" }}>{CONTRACTS.filter(c=>c.status==="at_risk").length}</p></Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>VBC Contracts</h3>
          {CONTRACTS.map(c => {
            const color = c.status === "exceeding" ? "#4ade80" : c.status === "at_risk" ? "#f87171" : "#22d3ee";
            return (
              <div key={c.id} onClick={()=>setActive(c)} style={{ padding:"12px 14px", marginBottom:8, background:active.id===c.id?"rgba(230,126,34,0.08)":"rgba(255,255,255,0.02)", border:`1px solid ${active.id===c.id?"rgba(230,126,34,0.25)":"rgba(255,255,255,0.05)"}`, borderRadius:10, borderLeft:`3px solid ${color}`, cursor:"pointer" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:0 }}>{c.name}</p>
                  <span style={{ fontSize:9, background:`${color}18`, color, borderRadius:5, padding:"2px 7px", fontWeight:700, textTransform:"uppercase" }}>{c.status.replace("_"," ")}</span>
                </div>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 6px" }}>{c.payer} · {c.type} · {c.lives.toLocaleString()} lives</p>
                <div style={{ display:"flex", gap:14, fontSize:11 }}>
                  <span style={{ color:"rgba(255,255,255,0.5)" }}>Revenue: <strong style={{ color:"#22d3ee" }}>SAR {(c.revenue/1000000).toFixed(1)}M</strong></span>
                  <span style={{ color:"rgba(255,255,255,0.5)" }}>Quality: <strong style={{ color }}>{c.quality}%</strong></span>
                  <span style={{ color:"rgba(255,255,255,0.5)" }}>Savings: <strong style={{ color: c.savings>=0 ? "#4ade80" : "#f87171" }}>SAR {(c.savings/1000).toFixed(0)}K</strong></span>
                </div>
              </div>
            );
          })}
        </Card>

        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Quality Measures — {active.name}</h3>
          {QUALITY_MEASURES.map(m => {
            const pct = (m.actual / 100) * 100;
            return (
              <div key={m.name} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>{m.name}</span>
                  <span style={{ fontSize:11, color:m.c, fontWeight:700 }}>{m.actual}% / target {m.target}%</span>
                </div>
                <div style={{ height:8, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden", position:"relative" }}>
                  <div style={{ height:"100%", background:m.c, width:`${pct}%`, borderRadius:4 }} />
                  <div style={{ position:"absolute", top:-3, height:14, width:2, background:"#fbbf24", left:`${m.target}%` }} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
