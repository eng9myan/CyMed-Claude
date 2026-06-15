"use client";
import { useState } from "react";
import { Award, CheckCircle2, AlertTriangle, Clock, MapPin, Plus, Search } from "lucide-react";

type LicStatus = "active" | "renewal_due" | "expired" | "suspended" | "inspection_pending";
type Facility = { id:string; name:string; type:string; city:string; license:string; expires:string; status:LicStatus; lastInspection:string; findings:number; };

const FACILITIES: Facility[] = [
  { id:"F001", name:"CyMed General Hospital",  type:"Tertiary Hospital", city:"Riyadh", license:"MOH-12041", expires:"2027-03-15", status:"active",            lastInspection:"2026-04-20", findings:2 },
  { id:"F002", name:"Al Nahda Polyclinic",     type:"Polyclinic",        city:"Riyadh", license:"MOH-12042", expires:"2026-08-22", status:"renewal_due",       lastInspection:"2025-12-10", findings:4 },
  { id:"F003", name:"Smile Dental Center",     type:"Dental Clinic",      city:"Jeddah", license:"MOH-12043", expires:"2027-01-08", status:"active",            lastInspection:"2026-05-14", findings:0 },
  { id:"F004", name:"Eastern Medical Lab",     type:"Diagnostic Lab",     city:"Dammam", license:"MOH-12044", expires:"2026-12-30", status:"inspection_pending",lastInspection:"2025-09-22", findings:6 },
  { id:"F005", name:"Sunshine Pediatric Clinic",type:"Pediatric Clinic",  city:"Riyadh", license:"MOH-12045", expires:"2026-05-30", status:"expired",           lastInspection:"2025-08-18", findings:12 },
  { id:"F006", name:"Royal Eye Hospital",      type:"Specialty Hospital", city:"Jeddah", license:"MOH-12046", expires:"2028-02-11", status:"active",            lastInspection:"2026-03-22", findings:1 },
];

const STATUS_META: Record<LicStatus,{c:string;bg:string;label:string}> = {
  active:{c:"#4ade80",bg:"rgba(74,222,128,0.1)",label:"Active"},
  renewal_due:{c:"#fbbf24",bg:"rgba(251,191,36,0.1)",label:"Renewal Due"},
  expired:{c:"#f87171",bg:"rgba(248,113,113,0.1)",label:"Expired"},
  suspended:{c:"#f43f5e",bg:"rgba(244,63,94,0.1)",label:"Suspended"},
  inspection_pending:{c:"#fb923c",bg:"rgba(251,146,60,0.1)",label:"Inspection Pending"},
};

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function LicensingPage() {
  const [search, setSearch] = useState("");
  const filtered = FACILITIES.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.license.includes(search));

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Facility Licensing & Inspection</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Registration · License lifecycle · Inspection scheduling · Corrective action tracking · Public directory</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>New Facility</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"12px 16px" }}><p style={{ fontSize:22, fontWeight:800, color:"#22d3ee", margin:0 }}>{FACILITIES.length}</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>Total Facilities</p></Card>
        <Card style={{ padding:"12px 16px" }}><p style={{ fontSize:22, fontWeight:800, color:"#4ade80", margin:0 }}>{FACILITIES.filter(f=>f.status==="active").length}</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>Active</p></Card>
        <Card style={{ padding:"12px 16px" }}><p style={{ fontSize:22, fontWeight:800, color:"#fbbf24", margin:0 }}>{FACILITIES.filter(f=>f.status==="renewal_due").length}</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>Renewal Due</p></Card>
        <Card style={{ padding:"12px 16px" }}><p style={{ fontSize:22, fontWeight:800, color:"#f87171", margin:0 }}>{FACILITIES.filter(f=>f.status==="expired").length}</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>Expired</p></Card>
        <Card style={{ padding:"12px 16px" }}><p style={{ fontSize:22, fontWeight:800, color:"#fb923c", margin:0 }}>{FACILITIES.filter(f=>f.status==="inspection_pending").length}</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>Inspection Due</p></Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:12 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0, marginRight:"auto" }}>Licensed Facilities Registry</h3>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"0 12px" }}>
            <Search style={{ width:13, height:13, color:"rgba(255,255,255,0.3)" }} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search facility..." style={{ background:"none", border:"none", color:"#f1f5f9", fontSize:12, outline:"none", padding:"8px 0", width:240 }} />
          </div>
        </div>
        {filtered.map(f => {
          const sm = STATUS_META[f.status];
          return (
            <div key={f.id} style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"grid", gridTemplateColumns:"1fr 200px 120px 120px 100px", gap:14, alignItems:"center" }}>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>{f.name}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0", display:"flex", alignItems:"center", gap:5 }}><MapPin style={{ width:10, height:10 }} />{f.city} · {f.type}</p>
              </div>
              <div>
                <p style={{ fontSize:11, fontFamily:"monospace", color:"#22d3ee", margin:0 }}>{f.license}</p>
                <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>Expires {f.expires}</p>
              </div>
              <div>
                <span style={{ fontSize:10, background:sm.bg, color:sm.c, borderRadius:5, padding:"3px 9px", fontWeight:700 }}>{sm.label}</span>
              </div>
              <div>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0 }}>Last inspection</p>
                <p style={{ fontSize:11, color:"#f1f5f9", margin:"2px 0 0", fontWeight:600 }}>{f.lastInspection}</p>
              </div>
              <div style={{ textAlign:"center" }}>
                <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>Findings</p>
                <p style={{ fontSize:14, color: f.findings===0?"#4ade80":f.findings>5?"#f87171":"#fbbf24", margin:"2px 0 0", fontWeight:800 }}>{f.findings}</p>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
