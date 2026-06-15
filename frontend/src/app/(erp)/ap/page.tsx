"use client";
import { CheckCircle2, Clock, AlertTriangle, Plus, Send } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const BILLS = [
  { id:"AP-2026-1841", vendor:"MedSupply Arabia",   amount:42400, due:"2026-06-22", po:"PO-08471", match:"3way", status:"approved", days:9 },
  { id:"AP-2026-1842", vendor:"Sanofi Aventis",      amount:18400, due:"2026-06-18", po:"PO-08440", match:"3way", status:"approved", days:5 },
  { id:"AP-2026-1843", vendor:"GE Healthcare",      amount:284000,due:"2026-06-30", po:"PO-08423", match:"2way", status:"pending_match", days:17 },
  { id:"AP-2026-1844", vendor:"Carestream Imaging",  amount:14200, due:"2026-06-14", po:"PO-08401", match:"3way", status:"approved", days:1 },
  { id:"AP-2026-1845", vendor:"Roche Diagnostics",   amount:96400, due:"2026-05-30", po:"PO-08382", match:"3way", status:"overdue", days:-14 },
  { id:"AP-2026-1846", vendor:"BD Medical",           amount:32800, due:"2026-06-25", po:"—",         match:"none", status:"pending_approval", days:12 },
];

const STATUS_META: Record<string,{c:string;bg:string}> = {
  approved:{c:"#4ade80",bg:"rgba(74,222,128,0.1)"},
  pending_match:{c:"#fbbf24",bg:"rgba(251,191,36,0.1)"},
  pending_approval:{c:"#22d3ee",bg:"rgba(34,211,238,0.1)"},
  overdue:{c:"#f87171",bg:"rgba(248,113,113,0.1)"},
};

export default function APPage() {
  const total = BILLS.reduce((s,b)=>s+b.amount,0);
  const overdue = BILLS.filter(b=>b.status==="overdue").reduce((s,b)=>s+b.amount,0);

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Accounts Payable</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Vendor bills · 3-way PO match · Approval workflow · Payment runs · Early payment discounts</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", color:"#4ade80", borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Send style={{ width:14, height:14 }}/>Run Payment Batch</button>
          <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>New Bill</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Total Open AP</p><p style={{ fontSize:24, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>SAR {(total/1000).toFixed(0)}K</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Overdue</p><p style={{ fontSize:24, fontWeight:800, color:"#f87171", margin:"4px 0 0" }}>SAR {(overdue/1000).toFixed(0)}K</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Awaiting Approval</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>{BILLS.filter(b=>b.status==="pending_approval").length}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Active Vendors</p><p style={{ fontSize:24, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>142</p></Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {["Bill #","Vendor","PO Ref","Match","Amount","Due Date","Status","Action"].map(h => <th key={h} style={{ textAlign:"left", padding:"12px 14px" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {BILLS.map(b => {
              const sm = STATUS_META[b.status];
              return (
                <tr key={b.id} style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"12px 14px", color:"#22d3ee", fontFamily:"monospace" }}>{b.id}</td>
                  <td style={{ padding:"12px 14px", color:"#f1f5f9", fontWeight:600 }}>{b.vendor}</td>
                  <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.5)", fontFamily:"monospace" }}>{b.po}</td>
                  <td style={{ padding:"12px 14px" }}><span style={{ fontSize:9, background:b.match==="3way"?"rgba(74,222,128,0.12)":b.match==="2way"?"rgba(251,191,36,0.12)":"rgba(248,113,113,0.12)", color:b.match==="3way"?"#4ade80":b.match==="2way"?"#fbbf24":"#f87171", borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{b.match.toUpperCase()}</span></td>
                  <td style={{ padding:"12px 14px", color:"#f1f5f9", fontWeight:700 }}>SAR {b.amount.toLocaleString()}</td>
                  <td style={{ padding:"12px 14px", color: b.days<0?"#f87171":b.days<7?"#fbbf24":"rgba(255,255,255,0.6)" }}>{b.due} <span style={{ fontSize:9 }}>({b.days<0?`${Math.abs(b.days)}d late`:`${b.days}d`})</span></td>
                  <td style={{ padding:"12px 14px" }}><span style={{ fontSize:10, background:sm.bg, color:sm.c, borderRadius:5, padding:"2px 8px", fontWeight:700, textTransform:"uppercase" }}>{b.status.replace("_"," ")}</span></td>
                  <td style={{ padding:"12px 14px" }}><button style={{ fontSize:10, background:"rgba(230,126,34,0.12)", color:"#e67e22", border:"none", borderRadius:6, padding:"3px 10px", fontWeight:700, cursor:"pointer" }}>{b.status==="overdue"?"Pay Now":"Approve"}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
