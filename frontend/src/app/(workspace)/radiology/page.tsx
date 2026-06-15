"use client";

import { useState } from "react";

type Order = {
  id: string; mrn: string; patient: string; age: number; gender: string;
  modality: string; study: string; priority: string; status: string;
  orderedBy: string; requestedAt: string; ward: string; notes: string;
};

const ORDERS: Order[] = [
  { id:"RAD-2241", mrn:"MRN-10492", patient:"Ahmad Al-Rashid",   age:45, gender:"M", modality:"CT",   study:"CT Chest + Abdomen (contrast)", priority:"STAT",    status:"IN_PROGRESS", orderedBy:"Dr. Al-Mutawa", requestedAt:"08:22", ward:"ED",      notes:"Suspected PE, high D-dimer"             },
  { id:"RAD-2240", mrn:"MRN-10488", patient:"Khalid Al-Dosari",  age:67, gender:"M", modality:"MRI",  study:"MRI Brain — DWI Protocol",      priority:"URGENT",  status:"PENDING",     orderedBy:"Dr. Al-Ghamdi", requestedAt:"08:45", ward:"ICU",     notes:"Acute stroke — aphasia onset 09:00"     },
  { id:"RAD-2239", mrn:"MRN-10487", patient:"Fatima Al-Qahtani", age:28, gender:"F", modality:"US",   study:"Abdominal Ultrasound",          priority:"ROUTINE", status:"COMPLETED",   orderedBy:"Dr. Al-Harbi",  requestedAt:"07:10", ward:"General", notes:"RLQ pain, rule out appendicitis"        },
  { id:"RAD-2238", mrn:"MRN-10486", patient:"Omar Al-Shehri",    age:54, gender:"M", modality:"PET",  study:"PET-CT Whole Body",             priority:"ROUTINE", status:"REPORTED",    orderedBy:"Dr. Al-Malki",  requestedAt:"06:30", ward:"Oncology",notes:"Lymphoma staging post-chemo cycle 2"    },
  { id:"RAD-2237", mrn:"MRN-10485", patient:"Nora Al-Otaibi",    age:72, gender:"F", modality:"XR",   study:"Chest X-Ray PA & Lateral",      priority:"ROUTINE", status:"REPORTED",    orderedBy:"Dr. Al-Mutawa", requestedAt:"06:00", ward:"General", notes:"Pneumonia follow-up — Day 3"            },
  { id:"RAD-2236", mrn:"MRN-10484", patient:"Sarah Thompson",    age:32, gender:"F", modality:"MRI",  study:"MRI Lumbar Spine",              priority:"ROUTINE", status:"SCHEDULED",   orderedBy:"Dr. Al-Otaibi", requestedAt:"yesterday", ward:"OPD",notes:"Chronic back pain — radiculopathy query"},
];

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:     { bg:"rgba(251,191,36,0.12)",  color:"#fbbf24", label:"Pending"     },
  SCHEDULED:   { bg:"rgba(96,165,250,0.12)",  color:"#60a5fa", label:"Scheduled"   },
  IN_PROGRESS: { bg:"rgba(167,139,250,0.15)", color:"#a78bfa", label:"In Progress" },
  COMPLETED:   { bg:"rgba(34,211,238,0.12)",  color:"#22d3ee", label:"Completed"   },
  REPORTED:    { bg:"rgba(74,222,128,0.12)",  color:"#4ade80", label:"Reported"    },
};

const MODALITY_COLOR: Record<string, string> = {
  CT:"#22d3ee", MRI:"#a78bfa", US:"#60a5fa", XR:"#4ade80", PET:"#f472b6", NM:"#fb923c",
};

const PRIORITY_COLOR: Record<string, string> = {
  STAT:"#ef4444", URGENT:"#f97316", ROUTINE:"#60a5fa",
};

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

const MOCK_REPORT = `CLINICAL INDICATION:
Chest pain, elevated D-dimer, suspected pulmonary embolism.

TECHNIQUE:
CT pulmonary angiogram acquired with IV contrast (80 mL Omnipaque 350 at 4 mL/s).

FINDINGS:
Lungs: Filling defects identified in bilateral lower lobe segmental pulmonary arteries consistent with acute pulmonary emboli. No saddle embolus. No infarction.
Heart: Normal cardiac size. No pericardial effusion.
Mediastinum: No lymphadenopathy.
Pleura: Trace bilateral pleural effusion.
Bones: No acute fracture.

IMPRESSION:
1. Bilateral acute pulmonary emboli in segmental arteries.
2. No evidence of right heart strain.

RECOMMENDATION:
Anticoagulation per haematology protocol. Follow-up CT in 3 months.

Reported by: Dr. A. Al-Zahrani, FRCR
Verified: 09:47`;

export default function RadiologyPage() {
  const [filterMod,  setFilterMod]  = useState("ALL");
  const [filterStat, setFilterStat] = useState("ALL");
  const [selected, setSelected]     = useState<Order | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const modalities = ["ALL","CT","MRI","US","XR","PET","NM"];
  const statuses   = ["ALL","PENDING","SCHEDULED","IN_PROGRESS","COMPLETED","REPORTED"];

  const filtered = ORDERS.filter(o =>
    (filterMod  === "ALL" || o.modality === filterMod) &&
    (filterStat === "ALL" || o.status   === filterStat)
  );

  return (
    <div style={{ padding:"28px 28px 40px", minHeight:"100vh", background:"#080d18" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.3px", margin:0 }}>Radiology</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)", marginTop:4 }}>RIS worklist · {ORDERS.length} orders today</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:12, padding:"9px 20px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          + New Order
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:20 }}>
        {([
          ["Total Orders", ORDERS.length, "#60a5fa"],
          ["STAT",         ORDERS.filter(o=>o.priority==="STAT").length,              "#ef4444"],
          ["In Progress",  ORDERS.filter(o=>o.status==="IN_PROGRESS").length,         "#a78bfa"],
          ["Pending Read", ORDERS.filter(o=>o.status==="COMPLETED").length,            "#fbbf24"],
          ["Reported",     ORDERS.filter(o=>o.status==="REPORTED").length,            "#4ade80"],
        ] as [string,number,string][]).map(([l,v,c])=>(
          <Card key={l} style={{ padding:16 }}>
            <p style={{ fontSize:28, fontWeight:800, color:c, lineHeight:1, margin:0 }}>{v}</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.38)", marginTop:4 }}>{l}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:16, marginBottom:14 }}>
        <div style={{ display:"flex", gap:6 }}>
          {modalities.map(m=>(
            <button key={m} onClick={()=>setFilterMod(m)} style={{
              padding:"6px 13px", borderRadius:9, fontSize:11, fontWeight:700, cursor:"pointer",
              background: filterMod===m?(MODALITY_COLOR[m]??"#e67e22")+"20":"transparent",
              border:`1px solid ${filterMod===m?(MODALITY_COLOR[m]??"#e67e22")+"50":"rgba(255,255,255,0.1)"}`,
              color: filterMod===m?(MODALITY_COLOR[m]??"#e67e22"):"rgba(255,255,255,0.4)",
            }}>{m}</button>
          ))}
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {statuses.map(s=>{
            const st = STATUS_STYLE[s];
            return (
              <button key={s} onClick={()=>setFilterStat(s)} style={{
                padding:"6px 13px", borderRadius:9, fontSize:11, fontWeight:600, cursor:"pointer",
                background: filterStat===s?(st?.bg??"rgba(230,126,34,0.15)"):"transparent",
                border:`1px solid ${filterStat===s?(st?.color??"#e67e22")+"50":"rgba(255,255,255,0.1)"}`,
                color: filterStat===s?(st?.color??"#e67e22"):"rgba(255,255,255,0.4)",
              }}>{s==="ALL"?"All Status":st?.label??s}</button>
            );
          })}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:selected?"1fr 400px":"1fr", gap:16 }}>
        {/* Worklist */}
        <Card>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                {["Patient","Order","Study","Modality","Priority","Status","Requested",""].map(h=>(
                  <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.28)", textTransform:"uppercase", letterSpacing:"0.07em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o=>{
                const st = STATUS_STYLE[o.status]??STATUS_STYLE.PENDING;
                return (
                  <tr key={o.id} onClick={()=>setSelected(selected?.id===o.id?null:o)}
                    style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer", background:selected?.id===o.id?"rgba(230,126,34,0.06)":"transparent" }}>
                    <td style={{ padding:"12px 14px" }}>
                      <p style={{ color:"#f1f5f9", fontWeight:600, margin:0 }}>{o.patient}</p>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", margin:0 }}>{o.mrn} · {o.age}{o.gender} · {o.ward}</p>
                    </td>
                    <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.45)", fontSize:12 }}>{o.id}</td>
                    <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.6)", maxWidth:200 }}>
                      <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>{o.study}</span>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{ fontSize:12, fontWeight:800, color:MODALITY_COLOR[o.modality]??"#60a5fa" }}>{o.modality}</span>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{ fontSize:11, fontWeight:700, color:PRIORITY_COLOR[o.priority]??"#60a5fa" }}>{o.priority}</span>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:st.bg, color:st.color }}>{st.label}</span>
                    </td>
                    <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.4)", fontSize:12 }}>{o.requestedAt}</td>
                    <td style={{ padding:"12px 14px" }}>
                      <button style={{ fontSize:11, color:"#e67e22", background:"rgba(230,126,34,0.12)", border:"1px solid rgba(230,126,34,0.25)", borderRadius:8, padding:"4px 10px", cursor:"pointer" }}>View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {/* Detail + report panel */}
        {selected && (
          <Card style={{ padding:20, display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", margin:0 }}>{selected.patient}</h3>
              <button onClick={()=>setSelected(null)} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer", fontSize:20, lineHeight:1 }}>×</button>
            </div>

            {([
              ["Order ID",selected.id],["MRN",selected.mrn],["Modality",selected.modality],
              ["Study",selected.study],["Priority",selected.priority],
              ["Ordered By",selected.orderedBy],["Requested",selected.requestedAt],["Ward",selected.ward],
            ] as [string,string][]).map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{l}</span>
                <span style={{ fontSize:12, color:"#e2e8f0", fontWeight:500, maxWidth:200, textAlign:"right" }}>{v}</span>
              </div>
            ))}

            {selected.notes && (
              <div style={{ marginTop:14, padding:12, borderRadius:10, background:"rgba(251,191,36,0.07)", border:"1px solid rgba(251,191,36,0.2)" }}>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:"0 0 3px" }}>Clinical Notes</p>
                <p style={{ fontSize:12, color:"#fef3c7", margin:0 }}>{selected.notes}</p>
              </div>
            )}

            {/* DICOM viewer placeholder */}
            <div style={{ marginTop:14, borderRadius:12, overflow:"hidden", background:"#000", border:"1px solid rgba(255,255,255,0.08)", height:140, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8 }}>
              <div style={{ width:40, height:40, borderRadius:"50%", background:"rgba(34,211,238,0.1)", border:"1px solid rgba(34,211,238,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="18" height="18" fill="none" stroke="#22d3ee" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="3" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="3" y1="12" x2="7" y2="12"/><line x1="17" y1="12" x2="21" y2="12"/></svg>
              </div>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.3)", margin:0 }}>DICOM Viewer</p>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.18)", margin:0 }}>Open in OHIF / RadiAnt</p>
            </div>

            <div style={{ display:"flex", gap:8, marginTop:14 }}>
              {["Perform","Report","Complete"].map(a=>(
                <button key={a} onClick={a==="Report"?()=>setReportOpen(true):undefined} style={{
                  flex:1, padding:"8px 0", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer",
                  background: a==="Perform"?"#e67e22":"rgba(255,255,255,0.05)",
                  color: a==="Perform"?"white":"rgba(255,255,255,0.55)",
                  border:`1px solid ${a==="Perform"?"transparent":"rgba(255,255,255,0.08)"}`,
                }}>{a}</button>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Report modal */}
      {reportOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}>
          <div style={{ width:680, maxHeight:"85vh", overflow:"auto", background:"#0a0f1e", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:28 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:"#f1f5f9", margin:0 }}>Radiology Report</h3>
              <button onClick={()=>setReportOpen(false)} style={{ color:"rgba(255,255,255,0.4)", background:"none", border:"none", cursor:"pointer", fontSize:22, lineHeight:1 }}>×</button>
            </div>
            <textarea
              defaultValue={MOCK_REPORT}
              rows={24}
              style={{ width:"100%", boxSizing:"border-box", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:16, color:"#e2e8f0", fontSize:13, fontFamily:"'JetBrains Mono',monospace", lineHeight:1.7, outline:"none", resize:"vertical" }}
            />
            <div style={{ display:"flex", gap:10, marginTop:16 }}>
              <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:12, padding:"9px 24px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Sign & Finalize</button>
              <button style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"9px 18px", fontSize:13, cursor:"pointer" }}>Save Draft</button>
              <button onClick={()=>setReportOpen(false)} style={{ background:"transparent", color:"rgba(255,255,255,0.3)", border:"none", padding:"9px 12px", fontSize:13, cursor:"pointer", marginLeft:"auto" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
