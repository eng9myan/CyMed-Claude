"use client";

import { useState } from "react";
import { Watch, Heart, Activity, Footprints, Moon, Droplet, Plus, CheckCircle2, Wifi, WifiOff, TrendingUp } from "lucide-react";

type DeviceStatus = "connected" | "syncing" | "disconnected" | "error";

type Device = {
  id: string; name: string; vendor: string; status: DeviceStatus;
  lastSync: string; battery: number;
  metrics: string[];
};

const DEVICES: Device[] = [
  { id:"D1", name:"Apple Watch Series 10", vendor:"Apple HealthKit", status:"connected", lastSync:"2026-06-13 14:38", battery:78, metrics:["Heart Rate","Steps","Sleep","ECG","Blood Oxygen"] },
  { id:"D2", name:"Dexcom G7 CGM", vendor:"Dexcom",  status:"connected", lastSync:"2026-06-13 14:42", battery:65, metrics:["Glucose (5-min interval)","Trends","Time in Range"] },
  { id:"D3", name:"Omron Connect BP", vendor:"Omron", status:"syncing",  lastSync:"2026-06-13 09:15", battery:90, metrics:["Systolic","Diastolic","Pulse"] },
  { id:"D4", name:"Withings Body+ Scale", vendor:"Withings", status:"connected", lastSync:"2026-06-13 07:30", battery:100, metrics:["Weight","BMI","Body Fat"] },
  { id:"D5", name:"Fitbit Sense 2", vendor:"Google Fit", status:"disconnected", lastSync:"2026-06-10 18:22", battery:0, metrics:["Heart Rate","Steps","Stress"] },
];

const VITALS_TODAY = [
  { metric:"Resting Heart Rate", value:68, unit:"bpm", range:"60-100", trend:"stable",  icon:Heart, color:"#f87171" },
  { metric:"Steps Today",        value:8420, unit:"steps", range:"goal 10,000", trend:"on-track", icon:Footprints, color:"#4ade80" },
  { metric:"Sleep Last Night",   value:7.2, unit:"hrs", range:"goal 8", trend:"good", icon:Moon, color:"#a78bfa" },
  { metric:"Glucose (avg)",      value:142, unit:"mg/dL", range:"70-180", trend:"high", icon:Droplet, color:"#fbbf24" },
  { metric:"Blood Pressure",     value:"128/82", unit:"mmHg", range:"<130/80", trend:"borderline", icon:Activity, color:"#fb923c" },
  { metric:"Weight",             value:78.4, unit:"kg", range:"BMI 25.2", trend:"down -0.4", icon:TrendingUp, color:"#22d3ee" },
];

const STATUS_META: Record<DeviceStatus,{c:string;bg:string;label:string}> = {
  connected:{c:"#4ade80",bg:"rgba(74,222,128,0.1)",label:"Connected"},
  syncing:{c:"#22d3ee",bg:"rgba(34,211,238,0.1)",label:"Syncing"},
  disconnected:{c:"#fb923c",bg:"rgba(251,146,60,0.1)",label:"Disconnected"},
  error:{c:"#f87171",bg:"rgba(248,113,113,0.1)",label:"Sync Error"},
};

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function WearablesPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Wearable & Device Sync</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Apple Health · Google Fit · Dexcom CGM · Omron BP · Withings · Fitbit · Data flows to your care team</p>
        </div>
        <button style={{ display:"flex", alignItems:"center", gap:7, background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}><Plus style={{ width:14, height:14 }} />Connect Device</button>
      </div>

      <Card style={{ padding:20, marginBottom:16 }}>
        <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Today's Vitals from Devices</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {VITALS_TODAY.map(v => (
            <div key={v.metric} style={{ background:"rgba(255,255,255,0.02)", borderRadius:12, padding:14, borderLeft:`3px solid ${v.color}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <v.icon style={{ width:14, height:14, color:v.color }} />
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.55)" }}>{v.metric}</span>
              </div>
              <p style={{ fontSize:22, fontWeight:800, color:"#f1f5f9", margin:0 }}>{v.value} <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:500 }}>{v.unit}</span></p>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"4px 0 0" }}>{v.range} · {v.trend}</p>
            </div>
          ))}
        </div>
      </Card>

      <h3 style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.6)", margin:"0 0 12px", textTransform:"uppercase", letterSpacing:"0.07em" }}>Your Connected Devices</h3>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
        {DEVICES.map(d => {
          const sm = STATUS_META[d.status];
          return (
            <Card key={d.id} style={{ padding:18 }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:sm.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Watch style={{ width:20, height:20, color:sm.c }} />
                  </div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:800, color:"#f1f5f9", margin:0 }}>{d.name}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{d.vendor}</p>
                  </div>
                </div>
                <span style={{ fontSize:10, background:sm.bg, color:sm.c, borderRadius:5, padding:"3px 8px", fontWeight:700 }}>{d.status === "connected" ? <Wifi style={{ width:9, height:9, display:"inline", marginRight:3 }}/> : <WifiOff style={{ width:9, height:9, display:"inline", marginRight:3 }}/>}{sm.label}</span>
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
                {d.metrics.map(m => <span key={m} style={{ fontSize:10, background:"rgba(34,211,238,0.08)", color:"#22d3ee", borderRadius:5, padding:"2px 8px", fontWeight:600 }}>{m}</span>)}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"rgba(255,255,255,0.4)" }}>
                <span>Last sync: {d.lastSync}</span>
                <span>Battery: {d.battery}%</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
