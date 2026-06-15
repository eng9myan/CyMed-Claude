"use client";
import { FileText, Send, Plus, Download, Repeat } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const INVOICES = [
  { id:"INV-2026-08471", customer:"Bupa Arabia",        date:"2026-06-13", amount:8420,   vat:1098, total:9518,   due:"2026-07-13", status:"sent",      type:"standard",  fatoora:"Q1✓" },
  { id:"INV-2026-08470", customer:"Tawuniya",           date:"2026-06-13", amount:14200,  vat:1854, total:16054,  due:"2026-07-13", status:"sent",      type:"standard",  fatoora:"Q1✓" },
  { id:"INV-2026-08469", customer:"Riyadh Hospital Group", date:"2026-06-12", amount:124000, vat:16200, total:140200, due:"2026-08-12", status:"paid",   type:"standard",  fatoora:"Q2✓" },
  { id:"INV-2026-08468", customer:"Bupa Arabia",        date:"2026-06-01", amount:8420,   vat:1098, total:9518,   due:"2026-07-01", status:"recurring", type:"subscription", fatoora:"Q1✓" },
  { id:"INV-2026-08467", customer:"Self-pay — patient cohort", date:"2026-06-11", amount:18400, vat:2400, total:20800, due:"2026-07-11", status:"sent", type:"standard", fatoora:"Q1✓" },
  { id:"INV-2026-08466", customer:"NHS England — Reciprocal", date:"2026-06-08", amount:42800, vat:0, total:42800, due:"2026-09-08", status:"overdue", type:"standard", fatoora:"N/A" },
  { id:"INV-2026-08465", customer:"Credit note — Bupa duplicate", date:"2026-06-05", amount:-2400, vat:-312, total:-2712, due:"—", status:"sent", type:"credit_note", fatoora:"Q1✓" },
];

const STATUS: Record<string,{c:string;bg:string}> = {
  draft:{c:"#94a3b8",bg:"rgba(148,163,184,0.1)"},
  sent:{c:"#22d3ee",bg:"rgba(34,211,238,0.1)"},
  paid:{c:"#4ade80",bg:"rgba(74,222,128,0.1)"},
  overdue:{c:"#f87171",bg:"rgba(248,113,113,0.1)"},
  recurring:{c:"#a78bfa",bg:"rgba(167,139,250,0.1)"},
};

export default function SalesPage() {
  const total = INVOICES.reduce((s,i)=>s+i.total,0);
  const paid = INVOICES.filter(i=>i.status==="paid").reduce((s,i)=>s+i.total,0);
  const overdue = INVOICES.filter(i=>i.status==="overdue").reduce((s,i)=>s+i.total,0);

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Sales Invoices</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>VAT 15% · ZATCA FATOORA phase 2 compliant · Recurring · Multi-currency · Credit notes</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", color:"#4ade80", borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><Repeat style={{ width:13, height:13 }}/>Run recurring</button>
          <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>New invoice</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Invoiced (MTD)</p><p style={{ fontSize:22, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>SAR {(total/1000).toFixed(0)}K</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Paid</p><p style={{ fontSize:22, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>SAR {(paid/1000).toFixed(0)}K</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Overdue</p><p style={{ fontSize:22, fontWeight:800, color:"#f87171", margin:"4px 0 0" }}>SAR {(overdue/1000).toFixed(0)}K</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>FATOORA queue</p><p style={{ fontSize:22, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>0</p></Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {["Invoice","Customer","Date","Amount","VAT","Total","Due","FATOORA","Status"].map(h => <th key={h} style={{ textAlign:"left", padding:"10px 14px" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {INVOICES.map(i => {
              const sm = STATUS[i.status];
              return (
                <tr key={i.id} style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"10px 14px", color:"#22d3ee", fontFamily:"monospace" }}>{i.id}</td>
                  <td style={{ padding:"10px 14px", color:"#f1f5f9", fontWeight:600 }}>{i.customer}</td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.6)" }}>{i.date}</td>
                  <td style={{ padding:"10px 14px", color:"#f1f5f9", fontFamily:"monospace" }}>SAR {i.amount.toLocaleString()}</td>
                  <td style={{ padding:"10px 14px", color:"#fbbf24", fontFamily:"monospace" }}>SAR {i.vat.toLocaleString()}</td>
                  <td style={{ padding:"10px 14px", color:i.total>=0?"#4ade80":"#f87171", fontWeight:700, fontFamily:"monospace" }}>SAR {i.total.toLocaleString()}</td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.5)" }}>{i.due}</td>
                  <td style={{ padding:"10px 14px" }}><span style={{ fontSize:10, background: i.fatoora.includes("✓")?"rgba(74,222,128,0.12)":"rgba(148,163,184,0.1)", color: i.fatoora.includes("✓")?"#4ade80":"#94a3b8", borderRadius:5, padding:"2px 8px", fontWeight:700 }}>{i.fatoora}</span></td>
                  <td style={{ padding:"10px 14px" }}><span style={{ fontSize:10, background:sm.bg, color:sm.c, borderRadius:5, padding:"2px 8px", fontWeight:700, textTransform:"uppercase" }}>{i.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
