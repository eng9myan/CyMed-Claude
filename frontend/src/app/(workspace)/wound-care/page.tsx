"use client";

import { useState } from "react";
import {
  Bandage, Camera, ChevronDown, ChevronRight, AlertTriangle,
  CheckCircle2, Plus, TrendingUp, TrendingDown, Minus,
  Calendar, User, ClipboardList, Activity,
} from "lucide-react";

type WoundType = "pressure_injury" | "diabetic_foot" | "surgical" | "vascular" | "traumatic" | "burn";
type HealingTrend = "improving" | "static" | "deteriorating";
type BradenRisk = "no_risk" | "mild" | "moderate" | "high" | "very_high";

type WoundAssessment = {
  date: string; length: number; width: number; depth: number;
  exudate: string; tissue: string; odour: boolean; peri: string;
  pain: number; dressing: string; nurse: string; photo?: boolean;
};

type Wound = {
  id: string; patientId: string; location: string; type: WoundType;
  category?: string; onset: string; healingTrend: HealingTrend;
  assessments: WoundAssessment[]; bradenScore: number; bradenRisk: BradenRisk;
  currentDressing: string; nextChange: string; nursing: string;
};

type WoundPatient = {
  id: string; name: string; mrn: string; bed: string; ward: string;
  wounds: Wound[];
};

const TYPE_META: Record<WoundType, { color: string; label: string }> = {
  pressure_injury: { color:"#f87171", label:"Pressure Injury" },
  diabetic_foot:   { color:"#fbbf24", label:"Diabetic Foot" },
  surgical:        { color:"#22d3ee", label:"Surgical Wound" },
  vascular:        { color:"#a78bfa", label:"Vascular" },
  traumatic:       { color:"#fb923c", label:"Traumatic" },
  burn:            { color:"#f43f5e", label:"Burn" },
};

const TREND_META: Record<HealingTrend, { color: string; label: string; icon: React.ReactNode }> = {
  improving:     { color:"#4ade80", label:"Improving",     icon:<TrendingUp style={{ width:13, height:13 }} /> },
  static:        { color:"#fbbf24", label:"Static",        icon:<Minus style={{ width:13, height:13 }} /> },
  deteriorating: { color:"#f87171", label:"Deteriorating", icon:<TrendingDown style={{ width:13, height:13 }} /> },
};

const PATIENTS: WoundPatient[] = [
  {
    id:"P1", name:"Ahmad Al-Rashid", mrn:"MRN-10492", bed:"4A", ward:"Cardiology",
    wounds: [
      {
        id:"W1", patientId:"P1", location:"Sacrum", type:"pressure_injury", category:"Stage 2",
        onset:"2026-06-08", healingTrend:"improving",
        bradenScore:14, bradenRisk:"mild",
        currentDressing:"Mepilex Border Lite", nextChange:"2026-06-15", nursing:"Reposition Q2H",
        assessments: [
          { date:"2026-06-13", length:3.5, width:2.8, depth:0.2, exudate:"Minimal serous", tissue:"Epithelialising (70%), granulation (30%)", odour:false, peri:"Intact, slight erythema", pain:2, dressing:"Mepilex Border Lite", nurse:"Nurse Rasha", photo:true },
          { date:"2026-06-10", length:4.2, width:3.1, depth:0.3, exudate:"Moderate serous", tissue:"Slough (40%), granulation (60%)", odour:false, peri:"Maceration around edges", pain:3, dressing:"Aquacel AG", nurse:"Nurse Layla", photo:true },
          { date:"2026-06-08", length:5.0, width:3.5, depth:0.5, exudate:"Moderate", tissue:"Slough (80%)", odour:false, peri:"Peri-wound erythema", pain:4, dressing:"Aquacel AG", nurse:"Nurse Omar", photo:false },
        ],
      }
    ]
  },
  {
    id:"P2", name:"Fatima Al-Zahra", mrn:"MRN-10485", bed:"7B", ward:"General Medicine",
    wounds: [
      {
        id:"W2", patientId:"P2", location:"Right plantar heel", type:"diabetic_foot",
        onset:"2026-05-20", healingTrend:"static",
        bradenScore:16, bradenRisk:"mild",
        currentDressing:"NPWT (VAC)", nextChange:"2026-06-14", nursing:"Non-weight-bearing, diabetic nurse educator involved",
        assessments: [
          { date:"2026-06-13", length:2.2, width:1.8, depth:0.8, exudate:"Moderate haemoserous", tissue:"Granulation (60%), slough (40%)", odour:false, peri:"Callus formation, peripheral neuropathy", pain:0, dressing:"NPWT -125mmHg", nurse:"Nurse Sana", photo:true },
          { date:"2026-06-10", length:2.3, width:1.9, depth:0.9, exudate:"Moderate", tissue:"Granulation (50%), slough (50%)", odour:false, peri:"Callus, neuropathy", pain:0, dressing:"NPWT", nurse:"Nurse Sana", photo:true },
        ],
      }
    ]
  },
  {
    id:"P3", name:"Khalid Al-Dosari", mrn:"MRN-10488", bed:"2C", ward:"Surgery",
    wounds: [
      {
        id:"W3", patientId:"P3", location:"Midline abdominal", type:"surgical",
        onset:"2026-06-11", healingTrend:"improving",
        bradenScore:20, bradenRisk:"no_risk",
        currentDressing:"Aquacel Surgical", nextChange:"2026-06-18", nursing:"Daily inspection, mobilise day 2",
        assessments: [
          { date:"2026-06-13", length:18, width:0.5, depth:0, exudate:"Nil", tissue:"Healing by primary intention", odour:false, peri:"No erythema, sutures intact", pain:2, dressing:"Aquacel Surgical", nurse:"Nurse Layla", photo:false },
        ],
      }
    ]
  }
];

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

export default function WoundCarePage() {
  const [activeP, setActiveP] = useState<WoundPatient>(PATIENTS[0]);
  const [activeWound, setActiveWound] = useState<Wound>(PATIENTS[0].wounds[0]);
  const [showAssessForm, setShowAssessForm] = useState(false);

  const latest = activeWound.assessments[0];
  const prev    = activeWound.assessments[1];
  const trend   = TREND_META[activeWound.healingTrend];
  const tm      = TYPE_META[activeWound.type];

  function selectPatient(p: WoundPatient) {
    setActiveP(p);
    setActiveWound(p.wounds[0]);
  }

  const prevArea = prev ? (prev.length * prev.width).toFixed(1) : "-";
  const latestArea = (latest.length * latest.width).toFixed(1);
  const areaChange = prev ? ((latest.length * latest.width) - (prev.length * prev.width)).toFixed(1) : null;

  return (
    <div style={{ padding:"24px", minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Wound Care</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>
            Wound assessment Â· Photo progression Â· Braden scoring Â· Dressing management
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {[
            { l:"Active Wounds", v:PATIENTS.reduce((s,p)=>s+p.wounds.length,0), c:"#e67e22" },
            { l:"Deteriorating", v:PATIENTS.reduce((s,p)=>s+p.wounds.filter(w=>w.healingTrend==="deteriorating").length,0), c:"#f87171" },
            { l:"Improving", v:PATIENTS.reduce((s,p)=>s+p.wounds.filter(w=>w.healingTrend==="improving").length,0), c:"#4ade80" },
          ].map(s => (
            <Card key={s.l} style={{ padding:"10px 14px" }}>
              <p style={{ fontSize:22, fontWeight:800, color:s.c, margin:0 }}>{s.v}</p>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{s.l}</p>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:16 }}>
        {/* Patient + wound list */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {PATIENTS.map(p => (
            <Card key={p.id} style={{ padding:14, cursor:"pointer",
              border:`1px solid ${activeP.id===p.id?"rgba(230,126,34,0.3)":"rgba(255,255,255,0.07)"}`,
              background:activeP.id===p.id?"rgba(230,126,34,0.07)":"rgba(255,255,255,0.03)" }}
              onClick={() => selectPatient(p)}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <div style={{ width:34, height:34, borderRadius:10, background:"rgba(230,126,34,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#e67e22" }}>
                  {p.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                </div>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:0 }}>{p.name}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>Bed {p.bed} Â· {p.ward}</p>
                </div>
              </div>
              {p.wounds.map(w => {
                const wt = TYPE_META[w.type];
                const wtr = TREND_META[w.healingTrend];
                return (
                  <div key={w.id}
                    onClick={e => { e.stopPropagation(); selectPatient(p); setActiveWound(w); }}
                    style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 8px", borderRadius:8, marginBottom:4,
                      background: activeWound.id===w.id?"rgba(230,126,34,0.1)":"rgba(255,255,255,0.02)",
                      border:`1px solid ${activeWound.id===w.id?"rgba(230,126,34,0.3)":"rgba(255,255,255,0.05)"}` }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:wt.color, flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:11, fontWeight:500, color:"rgba(255,255,255,0.7)", margin:0 }}>{w.location}</p>
                      <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:0 }}>{wt.label}</p>
                    </div>
                    <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:10, color:wtr.color, fontWeight:600 }}>
                      {wtr.icon}
                    </span>
                  </div>
                );
              })}
            </Card>
          ))}
        </div>

        {/* Wound detail */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Wound header */}
          <Card style={{ padding:18 }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <h2 style={{ fontSize:17, fontWeight:800, color:"#f1f5f9", margin:0 }}>{activeWound.location}</h2>
                  <span style={{ fontSize:10, background:`${tm.color}18`, color:tm.color, borderRadius:6, padding:"2px 10px", fontWeight:700 }}>{tm.label}</span>
                  {activeWound.category && <span style={{ fontSize:10, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.5)", borderRadius:6, padding:"2px 10px" }}>{activeWound.category}</span>}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:trend.color, fontWeight:600 }}>
                    {trend.icon} {trend.label}
                  </span>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>Onset: {activeWound.onset}</span>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>Dressing: {activeWound.currentDressing}</span>
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(164,203,100,0.1)", border:"1px solid rgba(164,203,100,0.25)", borderRadius:10, padding:"7px 14px", color:"#84cc16", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                  <Camera style={{ width:13, height:13 }} /> Photo
                </button>
                <button onClick={() => setShowAssessForm(!showAssessForm)}
                  style={{ display:"flex", alignItems:"center", gap:6, background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"7px 16px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                  <Plus style={{ width:13, height:13 }} /> New Assessment
                </button>
              </div>
            </div>
          </Card>

          {/* Measurements trend */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {[
              { l:"Length (cm)", v:latest.length.toString(), prev: prev?.length.toString() },
              { l:"Width (cm)",  v:latest.width.toString(),  prev: prev?.width.toString() },
              { l:"Depth (cm)",  v:latest.depth.toString(),  prev: prev?.depth.toString() },
              { l:"Area (cmÂ²)",  v:latestArea,                prev: prevArea },
            ].map(m => {
              const curr = parseFloat(m.v);
              const p2 = prev ? parseFloat(m.prev!) : null;
              const diff = p2 !== null ? curr - p2 : null;
              return (
                <Card key={m.l} style={{ padding:"14px 16px" }}>
                  <p style={{ fontSize:22, fontWeight:800, color:"#f1f5f9", margin:0 }}>{m.v}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{m.l}</p>
                  {diff !== null && diff !== 0 && (
                    <p style={{ fontSize:10, margin:"4px 0 0", color: diff<0?"#4ade80":"#f87171", fontWeight:700 }}>
                      {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} from last
                    </p>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Assessment history */}
          <Card style={{ padding:0, overflow:"hidden" }}>
            <div style={{ padding:"12px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>Assessment History</h3>
            </div>
            <div style={{ overflowY:"auto", maxHeight:360 }}>
              {activeWound.assessments.map((a, i) => (
                <div key={i} style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)", background: i===0?"rgba(74,222,128,0.03)":"transparent" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:13, fontWeight:700, color: i===0?"#4ade80":"rgba(255,255,255,0.6)" }}>{a.date}</span>
                      {i===0 && <span style={{ fontSize:9, background:"rgba(74,222,128,0.15)", color:"#4ade80", borderRadius:4, padding:"1px 6px", fontWeight:700 }}>LATEST</span>}
                      {a.photo && <Camera style={{ width:12, height:12, color:"#a78bfa" }} />}
                    </div>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>{a.nurse}</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:8 }}>
                    {[
                      { l:"Dimensions", v:`${a.length}Ã—${a.width}Ã—${a.depth}cm` },
                      { l:"Exudate",    v:a.exudate },
                      { l:"Pain (0â€“10)",v:a.pain.toString() },
                      { l:"Tissue",     v:a.tissue },
                      { l:"Peri-wound", v:a.peri },
                      { l:"Odour",      v:a.odour?"Present":"Absent" },
                    ].map(f => (
                      <div key={f.l} style={{ background:"rgba(255,255,255,0.02)", borderRadius:8, padding:"7px 10px" }}>
                        <p style={{ fontSize:9, color:"rgba(255,255,255,0.3)", margin:"0 0 2px", textTransform:"uppercase", letterSpacing:"0.05em" }}>{f.l}</p>
                        <p style={{ fontSize:11, fontWeight:500, color:"#f1f5f9", margin:0 }}>{f.v}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:8, padding:"7px 12px" }}>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 2px" }}>Dressing applied</p>
                    <p style={{ fontSize:11, color:"#f1f5f9", margin:0 }}>{a.dressing}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Nursing notes */}
          <Card style={{ padding:14 }}>
            <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.07em", margin:"0 0 10px" }}>Nursing Notes</p>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.7)", margin:0, lineHeight:1.6 }}>{activeWound.nursing}</p>
            <div style={{ marginTop:10, display:"flex", justifyContent:"space-between", padding:"8px 0", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>Next dressing change</span>
              <span style={{ fontSize:11, fontWeight:600, color:"#fbbf24" }}>{activeWound.nextChange}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


