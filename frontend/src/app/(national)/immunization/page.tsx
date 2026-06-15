"use client";
import { Syringe, Shield, Users, TrendingUp } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const VACCINES = [
  { name:"BCG (TB) — newborn",      coverage:98.4, target:95, doses:482000 },
  { name:"Polio (IPV) full series",  coverage:95.2, target:95, doses:1840000 },
  { name:"Hexavalent (DTaP-HepB-IPV-Hib)", coverage:94.8, target:95, doses:1620000 },
  { name:"MMR — 12 months",          coverage:92.1, target:95, doses:480000 },
  { name:"PCV13 — Pneumococcal",     coverage:91.4, target:90, doses:540000 },
  { name:"Rotavirus — Rota 1+2",     coverage:88.6, target:90, doses:480000 },
  { name:"HPV — adolescent",         coverage:64.2, target:80, doses:380000 },
  { name:"Influenza — annual (>6m)", coverage:38.4, target:60, doses:8200000 },
  { name:"COVID-19 primary series",  coverage:84.2, target:80, doses:28400000 },
];

export default function ImmunizationPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:10 }}><Syringe style={{ width:24, height:24, color:"#4ade80" }} />National Immunization Registry</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>EPI schedule · Coverage tracking · Cold chain · AEFI monitoring · Vaccination certificates</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Total Records</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>34.2M</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Childhood Coverage</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>93.4%</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Cold Chain Sites</p><p style={{ fontSize:24, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>1,240</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>AEFI Cases (90d)</p><p style={{ fontSize:24, fontWeight:800, color:"#fb923c", margin:"4px 0 0" }}>42</p></Card>
      </div>

      <Card style={{ padding:18, marginBottom:16 }}>
        <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>National Coverage by Vaccine</h3>
        {VACCINES.map(v => {
          const c = v.coverage >= v.target ? "#4ade80" : v.coverage >= v.target - 10 ? "#fbbf24" : "#f87171";
          return (
            <div key={v.name} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:12, color:"#f1f5f9" }}>{v.name}</span>
                <span style={{ fontSize:12, color:c, fontWeight:700 }}>{v.coverage}% (target {v.target}%) · {(v.doses/1000).toFixed(0)}K doses</span>
              </div>
              <div style={{ height:8, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden", position:"relative" }}>
                <div style={{ height:"100%", background:c, width:`${v.coverage}%`, borderRadius:4 }} />
                <div style={{ position:"absolute", top:-3, height:14, width:2, background:"#fbbf24", left:`${v.target}%` }} />
              </div>
            </div>
          );
        })}
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Coverage by Region</h3>
          {[
            { region:"Riyadh Region", coverage:96.2 },
            { region:"Makkah Region", coverage:94.8 },
            { region:"Eastern Region", coverage:93.4 },
            { region:"Asir Region",   coverage:88.2 },
            { region:"Tabuk Region",  coverage:84.6 },
            { region:"Northern Border", coverage:78.4 },
          ].map(r => (
            <div key={r.region} style={{ display:"flex", alignItems:"center", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.6)", flex:1 }}>{r.region}</span>
              <div style={{ width:120, height:6, background:"rgba(255,255,255,0.06)", borderRadius:4, marginRight:10, overflow:"hidden" }}>
                <div style={{ height:"100%", background:r.coverage>=95?"#4ade80":r.coverage>=90?"#fbbf24":"#f87171", width:`${r.coverage}%` }} />
              </div>
              <span style={{ fontSize:12, color:r.coverage>=95?"#4ade80":r.coverage>=90?"#fbbf24":"#f87171", fontWeight:700, width:50, textAlign:"right" }}>{r.coverage}%</span>
            </div>
          ))}
        </Card>

        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Cold Chain Status</h3>
          {[
            { label:"Cold chain compliance",    v:"99.4%", c:"#4ade80" },
            { label:"Temperature excursions (30d)", v:"22", c:"#fbbf24" },
            { label:"Vaccine wastage rate",     v:"3.2%", c:"#4ade80" },
            { label:"Sites with backup power",  v:"94%",  c:"#4ade80" },
            { label:"Annual cold chain audits", v:"1,180 / 1,240", c:"#22d3ee" },
          ].map(s => (
            <div key={s.label} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>{s.label}</span>
              <span style={{ fontSize:13, color:s.c, fontWeight:700 }}>{s.v}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
