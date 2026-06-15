"use client";

import { useState } from "react";

const ENCOUNTERS = [
  { id:"ENC-8821", mrn:"MRN-10492", name:"Ahmad Al-Rashid",   age:45, gender:"M", ward:"ED",       bed:"ED-04",  status:"TRIAGE",           priority:"STAT",    news2:8, dx:"Sepsis",                admitted:"2h ago",  physician:"Dr. Al-Mutawa" },
  { id:"ENC-8820", mrn:"MRN-10489", name:"Sara Al-Zahrani",   age:32, gender:"F", ward:"Maternity", bed:"MAT-2",  status:"ADMITTED",         priority:"ROUTINE", news2:2, dx:"Active Labor",          admitted:"4h ago",  physician:"Dr. Al-Otaibi" },
  { id:"ENC-8819", mrn:"MRN-10488", name:"Khalid Al-Dosari",  age:67, gender:"M", ward:"ICU",       bed:"ICU-4",  status:"IN_PROGRESS",      priority:"URGENT",  news2:7, dx:"NSTEMI",               admitted:"6h ago",  physician:"Dr. Al-Ghamdi" },
  { id:"ENC-8818", mrn:"MRN-10487", name:"Fatima Al-Qahtani", age:28, gender:"F", ward:"General",   bed:"GEN-12", status:"ADMITTED",         priority:"ROUTINE", news2:1, dx:"Appendicitis",         admitted:"8h ago",  physician:"Dr. Al-Harbi"  },
  { id:"ENC-8817", mrn:"MRN-10486", name:"Omar Al-Shehri",    age:54, gender:"M", ward:"Oncology",  bed:"ONC-3",  status:"ADMITTED",         priority:"ROUTINE", news2:3, dx:"Lymphoma — Chemo D2",  admitted:"1d ago",  physician:"Dr. Al-Malki"  },
  { id:"ENC-8816", mrn:"MRN-10485", name:"Nora Al-Otaibi",    age:72, gender:"F", ward:"General",   bed:"GEN-07", status:"DISCHARGE_PENDING",priority:"ROUTINE", news2:0, dx:"Pneumonia — resolving", admitted:"3d ago",  physician:"Dr. Al-Mutawa" },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  TRIAGE:            { bg:"rgba(239,68,68,0.15)",   color:"#f87171", label:"Triage"      },
  ADMITTED:          { bg:"rgba(34,211,238,0.12)",  color:"#22d3ee", label:"Admitted"    },
  IN_PROGRESS:       { bg:"rgba(167,139,250,0.15)", color:"#a78bfa", label:"In Progress" },
  DISCHARGE_PENDING: { bg:"rgba(251,191,36,0.12)",  color:"#fbbf24", label:"Discharge ↑" },
};

const news2Color = (n: number) =>
  n >= 7 ? "#ef4444" : n >= 5 ? "#f97316" : n >= 3 ? "#fbbf24" : "#4ade80";

const WARD_COLOR: Record<string, string> = {
  ICU:"#ef4444", ED:"#f97316", Maternity:"#f472b6", General:"#60a5fa", Oncology:"#a78bfa",
};

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

export default function AdmissionPage() {
  const [search, setSearch]   = useState("");
  const [ward, setWard]       = useState("ALL");
  const [selected, setSelected] = useState<typeof ENCOUNTERS[0] | null>(null);

  const wards    = ["ALL", ...Array.from(new Set(ENCOUNTERS.map(e => e.ward)))];
  const filtered = ENCOUNTERS.filter(e =>
    (ward === "ALL" || e.ward === ward) &&
    (!search || e.name.toLowerCase().includes(search.toLowerCase()) || e.mrn.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding:"28px 28px 40px", minHeight:"100vh", background:"#080d18" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.3px", margin:0 }}>Patient Admissions</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)", marginTop:4 }}>Active encounters · {ENCOUNTERS.length} patients</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:12, padding:"9px 20px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          + New Admission
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:20 }}>
        {([
          ["Total Active",      ENCOUNTERS.length,                                              "#60a5fa"],
          ["STAT / Urgent",     ENCOUNTERS.filter(e=>e.priority==="STAT").length,               "#ef4444"],
          ["NEWS2 ≥ 5",         ENCOUNTERS.filter(e=>e.news2>=5).length,                        "#f97316"],
          ["Pending Discharge", ENCOUNTERS.filter(e=>e.status==="DISCHARGE_PENDING").length,    "#fbbf24"],
          ["ICU",               ENCOUNTERS.filter(e=>e.ward==="ICU").length,                    "#a78bfa"],
        ] as [string,number,string][]).map(([label,value,color]) => (
          <Card key={label} style={{ padding:16 }}>
            <p style={{ fontSize:28, fontWeight:800, color, lineHeight:1, margin:0 }}>{value}</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.38)", marginTop:4 }}>{label}</p>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:selected?"1fr 380px":"1fr", gap:16 }}>
        <div>
          {/* Search + ward filter */}
          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            <input
              value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search name or MRN…"
              style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"8px 14px", color:"#f1f5f9", fontSize:13, outline:"none" }}
            />
            {wards.map(w => (
              <button key={w} onClick={()=>setWard(w)} style={{
                padding:"7px 14px", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer",
                background: ward===w ? (WARD_COLOR[w]??"#e67e22")+"20" : "transparent",
                border: `1px solid ${ward===w ? (WARD_COLOR[w]??"#e67e22")+"60" : "rgba(255,255,255,0.1)"}`,
                color: ward===w ? (WARD_COLOR[w]??"#e67e22") : "rgba(255,255,255,0.4)",
              }}>{w}</button>
            ))}
          </div>

          {/* Table */}
          <Card>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                  {["Patient","Encounter","Ward / Bed","Diagnosis","NEWS2","Status","Physician",""].map(h=>(
                    <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.28)", textTransform:"uppercase", letterSpacing:"0.07em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => {
                  const st = STATUS_STYLE[e.status] ?? STATUS_STYLE.ADMITTED;
                  return (
                    <tr key={e.id} onClick={()=>setSelected(selected?.id===e.id?null:e)}
                      style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer", background:selected?.id===e.id?"rgba(230,126,34,0.06)":"transparent" }}>
                      <td style={{ padding:"12px 14px" }}>
                        <p style={{ color:"#f1f5f9", fontWeight:600, margin:0 }}>{e.name}</p>
                        <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", margin:0 }}>{e.mrn} · {e.age}{e.gender}</p>
                      </td>
                      <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.45)", fontSize:12 }}>{e.id}</td>
                      <td style={{ padding:"12px 14px" }}>
                        <span style={{ fontSize:11, fontWeight:700, color:WARD_COLOR[e.ward]??"#60a5fa" }}>{e.ward}</span>
                        <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginLeft:6 }}>{e.bed}</span>
                      </td>
                      <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.6)", maxWidth:180 }}>
                        <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>{e.dx}</span>
                      </td>
                      <td style={{ padding:"12px 14px" }}>
                        <span style={{ fontWeight:800, color:news2Color(e.news2), fontSize:16 }}>{e.news2}</span>
                      </td>
                      <td style={{ padding:"12px 14px" }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:st.bg, color:st.color }}>{st.label}</span>
                      </td>
                      <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.4)", fontSize:12 }}>{e.physician}</td>
                      <td style={{ padding:"12px 14px" }}>
                        <button style={{ fontSize:11, color:"#e67e22", background:"rgba(230,126,34,0.12)", border:"1px solid rgba(230,126,34,0.25)", borderRadius:8, padding:"4px 10px", cursor:"pointer" }}>View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Detail panel */}
        {selected && (
          <Card style={{ padding:20 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", margin:0 }}>{selected.name}</h3>
              <button onClick={()=>setSelected(null)} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer", fontSize:20, lineHeight:1 }}>×</button>
            </div>
            {([
              ["MRN",selected.mrn],["Encounter",selected.id],["Age / Sex",`${selected.age} · ${selected.gender}`],
              ["Ward",selected.ward],["Bed",selected.bed],["Diagnosis",selected.dx],
              ["Physician",selected.physician],["Admitted",selected.admitted],["Priority",selected.priority],
            ] as [string,string][]).map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{l}</span>
                <span style={{ fontSize:12, color:"#e2e8f0", fontWeight:500 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop:16, padding:14, borderRadius:12, background:`${news2Color(selected.news2)}15`, border:`1px solid ${news2Color(selected.news2)}30` }}>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"0 0 2px" }}>NEWS2 Score</p>
              <p style={{ fontSize:32, fontWeight:800, color:news2Color(selected.news2), margin:0 }}>{selected.news2}</p>
              <p style={{ fontSize:11, color:news2Color(selected.news2), marginTop:2 }}>
                {selected.news2>=7?"High risk — escalate immediately":selected.news2>=5?"Medium risk — monitor closely":"Low risk"}
              </p>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:14 }}>
              {["View Chart","Discharge","Transfer"].map(a=>(
                <button key={a} style={{ flex:1, padding:"8px 0", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer",
                  background: a==="View Chart"?"#e67e22":"rgba(255,255,255,0.05)",
                  color: a==="View Chart"?"white":"rgba(255,255,255,0.55)",
                  border:`1px solid ${a==="View Chart"?"transparent":"rgba(255,255,255,0.08)"}`,
                }}>{a}</button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
