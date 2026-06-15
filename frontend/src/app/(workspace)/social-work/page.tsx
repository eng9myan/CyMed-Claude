"use client";

import { useState } from "react";
import {
  Heart, AlertTriangle, Shield, Home, Users,
  Plus, FileText, CheckCircle2, Clock, BookOpen,
  HandHeart, MessageCircle,
} from "lucide-react";

type CaseType = "discharge_planning" | "safeguarding" | "advance_care" | "financial" | "psychosocial" | "chaplaincy" | "substance" | "bereavement";
type RiskFlag = "child_abuse" | "elder_abuse" | "ipv" | "self_harm" | "homelessness" | "neglect" | "food_insecurity" | "transportation";
type ACPStatus = "no_directive" | "in_progress" | "documented" | "dnr_signed" | "polst_signed";

type Patient = {
  id: string; name: string; mrn: string; ward: string; bed: string;
  caseType: CaseType[]; primarySW: string;
  riskFlags: RiskFlag[];
  acpStatus: ACPStatus; surrogate?: string;
  goalsOfCare?: string;
  resources: { name: string; status: "linked"|"pending"|"declined" }[];
  notes: { date: string; author: string; type: string; text: string }[];
};

const CASE_LABELS: Record<CaseType, { color: string; label: string }> = {
  discharge_planning: { color:"#22d3ee", label:"Discharge Planning" },
  safeguarding:       { color:"#f87171", label:"Safeguarding" },
  advance_care:       { color:"#a78bfa", label:"Advance Care Planning" },
  financial:          { color:"#fbbf24", label:"Financial Assistance" },
  psychosocial:       { color:"#4ade80", label:"Psychosocial" },
  chaplaincy:         { color:"#f472b6", label:"Chaplaincy / Spiritual" },
  substance:          { color:"#fb923c", label:"Substance Use" },
  bereavement:        { color:"#94a3b8", label:"Bereavement" },
};

const FLAG_LABELS: Record<RiskFlag, string> = {
  child_abuse:"Child Abuse Suspected", elder_abuse:"Elder Abuse Suspected",
  ipv:"Intimate Partner Violence", self_harm:"Self-Harm Risk",
  homelessness:"Homelessness", neglect:"Neglect", food_insecurity:"Food Insecurity", transportation:"Transportation Barrier",
};

const ACP_LABELS: Record<ACPStatus, { color: string; label: string }> = {
  no_directive: { color:"#94a3b8", label:"No Directive on File" },
  in_progress:  { color:"#fbbf24", label:"Discussion in Progress" },
  documented:   { color:"#22d3ee", label:"Goals Documented" },
  dnr_signed:   { color:"#a78bfa", label:"DNR/DNI Signed" },
  polst_signed: { color:"#4ade80", label:"POLST/MOLST on File" },
};

const PATIENTS: Patient[] = [
  {
    id:"P1", name:"Ahmad Al-Rashid", mrn:"MRN-10492", ward:"Cardiology", bed:"4A",
    caseType:["discharge_planning","psychosocial"], primarySW:"SW Sara Bin Hamad",
    riskFlags:["transportation"],
    acpStatus:"documented",
    surrogate:"Wife — Layla Al-Rashid (proxy on file)",
    goalsOfCare:"Patient wishes full code, max therapy if reversible. DNR if irreversible cardiac arrest. Wishes to die at home if terminal.",
    resources:[
      { name:"Cardiac rehab program — Tier 2", status:"linked" },
      { name:"Hospital transport voucher (×8 weeks)", status:"linked" },
      { name:"Community pharmacist follow-up", status:"pending" },
    ],
    notes:[
      { date:"2026-06-13", author:"SW Sara Bin Hamad", type:"Discharge planning", text:"Met with patient and wife. Home accessibility OK, no stairs to bedroom. Cardiac rehab arranged for Mon-Wed-Fri at CyMed outpatient. Transport voucher issued. Discussed financial assistance — patient declined, has full insurance." },
      { date:"2026-06-11", author:"Chaplain Yusuf Al-Amin", type:"Spiritual care", text:"Brief visit. Patient is observant Muslim, requested prayer guidance during ICU stay. Discussed coping with cardiac event. Plan: weekly visits during recovery." },
    ],
  },
  {
    id:"P2", name:"Fatima Al-Zahra", mrn:"MRN-10485", ward:"General Medicine", bed:"7B",
    caseType:["psychosocial","financial","safeguarding"], primarySW:"SW Nora Al-Otaibi",
    riskFlags:["ipv","food_insecurity"],
    acpStatus:"no_directive",
    resources:[
      { name:"DV crisis hotline & shelter contacts", status:"linked" },
      { name:"Food bank referral — local mosque pantry", status:"linked" },
      { name:"Legal aid for protective order", status:"pending" },
      { name:"Outpatient psychology for trauma", status:"linked" },
    ],
    notes:[
      { date:"2026-06-13", author:"SW Nora Al-Otaibi", type:"Safeguarding", text:"⚠ IPV disclosure during private interview. Patient declined immediate police involvement. Safety plan developed: code word, emergency bag location, shelter ready. Mandatory reporting per MoH protocol completed. Plan: discharge to family in Riyadh, not back to home address." },
      { date:"2026-06-12", author:"SW Nora Al-Otaibi", type:"Financial", text:"Food insecurity assessment positive (6/6 items). Linked to mosque pantry. Discussed Zakat fund eligibility for medical bills." },
    ],
  },
  {
    id:"P3", name:"Khalid Al-Dosari", mrn:"MRN-10488", ward:"Oncology", bed:"2C",
    caseType:["advance_care","chaplaincy","bereavement"], primarySW:"SW Reem Al-Harbi",
    riskFlags:[],
    acpStatus:"polst_signed",
    surrogate:"Son — Yousef Al-Dosari (DPOA-HC on file)",
    goalsOfCare:"Comfort-focused. No CPR, no intubation, no artificial nutrition. Wishes to remain in hospital for symptom management. Family informed and aligned. Hospice referral declined per family wishes.",
    resources:[
      { name:"Palliative care consult — daily", status:"linked" },
      { name:"Chaplaincy daily visits (Imam)", status:"linked" },
      { name:"Bereavement support for family", status:"linked" },
    ],
    notes:[
      { date:"2026-06-13", author:"Chaplain Imam Saleh", type:"Spiritual care", text:"Daily visit. Recited Surah Yaseen with patient and family at bedside. Patient lucid, expressed gratitude. Family receiving spiritual support. Plan: continue daily." },
      { date:"2026-06-10", author:"SW Reem Al-Harbi", type:"ACP", text:"Family meeting with oncology team. POLST signed. Goals clarified: comfort-focused. Symptom management with PRN morphine. Anticipatory grief discussed with adult children." },
    ],
  },
];

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function SocialWorkPage() {
  const [active, setActive] = useState<Patient>(PATIENTS[0]);
  const acpM = ACP_LABELS[active.acpStatus];

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Social Work · Chaplaincy · Advance Care Planning</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Psychosocial · Safeguarding · POLST/DNR · Spiritual care · Discharge resources</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"8px 14px", color:"#f87171", fontSize:12, fontWeight:700, cursor:"pointer" }}><AlertTriangle style={{ width:13, height:13 }} />Report Safeguarding</button>
          <button style={{ display:"flex", alignItems:"center", gap:7, background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer" }}><Plus style={{ width:14, height:14 }} />New Note</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {PATIENTS.map(p => {
            const isA = active.id === p.id;
            const hasFlags = p.riskFlags.length > 0;
            return (
              <Card key={p.id} style={{ padding:14, cursor:"pointer", border:`1px solid ${isA?"rgba(230,126,34,0.3)":hasFlags?"rgba(248,113,113,0.25)":"rgba(255,255,255,0.07)"}`, background:isA?"rgba(230,126,34,0.07)":"rgba(255,255,255,0.03)", borderLeft: hasFlags?"3px solid #f87171":"3px solid transparent" }} onClick={()=>setActive(p)}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <div style={{ width:34, height:34, borderRadius:10, background:"rgba(167,139,250,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#a78bfa" }}>{p.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
                  <div>
                    <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:0 }}>{p.name}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{p.ward} · Bed {p.bed}</p>
                  </div>
                </div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:6 }}>
                  {p.caseType.slice(0,2).map(c => (
                    <span key={c} style={{ fontSize:9, background:`${CASE_LABELS[c].color}15`, color:CASE_LABELS[c].color, borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{CASE_LABELS[c].label}</span>
                  ))}
                </div>
                {hasFlags && (
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:5 }}>
                    <AlertTriangle style={{ width:10, height:10, color:"#f87171" }} />
                    <span style={{ fontSize:10, color:"#f87171", fontWeight:700 }}>{p.riskFlags.length} risk flag(s)</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Risk flags banner */}
          {active.riskFlags.length > 0 && (
            <Card style={{ padding:14, background:"rgba(248,113,113,0.05)", border:"1px solid rgba(248,113,113,0.25)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <Shield style={{ width:15, height:15, color:"#f87171" }} />
                <span style={{ fontSize:13, fontWeight:700, color:"#f87171" }}>Safeguarding & Risk Flags</span>
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {active.riskFlags.map(f => (
                  <span key={f} style={{ fontSize:11, background:"rgba(248,113,113,0.12)", color:"#f87171", borderRadius:7, padding:"3px 10px", fontWeight:700, border:"1px solid rgba(248,113,113,0.25)" }}>⚠ {FLAG_LABELS[f]}</span>
                ))}
              </div>
            </Card>
          )}

          {/* ACP */}
          <Card style={{ padding:18 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:7 }}>
                <BookOpen style={{ width:14, height:14, color:"#a78bfa" }} /> Advance Care Planning
              </h3>
              <span style={{ fontSize:11, background:`${acpM.color}15`, color:acpM.color, borderRadius:6, padding:"3px 10px", fontWeight:700 }}>{acpM.label}</span>
            </div>
            {active.surrogate && (
              <div style={{ background:"rgba(34,211,238,0.05)", border:"1px solid rgba(34,211,238,0.15)", borderRadius:10, padding:12, marginBottom:10 }}>
                <p style={{ fontSize:10, color:"rgba(34,211,238,0.7)", margin:0, textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Healthcare Surrogate / DPOA</p>
                <p style={{ fontSize:12, color:"#f1f5f9", margin:"4px 0 0", fontWeight:600 }}>{active.surrogate}</p>
              </div>
            )}
            {active.goalsOfCare ? (
              <div style={{ background:"rgba(167,139,250,0.04)", border:"1px solid rgba(167,139,250,0.15)", borderRadius:10, padding:14 }}>
                <p style={{ fontSize:10, color:"rgba(167,139,250,0.7)", margin:0, textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Goals of Care</p>
                <p style={{ fontSize:12, color:"#f1f5f9", margin:"6px 0 0", lineHeight:1.6 }}>{active.goalsOfCare}</p>
              </div>
            ) : (
              <button style={{ width:"100%", padding:"10px 0", background:"rgba(167,139,250,0.1)", border:"1px dashed rgba(167,139,250,0.3)", borderRadius:10, color:"#a78bfa", fontSize:12, fontWeight:600, cursor:"pointer" }}>+ Initiate ACP Discussion</button>
            )}
          </Card>

          {/* Resources */}
          <Card style={{ padding:18 }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 12px", display:"flex", alignItems:"center", gap:7 }}>
              <HandHeart style={{ width:14, height:14, color:"#4ade80" }} /> Community Resources & Referrals
            </h3>
            {active.resources.map((r,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px", marginBottom:6, background:"rgba(255,255,255,0.02)", borderRadius:9 }}>
                <span style={{ fontSize:12, color:"#f1f5f9" }}>{r.name}</span>
                <span style={{ fontSize:10, background: r.status==="linked"?"rgba(74,222,128,0.15)":r.status==="pending"?"rgba(251,191,36,0.15)":"rgba(148,163,184,0.12)", color: r.status==="linked"?"#4ade80":r.status==="pending"?"#fbbf24":"#94a3b8", borderRadius:5, padding:"2px 9px", fontWeight:700, textTransform:"uppercase" }}>{r.status}</span>
              </div>
            ))}
          </Card>

          {/* Notes */}
          <Card style={{ padding:18 }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 12px" }}>SW / Chaplaincy Notes</h3>
            {active.notes.map((n,i) => (
              <div key={i} style={{ padding:12, marginBottom:8, background:"rgba(255,255,255,0.02)", borderRadius:10, borderLeft:"3px solid #a78bfa" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:"#a78bfa" }}>{n.author}</span>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>{n.date} · {n.type}</span>
                </div>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.7)", margin:0, lineHeight:1.55 }}>{n.text}</p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
