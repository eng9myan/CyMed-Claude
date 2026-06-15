"use client";

import Link from "next/link";
import { Construction, ArrowLeft, Home, Sparkles, Plus, Download, Filter } from "lucide-react";
import { usePathname } from "next/navigation";
import { getModule } from "@/lib/modules";

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function NotFound() {
  const pathname = usePathname() ?? "";
  const mod = getModule(pathname);

  // Rich module page — config-driven
  if (mod) {
    return (
      <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div>
            <p style={{ fontSize:10, color:mod.primary ?? "#e67e22", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:700, margin:0 }}>{mod.category}</p>
            <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:"4px 0 4px" }}>{mod.title}</h1>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>{mod.subtitle}</p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", borderRadius:10, padding:"8px 14px", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><Filter style={{ width:13, height:13 }}/>Filter</button>
            <button style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", borderRadius:10, padding:"8px 14px", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><Download style={{ width:13, height:13 }}/>Export</button>
            <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>New</button>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:`repeat(${mod.kpis.length},1fr)`, gap:10, marginBottom:18 }}>
          {mod.kpis.map(k => (
            <Card key={k.label} style={{ padding:"14px 18px" }}>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>{k.label}</p>
              <p style={{ fontSize:22, fontWeight:800, color:k.color, margin:"4px 0 0" }}>{k.value}</p>
              {k.sub && <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"3px 0 0" }}>{k.sub}</p>}
            </Card>
          ))}
        </div>

        <Card style={{ padding:0, overflow:"hidden" }}>
          {mod.rows.length === 0 ? (
            <div style={{ padding:32, textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:13 }}>{mod.emptyMessage ?? "No data."}</div>
          ) : (
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
                  {mod.columns.map(c => <th key={c} style={{ textAlign:"left", padding:"10px 14px" }}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {mod.rows.map((row,i) => (
                  <tr key={i} style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                    {row.map((cell,j) => (
                      <td key={j} style={{ padding:"10px 14px", color: j === 0 ? "#22d3ee" : "#f1f5f9", fontFamily: j === 0 ? "monospace" : "inherit", fontWeight: j === 0 ? 600 : 500 }}>
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    );
  }

  // Fallback for truly unknown paths
  const slug = pathname.replace(/^\//, "").replace(/-/g, " ").replace(/\//g, " · ");
  return (
    <div style={{ minHeight:"100vh", background:"#080d18", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ maxWidth:560, width:"100%", background:"linear-gradient(135deg, rgba(230,126,34,0.06) 0%, rgba(168,85,247,0.04) 100%)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:40, textAlign:"center" }}>
        <div style={{ width:64, height:64, borderRadius:18, background:"rgba(251,191,36,0.12)", border:"1px solid rgba(251,191,36,0.25)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px" }}>
          <Construction style={{ width:30, height:30, color:"#fbbf24" }} />
        </div>
        <p style={{ fontSize:10, fontWeight:700, color:"#fbbf24", textTransform:"uppercase", letterSpacing:"0.12em", margin:"0 0 8px" }}>Module in progress</p>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:"0 0 10px", textTransform:"capitalize" }}>{slug || "Page"}</h1>
        <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", margin:"0 0 24px", lineHeight:1.6 }}>This module is wired into the platform but the UI is still being built.</p>
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:7, background:"#e67e22", color:"white", padding:"10px 20px", borderRadius:10, fontSize:13, fontWeight:700, textDecoration:"none" }}>
            <Home style={{ width:14, height:14 }} /> Network launcher
          </Link>
          <button onClick={() => window.history.back()} style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.7)", padding:"10px 20px", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer" }}>
            <ArrowLeft style={{ width:14, height:14 }} /> Back
          </button>
        </div>
      </div>
    </div>
  );
}
