"use client";
import { CheckCircle2, AlertTriangle, Upload, RefreshCw } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const STATEMENTS = [
  { date:"2026-06-13", desc:"BUPA INSURANCE — claim payment batch 0341", amount:842000,   matched:true,  ref:"INV-2026-08471" },
  { date:"2026-06-13", desc:"TAWUNIYA — settlement 06-13",               amount:184000,   matched:true,  ref:"INV-2026-08472" },
  { date:"2026-06-13", desc:"MEDGULF — claim reimbursement",              amount:96400,    matched:true,  ref:"INV-2026-08440" },
  { date:"2026-06-13", desc:"PAYROLL OUTFLOW — June payroll batch",       amount:-18420000,matched:true,  ref:"JE-2026-08410" },
  { date:"2026-06-12", desc:"DAMAN INSURANCE — partial settlement",        amount:42400,    matched:false, ref:"" },
  { date:"2026-06-12", desc:"GE HEALTHCARE — vendor payment",              amount:-284000,  matched:true,  ref:"AP-2026-1843" },
  { date:"2026-06-12", desc:"UNIDENTIFIED CREDIT — pls investigate",      amount:12400,    matched:false, ref:"" },
  { date:"2026-06-12", desc:"BANK FEES — June 2026",                       amount:-840,     matched:false, ref:"" },
];

export default function BankingPage() {
  const totalIn = STATEMENTS.filter(s=>s.amount>0).reduce((sum,s)=>sum+s.amount, 0);
  const totalOut = STATEMENTS.filter(s=>s.amount<0).reduce((sum,s)=>sum+s.amount, 0);
  const matched = STATEMENTS.filter(s=>s.matched).length;
  const unmatched = STATEMENTS.filter(s=>!s.matched).length;
  const matchRate = (matched / STATEMENTS.length) * 100;

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Bank Reconciliation</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>MT940 / OFX import · Auto-match · Multi-currency · Daily cash position</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ background:"rgba(34,211,238,0.1)", border:"1px solid rgba(34,211,238,0.3)", color:"#22d3ee", borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><Upload style={{ width:13, height:13 }}/>Import statement</button>
          <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><RefreshCw style={{ width:14, height:14 }}/>Auto-match</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Total credits</p><p style={{ fontSize:22, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>SAR {(totalIn/1000).toFixed(0)}K</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Total debits</p><p style={{ fontSize:22, fontWeight:800, color:"#f87171", margin:"4px 0 0" }}>SAR {(Math.abs(totalOut)/1000).toFixed(0)}K</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Match rate</p><p style={{ fontSize:22, fontWeight:800, color:matchRate>=90?"#4ade80":"#fbbf24", margin:"4px 0 0" }}>{matchRate.toFixed(0)}%</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Unmatched</p><p style={{ fontSize:22, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>{unmatched}</p></Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>Bank statement — Riyad Bank A/C 0042-1841</h3>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {["Date","Description","Amount","Matched to","Status","Action"].map(h => <th key={h} style={{ textAlign:"left", padding:"10px 14px" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {STATEMENTS.map((s,i) => (
              <tr key={i} style={{ borderTop:"1px solid rgba(255,255,255,0.04)", borderLeft: !s.matched ? "3px solid #fbbf24" : "3px solid transparent" }}>
                <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.6)" }}>{s.date}</td>
                <td style={{ padding:"10px 14px", color:"#f1f5f9", fontWeight:600 }}>{s.desc}</td>
                <td style={{ padding:"10px 14px", color: s.amount>0?"#4ade80":"#f87171", fontWeight:700, fontFamily:"monospace" }}>{s.amount>0?"+":""}SAR {s.amount.toLocaleString()}</td>
                <td style={{ padding:"10px 14px", color:"#22d3ee", fontFamily:"monospace" }}>{s.ref || <span style={{ color:"rgba(255,255,255,0.3)", fontFamily:"sans-serif" }}>—</span>}</td>
                <td style={{ padding:"10px 14px" }}>
                  {s.matched ? (
                    <span style={{ fontSize:10, background:"rgba(74,222,128,0.12)", color:"#4ade80", borderRadius:5, padding:"2px 8px", fontWeight:700, display:"inline-flex", alignItems:"center", gap:4 }}><CheckCircle2 style={{ width:10, height:10 }}/>MATCHED</span>
                  ) : (
                    <span style={{ fontSize:10, background:"rgba(251,191,36,0.12)", color:"#fbbf24", borderRadius:5, padding:"2px 8px", fontWeight:700, display:"inline-flex", alignItems:"center", gap:4 }}><AlertTriangle style={{ width:10, height:10 }}/>UNMATCHED</span>
                  )}
                </td>
                <td style={{ padding:"10px 14px" }}>
                  {!s.matched && <button style={{ fontSize:10, background:"rgba(230,126,34,0.15)", color:"#e67e22", border:"1px solid rgba(230,126,34,0.3)", borderRadius:6, padding:"3px 10px", fontWeight:700, cursor:"pointer" }}>Match manually</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
