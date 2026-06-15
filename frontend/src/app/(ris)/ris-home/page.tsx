"use client";

import Link from "next/link";

const MODULES = [
  { name:"RIS Worklist",      desc:"Radiologist worklist, modality queue, priority management",                color:"#60a5fa" },
  { name:"PACS Integration",  desc:"DICOM storage, viewing, prior comparison, hanging protocols",             color:"#22d3ee" },
  { name:"Scheduling",        desc:"Modality scheduling, resource management, patient prep instructions",     color:"#4ade80" },
  { name:"DICOM Viewer",      desc:"Zero-footprint web viewer, 3D reconstruction, measurement tools",         color:"#34d399" },
  { name:"Structured Reports",desc:"Voice recognition, report templates, structured data extraction",         color:"#a78bfa" },
  { name:"Teleradiology",     desc:"Remote reading platform, subspecialty routing, SLA management",           color:"#f472b6" },
  { name:"Radiology POS",     desc:"Walk-in billing, contrast charges, insurance pre-authorisation",          color:"#fbbf24" },
];

export default function RISDashboard() {
  return (
    <div style={{ minHeight:"100vh", background:"#080d18", color:"#f1f5f9", fontFamily:"var(--font-inter, system-ui, sans-serif)" }}>
      <div style={{ background:"rgba(96,165,250,0.06)", borderBottom:"1px solid rgba(96,165,250,0.15)", padding:"20px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:"rgba(96,165,250,0.15)", border:"1px solid rgba(96,165,250,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none"><rect x="4" y="6" width="20" height="16" rx="3" stroke="#60a5fa" strokeWidth="1.5"/><circle cx="14" cy="14" r="4" stroke="#60a5fa" strokeWidth="1.5"/><circle cx="14" cy="14" r="1.5" fill="#60a5fa"/></svg>
          </div>
          <div>
            <h1 style={{ fontSize:20, fontWeight:800, color:"#f1f5f9", margin:0 }}>Radiology & Imaging ERP</h1>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>CyMed RIS · Full radiology information system</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Link href="/" style={{ padding:"6px 14px", borderRadius:9, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.08)", fontSize:11, textDecoration:"none" }}>← Launcher</Link>
          <Link href="/radiology" style={{ padding:"6px 14px", borderRadius:9, background:"#60a5fa", color:"#050a14", fontSize:11, fontWeight:700, textDecoration:"none" }}>Open HMS Radiology →</Link>
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
