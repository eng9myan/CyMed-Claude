"use client";
import { Dna, AlertTriangle, CheckCircle2, Pill, Shield } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const PGX = [
  { gene:"CYP2C19", phenotype:"Poor Metabolizer (*2/*2)", impact:"Clopidogrel ineffective", c:"#f43f5e", recommendation:"Use prasugrel or ticagrelor instead" },
  { gene:"CYP2D6",  phenotype:"Ultra-rapid Metabolizer", impact:"Codeine → too fast morphine conversion", c:"#fb923c", recommendation:"Avoid codeine; use morphine directly with care" },
  { gene:"VKORC1",  phenotype:"GA heterozygous",       impact:"Increased warfarin sensitivity", c:"#fbbf24", recommendation:"Start warfarin 3mg, target INR 2.0-2.5" },
  { gene:"TPMT",    phenotype:"Normal Activity (*1/*1)",  impact:"Standard thiopurine dosing", c:"#4ade80", recommendation:"Standard azathioprine dose 2-3 mg/kg" },
  { gene:"HLA-B*5701",phenotype:"Negative",              impact:"Abacavir safe to use", c:"#4ade80", recommendation:"No abacavir hypersensitivity risk" },
  { gene:"DPYD",    phenotype:"Intermediate Activity", impact:"5-FU toxicity risk", c:"#fbbf24", recommendation:"Reduce 5-FU dose by 50% initially" },
];

const FAMILY_RISK = [
  { condition:"BRCA1/2 mutation",      relatives:"Mother (breast cancer Dx 48)", risk:"Hereditary breast/ovarian cancer", action:"Annual MRI, consider risk-reducing surgery" },
  { condition:"Lynch Syndrome (MLH1)", relatives:"Father (colon cancer Dx 52)",  risk:"Colorectal, endometrial cancer",  action:"Colonoscopy q1-2y starting age 25" },
];

export default function GenomicsPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:10 }}><Dna style={{ width:24, height:24, color:"#22d3ee" }}/>Genomics & Pharmacogenomics</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>PGx panel · Hereditary cancer risk · Variant interpretation · Drug-gene interaction alerts in CPOE</p>
      </div>

      <Card style={{ padding:14, marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <Dna style={{ width:20, height:20, color:"#22d3ee" }} />
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>Ahmad Al-Rashid — Whole Exome Sequencing (WES)</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:"3px 0 0" }}>Sample: 2026-03-22 · Coverage 98.4× · Pipeline: GATK 4.5 + ClinVar 2026-05</p>
          </div>
        </div>
      </Card>

      <h3 style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.7)", margin:"0 0 12px", textTransform:"uppercase", letterSpacing:"0.07em", display:"flex", alignItems:"center", gap:7 }}><Pill style={{ width:13, height:13 }}/>Pharmacogenomic Profile (PGx)</h3>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:18 }}>
        {PGX.map(p => (
          <Card key={p.gene} style={{ padding:14, borderLeft:`3px solid ${p.c}` }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
              <p style={{ fontSize:13, fontWeight:800, color:"#f1f5f9", margin:0, fontFamily:"monospace" }}>{p.gene}</p>
              <span style={{ fontSize:9, background:`${p.c}18`, color:p.c, borderRadius:5, padding:"2px 8px", fontWeight:700 }}>{p.phenotype}</span>
            </div>
            <p style={{ fontSize:11, color:p.c, margin:"0 0 6px", fontWeight:600 }}>⚡ {p.impact}</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.6)", margin:0 }}>→ {p.recommendation}</p>
          </Card>
        ))}
      </div>

      <h3 style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.7)", margin:"0 0 12px", textTransform:"uppercase", letterSpacing:"0.07em", display:"flex", alignItems:"center", gap:7 }}><Shield style={{ width:13, height:13 }}/>Hereditary Cancer Risk</h3>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
        {FAMILY_RISK.map(r => (
          <Card key={r.condition} style={{ padding:14, background:"rgba(244,63,94,0.04)", border:"1px solid rgba(244,63,94,0.2)" }}>
            <p style={{ fontSize:13, fontWeight:800, color:"#f43f5e", margin:"0 0 4px" }}>⚠ {r.condition}</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.55)", margin:"0 0 6px" }}>Family history: {r.relatives}</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.7)", margin:"0 0 4px" }}><strong>Risk:</strong> {r.risk}</p>
            <p style={{ fontSize:11, color:"#4ade80", margin:0 }}>→ {r.action}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
