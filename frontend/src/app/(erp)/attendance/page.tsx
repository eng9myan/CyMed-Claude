"use client";
import { Clock, CheckCircle2, XCircle, AlertTriangle, MapPin } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const ATT = [
  { name:"Dr. Layla Al-Mutawa",  in:"07:42", out:"19:14", hrs:11.5, method:"biometric", status:"present" },
  { name:"Sr. Nurse Layla Hassan", in:"06:55", out:"19:02", hrs:12.1, method:"biometric", status:"present" },
  { name:"Pharm. Sami",          in:"08:01", out:"17:30", hrs:9.5,  method:"biometric", status:"present" },
  { name:"Tech. Hassan",         in:"07:50", out:"16:10", hrs:8.3,  method:"mobile_gps", status:"present" },
  { name:"Tech. Omar",           in:"08:15", out:"16:30", hrs:8.3,  method:"biometric", status:"late" },
  { name:"Acc. Reem",            in:"—",     out:"—",     hrs:0,    method:"—",         status:"leave" },
  { name:"Dr. Khalid",           in:"08:32", out:"—",     hrs:0,    method:"biometric", status:"late" },
  { name:"Nurse Sara",           in:"—",     out:"—",     hrs:0,    method:"—",         status:"absent" },
];

const STATUS_META: Record<string,{c:string;bg:string}> = {
  present:{c:"#4ade80",bg:"rgba(74,222,128,0.1)"},
  late:{c:"#fbbf24",bg:"rgba(251,191,36,0.1)"},
  absent:{c:"#f87171",bg:"rgba(248,113,113,0.1)"},
  leave:{c:"#a78bfa",bg:"rgba(167,139,250,0.1)"},
};

export default function AttendancePage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Attendance & Time</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Biometric · Mobile GPS · Auto-roster · Overtime · Shift compliance</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Present Today</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>3,842</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Late Arrivals</p><p style={{ fontSize:24, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>124</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Absent</p><p style={{ fontSize:24, fontWeight:800, color:"#f87171", margin:"4px 0 0" }}>42</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>On Leave</p><p style={{ fontSize:24, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>124</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>OT Hours (week)</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>842</p></Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>Today — 2026-06-13</h3>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {["Employee","Check-In","Check-Out","Hours","Method","Status"].map(h => <th key={h} style={{ textAlign:"left", padding:"10px 14px" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {ATT.map((a,i) => {
              const sm = STATUS_META[a.status];
              return (
                <tr key={i} style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"10px 14px", color:"#f1f5f9", fontWeight:600 }}>{a.name}</td>
                  <td style={{ padding:"10px 14px", color:a.in!=="—"?"#22d3ee":"rgba(255,255,255,0.3)", fontFamily:"monospace", fontWeight:700 }}>{a.in}</td>
                  <td style={{ padding:"10px 14px", color:a.out!=="—"?"#22d3ee":"rgba(255,255,255,0.3)", fontFamily:"monospace" }}>{a.out}</td>
                  <td style={{ padding:"10px 14px", color:"#f1f5f9", fontWeight:700 }}>{a.hrs} h</td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.5)" }}>{a.method === "biometric" ? "👆 Biometric" : a.method === "mobile_gps" ? "📍 Mobile GPS" : "—"}</td>
                  <td style={{ padding:"10px 14px" }}><span style={{ fontSize:10, background:sm.bg, color:sm.c, borderRadius:5, padding:"2px 8px", fontWeight:700, textTransform:"uppercase" }}>{a.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
