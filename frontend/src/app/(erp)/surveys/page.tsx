"use client";
import { ClipboardList, Plus, TrendingUp, Send, Users } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const SURVEYS = [
  { id:"S-001", title:"Patient experience — Q2 2026",     audience:"Discharged patients (last 30d)", sent:8240, responses:3420, rate:42, nps:64, status:"active",  closes:"2026-07-30" },
  { id:"S-002", title:"Employee engagement — annual",     audience:"All staff",                       sent:4240, responses:3180, rate:75, nps:48, status:"closed",  closes:"2026-05-01" },
  { id:"S-003", title:"ICU nurse training feedback",      audience:"ICU RNs",                        sent:42,    responses:38,   rate:90, nps:72, status:"closed",  closes:"2026-04-12" },
  { id:"S-004", title:"Bupa claims process — vendor satisfaction",audience:"Bupa team",            sent:18,    responses:0,    rate:0,  nps:0,  status:"draft",   closes:"—" },
  { id:"S-005", title:"Hospital food service — pilot",   audience:"Inpatients (random 200)",        sent:200,   responses:142,  rate:71, nps:32, status:"active",  closes:"2026-06-30" },
];

const STATUS: Record<string,{c:string;bg:string}> = {
  draft:{c:"#94a3b8",bg:"rgba(148,163,184,0.1)"},
  active:{c:"#4ade80",bg:"rgba(74,222,128,0.1)"},
  closed:{c:"#a78bfa",bg:"rgba(167,139,250,0.1)"},
};

export default function SurveysPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Surveys</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Patient experience · Employee engagement · NPS · Multi-channel distribution · Analytics</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>New survey</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Active surveys</p><p style={{ fontSize:22, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>{SURVEYS.filter(s=>s.status==="active").length}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Total responses</p><p style={{ fontSize:22, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>{SURVEYS.reduce((s,x)=>s+x.responses, 0).toLocaleString()}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Avg response rate</p><p style={{ fontSize:22, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>{Math.round(SURVEYS.filter(s=>s.rate>0).reduce((s,x)=>s+x.rate,0)/SURVEYS.filter(s=>s.rate>0).length)}%</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Patient NPS (Q2)</p><p style={{ fontSize:22, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>64</p></Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {["ID","Title","Audience","Sent","Responses","Rate","NPS","Closes","Status"].map(h => <th key={h} style={{ textAlign:"left", padding:"10px 14px" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {SURVEYS.map(s => {
              const sm = STATUS[s.status];
              return (
                <tr key={s.id} style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"10px 14px", color:"#22d3ee", fontFamily:"monospace" }}>{s.id}</td>
                  <td style={{ padding:"10px 14px", color:"#f1f5f9", fontWeight:600 }}>{s.title}</td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.5)" }}>{s.audience}</td>
                  <td style={{ padding:"10px 14px", color:"#f1f5f9", fontFamily:"monospace" }}>{s.sent.toLocaleString()}</td>
                  <td style={{ padding:"10px 14px", color:"#4ade80", fontFamily:"monospace", fontWeight:700 }}>{s.responses.toLocaleString()}</td>
                  <td style={{ padding:"10px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ width:50, height:5, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                        <div style={{ height:"100%", background:s.rate>60?"#4ade80":s.rate>30?"#fbbf24":"#fb923c", width:`${s.rate}%` }} />
                      </div>
                      <span style={{ fontSize:11, color:s.rate>60?"#4ade80":"rgba(255,255,255,0.6)", fontWeight:700 }}>{s.rate}%</span>
                    </div>
                  </td>
                  <td style={{ padding:"10px 14px", color:s.nps>=50?"#4ade80":s.nps>=0?"#fbbf24":"#f87171", fontWeight:800 }}>{s.nps > 0 ? s.nps : "—"}</td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.5)" }}>{s.closes}</td>
                  <td style={{ padding:"10px 14px" }}><span style={{ fontSize:10, background:sm.bg, color:sm.c, borderRadius:5, padding:"2px 8px", fontWeight:700, textTransform:"uppercase" }}>{s.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
