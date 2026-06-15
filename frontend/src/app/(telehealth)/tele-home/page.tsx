"use client";
import Link from "next/link";
export default function TelehealthDashboard() {
  return (
    <div style={{ minHeight:"100vh", background:"#080d18", color:"#f1f5f9", fontFamily:"var(--font-inter, system-ui, sans-serif)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
      <div style={{ width:64, height:64, borderRadius:18, background:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width="32" height="32" viewBox="0 0 28 28" fill="none"><rect x="4" y="7" width="16" height="12" rx="2" stroke="#34d399" strokeWidth="1.5"/><path d="M20 11l4-3v12l-4-3" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <h1 style={{ fontSize:28, fontWeight:800, margin:0 }}>Telemedicine Platform</h1>
      <p style={{ fontSize:14, color:"rgba(255,255,255,0.45)", margin:0, textAlign:"center", maxWidth:480 }}>Virtual consultations, video sessions, asynchronous messaging, and e-prescriptions. Full portal launching soon.</p>
      <div style={{ display:"flex", gap:10 }}>
        <Link href="/" style={{ padding:"9px 22px", borderRadius:10, background:"#34d399", color:"#050a14", fontSize:13, fontWeight:800, textDecoration:"none" }}>← Back to Launcher</Link>
      </div>
    </div>
  );
}
