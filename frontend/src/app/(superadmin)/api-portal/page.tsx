"use client";
import { useState } from "react";
import { Key, Code, BookOpen, Activity, Plus, Webhook } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const KEYS = [
  { name:"Production — Tenant Bupa",   prefix:"cym_live_8a4b...",  scopes:"patient.read, billing.write", rate:"1000/min", calls:1842000 },
  { name:"Sandbox — Mobile App",         prefix:"cym_test_4f2e...",  scopes:"all (sandbox)",                rate:"500/min",  calls:42000 },
  { name:"Production — Lab Integration", prefix:"cym_live_9c3d...",  scopes:"lab.write, lab.read",          rate:"5000/min", calls:8200000 },
  { name:"Production — Pharmacy Bot",    prefix:"cym_live_2b8a...",  scopes:"pharmacy.write, pharmacy.read",rate:"200/min",  calls:480000 },
];

const ENDPOINTS = [
  { method:"GET",    path:"/api/v1/patients/{id}",          calls:842000,  p95:48 },
  { method:"POST",   path:"/api/v1/encounters",             calls:124000,  p95:124 },
  { method:"GET",    path:"/api/v1/observations",           calls:2240000, p95:62 },
  { method:"POST",   path:"/api/v1/billing/claims",         calls:42000,   p95:280 },
  { method:"PATCH",  path:"/api/v1/medication-orders/{id}", calls:18400,   p95:142 },
  { method:"GET",    path:"/fhir/Patient/{id}",             calls:1842000, p95:88 },
];

export default function APIPortalPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Developer API Portal</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>API keys · Rate limiting · OpenAPI docs · Webhooks · SDK generation · FHIR R4 + REST</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>Generate API Key</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>API Calls (24h)</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>14.2M</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Active Keys</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>{KEYS.length}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>p95 Latency</p><p style={{ fontSize:24, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>94 ms</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Error Rate</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>0.04%</p></Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:6 }}><Key style={{ width:13, height:13, color:"#fbbf24" }}/>API Keys</h3>
          </div>
          {KEYS.map(k => (
            <div key={k.name} style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:0 }}>{k.name}</p>
                <span style={{ fontSize:10, color:"#4ade80", fontWeight:700 }}>{k.rate}</span>
              </div>
              <p style={{ fontSize:11, color:"#a78bfa", margin:"0 0 4px", fontFamily:"monospace" }}>{k.prefix}</p>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0 }}>Scopes: {k.scopes}</p>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"3px 0 0" }}>{(k.calls/1000).toFixed(0)}K calls this month</p>
            </div>
          ))}
        </Card>

        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:6 }}><Code style={{ width:13, height:13, color:"#22d3ee" }}/>Top Endpoints</h3>
          </div>
          {ENDPOINTS.map(e => (
            <div key={e.path} style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"grid", gridTemplateColumns:"60px 1fr 100px 60px", gap:10, alignItems:"center" }}>
              <span style={{ fontSize:10, fontWeight:800, color:e.method==="GET"?"#4ade80":e.method==="POST"?"#22d3ee":e.method==="PATCH"?"#fbbf24":"#f87171", background:"rgba(255,255,255,0.04)", borderRadius:5, padding:"3px 7px", textAlign:"center", fontFamily:"monospace" }}>{e.method}</span>
              <span style={{ fontSize:11, color:"#f1f5f9", fontFamily:"monospace" }}>{e.path}</span>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)", textAlign:"right" }}>{(e.calls/1000).toFixed(0)}K</span>
              <span style={{ fontSize:11, color: e.p95>200?"#fb923c":e.p95>100?"#fbbf24":"#4ade80", textAlign:"right", fontWeight:700 }}>{e.p95}ms</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
