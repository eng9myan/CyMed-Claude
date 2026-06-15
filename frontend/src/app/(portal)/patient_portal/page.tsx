"use client";

import { useState } from "react";

// ── Mock patient data ────────────────────────────────────────────
const PATIENT = {
  name: "Ahmad Al-Rashid", mrn: "MRN-10492", dob: "1979-03-15", gender: "Male",
  nationality: "Saudi Arabia", insurance: "BUPA Arabia (BUPA-884421)",
  primaryPhysician: "Dr. Al-Mutawa — Internal Medicine",
  bloodType: "O+", allergies: ["Penicillin", "Sulfa drugs"],
};

const APPOINTMENTS = [
  { id:"A1", date:"2026-06-20", time:"09:30", provider:"Dr. Al-Mutawa", specialty:"Internal Medicine", type:"Follow-up",   status:"UPCOMING"  },
  { id:"A2", date:"2026-06-28", time:"11:00", provider:"Dr. Al-Ghamdi", specialty:"Cardiology",       type:"Consult",    status:"UPCOMING"  },
  { id:"A3", date:"2026-06-10", time:"08:45", provider:"Dr. Al-Mutawa", specialty:"Internal Medicine", type:"Review",     status:"COMPLETED" },
  { id:"A4", date:"2026-05-22", time:"10:15", provider:"Dr. Al-Harbi",  specialty:"Surgery",          type:"Post-op",    status:"COMPLETED" },
];

const LAB_RESULTS = [
  { id:"L1", date:"2026-06-10", panel:"CBC + CRP",       status:"REVIEWED", flag:"ABNORMAL", summary:"WBC 14.2 (H) · CRP 87 (H) · Hgb 11.8 (L)" },
  { id:"L2", date:"2026-06-08", panel:"ABG + Lactate",   status:"REVIEWED", flag:"CRITICAL", summary:"pH 7.22 (L) · Lactate 4.8 (HH)" },
  { id:"L3", date:"2026-05-20", panel:"Metabolic Panel",  status:"REVIEWED", flag:"NORMAL",   summary:"All values within normal range" },
  { id:"L4", date:"2026-05-01", panel:"Lipid Profile",   status:"REVIEWED", flag:"ABNORMAL", summary:"LDL 4.2 mmol/L (H) · Total cholesterol 6.1 (H)" },
];

const MEDICATIONS = [
  { name:"Piperacillin-Tazobactam", dose:"4.5g IV q8h",  prescriber:"Dr. Al-Mutawa", since:"2026-06-10", active:true  },
  { name:"Paracetamol",             dose:"1g PO q6h PRN", prescriber:"Dr. Al-Mutawa", since:"2026-06-10", active:true  },
  { name:"Metformin",               dose:"1g PO BD",      prescriber:"Dr. Al-Mutawa", since:"2025-01-15", active:true  },
  { name:"Atorvastatin",            dose:"40mg PO nocte",  prescriber:"Dr. Al-Mutawa", since:"2025-03-01", active:false },
];

const VITALS_HISTORY = [
  { date:"Jun 12", bp:"128/82", hr:88, temp:38.1, spo2:97 },
  { date:"Jun 11", bp:"134/86", hr:94, temp:38.6, spo2:96 },
  { date:"Jun 10", bp:"140/90", hr:102,temp:39.1, spo2:95 },
  { date:"Jun 09", bp:"136/88", hr:98, temp:38.8, spo2:96 },
];

const CONSENT_DOCS = [
  { id:"C1", title:"Surgical Consent — Appendectomy",      signed:"2026-05-15", signedBy:"Patient",  status:"SIGNED"  },
  { id:"C2", title:"Anaesthesia Consent Form",             signed:"2026-05-15", signedBy:"Patient",  status:"SIGNED"  },
  { id:"C3", title:"Data Sharing — MOH Integration",       signed:"",           signedBy:"",         status:"PENDING" },
  { id:"C4", title:"Research Participation — AI Trial",    signed:"",           signedBy:"",         status:"PENDING" },
];

const AI_MESSAGES = [
  { role:"assistant", text:"Hello Ahmad! I'm your CyMed AI health assistant. I can help you understand your recent results, medications, and upcoming appointments. How can I assist you today?" },
];

// ── Shared components ────────────────────────────────────────────
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 10px" }}>{children}</p>
);

const flagColor = (flag: string) =>
  flag === "CRITICAL" ? "#f87171" : flag === "ABNORMAL" ? "#fbbf24" : "#4ade80";

type Tab = "overview"|"appointments"|"results"|"medications"|"consents"|"ai";

export default function PatientPortal() {
  const [tab, setTab]         = useState<Tab>("overview");
  const [aiMessages, setAiMessages] = useState(AI_MESSAGES);
  const [aiInput, setAiInput] = useState("");

  const sendAI = () => {
    if (!aiInput.trim()) return;
    const userMsg = { role:"user", text:aiInput.trim() };
    const botMsg  = { role:"assistant", text:"Thank you for your question. Based on your recent results and care plan, I recommend discussing this with Dr. Al-Mutawa at your next appointment on June 20. Is there anything else I can help you with?" };
    setAiMessages(m=>[...m, userMsg, botMsg]);
    setAiInput("");
  };

  const TABS: { id: Tab; label: string }[] = [
    { id:"overview",      label:"Overview"      },
    { id:"appointments",  label:"Appointments"  },
    { id:"results",       label:"Lab Results"   },
    { id:"medications",   label:"Medications"   },
    { id:"consents",      label:"Consent Docs"  },
    { id:"ai",            label:"AI Assistant"  },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#080d18" }}>
      {/* Portal header */}
      <div style={{ background:"linear-gradient(90deg,rgba(230,126,34,0.12) 0%, rgba(34,211,238,0.06) 100%)", borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"20px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:"linear-gradient(135deg,#e67e22,#5dade2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:900, color:"white" }}>
            {PATIENT.name[0]}
          </div>
          <div>
            <h1 style={{ fontSize:20, fontWeight:800, color:"#f1f5f9", margin:0 }}>{PATIENT.name}</h1>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", margin:0 }}>{PATIENT.mrn} · {PATIENT.bloodType} · {PATIENT.insurance}</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <div style={{ padding:"5px 14px", borderRadius:99, background:"rgba(34,211,238,0.12)", border:"1px solid rgba(34,211,238,0.25)", fontSize:11, fontWeight:700, color:"#22d3ee" }}>
            ● Patient Portal
          </div>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 8px #4ade8080" }} />
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.45)" }}>Secure session</span>
        </div>
      </div>

      <div style={{ padding:"24px 32px 40px" }}>
        {/* Tabs */}
        <div style={{ display:"flex", gap:6, marginBottom:24, overflowX:"auto" }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:"7px 18px", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap",
              background: tab===t.id?"rgba(230,126,34,0.15)":"transparent",
              border:`1px solid ${tab===t.id?"rgba(230,126,34,0.4)":"rgba(255,255,255,0.08)"}`,
              color: tab===t.id?"#e67e22":"rgba(255,255,255,0.4)",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {/* Profile */}
            <Card style={{ padding:20 }}>
              <SectionLabel>Personal Information</SectionLabel>
              {([
                ["Full Name", PATIENT.name],["MRN", PATIENT.mrn],["Date of Birth", PATIENT.dob],
                ["Gender", PATIENT.gender],["Nationality", PATIENT.nationality],
                ["Primary Physician", PATIENT.primaryPhysician],["Blood Type", PATIENT.bloodType],
                ["Allergies", PATIENT.allergies.join(", ")],
              ] as [string,string][]).map(([l,v])=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{l}</span>
                  <span style={{ fontSize:12, color: l==="Allergies"?"#f87171":"#e2e8f0", fontWeight:500, textAlign:"right", maxWidth:260 }}>{v}</span>
                </div>
              ))}
            </Card>

            {/* Vitals history */}
            <Card style={{ padding:20 }}>
              <SectionLabel>Recent Vitals</SectionLabel>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                    {["Date","BP","HR","Temp","SpO₂"].map(h=>(
                      <th key={h} style={{ padding:"6px 8px", textAlign:"left", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.28)", textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {VITALS_HISTORY.map(v=>(
                    <tr key={v.date} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding:"8px 8px", color:"rgba(255,255,255,0.45)" }}>{v.date}</td>
                      <td style={{ padding:"8px 8px", color:"#e2e8f0" }}>{v.bp}</td>
                      <td style={{ padding:"8px 8px", color:v.hr>100?"#f97316":"#e2e8f0" }}>{v.hr}</td>
                      <td style={{ padding:"8px 8px", color:v.temp>38.5?"#f87171":v.temp>37.5?"#fbbf24":"#4ade80" }}>{v.temp}°C</td>
                      <td style={{ padding:"8px 8px", color:v.spo2<96?"#f97316":"#4ade80" }}>{v.spo2}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Next appointment quick view */}
            <Card style={{ padding:20 }}>
              <SectionLabel>Next Appointment</SectionLabel>
              {APPOINTMENTS.filter(a=>a.status==="UPCOMING").slice(0,1).map(a=>(
                <div key={a.id}>
                  <p style={{ fontSize:18, fontWeight:800, color:"#f1f5f9", margin:"0 0 4px" }}>{a.date} at {a.time}</p>
                  <p style={{ fontSize:13, color:"#22d3ee", margin:"0 0 4px" }}>{a.provider}</p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", margin:"0 0 14px" }}>{a.specialty} · {a.type}</p>
                  <div style={{ display:"flex", gap:8 }}>
                    <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"7px 16px", fontSize:12, fontWeight:700, cursor:"pointer" }}>Confirm Attendance</button>
                    <button style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"7px 14px", fontSize:12, cursor:"pointer" }}>Reschedule</button>
                  </div>
                </div>
              ))}
            </Card>

            {/* Active medications quick view */}
            <Card style={{ padding:20 }}>
              <SectionLabel>Active Medications</SectionLabel>
              {MEDICATIONS.filter(m=>m.active).map(m=>(
                <div key={m.name} style={{ padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ fontSize:13, fontWeight:600, color:"#f1f5f9", margin:0 }}>{m.name}</p>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.38)", margin:0 }}>{m.dose} · Since {m.since}</p>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* Appointments */}
        {tab === "appointments" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:4 }}>
              <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:12, fontWeight:700, cursor:"pointer" }}>+ Book Appointment</button>
            </div>
            {APPOINTMENTS.map(a=>(
              <Card key={a.id} style={{ padding:18 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <p style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", margin:"0 0 2px" }}>{a.provider}</p>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", margin:"0 0 4px" }}>{a.specialty} · {a.type}</p>
                    <p style={{ fontSize:13, color:"#22d3ee", margin:0 }}>{a.date} at {a.time}</p>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99,
                      background: a.status==="UPCOMING"?"rgba(34,211,238,0.12)":"rgba(74,222,128,0.1)",
                      color: a.status==="UPCOMING"?"#22d3ee":"#4ade80",
                    }}>{a.status}</span>
                    {a.status==="UPCOMING" && (
                      <div style={{ display:"flex", gap:6 }}>
                        <button style={{ fontSize:11, background:"rgba(230,126,34,0.12)", color:"#e67e22", border:"1px solid rgba(230,126,34,0.25)", borderRadius:7, padding:"4px 10px", cursor:"pointer" }}>Reschedule</button>
                        <button style={{ fontSize:11, background:"rgba(248,113,113,0.1)", color:"#f87171", border:"1px solid rgba(248,113,113,0.25)", borderRadius:7, padding:"4px 10px", cursor:"pointer" }}>Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Lab Results */}
        {tab === "results" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {LAB_RESULTS.map(r=>(
              <Card key={r.id} style={{ padding:18 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:14, fontWeight:700, color:"#f1f5f9" }}>{r.panel}</span>
                      <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:99,
                        background: r.flag==="CRITICAL"?"rgba(239,68,68,0.15)":r.flag==="ABNORMAL"?"rgba(251,191,36,0.12)":"rgba(74,222,128,0.1)",
                        color: flagColor(r.flag),
                      }}>{r.flag}</span>
                    </div>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", margin:"0 0 4px" }}>{r.date} · {r.status}</p>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.55)", margin:0 }}>{r.summary}</p>
                  </div>
                  <button style={{ fontSize:11, color:"#e67e22", background:"rgba(230,126,34,0.12)", border:"1px solid rgba(230,126,34,0.25)", borderRadius:8, padding:"5px 12px", cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, marginLeft:16 }}>View Full Report</button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Medications */}
        {tab === "medications" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {MEDICATIONS.map(m=>(
              <Card key={m.name} style={{ padding:18 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:14, fontWeight:700, color:m.active?"#f1f5f9":"rgba(255,255,255,0.35)" }}>{m.name}</span>
                      <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:99,
                        background: m.active?"rgba(74,222,128,0.1)":"rgba(255,255,255,0.04)",
                        color: m.active?"#4ade80":"rgba(255,255,255,0.3)",
                      }}>{m.active?"Active":"Stopped"}</span>
                    </div>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", margin:"0 0 2px" }}>{m.dose}</p>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", margin:0 }}>Prescribed by {m.prescriber} · Since {m.since}</p>
                  </div>
                  {m.active && (
                    <button style={{ fontSize:11, color:"rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"5px 12px", cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, marginLeft:16 }}>Request Refill</button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Consent docs */}
        {tab === "consents" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {CONSENT_DOCS.map(c=>(
              <Card key={c.id} style={{ padding:18 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:"0 0 4px" }}>{c.title}</p>
                    {c.signed
                      ? <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>Signed {c.signed} by {c.signedBy}</p>
                      : <p style={{ fontSize:12, color:"#fbbf24", margin:0 }}>Awaiting your signature</p>
                    }
                  </div>
                  <div style={{ display:"flex", gap:8, flexShrink:0, marginLeft:16 }}>
                    <button style={{ fontSize:11, color:"#e67e22", background:"rgba(230,126,34,0.12)", border:"1px solid rgba(230,126,34,0.25)", borderRadius:8, padding:"5px 12px", cursor:"pointer" }}>View</button>
                    {c.status === "PENDING" && (
                      <button style={{ fontSize:11, color:"#4ade80", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.25)", borderRadius:8, padding:"5px 12px", cursor:"pointer" }}>Sign</button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* AI assistant */}
        {tab === "ai" && (
          <div style={{ maxWidth:720, margin:"0 auto" }}>
            <Card style={{ padding:0, overflow:"hidden", display:"flex", flexDirection:"column", height:"60vh" }}>
              <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:"#22d3ee", boxShadow:"0 0 8px #22d3ee80" }} />
                <span style={{ fontSize:14, fontWeight:700, color:"#f1f5f9" }}>CyMed AI Assistant</span>
                <span style={{ fontSize:11, background:"rgba(139,92,246,0.2)", color:"#c4b5fd", padding:"2px 8px", borderRadius:6, fontWeight:600 }}>Claude AI</span>
              </div>
              <div style={{ flex:1, overflow:"auto", padding:20, display:"flex", flexDirection:"column", gap:12 }}>
                {aiMessages.map((m,i)=>(
                  <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
                    <div style={{
                      maxWidth:"80%", padding:"10px 14px", borderRadius:14, fontSize:13, lineHeight:1.6,
                      background: m.role==="user"?"rgba(230,126,34,0.15)":"rgba(255,255,255,0.04)",
                      border: `1px solid ${m.role==="user"?"rgba(230,126,34,0.25)":"rgba(255,255,255,0.08)"}`,
                      color: m.role==="user"?"#fed7aa":"rgba(255,255,255,0.75)",
                    }}>{m.text}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding:16, borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", gap:10 }}>
                <input
                  value={aiInput} onChange={e=>setAiInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&sendAI()}
                  placeholder="Ask about your results, medications, or care plan…"
                  style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 14px", color:"#f1f5f9", fontSize:13, outline:"none" }}
                />
                <button onClick={sendAI} style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"9px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Send</button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
