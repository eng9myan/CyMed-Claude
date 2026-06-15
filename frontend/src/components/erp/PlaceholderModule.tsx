"use client";
import { Construction } from "lucide-react";

export function PlaceholderModule({ title, subtitle, sections }: { title: string; subtitle: string; sections: string[] }) {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>{title}</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>{subtitle}</p>
      </div>
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:32, textAlign:"center" }}>
        <Construction style={{ width:32, height:32, color:"#fbbf24", margin:"0 auto 12px" }} />
        <p style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>Module wired — UI in progress</p>
        <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:"6px 0 16px" }}>Backend models exist. UI scaffold below shows planned sections.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:8, textAlign:"left" }}>
          {sections.map(s => (
            <div key={s} style={{ padding:"10px 14px", background:"rgba(255,255,255,0.02)", borderRadius:8, fontSize:11, color:"rgba(255,255,255,0.6)" }}>→ {s}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
