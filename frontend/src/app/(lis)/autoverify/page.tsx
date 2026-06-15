"use client";

import { useState } from "react";
import {
  Zap, CheckCircle2, AlertTriangle, XCircle,
  TrendingUp, TrendingDown, Activity, Settings,
  RefreshCw, Eye, ChevronRight, BarChart3,
} from "lucide-react";

type RuleResult = "pass" | "warn" | "fail";
type ResultDecision = "auto_released" | "held_review" | "rejected" | "delta_flag" | "manual_override";

type WestgardCheck = { rule: string; result: RuleResult; detail: string };
type DeltaCheck = { test: string; prev: number; curr: number; deltaPct: number; threshold: number; flagged: boolean };

type ResultRow = {
  id: string; patient: string; mrn: string; analyzer: string;
  test: string; value: number; unit: string; refLow: number; refHigh: number;
  flag: "H"|"L"|"HH"|"LL"|null;
  westgard: WestgardCheck[];
  delta?: DeltaCheck;
  decision: ResultDecision;
  reviewer?: string;
  releasedAt?: string;
};

const RULES_INFO = [
  { code:"1-3s",  description:"One control exceeds ±3 SD",                       severity:"reject" },
  { code:"2-2s",  description:"Two consecutive controls exceed ±2 SD (same side)",severity:"reject" },
  { code:"R-4s",  description:"Range between two controls > 4 SD",               severity:"reject" },
  { code:"4-1s",  description:"Four consecutive controls > 1 SD (same side)",    severity:"warn" },
  { code:"10x",   description:"Ten consecutive controls on same side of mean",   severity:"warn" },
  { code:"1-2s",  description:"One control exceeds ±2 SD",                       severity:"warn" },
];

const RESULTS: ResultRow[] = [
  { id:"R001", patient:"Ahmad Al-Rashid", mrn:"MRN-10492", analyzer:"Roche Cobas 8000-1",
    test:"Sodium",     value:142, unit:"mmol/L", refLow:135, refHigh:145, flag:null,
    westgard:[{rule:"1-2s",result:"pass",detail:"+0.8 SD"},{rule:"1-3s",result:"pass",detail:"WNL"},{rule:"2-2s",result:"pass",detail:"OK"},{rule:"R-4s",result:"pass",detail:"OK"}],
    delta:{ test:"Sodium", prev:140, curr:142, deltaPct:1.4, threshold:5, flagged:false },
    decision:"auto_released", releasedAt:"2026-06-13 09:14" },
  { id:"R002", patient:"Fatima Al-Zahra", mrn:"MRN-10485", analyzer:"Sysmex XN-2000",
    test:"Hemoglobin", value:7.8, unit:"g/dL", refLow:12.0, refHigh:16.0, flag:"L",
    westgard:[{rule:"1-2s",result:"pass",detail:"OK"},{rule:"1-3s",result:"pass",detail:"WNL"},{rule:"2-2s",result:"pass",detail:"OK"},{rule:"R-4s",result:"pass",detail:"OK"}],
    delta:{ test:"Hemoglobin", prev:11.2, curr:7.8, deltaPct:30.4, threshold:20, flagged:true },
    decision:"delta_flag" },
  { id:"R003", patient:"Sara Al-Ghamdi", mrn:"MRN-10490", analyzer:"Roche Cobas 8000-2",
    test:"Troponin I", value:8.42, unit:"ng/mL", refLow:0, refHigh:0.04, flag:"HH",
    westgard:[{rule:"1-2s",result:"pass",detail:"OK"},{rule:"1-3s",result:"pass",detail:"WNL"},{rule:"2-2s",result:"pass",detail:"OK"},{rule:"R-4s",result:"pass",detail:"OK"}],
    decision:"held_review" },
  { id:"R004", patient:"Khalid Al-Dosari", mrn:"MRN-10488", analyzer:"Beckman AU680",
    test:"Glucose", value:285, unit:"mg/dL", refLow:70, refHigh:110, flag:"H",
    westgard:[{rule:"1-2s",result:"warn",detail:"+2.3 SD"},{rule:"1-3s",result:"pass",detail:"OK"},{rule:"2-2s",result:"warn",detail:"2nd ctrl >+2SD"},{rule:"R-4s",result:"pass",detail:"OK"}],
    decision:"held_review" },
  { id:"R005", patient:"Omar Al-Shehri", mrn:"MRN-10486", analyzer:"Roche Cobas 8000-1",
    test:"Potassium", value:6.8, unit:"mmol/L", refLow:3.5, refHigh:5.0, flag:"HH",
    westgard:[{rule:"1-3s",result:"fail",detail:"+3.4 SD — out of control"},{rule:"1-2s",result:"fail",detail:"OOC"},{rule:"2-2s",result:"warn",detail:"Watch next ctrl"},{rule:"R-4s",result:"pass",detail:"OK"}],
    decision:"rejected" },
  { id:"R006", patient:"Layla Al-Otaibi", mrn:"MRN-10489", analyzer:"Sysmex XN-2000",
    test:"WBC", value:14.2, unit:"10⁹/L", refLow:4.0, refHigh:11.0, flag:"H",
    westgard:[{rule:"1-2s",result:"pass",detail:"OK"},{rule:"1-3s",result:"pass",detail:"WNL"},{rule:"2-2s",result:"pass",detail:"OK"},{rule:"R-4s",result:"pass",detail:"OK"}],
    delta:{ test:"WBC", prev:13.8, curr:14.2, deltaPct:2.9, threshold:30, flagged:false },
    decision:"auto_released", releasedAt:"2026-06-13 09:18" },
];

const DECISION_META: Record<ResultDecision,{c:string;bg:string;label:string;icon:React.ReactNode}> = {
  auto_released: { c:"#4ade80", bg:"rgba(74,222,128,0.1)",   label:"Auto-Released", icon:<CheckCircle2 style={{ width:11, height:11 }} /> },
  held_review:   { c:"#fbbf24", bg:"rgba(251,191,36,0.1)",   label:"Held — Review", icon:<Eye style={{ width:11, height:11 }} /> },
  rejected:      { c:"#f87171", bg:"rgba(248,113,113,0.1)",  label:"QC Rejected",   icon:<XCircle style={{ width:11, height:11 }} /> },
  delta_flag:    { c:"#f472b6", bg:"rgba(244,114,182,0.1)",  label:"Delta Flag",    icon:<TrendingUp style={{ width:11, height:11 }} /> },
  manual_override:{ c:"#22d3ee", bg:"rgba(34,211,238,0.1)",  label:"Manual Override", icon:<Settings style={{ width:11, height:11 }} /> },
};

const REFLEX_RULES = [
  { id:"reflex-tsh",  trigger:"TSH > 5.0 mIU/L",               adds:"Free T4 + Free T3" },
  { id:"reflex-hba1c",trigger:"Glucose > 200 mg/dL × 2 days",  adds:"HbA1c if not done in 90d" },
  { id:"reflex-trop", trigger:"Troponin > 0.04 ng/mL",         adds:"Repeat troponin at 3h + 6h" },
  { id:"reflex-trgly",trigger:"Triglycerides > 400 mg/dL",     adds:"Direct LDL measurement" },
  { id:"reflex-ua",   trigger:"UA WBC esterase positive",      adds:"Urine culture & sensitivity" },
];

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

function ruleColor(r: RuleResult) {
  return r === "pass" ? "#4ade80" : r === "warn" ? "#fbbf24" : "#f87171";
}

export default function AutoVerifyPage() {
  const [tab, setTab] = useState<"queue"|"rules"|"reflex">("queue");
  const [filter, setFilter] = useState<string>("all");

  const filtered = RESULTS.filter(r => filter === "all" || r.decision === filter);
  const stats = {
    autoReleased: RESULTS.filter(r=>r.decision==="auto_released").length,
    held:         RESULTS.filter(r=>r.decision==="held_review").length,
    rejected:     RESULTS.filter(r=>r.decision==="rejected").length,
    delta:        RESULTS.filter(r=>r.decision==="delta_flag").length,
    releaseRate:  Math.round((RESULTS.filter(r=>r.decision==="auto_released").length / RESULTS.length) * 100),
  };

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Auto-Verification & Reflex Testing</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Westgard rules engine · Delta checks · Reflex testing rules · Auto-release workflow</p>
        </div>
        <button style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", borderRadius:10, padding:"8px 16px", color:"#4ade80", fontSize:12, fontWeight:700, cursor:"pointer" }}>
          <RefreshCw style={{ width:13, height:13 }} /> Refresh Queue
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:18 }}>
        {[
          { l:"Auto-Released", v:stats.autoReleased, c:"#4ade80" },
          { l:"Held for Review", v:stats.held, c:"#fbbf24" },
          { l:"QC Rejected", v:stats.rejected, c:"#f87171" },
          { l:"Delta Flagged", v:stats.delta, c:"#f472b6" },
          { l:"Auto-Release Rate", v:`${stats.releaseRate}%`, c:"#22d3ee" },
        ].map(s => (
          <Card key={s.l} style={{ padding:"12px 16px" }}>
            <p style={{ fontSize:22, fontWeight:800, color:s.c, margin:0 }}>{s.v}</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{s.l}</p>
          </Card>
        ))}
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:16, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        {(["queue","rules","reflex"] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{ padding:"9px 18px", background:"none", border:"none", borderBottom:`2px solid ${tab===t?"#e67e22":"transparent"}`, color:tab===t?"#e67e22":"rgba(255,255,255,0.4)", fontSize:12, fontWeight:tab===t?700:500, cursor:"pointer", textTransform:"capitalize", marginBottom:-1 }}>
            {t === "rules" ? "Westgard Rules" : t === "reflex" ? "Reflex Rules" : "Verification Queue"}
          </button>
        ))}
      </div>

      {tab === "queue" && (
        <>
          <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" }}>
            {["all","auto_released","held_review","rejected","delta_flag"].map(f => (
              <button key={f} onClick={()=>setFilter(f)} style={{ padding:"4px 12px", borderRadius:8, border:`1px solid ${filter===f?"#e67e22":"rgba(255,255,255,0.08)"}`, background:filter===f?"rgba(230,126,34,0.15)":"transparent", color:filter===f?"#e67e22":"rgba(255,255,255,0.4)", fontSize:11, fontWeight:600, cursor:"pointer", textTransform:"capitalize" }}>{f.replace("_"," ")}</button>
            ))}
          </div>
          <Card style={{ padding:0, overflow:"hidden" }}>
            {filtered.map(r => {
              const dm = DECISION_META[r.decision];
              const ruleFailed = r.westgard.some(w => w.result === "fail");
              return (
                <div key={r.id} style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"grid", gridTemplateColumns:"200px 200px 1fr 240px 110px", gap:14, alignItems:"center" }}>
                  <div>
                    <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:0 }}>{r.patient}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>{r.mrn}</p>
                    <p style={{ fontSize:9, color:"rgba(255,255,255,0.3)", margin:"2px 0 0" }}>{r.analyzer}</p>
                  </div>
                  <div>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:0 }}>{r.test}</p>
                    <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
                      <span style={{ fontSize:18, fontWeight:800, color: r.flag==="HH"||r.flag==="LL"?"#f43f5e":r.flag==="H"||r.flag==="L"?"#fbbf24":"#f1f5f9" }}>{r.value}</span>
                      <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{r.unit}</span>
                      {r.flag && <span style={{ fontSize:9, background: r.flag.length===2?"rgba(244,63,94,0.15)":"rgba(251,191,36,0.15)", color: r.flag.length===2?"#f43f5e":"#fbbf24", borderRadius:4, padding:"1px 5px", fontWeight:800 }}>{r.flag}</span>}
                    </div>
                    <p style={{ fontSize:9, color:"rgba(255,255,255,0.3)", margin:"2px 0 0" }}>Ref {r.refLow}–{r.refHigh}</p>
                  </div>
                  <div>
                    <p style={{ fontSize:9, color:"rgba(255,255,255,0.35)", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>Westgard Rules</p>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                      {r.westgard.map(w => (
                        <span key={w.rule} style={{ fontSize:9, background:`${ruleColor(w.result)}15`, color:ruleColor(w.result), borderRadius:5, padding:"2px 7px", fontWeight:700, display:"flex", alignItems:"center", gap:3 }} title={w.detail}>
                          {w.result === "pass" ? "✓" : w.result === "warn" ? "⚠" : "✗"} {w.rule}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    {r.delta && (
                      <div style={{ background:r.delta.flagged?"rgba(244,114,182,0.06)":"rgba(74,222,128,0.04)", border:`1px solid ${r.delta.flagged?"rgba(244,114,182,0.2)":"rgba(74,222,128,0.15)"}`, borderRadius:8, padding:"6px 10px" }}>
                        <p style={{ fontSize:9, color:r.delta.flagged?"#f472b6":"#4ade80", margin:0, fontWeight:700, textTransform:"uppercase" }}>Delta Check</p>
                        <p style={{ fontSize:11, color:"#f1f5f9", margin:"2px 0 0" }}>
                          {r.delta.prev} → {r.delta.curr} ({r.delta.deltaPct.toFixed(1)}% Δ, threshold {r.delta.threshold}%)
                        </p>
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, background:dm.bg, color:dm.c, borderRadius:6, padding:"4px 10px", fontWeight:700 }}>
                      {dm.icon}{dm.label}
                    </span>
                    {r.releasedAt && <p style={{ fontSize:9, color:"rgba(255,255,255,0.3)", margin:"4px 0 0" }}>{r.releasedAt}</p>}
                  </div>
                </div>
              );
            })}
          </Card>
        </>
      )}

      {tab === "rules" && (
        <Card style={{ padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:"0 0 16px" }}>Westgard Multi-Rule QC Engine</h3>
          {RULES_INFO.map(r => (
            <div key={r.code} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", marginBottom:8, background:"rgba(255,255,255,0.02)", borderRadius:10, borderLeft:`3px solid ${r.severity==="reject"?"#f87171":"#fbbf24"}` }}>
              <div>
                <p style={{ fontSize:14, fontWeight:800, color:"#f1f5f9", margin:0, fontFamily:"monospace" }}>{r.code}</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.55)", margin:"3px 0 0" }}>{r.description}</p>
              </div>
              <span style={{ fontSize:10, background:r.severity==="reject"?"rgba(248,113,113,0.15)":"rgba(251,191,36,0.15)", color:r.severity==="reject"?"#f87171":"#fbbf24", borderRadius:5, padding:"3px 10px", fontWeight:800, textTransform:"uppercase" }}>{r.severity}</span>
            </div>
          ))}
        </Card>
      )}

      {tab === "reflex" && (
        <Card style={{ padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:"0 0 16px" }}>Reflex Testing Rules</h3>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:"0 0 16px" }}>When a result meets a trigger, the engine auto-orders the reflex test without manual intervention.</p>
          {REFLEX_RULES.map(r => (
            <div key={r.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 14px", marginBottom:8, background:"rgba(34,211,238,0.04)", border:"1px solid rgba(34,211,238,0.15)", borderRadius:10 }}>
              <Zap style={{ width:14, height:14, color:"#22d3ee", flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0, fontWeight:700 }}>TRIGGER</p>
                <p style={{ fontSize:13, color:"#f1f5f9", margin:"2px 0 0", fontFamily:"monospace" }}>{r.trigger}</p>
              </div>
              <ChevronRight style={{ width:14, height:14, color:"rgba(255,255,255,0.3)" }} />
              <div style={{ flex:1 }}>
                <p style={{ fontSize:11, color:"rgba(74,222,128,0.7)", margin:0, fontWeight:700 }}>AUTO-ORDERS</p>
                <p style={{ fontSize:13, color:"#4ade80", margin:"2px 0 0", fontWeight:600 }}>{r.adds}</p>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
