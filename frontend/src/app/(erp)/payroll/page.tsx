"use client";
import { useState } from "react";
import { DollarSign, FileText, CheckCircle2, Download, Send, Calculator } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const RUNS = [
  { period:"2026-06", employees:4240, gross:18420000, gosi:1842000, tax:0, net:16578000, status:"in_review", payDate:"2026-06-25" },
  { period:"2026-05", employees:4202, gross:18180000, gosi:1818000, tax:0, net:16362000, status:"paid",       payDate:"2026-05-25" },
  { period:"2026-04", employees:4180, gross:17940000, gosi:1794000, tax:0, net:16146000, status:"paid",       payDate:"2026-04-25" },
];

const PAYSLIP = {
  employee:"Dr. Layla Al-Mutawa (EMP-1041)",
  period:"June 2026",
  components:[
    { label:"Basic Salary",         amount:30000  },
    { label:"Housing Allowance",     amount:6000   },
    { label:"Transport Allowance",   amount:2000   },
    { label:"Phone Allowance",       amount:500    },
    { label:"Overtime (12.5 hrs)",   amount:3500   },
    { label:"On-Call Allowance",     amount:0      },
  ],
  deductions:[
    { label:"GOSI (10%)",            amount:-4200 },
    { label:"Health Insurance",      amount:-200  },
    { label:"Advance Salary",         amount:0     },
  ],
};

const gross = PAYSLIP.components.reduce((s,c)=>s+c.amount,0);
const totalDed = PAYSLIP.deductions.reduce((s,d)=>s+d.amount,0);
const net = gross + totalDed;

export default function PayrollPage() {
  const [tab, setTab] = useState<"runs"|"payslip">("runs");

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Payroll</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Run payroll · Payslips · GOSI · End-of-service · WPS / bank file generation</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Calculator style={{ width:14, height:14 }}/>Run New Payroll</button>
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:16, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        {(["runs","payslip"] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{ padding:"9px 18px", background:"none", border:"none", borderBottom:`2px solid ${tab===t?"#e67e22":"transparent"}`, color:tab===t?"#e67e22":"rgba(255,255,255,0.4)", fontSize:12, fontWeight:tab===t?700:500, cursor:"pointer", textTransform:"capitalize", marginBottom:-1 }}>{t === "runs" ? "Payroll Runs" : "Payslip Preview"}</button>
        ))}
      </div>

      {tab === "runs" ? (
        <Card style={{ padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead><tr style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
              {["Period","Employees","Gross","GOSI","Net","Pay Date","Status","Actions"].map(h => <th key={h} style={{ textAlign:"left", padding:"12px 14px" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {RUNS.map(r => (
                <tr key={r.period} style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"12px 14px", color:"#22d3ee", fontFamily:"monospace", fontWeight:700 }}>{r.period}</td>
                  <td style={{ padding:"12px 14px", color:"#f1f5f9" }}>{r.employees.toLocaleString()}</td>
                  <td style={{ padding:"12px 14px", color:"#f1f5f9", fontWeight:600 }}>SAR {(r.gross/1000000).toFixed(2)}M</td>
                  <td style={{ padding:"12px 14px", color:"#fb923c" }}>−SAR {(r.gosi/1000).toFixed(0)}K</td>
                  <td style={{ padding:"12px 14px", color:"#4ade80", fontWeight:700 }}>SAR {(r.net/1000000).toFixed(2)}M</td>
                  <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.6)" }}>{r.payDate}</td>
                  <td style={{ padding:"12px 14px" }}><span style={{ fontSize:10, background:r.status==="paid"?"rgba(74,222,128,0.12)":"rgba(251,191,36,0.12)", color:r.status==="paid"?"#4ade80":"#fbbf24", borderRadius:5, padding:"2px 8px", fontWeight:700, textTransform:"uppercase" }}>{r.status.replace("_"," ")}</span></td>
                  <td style={{ padding:"12px 14px" }}><button style={{ fontSize:10, background:"rgba(34,211,238,0.12)", color:"#22d3ee", border:"none", borderRadius:6, padding:"3px 10px", fontWeight:700, cursor:"pointer" }}>Open</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <Card style={{ padding:22 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18 }}>
            <div>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0, textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>Payslip</p>
              <p style={{ fontSize:16, fontWeight:800, color:"#f1f5f9", margin:"3px 0 0" }}>{PAYSLIP.employee}</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", margin:"3px 0 0" }}>{PAYSLIP.period}</p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", borderRadius:8, padding:"7px 12px", fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}><Download style={{ width:12, height:12 }}/>PDF</button>
              <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:8, padding:"7px 12px", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}><Send style={{ width:12, height:12 }}/>Email</button>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
            <Card style={{ padding:16 }}>
              <p style={{ fontSize:11, fontWeight:700, color:"#4ade80", margin:"0 0 10px", textTransform:"uppercase", letterSpacing:"0.05em" }}>Earnings</p>
              {PAYSLIP.components.map(c => (
                <div key={c.label} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>{c.label}</span>
                  <span style={{ fontSize:12, color:"#f1f5f9", fontWeight:600 }}>{c.amount.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0 0", marginTop:6, borderTop:"1px solid rgba(74,222,128,0.2)" }}>
                <span style={{ fontSize:13, fontWeight:700, color:"#4ade80" }}>Gross Total</span>
                <span style={{ fontSize:15, fontWeight:800, color:"#4ade80" }}>SAR {gross.toLocaleString()}</span>
              </div>
            </Card>
            <Card style={{ padding:16 }}>
              <p style={{ fontSize:11, fontWeight:700, color:"#f87171", margin:"0 0 10px", textTransform:"uppercase", letterSpacing:"0.05em" }}>Deductions</p>
              {PAYSLIP.deductions.map(c => (
                <div key={c.label} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>{c.label}</span>
                  <span style={{ fontSize:12, color:"#f87171", fontWeight:600 }}>{c.amount.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0 0", marginTop:6, borderTop:"1px solid rgba(248,113,113,0.2)" }}>
                <span style={{ fontSize:13, fontWeight:700, color:"#f87171" }}>Total Deductions</span>
                <span style={{ fontSize:15, fontWeight:800, color:"#f87171" }}>SAR {totalDed.toLocaleString()}</span>
              </div>
            </Card>
          </div>

          <div style={{ marginTop:16, padding:18, background:"linear-gradient(135deg, rgba(230,126,34,0.08), rgba(212,84,0,0.05))", border:"1px solid rgba(230,126,34,0.2)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:14, fontWeight:700, color:"#f1f5f9" }}>NET PAY</span>
            <span style={{ fontSize:28, fontWeight:900, color:"#e67e22" }}>SAR {net.toLocaleString()}</span>
          </div>
        </Card>
      )}
    </div>
  );
}
