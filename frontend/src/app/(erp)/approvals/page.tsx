"use client";
import { CheckCircle2, X, Clock, FileText, DollarSign, Users, ShoppingCart, Plus } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const APPROVALS = [
  { id:"APR-2026-0481", type:"Purchase order", icon:ShoppingCart, requester:"Pharm. Sami",          subject:"PO-08472 Sanofi — Insulin Glargine batch", amount:184000, requested:"2026-06-13 09:32", priority:"P2", policy:"Pharma inventory > SAR 100K requires CFO approval" },
  { id:"APR-2026-0480", type:"Leave request",  icon:Users,        requester:"Pharm. Sami",          subject:"Hajj leave Aug 22 - Sep 8",                 amount:0,      requested:"2026-06-13 09:00", priority:"P3", policy:"Hajj is once-per-lifetime entitlement" },
  { id:"APR-2026-0479", type:"Expense claim",  icon:DollarSign,   requester:"Dr. Al-Mutawa",        subject:"Travel — Madinah cardiology conference", amount:4240,    requested:"2026-06-12 14:15", priority:"P3", policy:"Conferences over SAR 2K require dept head approval" },
  { id:"APR-2026-0478", type:"Salary advance", icon:DollarSign,   requester:"Sr. Nurse Layla",      subject:"3-month salary advance",                    amount:55500, requested:"2026-06-12 11:08", priority:"P2", policy:"Advances > 1 month require HR + Finance approval" },
  { id:"APR-2026-0477", type:"Vendor onboarding", icon:FileText, requester:"Acc. Reem",            subject:"New vendor — Asyad Logistics",              amount:0,     requested:"2026-06-12 10:00", priority:"P3", policy:"Vendor risk screening required" },
  { id:"APR-2026-0476", type:"Capital request",icon:DollarSign,   requester:"Director Khalid",      subject:"Replacement CT scanner (Siemens)",          amount:2400000, requested:"2026-06-10 16:20", priority:"P1", policy:"CapEx > SAR 1M requires board approval" },
];

const PRI: Record<string,{c:string}> = { P1:{c:"#f43f5e"}, P2:{c:"#fbbf24"}, P3:{c:"#4ade80"} };

export default function ApprovalsPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Approvals</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Universal approval inbox · PO · Leave · Expenses · Capital · CapEx · Policy-driven routing</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>New approval policy</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>In your queue</p><p style={{ fontSize:22, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>{APPROVALS.length}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>P1 priority</p><p style={{ fontSize:22, fontWeight:800, color:"#f43f5e", margin:"4px 0 0" }}>{APPROVALS.filter(a=>a.priority==="P1").length}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Total value</p><p style={{ fontSize:22, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>SAR {((APPROVALS.reduce((s,a)=>s+a.amount,0))/1000).toFixed(0)}K</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Avg response</p><p style={{ fontSize:22, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>4.2 hrs</p></Card>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {APPROVALS.map(a => (
          <Card key={a.id} style={{ padding:16 }}>
            <div style={{ display:"grid", gridTemplateColumns:"36px 1fr 200px 160px 140px", gap:14, alignItems:"center" }}>
              <div style={{ width:34, height:34, borderRadius:10, background:`${PRI[a.priority].c}15`, color:PRI[a.priority].c, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <a.icon style={{ width:15, height:15 }} />
              </div>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                  <span style={{ fontSize:10, fontFamily:"monospace", color:"#22d3ee" }}>{a.id}</span>
                  <span style={{ fontSize:9, background:`${PRI[a.priority].c}18`, color:PRI[a.priority].c, borderRadius:4, padding:"1px 6px", fontWeight:800 }}>{a.priority}</span>
                  <span style={{ fontSize:9, background:"rgba(167,139,250,0.12)", color:"#a78bfa", borderRadius:4, padding:"1px 6px", fontWeight:700 }}>{a.type}</span>
                </div>
                <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>{a.subject}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"3px 0 0" }}>From {a.requester} · {a.requested}</p>
                <p style={{ fontSize:10, color:"rgba(251,191,36,0.7)", margin:"4px 0 0", fontStyle:"italic" }}>Policy: {a.policy}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                {a.amount > 0 && <p style={{ fontSize:18, fontWeight:800, color:"#4ade80", margin:0 }}>SAR {a.amount.toLocaleString()}</p>}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                <button style={{ background:"#4ade80", color:"white", border:"none", borderRadius:8, padding:"7px 0", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}><CheckCircle2 style={{ width:13, height:13 }}/>Approve</button>
                <button style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", color:"#f87171", borderRadius:8, padding:"7px 0", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}><X style={{ width:11, height:11 }}/>Reject</button>
              </div>
              <button style={{ background:"rgba(34,211,238,0.1)", border:"1px solid rgba(34,211,238,0.3)", color:"#22d3ee", borderRadius:8, padding:"7px 0", fontSize:11, fontWeight:600, cursor:"pointer" }}>View detail →</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
