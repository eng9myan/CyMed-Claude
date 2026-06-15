"use client";
import { Users, DollarSign, Package, TrendingUp, AlertCircle, FileText, ShoppingCart, Briefcase } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const KPIS = [
  { l:"Total Employees",      v:"4,240",       sub:"+38 this month",   c:"#a78bfa", icon:Users },
  { l:"Monthly Payroll",       v:"SAR 18.4M",  sub:"due Jun 25",       c:"#f472b6", icon:DollarSign },
  { l:"Revenue YTD",            v:"SAR 142M",   sub:"+12% vs target",   c:"#4ade80", icon:TrendingUp },
  { l:"Open Purchase Orders",   v:"284",        sub:"SAR 8.2M",         c:"#fbbf24", icon:ShoppingCart },
  { l:"Inventory Value",        v:"SAR 38M",    sub:"18,400 SKUs",      c:"#22d3ee", icon:Package },
  { l:"Open AR (30d)",          v:"SAR 22.4M",  sub:"avg 28 days",      c:"#fb923c", icon:FileText },
  { l:"Open AP",                v:"SAR 14.2M",  sub:"142 vendors",      c:"#f87171", icon:Briefcase },
  { l:"Open Helpdesk",         v:"42",          sub:"8 P1",             c:"#a855f7", icon:AlertCircle },
];

export default function ERPDashboard() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>ERP Command Center</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>HR · Finance · Procurement · Sales · CRM · Assets · Helpdesk</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
        {KPIS.map(k => (
          <Card key={k.l} style={{ padding:16 }}>
            <k.icon style={{ width:18, height:18, color:k.c, marginBottom:8 }} />
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>{k.l}</p>
            <p style={{ fontSize:22, fontWeight:800, color:k.c, margin:"4px 0 2px" }}>{k.v}</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{k.sub}</p>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Cash Flow This Month</h3>
          {[
            { label:"Revenue collected",     v:24400000, c:"#4ade80" },
            { label:"Operating expenses",    v:-18200000,c:"#f87171" },
            { label:"Capex investments",     v:-3400000, c:"#fb923c" },
            { label:"Net cash generated",    v:2800000,  c:"#22d3ee" },
          ].map(r => (
            <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>{r.label}</span>
              <span style={{ fontSize:13, color:r.c, fontWeight:700 }}>SAR {(r.v/1000000).toFixed(1)}M</span>
            </div>
          ))}
        </Card>

        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Top Action Items</h3>
          {[
            { p:"P1", t:"Payroll run due Jun 25 — review pending",       a:"HR" },
            { p:"P1", t:"3 vendor invoices over 60 days unpaid",          a:"Finance" },
            { p:"P2", t:"Annual asset depreciation review needed",        a:"Assets" },
            { p:"P2", t:"Q2 financial close — 4 days to deadline",        a:"Finance" },
            { p:"P3", t:"License renewal: 8 staff members",                a:"HR" },
          ].map((i,idx) => (
            <div key={idx} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize:10, background:i.p==="P1"?"rgba(244,63,94,0.15)":i.p==="P2"?"rgba(251,191,36,0.15)":"rgba(74,222,128,0.15)", color:i.p==="P1"?"#f43f5e":i.p==="P2"?"#fbbf24":"#4ade80", borderRadius:5, padding:"2px 8px", fontWeight:700 }}>{i.p}</span>
              <span style={{ fontSize:12, color:"#f1f5f9", flex:1 }}>{i.t}</span>
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{i.a}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
