"use client";
import { Plus, Send, Download, Bell } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const AGING = [
  { bucket:"0–30 days",   amt:42500, c:"#4ade80" },
  { bucket:"31–60 days",  amt:18200, c:"#fbbf24" },
  { bucket:"61–90 days",  amt:8400,  c:"#fb923c" },
  { bucket:"91–120 days", amt:3200,  c:"#f87171" },
  { bucket:"121+ days",   amt:1850,  c:"#f43f5e" },
];

const INVOICES = [
  { id:"INV-2026-08471", customer:"Bupa Arabia",   amount:8420, due:"2026-06-25", days:12,  status:"open",       collectn:0 },
  { id:"INV-2026-08470", customer:"Tawuniya",      amount:14200,due:"2026-06-18", days:5,   status:"open",       collectn:0 },
  { id:"INV-2026-08465", customer:"MedGulf",        amount:6840, due:"2026-05-30", days:-14, status:"overdue",    collectn:1 },
  { id:"INV-2026-08423", customer:"Daman Insurance",amount:24400,due:"2026-04-22", days:-52, status:"overdue",    collectn:2 },
  { id:"INV-2026-08410", customer:"Self-pay — Patient cohort", amount:18400, due:"2026-06-20", days:7, status:"open", collectn:0 },
  { id:"INV-2026-08390", customer:"NHS England (cross-border)", amount:42800, due:"2026-05-15", days:-29, status:"overdue", collectn:1 },
];

export default function ARPage() {
  const total = INVOICES.reduce((s,i)=>s+i.amount,0);
  const overdue = INVOICES.filter(i=>i.status==="overdue").reduce((s,i)=>s+i.amount,0);

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Accounts Receivable</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Customer invoices · Aging · Dunning · DSO tracking · Write-offs</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.3)", color:"#fbbf24", borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Bell style={{ width:14, height:14 }}/>Send Dunning</button>
          <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>New Invoice</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Total Open AR</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>SAR {(total/1000).toFixed(0)}K</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Overdue</p><p style={{ fontSize:24, fontWeight:800, color:"#f87171", margin:"4px 0 0" }}>SAR {(overdue/1000).toFixed(0)}K</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>DSO</p><p style={{ fontSize:24, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>34 days</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Collection Rate</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>94%</p></Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"380px 1fr", gap:16 }}>
        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>AR Aging</h3>
          {AGING.map(a => {
            const max = 50000;
            return (
              <div key={a.bucket} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.55)" }}>{a.bucket}</span>
                  <span style={{ fontSize:11, color:a.c, fontWeight:700 }}>SAR {a.amt.toLocaleString()}</span>
                </div>
                <div style={{ height:8, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", background:a.c, width:`${(a.amt/max)*100}%` }} />
                </div>
              </div>
            );
          })}
        </Card>

        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>Outstanding Invoices</h3>
          </div>
          {INVOICES.map(inv => (
            <div key={inv.id} style={{ padding:"12px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"grid", gridTemplateColumns:"180px 1fr 130px 100px", gap:14, alignItems:"center" }}>
              <div>
                <p style={{ fontSize:11, fontFamily:"monospace", color:"#22d3ee", margin:0 }}>{inv.id}</p>
                <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{inv.collectn > 0 ? `${inv.collectn} reminder${inv.collectn>1?"s":""} sent` : "No reminders sent"}</p>
              </div>
              <p style={{ fontSize:12, color:"#f1f5f9", margin:0 }}>{inv.customer}</p>
              <div>
                <p style={{ fontSize:13, color:"#f1f5f9", margin:0, fontWeight:700 }}>SAR {inv.amount.toLocaleString()}</p>
                <p style={{ fontSize:9, color: inv.days<0?"#f87171":"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{inv.due} ({inv.days<0 ? `${Math.abs(inv.days)}d late` : `${inv.days}d`})</p>
              </div>
              <span style={{ fontSize:10, background:inv.status==="overdue"?"rgba(248,113,113,0.12)":"rgba(34,211,238,0.12)", color:inv.status==="overdue"?"#f87171":"#22d3ee", borderRadius:5, padding:"3px 9px", fontWeight:700, textAlign:"center", textTransform:"uppercase" }}>{inv.status}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
