"use client";
import { useState } from "react";
import { BookOpen, Search, Plus, Star, Clock, ChevronRight } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const ARTICLES = [
  { id:"K-001", title:"Sepsis bundle v4 — 1-hour protocol",         space:"Clinical",     author:"Dr. Al-Mutawa", updated:"2026-06-10", views:842, starred:true,  excerpt:"Surviving Sepsis 2021 update with CyMed-specific timing rules and order set links." },
  { id:"K-002", title:"How to run end-of-month payroll",              space:"Finance",      author:"Acc. Reem",    updated:"2026-06-05", views:284, starred:false, excerpt:"Step-by-step: GOSI calc, advance reconciliation, WPS file generation, bank batch upload." },
  { id:"K-003", title:"NPHIES claim submission troubleshooting",       space:"Insurance",    author:"RCM team",      updated:"2026-06-08", views:642, starred:true,  excerpt:"Common errors (E101, E202) and their resolutions, plus the retry escalation tree." },
  { id:"K-004", title:"JCI accreditation 2026 prep checklist",       space:"Quality",     author:"Quality Office",updated:"2026-06-12", views:1240,starred:true,  excerpt:"All 14 chapters with evidence requirements, status, and team owners." },
  { id:"K-005", title:"ICU admission criteria",                       space:"Clinical",     author:"Dr. Al-Harbi", updated:"2026-05-22", views:380, starred:false, excerpt:"When to admit to ICU vs step-down; specific scores (APACHE, SOFA), and exclusions." },
  { id:"K-006", title:"Pharmacy CD register weekly count",            space:"Pharmacy",     author:"Pharm. Sami",   updated:"2026-06-01", views:148, starred:false, excerpt:"Friday CD reconciliation workflow, witness signature, and discrepancy escalation." },
  { id:"K-007", title:"Onboarding checklist for new doctors",         space:"HR",            author:"HR team",       updated:"2026-05-30", views:96,  starred:false, excerpt:"License verification, credentialing, IT setup, mandatory training, first-day buddy." },
  { id:"K-008", title:"Ramadan medication adjustment guide",          space:"Clinical",     author:"Dr. Al-Otaibi", updated:"2026-02-14", views:1840,starred:true,  excerpt:"Diabetes, HTN, anticoag — fasting-period dose modifications and patient counseling templates." },
];

const SPACES = [
  { name:"Clinical",  count:142, c:"#22d3ee" },
  { name:"Finance",   count:88,  c:"#4ade80" },
  { name:"Insurance", count:62,  c:"#a78bfa" },
  { name:"Quality",   count:48,  c:"#fbbf24" },
  { name:"Pharmacy",  count:42,  c:"#f472b6" },
  { name:"HR",        count:38,  c:"#fb923c" },
];

export default function KnowledgePage() {
  const [search, setSearch] = useState("");
  const filtered = ARTICLES.filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Knowledge base</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Wiki · Protocols · SOPs · AI search across all content · Version history · Comments</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>New article</button>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"0 14px", marginBottom:16 }}>
        <Search style={{ width:14, height:14, color:"rgba(255,255,255,0.3)" }} />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search articles, protocols, SOPs..." style={{ flex:1, background:"none", border:"none", color:"#f1f5f9", fontSize:13, outline:"none", padding:"11px 0" }} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:16 }}>
        <Card style={{ padding:14 }}>
          <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 10px", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Spaces</p>
          {SPACES.map(s => (
            <div key={s.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", cursor:"pointer", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize:12, color:"#f1f5f9", display:"flex", alignItems:"center", gap:7 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:s.c }} />
                {s.name}
              </span>
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{s.count}</span>
            </div>
          ))}
        </Card>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.map(a => (
            <Card key={a.id} style={{ padding:16, cursor:"pointer" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:14 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                    <span style={{ fontSize:10, background:"rgba(34,211,238,0.12)", color:"#22d3ee", borderRadius:4, padding:"1px 7px", fontWeight:700 }}>{a.space}</span>
                    {a.starred && <Star style={{ width:11, height:11, color:"#fbbf24", fill:"#fbbf24" }} />}
                  </div>
                  <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:"0 0 6px" }}>{a.title}</h3>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.55)", margin:"0 0 8px", lineHeight:1.5 }}>{a.excerpt}</p>
                  <div style={{ display:"flex", gap:14, fontSize:10, color:"rgba(255,255,255,0.4)" }}>
                    <span>By {a.author}</span>
                    <span><Clock style={{ width:9, height:9, display:"inline", marginRight:3 }}/>Updated {a.updated}</span>
                    <span>{a.views.toLocaleString()} views</span>
                  </div>
                </div>
                <ChevronRight style={{ width:16, height:16, color:"rgba(255,255,255,0.3)" }} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
