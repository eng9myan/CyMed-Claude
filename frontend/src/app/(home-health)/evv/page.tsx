"use client";

import { useState } from "react";
import { MapPin, Clock, CheckCircle2, Navigation, User, AlertTriangle, Smartphone } from "lucide-react";

type VisitStatus = "scheduled" | "en_route" | "checked_in" | "completed" | "missed";

type Visit = {
  id: string; patient: string; address: string; scheduledStart: string; scheduledEnd: string;
  caregiver: string; status: VisitStatus;
  checkInTime?: string; checkOutTime?: string;
  checkInGps?: { lat: number; lng: number; accuracy: number };
  duration?: number; serviceType: string;
  signatureCaptured: boolean; mileage?: number;
};

const VISITS: Visit[] = [
  { id:"V001", patient:"Ahmad Al-Rashid (80y)", address:"Al Olaya District, House 412", scheduledStart:"2026-06-13 08:00", scheduledEnd:"2026-06-13 08:45", caregiver:"Sr. Nurse Layla", status:"completed", checkInTime:"2026-06-13 08:03", checkOutTime:"2026-06-13 08:42", checkInGps:{lat:24.7136,lng:46.6753,accuracy:8}, duration:39, serviceType:"Skilled Nursing — Wound Care", signatureCaptured:true, mileage:8.4 },
  { id:"V002", patient:"Fatima Al-Zahra (72y)", address:"Al Malaz District, Villa 22",   scheduledStart:"2026-06-13 09:30", scheduledEnd:"2026-06-13 10:30", caregiver:"PT Hala",         status:"completed", checkInTime:"2026-06-13 09:34", checkOutTime:"2026-06-13 10:28", checkInGps:{lat:24.6845,lng:46.7314,accuracy:6}, duration:54, serviceType:"Physical Therapy", signatureCaptured:true, mileage:12.1 },
  { id:"V003", patient:"Khalid Al-Dosari (68y)",address:"Al Nakheel District, Block 12",scheduledStart:"2026-06-13 11:00", scheduledEnd:"2026-06-13 11:45", caregiver:"Sr. Nurse Layla", status:"checked_in", checkInTime:"2026-06-13 11:02", checkInGps:{lat:24.7891,lng:46.6210,accuracy:7}, serviceType:"Skilled Nursing — Med Admin", signatureCaptured:false, mileage:6.8 },
  { id:"V004", patient:"Sara Al-Ghamdi (65y)",  address:"Diplomatic Quarter, Building 8",scheduledStart:"2026-06-13 13:00", scheduledEnd:"2026-06-13 14:00", caregiver:"Sr. Nurse Layla", status:"en_route", serviceType:"Skilled Nursing — IV Infusion", signatureCaptured:false, mileage:5.2 },
  { id:"V005", patient:"Omar Al-Shehri (74y)",  address:"Al Rawdah District, Apt 304",   scheduledStart:"2026-06-13 15:00", scheduledEnd:"2026-06-13 15:30", caregiver:"OT Reem",         status:"scheduled", serviceType:"Occupational Therapy", signatureCaptured:false },
  { id:"V006", patient:"Mohammed Al-Harbi (69y)",address:"Al Sulaymaniyah, House 88",    scheduledStart:"2026-06-12 14:00", scheduledEnd:"2026-06-12 14:30", caregiver:"Sr. Nurse Omar",  status:"missed", serviceType:"Skilled Nursing", signatureCaptured:false },
];

const STATUS_META: Record<VisitStatus,{c:string;bg:string;label:string}> = {
  scheduled: {c:"#94a3b8",bg:"rgba(148,163,184,0.1)",label:"Scheduled"},
  en_route:  {c:"#22d3ee",bg:"rgba(34,211,238,0.1)", label:"En Route"},
  checked_in:{c:"#fbbf24",bg:"rgba(251,191,36,0.1)", label:"On-Site"},
  completed: {c:"#4ade80",bg:"rgba(74,222,128,0.1)", label:"Completed"},
  missed:    {c:"#f87171",bg:"rgba(248,113,113,0.1)",label:"Missed"},
};

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function EVVPage() {
  const [active, setActive] = useState<Visit>(VISITS[2]);
  const completed = VISITS.filter(v=>v.status==="completed").length;
  const missed = VISITS.filter(v=>v.status==="missed").length;
  const total = VISITS.length;

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:10 }}><MapPin style={{ width:24, height:24, color:"#84cc16" }} />Electronic Visit Verification (EVV)</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>GPS check-in/out · Signature capture · Mileage tracking · CMS EVV compliance · Real-time visit verification</p>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"12px 16px" }}><p style={{ fontSize:22, fontWeight:800, color:"#22d3ee", margin:0 }}>{total}</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>Total Visits</p></Card>
        <Card style={{ padding:"12px 16px" }}><p style={{ fontSize:22, fontWeight:800, color:"#4ade80", margin:0 }}>{completed}</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>Completed</p></Card>
        <Card style={{ padding:"12px 16px" }}><p style={{ fontSize:22, fontWeight:800, color:"#fbbf24", margin:0 }}>{VISITS.filter(v=>v.status==="checked_in").length}</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>On-Site Now</p></Card>
        <Card style={{ padding:"12px 16px" }}><p style={{ fontSize:22, fontWeight:800, color:"#f87171", margin:0 }}>{missed}</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>Missed</p></Card>
        <Card style={{ padding:"12px 16px" }}><p style={{ fontSize:22, fontWeight:800, color:"#a78bfa", margin:0 }}>{VISITS.reduce((s,v)=>s+(v.mileage||0),0).toFixed(1)} km</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>Total Mileage</p></Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"380px 1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {VISITS.map(v => {
            const sm = STATUS_META[v.status];
            return (
              <Card key={v.id} style={{ padding:14, cursor:"pointer", border:`1px solid ${active.id===v.id?"rgba(230,126,34,0.3)":"rgba(255,255,255,0.07)"}`, background:active.id===v.id?"rgba(230,126,34,0.07)":"rgba(255,255,255,0.03)" }} onClick={()=>setActive(v)}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>{v.scheduledStart.split(" ")[1]}</span>
                  <span style={{ fontSize:9, background:sm.bg, color:sm.c, borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{sm.label}</span>
                </div>
                <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:0 }}>{v.patient}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{v.serviceType}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"4px 0 0", display:"flex", alignItems:"center", gap:4 }}><MapPin style={{ width:10, height:10 }} />{v.address}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:"3px 0 0" }}>Caregiver: {v.caregiver}</p>
              </Card>
            );
          })}
        </div>

        <Card style={{ padding:22 }}>
          <h2 style={{ fontSize:17, fontWeight:800, color:"#f1f5f9", margin:"0 0 6px" }}>{active.patient}</h2>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"0 0 18px" }}>{active.serviceType} · Caregiver: {active.caregiver}</p>

          {/* Map placeholder */}
          <div style={{ background:"linear-gradient(135deg, rgba(132,204,22,0.08), rgba(34,211,238,0.05))", border:"1px solid rgba(132,204,22,0.15)", borderRadius:12, padding:30, marginBottom:18, textAlign:"center" }}>
            <Navigation style={{ width:40, height:40, color:"#84cc16", margin:"0 auto 10px" }} />
            <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>{active.address}</p>
            {active.checkInGps && <p style={{ fontSize:10, color:"#4ade80", margin:"6px 0 0", fontFamily:"monospace" }}>📍 GPS: {active.checkInGps.lat.toFixed(4)}, {active.checkInGps.lng.toFixed(4)} ±{active.checkInGps.accuracy}m</p>}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
            <div style={{ background:"rgba(34,211,238,0.04)", borderLeft:"3px solid #22d3ee", borderRadius:10, padding:12 }}>
              <p style={{ fontSize:10, color:"rgba(34,211,238,0.7)", margin:0, textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>Scheduled</p>
              <p style={{ fontSize:12, color:"#f1f5f9", margin:"4px 0 0", fontWeight:600 }}>{active.scheduledStart.split(" ")[1]} – {active.scheduledEnd.split(" ")[1]}</p>
            </div>
            <div style={{ background:"rgba(74,222,128,0.04)", borderLeft:"3px solid #4ade80", borderRadius:10, padding:12 }}>
              <p style={{ fontSize:10, color:"rgba(74,222,128,0.7)", margin:0, textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>Actual</p>
              <p style={{ fontSize:12, color:"#f1f5f9", margin:"4px 0 0", fontWeight:600 }}>{active.checkInTime ? `${active.checkInTime.split(" ")[1]} – ${active.checkOutTime?.split(" ")[1] ?? "in progress"}` : "Not started"}</p>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
            <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:10, padding:12 }}>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0, textTransform:"uppercase", fontWeight:700 }}>Duration</p>
              <p style={{ fontSize:14, color:"#f1f5f9", margin:"4px 0 0", fontWeight:700 }}>{active.duration ? `${active.duration} min` : "—"}</p>
            </div>
            <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:10, padding:12 }}>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0, textTransform:"uppercase", fontWeight:700 }}>Mileage</p>
              <p style={{ fontSize:14, color:"#f1f5f9", margin:"4px 0 0", fontWeight:700 }}>{active.mileage ? `${active.mileage} km` : "—"}</p>
            </div>
            <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:10, padding:12 }}>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0, textTransform:"uppercase", fontWeight:700 }}>Signature</p>
              <p style={{ fontSize:14, color: active.signatureCaptured?"#4ade80":"#fbbf24", margin:"4px 0 0", fontWeight:700 }}>{active.signatureCaptured ? "✓ Captured" : "Pending"}</p>
            </div>
          </div>

          {active.status === "checked_in" && (
            <div style={{ display:"flex", gap:8 }}>
              <button style={{ flex:1, background:"#4ade80", color:"white", border:"none", borderRadius:10, padding:"12px 0", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}><Smartphone style={{ width:14, height:14 }} />Check-Out & Capture Signature</button>
            </div>
          )}
          {active.status === "scheduled" && (
            <button style={{ width:"100%", background:"#22d3ee", color:"white", border:"none", borderRadius:10, padding:"12px 0", fontSize:13, fontWeight:700, cursor:"pointer" }}>Mark En Route</button>
          )}
        </Card>
      </div>
    </div>
  );
}
