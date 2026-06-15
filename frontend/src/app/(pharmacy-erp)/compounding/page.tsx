"use client";

import { useState } from "react";
import {
  Droplet, FlaskConical, AlertTriangle, CheckCircle2, Shield,
  Calculator, Clock, User, Plus, Scan, Package,
} from "lucide-react";

type PrepType = "tpn" | "chemo" | "iv_admixture" | "pediatric";
type PrepStatus = "pending" | "ingredients_scanned" | "compounding" | "qa_check" | "released" | "expired";

type Ingredient = { name: string; volume: number; unit: string; verified: boolean; lot?: string };

type Prep = {
  id: string; type: PrepType; patient: string; mrn: string; ward: string;
  prescription: string; prescriber: string;
  ingredients: Ingredient[];
  totalVolume: number; rate: string;
  preparedBy?: string; verifiedBy?: string;
  preparedAt?: string; bud: string; // beyond-use date
  status: PrepStatus;
  hoodLocation: string;
  uspCategory: "797_low" | "797_med" | "800_hazardous";
};

const PREPS: Prep[] = [
  {
    id:"IV-2026-0481", type:"tpn", patient:"Sara Al-Ghamdi", mrn:"MRN-10490", ward:"ICU",
    prescription:"TPN — 24h infusion at 42mL/hr × 7 days", prescriber:"Dr. Al-Rashid",
    ingredients:[
      { name:"Dextrose 70%",         volume:550, unit:"mL", verified:true, lot:"DX-2841" },
      { name:"Amino Acid 10%",       volume:500, unit:"mL", verified:true, lot:"AA-1923" },
      { name:"Lipid 20% (Intralipid)",volume:250, unit:"mL", verified:true, lot:"LP-7740" },
      { name:"NaCl 3%",              volume:40,  unit:"mEq", verified:true, lot:"NA-9921" },
      { name:"KCl 2mEq/mL",          volume:30,  unit:"mEq", verified:true, lot:"KC-3324" },
      { name:"Calcium Gluconate",    volume:10,  unit:"mEq", verified:true, lot:"CA-2241" },
      { name:"Magnesium Sulfate",    volume:8,   unit:"mEq", verified:true, lot:"MG-8843" },
      { name:"MVI Adult",            volume:10,  unit:"mL", verified:true, lot:"MVI-440" },
    ],
    totalVolume:1400, rate:"42 mL/hr (×24h)",
    preparedBy:"Pharm Tech Hala", verifiedBy:"Pharmacist Sami",
    preparedAt:"2026-06-13 08:42", bud:"2026-06-14 08:42 (24h)",
    status:"released", hoodLocation:"USP 797 ISO 5 Hood-A", uspCategory:"797_med",
  },
  {
    id:"IV-2026-0482", type:"chemo", patient:"Khalid Al-Dosari", mrn:"MRN-10488", ward:"Oncology",
    prescription:"FOLFOX-6 — Cycle 3 Day 1", prescriber:"Dr. Al-Mutawa",
    ingredients:[
      { name:"Oxaliplatin 85mg/m² (158mg)",  volume:31.6, unit:"mL", verified:true, lot:"OX-1182" },
      { name:"Leucovorin 400mg/m² (740mg)",  volume:74,   unit:"mL", verified:true, lot:"LV-2240" },
      { name:"5-FU bolus 400mg/m² (740mg)",  volume:14.8, unit:"mL", verified:true, lot:"FU-9931" },
      { name:"5-FU infusion 2400mg/m² (4440mg)",volume:88.8,unit:"mL", verified:true, lot:"FU-9931" },
      { name:"D5W diluent",                  volume:250,  unit:"mL", verified:true, lot:"DW-1140" },
    ],
    totalVolume:459, rate:"Per protocol — 46h infusion",
    preparedBy:"Pharm Tech Reem", verifiedBy:"Pharmacist Sami",
    preparedAt:"2026-06-13 09:15", bud:"2026-06-13 21:15 (12h at RT)",
    status:"compounding", hoodLocation:"USP 800 BSC Hood-C", uspCategory:"800_hazardous",
  },
  {
    id:"IV-2026-0483", type:"iv_admixture", patient:"Fatima Al-Zahra", mrn:"MRN-10485", ward:"General Medicine",
    prescription:"Vancomycin 1500mg IV Q12H", prescriber:"Dr. Hassan",
    ingredients:[
      { name:"Vancomycin 1500mg",        volume:30,  unit:"mL", verified:true, lot:"VN-4421" },
      { name:"0.9% NaCl diluent",        volume:250, unit:"mL", verified:true, lot:"NS-8842" },
    ],
    totalVolume:280, rate:"Infusion over 90 min",
    preparedAt:"2026-06-13 10:30", bud:"2026-06-15 10:30 (48h at 2-8°C)",
    status:"qa_check", hoodLocation:"USP 797 ISO 5 Hood-B", uspCategory:"797_low",
  },
  {
    id:"IV-2026-0484", type:"pediatric", patient:"Ahmad bin Khalid (10kg)", mrn:"MRN-12001", ward:"PICU",
    prescription:"Pediatric maintenance IV — D5 ½NS + 20mEq KCl", prescriber:"Dr. Al-Otaibi",
    ingredients:[
      { name:"D5W",                  volume:500, unit:"mL", verified:false },
      { name:"NaCl 0.45%",           volume:0,   unit:"mEq", verified:false },
      { name:"KCl 20mEq/L",          volume:20,  unit:"mEq", verified:false },
    ],
    totalVolume:500, rate:"40 mL/hr (1.5×maintenance)",
    bud:"24h at 2-8°C",
    status:"pending", hoodLocation:"USP 797 ISO 5 Hood-B", uspCategory:"797_low",
  },
];

const TYPE_META: Record<PrepType,{c:string;bg:string;label:string;icon:React.ReactNode}> = {
  tpn:           { c:"#22d3ee", bg:"rgba(34,211,238,0.1)",  label:"TPN — Total Parenteral Nutrition", icon:<Droplet style={{ width:13, height:13 }} /> },
  chemo:         { c:"#f43f5e", bg:"rgba(244,63,94,0.1)",   label:"Chemotherapy (USP 800)", icon:<FlaskConical style={{ width:13, height:13 }} /> },
  iv_admixture:  { c:"#4ade80", bg:"rgba(74,222,128,0.1)",  label:"IV Admixture", icon:<Droplet style={{ width:13, height:13 }} /> },
  pediatric:     { c:"#a78bfa", bg:"rgba(167,139,250,0.1)", label:"Pediatric Compounding", icon:<Droplet style={{ width:13, height:13 }} /> },
};

const STATUS_META: Record<PrepStatus,{c:string;bg:string;label:string}> = {
  pending:             { c:"#fbbf24", bg:"rgba(251,191,36,0.1)", label:"Pending Compounding" },
  ingredients_scanned: { c:"#22d3ee", bg:"rgba(34,211,238,0.1)", label:"Ingredients Verified" },
  compounding:         { c:"#fb923c", bg:"rgba(251,146,60,0.1)", label:"Compounding in Hood" },
  qa_check:            { c:"#a78bfa", bg:"rgba(167,139,250,0.1)",label:"Pharmacist QA Check" },
  released:            { c:"#4ade80", bg:"rgba(74,222,128,0.1)", label:"Released" },
  expired:             { c:"#f87171", bg:"rgba(248,113,113,0.1)",label:"Expired — Discard" },
};

const USP_META: Record<string,{c:string;label:string;desc:string}> = {
  "797_low": { c:"#4ade80", label:"USP 797 Low Risk", desc:"Single-dose, simple transfer" },
  "797_med": { c:"#fbbf24", label:"USP 797 Medium Risk", desc:"Multiple ingredients, complex" },
  "800_hazardous":{ c:"#f43f5e", label:"USP 800 Hazardous", desc:"Cytotoxic / hazardous drug" },
};

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function CompoundingPage() {
  const [active, setActive] = useState<Prep>(PREPS[1]);
  const tm = TYPE_META[active.type];
  const sm = STATUS_META[active.status];
  const um = USP_META[active.uspCategory];

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>IV Compounding · TPN · Chemo</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Sterile compounding workflow · USP 797/800 compliance · BUD tracking · Beyond-use dating · 2-pharmacist verification</p>
        </div>
        <button style={{ display:"flex", alignItems:"center", gap:7, background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          <Plus style={{ width:14, height:14 }} /> New Preparation
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:18 }}>
        {[
          { l:"Active Preps", v:PREPS.length, c:"#22d3ee" },
          { l:"TPN", v:PREPS.filter(p=>p.type==="tpn").length, c:"#22d3ee" },
          { l:"Chemo (USP 800)", v:PREPS.filter(p=>p.type==="chemo").length, c:"#f43f5e" },
          { l:"Pending Release", v:PREPS.filter(p=>["qa_check","compounding"].includes(p.status)).length, c:"#a78bfa" },
          { l:"Released Today", v:PREPS.filter(p=>p.status==="released").length, c:"#4ade80" },
        ].map(s => (
          <Card key={s.l} style={{ padding:"12px 16px" }}>
            <p style={{ fontSize:22, fontWeight:800, color:s.c, margin:0 }}>{s.v}</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{s.l}</p>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"380px 1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {PREPS.map(p => {
            const t = TYPE_META[p.type];
            const s = STATUS_META[p.status];
            const isA = active.id === p.id;
            return (
              <Card key={p.id} style={{ padding:14, cursor:"pointer", border:`1px solid ${isA?"rgba(230,126,34,0.3)":p.type==="chemo"?"rgba(244,63,94,0.25)":"rgba(255,255,255,0.07)"}`, background:isA?"rgba(230,126,34,0.07)":"rgba(255,255,255,0.03)", borderLeft:p.type==="chemo"?"3px solid #f43f5e":"3px solid transparent" }} onClick={()=>setActive(p)}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:11, fontFamily:"monospace", color:"#e67e22" }}>{p.id}</span>
                  <span style={{ fontSize:9, background:t.bg, color:t.c, borderRadius:5, padding:"2px 7px", fontWeight:700, display:"flex", alignItems:"center", gap:3 }}>{t.icon}{p.type.toUpperCase()}</span>
                </div>
                <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:0 }}>{p.patient}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{p.prescription}</p>
                <p style={{ fontSize:9, color:"rgba(255,255,255,0.3)", margin:"2px 0 0" }}>{p.ward} · {p.hoodLocation}</p>
                <div style={{ marginTop:6 }}>
                  <span style={{ fontSize:9, background:s.bg, color:s.c, borderRadius:5, padding:"2px 8px", fontWeight:700 }}>{s.label}</span>
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
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"3px 0 0" }}>{active.mrn} · {active.ward}</p>
                <p style={{ fontSize:12, color:tm.c, margin:"6px 0 0", fontWeight:600 }}>{active.prescription}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:"2px 0 0" }}>Prescriber: {active.prescriber}</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end" }}>
                <span style={{ fontSize:11, background:sm.bg, color:sm.c, borderRadius:6, padding:"4px 12px", fontWeight:700 }}>{sm.label}</span>
                <span style={{ fontSize:10, background:`${um.c}15`, color:um.c, borderRadius:5, padding:"3px 9px", fontWeight:700, border:`1px solid ${um.c}30` }}>{um.label}</span>
              </div>
            </div>
          </div>

          <div style={{ padding:22, display:"grid", gap:16 }}>
            {/* USP / Hood / BUD info */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:10, padding:12 }}>
                <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0, textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>USP Category</p>
                <p style={{ fontSize:12, color:um.c, margin:"4px 0 0", fontWeight:700 }}>{um.label}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:"2px 0 0" }}>{um.desc}</p>
              </div>
              <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:10, padding:12 }}>
                <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0, textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>Hood Location</p>
                <p style={{ fontSize:12, color:"#f1f5f9", margin:"4px 0 0", fontWeight:700 }}>{active.hoodLocation}</p>
              </div>
              <div style={{ background:"rgba(251,191,36,0.05)", border:"1px solid rgba(251,191,36,0.15)", borderRadius:10, padding:12 }}>
                <p style={{ fontSize:9, color:"rgba(251,191,36,0.7)", margin:0, textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>Beyond-Use Date</p>
                <p style={{ fontSize:12, color:"#fbbf24", margin:"4px 0 0", fontWeight:700 }}>{active.bud}</p>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:7 }}>
                  <Calculator style={{ width:14, height:14, color:"#e67e22" }} /> Ingredients ({active.ingredients.length})
                </h3>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>Total Volume: <strong style={{ color:"#e67e22" }}>{active.totalVolume} mL</strong></span>
              </div>
              <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:10, overflow:"hidden" }}>
                {active.ingredients.map((ing, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", padding:"10px 14px", borderBottom: i < active.ingredients.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none", gap:12 }}>
                    <div style={{ width:28, height:28, borderRadius:8, background: ing.verified?"rgba(74,222,128,0.15)":"rgba(255,255,255,0.04)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {ing.verified ? <CheckCircle2 style={{ width:14, height:14, color:"#4ade80" }} /> : <Scan style={{ width:14, height:14, color:"rgba(255,255,255,0.4)" }} />}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:0 }}>{ing.name}</p>
                      {ing.lot && <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0", fontFamily:"monospace" }}>Lot: {ing.lot}</p>}
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <p style={{ fontSize:13, fontWeight:700, color: ing.verified?"#4ade80":"rgba(255,255,255,0.5)", margin:0, fontFamily:"monospace" }}>{ing.volume} {ing.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2-pharmacist verification */}
            <div style={{ background: active.verifiedBy ? "rgba(74,222,128,0.04)" : "rgba(251,191,36,0.04)", border:`1px solid ${active.verifiedBy ? "rgba(74,222,128,0.2)" : "rgba(251,191,36,0.2)"}`, borderRadius:12, padding:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <Shield style={{ width:14, height:14, color: active.verifiedBy ? "#4ade80" : "#fbbf24" }} />
                <span style={{ fontSize:12, fontWeight:700, color: active.verifiedBy ? "#4ade80" : "#fbbf24" }}>
                  {active.verifiedBy ? "Double-Check Verified" : "Pharmacist Verification Required"}
                </span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0, textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>Prepared By</p>
                  <p style={{ fontSize:12, color:active.preparedBy?"#f1f5f9":"rgba(255,255,255,0.4)", margin:"3px 0 0", fontWeight:600 }}>{active.preparedBy ?? "— Pending —"}</p>
                  {active.preparedAt && <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>{active.preparedAt}</p>}
                </div>
                <div>
                  <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0, textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>Verified By (2nd Pharmacist)</p>
                  <p style={{ fontSize:12, color:active.verifiedBy?"#4ade80":"rgba(255,255,255,0.4)", margin:"3px 0 0", fontWeight:600 }}>{active.verifiedBy ?? "— Awaiting verification —"}</p>
                </div>
              </div>
            </div>

            {/* Rate / Administration */}
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background:"rgba(34,211,238,0.04)", border:"1px solid rgba(34,211,238,0.15)", borderRadius:10 }}>
              <Clock style={{ width:14, height:14, color:"#22d3ee" }} />
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>Administration:</span>
              <span style={{ fontSize:12, fontWeight:700, color:"#22d3ee" }}>{active.rate}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
