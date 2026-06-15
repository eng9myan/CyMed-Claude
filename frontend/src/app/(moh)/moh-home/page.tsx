"use client";
import Link from "next/link";
export default function MoHDashboard() {
  return (
    <div style={{ minHeight:"100vh", background:"#080d18", color:"#f1f5f9", fontFamily:"var(--font-inter, system-ui, sans-serif)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
      <div style={{ width:64, height:64, borderRadius:18, background:"rgba(230,126,34,0.15)", border:"1px solid rgba(230,126,34,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width="32" height="32" viewBox="0 0 28 28" fill="none"><path d="M14 4l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" stroke="#e67e22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <h1 style={{ fontSize:28, fontWeight:800, margin:0 }}>Ministry of Health Platform</h1>
      <p style={{ fontSize:14, color:"rgba(255,255,255,0.45)", margin:0, textAlign:"center", maxWidth:480 }}>National facility licensing, workforce registry, mandatory reporting, NPHIES integration, and MOH dashboards.</p>
      <div style={{ display:"flex", gap:10 }}>
        <Link href="/" style={{ padding:"9px 22px", borderRadius:10, background:"#e67e22", color:"white", fontSize:13, fontWeight:800, textDecoration:"none" }}>← Back to Launcher</Link>
        <Link href="/national" style={{ padding:"9px 22px", borderRadius:10, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.1)", fontSize:13, textDecoration:"none" }}>Open National Health</Link>
      </div>
    </div>
  );
}
