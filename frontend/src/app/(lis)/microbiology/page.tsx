"use client";

import { useState } from "react";
import {
  Microscope, AlertTriangle, CheckCircle2, Clock,
  TrendingUp, Shield, Activity, Filter, Search,
} from "lucide-react";

type CultureStatus = "incubating" | "preliminary" | "final" | "no_growth";
type SensitivityResult = "S" | "I" | "R" | null;

type Organism = {
  name: string; count?: string;
  sensitivities: Record<string, SensitivityResult>;
};

type Culture = {
  id: string; patient: string; mrn: string; ward: string;
  specimen: string; collectedAt: string; receivedAt: string;
  ageHours: number; status: CultureStatus;
  organisms: Organism[];
  gramStain?: string;
  flag?: "critical" | "infection_control" | "mdro";
  notes?: string;
};

const ANTIBIOTICS = [
  "Ampicillin", "Amox/Clav", "Pip/Tazo", "Cefuroxime", "Ceftriaxone", "Cefepime",
  "Meropenem", "Gentamicin", "Ciprofloxacin", "Vancomycin", "Linezolid", "Tigecycline",
];

const CULTURES: Culture[] = [
  {
    id:"BC-26841", patient:"Ahmad Al-Rashid", mrn:"MRN-10492", ward:"ICU",
    specimen:"Blood culture × 2 (peripheral + line)", collectedAt:"2026-06-12 06:15",
    receivedAt:"2026-06-12 06:42", ageHours:32, status:"final",
    gramStain:"Gram-negative rods, lactose fermenter",
    flag:"mdro",
    organisms:[
      { name:"Escherichia coli ESBL+", count:">100,000 CFU/mL",
        sensitivities:{ "Ampicillin":"R", "Amox/Clav":"R", "Pip/Tazo":"I", "Cefuroxime":"R", "Ceftriaxone":"R", "Cefepime":"R", "Meropenem":"S", "Gentamicin":"S", "Ciprofloxacin":"R", "Vancomycin":null, "Linezolid":null, "Tigecycline":"S" } },
    ],
    notes:"⚠ ESBL-producing E. coli. Notify infection control. Contact precautions in place. Recommend carbapenem.",
  },
  {
    id:"UC-26842", patient:"Fatima Al-Zahra", mrn:"MRN-10485", ward:"General Medicine",
    specimen:"Mid-stream urine", collectedAt:"2026-06-12 14:30",
    receivedAt:"2026-06-12 15:10", ageHours:24, status:"preliminary",
    gramStain:"Gram-positive cocci in chains",
    organisms:[
      { name:"Enterococcus faecalis", count:"50,000 CFU/mL",
        sensitivities:{ "Ampicillin":"S", "Amox/Clav":"S", "Pip/Tazo":"S", "Cefuroxime":null, "Ceftriaxone":null, "Cefepime":null, "Meropenem":null, "Gentamicin":"S", "Ciprofloxacin":"R", "Vancomycin":"S", "Linezolid":"S", "Tigecycline":null } },
    ],
  },
  {
    id:"BC-26839", patient:"Sara Al-Ghamdi", mrn:"MRN-10490", ward:"Oncology",
    specimen:"Blood culture × 2", collectedAt:"2026-06-12 22:00",
    receivedAt:"2026-06-12 22:18", ageHours:18, status:"preliminary",
    gramStain:"Gram-positive cocci in clusters",
    flag:"critical",
    organisms:[
      { name:"Staphylococcus aureus (MRSA suspect)", count:"Awaiting confirmation",
        sensitivities:{ "Ampicillin":null, "Amox/Clav":null, "Pip/Tazo":null, "Cefuroxime":null, "Ceftriaxone":null, "Cefepime":null, "Meropenem":null, "Gentamicin":null, "Ciprofloxacin":null, "Vancomycin":"S", "Linezolid":"S", "Tigecycline":null } },
    ],
    notes:"⚠ Critical value: positive blood culture, Gram + cocci in clusters. Phoned attending Dr. Al-Rashid at 23:08 — read-back confirmed.",
  },
  {
    id:"SC-26840", patient:"Khalid Al-Dosari", mrn:"MRN-10488", ward:"Surgery",
    specimen:"Wound swab — abdominal incision", collectedAt:"2026-06-13 08:30",
    receivedAt:"2026-06-13 08:55", ageHours:8, status:"incubating",
    organisms:[],
  },
  {
    id:"UC-26838", patient:"Omar Al-Shehri", mrn:"MRN-10486", ward:"General Medicine",
    specimen:"Catheter urine", collectedAt:"2026-06-10 10:00",
    receivedAt:"2026-06-10 11:15", ageHours:72, status:"no_growth",
    organisms:[],
  },
];

const STATUS_META: Record<CultureStatus, { c:string; bg:string; label:string }> = {
  incubating:  { c:"#fbbf24", bg:"rgba(251,191,36,0.1)",  label:"Incubating" },
  preliminary: { c:"#22d3ee", bg:"rgba(34,211,238,0.1)",  label:"Preliminary" },
  final:       { c:"#4ade80", bg:"rgba(74,222,128,0.1)",  label:"Final Result" },
  no_growth:   { c:"#94a3b8", bg:"rgba(148,163,184,0.1)", label:"No Growth (5d)" },
};

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

function sensColor(r: SensitivityResult) {
  if (r === "S") return "#4ade80";
  if (r === "I") return "#fbbf24";
  if (r === "R") return "#f87171";
  return "rgba(255,255,255,0.2)";
}

export default function MicrobiologyPage() {
  const [active, setActive] = useState<Culture>(CULTURES[0]);

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Microbiology</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Culture & sensitivity · Antibiogram · Blood culture monitoring · IPC alerts · MALDI-TOF integration</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {[
            { l:"Positive Cultures", v:CULTURES.filter(c=>c.organisms.length>0).length, c:"#f87171" },
            { l:"MDRO Alerts", v:CULTURES.filter(c=>c.flag==="mdro").length, c:"#f43f5e" },
            { l:"Critical Values", v:CULTURES.filter(c=>c.flag==="critical").length, c:"#fbbf24" },
            { l:"Incubating", v:CULTURES.filter(c=>c.status==="incubating").length, c:"#22d3ee" },
          ].map(s => (
            <Card key={s.l} style={{ padding:"10px 14px" }}>
              <p style={{ fontSize:20, fontWeight:800, color:s.c, margin:0 }}>{s.v}</p>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{s.l}</p>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"360px 1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {CULTURES.map(c => {
            const sm = STATUS_META[c.status];
            const isA = active.id === c.id;
            return (
              <Card key={c.id} style={{ padding:14, cursor:"pointer", border:`1px solid ${isA?"rgba(230,126,34,0.3)":c.flag?"rgba(248,113,113,0.25)":"rgba(255,255,255,0.07)"}`, background:isA?"rgba(230,126,34,0.07)":"rgba(255,255,255,0.03)", borderLeft:c.flag?"3px solid #f87171":"3px solid transparent" }} onClick={()=>setActive(c)}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:11, fontFamily:"monospace", color:"#22d3ee", fontWeight:700 }}>{c.id}</span>
                  <span style={{ fontSize:9, background:sm.bg, color:sm.c, borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{sm.label}</span>
                </div>
                <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:0 }}>{c.patient}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>{c.mrn} · {c.ward}</p>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:"6px 0 4px" }}>{c.specimen}</p>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  <span style={{ fontSize:9, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.45)", borderRadius:5, padding:"2px 7px" }}>{c.ageHours}h old</span>
                  {c.flag==="mdro" && <span style={{ fontSize:9, background:"rgba(244,63,94,0.15)", color:"#f43f5e", borderRadius:5, padding:"2px 7px", fontWeight:700 }}>⚠ MDRO</span>}
                  {c.flag==="critical" && <span style={{ fontSize:9, background:"rgba(251,191,36,0.15)", color:"#fbbf24", borderRadius:5, padding:"2px 7px", fontWeight:700 }}>⚠ CRITICAL</span>}
                </div>
              </Card>
            );
          })}
        </div>

        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"16px 22px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
              <div>
                <h2 style={{ fontSize:17, fontWeight:800, color:"#f1f5f9", margin:0 }}>{active.id} — {active.patient}</h2>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"3px 0 0" }}>{active.mrn} · {active.ward} · {active.specimen}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:"3px 0 0" }}>Collected {active.collectedAt} · Received {active.receivedAt}</p>
              </div>
              {active.flag && (
                <div style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.25)", borderRadius:8, padding:"6px 12px", display:"flex", alignItems:"center", gap:6 }}>
                  <AlertTriangle style={{ width:13, height:13, color:"#f87171" }} />
                  <span style={{ fontSize:11, fontWeight:700, color:"#f87171", textTransform:"uppercase" }}>{active.flag==="mdro"?"MDRO Alert":active.flag==="critical"?"Critical Value":"IPC Flag"}</span>
                </div>
              )}
            </div>
          </div>

          {active.gramStain && (
            <div style={{ padding:"14px 22px", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0, textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Gram Stain</p>
              <p style={{ fontSize:13, color:"#22d3ee", margin:"4px 0 0", fontWeight:600 }}>{active.gramStain}</p>
            </div>
          )}

          {active.organisms.length === 0 ? (
            <div style={{ padding:40, textAlign:"center" }}>
              <Clock style={{ width:32, height:32, color:"rgba(255,255,255,0.2)", margin:"0 auto 12px" }} />
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", margin:0 }}>{active.status === "no_growth" ? "No growth after 5 days incubation" : "Awaiting growth — culture incubating"}</p>
            </div>
          ) : (
            active.organisms.map((o, i) => (
              <div key={i} style={{ padding:"16px 22px", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <h3 style={{ fontSize:15, fontWeight:800, color:"#f1f5f9", margin:0 }}>{o.name}</h3>
                  {o.count && <span style={{ fontSize:11, color:"#22d3ee", fontWeight:700, fontFamily:"monospace" }}>{o.count}</span>}
                </div>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Antibiotic Sensitivity (MIC / Kirby-Bauer)</p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
                  {ANTIBIOTICS.map(ab => {
                    const r = o.sensitivities[ab];
                    return (
                      <div key={ab} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 10px", background: r ? `${sensColor(r)}10` : "rgba(255,255,255,0.02)", border:`1px solid ${r ? `${sensColor(r)}30` : "rgba(255,255,255,0.04)"}`, borderRadius:8 }}>
                        <span style={{ fontSize:11, color: r ? "#f1f5f9" : "rgba(255,255,255,0.3)" }}>{ab}</span>
                        {r ? <span style={{ fontSize:12, fontWeight:800, color:sensColor(r), width:18, height:18, borderRadius:4, background:`${sensColor(r)}20`, display:"flex", alignItems:"center", justifyContent:"center" }}>{r}</span> : <span style={{ fontSize:9, color:"rgba(255,255,255,0.2)" }}>—</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {active.notes && (
            <div style={{ padding:"14px 22px", background:"rgba(248,113,113,0.04)", borderTop:"1px solid rgba(248,113,113,0.15)" }}>
              <p style={{ fontSize:10, color:"#f87171", margin:0, textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Clinical Notes / Notification</p>
              <p style={{ fontSize:12, color:"rgba(248,113,113,0.85)", margin:"5px 0 0", lineHeight:1.55 }}>{active.notes}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
