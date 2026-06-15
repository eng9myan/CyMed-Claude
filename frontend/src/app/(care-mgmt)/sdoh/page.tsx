"use client";
import { Home, AlertTriangle, HandHeart, CheckCircle2, Users } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const SDOH_DOMAINS = [
  { domain:"Food Insecurity",         positive:1240, total:8400, pct:14.8, c:"#fb923c" },
  { domain:"Housing Instability",     positive:480,  total:8400, pct:5.7,  c:"#f87171" },
  { domain:"Transportation Barrier",  positive:1820, total:8400, pct:21.7, c:"#fbbf24" },
  { domain:"Utility Insecurity",       positive:620,  total:8400, pct:7.4,  c:"#f87171" },
  { domain:"Personal Safety (IPV/abuse)", positive:142, total:8400, pct:1.7, c:"#f43f5e" },
  { domain:"Education / Literacy",    positive:840,  total:8400, pct:10.0, c:"#fbbf24" },
];

const HIGH_RISK_PATIENTS = [
  { name:"Fatima Al-Zahra",  mrn:"MRN-10485", positive:["Food","Housing","Transport"], linked:2, pending:1 },
  { name:"Mohammed Bin Ali", mrn:"MRN-10502", positive:["Transport","Utility"],         linked:2, pending:0 },
  { name:"Layla Mansour",    mrn:"MRN-10518", positive:["Safety","Housing"],            linked:1, pending:1 },
  { name:"Hassan Al-Otaibi",mrn:"MRN-10487", positive:["Food","Education"],            linked:1, pending:1 },
];

export default function SDOHPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>SDOH Screening</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>AHC HRSN tool · Food insecurity · Housing · Transportation · Community resource directory · 211 referrals</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Patients Screened</p><p style={{ fontSize:22, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>8,400</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Any Positive Domain</p><p style={{ fontSize:22, fontWeight:800, color:"#fb923c", margin:"4px 0 0" }}>3,180</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>37.9%</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Resources Linked</p><p style={{ fontSize:22, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>2,180</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Critical (IPV/Safety)</p><p style={{ fontSize:22, fontWeight:800, color:"#f43f5e", margin:"4px 0 0" }}>142</p></Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Screening Results by Domain</h3>
          {SDOH_DOMAINS.map(d => (
            <div key={d.domain} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.65)" }}>{d.domain}</span>
                <span style={{ fontSize:12, color:d.c, fontWeight:700 }}>{d.positive.toLocaleString()} ({d.pct}%)</span>
              </div>
              <div style={{ height:8, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden" }}>
                <div style={{ height:"100%", background:d.c, width:`${d.pct*4}%` }} />
              </div>
            </div>
          ))}
        </Card>

        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>High-Risk Patients — Outreach Needed</h3>
          {HIGH_RISK_PATIENTS.map(p => (
            <div key={p.mrn} style={{ padding:"12px 14px", marginBottom:8, background:"rgba(255,255,255,0.02)", borderRadius:10, border:"1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:0 }}>{p.name}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{p.mrn}</p>
                </div>
                <div style={{ display:"flex", gap:5 }}>
                  <span style={{ fontSize:9, background:"rgba(74,222,128,0.12)", color:"#4ade80", borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{p.linked} linked</span>
                  {p.pending>0 && <span style={{ fontSize:9, background:"rgba(251,191,36,0.12)", color:"#fbbf24", borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{p.pending} pending</span>}
                </div>
              </div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {p.positive.map(d => <span key={d} style={{ fontSize:9, background:"rgba(248,113,113,0.1)", color:"#f87171", borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{d}</span>)}
              </div>
            </div>
          ))}
        </Card>

        <Card style={{ padding:18, gridColumn:"1 / -1" }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px", display:"flex", alignItems:"center", gap:7 }}><HandHeart style={{ width:14, height:14, color:"#4ade80" }} />Community Resource Directory</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
            {[
              { name:"Riyadh Food Bank Network",      domain:"Food", contact:"+966-11-2841-9920", linked:42 },
              { name:"Charitable Housing Trust",      domain:"Housing", contact:"+966-11-4421-1180", linked:18 },
              { name:"Transport Voucher Program",     domain:"Transport", contact:"social@cymed.sa", linked:142 },
              { name:"DV Hotline & Shelter",           domain:"Safety", contact:"+966-800-911-911", linked:12 },
              { name:"Utility Assistance — Zakat Fund",domain:"Utility", contact:"zakat@cymed.sa", linked:38 },
              { name:"Adult Literacy Programs",       domain:"Education", contact:"literacy@cymed.sa", linked:24 },
            ].map(r => (
              <div key={r.name} style={{ padding:"12px 14px", background:"rgba(74,222,128,0.04)", border:"1px solid rgba(74,222,128,0.15)", borderRadius:10 }}>
                <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:0 }}>{r.name}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"3px 0" }}>{r.domain} · {r.contact}</p>
                <p style={{ fontSize:10, color:"#4ade80", margin:0, fontWeight:700 }}>{r.linked} patients linked</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
