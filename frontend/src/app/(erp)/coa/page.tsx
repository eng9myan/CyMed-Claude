"use client";
import { useState } from "react";
import { ChevronRight, ChevronDown, Plus } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

type Acct = { code:string; name:string; type:"asset"|"liability"|"equity"|"revenue"|"expense"; balance:number; children?:Acct[] };

const COA: Acct[] = [
  { code:"1000", name:"ASSETS", type:"asset", balance:284000000, children:[
    { code:"1100", name:"Current Assets", type:"asset", balance:124000000, children:[
      { code:"1101", name:"Cash and Cash Equivalents", type:"asset", balance:42000000 },
      { code:"1102", name:"Petty Cash", type:"asset", balance:240000 },
      { code:"1103", name:"Accounts Receivable", type:"asset", balance:48000000 },
      { code:"1104", name:"Inventory — Pharmacy", type:"asset", balance:18000000 },
      { code:"1105", name:"Inventory — Medical Supplies", type:"asset", balance:14000000 },
      { code:"1106", name:"Prepayments", type:"asset", balance:1760000 },
    ]},
    { code:"1200", name:"Fixed Assets", type:"asset", balance:160000000, children:[
      { code:"1201", name:"Buildings", type:"asset", balance:84000000 },
      { code:"1202", name:"Medical Equipment", type:"asset", balance:48000000 },
      { code:"1203", name:"IT Equipment", type:"asset", balance:14000000 },
      { code:"1204", name:"Vehicles (Ambulances)", type:"asset", balance:18000000 },
      { code:"1209", name:"Accumulated Depreciation", type:"asset", balance:-4000000 },
    ]},
  ]},
  { code:"2000", name:"LIABILITIES", type:"liability", balance:84000000, children:[
    { code:"2100", name:"Current Liabilities", type:"liability", balance:38000000, children:[
      { code:"2101", name:"Accounts Payable", type:"liability", balance:18000000 },
      { code:"2102", name:"Accrued Salaries", type:"liability", balance:8000000 },
      { code:"2103", name:"GOSI Payable", type:"liability", balance:1840000 },
      { code:"2104", name:"VAT Payable", type:"liability", balance:4200000 },
      { code:"2105", name:"Short-term Loans", type:"liability", balance:6000000 },
    ]},
    { code:"2200", name:"Long-term Liabilities", type:"liability", balance:46000000 },
  ]},
  { code:"3000", name:"EQUITY", type:"equity", balance:200000000 },
  { code:"4000", name:"REVENUE", type:"revenue", balance:142000000 },
  { code:"5000", name:"EXPENSES", type:"expense", balance:118000000 },
];

const TYPE_C: Record<string,string> = { asset:"#4ade80", liability:"#f87171", equity:"#a78bfa", revenue:"#22d3ee", expense:"#fb923c" };

export default function CoAPage() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["1000","1100","2000","2100"]));
  function toggle(code:string){ setExpanded(prev => { const n = new Set(prev); n.has(code) ? n.delete(code) : n.add(code); return n; }); }

  function render(a: Acct, depth=0): React.ReactNode {
    const hasChildren = a.children && a.children.length > 0;
    const isOpen = expanded.has(a.code);
    return (
      <div key={a.code}>
        <div onClick={()=>hasChildren && toggle(a.code)} style={{ display:"grid", gridTemplateColumns:"100px 1fr 120px 160px", gap:14, alignItems:"center", padding:"10px 14px", paddingLeft:14+depth*22, borderTop:"1px solid rgba(255,255,255,0.04)", cursor:hasChildren?"pointer":"default", background:depth===0?"rgba(230,126,34,0.04)":"transparent" }}>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            {hasChildren ? (isOpen ? <ChevronDown style={{ width:13, height:13, color:"rgba(255,255,255,0.5)" }}/> : <ChevronRight style={{ width:13, height:13, color:"rgba(255,255,255,0.5)" }}/>) : <span style={{ width:13 }}/>}
            <span style={{ fontSize:12, fontFamily:"monospace", color:depth===0?"#e67e22":"#22d3ee", fontWeight:depth===0?800:600 }}>{a.code}</span>
          </div>
          <span style={{ fontSize:12, color:"#f1f5f9", fontWeight:depth===0?700:500 }}>{a.name}</span>
          <span style={{ fontSize:10, background:`${TYPE_C[a.type]}18`, color:TYPE_C[a.type], borderRadius:5, padding:"2px 8px", fontWeight:700, textAlign:"center", textTransform:"uppercase" }}>{a.type}</span>
          <span style={{ fontSize:12, color: a.balance>=0?"#f1f5f9":"#f87171", fontWeight:700, textAlign:"right", fontFamily:"monospace" }}>SAR {a.balance.toLocaleString()}</span>
        </div>
        {hasChildren && isOpen && a.children!.map(c => render(c, depth+1))}
      </div>
    );
  }

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Chart of Accounts</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Hierarchical CoA · Multi-entity · Cost centres · IFRS compliant</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>Add Account</button>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"12px 14px", background:"rgba(255,255,255,0.02)", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"grid", gridTemplateColumns:"100px 1fr 120px 160px", gap:14, fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>
          <span>Code</span><span>Account Name</span><span>Type</span><span style={{ textAlign:"right" }}>Balance</span>
        </div>
        {COA.map(a => render(a))}
      </Card>
    </div>
  );
}
