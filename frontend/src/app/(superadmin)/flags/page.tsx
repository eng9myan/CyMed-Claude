"use client";
import { useState } from "react";
import { ToggleRight, ToggleLeft, Plus, AlertTriangle, Users } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

type Flag = { key:string; name:string; description:string; enabled:boolean; rollout:number; tenants:number; environment:string; killSwitch:boolean; };

const INITIAL_FLAGS: Flag[] = [
  { key:"ai_ambient_scribe",    name:"AI Ambient Clinical Scribe", description:"Auto-generate visit notes from ambient audio",                  enabled:true,  rollout:25, tenants:3, environment:"production", killSwitch:false },
  { key:"nphies_v2",            name:"NPHIES v2 Adapter",         description:"New NPHIES integration adapter (KSA claims)",                   enabled:true,  rollout:100,tenants:42,environment:"production", killSwitch:true },
  { key:"genomics_panel",        name:"Genomics & PGx Panel",       description:"Pharmacogenomic decision support in CPOE",                     enabled:true,  rollout:60, tenants:8, environment:"production", killSwitch:true },
  { key:"new_billing_engine",    name:"Revenue Cycle v2 Engine",    description:"Rewritten billing engine with denial AI",                       enabled:false, rollout:0,  tenants:0, environment:"staging",   killSwitch:false },
  { key:"voice_dictation",       name:"Voice Dictation in EMR",      description:"Real-time speech-to-text for clinical notes",                    enabled:true,  rollout:80, tenants:24,environment:"production", killSwitch:false },
  { key:"telehealth_group_v2",  name:"Group Video v2 (50 attendees)",description:"Increased participant cap for tumor boards",                  enabled:true,  rollout:50, tenants:12,environment:"production", killSwitch:false },
  { key:"experimental_cds",      name:"Experimental Sepsis CDS",     description:"Beta sepsis prediction model — pilot tenants only",            enabled:true,  rollout:10, tenants:2, environment:"production", killSwitch:true },
  { key:"dark_launch_mobile",    name:"Mobile App Dark Launch",      description:"Quietly enable mobile features for opt-in users",                enabled:false, rollout:0,  tenants:0, environment:"production", killSwitch:false },
];

export default function FlagsPage() {
  const [flags, setFlags] = useState(INITIAL_FLAGS);
  function toggle(k:string){ setFlags(prev=>prev.map(f=>f.key===k?{...f,enabled:!f.enabled}:f)); }

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Feature Flag Management</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Per-tenant toggles · Gradual rollout · A/B testing · Kill switches for unstable features</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>New Flag</button>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {flags.map(f => (
          <Card key={f.key} style={{ padding:18 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 200px 200px 80px", gap:18, alignItems:"center" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>{f.name}</p>
                  <span style={{ fontSize:9, fontFamily:"monospace", background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)", borderRadius:4, padding:"1px 6px" }}>{f.key}</span>
                  {f.killSwitch && <span style={{ fontSize:9, background:"rgba(244,63,94,0.15)", color:"#f43f5e", borderRadius:4, padding:"1px 7px", fontWeight:700 }}>⚠ KILL SWITCH</span>}
                </div>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:0 }}>{f.description}</p>
              </div>
              <div>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 4px" }}>Rollout: {f.rollout}%</p>
                <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", background:"#e67e22", width:`${f.rollout}%` }} />
                </div>
              </div>
              <div>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0 }}><Users style={{ width:10, height:10, display:"inline", marginRight:4 }}/>{f.tenants} tenants · {f.environment}</p>
              </div>
              <button onClick={()=>toggle(f.key)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {f.enabled ? <ToggleRight style={{ width:36, height:36, color:"#4ade80" }} /> : <ToggleLeft style={{ width:36, height:36, color:"rgba(255,255,255,0.25)" }} />}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
