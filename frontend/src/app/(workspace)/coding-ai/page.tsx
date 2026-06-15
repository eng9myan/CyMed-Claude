"use client";
import { FileText, Brain, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const CASES = [
  { id:"CASE-26841", patient:"Ahmad Al-Rashid", encounter:"Inpatient — 5 days", suggested:[
    { code:"I21.4", desc:"Non-ST elevation MI (NSTEMI)", confidence:96, primary:true },
    { code:"I10",   desc:"Essential HTN", confidence:94 },
    { code:"E11.9", desc:"T2DM without complications", confidence:88 },
    { code:"Z95.1", desc:"Presence of CABG", confidence:92 },
    { code:"E78.5", desc:"Hyperlipidaemia, unspecified", confidence:84 },
  ], drgSuggested:"DRG 246 — Percutaneous Cardiovascular Procedures", reimbursement:"SAR 32,400" },
  { id:"CASE-26842", patient:"Fatima Al-Zahra", encounter:"Outpatient — visit", suggested:[
    { code:"E11.65",desc:"T2DM with hyperglycaemia", confidence:97, primary:true },
    { code:"E11.319",desc:"T2DM with mild non-proliferative retinopathy", confidence:78 },
    { code:"Z79.4", desc:"Long-term insulin use", confidence:92 },
  ], drgSuggested:"E&M 99214 — Established Patient", reimbursement:"SAR 280" },
  { id:"CASE-26843", patient:"Khalid Al-Dosari", encounter:"Outpatient surgery", suggested:[
    { code:"M17.11",desc:"Unilateral primary OA right knee", confidence:99, primary:true },
    { code:"Z96.651",desc:"Presence of right knee prosthesis", confidence:96 },
    { code:"M25.561",desc:"Right knee pain", confidence:88 },
  ], drgSuggested:"DRG 470 — Major Joint Replacement", reimbursement:"SAR 38,200" },
];

export default function CodingAIPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:10 }}><Brain style={{ width:24, height:24, color:"#a855f7" }}/>Clinical Coding AI</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Auto-suggest ICD-10/11 · DRG assignment · CPT capture · Documentation review · Coder workbench</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Cases This Week</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>1,840</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>AI-Coded</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>92%</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Avg Time / Case</p><p style={{ fontSize:24, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>4.2 min</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>was 18 min</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Revenue Captured</p><p style={{ fontSize:24, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>+12%</p></Card>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {CASES.map(c => (
          <Card key={c.id} style={{ padding:18 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <div>
                <p style={{ fontSize:11, fontFamily:"monospace", color:"#22d3ee", margin:0 }}>{c.id}</p>
                <p style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:"3px 0 0" }}>{c.patient} — {c.encounter}</p>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"7px 14px", fontSize:11, color:"rgba(255,255,255,0.5)", cursor:"pointer" }}>Review Notes</button>
                <button style={{ background:"#4ade80", color:"white", border:"none", borderRadius:8, padding:"7px 14px", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}><CheckCircle2 style={{ width:12, height:12 }}/>Accept All & Submit</button>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:14 }}>
              <div>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>AI-Suggested ICD-10 Codes</p>
                {c.suggested.map(s => (
                  <div key={s.code} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 14px", marginBottom:5, background:s.primary?"rgba(230,126,34,0.06)":"rgba(255,255,255,0.02)", border:`1px solid ${s.primary?"rgba(230,126,34,0.2)":"rgba(255,255,255,0.05)"}`, borderRadius:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:12, fontFamily:"monospace", fontWeight:800, color:s.primary?"#e67e22":"#22d3ee" }}>{s.code}</span>
                      <span style={{ fontSize:12, color:"#f1f5f9" }}>{s.desc}</span>
                      {s.primary && <span style={{ fontSize:9, background:"rgba(230,126,34,0.15)", color:"#e67e22", borderRadius:4, padding:"1px 6px", fontWeight:700 }}>PRIMARY</span>}
                    </div>
                    <span style={{ fontSize:11, color: s.confidence>=90?"#4ade80":s.confidence>=80?"#fbbf24":"#fb923c", fontWeight:700 }}>{s.confidence}%</span>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>DRG / Reimbursement</p>
                <div style={{ padding:"12px 14px", background:"rgba(74,222,128,0.05)", border:"1px solid rgba(74,222,128,0.2)", borderRadius:10 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:"#4ade80", margin:0 }}>{c.drgSuggested}</p>
                  <p style={{ fontSize:20, fontWeight:800, color:"#f1f5f9", margin:"6px 0 0" }}>{c.reimbursement}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"3px 0 0" }}>Estimated reimbursement</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
