"use client";

import Link from "next/link";

const MODULES = [
  { name:"Registration",   desc:"Patient demographics, insurance, national ID validation",         color:"#22d3ee", status:"LIVE"  },
  { name:"Appointments",   desc:"Calendar booking, reminders, waitlist, multi-provider scheduling",color:"#4ade80", status:"LIVE"  },
  { name:"Consultations",  desc:"Encounter documentation, SOAP notes, ICD-11 coding",              color:"#a78bfa", status:"LIVE"  },
  { name:"EMR",            desc:"Longitudinal health record, problems, allergies, medications",    color:"#60a5fa", status:"LIVE"  },
  { name:"Prescriptions",  desc:"e-Prescriptions, CDSS, controlled drug management",               color:"#fbbf24", status:"LIVE"  },
  { name:"Billing",        desc:"Insurance claims, co-pay collection, multi-payer processing",    color:"#fb923c", status:"LIVE"  },
  { name:"Claims",         desc:"NPHIES, HAAD, MOH-KW claim submission and follow-up",             color:"#f87171", status:"LIVE"  },
  { name:"Telemedicine",   desc:"Video consult integration, asynchronous messaging",               color:"#34d399", status:"LIVE"  },
];

export default function CMSDashboard() {
  return (
    <div style={{ minHeight:"100vh", background:"#080d18", color:"#f1f5f9", fontFamily:"var(--font-inter, system-ui, sans-serif)" }}>
      {/* Header */}
      <div style={{ background:"rgba(74,222,128,0.06)", borderBottom:"1px solid rgba(74,222,128,0.15)", padding:"20px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="10" r="4" stroke="#4ade80" strokeWidth="1.5"/><path d="M6 22c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div>
            <h1 style={{ fontSize:20, fontWeight:800, color:"#f1f5f9", margin:0 }}>Clinic Management System</h1>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>CyMed CMS · Outpatient & Specialist Clinics</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Link href="/" style={{ padding:"6px 14px", borderRadius:9, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.08)", fontSize:11, textDecoration:"none" }}>← Launcher</Link>
          <div style={{ padding:"6px 14px", borderRadius:99, background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.25)", fontSize:11, fontWeight:700, color:"#4ade80" }}>● LIVE</div>
        </div>
      </div>

      <div style={{ padding:"32px 32px 48px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:12 }}>
          {MODULES.map(m => (
            <div key={m.name} style={{ padding:20, borderRadius:14, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                <h3 style={{ fontSize:14, fontWeight:700, color:m.color, margin:0 }}>{m.name}</h3>
                <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99, background:"rgba(74,222,128,0.1)", color:"#4ade80" }}>{m.status}</span>
              </div>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", lineHeight:1.6, margin:0 }}>{m.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop:40, padding:24, borderRadius:16, background:"rgba(74,222,128,0.06)", border:"1px solid rgba(74,222,128,0.15)", textAlign:"center" }}>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", margin:"0 0 12px" }}>Full CMS portal launching soon. Contact your CyMed representative to enable this solution.</p>
          <Link href="/command_center" style={{ padding:"9px 24px", borderRadius:10, background:"#4ade80", color:"#050a14", fontSize:13, fontWeight:800, textDecoration:"none" }}>Use HMS Portal →</Link>
        </div>
      </div>
    </div>
  );
}
