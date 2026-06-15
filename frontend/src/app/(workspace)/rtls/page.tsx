"use client";
import { MapPin, Activity, Search, AlertTriangle, Tag } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const ASSETS = [
  { tag:"AT-08421", asset:"Portable Ultrasound — GE Vivid iQ", location:"ICU Storage", status:"available", lastSeen:"2 min ago", utilization:62 },
  { tag:"AT-08422", asset:"Infusion Pump #14",                 location:"Med Ward 7B", status:"in_use",    lastSeen:"30 sec ago", utilization:88 },
  { tag:"AT-08423", asset:"Defibrillator — Lifepak 20",         location:"ED Bay 4",     status:"in_use",    lastSeen:"1 min ago", utilization:92 },
  { tag:"AT-08424", asset:"Wheelchair Standard #82",           location:"Maintenance",  status:"maintenance",lastSeen:"3 days ago",utilization:0 },
  { tag:"AT-08425", asset:"Mobile X-Ray — Carestream",          location:"Radiology Hall",status:"available", lastSeen:"5 min ago", utilization:54 },
  { tag:"AT-08426", asset:"IV Pole #128",                       location:"Med Ward 4A", status:"in_use",    lastSeen:"15 sec ago", utilization:78 },
  { tag:"AT-08427", asset:"Pulse Oximeter — Masimo MightySat",  location:"⚠ MISSING",   status:"lost",      lastSeen:"4 hours ago",utilization:0 },
];

const STAFF_TRACKING = [
  { name:"Dr. Al-Mutawa",    role:"Attending",  location:"Med Ward 7",  status:"available" },
  { name:"Dr. Al-Ghamdi",    role:"Cardiology", location:"Cath Lab",     status:"procedure" },
  { name:"Sr. Nurse Layla",  role:"RN",         location:"ICU",           status:"caring_for_patient" },
  { name:"Pharmacist Sami",  role:"Pharmacist", location:"Pharmacy",     status:"available" },
];

export default function RTLSPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:10 }}><MapPin style={{ width:24, height:24, color:"#22d3ee" }}/>RTLS · Asset & Staff Tracking</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Real-time location · BLE / Wi-Fi triangulation · Utilization analytics · Theft prevention · Hand hygiene compliance</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Tracked Assets</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>2,840</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Available Now</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>1,420</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Avg Utilization</p><p style={{ fontSize:24, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>68%</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Missing / Lost</p><p style={{ fontSize:24, fontWeight:800, color:"#f87171", margin:"4px 0 0" }}>4</p></Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>
        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>Asset Locations</h3>
          </div>
          {ASSETS.map(a => {
            const sm = a.status === "available" ? {c:"#4ade80",bg:"rgba(74,222,128,0.1)"} : a.status === "in_use" ? {c:"#22d3ee",bg:"rgba(34,211,238,0.1)"} : a.status === "maintenance" ? {c:"#fb923c",bg:"rgba(251,146,60,0.1)"} : {c:"#f43f5e",bg:"rgba(244,63,94,0.1)"};
            return (
              <div key={a.tag} style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"grid", gridTemplateColumns:"120px 1fr 200px 140px 100px", gap:14, alignItems:"center" }}>
                <span style={{ fontSize:11, fontFamily:"monospace", color:"#22d3ee", display:"flex", alignItems:"center", gap:4 }}><Tag style={{ width:11, height:11 }}/>{a.tag}</span>
                <span style={{ fontSize:12, color:"#f1f5f9" }}>{a.asset}</span>
                <span style={{ fontSize:11, color:a.status==="lost"?"#f43f5e":"rgba(255,255,255,0.5)", fontWeight:600, display:"flex", alignItems:"center", gap:5 }}><MapPin style={{ width:11, height:11 }}/>{a.location}</span>
                <div>
                  <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden", marginBottom:3 }}>
                    <div style={{ height:"100%", background:a.utilization>=80?"#fb923c":a.utilization>=50?"#22d3ee":"#4ade80", width:`${a.utilization}%` }} />
                  </div>
                  <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>{a.utilization}% util · {a.lastSeen}</p>
                </div>
                <span style={{ fontSize:10, background:sm.bg, color:sm.c, borderRadius:5, padding:"3px 9px", fontWeight:700, textTransform:"uppercase", textAlign:"center" }}>{a.status.replace("_"," ")}</span>
              </div>
            );
          })}
        </Card>

        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Staff Location</h3>
          {STAFF_TRACKING.map(s => (
            <div key={s.name} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", marginBottom:6, background:"rgba(255,255,255,0.02)", borderRadius:10 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(167,139,250,0.15)", color:"#a78bfa", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700 }}>{s.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:0 }}>{s.name}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{s.role} · {s.location}</p>
              </div>
              <span style={{ width:8, height:8, borderRadius:"50%", background:s.status==="available"?"#4ade80":"#fbbf24" }} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
