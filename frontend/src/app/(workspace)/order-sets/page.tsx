"use client";

import { useState } from "react";
import {
  ClipboardList, Search, Plus, CheckCircle2, Circle, ChevronRight,
  Pill, FlaskConical, Scan, FileText, Stethoscope, Activity,
  AlertTriangle, Lock, Filter, Star, Copy,
} from "lucide-react";

type OrderSetCategory = "admission" | "surgical" | "medical" | "icu" | "emergency" | "discharge";
type OrderType = "medication" | "lab" | "imaging" | "nursing" | "diet" | "consult";

type OrderItem = {
  id: string; type: OrderType; name: string; detail: string;
  mandatory: boolean; selected: boolean; note?: string;
  alert?: string; controlled?: boolean;
};

type OrderSet = {
  id: string; name: string; category: OrderSetCategory; specialty: string;
  version: string; lastUpdated: string; evidence: string; starred?: boolean;
  description: string; items: OrderItem[];
};

const TYPE_META: Record<OrderType, { color:string; icon: React.ReactNode }> = {
  medication: { color:"#e67e22", icon:<Pill style={{ width:12, height:12 }} /> },
  lab:        { color:"#22d3ee", icon:<FlaskConical style={{ width:12, height:12 }} /> },
  imaging:    { color:"#a78bfa", icon:<Scan style={{ width:12, height:12 }} /> },
  nursing:    { color:"#4ade80", icon:<Activity style={{ width:12, height:12 }} /> },
  diet:       { color:"#fbbf24", icon:<FileText style={{ width:12, height:12 }} /> },
  consult:    { color:"#f472b6", icon:<Stethoscope style={{ width:12, height:12 }} /> },
};

const ORDER_SETS: OrderSet[] = [
  {
    id:"OS1", name:"Acute MI â€” Primary PCI Pathway", category:"emergency", specialty:"Cardiology",
    version:"v3.1", lastUpdated:"2026-05-15", evidence:"AHA/ACC 2023 STEMI Guidelines", starred:true,
    description:"Complete order set for STEMI patients going to primary PCI. Evidence-based protocol aligning with AHA/ACC 2023 guidelines.",
    items: [
      { id:"i1", type:"medication", name:"Aspirin 300mg PO stat", detail:"Loading dose â€” chew and swallow", mandatory:true, selected:true },
      { id:"i2", type:"medication", name:"Ticagrelor 180mg PO stat", detail:"P2Y12 inhibitor loading dose", mandatory:true, selected:true },
      { id:"i3", type:"medication", name:"Heparin 60 units/kg IV bolus", detail:"Max 5000 units â€” weight-based", mandatory:true, selected:true, alert:"Confirm no recent bleeding or prior HIT" },
      { id:"i4", type:"medication", name:"Metoprolol 5mg IV (if HR >70, no CI)", detail:"Titrate to HR 50â€“60, avoid if cardiogenic shock", mandatory:false, selected:true },
      { id:"i5", type:"medication", name:"Nitroglycerin 0.4mg SL (if BP >90)", detail:"PRN for chest pain if not on PDE5i", mandatory:false, selected:false },
      { id:"i6", type:"medication", name:"Morphine 2â€“4mg IV PRN", detail:"For refractory pain â€” reassess for TIMI bleeding risk", mandatory:false, selected:false, alert:"May mask pain relief from reperfusion â€” use judiciously", controlled:true },
      { id:"i7", type:"lab", name:"12-lead ECG stat + repeat at 90 min", detail:"Continuous ST monitoring", mandatory:true, selected:true },
      { id:"i8", type:"lab", name:"Troponin I/T stat, 3h, 6h", detail:"High-sensitivity if available", mandatory:true, selected:true },
      { id:"i9", type:"lab", name:"CBC, CMP, Coags (PT/INR/PTT), BNP", detail:"Pre-procedure baseline", mandatory:true, selected:true },
      { id:"i10", type:"lab", name:"ABG (if respiratory compromise)", detail:"Assess oxygenation and acid-base", mandatory:false, selected:false },
      { id:"i11", type:"imaging", name:"STAT portable CXR", detail:"Assess heart size, pulmonary oedema", mandatory:true, selected:true },
      { id:"i12", type:"imaging", name:"Bedside Echo pre-PCI (if available)", detail:"Wall motion, EF, pericardial effusion", mandatory:false, selected:true },
      { id:"i13", type:"nursing", name:"Continuous cardiac monitoring 12-lead", detail:"ST trend monitoring active", mandatory:true, selected:true },
      { id:"i14", type:"nursing", name:"2 large-bore IVs, foley catheter", detail:"Urine output monitoring", mandatory:true, selected:true },
      { id:"i15", type:"nursing", name:"NPO except medications", detail:"Pre-procedure fasting", mandatory:true, selected:true },
      { id:"i16", type:"nursing", name:"Oâ‚‚ via NC 2-4L/min â€” SpOâ‚‚ >95%", detail:"Titrate â€” avoid routine Oâ‚‚ if SpOâ‚‚ >95%", mandatory:false, selected:true },
      { id:"i17", type:"consult", name:"Cardiology/Cath Lab team alert", detail:"PCI team on-call activated", mandatory:true, selected:true },
      { id:"i18", type:"consult", name:"Anaesthesia pre-operative assessment", detail:"For rescue PCI / CABG consideration", mandatory:false, selected:false },
    ]
  },
  {
    id:"OS2", name:"Community Acquired Pneumonia â€” Admission", category:"admission", specialty:"Respiratory/General Medicine",
    version:"v2.4", lastUpdated:"2026-04-20", evidence:"BTS/IDSA-ATS 2023 Guidelines", starred:true,
    description:"Inpatient CAP management based on CURB-65 severity scoring with antibiotic pathway selection.",
    items: [
      { id:"i1", type:"medication", name:"Amoxicillin/Clavulanate 1.2g IV Q8H", detail:"CURB-65 â‰¥2 or hospitalised patient", mandatory:true, selected:true },
      { id:"i2", type:"medication", name:"Clarithromycin 500mg IV/PO BID", detail:"Add for atypical cover (Legionella, Mycoplasma)", mandatory:false, selected:true },
      { id:"i3", type:"medication", name:"Paracetamol 1g IV/PO QID", detail:"Antipyretic, analgesic â€” maximum 4g/day", mandatory:false, selected:true },
      { id:"i4", type:"lab", name:"Pneumonia severity: CURB-65 score", detail:"Assess at admission", mandatory:true, selected:true },
      { id:"i5", type:"lab", name:"Sputum MCS, blood cultures Ã—2", detail:"Before antibiotics if possible", mandatory:true, selected:true },
      { id:"i6", type:"lab", name:"Urine Legionella & pneumococcal antigen", detail:"For severe CAP", mandatory:false, selected:true },
      { id:"i7", type:"lab", name:"ABG (if SpOâ‚‚ <92% or severe)", detail:"Assess respiratory failure", mandatory:false, selected:false },
      { id:"i8", type:"imaging", name:"CXR PA & lateral at admission", detail:"Identify lobar vs interstitial pattern", mandatory:true, selected:true },
      { id:"i9", type:"imaging", name:"CT chest (if atypical or no improvement 72h)", detail:"Rule out complications / other diagnosis", mandatory:false, selected:false },
      { id:"i10", type:"nursing", name:"Oâ‚‚ titrate to SpOâ‚‚ 94â€“98%", detail:"Avoid FiOâ‚‚ >28% if COPD risk", mandatory:true, selected:true },
      { id:"i11", type:"nursing", name:"4-hourly vitals, NEWS2 score", detail:"Escalate if NEWS2 â‰¥5", mandatory:true, selected:true },
      { id:"i12", type:"nursing", name:"IV fluids if clinically dehydrated", detail:"Reassess daily â€” avoid fluid overload", mandatory:false, selected:true },
    ]
  },
  {
    id:"OS3", name:"Post-Operative CABG â€” ICU Day 1", category:"icu", specialty:"Cardiac Surgery",
    version:"v2.0", lastUpdated:"2026-03-10", evidence:"EACTS 2022 Cardiac Surgery Guidelines",
    description:"Standard post-CABG ICU orders for the first 24 hours following cardiac surgery.",
    items: [
      { id:"i1", type:"medication", name:"Aspirin 100mg PO/NG once extubated", detail:"Restart within 6h of surgery", mandatory:true, selected:true },
      { id:"i2", type:"medication", name:"Metoprolol 12.5mg PO BID (if HR >80)", detail:"Beta blockade for AF prevention", mandatory:false, selected:true },
      { id:"i3", type:"medication", name:"Insulin infusion per sliding scale", detail:"Target glucose 6â€“10 mmol/L", mandatory:true, selected:true, alert:"High alert medication â€” requires hourly glucose monitoring" },
      { id:"i4", type:"lab", name:"ABG on admission + 4h post-extubation", detail:"Ventilation management", mandatory:true, selected:true },
      { id:"i5", type:"lab", name:"CXR on ICU admission", detail:"ETT position, pneumothorax, effusion", mandatory:true, selected:true },
      { id:"i6", type:"nursing", name:"Continuous cardiac monitoring + 12-lead Q4H", detail:"ST changes, arrhythmia detection", mandatory:true, selected:true },
      { id:"i7", type:"nursing", name:"Chest drain â€” record hourly output", detail:"Alert surgeon if >200mL/h for 2 consecutive hours", mandatory:true, selected:true },
      { id:"i8", type:"nursing", name:"Ventilator lung-protective settings", detail:"TV 6mL/kg IBW, PEEP 5â€“8", mandatory:true, selected:true },
    ]
  },
  {
    id:"OS4", name:"DVT / Pulmonary Embolism", category:"medical", specialty:"Haematology/Internal Medicine",
    version:"v1.8", lastUpdated:"2026-02-28", evidence:"ESC 2019 PE Guidelines + ISTH VTE",
    description:"Evidence-based DVT/PE management including anticoagulation initiation and risk stratification.",
    items: [
      { id:"i1", type:"medication", name:"Rivaroxaban 15mg BID Ã—21d then 20mg OD", detail:"For low-intermediate PE or DVT", mandatory:true, selected:true },
      { id:"i2", type:"medication", name:"Enoxaparin 1mg/kg SC BID (if DOAC CI)", detail:"Renal dose adjust if eGFR <30", mandatory:false, selected:false },
      { id:"i3", type:"lab", name:"D-dimer, troponin, BNP", detail:"Risk stratification", mandatory:true, selected:true },
      { id:"i4", type:"imaging", name:"CTPA â€” CT pulmonary angiography", detail:"Diagnostic standard for suspected PE", mandatory:true, selected:true },
      { id:"i5", type:"imaging", name:"Bilateral lower limb Doppler US", detail:"DVT assessment", mandatory:false, selected:true },
      { id:"i6", type:"lab", name:"Thrombophilia screen (if age <50, unprovoked)", detail:"Factor V Leiden, APS, Protein C/S â€” before anticoag", mandatory:false, selected:false },
    ]
  },
  {
    id:"OS5", name:"Sepsis â€” Surviving Sepsis Bundle", category:"emergency", specialty:"ICU/Emergency",
    version:"v4.0", lastUpdated:"2026-05-30", evidence:"Surviving Sepsis Campaign 2021", starred:true,
    description:"Complete hour-1 and 3-hour bundle for sepsis management per Surviving Sepsis Campaign 2021.",
    items: [
      { id:"i1", type:"lab", name:"Blood cultures Ã—2 before antibiotics", detail:"From 2 separate sites", mandatory:true, selected:true },
      { id:"i2", type:"lab", name:"Lactate stat â€” repeat if initial â‰¥2", detail:"Guide fluid resuscitation", mandatory:true, selected:true },
      { id:"i3", type:"medication", name:"Broad-spectrum antibiotics within 1 hour", detail:"Pip/Tazo 4.5g IV Q6H Â± vancomycin per protocol", mandatory:true, selected:true },
      { id:"i4", type:"medication", name:"IV crystalloid 30mL/kg over 3 hours", detail:"If hypotension or lactate â‰¥4 â€” reassess", mandatory:true, selected:true },
      { id:"i5", type:"medication", name:"Noradrenaline if MAP <65 despite fluids", detail:"Start at 0.1mcg/kg/min, titrate", mandatory:false, selected:true, alert:"High alert vasopressor â€” central line preferred" },
      { id:"i6", type:"nursing", name:"Hourly urine output â€” Foley catheter", detail:"Target >0.5mL/kg/h", mandatory:true, selected:true },
      { id:"i7", type:"nursing", name:"qSOFA/SOFA score documentation Q4H", detail:"Track organ failure trajectory", mandatory:true, selected:true },
      { id:"i8", type:"consult", name:"ICU consult if qSOFA â‰¥2 or lactate â‰¥2", detail:"Consider ICU escalation", mandatory:false, selected:true },
    ]
  },
];

const CATEGORY_META: Record<OrderSetCategory, { color:string; label:string }> = {
  admission:  { color:"#22d3ee", label:"Admission" },
  surgical:   { color:"#f472b6", label:"Surgical" },
  medical:    { color:"#4ade80", label:"Medical" },
  icu:        { color:"#f87171", label:"ICU" },
  emergency:  { color:"#fbbf24", label:"Emergency" },
  discharge:  { color:"#a78bfa", label:"Discharge" },
};

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

export default function OrderSetsPage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [activeSet, setActiveSet] = useState<OrderSet>(ORDER_SETS[0]);
  const [items, setItems] = useState<OrderItem[]>(ORDER_SETS[0].items);
  const [orderComplete, setOrderComplete] = useState(false);

  const filtered = ORDER_SETS.filter(os => {
    const q = search.toLowerCase();
    const matchQ = !q || os.name.toLowerCase().includes(q) || os.specialty.toLowerCase().includes(q);
    const matchC = catFilter === "all" || os.category === catFilter;
    return matchQ && matchC;
  });

  function selectSet(os: OrderSet) {
    setActiveSet(os);
    setItems(os.items.map(i => ({ ...i })));
    setOrderComplete(false);
  }

  function toggleItem(id: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, selected: !i.selected } : i));
  }

  function selectAll() { setItems(prev => prev.map(i => ({ ...i, selected: true }))); }
  function deselectOptional() { setItems(prev => prev.map(i => ({ ...i, selected: i.mandatory }))); }

  const selectedCount = items.filter(i => i.selected).length;

  return (
    <div style={{ padding:"24px", minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Order Sets / Clinical Protocols</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>
            Evidence-based order sets â€” CPOE Integration Â· {ORDER_SETS.length} protocols available
          </p>
        </div>
        <button style={{ display:"flex", alignItems:"center", gap:7, background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
          <Plus style={{ width:14, height:14 }} /> Build New Order Set
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:16 }}>
        {/* Order set list */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {/* Search */}
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"0 14px" }}>
            <Search style={{ width:14, height:14, color:"rgba(255,255,255,0.3)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search order sets..."
              style={{ flex:1, background:"none", border:"none", color:"#f1f5f9", fontSize:13, outline:"none", padding:"11px 0" }} />
          </div>

          {/* Category filters */}
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            <button onClick={() => setCatFilter("all")} style={{ padding:"4px 10px", borderRadius:8, border:`1px solid ${catFilter==="all"?"#e67e22":"rgba(255,255,255,0.08)"}`, background:catFilter==="all"?"rgba(230,126,34,0.15)":"transparent", color:catFilter==="all"?"#e67e22":"rgba(255,255,255,0.35)", fontSize:10, fontWeight:600, cursor:"pointer" }}>All</button>
            {Object.entries(CATEGORY_META).map(([k,m]) => (
              <button key={k} onClick={() => setCatFilter(k)} style={{ padding:"4px 10px", borderRadius:8, border:`1px solid ${catFilter===k?m.color:"rgba(255,255,255,0.08)"}`, background:catFilter===k?`${m.color}18`:"transparent", color:catFilter===k?m.color:"rgba(255,255,255,0.35)", fontSize:10, fontWeight:600, cursor:"pointer" }}>
                {m.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {filtered.map(os => {
              const cm = CATEGORY_META[os.category];
              const isActive = activeSet.id === os.id;
              return (
                <Card key={os.id} style={{ padding:14, cursor:"pointer",
                  border:`1px solid ${isActive?"rgba(230,126,34,0.3)":"rgba(255,255,255,0.07)"}`,
                  background: isActive?"rgba(230,126,34,0.07)":"rgba(255,255,255,0.03)" }}
                  onClick={() => selectSet(os)}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                    <div>
                      <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:"0 0 4px", lineHeight:1.4 }}>{os.name}</p>
                      <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"0 0 8px" }}>{os.specialty}</p>
                      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                        <span style={{ fontSize:9, background:`${cm.color}18`, color:cm.color, borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{cm.label}</span>
                        <span style={{ fontSize:9, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.3)", borderRadius:5, padding:"2px 7px" }}>{os.version}</span>
                        <span style={{ fontSize:9, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.3)", borderRadius:5, padding:"2px 7px" }}>{os.items.length} orders</span>
                      </div>
                    </div>
                    {os.starred && <Star style={{ width:13, height:13, color:"#fbbf24", fill:"#fbbf24", flexShrink:0, marginTop:2 }} />}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Order set detail */}
        <Card style={{ padding:0, overflow:"hidden", display:"flex", flexDirection:"column" }}>
          {/* Set header */}
          <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
              <div>
                <h2 style={{ fontSize:16, fontWeight:800, color:"#f1f5f9", margin:"0 0 4px" }}>{activeSet.name}</h2>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:"0 0 8px" }}>{activeSet.description}</p>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontSize:10, background:"rgba(74,222,128,0.1)", color:"#4ade80", borderRadius:6, padding:"2px 10px", fontWeight:600 }}>
                    âœ“ {activeSet.evidence}
                  </span>
                  <span style={{ fontSize:10, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.35)", borderRadius:6, padding:"2px 10px" }}>
                    {activeSet.version} Â· Updated {activeSet.lastUpdated}
                  </span>
                  <span style={{ fontSize:10, background:`${CATEGORY_META[activeSet.category].color}15`, color:CATEGORY_META[activeSet.category].color, borderRadius:6, padding:"2px 10px", fontWeight:600 }}>
                    {CATEGORY_META[activeSet.category].label}
                  </span>
                </div>
              </div>
              <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                <button onClick={selectAll} style={{ fontSize:11, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"6px 12px", color:"rgba(255,255,255,0.5)", cursor:"pointer" }}>All</button>
                <button onClick={deselectOptional} style={{ fontSize:11, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"6px 12px", color:"rgba(255,255,255,0.5)", cursor:"pointer" }}>Mandatory only</button>
              </div>
            </div>
          </div>

          {/* Order items */}
          <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
            {Object.entries(TYPE_META).map(([typeKey, typeMeta]) => {
              const typeItems = items.filter(i => i.type === typeKey as OrderType);
              if (typeItems.length === 0) return null;
              return (
                <div key={typeKey}>
                  <div style={{ padding:"10px 20px 5px", display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ color:typeMeta.color }}>{typeMeta.icon}</span>
                    <span style={{ fontSize:10, fontWeight:700, color:typeMeta.color, textTransform:"uppercase", letterSpacing:"0.07em" }}>
                      {typeKey.charAt(0).toUpperCase() + typeKey.slice(1)}
                    </span>
                    <span style={{ fontSize:9, color:"rgba(255,255,255,0.25)", marginLeft:4 }}>{typeItems.filter(i=>i.selected).length}/{typeItems.length}</span>
                  </div>
                  {typeItems.map(item => (
                    <div key={item.id}
                      onClick={() => !item.mandatory && toggleItem(item.id)}
                      style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"10px 20px", cursor: item.mandatory?"default":"pointer", transition:"background 0.1s",
                        background: "transparent", borderBottom:"1px solid rgba(255,255,255,0.03)",
                        opacity: item.mandatory ? 1 : 1 }}>
                      <div style={{ marginTop:2, flexShrink:0 }}>
                        {item.mandatory ? (
                          <div style={{ width:16, height:16, borderRadius:4, background:"rgba(230,126,34,0.3)", border:"2px solid #e67e22", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <CheckCircle2 style={{ width:10, height:10, color:"#e67e22" }} />
                          </div>
                        ) : item.selected ? (
                          <div style={{ width:16, height:16, borderRadius:4, background:"rgba(74,222,128,0.2)", border:"2px solid #4ade80", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <CheckCircle2 style={{ width:10, height:10, color:"#4ade80" }} />
                          </div>
                        ) : (
                          <div style={{ width:16, height:16, borderRadius:4, background:"transparent", border:"2px solid rgba(255,255,255,0.15)" }} />
                        )}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:13, fontWeight: item.mandatory?700:500, color: item.selected?"#f1f5f9":"rgba(255,255,255,0.5)" }}>{item.name}</span>
                          {item.mandatory && <span style={{ fontSize:9, background:"rgba(230,126,34,0.12)", color:"#e67e22", borderRadius:4, padding:"1px 6px", fontWeight:700 }}>mandatory</span>}
                          {item.controlled && <span style={{ fontSize:9, background:"rgba(167,139,250,0.12)", color:"#a78bfa", borderRadius:4, padding:"1px 6px", fontWeight:700 }}>controlled</span>}
                        </div>
                        <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>{item.detail}</p>
                        {item.alert && (
                          <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:5, background:"rgba(248,113,113,0.07)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:8, padding:"5px 10px" }}>
                            <AlertTriangle style={{ width:11, height:11, color:"#f87171", flexShrink:0 }} />
                            <span style={{ fontSize:11, color:"rgba(248,113,113,0.8)" }}>{item.alert}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Footer â€” place orders */}
          <div style={{ padding:"14px 20px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>{selectedCount} orders selected</p>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:0 }}>{items.filter(i=>i.selected&&i.mandatory).length} mandatory Â· {items.filter(i=>i.selected&&!i.mandatory).length} optional</p>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 16px", color:"rgba(255,255,255,0.5)", fontSize:12, cursor:"pointer" }}>
                <Copy style={{ width:13, height:13 }} /> Duplicate Set
              </button>
              <button onClick={() => setOrderComplete(true)}
                style={{ display:"flex", alignItems:"center", gap:7, background:"linear-gradient(135deg,#e67e22,#d35400)", color:"white", border:"none", borderRadius:10, padding:"9px 20px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                <ClipboardList style={{ width:14, height:14 }} /> Place {selectedCount} Orders
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Success modal */}
      {orderComplete && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
          <Card style={{ width:440, padding:32, textAlign:"center" }}>
            <CheckCircle2 style={{ width:52, height:52, color:"#4ade80", margin:"0 auto 16px" }} />
            <h3 style={{ fontSize:18, fontWeight:800, color:"#f1f5f9", margin:"0 0 8px" }}>
              {selectedCount} Orders Placed
            </h3>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:"0 0 20px" }}>
              {activeSet.name} â€” transmitted to Pharmacy, Lab, and Nursing
            </p>
            <button onClick={() => setOrderComplete(false)}
              style={{ background:"#e67e22", color:"white", border:"none", borderRadius:12, padding:"10px 32px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              Done
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}


