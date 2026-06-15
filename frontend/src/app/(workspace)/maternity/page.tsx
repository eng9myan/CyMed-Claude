"use client";

import { useState } from "react";

type MatPatient = {
  id: string; mrn: string; name: string; age: number; ega: string; gravida: string;
  ward: string; bed: string; status: string; physician: string; fhr?: number;
  contractions?: string; cervix?: string; bp?: string; admittedAt: string; notes?: string;
};

const PATIENTS: MatPatient[] = [
  { id:"MAT-221", mrn:"MRN-10489", name:"Sara Al-Zahrani",  age:32, ega:"39+2", gravida:"G2P1", ward:"L&D", bed:"LDR-1", status:"ACTIVE_LABOR",  physician:"Dr. Al-Otaibi", fhr:148, contractions:"3-4 min", cervix:"7cm/80%/-1", bp:"122/78",  admittedAt:"04h ago" },
  { id:"MAT-220", mrn:"MRN-10475", name:"Huda Al-Malki",    age:28, ega:"38+5", gravida:"G1P0", ward:"Postpartum", bed:"MAT-3", status:"POST_CS",  physician:"Dr. Al-Otaibi", bp:"118/72", admittedAt:"1d ago",  notes:"C/S for breech; recovering well" },
  { id:"MAT-219", mrn:"MRN-10462", name:"Reem Al-Harbi",    age:25, ega:"36+1", gravida:"G1P0", ward:"Antepartum",bed:"MAT-5", status:"ANTEPARTUM", physician:"Dr. Al-Dosari", fhr:142, bp:"138/90", admittedAt:"2d ago",  notes:"Pre-eclampsia monitoring — BP elevated" },
  { id:"MAT-218", mrn:"MRN-10459", name:"Layla Al-Qahtani", age:35, ega:"40+0", gravida:"G3P2", ward:"L&D", bed:"LDR-2", status:"AUGMENTED",    physician:"Dr. Al-Otaibi", fhr:152, contractions:"5-6 min", cervix:"4cm/60%/-2", bp:"124/80", admittedAt:"6h ago" },
  { id:"MAT-217", mrn:"MRN-10450", name:"Dina Al-Rashidi",  age:30, ega:"37+3", gravida:"G2P1", ward:"Postpartum",bed:"MAT-1", status:"POST_SVD",  physician:"Dr. Al-Otaibi", bp:"116/70", admittedAt:"8h ago",  notes:"SVD; mother & baby well" },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  ACTIVE_LABOR: { bg:"rgba(239,68,68,0.15)",   color:"#f87171", label:"Active Labor"  },
  AUGMENTED:    { bg:"rgba(251,191,36,0.12)",  color:"#fbbf24", label:"Augmented"     },
  ANTEPARTUM:   { bg:"rgba(167,139,250,0.15)", color:"#a78bfa", label:"Antepartum"    },
  POST_CS:      { bg:"rgba(34,211,238,0.12)",  color:"#22d3ee", label:"Post C/S"      },
  POST_SVD:     { bg:"rgba(74,222,128,0.12)",  color:"#4ade80", label:"Post SVD"      },
};

const fhrColor = (fhr: number) =>
  fhr < 110 || fhr > 160 ? "#ef4444" : fhr < 120 || fhr > 155 ? "#f97316" : "#4ade80";

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

export default function MaternityPage() {
  const [selected, setSelected] = useState<MatPatient | null>(null);

  return (
    <div style={{ padding:"28px 28px 40px", minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.3px", margin:0 }}>Maternity</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)", marginTop:4 }}>Labour & Delivery · Postpartum · Antepartum</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:12, padding:"9px 20px", fontSize:13, fontWeight:700, cursor:"pointer" }}>+ Admit Patient</button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:20 }}>
        {([
          ["Total",       PATIENTS.length, "#60a5fa"],
          ["Active Labor",PATIENTS.filter(p=>["ACTIVE_LABOR","AUGMENTED"].includes(p.status)).length, "#ef4444"],
          ["Antepartum",  PATIENTS.filter(p=>p.status==="ANTEPARTUM").length, "#a78bfa"],
          ["Post-partum", PATIENTS.filter(p=>["POST_CS","POST_SVD"].includes(p.status)).length, "#4ade80"],
          ["High-risk FHR",PATIENTS.filter(p=>p.fhr&&(p.fhr<110||p.fhr>160)).length, "#f97316"],
        ] as [string,number,string][]).map(([l,v,c])=>(
          <Card key={l} style={{ padding:16 }}>
            <p style={{ fontSize:28, fontWeight:800, color:c, lineHeight:1, margin:0 }}>{v}</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.38)", marginTop:4 }}>{l}</p>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:selected?"1fr 380px":"1fr", gap:16 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:12, alignContent:"start" }}>
          {PATIENTS.map(p=>{
            const st = STATUS_STYLE[p.status]??STATUS_STYLE.ANTEPARTUM;
            const isSelected = selected?.id === p.id;
            return (
              <div key={p.id} onClick={()=>setSelected(isSelected?null:p)}
                style={{ borderRadius:16, padding:18, cursor:"pointer", transition:"all 0.15s",
                  background: isSelected?"rgba(230,126,34,0.06)":"rgba(255,255,255,0.03)",
                  border:`1px solid ${isSelected?"rgba(230,126,34,0.3)":"rgba(255,255,255,0.07)"}`,
                }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:"0 0 2px" }}>{p.name}</p>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:0 }}>{p.mrn} · Age {p.age} · {p.ega} · {p.gravida}</p>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:st.bg, color:st.color, whiteSpace:"nowrap" }}>{st.label}</span>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:10 }}>
                  {p.fhr && (
                    <div style={{ padding:10, borderRadius:10, background:"rgba(0,0,0,0.2)", textAlign:"center" }}>
                      <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"0 0 2px" }}>FHR</p>
                      <p style={{ fontSize:18, fontWeight:800, color:fhrColor(p.fhr), margin:0 }}>{p.fhr}</p>
                      <p style={{ fontSize:9, color:"rgba(255,255,255,0.25)", margin:0 }}>bpm</p>
                    </div>
                  )}
                  {p.bp && (
                    <div style={{ padding:10, borderRadius:10, background:"rgba(0,0,0,0.2)", textAlign:"center" }}>
                      <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"0 0 2px" }}>BP</p>
                      <p style={{ fontSize:14, fontWeight:700, color:"#e2e8f0", margin:0 }}>{p.bp}</p>
                      <p style={{ fontSize:9, color:"rgba(255,255,255,0.25)", margin:0 }}>mmHg</p>
                    </div>
                  )}
                  {p.contractions && (
                    <div style={{ padding:10, borderRadius:10, background:"rgba(0,0,0,0.2)", textAlign:"center" }}>
                      <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"0 0 2px" }}>Contractions</p>
                      <p style={{ fontSize:12, fontWeight:700, color:"#fbbf24", margin:0 }}>{p.contractions}</p>
                    </div>
                  )}
                </div>

                {p.cervix && (
                  <div style={{ padding:"6px 10px", borderRadius:8, background:"rgba(244,114,182,0.1)", border:"1px solid rgba(244,114,182,0.2)", fontSize:11, color:"#f9a8d4" }}>
                    Cervix: {p.cervix}
                  </div>
                )}
                {p.notes && (
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.38)", marginTop:8, marginBottom:0 }}>{p.notes}</p>
                )}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:10 }}>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{p.ward} · Bed {p.bed}</span>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{p.admittedAt}</span>
                </div>
              </div>
            );
          })}
        </div>

        {selected && (
          <Card style={{ padding:20, alignSelf:"start", position:"sticky", top:20 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", margin:0 }}>{selected.name}</h3>
              <button onClick={()=>setSelected(null)} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer", fontSize:20, lineHeight:1 }}>×</button>
            </div>
            {([
              ["MRN",selected.mrn],["EGA",selected.ega],["Gravida",selected.gravida],
              ["Ward / Bed",`${selected.ward} · ${selected.bed}`],
              ["Physician",selected.physician],["Admitted",selected.admittedAt],
            ] as [string,string][]).map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{l}</span>
                <span style={{ fontSize:12, color:"#e2e8f0", fontWeight:500 }}>{v}</span>
              </div>
            ))}
            {selected.notes && (
              <div style={{ marginTop:14, padding:12, borderRadius:10, background:"rgba(244,114,182,0.08)", border:"1px solid rgba(244,114,182,0.2)" }}>
                <p style={{ fontSize:12, color:"#f9a8d4", margin:0 }}>{selected.notes}</p>
              </div>
            )}
            <div style={{ display:"flex", gap:8, marginTop:14 }}>
              {["Partogram","Order","Deliver"].map(a=>(
                <button key={a} style={{ flex:1, padding:"8px 0", borderRadius:10, fontSize:11, fontWeight:600, cursor:"pointer",
                  background: a==="Partogram"?"#e67e22":"rgba(255,255,255,0.05)",
                  color: a==="Partogram"?"white":"rgba(255,255,255,0.55)",
                  border:`1px solid ${a==="Partogram"?"transparent":"rgba(255,255,255,0.08)"}`,
                }}>{a}</button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
