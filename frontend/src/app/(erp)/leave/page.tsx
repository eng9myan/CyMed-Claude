"use client";
import { useState } from "react";
import { Calendar, CheckCircle2, Clock, XCircle, Plus, Users } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const BALANCES = [
  { type:"Annual leave",       used:18, granted:30, c:"#22d3ee" },
  { type:"Sick leave",         used:4,  granted:30, c:"#fbbf24" },
  { type:"Hajj leave",         used:0,  granted:15, c:"#a78bfa" },
  { type:"Maternity",          used:0,  granted:70, c:"#f472b6" },
  { type:"Compassionate",      used:1,  granted:5,  c:"#94a3b8" },
];

const REQUESTS = [
  { id:"LV-2026-0184", employee:"Dr. Layla Al-Mutawa",   type:"Annual",       from:"2026-07-04", to:"2026-07-18", days:14, status:"approved", manager:"HR Mgr Khalid" },
  { id:"LV-2026-0185", employee:"Sr. Nurse Layla Hassan", type:"Sick",         from:"2026-06-13", to:"2026-06-15", days:3,  status:"approved", manager:"Auto (with cert.)" },
  { id:"LV-2026-0186", employee:"Pharm. Sami",            type:"Hajj",         from:"2026-08-22", to:"2026-09-08", days:18, status:"pending",  manager:"HR Mgr Khalid" },
  { id:"LV-2026-0187", employee:"Tech. Hassan",           type:"Annual",       from:"2026-09-01", to:"2026-09-14", days:14, status:"pending",  manager:"HR Mgr Khalid" },
  { id:"LV-2026-0182", employee:"Acc. Reem Bin Salem",     type:"Maternity",    from:"2026-06-13", to:"2026-08-22", days:70, status:"approved", manager:"HR Mgr Khalid" },
  { id:"LV-2026-0181", employee:"Tech. Omar",              type:"Compassionate",from:"2026-05-30", to:"2026-06-01", days:3,  status:"rejected", manager:"HR Mgr Khalid" },
];

const STATUS: Record<string,{c:string;bg:string}> = {
  approved:{c:"#4ade80",bg:"rgba(74,222,128,0.1)"},
  pending:{c:"#fbbf24",bg:"rgba(251,191,36,0.1)"},
  rejected:{c:"#f87171",bg:"rgba(248,113,113,0.1)"},
};

export default function LeavePage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Leave Management</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Annual · Sick · Hajj · Maternity · Compassionate · Saudi labor law compliant</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>Request leave</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:18 }}>
        {BALANCES.map(b => {
          const remaining = b.granted - b.used;
          const pct = (b.used / b.granted) * 100;
          return (
            <Card key={b.type} style={{ padding:14 }}>
              <p style={{ fontSize:10, color:b.c, margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>{b.type}</p>
              <p style={{ fontSize:22, color:"#f1f5f9", margin:"0 0 6px", fontWeight:800 }}>{remaining} <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:400 }}>/ {b.granted} days</span></p>
              <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", background:b.c, width:`${pct}%` }} />
              </div>
            </Card>
          );
        })}
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>Leave requests</h3>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {["ID","Employee","Type","From","To","Days","Approver","Status","Action"].map(h => <th key={h} style={{ textAlign:"left", padding:"10px 14px" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {REQUESTS.map(r => {
              const sm = STATUS[r.status];
              return (
                <tr key={r.id} style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"10px 14px", color:"#22d3ee", fontFamily:"monospace" }}>{r.id}</td>
                  <td style={{ padding:"10px 14px", color:"#f1f5f9", fontWeight:600 }}>{r.employee}</td>
                  <td style={{ padding:"10px 14px" }}><span style={{ fontSize:10, background:"rgba(167,139,250,0.12)", color:"#a78bfa", borderRadius:5, padding:"2px 8px", fontWeight:700 }}>{r.type}</span></td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.6)" }}>{r.from}</td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.6)" }}>{r.to}</td>
                  <td style={{ padding:"10px 14px", color:"#fbbf24", fontWeight:700 }}>{r.days}</td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.6)" }}>{r.manager}</td>
                  <td style={{ padding:"10px 14px" }}><span style={{ fontSize:10, background:sm.bg, color:sm.c, borderRadius:5, padding:"2px 8px", fontWeight:700, textTransform:"uppercase" }}>{r.status}</span></td>
                  <td style={{ padding:"10px 14px" }}>{r.status === "pending" && <button style={{ fontSize:10, background:"#4ade80", color:"white", border:"none", borderRadius:6, padding:"3px 10px", fontWeight:700, cursor:"pointer" }}>Approve</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
