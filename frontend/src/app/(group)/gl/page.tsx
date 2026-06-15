"use client";
import { useState } from "react";
import { DollarSign, TrendingUp, Building, FileText } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const FACILITIES = [
  { id:"F1", name:"CyMed General Hospital",  revenue:42400000, costs:32100000, margin:10300000, budget:39000000 },
  { id:"F2", name:"CyMed Specialty Center",  revenue:18900000, costs:14200000, margin:4700000,  budget:17500000 },
  { id:"F3", name:"Al Nahda Polyclinic",     revenue:8400000,  costs:6800000,  margin:1600000,  budget:7800000 },
  { id:"F4", name:"Eastern Lab",             revenue:5200000,  costs:3400000,  margin:1800000,  budget:5000000 },
  { id:"F5", name:"CyMed Pharmacy Chain",    revenue:12400000, costs:8900000,  margin:3500000,  budget:11800000 },
];

const SERVICE_LINES = [
  { name:"Inpatient — Cardiology",  revenue:8400000, profitMargin:18 },
  { name:"Inpatient — Surgery",     revenue:12400000, profitMargin:22 },
  { name:"Outpatient — Primary",    revenue:6200000, profitMargin:8 },
  { name:"ED",                       revenue:4400000, profitMargin:5 },
  { name:"Diagnostics — Imaging",    revenue:7200000, profitMargin:28 },
  { name:"Diagnostics — Lab",        revenue:5200000, profitMargin:34 },
  { name:"Pharmacy",                 revenue:12400000, profitMargin:24 },
];

export default function GroupGLPage() {
  const totalRev = FACILITIES.reduce((s,f)=>s+f.revenue,0);
  const totalCosts = FACILITIES.reduce((s,f)=>s+f.costs,0);
  const totalMargin = totalRev - totalCosts;
  const marginPct = (totalMargin/totalRev*100).toFixed(1);

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Consolidated General Ledger</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Group P&L · Intercompany eliminations · Service line profitability · Budget vs actual</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Total Revenue (YTD)</p><p style={{ fontSize:22, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>SAR {(totalRev/1000000).toFixed(1)}M</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Operating Costs</p><p style={{ fontSize:22, fontWeight:800, color:"#fb923c", margin:"4px 0 0" }}>SAR {(totalCosts/1000000).toFixed(1)}M</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Net Margin</p><p style={{ fontSize:22, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>SAR {(totalMargin/1000000).toFixed(1)}M</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Margin %</p><p style={{ fontSize:22, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>{marginPct}%</p></Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>Facility P&L Performance</h3>
          </div>
          {FACILITIES.map(f => {
            const vBudget = ((f.revenue - f.budget) / f.budget * 100).toFixed(1);
            const onBudget = parseFloat(vBudget) >= 0;
            return (
              <div key={f.id} style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:0 }}>{f.name}</p>
                  <span style={{ fontSize:10, background:onBudget?"rgba(74,222,128,0.12)":"rgba(248,113,113,0.12)", color:onBudget?"#4ade80":"#f87171", borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{onBudget?"+":""}{vBudget}% vs budget</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                  <div style={{ background:"rgba(34,211,238,0.04)", borderRadius:8, padding:"6px 10px" }}><p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>Revenue</p><p style={{ fontSize:13, color:"#22d3ee", margin:0, fontWeight:700 }}>{(f.revenue/1000000).toFixed(1)}M</p></div>
                  <div style={{ background:"rgba(251,146,60,0.04)", borderRadius:8, padding:"6px 10px" }}><p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>Costs</p><p style={{ fontSize:13, color:"#fb923c", margin:0, fontWeight:700 }}>{(f.costs/1000000).toFixed(1)}M</p></div>
                  <div style={{ background:"rgba(74,222,128,0.04)", borderRadius:8, padding:"6px 10px" }}><p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>Margin</p><p style={{ fontSize:13, color:"#4ade80", margin:0, fontWeight:700 }}>{(f.margin/1000000).toFixed(1)}M</p></div>
                </div>
              </div>
            );
          })}
        </Card>

        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Service Line Profitability</h3>
          {SERVICE_LINES.sort((a,b)=>b.profitMargin-a.profitMargin).map(s => (
            <div key={s.name} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>{s.name}</span>
                <span style={{ fontSize:11, color:"#f1f5f9", fontWeight:600 }}>SAR {(s.revenue/1000000).toFixed(1)}M · <span style={{ color: s.profitMargin>=20?"#4ade80":s.profitMargin>=10?"#fbbf24":"#f87171", fontWeight:700 }}>{s.profitMargin}% margin</span></span>
              </div>
              <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden" }}>
                <div style={{ height:"100%", background:s.profitMargin>=20?"#4ade80":s.profitMargin>=10?"#fbbf24":"#f87171", width:`${(s.profitMargin/40)*100}%` }} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
