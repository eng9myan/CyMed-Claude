"use client";
import { Shield, AlertTriangle, Activity, Package, Users, Building } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function PandemicPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:10 }}><Shield style={{ width:24, height:24, color:"#f43f5e" }}/>Emergency Preparedness & Pandemic Response</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>EOC activation · Surge capacity planning · PPE stockpile · Mass casualty protocols · Pandemic coordination</p>
      </div>

      <Card style={{ padding:18, marginBottom:14, background:"linear-gradient(135deg, rgba(74,222,128,0.08), rgba(34,211,238,0.04))", border:"1px solid rgba(74,222,128,0.2)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:14, height:14, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 12px rgba(74,222,128,0.6)", animation:"pulse 2s infinite" }} />
          <div>
            <p style={{ fontSize:14, fontWeight:800, color:"#f1f5f9", margin:0 }}>EOC Status: GREEN — Normal Operations</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:"3px 0 0" }}>Last activated 2024-03-15 (COVID-19 wave) · Next drill scheduled 2026-09-12</p>
          </div>
        </div>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16 }}>
        <Card style={{ padding:"14px 18px" }}><Activity style={{ width:14, height:14, color:"#22d3ee", marginBottom:6 }}/><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Current Surge Capacity</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>34%</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>headroom available</p></Card>
        <Card style={{ padding:"14px 18px" }}><Building style={{ width:14, height:14, color:"#a78bfa", marginBottom:6 }}/><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Field Hospital Sites</p><p style={{ fontSize:24, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>4</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>pre-staged, 8h deploy</p></Card>
        <Card style={{ padding:"14px 18px" }}><Package style={{ width:14, height:14, color:"#fbbf24", marginBottom:6 }}/><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>PPE Stockpile (90d)</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>91%</p></Card>
        <Card style={{ padding:"14px 18px" }}><Users style={{ width:14, height:14, color:"#f472b6", marginBottom:6 }}/><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Reserve Workforce</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>3,240</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>retired clinicians registered</p></Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>National Surge Capacity</h3>
          {[
            { label:"ICU beds available",       v:312, t:1200, c:"#22d3ee" },
            { label:"Ventilators available",    v:840, t:1500, c:"#a78bfa" },
            { label:"Isolation rooms",          v:420, t:600,  c:"#4ade80" },
            { label:"Field hospital beds (ready)", v:0, t:2000, c:"#fbbf24" },
          ].map(s => {
            const pct = (s.v/s.t)*100;
            return (
              <div key={s.label} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>{s.label}</span>
                  <span style={{ fontSize:11, color:s.c, fontWeight:700 }}>{s.v.toLocaleString()} / {s.t.toLocaleString()}</span>
                </div>
                <div style={{ height:8, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", background:s.c, width:`${pct}%` }} />
                </div>
              </div>
            );
          })}
        </Card>

        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>PPE Stockpile Status</h3>
          {[
            { item:"N95 respirators",     stock:3200000, days:120, c:"#4ade80" },
            { item:"Surgical masks",      stock:8400000, days:180, c:"#4ade80" },
            { item:"Isolation gowns",     stock:1800000, days:90,  c:"#4ade80" },
            { item:"Nitrile gloves (pairs)", stock:5200000, days:60,  c:"#fbbf24" },
            { item:"Face shields",        stock:240000,  days:45,  c:"#fbbf24" },
            { item:"Body bags",           stock:18000,   days:30,  c:"#fb923c" },
          ].map(p => (
            <div key={p.item} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>{p.item}</span>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontSize:12, color:"#f1f5f9", margin:0, fontWeight:700 }}>{(p.stock/1000).toFixed(0)}K</p>
                <p style={{ fontSize:10, color:p.c, margin:0, fontWeight:600 }}>{p.days}d supply</p>
              </div>
            </div>
          ))}
        </Card>

        <Card style={{ padding:18, gridColumn:"1 / -1" }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Response Plans & Drills</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
            {[
              { name:"Respiratory Pandemic Plan", v:"v4.2", date:"2026-04-15", status:"current" },
              { name:"Bioterrorism Response",     v:"v2.8", date:"2025-11-22", status:"current" },
              { name:"Mass Casualty Incident",    v:"v3.1", date:"2026-02-08", status:"current" },
              { name:"Chemical Hazard",           v:"v2.0", date:"2024-10-30", status:"review_due" },
              { name:"Radiological Emergency",    v:"v2.4", date:"2025-08-14", status:"current" },
              { name:"Cyber Attack Continuity",   v:"v1.5", date:"2024-06-12", status:"review_due" },
            ].map(p => (
              <div key={p.name} style={{ padding:"12px 14px", background:"rgba(255,255,255,0.02)", border:`1px solid ${p.status==="current"?"rgba(74,222,128,0.15)":"rgba(251,191,36,0.15)"}`, borderRadius:10, borderLeft:`3px solid ${p.status==="current"?"#4ade80":"#fbbf24"}` }}>
                <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:0 }}>{p.name}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"4px 0 0" }}>{p.v} · Reviewed {p.date}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
