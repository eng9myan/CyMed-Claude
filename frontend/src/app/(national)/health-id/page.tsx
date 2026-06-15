"use client";
import { CreditCard, Shield, QrCode, Smartphone, CheckCircle2 } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function HealthIDPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:10 }}><CreditCard style={{ width:24, height:24, color:"#0ea5e9" }} />Digital Health ID</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>National Digital Health Identity Card · QR / NFC enabled · Identity verification · Cross-facility unique identifier</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Registered Citizens</p><p style={{ fontSize:24, fontWeight:800, color:"#0ea5e9", margin:"4px 0 0" }}>34.2M</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Cards Issued</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>32.8M</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>95.9% coverage</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Mobile App Users</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>18.4M</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Daily Verifications</p><p style={{ fontSize:24, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>284K</p></Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"360px 1fr", gap:16 }}>
        {/* Card visual */}
        <Card style={{ padding:0, overflow:"hidden", background:"linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)" }}>
          <div style={{ padding:24, color:"white" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:30 }}>
              <Shield style={{ width:24, height:24 }} />
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", margin:0 }}>CYMED HEALTH ID</p>
            </div>
            <div style={{ marginBottom:24 }}>
              <p style={{ fontSize:10, opacity:0.7, margin:0 }}>HEALTH IDENTIFIER</p>
              <p style={{ fontSize:18, fontWeight:800, letterSpacing:"0.1em", margin:"4px 0 0", fontFamily:"monospace" }}>SA-2841-9921-4488</p>
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <p style={{ fontSize:9, opacity:0.7, margin:0 }}>NAME</p>
                <p style={{ fontSize:13, fontWeight:700, margin:"3px 0 0" }}>AHMAD AL-RASHID</p>
                <p style={{ fontSize:9, opacity:0.7, margin:"10px 0 0" }}>DOB</p>
                <p style={{ fontSize:11, fontWeight:600, margin:"2px 0 0" }}>1968-04-15</p>
              </div>
              <QrCode style={{ width:60, height:60 }} />
            </div>
          </div>
          <div style={{ padding:"10px 24px", background:"rgba(0,0,0,0.2)", display:"flex", alignItems:"center", gap:8 }}>
            <CheckCircle2 style={{ width:14, height:14, color:"#4ade80" }} />
            <span style={{ fontSize:11, color:"#4ade80", fontWeight:700 }}>VERIFIED · Active</span>
          </div>
        </Card>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Card style={{ padding:18 }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Identity Verification Methods</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
              {[
                { name:"Biometric (fingerprint)", status:"enrolled", color:"#4ade80" },
                { name:"Facial recognition",       status:"enrolled", color:"#4ade80" },
                { name:"NFC tap-to-verify",        status:"available", color:"#22d3ee" },
                { name:"QR code scan",             status:"available", color:"#22d3ee" },
                { name:"National ID linkage",      status:"linked",    color:"#4ade80" },
                { name:"Mobile OTP backup",        status:"enabled",   color:"#4ade80" },
              ].map(m => (
                <div key={m.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:"rgba(255,255,255,0.02)", borderRadius:10 }}>
                  <span style={{ fontSize:12, color:"#f1f5f9" }}>{m.name}</span>
                  <span style={{ fontSize:10, color:m.color, fontWeight:700, textTransform:"uppercase" }}>{m.status}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding:18 }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Recent ID Verifications</h3>
            {[
              { facility:"CyMed General Hospital", action:"Patient check-in", time:"2026-06-13 09:14" },
              { facility:"Al Nahda Polyclinic",     action:"Prescription pickup", time:"2026-06-10 14:30" },
              { facility:"Eastern Medical Lab",     action:"Lab specimen check-in", time:"2026-06-08 08:22" },
              { facility:"CyMed Pharmacy — Olaya",  action:"Controlled drug dispense", time:"2026-06-05 16:45" },
            ].map((v,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <div>
                  <p style={{ fontSize:12, color:"#f1f5f9", margin:0 }}>{v.facility}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{v.action}</p>
                </div>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0 }}>{v.time}</p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
