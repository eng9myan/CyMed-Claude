"use client";

import { useState } from "react";

type Bed = {
  id: string; ward: string; bedNum: string; status: "occupied" | "available" | "cleaning" | "reserved" | "maintenance";
  patient?: string; mrn?: string; admittedDays?: number; dx?: string;
  news2?: number; physician?: string; dischargeEta?: string;
};

const BEDS: Bed[] = [
  // ICU
  { id:"ICU-1", ward:"ICU", bedNum:"01", status:"occupied",    patient:"Khalid Al-Dosari",  mrn:"MRN-10488", admittedDays:1, dx:"NSTEMI",           news2:7, physician:"Dr. Al-Ghamdi", dischargeEta:"TBD"        },
  { id:"ICU-2", ward:"ICU", bedNum:"02", status:"occupied",    patient:"Ibrahim Al-Fahad",  mrn:"MRN-10481", admittedDays:3, dx:"Septic Shock",     news2:9, physician:"Dr. Al-Mutawa", dischargeEta:"TBD"        },
  { id:"ICU-3", ward:"ICU", bedNum:"03", status:"cleaning",                                                                                                                                                          },
  { id:"ICU-4", ward:"ICU", bedNum:"04", status:"available",                                                                                                                                                         },
  { id:"ICU-5", ward:"ICU", bedNum:"05", status:"occupied",    patient:"Mona Al-Rashidi",   mrn:"MRN-10480", admittedDays:2, dx:"Resp Failure",     news2:8, physician:"Dr. Al-Ghamdi", dischargeEta:"TBD"        },
  { id:"ICU-6", ward:"ICU", bedNum:"06", status:"maintenance",                                                                                                                                                       },
  // ED
  { id:"ED-1",  ward:"ED",  bedNum:"01", status:"occupied",    patient:"Ahmad Al-Rashid",   mrn:"MRN-10492", admittedDays:0, dx:"Sepsis",           news2:8, physician:"Dr. Al-Mutawa", dischargeEta:"Admit"      },
  { id:"ED-2",  ward:"ED",  bedNum:"02", status:"occupied",    patient:"Reem Al-Dosari",    mrn:"MRN-10479", admittedDays:0, dx:"Fracture R arm",   news2:2, physician:"Dr. Al-Harbi",  dischargeEta:"Today"      },
  { id:"ED-3",  ward:"ED",  bedNum:"03", status:"available",                                                                                                                                                         },
  { id:"ED-4",  ward:"ED",  bedNum:"04", status:"reserved",                                                                                                                                                          },
  { id:"ED-5",  ward:"ED",  bedNum:"05", status:"occupied",    patient:"Tariq Al-Otaibi",   mrn:"MRN-10478", admittedDays:0, dx:"Chest pain",       news2:5, physician:"Dr. Al-Ghamdi", dischargeEta:"Admit"      },
  { id:"ED-6",  ward:"ED",  bedNum:"06", status:"cleaning",                                                                                                                                                          },
  // General
  { id:"GEN-1", ward:"General", bedNum:"01", status:"occupied", patient:"Fatima Al-Qahtani",mrn:"MRN-10487", admittedDays:1, dx:"Appendicitis",     news2:1, physician:"Dr. Al-Harbi",  dischargeEta:"Tomorrow"   },
  { id:"GEN-2", ward:"General", bedNum:"02", status:"occupied", patient:"Nora Al-Otaibi",   mrn:"MRN-10485", admittedDays:3, dx:"Pneumonia",        news2:0, physician:"Dr. Al-Mutawa", dischargeEta:"Today"      },
  { id:"GEN-3", ward:"General", bedNum:"03", status:"available",                                                                                                                                                     },
  { id:"GEN-4", ward:"General", bedNum:"04", status:"available",                                                                                                                                                     },
  { id:"GEN-5", ward:"General", bedNum:"05", status:"occupied", patient:"Hani Al-Zahrani",  mrn:"MRN-10477", admittedDays:2, dx:"DVT",              news2:2, physician:"Dr. Al-Mutawa", dischargeEta:"2 days"     },
  { id:"GEN-6", ward:"General", bedNum:"06", status:"reserved",                                                                                                                                                      },
  { id:"GEN-7", ward:"General", bedNum:"07", status:"occupied", patient:"Layla Al-Qahtani", mrn:"MRN-10476", admittedDays:4, dx:"Cellulitis",       news2:1, physician:"Dr. Al-Harbi",  dischargeEta:"Tomorrow"   },
  { id:"GEN-8", ward:"General", bedNum:"08", status:"cleaning",                                                                                                                                                      },
  // Maternity
  { id:"MAT-1", ward:"Maternity", bedNum:"01", status:"occupied", patient:"Sara Al-Zahrani",mrn:"MRN-10489", admittedDays:0, dx:"Active Labor",      news2:2, physician:"Dr. Al-Otaibi", dischargeEta:"2 days"    },
  { id:"MAT-2", ward:"Maternity", bedNum:"02", status:"available",                                                                                                                                                   },
  { id:"MAT-3", ward:"Maternity", bedNum:"03", status:"occupied", patient:"Huda Al-Malki",  mrn:"MRN-10475", admittedDays:1, dx:"Post-C/S Day 1",   news2:1, physician:"Dr. Al-Otaibi", dischargeEta:"3 days"    },
  { id:"MAT-4", ward:"Maternity", bedNum:"04", status:"reserved",                                                                                                                                                    },
  // Oncology
  { id:"ONC-1", ward:"Oncology", bedNum:"01", status:"occupied", patient:"Omar Al-Shehri",  mrn:"MRN-10486", admittedDays:1, dx:"Lymphoma Chemo",   news2:3, physician:"Dr. Al-Malki",  dischargeEta:"3 days"    },
  { id:"ONC-2", ward:"Oncology", bedNum:"02", status:"available",                                                                                                                                                    },
  { id:"ONC-3", ward:"Oncology", bedNum:"03", status:"occupied", patient:"Walid Al-Rashid", mrn:"MRN-10474", admittedDays:5, dx:"Ca Lung — chemo",  news2:4, physician:"Dr. Al-Malki",  dischargeEta:"2 days"    },
];

const STATUS_STYLE: Record<string, { bg: string; border: string; dot: string; label: string; textColor: string }> = {
  occupied:    { bg:"rgba(34,211,238,0.08)",  border:"rgba(34,211,238,0.22)",  dot:"#22d3ee", label:"Occupied",    textColor:"#22d3ee"            },
  available:   { bg:"rgba(74,222,128,0.08)",  border:"rgba(74,222,128,0.22)",  dot:"#4ade80", label:"Available",   textColor:"#4ade80"            },
  cleaning:    { bg:"rgba(251,191,36,0.08)",  border:"rgba(251,191,36,0.22)",  dot:"#fbbf24", label:"Cleaning",    textColor:"#fbbf24"            },
  reserved:    { bg:"rgba(167,139,250,0.08)", border:"rgba(167,139,250,0.22)", dot:"#a78bfa", label:"Reserved",    textColor:"#a78bfa"            },
  maintenance: { bg:"rgba(248,113,113,0.08)", border:"rgba(248,113,113,0.2)",  dot:"#f87171", label:"Maintenance", textColor:"#f87171"            },
};

const WARD_COLOR: Record<string, string> = {
  ICU:"#ef4444", ED:"#f97316", General:"#60a5fa", Maternity:"#f472b6", Oncology:"#a78bfa",
};

const news2Color = (n: number) =>
  n >= 7 ? "#ef4444" : n >= 5 ? "#f97316" : n >= 3 ? "#fbbf24" : "#4ade80";

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

const WARDS = ["All", "ICU", "ED", "General", "Maternity", "Oncology"];

export default function BedBoardPage() {
  const [filterWard, setFilterWard]     = useState("All");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected]         = useState<Bed | null>(null);

  const allBeds   = filterWard === "All" ? BEDS : BEDS.filter(b => b.ward === filterWard);
  const displayed = filterStatus === "all" ? allBeds : allBeds.filter(b => b.status === filterStatus);

  const wardGroups = WARDS.slice(1).map(w => {
    const wBeds = BEDS.filter(b => b.ward === w);
    const occ   = wBeds.filter(b => b.status === "occupied").length;
    return { ward:w, total:wBeds.length, occupied:occ, pct:Math.round((occ/wBeds.length)*100) };
  });

  const totalBeds  = BEDS.length;
  const occupiedN  = BEDS.filter(b=>b.status==="occupied").length;
  const availableN = BEDS.filter(b=>b.status==="available").length;
  const cleaningN  = BEDS.filter(b=>b.status==="cleaning").length;

  return (
    <div style={{ padding:"28px 28px 40px", minHeight:"100vh", background:"#080d18" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.3px", margin:0 }}>Bed Board</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)", marginTop:4 }}>
            {occupiedN}/{totalBeds} beds occupied · {availableN} available
          </p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ padding:"6px 14px", borderRadius:99, background:"rgba(74,222,128,0.12)", border:"1px solid rgba(74,222,128,0.25)", fontSize:12, fontWeight:700, color:"#4ade80" }}>
            ● {availableN} Available
          </div>
          <div style={{ padding:"6px 14px", borderRadius:99, background:"rgba(251,191,36,0.12)", border:"1px solid rgba(251,191,36,0.25)", fontSize:12, fontWeight:700, color:"#fbbf24" }}>
            ● {cleaningN} Cleaning
          </div>
        </div>
      </div>

      {/* Ward occupancy summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:20 }}>
        {wardGroups.map(w=>(
          <Card key={w.ward} style={{ padding:14 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:12, fontWeight:700, color:WARD_COLOR[w.ward]??"#60a5fa" }}>{w.ward}</span>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{w.occupied}/{w.total}</span>
            </div>
            <div style={{ height:6, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${w.pct}%`, borderRadius:99, background:WARD_COLOR[w.ward]??"#60a5fa", transition:"width 0.4s" }} />
            </div>
            <p style={{ fontSize:22, fontWeight:800, color:WARD_COLOR[w.ward]??"#60a5fa", marginTop:6, marginBottom:0 }}>{w.pct}%</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:16, marginBottom:16 }}>
        <div style={{ display:"flex", gap:6 }}>
          {WARDS.map(w=>(
            <button key={w} onClick={()=>setFilterWard(w)} style={{
              padding:"6px 14px", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer",
              background: filterWard===w?(WARD_COLOR[w]??"#e67e22")+"20":"transparent",
              border:`1px solid ${filterWard===w?(WARD_COLOR[w]??"#e67e22")+"50":"rgba(255,255,255,0.1)"}`,
              color: filterWard===w?(WARD_COLOR[w]??"#e67e22"):"rgba(255,255,255,0.4)",
            }}>{w}</button>
          ))}
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["all","occupied","available","cleaning","reserved","maintenance"].map(s=>{
            const st = STATUS_STYLE[s];
            return (
              <button key={s} onClick={()=>setFilterStatus(s)} style={{
                padding:"6px 12px", borderRadius:9, fontSize:11, fontWeight:600, cursor:"pointer",
                background: filterStatus===s?(st?.bg??"rgba(230,126,34,0.15)"):"transparent",
                border:`1px solid ${filterStatus===s?(st?.border??"rgba(230,126,34,0.3)"):"rgba(255,255,255,0.1)"}`,
                color: filterStatus===s?(st?.textColor??"#e67e22"):"rgba(255,255,255,0.4)",
                textTransform:"capitalize",
              }}>{s==="all"?"All Status":st?.label??s}</button>
            );
          })}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:selected?"1fr 360px":"1fr", gap:16 }}>
        {/* Bed grid */}
        <div>
          {(filterWard === "All" ? WARDS.slice(1) : [filterWard]).map(ward => {
            const wardBeds = displayed.filter(b => b.ward === ward);
            if (!wardBeds.length) return null;
            return (
              <div key={ward} style={{ marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:WARD_COLOR[ward]??"#60a5fa" }} />
                  <span style={{ fontSize:12, fontWeight:700, color:WARD_COLOR[ward]??"#60a5fa", textTransform:"uppercase", letterSpacing:"0.08em" }}>{ward}</span>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.25)" }}>— {wardBeds.length} beds shown</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:8 }}>
                  {wardBeds.map(bed => {
                    const st = STATUS_STYLE[bed.status];
                    const isSelected = selected?.id === bed.id;
                    return (
                      <div key={bed.id} onClick={()=>setSelected(isSelected?null:bed)}
                        style={{ borderRadius:14, padding:12, cursor:"pointer", transition:"all 0.15s",
                          background: isSelected?"rgba(230,126,34,0.1)":st.bg,
                          border:`1px solid ${isSelected?"rgba(230,126,34,0.35)":st.border}`,
                        }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                          <span style={{ fontSize:13, fontWeight:800, color:st.textColor }}>{bed.ward}-{bed.bedNum}</span>
                          <div style={{ width:8, height:8, borderRadius:"50%", background:st.dot }} />
                        </div>
                        {bed.status === "occupied" && bed.patient ? (
                          <>
                            <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:"0 0 2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{bed.patient}</p>
                            <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:"0 0 4px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{bed.dx}</p>
                            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                              <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>Day {bed.admittedDays}</span>
                              {bed.news2 !== undefined && (
                                <span style={{ fontSize:11, fontWeight:800, color:news2Color(bed.news2) }}>N2:{bed.news2}</span>
                              )}
                            </div>
                            {bed.dischargeEta && (
                              <p style={{ fontSize:10, color:"rgba(251,191,36,0.7)", margin:"4px 0 0" }}>↑ {bed.dischargeEta}</p>
                            )}
                          </>
                        ) : (
                          <p style={{ fontSize:11, color:st.textColor, margin:0, opacity:0.7 }}>{st.label}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selected && selected.status === "occupied" && selected.patient && (
          <Card style={{ padding:20, alignSelf:"start", position:"sticky", top:20 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", margin:0 }}>{selected.patient}</h3>
              <button onClick={()=>setSelected(null)} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer", fontSize:20, lineHeight:1 }}>×</button>
            </div>
            {([
              ["MRN", selected.mrn??"-"],
              ["Bed", `${selected.ward}-${selected.bedNum}`],
              ["Ward", selected.ward],
              ["Diagnosis", selected.dx??"-"],
              ["Physician", selected.physician??"-"],
              ["Admitted", `Day ${selected.admittedDays}`],
              ["Discharge ETA", selected.dischargeEta??"-"],
            ] as [string,string][]).map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{l}</span>
                <span style={{ fontSize:12, color:"#e2e8f0", fontWeight:500 }}>{v}</span>
              </div>
            ))}
            {selected.news2 !== undefined && (
              <div style={{ marginTop:14, padding:14, borderRadius:12, background:`${news2Color(selected.news2)}15`, border:`1px solid ${news2Color(selected.news2)}30` }}>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"0 0 2px" }}>NEWS2</p>
                <p style={{ fontSize:32, fontWeight:800, color:news2Color(selected.news2), margin:0 }}>{selected.news2}</p>
                <p style={{ fontSize:11, color:news2Color(selected.news2), marginTop:2 }}>
                  {selected.news2>=7?"High risk — escalate":selected.news2>=5?"Medium — monitor":"Low risk"}
                </p>
              </div>
            )}
            <div style={{ display:"flex", gap:8, marginTop:14 }}>
              {["View Chart","Transfer","Discharge"].map(a=>(
                <button key={a} style={{ flex:1, padding:"8px 0", borderRadius:10, fontSize:11, fontWeight:600, cursor:"pointer",
                  background: a==="View Chart"?"#e67e22":"rgba(255,255,255,0.05)",
                  color: a==="View Chart"?"white":a==="Discharge"?"#4ade80":"rgba(255,255,255,0.55)",
                  border:`1px solid ${a==="View Chart"?"transparent":a==="Discharge"?"rgba(74,222,128,0.3)":"rgba(255,255,255,0.08)"}`,
                }}>{a}</button>
              ))}
            </div>
          </Card>
        )}
        {selected && selected.status !== "occupied" && (
          <Card style={{ padding:20, alignSelf:"start" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", margin:0 }}>Bed {selected.ward}-{selected.bedNum}</h3>
              <button onClick={()=>setSelected(null)} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer", fontSize:20, lineHeight:1 }}>×</button>
            </div>
            <div style={{ padding:14, borderRadius:12, background:STATUS_STYLE[selected.status].bg, border:`1px solid ${STATUS_STYLE[selected.status].border}`, textAlign:"center" }}>
              <div style={{ width:12, height:12, borderRadius:"50%", background:STATUS_STYLE[selected.status].dot, margin:"0 auto 8px" }} />
              <p style={{ fontSize:14, fontWeight:700, color:STATUS_STYLE[selected.status].textColor, margin:0 }}>{STATUS_STYLE[selected.status].label}</p>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:14 }}>
              {selected.status==="available" && (
                <button style={{ flex:1, padding:"9px 0", borderRadius:10, fontSize:12, fontWeight:700, background:"#e67e22", color:"white", border:"none", cursor:"pointer" }}>Assign Patient</button>
              )}
              {selected.status==="cleaning" && (
                <button style={{ flex:1, padding:"9px 0", borderRadius:10, fontSize:12, fontWeight:700, background:"rgba(74,222,128,0.15)", color:"#4ade80", border:"1px solid rgba(74,222,128,0.3)", cursor:"pointer" }}>Mark Available</button>
              )}
              {selected.status==="maintenance" && (
                <button style={{ flex:1, padding:"9px 0", borderRadius:10, fontSize:12, fontWeight:700, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.08)", cursor:"pointer" }}>Mark Cleaned</button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
