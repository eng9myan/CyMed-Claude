"use client";
import Link from "next/link";
export default function NationalDashboard() {
  return (
    <div style={{ minHeight:"100vh", background:"#080d18", color:"#f1f5f9", fontFamily:"var(--font-inter, system-ui, sans-serif)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
      <div style={{ width:64, height:64, borderRadius:18, background:"rgba(103,232,249,0.15)", border:"1px solid rgba(103,232,249,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width="32" height="32" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="9" stroke="#67e8f9" strokeWidth="1.5"/><ellipse cx="14" cy="14" rx="4" ry="9" stroke="#67e8f9" strokeWidth="1.5"/><path d="M5 14h18" stroke="#67e8f9" strokeWidth="1.5"/></svg>
      </div>
      <h1 style={{ fontSize:28, fontWeight:800, margin:0 }}>National Health Platform</h1>
      <p style={{ fontSize:14, color:"rgba(255,255,255,0.45)", margin:0, textAlign:"center", maxWidth:480 }}>National health information infrastructure, universal patient record, cross-provider exchange, and national HIE.</p>
      <div style={{ display:"flex", gap:10 }}>
        <Link href="/" style={{ padding:"9px 22px", borderRadius:10, background:"#67e8f9", color:"#050a14", fontSize:13, fontWeight:800, textDecoration:"none" }}>← Back to Launcher</Link>
        <Link href="/national" style={{ padding:"9px 22px", borderRadius:10, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.1)", fontSize:13, textDecoration:"none" }}>HMS National Health Module</Link>
      </div>
    </div>
  );
}
