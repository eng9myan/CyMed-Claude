"use client";
import { useState } from "react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const PL_LINES = [
  { section:"REVENUE", items:[
    { name:"Patient Services Revenue",    actual:108000000, budget:100000000 },
    { name:"Pharmacy Sales",              actual:18400000,  budget:18000000 },
    { name:"Laboratory Services",          actual:8200000,   budget:7500000 },
    { name:"Imaging Services",             actual:7400000,   budget:7000000 },
    { name:"Other Income",                  actual:1200000,   budget:1000000 },
  ]},
  { section:"DIRECT COSTS", items:[
    { name:"Medical Supplies & Drugs",   actual:-42000000, budget:-40000000 },
    { name:"Clinical Salaries",           actual:-32000000, budget:-31000000 },
    { name:"Lab & Imaging Consumables",  actual:-8400000,  budget:-8000000 },
  ]},
  { section:"OPERATING EXPENSES", items:[
    { name:"Administrative Salaries",     actual:-12000000, budget:-12000000 },
    { name:"Facility & Utilities",         actual:-8400000,  budget:-8200000 },
    { name:"IT & Software",                actual:-3200000,  budget:-3000000 },
    { name:"Marketing & Sales",            actual:-1800000,  budget:-2000000 },
    { name:"Insurance & Compliance",       actual:-2400000,  budget:-2400000 },
    { name:"Depreciation & Amortization",  actual:-4800000,  budget:-4800000 },
  ]},
];

const BS_ASSETS = [
  { name:"Cash and Equivalents",       v:42000000 },
  { name:"Accounts Receivable",         v:48000000 },
  { name:"Inventory",                    v:32000000 },
  { name:"Prepayments",                  v:1760000 },
  { name:"Property, Plant & Equipment",  v:160000000 },
  { name:"Less: Accumulated Depreciation", v:-4000000 },
];

const BS_LIAB = [
  { name:"Accounts Payable",             v:18000000 },
  { name:"Accrued Salaries",              v:8000000 },
  { name:"Statutory Liabilities (GOSI, VAT)", v:6040000 },
  { name:"Short-term Loans",              v:6000000 },
  { name:"Long-term Loans",               v:46000000 },
];

const BS_EQUITY = [
  { name:"Share Capital",                v:120000000 },
  { name:"Retained Earnings",             v:80000000 },
];

export default function FinancialsPage() {
  const [tab, setTab] = useState<"pl"|"bs">("pl");

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Financial Statements</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>P&L · Balance Sheet · Cash Flow · IFRS-compliant · Multi-period · Period-end close</p>
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:16, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        {(["pl","bs"] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{ padding:"9px 18px", background:"none", border:"none", borderBottom:`2px solid ${tab===t?"#e67e22":"transparent"}`, color:tab===t?"#e67e22":"rgba(255,255,255,0.4)", fontSize:12, fontWeight:tab===t?700:500, cursor:"pointer", marginBottom:-1 }}>{t === "pl" ? "Profit & Loss" : "Balance Sheet"}</button>
        ))}
      </div>

      {tab === "pl" ? (
        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(230,126,34,0.04)" }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>Profit & Loss — YTD as of June 2026</h3>
          </div>
          {PL_LINES.map(section => {
            const sectionTotal = section.items.reduce((s,i)=>s+i.actual,0);
            const sectionBudget = section.items.reduce((s,i)=>s+i.budget,0);
            return (
              <div key={section.section}>
                <div style={{ padding:"10px 18px", background:"rgba(255,255,255,0.04)", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ fontSize:11, fontWeight:800, color:"#e67e22", margin:0, letterSpacing:"0.07em" }}>{section.section}</p>
                </div>
                {section.items.map(it => (
                  <div key={it.name} style={{ padding:"8px 18px", display:"grid", gridTemplateColumns:"1fr 180px 180px 120px", gap:14, borderTop:"1px solid rgba(255,255,255,0.03)", alignItems:"center" }}>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>{it.name}</span>
                    <span style={{ fontSize:12, color:it.actual>=0?"#f1f5f9":"#f87171", fontWeight:600, textAlign:"right", fontFamily:"monospace" }}>{it.actual.toLocaleString()}</span>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textAlign:"right", fontFamily:"monospace" }}>budget {it.budget.toLocaleString()}</span>
                    <span style={{ fontSize:11, color: (it.actual/it.budget) >= 1 ? "#4ade80" : "#fbbf24", textAlign:"right", fontWeight:700 }}>{((it.actual/it.budget)*100 - 100).toFixed(1)}%</span>
                  </div>
                ))}
                <div style={{ padding:"10px 18px", display:"grid", gridTemplateColumns:"1fr 180px 180px 120px", gap:14, borderTop:"1px solid rgba(230,126,34,0.2)", background:"rgba(230,126,34,0.04)", alignItems:"center" }}>
                  <span style={{ fontSize:13, fontWeight:800, color:"#e67e22" }}>Total {section.section}</span>
                  <span style={{ fontSize:14, fontWeight:800, color:sectionTotal>=0?"#4ade80":"#f87171", textAlign:"right", fontFamily:"monospace" }}>{sectionTotal.toLocaleString()}</span>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)", textAlign:"right", fontFamily:"monospace" }}>{sectionBudget.toLocaleString()}</span>
                  <span/>
                </div>
              </div>
            );
          })}
          <div style={{ padding:"16px 18px", display:"grid", gridTemplateColumns:"1fr 180px 180px 120px", gap:14, borderTop:"3px solid #e67e22", background:"rgba(230,126,34,0.08)", alignItems:"center" }}>
            <span style={{ fontSize:15, fontWeight:900, color:"#e67e22" }}>NET INCOME</span>
            <span style={{ fontSize:18, fontWeight:900, color:"#4ade80", textAlign:"right", fontFamily:"monospace" }}>{(PL_LINES.flatMap(s=>s.items).reduce((s,i)=>s+i.actual,0)).toLocaleString()}</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)", textAlign:"right", fontFamily:"monospace" }}>{(PL_LINES.flatMap(s=>s.items).reduce((s,i)=>s+i.budget,0)).toLocaleString()}</span>
            <span/>
          </div>
        </Card>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Card style={{ padding:0, overflow:"hidden" }}>
            <div style={{ padding:"12px 18px", background:"rgba(74,222,128,0.06)" }}>
              <p style={{ fontSize:11, fontWeight:800, color:"#4ade80", margin:0, letterSpacing:"0.07em" }}>ASSETS</p>
            </div>
            {BS_ASSETS.map(a => (
              <div key={a.name} style={{ padding:"9px 18px", display:"flex", justifyContent:"space-between", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>{a.name}</span>
                <span style={{ fontSize:12, color: a.v>=0?"#f1f5f9":"#f87171", fontWeight:600, fontFamily:"monospace" }}>{a.v.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ padding:"12px 18px", display:"flex", justifyContent:"space-between", borderTop:"2px solid #4ade80", background:"rgba(74,222,128,0.06)" }}>
              <span style={{ fontSize:13, fontWeight:800, color:"#4ade80" }}>TOTAL ASSETS</span>
              <span style={{ fontSize:14, fontWeight:800, color:"#4ade80", fontFamily:"monospace" }}>{BS_ASSETS.reduce((s,a)=>s+a.v,0).toLocaleString()}</span>
            </div>
          </Card>
          <Card style={{ padding:0, overflow:"hidden" }}>
            <div style={{ padding:"12px 18px", background:"rgba(248,113,113,0.06)" }}>
              <p style={{ fontSize:11, fontWeight:800, color:"#f87171", margin:0, letterSpacing:"0.07em" }}>LIABILITIES</p>
            </div>
            {BS_LIAB.map(l => (
              <div key={l.name} style={{ padding:"9px 18px", display:"flex", justifyContent:"space-between", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>{l.name}</span>
                <span style={{ fontSize:12, color:"#f87171", fontWeight:600, fontFamily:"monospace" }}>{l.v.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ padding:"12px 18px", background:"rgba(167,139,250,0.06)" }}>
              <p style={{ fontSize:11, fontWeight:800, color:"#a78bfa", margin:0, letterSpacing:"0.07em" }}>EQUITY</p>
            </div>
            {BS_EQUITY.map(e => (
              <div key={e.name} style={{ padding:"9px 18px", display:"flex", justifyContent:"space-between", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>{e.name}</span>
                <span style={{ fontSize:12, color:"#a78bfa", fontWeight:600, fontFamily:"monospace" }}>{e.v.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ padding:"12px 18px", display:"flex", justifyContent:"space-between", borderTop:"2px solid #a78bfa", background:"rgba(167,139,250,0.06)" }}>
              <span style={{ fontSize:13, fontWeight:800, color:"#a78bfa" }}>TOTAL LIAB + EQUITY</span>
              <span style={{ fontSize:14, fontWeight:800, color:"#a78bfa", fontFamily:"monospace" }}>{(BS_LIAB.reduce((s,l)=>s+l.v,0) + BS_EQUITY.reduce((s,e)=>s+e.v,0)).toLocaleString()}</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
