"use client";

import { useState } from "react";

type CarePlan = {
  id: string; mrn: string; patient: string; age: number; dx: string;
  category: string; goals: string[]; interventions: string[];
  status: string; assignedTo: string; nextReview: string; risk: string;
  ward: string; admittedDays: number;
};

const PLANS: CarePlan[] = [
  {
    id:"CP-331", mrn:"MRN-10492", patient:"Ahmad Al-Rashid", age:45, dx:"Sepsis (Source: UTI)",
    category:"Infection", goals:["Fever < 37.8 within 24h","WBC trending down","Cultures cleared"],
    interventions:["IV Pip-Tazo 4.5g q8h","Strict I&O monitoring","Daily CBC + CRP","Urology consult"],
    status:"ACTIVE", assignedTo:"Nurse Aisha Al-Barrak", nextReview:"Today 14:00", risk:"HIGH", ward:"ED", admittedDays:0,
  },
  {
    id:"CP-330", mrn:"MRN-10488", patient:"Khalid Al-Dosari", age:67, dx:"NSTEMI",
    category:"Cardiac", goals:["Troponin peak & decline","Symptom-free","Echo before discharge"],
    interventions:["Dual antiplatelet therapy","Telemetry monitoring","Cardiology review","Lipid panel"],
    status:"ACTIVE", assignedTo:"Nurse Mohammed Al-Ghamdi", nextReview:"Today 16:00", risk:"HIGH", ward:"ICU", admittedDays:1,
  },
  {
    id:"CP-329", mrn:"MRN-10485", patient:"Nora Al-Otaibi", age:72, dx:"Community-acquired Pneumonia",
    category:"Respiratory", goals:["SpO₂ > 94% on room air","CXR improvement","Tolerating oral medications"],
    interventions:["Oral Amoxicillin-Clavulanate","Chest physiotherapy","Incentive spirometry","Nutrition support"],
    status:"DISCHARGE_PENDING", assignedTo:"Nurse Fatima Al-Rashidi", nextReview:"Discharge today", risk:"LOW", ward:"General", admittedDays:3,
  },
  {
    id:"CP-328", mrn:"MRN-10486", patient:"Omar Al-Shehri", age:54, dx:"Diffuse Large B-cell Lymphoma",
    category:"Oncology", goals:["Complete Chemo Cycle 2","Manage neutropenia","Nutritional status"],
    interventions:["CHOP regimen Day 2","G-CSF prophylaxis","Anti-emetics PRN","Dietitian referral"],
    status:"ACTIVE", assignedTo:"Nurse Reem Al-Qahtani", nextReview:"Tomorrow 10:00", risk:"MEDIUM", ward:"Oncology", admittedDays:1,
  },
  {
    id:"CP-327", mrn:"MRN-10487", patient:"Fatima Al-Qahtani", age:28, dx:"Acute Appendicitis — post-op",
    category:"Surgical", goals:["Pain VAS < 3","Tolerating diet","Wound healing","Early mobilisation"],
    interventions:["Paracetamol + Ketorolac ATC","Wound inspection BD","Physiotherapy","Remove drain today"],
    status:"ACTIVE", assignedTo:"Nurse Abdullah Al-Harbi", nextReview:"Today 18:00", risk:"LOW", ward:"General", admittedDays:1,
  },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  ACTIVE:            { bg:"rgba(34,211,238,0.12)",  color:"#22d3ee", label:"Active"          },
  DISCHARGE_PENDING: { bg:"rgba(74,222,128,0.12)",  color:"#4ade80", label:"D/C Pending"     },
  ON_HOLD:           { bg:"rgba(251,191,36,0.12)",  color:"#fbbf24", label:"On Hold"         },
  COMPLETED:         { bg:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.3)", label:"Completed" },
};

const RISK_STYLE: Record<string, { bg: string; color: string }> = {
  HIGH:   { bg:"rgba(239,68,68,0.15)",   color:"#f87171" },
  MEDIUM: { bg:"rgba(251,191,36,0.12)",  color:"#fbbf24" },
  LOW:    { bg:"rgba(74,222,128,0.12)",  color:"#4ade80" },
};

const CAT_COLOR: Record<string, string> = {
  Infection:"#22d3ee", Cardiac:"#f87171", Respiratory:"#60a5fa",
  Oncology:"#a78bfa", Surgical:"#fbbf24",
};

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

export default function CareManagementPage() {
  const [selected, setSelected] = useState<CarePlan | null>(null);
  const [filter, setFilter]     = useState("ALL");

  const displayed = filter === "ALL" ? PLANS : PLANS.filter(p => p.status === filter || p.risk === filter);

  return (
    <div style={{ padding:"28px 28px 40px", minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.3px", margin:0 }}>Care Management</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)", marginTop:4 }}>Active care plans · Interdisciplinary reviews</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:12, padding:"9px 20px", fontSize:13, fontWeight:700, cursor:"pointer" }}>+ New Plan</button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
        {([
          ["Total Plans",   PLANS.length, "#60a5fa"],
          ["High Risk",     PLANS.filter(p=>p.risk==="HIGH").length,   "#ef4444"],
          ["Due for Review",PLANS.filter(p=>p.nextReview.startsWith("Today")).length, "#fbbf24"],
          ["D/C Pending",   PLANS.filter(p=>p.status==="DISCHARGE_PENDING").length, "#4ade80"],
        ] as [string,number,string][]).map(([l,v,c])=>(
          <Card key={l} style={{ padding:16 }}>
            <p style={{ fontSize:28, fontWeight:800, color:c, lineHeight:1, margin:0 }}>{v}</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.38)", marginTop:4 }}>{l}</p>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display:"flex", gap:6, marginBottom:16 }}>
        {["ALL","ACTIVE","DISCHARGE_PENDING","HIGH","MEDIUM","LOW"].map(f=>{
          const st = STATUS_STYLE[f] ?? RISK_STYLE[f];
          return (
            <button key={f} onClick={()=>setFilter(f)} style={{
              padding:"6px 14px", borderRadius:9, fontSize:11, fontWeight:600, cursor:"pointer",
              background: filter===f?(st?.bg??"rgba(230,126,34,0.15)"):"transparent",
              border:`1px solid ${filter===f?(st?.color??"#e67e22")+"50":"rgba(255,255,255,0.1)"}`,
              color: filter===f?(st?.color??"#e67e22"):"rgba(255,255,255,0.4)",
            }}>{f==="ALL"?"All Plans":f==="HIGH"?"High Risk":f==="MEDIUM"?"Med Risk":f==="LOW"?"Low Risk":STATUS_STYLE[f]?.label??f}</button>
          );
        })}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:selected?"1fr 400px":"1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {displayed.map(plan=>{
            const st  = STATUS_STYLE[plan.status]??STATUS_STYLE.ACTIVE;
            const rst = RISK_STYLE[plan.risk]??RISK_STYLE.LOW;
            const isSelected = selected?.id === plan.id;
            return (
              <div key={plan.id} onClick={()=>setSelected(isSelected?null:plan)}
                style={{ borderRadius:16, padding:18, cursor:"pointer",
                  background: isSelected?"rgba(230,126,34,0.05)":"rgba(255,255,255,0.03)",
                  border:`1px solid ${isSelected?"rgba(230,126,34,0.3)":"rgba(255,255,255,0.07)"}`,
                }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:CAT_COLOR[plan.category]??"#60a5fa", background:(CAT_COLOR[plan.category]??"#60a5fa")+"15", padding:"2px 8px", borderRadius:6 }}>{plan.category}</span>
                      <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:6, background:rst.bg, color:rst.color }}>{plan.risk} Risk</span>
                    </div>
                    <p style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", margin:"0 0 2px" }}>{plan.patient}</p>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", margin:0 }}>{plan.mrn} · Age {plan.age} · {plan.dx}</p>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0, marginLeft:16 }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:st.bg, color:st.color }}>{st.label}</span>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", margin:"4px 0 0" }}>Review: {plan.nextReview}</p>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.07em", margin:"0 0 5px" }}>Goals</p>
                    {plan.goals.map(g=>(
                      <div key={g} style={{ display:"flex", alignItems:"flex-start", gap:6, marginBottom:3 }}>
                        <span style={{ color:"#4ade80", marginTop:1, flexShrink:0 }}>✓</span>
                        <span style={{ fontSize:11, color:"rgba(255,255,255,0.55)" }}>{g}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.07em", margin:"0 0 5px" }}>Interventions</p>
                    {plan.interventions.slice(0,3).map(iv=>(
                      <div key={iv} style={{ display:"flex", alignItems:"flex-start", gap:6, marginBottom:3 }}>
                        <span style={{ color:"#60a5fa", marginTop:1, flexShrink:0 }}>→</span>
                        <span style={{ fontSize:11, color:"rgba(255,255,255,0.55)" }}>{iv}</span>
                      </div>
                    ))}
                    {plan.interventions.length > 3 && <span style={{ fontSize:10, color:"rgba(255,255,255,0.25)" }}>+{plan.interventions.length-3} more</span>}
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:10 }}>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{plan.assignedTo}</span>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{plan.ward} · Day {plan.admittedDays}</span>
                </div>
              </div>
            );
          })}
        </div>

        {selected && (
          <Card style={{ padding:20, alignSelf:"start", position:"sticky", top:20 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", margin:0 }}>{selected.patient}</h3>
              <button onClick={()=>setSelected(null)} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer", fontSize:20, lineHeight:1 }}>×</button>
            </div>
            {([
              ["Plan ID",selected.id],["MRN",selected.mrn],["Diagnosis",selected.dx],
              ["Category",selected.category],["Risk",selected.risk],
              ["Assigned To",selected.assignedTo],["Next Review",selected.nextReview],
            ] as [string,string][]).map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{l}</span>
                <span style={{ fontSize:12, color:"#e2e8f0", fontWeight:500, textAlign:"right", maxWidth:220 }}>{v}</span>
              </div>
            ))}

            <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.28)", textTransform:"uppercase", letterSpacing:"0.07em", margin:"16px 0 8px" }}>All Interventions</p>
            {selected.interventions.map((iv,i)=>(
              <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
                <span style={{ color:"#60a5fa", flexShrink:0 }}>→</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>{iv}</span>
              </div>
            ))}

            <div style={{ display:"flex", gap:8, marginTop:16 }}>
              {["Update","Review","Close"].map(a=>(
                <button key={a} style={{ flex:1, padding:"8px 0", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer",
                  background: a==="Update"?"#e67e22":"rgba(255,255,255,0.05)",
                  color: a==="Update"?"white":"rgba(255,255,255,0.55)",
                  border:`1px solid ${a==="Update"?"transparent":"rgba(255,255,255,0.08)"}`,
                }}>{a}</button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
