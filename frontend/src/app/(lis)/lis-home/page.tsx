"use client";

import Link from "next/link";

const MODULES = [
  { name:"Order Management",      desc:"CPOE integration, order routing, STAT/routine prioritisation",         color:"#fbbf24" },
  { name:"Specimen Tracking",     desc:"Barcode scanning, chain of custody, rejection management",             color:"#f59e0b" },
  { name:"Collection",            desc:"Phlebotomy scheduling, collection lists, patient ID verification",     color:"#d97706" },
  { name:"Analyzer Integration",  desc:"Bi-directional HL7 interface for 100+ analyzer models",               color:"#22d3ee" },
  { name:"Validation Workflow",   desc:"Delta check, reference range flagging, technical & clinical review",   color:"#60a5fa" },
  { name:"Results & Reporting",   desc:"Cumulative reports, PDF generation, critical value notification",      color:"#4ade80" },
  { name:"Laboratory POS",        desc:"Walk-in billing, payment receipt, insurance pre-auth",                 color:"#a78bfa" },
  { name:"Reference Lab Ops",     desc:"Send-out orders, external results import, TAT tracking",               color:"#f472b6" },
];

export default function LISDashboard() {
  return (
    <div style={{ minHeight:"100vh", background:"#080d18", color:"#f1f5f9", fontFamily:"var(--font-inter, system-ui, sans-serif)" }}>
      <div style={{ background:"rgba(251,191,36,0.06)", borderBottom:"1px solid rgba(251,191,36,0.15)", padding:"20px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:"rgba(251,191,36,0.15)", border:"1px solid rgba(251,191,36,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none"><path d="M11 4v8l-5 10h16l-5-10V4" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 4h8" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/><circle cx="14" cy="18" r="1.5" fill="#fbbf24"/></svg>
          </div>
          <div>
            <h1 style={{ fontSize:20, fontWeight:800, color:"#f1f5f9", margin:0 }}>Laboratory ERP (LIS)</h1>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>CyMed LIS · Full laboratory information system</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Link href="/" style={{ padding:"6px 14px", borderRadius:9, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.08)", fontSize:11, textDecoration:"none" }}>← Launcher</Link>
          <Link href="/lab" style={{ padding:"6px 14px", borderRadius:9, background:"#fbbf24", color:"#050a14", fontSize:11, fontWeight:700, textDecoration:"none" }}>Open HMS Lab →</Link>
        </div>
      </div>
      <div style={{ padding:"32px 32px 48px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
          {MODULES.map(m=>(
            <div key={m.name} style={{ padding:20, borderRadius:14, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:m.color, margin:"0 0 6px" }}>{m.name}</h3>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", lineHeight:1.6, margin:0 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
