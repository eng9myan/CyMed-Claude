"use client";

import { useState } from "react";
import {
  Salad, Scale, AlertTriangle, CheckCircle2, User,
  PieChart, Droplets, Activity, ClipboardList, ChevronDown,
  Plus, BarChart3,
} from "lucide-react";

type NutritionRisk = "low" | "medium" | "high" | "critical";
type DietType = "normal" | "soft" | "minced" | "pureed" | "liquidised" | "ngt" | "tpn" | "npo";

type Patient = {
  id: string; name: string; mrn: string; bed: string; ward: string;
  weight: number; height: number; bmi: number; mustScore: number;
  risk: NutritionRisk; dietType: DietType; allergies: string[];
  calorieTarget: number; proteinTarget: number;
  calorieActual: number; proteinActual: number;
  meals: { meal: string; consumed: number; notes: string }[];
  interventions: string[];
};

const RISK_META: Record<NutritionRisk, { color: string; bg: string; label: string }> = {
  low:      { color:"#4ade80", bg:"rgba(74,222,128,0.1)",   label:"Low Risk" },
  medium:   { color:"#fbbf24", bg:"rgba(251,191,36,0.1)",   label:"Medium Risk" },
  high:     { color:"#f87171", bg:"rgba(248,113,113,0.1)",  label:"High Risk" },
  critical: { color:"#f43f5e", bg:"rgba(244,63,94,0.12)",   label:"Critical" },
};

const DIET_LABELS: Record<DietType, string> = {
  normal:"Normal diet", soft:"Soft diet", minced:"Minced & moist", pureed:"Pureed",
  liquidised:"Liquidised", ngt:"Nasogastric feeds", tpn:"TPN", npo:"Nil By Mouth",
};

const PATIENTS: Patient[] = [
  {
    id:"P1", name:"Ahmad Al-Rashid", mrn:"MRN-10492", bed:"4A", ward:"Cardiology",
    weight:85, height:175, bmi:27.8, mustScore:2, risk:"high",
    dietType:"soft", allergies:["Shellfish"], calorieTarget:1800, proteinTarget:85,
    calorieActual:1320, proteinActual:62,
    meals:[
      { meal:"Breakfast", consumed:65, notes:"Good appetite, finished soup and bread" },
      { meal:"Lunch",     consumed:50, notes:"Ate half plate, nauseous after" },
      { meal:"Dinner",    consumed:0,  notes:"Not yet" },
    ],
    interventions:["Nutritional supplement BID (Ensure Plus)","Dietitian review on Day 3","Family education re: soft diet"],
  },
  {
    id:"P2", name:"Fatima Al-Zahra", mrn:"MRN-10485", bed:"7B", ward:"General Medicine",
    weight:58, height:162, bmi:22.1, mustScore:3, risk:"high",
    dietType:"ngt", allergies:["Dairy"], calorieTarget:1600, proteinTarget:72,
    calorieActual:1600, proteinActual:72,
    meals:[
      { meal:"06:00 feed", consumed:100, notes:"250mL Jevity 1.5 via NGT" },
      { meal:"10:00 feed", consumed:100, notes:"250mL Jevity 1.5 via NGT" },
      { meal:"14:00 feed", consumed:100, notes:"Running" },
    ],
    interventions:["NGT commenced â€” Jevity 1.5 kcal/mL at 60mL/hr","Daily MUST reassessment","Aspirate check before each feed"],
  },
  {
    id:"P3", name:"Khalid Al-Dosari", mrn:"MRN-10488", bed:"2C", ward:"Surgery",
    weight:95, height:180, bmi:29.3, mustScore:0, risk:"low",
    dietType:"npo", allergies:[], calorieTarget:0, proteinTarget:0,
    calorieActual:0, proteinActual:0,
    meals:[],
    interventions:["NPO for surgery tomorrow 08:00","IV maintenance fluids","Reassess post-op day 1"],
  },
  {
    id:"P4", name:"Sara Al-Ghamdi", mrn:"MRN-10490", bed:"ICU-3", ward:"ICU",
    weight:62, height:165, bmi:22.8, mustScore:4, risk:"critical",
    dietType:"tpn", allergies:["Tree nuts"], calorieTarget:1500, proteinTarget:90,
    calorieActual:1500, proteinActual:90,
    meals:[
      { meal:"TPN running", consumed:100, notes:"Oliclinomel N7 at 42mL/hr â€” day 4" },
    ],
    interventions:["TPN via PICC â€” Oliclinomel N7","Daily glucose monitoring Q6H","Transition to EN when GI tract recovers","Weekly micronutrient panel"],
  },
];

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

export default function NutritionPage() {
  const [activeP, setActiveP] = useState<Patient>(PATIENTS[0]);
  const [addIntOpen, setAddIntOpen] = useState(false);

  const caloriePercent = activeP.calorieTarget > 0 ? Math.round((activeP.calorieActual / activeP.calorieTarget) * 100) : 100;
  const proteinPercent = activeP.proteinTarget > 0 ? Math.round((activeP.proteinActual / activeP.proteinTarget) * 100) : 100;
  const rm = RISK_META[activeP.risk];

  return (
    <div style={{ padding:"24px", minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Nutrition & Dietetics</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>
            MUST screening Â· Caloric tracking Â· TPN/EN management Â· Meal monitoring
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {[
            { l:"High Risk", v:PATIENTS.filter(p=>p.risk==="high"||p.risk==="critical").length, c:"#f87171" },
            { l:"On NGT/TPN", v:PATIENTS.filter(p=>p.dietType==="ngt"||p.dietType==="tpn").length, c:"#a78bfa" },
            { l:"NPO", v:PATIENTS.filter(p=>p.dietType==="npo").length, c:"#fbbf24" },
            { l:"Total Patients", v:PATIENTS.length, c:"#22d3ee" },
          ].map(s => (
            <Card key={s.l} style={{ padding:"10px 14px" }}>
              <p style={{ fontSize:20, fontWeight:800, color:s.c, margin:0 }}>{s.v}</p>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{s.l}</p>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:16 }}>
        {/* Patient list */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {PATIENTS.map(p => {
            const rm2 = RISK_META[p.risk];
            const isA = activeP.id === p.id;
            return (
              <Card key={p.id} style={{ padding:14, cursor:"pointer", border:`1px solid ${isA?"rgba(230,126,34,0.3)":"rgba(255,255,255,0.07)"}`, background:isA?"rgba(230,126,34,0.07)":"rgba(255,255,255,0.03)" }}
                onClick={() => setActiveP(p)}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <div style={{ width:34, height:34, borderRadius:10, background:`${rm2.color}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:rm2.color }}>
                    {p.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                  </div>
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:0 }}>{p.name}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>Bed {p.bed} Â· {p.ward}</p>
                  </div>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  <span style={{ fontSize:10, background:rm2.bg, color:rm2.color, borderRadius:6, padding:"2px 8px", fontWeight:700 }}>MUST {p.mustScore} Â· {rm2.label}</span>
                  <span style={{ fontSize:10, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.35)", borderRadius:6, padding:"2px 8px" }}>{DIET_LABELS[p.dietType]}</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Patient detail */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Anthropometrics & Risk */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10 }}>
            {[
              { l:"Weight", v:`${activeP.weight} kg`, c:"#22d3ee" },
              { l:"BMI", v:activeP.bmi.toString(), c: activeP.bmi>30?"#f87171":activeP.bmi<18.5?"#fbbf24":"#4ade80" },
              { l:"MUST Score", v:activeP.mustScore.toString(), c:rm.color },
              { l:"Risk Level", v:rm.label, c:rm.color },
            ].map(s => (
              <Card key={s.l} style={{ padding:"12px 16px" }}>
                <p style={{ fontSize:24, fontWeight:800, color:s.c, margin:0 }}>{s.v}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{s.l}</p>
              </Card>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {/* Caloric & Protein targets */}
            <Card style={{ padding:18 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px", display:"flex", alignItems:"center", gap:7 }}>
                <BarChart3 style={{ width:14, height:14, color:"#e67e22" }} /> Nutritional Targets
              </h3>
              {[
                { l:"Calories", actual:activeP.calorieActual, target:activeP.calorieTarget, unit:"kcal", color:"#e67e22", pct:caloriePercent },
                { l:"Protein",  actual:activeP.proteinActual,  target:activeP.proteinTarget,  unit:"g",    color:"#22d3ee", pct:proteinPercent },
              ].map(n => (
                <div key={n.l} style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.7)" }}>{n.l}</span>
                    <span style={{ fontSize:12, color:n.color, fontWeight:700 }}>
                      {n.target > 0 ? `${n.actual}/${n.target} ${n.unit} (${n.pct}%)` : "N/A"}
                    </span>
                  </div>
                  {n.target > 0 && (
                    <div style={{ height:8, background:"rgba(255,255,255,0.07)", borderRadius:8, overflow:"hidden" }}>
                      <div style={{ height:"100%", background:`linear-gradient(90deg,${n.color},${n.color}90)`, borderRadius:8,
                        width:`${Math.min(100, n.pct)}%`, transition:"width 0.6s" }} />
                    </div>
                  )}
                </div>
              ))}
              <div style={{ marginTop:10, padding:10, background:"rgba(255,255,255,0.02)", borderRadius:10, borderLeft:`3px solid ${rm.color}` }}>
                <p style={{ fontSize:11, color:rm.color, fontWeight:700, margin:"0 0 2px" }}>{rm.label}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0 }}>Diet: {DIET_LABELS[activeP.dietType]}</p>
              </div>
            </Card>

            {/* Meal intake */}
            <Card style={{ padding:18 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px", display:"flex", alignItems:"center", gap:7 }}>
                <Salad style={{ width:14, height:14, color:"#4ade80" }} /> Meal Intake Today
              </h3>
              {activeP.meals.length === 0 ? (
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.3)", fontStyle:"italic" }}>No meals applicable (NPO/PRE-OP)</p>
              ) : (
                activeP.meals.map(m => (
                  <div key={m.meal} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.04)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, position:"relative" }}>
                      <span style={{ fontSize:10, fontWeight:700, color: m.consumed>=80?"#4ade80":m.consumed>=50?"#fbbf24":"#f87171" }}>{m.consumed}%</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:0 }}>{m.meal}</p>
                      <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{m.notes}</p>
                    </div>
                    <div style={{ width:60, height:6, background:"rgba(255,255,255,0.07)", borderRadius:4, overflow:"hidden" }}>
                      <div style={{ height:"100%", background: m.consumed>=80?"#4ade80":m.consumed>=50?"#fbbf24":"#f87171", width:`${m.consumed}%` }} />
                    </div>
                  </div>
                ))
              )}
            </Card>
          </div>

          {/* Interventions */}
          <Card style={{ padding:18 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:7 }}>
                <ClipboardList style={{ width:14, height:14, color:"#a78bfa" }} /> Active Interventions
              </h3>
              <button onClick={() => setAddIntOpen(!addIntOpen)}
                style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(230,126,34,0.1)", border:"1px solid rgba(230,126,34,0.25)", borderRadius:8, padding:"5px 10px", color:"#e67e22", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                <Plus style={{ width:11, height:11 }} /> Add
              </button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {activeP.interventions.map((int, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"rgba(167,139,250,0.06)", border:"1px solid rgba(167,139,250,0.15)", borderRadius:10 }}>
                  <CheckCircle2 style={{ width:14, height:14, color:"#a78bfa", flexShrink:0 }} />
                  <span style={{ fontSize:12, color:"#f1f5f9" }}>{int}</span>
                </div>
              ))}
            </div>
            {addIntOpen && (
              <div style={{ marginTop:12, display:"flex", gap:8 }}>
                <input placeholder="Enter new intervention..." style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:12, outline:"none" }} />
                <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"0 16px", fontSize:12, fontWeight:700, cursor:"pointer" }}>Save</button>
              </div>
            )}
          </Card>

          {/* Allergies & special requirements */}
          {activeP.allergies.length > 0 && (
            <Card style={{ padding:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <AlertTriangle style={{ width:14, height:14, color:"#f87171" }} />
                <span style={{ fontSize:12, fontWeight:700, color:"#f87171" }}>Dietary Allergies / Intolerances</span>
              </div>
              <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
                {activeP.allergies.map(a => (
                  <span key={a} style={{ fontSize:11, background:"rgba(248,113,113,0.12)", color:"#f87171", borderRadius:8, padding:"4px 12px", fontWeight:600, border:"1px solid rgba(248,113,113,0.25)" }}>{a}</span>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


