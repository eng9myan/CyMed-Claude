"use client";
import { FileText, Send, Plus, CheckCircle2, Clock, XCircle, Edit3 } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const PROPOSALS = [
  { id:"PRO-2026-0184", customer:"King Saud Medical City", title:"HMS Enterprise — 5-year licence",  amount:2400000, expires:"2026-06-30", status:"viewed",    sentAt:"2026-06-10", esign:"pending" },
  { id:"PRO-2026-0183", customer:"Asir Hospital Network",  title:"Group edition + integration",       amount:1840000, expires:"2026-06-25", status:"negotiating",sentAt:"2026-06-08", esign:"draft" },
  { id:"PRO-2026-0182", customer:"Royal Eye Hospital",     title:"RIS + Teleophth — annual",          amount:680000,  expires:"2026-07-04", status:"sent",      sentAt:"2026-06-12", esign:"sent" },
  { id:"PRO-2026-0181", customer:"Al Noor Polyclinic Chain",title:"CMS multi-site (8 locations)",      amount:380000,  expires:"2026-07-08", status:"draft",     sentAt:"—",         esign:"—" },
  { id:"PRO-2026-0180", customer:"Eastern Medical Lab Group",title:"LIS reference lab edition",         amount:920000,  expires:"2026-06-12", status:"accepted",  sentAt:"2026-05-28", esign:"signed" },
  { id:"PRO-2026-0179", customer:"Jeddah Health Network",   title:"Patient portal — pilot",            amount:240000,  expires:"2026-06-04", status:"declined",  sentAt:"2026-05-22", esign:"declined" },
];

const STATUS: Record<string,{c:string;bg:string}> = {
  draft:{c:"#94a3b8",bg:"rgba(148,163,184,0.1)"},
  sent:{c:"#22d3ee",bg:"rgba(34,211,238,0.1)"},
  viewed:{c:"#a78bfa",bg:"rgba(167,139,250,0.1)"},
  negotiating:{c:"#fbbf24",bg:"rgba(251,191,36,0.1)"},
  accepted:{c:"#4ade80",bg:"rgba(74,222,128,0.1)"},
  declined:{c:"#f87171",bg:"rgba(248,113,113,0.1)"},
};

export default function ProposalsPage() {
  const open = PROPOSALS.filter(p=>!["accepted","declined"].includes(p.status)).reduce((s,p)=>s+p.amount,0);
  const won = PROPOSALS.filter(p=>p.status==="accepted").reduce((s,p)=>s+p.amount,0);

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Sales Proposals & Quotations</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Quote builder · Product catalog · E-signature · Track when prospect views · Convert to invoice</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>New proposal</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Open value</p><p style={{ fontSize:22, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>SAR {(open/1000000).toFixed(2)}M</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Won (Q)</p><p style={{ fontSize:22, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>SAR {(won/1000000).toFixed(2)}M</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Win rate</p><p style={{ fontSize:22, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>38%</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Pending e-sign</p><p style={{ fontSize:22, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>{PROPOSALS.filter(p=>p.esign==="pending"||p.esign==="sent").length}</p></Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {["Quote","Customer","Title","Value","Sent","Expires","E-sign","Status"].map(h => <th key={h} style={{ textAlign:"left", padding:"10px 14px" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {PROPOSALS.map(p => {
              const sm = STATUS[p.status];
              return (
                <tr key={p.id} style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"10px 14px", color:"#22d3ee", fontFamily:"monospace" }}>{p.id}</td>
                  <td style={{ padding:"10px 14px", color:"#f1f5f9", fontWeight:600 }}>{p.customer}</td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.6)" }}>{p.title}</td>
                  <td style={{ padding:"10px 14px", color:"#4ade80", fontWeight:700 }}>SAR {(p.amount/1000).toFixed(0)}K</td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.5)" }}>{p.sentAt}</td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.5)" }}>{p.expires}</td>
                  <td style={{ padding:"10px 14px" }}><span style={{ fontSize:10, background:p.esign==="signed"?"rgba(74,222,128,0.12)":p.esign==="pending"?"rgba(251,191,36,0.12)":"rgba(255,255,255,0.05)", color:p.esign==="signed"?"#4ade80":p.esign==="pending"?"#fbbf24":"rgba(255,255,255,0.4)", borderRadius:5, padding:"2px 8px", fontWeight:700, textTransform:"uppercase" }}>{p.esign}</span></td>
                  <td style={{ padding:"10px 14px" }}><span style={{ fontSize:10, background:sm.bg, color:sm.c, borderRadius:5, padding:"2px 8px", fontWeight:700, textTransform:"uppercase" }}>{p.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
