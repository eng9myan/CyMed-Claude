"use client";
import { useState } from "react";
import { FileText, Plus, RefreshCw, CheckCircle2 } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const JOURNALS = [
  { id:"JE-2026-08410", date:"2026-06-13", desc:"Monthly payroll accrual — June 2026",     debit:18420000, credit:18420000, type:"recurring", status:"posted",   user:"Acc. Reem" },
  { id:"JE-2026-08409", date:"2026-06-13", desc:"Bupa claim batch 0341 — revenue recognition", debit:842000, credit:842000, type:"standard",  status:"posted",   user:"RCM team" },
  { id:"JE-2026-08408", date:"2026-06-13", desc:"Depreciation — June 2026",                debit:680000,   credit:680000,   type:"recurring", status:"posted",   user:"System" },
  { id:"JE-2026-08407", date:"2026-06-12", desc:"Prepayment release — annual insurance",   debit:142000,   credit:142000,   type:"adjustment",status:"posted",   user:"Acc. Reem" },
  { id:"JE-2026-08411", date:"2026-06-13", desc:"Q2 accrual — utility expenses",            debit:84000,    credit:84000,    type:"adjustment",status:"draft",    user:"Acc. Reem" },
  { id:"JE-2026-08412", date:"2026-06-13", desc:"FX reval — USD payable",                   debit:24800,    credit:24800,    type:"standard",  status:"pending",  user:"CFO Hassan" },
];

const TYPE: Record<string,{c:string}> = {
  standard:{c:"#22d3ee"}, recurring:{c:"#a78bfa"}, adjustment:{c:"#fbbf24"}, reversing:{c:"#fb923c"},
};

const STATUS: Record<string,{c:string;bg:string}> = {
  draft:{c:"#94a3b8",bg:"rgba(148,163,184,0.1)"},
  pending:{c:"#fbbf24",bg:"rgba(251,191,36,0.1)"},
  posted:{c:"#4ade80",bg:"rgba(74,222,128,0.1)"},
  reversed:{c:"#f87171",bg:"rgba(248,113,113,0.1)"},
};

export default function JournalsPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Journal Entries</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Manual · Recurring · Reversing · Auto-balanced · Multi-entity · Audit trail</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.3)", color:"#a78bfa", borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><RefreshCw style={{ width:13, height:13 }}/>Run recurring</button>
          <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>New journal</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Posted (MTD)</p><p style={{ fontSize:22, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>1,842</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Draft</p><p style={{ fontSize:22, fontWeight:800, color:"#94a3b8", margin:"4px 0 0" }}>{JOURNALS.filter(j=>j.status==="draft").length}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Pending approval</p><p style={{ fontSize:22, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>{JOURNALS.filter(j=>j.status==="pending").length}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Active recurring</p><p style={{ fontSize:22, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>24</p></Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {["Journal","Date","Description","Type","Debit","Credit","Posted by","Status"].map(h => <th key={h} style={{ textAlign:"left", padding:"10px 14px" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {JOURNALS.map(j => {
              const tm = TYPE[j.type];
              const sm = STATUS[j.status];
              return (
                <tr key={j.id} style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"10px 14px", color:"#22d3ee", fontFamily:"monospace" }}>{j.id}</td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.6)" }}>{j.date}</td>
                  <td style={{ padding:"10px 14px", color:"#f1f5f9" }}>{j.desc}</td>
                  <td style={{ padding:"10px 14px" }}><span style={{ fontSize:10, background:`${tm.c}18`, color:tm.c, borderRadius:5, padding:"2px 8px", fontWeight:700, textTransform:"uppercase" }}>{j.type}</span></td>
                  <td style={{ padding:"10px 14px", color:"#4ade80", fontWeight:600, fontFamily:"monospace" }}>{j.debit.toLocaleString()}</td>
                  <td style={{ padding:"10px 14px", color:"#f87171", fontWeight:600, fontFamily:"monospace" }}>{j.credit.toLocaleString()}</td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.6)" }}>{j.user}</td>
                  <td style={{ padding:"10px 14px" }}><span style={{ fontSize:10, background:sm.bg, color:sm.c, borderRadius:5, padding:"2px 8px", fontWeight:700, textTransform:"uppercase" }}>{j.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
