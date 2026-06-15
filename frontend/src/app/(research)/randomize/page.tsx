"use client";
import { useState } from "react";
import { Dice5, Shield, Users, Eye, Lock } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const ASSIGNMENTS = [
  { id:"R001", subject:"Subject 084 (Site 02)", strat:"Age 60-69, BMI ≥30", arm:"A — Combination", date:"2026-06-13 09:14", blinded:true },
  { id:"R002", subject:"Subject 083 (Site 01)", strat:"Age 50-59, BMI 25-29", arm:"B — Placebo",    date:"2026-06-12 14:30", blinded:true },
  { id:"R003", subject:"Subject 082 (Site 03)", strat:"Age 60-69, BMI 25-29", arm:"A — Combination", date:"2026-06-11 11:00", blinded:true },
  { id:"R004", subject:"Subject 081 (Site 02)", strat:"Age 50-59, BMI ≥30",   arm:"B — Placebo",    date:"2026-06-10 16:22", blinded:true },
];

export default function RandomizePage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Randomization & Blinding</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>IWRS-style allocation · Stratified randomization · Block randomization · Emergency unblinding · DSMB reports</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Subjects Randomized</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>84</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Arm A (Active)</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>42</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Arm B (Placebo)</p><p style={{ fontSize:24, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>42</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Unblinding Events</p><p style={{ fontSize:24, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>0</p></Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"380px 1fr", gap:16 }}>
        <Card style={{ padding:22 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 16px", display:"flex", alignItems:"center", gap:7 }}><Dice5 style={{ width:14, height:14, color:"#f472b6" }} />Randomize Subject</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div>
              <label style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Subject ID</label>
              <input placeholder="SUBJ-085" style={{ marginTop:4, width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:12, outline:"none" }} />
            </div>
            <div>
              <label style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Site</label>
              <select style={{ marginTop:4, width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:12, outline:"none" }}>
                <option>Site 01 — CyMed General</option><option>Site 02 — Al Nahda</option><option>Site 03 — Eastern</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Stratification</label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginTop:4 }}>
                <select style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:11, outline:"none" }}><option>Age 50-59</option><option>Age 60-69</option></select>
                <select style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:11, outline:"none" }}><option>BMI 25-29</option><option>BMI ≥30</option></select>
              </div>
            </div>
            <button style={{ marginTop:6, background:"linear-gradient(135deg,#a855f7,#7e22ce)", color:"white", border:"none", borderRadius:12, padding:"12px 0", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><Dice5 style={{ width:16, height:16 }} />Randomize Now</button>
          </div>

          <div style={{ marginTop:18, padding:14, background:"rgba(248,113,113,0.04)", border:"1px solid rgba(248,113,113,0.15)", borderRadius:12 }}>
            <p style={{ fontSize:11, fontWeight:700, color:"#f87171", margin:0, display:"flex", alignItems:"center", gap:6 }}><Eye style={{ width:12, height:12 }} />Emergency Unblinding</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.5)", margin:"6px 0 0", lineHeight:1.5 }}>Only authorized PI may unblind in case of SAE requiring treatment knowledge. Audit-logged.</p>
            <button style={{ marginTop:8, background:"rgba(248,113,113,0.15)", border:"1px solid rgba(248,113,113,0.3)", color:"#f87171", borderRadius:8, padding:"5px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>Request Unblinding</button>
          </div>
        </Card>

        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>Recent Randomizations</h3>
          </div>
          {ASSIGNMENTS.map(a => (
            <div key={a.id} style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"grid", gridTemplateColumns:"1fr 200px 140px 120px", gap:14, alignItems:"center" }}>
              <div>
                <p style={{ fontSize:11, fontFamily:"monospace", color:"#22d3ee", margin:0 }}>{a.id}</p>
                <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:"3px 0 0" }}>{a.subject}</p>
              </div>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>{a.strat}</span>
              <span style={{ fontSize:11, background: a.blinded?"rgba(167,139,250,0.15)":"rgba(74,222,128,0.15)", color: a.blinded?"#a78bfa":"#4ade80", borderRadius:6, padding:"4px 10px", fontWeight:700, textAlign:"center" }}>
                {a.blinded ? <Lock style={{ width:10, height:10, display:"inline", marginRight:4 }}/> : null}
                {a.blinded ? "BLINDED" : a.arm}
              </span>
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{a.date}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
