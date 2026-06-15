"use client";

import { useState } from "react";
import {
  Activity, Target, TrendingUp, CheckCircle2, Plus,
  User, Calendar, ChevronRight, Hand, MessageSquare, Footprints,
} from "lucide-react";

type Discipline = "PT" | "OT" | "SLT";
type GoalStatus = "active" | "met" | "deferred";

type FIMItem = { label: string; score: number };
type Goal = { id: string; text: string; target: number; current: number; status: GoalStatus };

type Patient = {
  id: string; name: string; mrn: string; bed: string; dx: string;
  discipline: Discipline; therapist: string;
  startDate: string; sessions: number; lastSession: string;
  fim: { motor: FIMItem[]; cognitive: FIMItem[] };
  goals: Goal[];
  notes: { date: string; soap: string }[];
};

const DISCIPLINE_META: Record<Discipline,{c:string;label:string;icon:React.ReactNode}> = {
  PT:  { c:"#4ade80", label:"Physiotherapy",          icon:<Footprints style={{ width:14, height:14 }} /> },
  OT:  { c:"#a78bfa", label:"Occupational Therapy",   icon:<Hand style={{ width:14, height:14 }} /> },
  SLT: { c:"#f472b6", label:"Speech & Language",      icon:<MessageSquare style={{ width:14, height:14 }} /> },
};

const PATIENTS: Patient[] = [
  {
    id:"P1", name:"Ahmad Al-Rashid", mrn:"MRN-10492", bed:"4A", dx:"R MCA Stroke, Day 4",
    discipline:"PT", therapist:"PT Hala Mansour", startDate:"2026-06-09", sessions:8, lastSession:"2026-06-13",
    fim:{
      motor:[
        { label:"Eating", score:5 }, { label:"Grooming", score:4 }, { label:"Bathing", score:3 },
        { label:"Dressing (upper)", score:4 }, { label:"Dressing (lower)", score:3 }, { label:"Toileting", score:4 },
        { label:"Bladder", score:6 }, { label:"Bowel", score:6 }, { label:"Bed/chair transfer", score:3 },
        { label:"Toilet transfer", score:3 }, { label:"Tub/shower transfer", score:2 }, { label:"Walk/wheelchair", score:3 }, { label:"Stairs", score:1 },
      ],
      cognitive:[
        { label:"Comprehension", score:6 }, { label:"Expression", score:5 }, { label:"Social interaction", score:6 },
        { label:"Problem solving", score:5 }, { label:"Memory", score:5 },
      ]
    },
    goals:[
      { id:"g1", text:"Independent bed-to-chair transfer (FIM 6)",       target:6, current:3, status:"active" },
      { id:"g2", text:"Ambulate 30m with rolling walker",                target:6, current:3, status:"active" },
      { id:"g3", text:"Climb 6 stairs with rail, supervision",            target:5, current:1, status:"active" },
      { id:"g4", text:"Modified Barthel Index ≥75/100 at discharge",      target:75, current:48, status:"active" },
    ],
    notes:[
      { date:"2026-06-13", soap:"S: Pt reports fatigue but motivated. O: Sit-to-stand ×8 reps with min assist. Gait 15m with RW, mod assist. A: Progressing well, tolerating increased intensity. P: Add stair training next session, continue strengthening." },
      { date:"2026-06-11", soap:"S: Mild left shoulder pain 3/10. O: Hemi-sling worn intermittently. PROM L UE WNL. Bed mobility w/ mod assist. A: L hemiparesis improving, motor return in arm. P: Add facilitation exercises, AAROM home programme." },
    ]
  },
  {
    id:"P2", name:"Fatima Al-Zahra", mrn:"MRN-10485", bed:"7B", dx:"Post-CABG Day 3, Sternal Precautions",
    discipline:"OT", therapist:"OT Reem Saleh", startDate:"2026-06-11", sessions:4, lastSession:"2026-06-13",
    fim:{
      motor:[
        { label:"Eating", score:6 }, { label:"Grooming", score:5 }, { label:"Bathing", score:4 },
        { label:"Dressing (upper)", score:4 }, { label:"Dressing (lower)", score:5 }, { label:"Toileting", score:5 },
        { label:"Bladder", score:7 }, { label:"Bowel", score:7 }, { label:"Bed/chair transfer", score:5 },
        { label:"Toilet transfer", score:5 }, { label:"Tub/shower transfer", score:3 }, { label:"Walk/wheelchair", score:5 }, { label:"Stairs", score:4 },
      ],
      cognitive:[
        { label:"Comprehension", score:7 }, { label:"Expression", score:7 }, { label:"Social interaction", score:7 },
        { label:"Problem solving", score:7 }, { label:"Memory", score:7 },
      ]
    },
    goals:[
      { id:"g1", text:"Independent UE dressing within sternal precautions", target:7, current:4, status:"active" },
      { id:"g2", text:"Energy conservation techniques for ADLs",            target:7, current:5, status:"active" },
      { id:"g3", text:"Home assessment & equipment recommendations",        target:1, current:0, status:"active" },
    ],
    notes:[
      { date:"2026-06-13", soap:"S: 'Easier to dress today.' O: UE dressing with min cueing for sternal precautions. Energy conservation training during shower sim. A: Improving independence. P: Caregiver training tomorrow for d/c home setup." },
    ]
  },
  {
    id:"P3", name:"Khalid Al-Dosari", mrn:"MRN-10488", bed:"2C", dx:"Total Laryngectomy, Day 7",
    discipline:"SLT", therapist:"SLT Nora Bin Salem", startDate:"2026-06-08", sessions:6, lastSession:"2026-06-13",
    fim:{
      motor:[],
      cognitive:[
        { label:"Comprehension", score:7 }, { label:"Expression", score:2 }, { label:"Social interaction", score:5 },
        { label:"Problem solving", score:6 }, { label:"Memory", score:7 },
      ]
    },
    goals:[
      { id:"g1", text:"Successful electrolarynx use for daily needs", target:7, current:4, status:"active" },
      { id:"g2", text:"Stoma care & suctioning independent",          target:7, current:6, status:"active" },
      { id:"g3", text:"Voice prosthesis fitting eligibility",         target:1, current:0, status:"deferred" },
      { id:"g4", text:"Swallow safety — soft diet without aspiration", target:7, current:7, status:"met" },
    ],
    notes:[]
  },
];

const FIM_GUIDE = [
  { v:7, label:"Complete independence" },
  { v:6, label:"Modified independence" },
  { v:5, label:"Supervision" },
  { v:4, label:"Minimal assistance" },
  { v:3, label:"Moderate assistance" },
  { v:2, label:"Maximal assistance" },
  { v:1, label:"Total assistance" },
];

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

function scoreColor(v: number) {
  if (v >= 6) return "#4ade80";
  if (v >= 4) return "#fbbf24";
  if (v >= 2) return "#fb923c";
  return "#f87171";
}

export default function AlliedHealthPage() {
  const [active, setActive] = useState<Patient>(PATIENTS[0]);
  const dm = DISCIPLINE_META[active.discipline];
  const motorTotal = active.fim.motor.reduce((s,i)=>s+i.score,0);
  const motorMax = active.fim.motor.length*7;
  const cogTotal = active.fim.cognitive.reduce((s,i)=>s+i.score,0);
  const cogMax = active.fim.cognitive.length*7;
  const fimTotal = motorTotal + cogTotal;
  const fimMax = motorMax + cogMax;

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Allied Health / Rehabilitation</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Physiotherapy · Occupational Therapy · Speech & Language · FIM scoring · Goal tracking</p>
        </div>
        <button style={{ display:"flex", alignItems:"center", gap:7, background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          <Plus style={{ width:14, height:14 }} /> Document Session
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {PATIENTS.map(p => {
            const meta = DISCIPLINE_META[p.discipline];
            const isA = active.id === p.id;
            return (
              <Card key={p.id} style={{ padding:14, cursor:"pointer", border:`1px solid ${isA?"rgba(230,126,34,0.3)":"rgba(255,255,255,0.07)"}`, background:isA?"rgba(230,126,34,0.07)":"rgba(255,255,255,0.03)" }} onClick={()=>setActive(p)}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:`${meta.c}18`, border:`1px solid ${meta.c}35`, display:"flex", alignItems:"center", justifyContent:"center", color:meta.c }}>{meta.icon}</div>
                  <div>
                    <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:0 }}>{p.name}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>Bed {p.bed}</p>
                  </div>
                </div>
                <span style={{ fontSize:10, background:`${meta.c}15`, color:meta.c, borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{meta.label}</span>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.45)", margin:"6px 0 0" }}>{p.dx}</p>
                <p style={{ fontSize:9, color:"rgba(255,255,255,0.3)", margin:"3px 0 0" }}>{p.sessions} sessions · {p.therapist}</p>
              </Card>
            );
          })}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {[
              { l:"FIM Total", v:`${fimTotal}/${fimMax}`, c:scoreColor(fimTotal/fimMax*7) },
              { l:"Motor FIM", v:active.fim.motor.length?`${motorTotal}/${motorMax}`:"N/A", c:active.fim.motor.length?scoreColor(motorTotal/(motorMax||1)*7):"rgba(255,255,255,0.3)" },
              { l:"Cognitive FIM", v:`${cogTotal}/${cogMax}`, c:scoreColor(cogTotal/cogMax*7) },
              { l:"Sessions", v:active.sessions.toString(), c:"#22d3ee" },
            ].map(s => (
              <Card key={s.l} style={{ padding:"12px 16px" }}>
                <p style={{ fontSize:22, fontWeight:800, color:s.c, margin:0 }}>{s.v}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{s.l}</p>
              </Card>
            ))}
          </div>

          {active.fim.motor.length > 0 && (
            <Card style={{ padding:18 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 12px", display:"flex", alignItems:"center", gap:6 }}>
                <Activity style={{ width:14, height:14, color:dm.c }} /> Functional Independence Measure (FIM) — Motor
              </h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8 }}>
                {active.fim.motor.map(f => (
                  <div key={f.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 12px", background:"rgba(255,255,255,0.02)", borderRadius:8 }}>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>{f.label}</span>
                    <span style={{ fontSize:13, fontWeight:800, color:scoreColor(f.score) }}>{f.score}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card style={{ padding:18 }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 12px", display:"flex", alignItems:"center", gap:6 }}>
              <Target style={{ width:14, height:14, color:"#e67e22" }} /> Goals & Progress
            </h3>
            {active.goals.map(g => {
              const pct = (g.current / g.target) * 100;
              return (
                <div key={g.id} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, color: g.status==="met"?"#4ade80":"#f1f5f9", fontWeight:500 }}>
                      {g.status==="met" && <CheckCircle2 style={{ width:11, height:11, display:"inline", marginRight:5, color:"#4ade80" }} />}
                      {g.text}
                    </span>
                    <span style={{ fontSize:11, color: g.status==="met"?"#4ade80":g.status==="deferred"?"#94a3b8":"#fbbf24", fontWeight:700 }}>{g.current}/{g.target}</span>
                  </div>
                  <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", background:g.status==="met"?"#4ade80":g.status==="deferred"?"#94a3b8":dm.c, width:`${Math.min(100, pct)}%`, transition:"width 0.4s" }} />
                  </div>
                </div>
              );
            })}
          </Card>

          {active.notes.length > 0 && (
            <Card style={{ padding:18 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 12px" }}>Recent SOAP Notes</h3>
              {active.notes.map((n,i) => (
                <div key={i} style={{ marginBottom:10, padding:12, background:"rgba(255,255,255,0.02)", borderRadius:10, borderLeft:`3px solid ${dm.c}` }}>
                  <p style={{ fontSize:11, fontWeight:700, color:dm.c, margin:"0 0 5px" }}>{n.date}</p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.7)", margin:0, lineHeight:1.55 }}>{n.soap}</p>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
