"use client";

import { useState } from "react";

type LabOrder = {
  id: string; mrn: string; patient: string; panel: string; modality: string;
  priority: string; status: string; orderedBy: string; orderedAt: string;
  tatTarget: number; tatActual?: number; critical?: boolean;
  results?: { test: string; value: string; unit: string; ref: string; flag?: string }[];
};

const ORDERS: LabOrder[] = [
  { id:"LAB-5501", mrn:"MRN-10492", patient:"Ahmad Al-Rashid",   panel:"Blood Culture x2",       modality:"Micro",   priority:"STAT",    status:"PENDING",    orderedBy:"Dr. Al-Mutawa", orderedAt:"08:22", tatTarget:60  },
  { id:"LAB-5500", mrn:"MRN-10488", patient:"Khalid Al-Dosari",  panel:"Troponin I (serial)",    modality:"Chemistry",priority:"STAT",   status:"IN_PROGRESS",orderedBy:"Dr. Al-Ghamdi", orderedAt:"08:45", tatTarget:45  },
  { id:"LAB-5499", mrn:"MRN-10487", patient:"Fatima Al-Qahtani", panel:"CBC + CRP",              modality:"Haem",    priority:"URGENT",  status:"COMPLETED",  orderedBy:"Dr. Al-Harbi",  orderedAt:"07:10", tatTarget:60, tatActual:42,
    results:[
      { test:"WBC",       value:"14.2", unit:"×10⁹/L", ref:"4.5–11.0",  flag:"H" },
      { test:"Hgb",       value:"11.8", unit:"g/dL",   ref:"12.0–16.0", flag:"L" },
      { test:"PLT",       value:"320",  unit:"×10⁹/L", ref:"150–400"           },
      { test:"CRP",       value:"87",   unit:"mg/L",   ref:"< 5",       flag:"H" },
    ]
  },
  { id:"LAB-5498", mrn:"MRN-10486", patient:"Omar Al-Shehri",    panel:"Tumour Markers (CA-125, CEA, AFP)", modality:"Immunology", priority:"ROUTINE", status:"REPORTED", orderedBy:"Dr. Al-Malki", orderedAt:"06:30", tatTarget:120, tatActual:95 },
  { id:"LAB-5497", mrn:"MRN-10485", patient:"Nora Al-Otaibi",    panel:"ABG + Lactate",          modality:"Chemistry",priority:"STAT",    status:"CRITICAL",   orderedBy:"Dr. Al-Mutawa", orderedAt:"09:05", tatTarget:30,  tatActual:18, critical:true,
    results:[
      { test:"pH",       value:"7.22",  unit:"",       ref:"7.35–7.45", flag:"L" },
      { test:"pCO₂",     value:"52",    unit:"mmHg",   ref:"35–45",     flag:"H" },
      { test:"Lactate",  value:"4.8",   unit:"mmol/L", ref:"0.5–2.2",   flag:"HH" },
      { test:"HCO₃",     value:"18",    unit:"mmol/L", ref:"22–26",     flag:"L"  },
    ]
  },
  { id:"LAB-5496", mrn:"MRN-10489", patient:"Sara Al-Zahrani",   panel:"Group & Screen",         modality:"Transfusion",priority:"ROUTINE",status:"COMPLETED",  orderedBy:"Dr. Al-Otaibi", orderedAt:"06:00", tatTarget:45, tatActual:38 },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:     { bg:"rgba(251,191,36,0.12)",  color:"#fbbf24", label:"Pending"     },
  IN_PROGRESS: { bg:"rgba(167,139,250,0.15)", color:"#a78bfa", label:"In Progress" },
  COMPLETED:   { bg:"rgba(34,211,238,0.12)",  color:"#22d3ee", label:"Completed"   },
  REPORTED:    { bg:"rgba(74,222,128,0.12)",  color:"#4ade80", label:"Reported"    },
  CRITICAL:    { bg:"rgba(239,68,68,0.15)",   color:"#f87171", label:"⚠ Critical"  },
};

const MODALITY_COLOR: Record<string, string> = {
  Chemistry:"#22d3ee", Haem:"#f472b6", Micro:"#fbbf24", Immunology:"#a78bfa",
  Transfusion:"#f87171", Haematology:"#60a5fa",
};

const FLAG_COLOR: Record<string, string> = { H:"#f97316", HH:"#ef4444", L:"#60a5fa", LL:"#a78bfa" };

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

export default function LabPage() {
  const [selected, setSelected] = useState<LabOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const displayed = filterStatus === "ALL" ? ORDERS : ORDERS.filter(o => o.status === filterStatus);

  return (
    <div style={{ padding:"28px 28px 40px", minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.3px", margin:0 }}>Laboratory</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)", marginTop:4 }}>LIS worklist · {ORDERS.length} active orders</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:12, padding:"9px 20px", fontSize:13, fontWeight:700, cursor:"pointer" }}>+ New Order</button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:20 }}>
        {([
          ["Orders",      ORDERS.length, "#60a5fa"],
          ["STAT",        ORDERS.filter(o=>o.priority==="STAT").length, "#ef4444"],
          ["In Progress", ORDERS.filter(o=>o.status==="IN_PROGRESS").length, "#a78bfa"],
          ["Critical",    ORDERS.filter(o=>o.critical).length, "#f87171"],
          ["Completed",   ORDERS.filter(o=>["COMPLETED","REPORTED"].includes(o.status)).length, "#4ade80"],
        ] as [string,number,string][]).map(([l,v,c])=>(
          <Card key={l} style={{ padding:16 }}>
            <p style={{ fontSize:28, fontWeight:800, color:c, lineHeight:1, margin:0 }}>{v}</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.38)", marginTop:4 }}>{l}</p>
          </Card>
        ))}
      </div>

      {/* Status filter */}
      <div style={{ display:"flex", gap:6, marginBottom:14 }}>
        {["ALL","PENDING","IN_PROGRESS","COMPLETED","CRITICAL","REPORTED"].map(s=>{
          const st = STATUS_STYLE[s];
          return (
            <button key={s} onClick={()=>setFilterStatus(s)} style={{
              padding:"6px 14px", borderRadius:9, fontSize:11, fontWeight:600, cursor:"pointer",
              background: filterStatus===s?(st?.bg??"rgba(230,126,34,0.15)"):"transparent",
              border:`1px solid ${filterStatus===s?(st?.color??"#e67e22")+"50":"rgba(255,255,255,0.1)"}`,
              color: filterStatus===s?(st?.color??"#e67e22"):"rgba(255,255,255,0.4)",
            }}>{s==="ALL"?"All":st?.label??s}</button>
          );
        })}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:selected?"1fr 380px":"1fr", gap:16 }}>
        <Card>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                {["Patient","Order","Panel","Modality","Priority","TAT","Status",""].map(h=>(
                  <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.28)", textTransform:"uppercase", letterSpacing:"0.07em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map(o=>{
                const st = STATUS_STYLE[o.status]??STATUS_STYLE.PENDING;
                const tatOk = o.tatActual ? o.tatActual <= o.tatTarget : true;
                return (
                  <tr key={o.id} onClick={()=>setSelected(selected?.id===o.id?null:o)}
                    style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer", background:selected?.id===o.id?"rgba(230,126,34,0.06)":"transparent" }}>
                    <td style={{ padding:"12px 14px" }}>
                      <p style={{ color:"#f1f5f9", fontWeight:600, margin:0 }}>{o.patient}</p>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", margin:0 }}>{o.mrn}</p>
                    </td>
                    <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.45)", fontSize:12 }}>{o.id}</td>
                    <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.65)", maxWidth:200 }}>
                      <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>{o.panel}</span>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{ fontSize:11, fontWeight:700, color:MODALITY_COLOR[o.modality]??"#60a5fa" }}>{o.modality}</span>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{ fontSize:11, fontWeight:700, color:o.priority==="STAT"?"#ef4444":o.priority==="URGENT"?"#f97316":"#60a5fa" }}>{o.priority}</span>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      {o.tatActual
                        ? <span style={{ fontSize:12, fontWeight:700, color:tatOk?"#4ade80":"#f87171" }}>{o.tatActual}m</span>
                        : <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>≤{o.tatTarget}m</span>
                      }
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:st.bg, color:st.color }}>{st.label}</span>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <button style={{ fontSize:11, color:"#e67e22", background:"rgba(230,126,34,0.12)", border:"1px solid rgba(230,126,34,0.25)", borderRadius:8, padding:"4px 10px", cursor:"pointer" }}>View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {selected && (
          <Card style={{ padding:20 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", margin:0 }}>{selected.patient}</h3>
              <button onClick={()=>setSelected(null)} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer", fontSize:20, lineHeight:1 }}>×</button>
            </div>
            {([
              ["Order ID",selected.id],["MRN",selected.mrn],["Panel",selected.panel],
              ["Modality",selected.modality],["Priority",selected.priority],
              ["Ordered By",selected.orderedBy],["Ordered At",selected.orderedAt],
              ["TAT Target",`${selected.tatTarget}m`],
            ] as [string,string][]).map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{l}</span>
                <span style={{ fontSize:12, color:"#e2e8f0", fontWeight:500 }}>{v}</span>
              </div>
            ))}

            {selected.results && (
              <div style={{ marginTop:16 }}>
                <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.28)", textTransform:"uppercase", letterSpacing:"0.07em", margin:"0 0 8px" }}>Results</p>
                {selected.critical && (
                  <div style={{ marginBottom:10, padding:"8px 12px", borderRadius:10, background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.3)" }}>
                    <p style={{ fontSize:12, fontWeight:700, color:"#f87171", margin:0 }}>⚠ Critical values — physician notified</p>
                  </div>
                )}
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                      {["Test","Value","Unit","Ref","Flag"].map(h=>(
                        <th key={h} style={{ padding:"6px 8px", textAlign:"left", fontSize:10, color:"rgba(255,255,255,0.28)", textTransform:"uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.results.map(r=>(
                      <tr key={r.test} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding:"7px 8px", color:"rgba(255,255,255,0.65)" }}>{r.test}</td>
                        <td style={{ padding:"7px 8px", fontWeight:700, color:r.flag?FLAG_COLOR[r.flag]??"#f1f5f9":"#f1f5f9" }}>{r.value}</td>
                        <td style={{ padding:"7px 8px", color:"rgba(255,255,255,0.35)" }}>{r.unit}</td>
                        <td style={{ padding:"7px 8px", color:"rgba(255,255,255,0.35)" }}>{r.ref}</td>
                        <td style={{ padding:"7px 8px", fontWeight:800, color:r.flag?FLAG_COLOR[r.flag]??"transparent":"transparent" }}>{r.flag??""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ display:"flex", gap:8, marginTop:16 }}>
              {["Collect","Enter Results","Finalize"].map(a=>(
                <button key={a} style={{ flex:1, padding:"8px 0", borderRadius:10, fontSize:11, fontWeight:600, cursor:"pointer",
                  background: a==="Collect"?"#e67e22":"rgba(255,255,255,0.05)",
                  color: a==="Collect"?"white":"rgba(255,255,255,0.55)",
                  border:`1px solid ${a==="Collect"?"transparent":"rgba(255,255,255,0.08)"}`,
                }}>{a}</button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
