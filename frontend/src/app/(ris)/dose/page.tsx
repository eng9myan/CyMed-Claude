"use client";

import { useState } from "react";
import {
  Radio, TrendingUp, AlertTriangle, BarChart3, Shield,
  Calendar, Search, ChevronRight, Activity,
} from "lucide-react";

type Modality = "CT" | "Fluoroscopy" | "Mammography" | "Nuclear" | "Interventional";
type DoseAlertLevel = "normal" | "elevated" | "high" | "critical";

type Exam = {
  id: string; date: string; patient: string; mrn: string; modality: Modality;
  protocol: string; bodyPart: string;
  dlp?: number;        // mGy·cm for CT
  ctdiVol?: number;    // mGy for CT
  dap?: number;        // Gy·cm² for fluoro
  fluoroTime?: number; // minutes
  effectiveDose: number; // mSv
  drlValue: number;      // diagnostic reference level
  drlExceeded: boolean;
  cumulativeDose: number; // mSv lifetime
  technologist: string;
  radiologist: string;
  alertLevel: DoseAlertLevel;
};

const EXAMS: Exam[] = [
  { id:"DX001", date:"2026-06-13 09:14", patient:"Ahmad Al-Rashid", mrn:"MRN-10492", modality:"CT", protocol:"CT Chest with contrast", bodyPart:"Chest", dlp:520, ctdiVol:12.5, effectiveDose:7.3, drlValue:600, drlExceeded:false, cumulativeDose:38.5, technologist:"Tech Hassan", radiologist:"Dr. Al-Ghamdi", alertLevel:"normal" },
  { id:"DX002", date:"2026-06-13 10:42", patient:"Fatima Al-Zahra", mrn:"MRN-10485", modality:"CT", protocol:"CT Abdomen/Pelvis multiphase", bodyPart:"Abdomen", dlp:1850, ctdiVol:22.8, effectiveDose:25.9, drlValue:1500, drlExceeded:true, cumulativeDose:67.2, technologist:"Tech Omar", radiologist:"Dr. Hassan", alertLevel:"high" },
  { id:"DX003", date:"2026-06-13 11:30", patient:"Sara Al-Ghamdi", mrn:"MRN-10490", modality:"Interventional", protocol:"Coronary angiography + PCI", bodyPart:"Cardiac", dap:48.6, fluoroTime:24, effectiveDose:9.8, drlValue:50, drlExceeded:false, cumulativeDose:112.4, technologist:"Tech Reem", radiologist:"Dr. Al-Rashid", alertLevel:"elevated" },
  { id:"DX004", date:"2026-06-13 13:05", patient:"Khalid Al-Dosari", mrn:"MRN-10488", modality:"CT", protocol:"CT Head non-contrast", bodyPart:"Head", dlp:780, ctdiVol:48, effectiveDose:1.8, drlValue:850, drlExceeded:false, cumulativeDose:14.2, technologist:"Tech Hassan", radiologist:"Dr. Al-Ghamdi", alertLevel:"normal" },
  { id:"DX005", date:"2026-06-13 14:20", patient:"Omar Al-Shehri", mrn:"MRN-10486", modality:"Interventional", protocol:"TIPS procedure", bodyPart:"Hepatic", dap:142.5, fluoroTime:62, effectiveDose:28.4, drlValue:100, drlExceeded:true, cumulativeDose:185.8, technologist:"Tech Layla", radiologist:"Dr. Hassan", alertLevel:"critical" },
  { id:"DX006", date:"2026-06-13 15:30", patient:"Layla Al-Otaibi", mrn:"MRN-10489", modality:"Mammography", protocol:"Diagnostic Mammo bilateral", bodyPart:"Breast", effectiveDose:0.4, drlValue:0.6, drlExceeded:false, cumulativeDose:3.2, technologist:"Tech Nora", radiologist:"Dr. Al-Otaibi", alertLevel:"normal" },
];

const ALERT_META: Record<DoseAlertLevel,{c:string;bg:string;label:string}> = {
  normal:   { c:"#4ade80", bg:"rgba(74,222,128,0.1)",  label:"Normal" },
  elevated: { c:"#fbbf24", bg:"rgba(251,191,36,0.1)",  label:"Elevated" },
  high:     { c:"#fb923c", bg:"rgba(251,146,60,0.1)",  label:"High Dose" },
  critical: { c:"#f43f5e", bg:"rgba(244,63,94,0.12)",  label:"Critical — Notify" },
};

const MODALITY_META: Record<Modality,{c:string}> = {
  CT:             { c:"#22d3ee" },
  Fluoroscopy:    { c:"#a78bfa" },
  Mammography:    { c:"#f472b6" },
  Nuclear:        { c:"#fbbf24" },
  Interventional: { c:"#fb923c" },
};

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function RadiationDosePage() {
  const [active, setActive] = useState<Exam>(EXAMS[1]);

  const drlBreaches = EXAMS.filter(e=>e.drlExceeded).length;
  const criticalAlerts = EXAMS.filter(e=>e.alertLevel==="critical").length;
  const totalToday = EXAMS.reduce((s,e)=>s+e.effectiveDose, 0);
  const avgDose = totalToday / EXAMS.length;
  const am = ALERT_META[active.alertLevel];

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:10 }}>
            <Radio style={{ width:24, height:24, color:"#fbbf24" }} />
            Radiation Dose Tracking
          </h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>RDSR ingestion · DRL comparison · Cumulative lifetime dose · ICRP compliance · Threshold alerts</p>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:20 }}>
        {[
          { l:"Exams Today", v:EXAMS.length, c:"#22d3ee" },
          { l:"DRL Exceeded", v:drlBreaches, c:"#f87171" },
          { l:"Critical Alerts", v:criticalAlerts, c:"#f43f5e" },
          { l:"Total Dose Today", v:`${totalToday.toFixed(1)} mSv`, c:"#fbbf24" },
          { l:"Avg / Exam", v:`${avgDose.toFixed(1)} mSv`, c:"#a78bfa" },
        ].map(s => (
          <Card key={s.l} style={{ padding:"12px 16px" }}>
            <p style={{ fontSize:20, fontWeight:800, color:s.c, margin:0 }}>{s.v}</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{s.l}</p>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"380px 1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {EXAMS.map(e => {
            const am2 = ALERT_META[e.alertLevel];
            const mm = MODALITY_META[e.modality];
            const isA = active.id === e.id;
            return (
              <Card key={e.id} style={{ padding:14, cursor:"pointer", border:`1px solid ${isA?"rgba(230,126,34,0.3)":e.drlExceeded?"rgba(248,113,113,0.25)":"rgba(255,255,255,0.07)"}`, background:isA?"rgba(230,126,34,0.07)":"rgba(255,255,255,0.03)", borderLeft:e.alertLevel==="critical"?"3px solid #f43f5e":e.drlExceeded?"3px solid #fb923c":"3px solid transparent" }} onClick={()=>setActive(e)}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:11, fontFamily:"monospace", color:"#22d3ee" }}>{e.id}</span>
                  <span style={{ fontSize:9, background:`${mm.c}18`, color:mm.c, borderRadius:5, padding:"2px 8px", fontWeight:700 }}>{e.modality}</span>
                </div>
                <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:0 }}>{e.patient}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{e.protocol}</p>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:8 }}>
                  <span style={{ fontSize:15, fontWeight:800, color:am2.c }}>{e.effectiveDose.toFixed(1)} mSv</span>
                  <span style={{ fontSize:9, background:am2.bg, color:am2.c, borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{am2.label}</span>
                </div>
              </Card>
            );
          })}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Card style={{ padding:0, overflow:"hidden" }}>
            <div style={{ padding:"16px 22px", borderBottom:"1px solid rgba(255,255,255,0.06)", background:active.alertLevel==="critical"||active.alertLevel==="high"?"rgba(244,63,94,0.04)":"transparent" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                <div>
                  <h2 style={{ fontSize:17, fontWeight:800, color:"#f1f5f9", margin:0 }}>{active.protocol}</h2>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"3px 0 0" }}>{active.patient} · {active.mrn} · {active.date}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:"3px 0 0" }}>Tech: {active.technologist} · Reading: {active.radiologist}</p>
                </div>
                {(active.alertLevel === "critical" || active.drlExceeded) && (
                  <div style={{ background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.3)", borderRadius:10, padding:"7px 14px", display:"flex", alignItems:"center", gap:7 }}>
                    <AlertTriangle style={{ width:14, height:14, color:"#f43f5e" }} />
                    <span style={{ fontSize:12, fontWeight:800, color:"#f43f5e" }}>{active.alertLevel === "critical" ? "Critical Dose Alert" : "DRL Exceeded"}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding:22 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 }}>
                {active.dlp !== undefined && (
                  <div style={{ background:"rgba(34,211,238,0.04)", borderLeft:"3px solid #22d3ee", borderRadius:10, padding:"12px 14px" }}>
                    <p style={{ fontSize:9, color:"rgba(34,211,238,0.7)", margin:0, textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>DLP</p>
                    <p style={{ fontSize:20, fontWeight:800, color:"#22d3ee", margin:"3px 0 0" }}>{active.dlp}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0 }}>mGy·cm</p>
                  </div>
                )}
                {active.ctdiVol !== undefined && (
                  <div style={{ background:"rgba(167,139,250,0.04)", borderLeft:"3px solid #a78bfa", borderRadius:10, padding:"12px 14px" }}>
                    <p style={{ fontSize:9, color:"rgba(167,139,250,0.7)", margin:0, textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>CTDI vol</p>
                    <p style={{ fontSize:20, fontWeight:800, color:"#a78bfa", margin:"3px 0 0" }}>{active.ctdiVol}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0 }}>mGy</p>
                  </div>
                )}
                {active.dap !== undefined && (
                  <div style={{ background:"rgba(251,146,60,0.04)", borderLeft:"3px solid #fb923c", borderRadius:10, padding:"12px 14px" }}>
                    <p style={{ fontSize:9, color:"rgba(251,146,60,0.7)", margin:0, textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>DAP</p>
                    <p style={{ fontSize:20, fontWeight:800, color:"#fb923c", margin:"3px 0 0" }}>{active.dap}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0 }}>Gy·cm²</p>
                  </div>
                )}
                {active.fluoroTime !== undefined && (
                  <div style={{ background:"rgba(244,114,182,0.04)", borderLeft:"3px solid #f472b6", borderRadius:10, padding:"12px 14px" }}>
                    <p style={{ fontSize:9, color:"rgba(244,114,182,0.7)", margin:0, textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>Fluoro Time</p>
                    <p style={{ fontSize:20, fontWeight:800, color:"#f472b6", margin:"3px 0 0" }}>{active.fluoroTime}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0 }}>minutes</p>
                  </div>
                )}
                <div style={{ background:"rgba(251,191,36,0.04)", borderLeft:"3px solid #fbbf24", borderRadius:10, padding:"12px 14px" }}>
                  <p style={{ fontSize:9, color:"rgba(251,191,36,0.7)", margin:0, textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>Effective Dose</p>
                  <p style={{ fontSize:20, fontWeight:800, color:"#fbbf24", margin:"3px 0 0" }}>{active.effectiveDose}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0 }}>mSv (E)</p>
                </div>
                <div style={{ background:"rgba(248,113,113,0.04)", borderLeft:"3px solid #f87171", borderRadius:10, padding:"12px 14px" }}>
                  <p style={{ fontSize:9, color:"rgba(248,113,113,0.7)", margin:0, textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>Cumulative</p>
                  <p style={{ fontSize:20, fontWeight:800, color:"#f87171", margin:"3px 0 0" }}>{active.cumulativeDose}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0 }}>mSv lifetime</p>
                </div>
              </div>

              {/* DRL comparison */}
              <div style={{ background:active.drlExceeded?"rgba(248,113,113,0.05)":"rgba(74,222,128,0.05)", border:`1px solid ${active.drlExceeded?"rgba(248,113,113,0.2)":"rgba(74,222,128,0.2)"}`, borderRadius:12, padding:16 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <Shield style={{ width:15, height:15, color:active.drlExceeded?"#f87171":"#4ade80" }} />
                    <span style={{ fontSize:13, fontWeight:700, color:"#f1f5f9" }}>
                      Diagnostic Reference Level (DRL) Comparison
                    </span>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, color:active.drlExceeded?"#f87171":"#4ade80" }}>
                    {active.drlExceeded ? "⚠ EXCEEDED" : "✓ Within DRL"}
                  </span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>Patient: {active.modality === "Interventional" || active.modality === "Fluoroscopy" ? `${active.dap} Gy·cm²` : `${active.dlp} mGy·cm`}</span>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>National DRL: {active.drlValue}</span>
                </div>
                <div style={{ height:10, background:"rgba(255,255,255,0.06)", borderRadius:6, overflow:"hidden", position:"relative" }}>
                  <div style={{ height:"100%", background:active.drlExceeded?"linear-gradient(90deg,#f87171,#f43f5e)":"linear-gradient(90deg,#4ade80,#22c55e)", width:`${Math.min(100, ((active.dap ?? active.dlp ?? 0) / active.drlValue) * 100)}%` }} />
                  <div style={{ position:"absolute", top:-2, height:14, width:2, background:"#fbbf24", left:"100%", transform:"translateX(-100%)" }} />
                </div>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"6px 0 0", fontStyle:"italic" }}>
                  ICRP-103 reference. Persistent breaches require physicist review and protocol re-optimization.
                </p>
              </div>
            </div>
          </Card>

          {/* Cumulative trend */}
          <Card style={{ padding:18 }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 12px", display:"flex", alignItems:"center", gap:7 }}>
              <TrendingUp style={{ width:14, height:14, color:"#f87171" }} /> Patient Cumulative Lifetime Dose
            </h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
              {[
                { label:"Lifetime cumulative", v:`${active.cumulativeDose} mSv`, c:"#f87171" },
                { label:"This year (2026)",    v:`${(active.cumulativeDose * 0.35).toFixed(1)} mSv`, c:"#fbbf24" },
                { label:"Last 30 days",        v:`${(active.effectiveDose + 3.2).toFixed(1)} mSv`, c:"#fb923c" },
                { label:"ICRP annual limit",   v:"20 mSv/yr", c:"rgba(255,255,255,0.4)" },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontSize:18, fontWeight:800, color:s.c, margin:0 }}>{s.v}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
