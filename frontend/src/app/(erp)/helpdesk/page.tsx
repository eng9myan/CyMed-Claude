"use client";
import { Plus, AlertTriangle, CheckCircle2 } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const TICKETS = [
  { id:"TKT-2026-0841", title:"EMR login failing on Floor 4 workstations", priority:"P1", category:"IT/EMR",     created:"2026-06-13 08:14", assignee:"IT Team",      status:"in_progress", sla:"2h" },
  { id:"TKT-2026-0842", title:"Printer offline — Pharmacy",                  priority:"P2", category:"Hardware",   created:"2026-06-13 09:32", assignee:"IT Tech Omar", status:"open",         sla:"4h" },
  { id:"TKT-2026-0840", title:"Add new lab test code — D-Dimer Hi-Sens",      priority:"P2", category:"LIS Config", created:"2026-06-12 14:20", assignee:"Lab Lead",     status:"in_progress", sla:"8h" },
  { id:"TKT-2026-0838", title:"Insurance integration timeout — Bupa NPHIES",  priority:"P1", category:"Integration",created:"2026-06-13 10:42", assignee:"Dev Team",     status:"in_progress", sla:"2h" },
  { id:"TKT-2026-0832", title:"Request: bulk import patients from spreadsheet",priority:"P3", category:"Data",       created:"2026-06-11 16:00", assignee:"DBA",           status:"open",         sla:"24h" },
  { id:"TKT-2026-0828", title:"Wound care photo upload fix",                  priority:"P2", category:"Mobile App", created:"2026-06-10 11:30", assignee:"Mobile Team",  status:"resolved",     sla:"4h" },
];

const STATUS_META: Record<string,{c:string;bg:string}> = {
  open:{c:"#fbbf24",bg:"rgba(251,191,36,0.1)"},
  in_progress:{c:"#22d3ee",bg:"rgba(34,211,238,0.1)"},
  resolved:{c:"#4ade80",bg:"rgba(74,222,128,0.1)"},
};

export default function HelpdeskPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Helpdesk / Service Tickets</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Internal IT support · User tickets · SLA tracking · Categories · Escalation</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>New Ticket</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Open</p><p style={{ fontSize:24, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>{TICKETS.filter(t=>t.status==="open").length}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>In Progress</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>{TICKETS.filter(t=>t.status==="in_progress").length}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Resolved (24h)</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>{TICKETS.filter(t=>t.status==="resolved").length}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>P1 Active</p><p style={{ fontSize:24, fontWeight:800, color:"#f43f5e", margin:"4px 0 0" }}>{TICKETS.filter(t=>t.priority==="P1"&&t.status!=="resolved").length}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>SLA Compliance</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>94%</p></Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {["Ticket","Title","Priority","Category","Created","Assignee","SLA","Status"].map(h => <th key={h} style={{ textAlign:"left", padding:"12px 14px" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {TICKETS.map(t => {
              const sm = STATUS_META[t.status];
              return (
                <tr key={t.id} style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"12px 14px", color:"#22d3ee", fontFamily:"monospace" }}>{t.id}</td>
                  <td style={{ padding:"12px 14px", color:"#f1f5f9" }}>{t.title}</td>
                  <td style={{ padding:"12px 14px" }}><span style={{ fontSize:10, background:t.priority==="P1"?"rgba(244,63,94,0.15)":t.priority==="P2"?"rgba(251,191,36,0.15)":"rgba(74,222,128,0.15)", color:t.priority==="P1"?"#f43f5e":t.priority==="P2"?"#fbbf24":"#4ade80", borderRadius:5, padding:"2px 8px", fontWeight:800 }}>{t.priority}</span></td>
                  <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.6)" }}>{t.category}</td>
                  <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.5)", fontSize:11 }}>{t.created}</td>
                  <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.6)" }}>{t.assignee}</td>
                  <td style={{ padding:"12px 14px", color:"#fbbf24", fontWeight:700 }}>{t.sla}</td>
                  <td style={{ padding:"12px 14px" }}><span style={{ fontSize:10, background:sm.bg, color:sm.c, borderRadius:5, padding:"2px 8px", fontWeight:700, textTransform:"uppercase" }}>{t.status.replace("_"," ")}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
