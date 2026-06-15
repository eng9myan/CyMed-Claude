"use client";
import { Shield, Lock, AlertTriangle, CheckCircle2, Eye } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const CHECKS = [
  { name:"MFA enforcement",                  status:"pass", desc:"100% of users enrolled" },
  { name:"TLS 1.3 minimum",                  status:"pass", desc:"All endpoints" },
  { name:"Field-level PHI encryption",       status:"pass", desc:"AES-256 at rest" },
  { name:"Privileged access management",     status:"pass", desc:"PAM session recording active" },
  { name:"Service-mesh mTLS",                status:"pass", desc:"Istio mTLS strict mode" },
  { name:"Audit log immutability",           status:"pass", desc:"Tamper-evident, 7 yr retention" },
  { name:"Vulnerability scan (weekly)",      status:"warn", desc:"2 medium severity findings open" },
  { name:"Penetration test (annual)",        status:"pass", desc:"Completed 2026-04, all critical resolved" },
];

const RECENT_EVENTS = [
  { time:"09:42", severity:"info",    event:"Successful MFA challenge — Dr. Al-Mutawa", source:"10.42.1.18" },
  { time:"09:41", severity:"info",    event:"PHI export request approved by data steward", source:"system" },
  { time:"09:38", severity:"warn",    event:"3 failed login attempts — user locked", source:"203.0.113.42" },
  { time:"09:30", severity:"info",    event:"Service-mesh certificate rotated", source:"istio-system" },
  { time:"09:14", severity:"critical",event:"Anomalous data access pattern flagged — user temp suspended", source:"45.33.18.12" },
];

export default function SecurityPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:10 }}><Shield style={{ width:24, height:24, color:"#4ade80" }}/>Zero-Trust Security</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>SOC 2 Type II · HIPAA · GDPR · MFA · PAM · mTLS · Continuous compliance monitoring</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Compliance Score</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>96/100</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Active Threats</p><p style={{ fontSize:24, fontWeight:800, color:"#fb923c", margin:"4px 0 0" }}>1</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>MFA Adoption</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>100%</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Audit Events (24h)</p><p style={{ fontSize:24, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>284K</p></Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Compliance Controls</h3>
          {CHECKS.map(c => (
            <div key={c.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px", marginBottom:5, background:"rgba(255,255,255,0.02)", borderRadius:10, borderLeft:`3px solid ${c.status==="pass"?"#4ade80":"#fbbf24"}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {c.status === "pass" ? <CheckCircle2 style={{ width:14, height:14, color:"#4ade80" }} /> : <AlertTriangle style={{ width:14, height:14, color:"#fbbf24" }} />}
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:0 }}>{c.name}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{c.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </Card>

        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Recent Security Events</h3>
          {RECENT_EVENTS.map((e,i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px", marginBottom:5, background:"rgba(255,255,255,0.02)", borderRadius:10, borderLeft:`3px solid ${e.severity==="critical"?"#f43f5e":e.severity==="warn"?"#fbbf24":"#22d3ee"}` }}>
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)", flexShrink:0, fontFamily:"monospace" }}>{e.time}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:12, color: e.severity==="critical"?"#f43f5e":"#f1f5f9", margin:0 }}>{e.event}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0", fontFamily:"monospace" }}>Source: {e.source}</p>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
