"use client";
import Link from "next/link";
export default function GroupDashboard() {
  return (
    <div style={{ minHeight:"100vh", background:"#080d18", color:"#f1f5f9", fontFamily:"var(--font-inter, system-ui, sans-serif)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
      <div style={{ width:64, height:64, borderRadius:18, background:"rgba(248,113,113,0.15)", border:"1px solid rgba(248,113,113,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width="32" height="32" viewBox="0 0 28 28" fill="none"><circle cx="8" cy="20" r="3" stroke="#f87171" strokeWidth="1.5"/><circle cx="20" cy="20" r="3" stroke="#f87171" strokeWidth="1.5"/><circle cx="14" cy="8" r="3" stroke="#f87171" strokeWidth="1.5"/><path d="M14 11v5M11 18l-3 2M17 18l3 2" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </div>
      <h1 style={{ fontSize:28, fontWeight:800, margin:0 }}>Healthcare Group Platform</h1>
      <p style={{ fontSize:14, color:"rgba(255,255,255,0.45)", margin:0, textAlign:"center", maxWidth:480 }}>Multi-facility group management, consolidated financials, group-wide analytics, and inter-facility transfers.</p>
      <Link href="/" style={{ padding:"9px 22px", borderRadius:10, background:"#f87171", color:"white", fontSize:13, fontWeight:800, textDecoration:"none" }}>← Back to Launcher</Link>
    </div>
  );
}
