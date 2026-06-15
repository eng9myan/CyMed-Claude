"use client";

import Link from "next/link";

const MODULES = [
  { name:"Dispensing",          desc:"Prescription verification, drug interaction checks, dispensing workflow",  color:"#a78bfa" },
  { name:"Inventory",           desc:"Real-time stock levels, expiry tracking, reorder alerts",                  color:"#c4b5fd" },
  { name:"Procurement",         desc:"PO management, supplier portal, GRN and returns",                          color:"#818cf8" },
  { name:"POS & Retail",        desc:"Walk-in sales, receipt printing, shift reconciliation",                    color:"#6366f1" },
  { name:"Controlled Drugs",    desc:"S2 verification, DEA/MOH register, dual-signature workflows",              color:"#f87171" },
  { name:"Insurance Processing",desc:"NPHIES, HAAD, MOH-KW claims, eligibility check, prior auth",               color:"#fbbf24" },
  { name:"Multi-Branch Ops",    desc:"Inter-branch transfers, central inventory, consolidated reporting",        color:"#22d3ee" },
  { name:"Loyalty Program",     desc:"Patient loyalty points, rewards catalogue, membership tiers",              color:"#f472b6" },
  { name:"Procurement Analytics",desc:"Spend analytics, supplier scorecard, ABC analysis",                      color:"#4ade80" },
];

export default function PharmacyERPDashboard() {
  return (
    <div style={{ minHeight:"100vh", background:"#080d18", color:"#f1f5f9", fontFamily:"var(--font-inter, system-ui, sans-serif)" }}>
      <div style={{ background:"rgba(167,139,250,0.06)", borderBottom:"1px solid rgba(167,139,250,0.15)", padding:"20px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:"rgba(167,139,250,0.15)", border:"1px solid rgba(167,139,250,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none"><rect x="9" y="4" width="10" height="4" rx="2" stroke="#a78bfa" strokeWidth="1.5"/><rect x="6" y="8" width="16" height="16" rx="3" stroke="#a78bfa" strokeWidth="1.5"/><path d="M14 12v8M10 16h8" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div>
            <h1 style={{ fontSize:20, fontWeight:800, color:"#f1f5f9", margin:0 }}>Pharmacy ERP</h1>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>CyMed Pharmacy · Multi-branch operations</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Link href="/" style={{ padding:"6px 14px", borderRadius:9, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.08)", fontSize:11, textDecoration:"none" }}>← Launcher</Link>
          <Link href="/pharmacy" style={{ padding:"6px 14px", borderRadius:9, background:"#a78bfa", color:"#050a14", fontSize:11, fontWeight:700, textDecoration:"none" }}>Open HMS Pharmacy →</Link>
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
