"use client";
import { Activity, Wifi, AlertTriangle, Heart, Droplet, TrendingUp } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const STREAMS = [
  { device:"Philips IntelliVue Patient Monitor",   bed:"ICU-1", metrics:"HR, ECG, SpO2, NIBP, EtCO2",   status:"streaming", interval:"1 Hz",  alerts:0 },
  { device:"Drager Evita V500 Ventilator",          bed:"ICU-2", metrics:"PEEP, TV, RR, FiO2, Pinsp",   status:"streaming", interval:"5 Hz",  alerts:2 },
  { device:"Baxter Spectrum IV Smart Pump",         bed:"ICU-2", metrics:"Infusion rate, dose, volume", status:"streaming", interval:"30 sec", alerts:0 },
  { device:"BD Pyxis ADC Cabinet — Pharmacy",       bed:"Floor 4", metrics:"Drawer events, restock", status:"streaming", interval:"event",  alerts:1 },
  { device:"GE Carescape Telemetry Pack",           bed:"Tele-12",metrics:"ECG (5-lead), HR, ST",     status:"streaming", interval:"4 Hz",  alerts:0 },
  { device:"Stryker Berchtold Surgical Boom",       bed:"OR-2", metrics:"Position, lights, gas",     status:"idle",      interval:"event",  alerts:0 },
  { device:"Welch Allyn Connex Vital Signs Monitor",bed:"Med-7B", metrics:"BP, Temp, SpO2",          status:"streaming", interval:"5 min", alerts:0 },
  { device:"Roche Cobas Point-of-Care Glucose",      bed:"Multi", metrics:"Glucose, lactate (POC)",    status:"streaming", interval:"event",  alerts:0 },
];

export default function IoMTPage() {
  const total = STREAMS.length;
  const streaming = STREAMS.filter(s=>s.status==="streaming").length;
  const alerts = STREAMS.reduce((s,d)=>s+d.alerts, 0);

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:10 }}><Activity style={{ width:24, height:24, color:"#22d3ee" }}/>IoMT & Connected Devices Hub</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Bedside monitors · Ventilators · IV pumps · ADCs · Tele packs · Real-time data streaming · HL7/MQTT</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Total Devices</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>{total}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Streaming Now</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>{streaming}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Active Alerts</p><p style={{ fontSize:24, fontWeight:800, color:"#fb923c", margin:"4px 0 0" }}>{alerts}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Data Points / sec</p><p style={{ fontSize:24, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>284</p></Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>Live Device Streams</h3>
        </div>
        {STREAMS.map(s => (
          <div key={s.device} style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"grid", gridTemplateColumns:"1fr 100px 1fr 100px 100px", gap:14, alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Wifi style={{ width:14, height:14, color:s.status==="streaming"?"#4ade80":"rgba(255,255,255,0.3)" }} />
              <div>
                <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:0 }}>{s.device}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>Sample rate: {s.interval}</p>
              </div>
            </div>
            <span style={{ fontSize:11, background:"rgba(34,211,238,0.1)", color:"#22d3ee", borderRadius:6, padding:"3px 10px", fontWeight:700, textAlign:"center" }}>{s.bed}</span>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:0 }}>{s.metrics}</p>
            <span style={{ fontSize:10, background:s.status==="streaming"?"rgba(74,222,128,0.12)":"rgba(148,163,184,0.12)", color:s.status==="streaming"?"#4ade80":"#94a3b8", borderRadius:5, padding:"3px 9px", fontWeight:700, textAlign:"center", textTransform:"uppercase" }}>{s.status==="streaming"?<><span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:"#4ade80", marginRight:4, animation:"pulse 1.5s infinite" }}/>LIVE</>:"IDLE"}</span>
            {s.alerts > 0 ? <span style={{ fontSize:11, background:"rgba(251,146,60,0.12)", color:"#fb923c", borderRadius:5, padding:"3px 9px", fontWeight:700, textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}><AlertTriangle style={{ width:11, height:11 }}/>{s.alerts}</span> : <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", textAlign:"center" }}>✓ OK</span>}
          </div>
        ))}
      </Card>
    </div>
  );
}
