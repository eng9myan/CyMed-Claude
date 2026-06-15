"use client";
import { Scale, Users, AlertTriangle, TrendingUp } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const RACE_DISPARITIES = [
  { group:"Saudi Nationals", hba1c:7.2, bp:81, screen:78, mortality:4.2 },
  { group:"South Asian",     hba1c:8.1, bp:74, screen:62, mortality:5.8 },
  { group:"Sub-Saharan African", hba1c:8.4, bp:71, screen:54, mortality:7.2 },
  { group:"European Expat",  hba1c:6.8, bp:82, screen:85, mortality:3.4 },
  { group:"Filipino",        hba1c:7.6, bp:76, screen:68, mortality:4.9 },
];

const ZIP_DISPARITIES = [
  { zip:"11461 — Olaya (high income)",    diabetes:8.2,  hosp:1.1, life:78.4 },
  { zip:"11543 — Malaz (mid)",             diabetes:12.4, hosp:1.8, life:75.2 },
  { zip:"11652 — Nakheel (low income)",    diabetes:18.6, hosp:3.2, life:71.8 },
  { zip:"11743 — Industrial (low income)", diabetes:22.4, hosp:4.1, life:69.2 },
];

const INTERVENTIONS = [
  { name:"Mobile diabetes screening — low income ZIPs", impact:"Screening +18%", status:"active" },
  { name:"Language-concordant care expansion",          impact:"Adherence +12%", status:"active" },
  { name:"Free transport voucher pilot",                impact:"No-show -22%",    status:"pilot" },
  { name:"Community health worker programme",           impact:"Outcomes pending",status:"pilot" },
];

export default function EquityPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:10 }}><Scale style={{ width:24, height:24, color:"#10b981" }}/>Health Equity Analytics</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Outcomes by demographic · Geographic disparities · Care gap analysis · Equity intervention tracking</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Largest Disparity Gap</p><p style={{ fontSize:22, fontWeight:800, color:"#f87171", margin:"4px 0 0" }}>HbA1c +18%</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>Sub-Saharan African vs European</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Lowest Screen Rate</p><p style={{ fontSize:22, fontWeight:800, color:"#fb923c", margin:"4px 0 0" }}>54%</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>SSA group — target 75%</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Life Expectancy Gap</p><p style={{ fontSize:22, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>9.2 yrs</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>High vs low income ZIPs</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Active Interventions</p><p style={{ fontSize:22, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>{INTERVENTIONS.length}</p></Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Outcomes by Demographic Group</h3>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
            <thead><tr style={{ fontSize:9, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
              <th style={{ textAlign:"left", padding:"6px 8px" }}>Group</th>
              <th style={{ textAlign:"right", padding:"6px 8px" }}>HbA1c</th>
              <th style={{ textAlign:"right", padding:"6px 8px" }}>BP Ctrl %</th>
              <th style={{ textAlign:"right", padding:"6px 8px" }}>Screen %</th>
              <th style={{ textAlign:"right", padding:"6px 8px" }}>Mortality</th>
            </tr></thead>
            <tbody>
              {RACE_DISPARITIES.map(r => (
                <tr key={r.group} style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"8px 8px", color:"#f1f5f9", fontWeight:600 }}>{r.group}</td>
                  <td style={{ textAlign:"right", padding:"8px 8px", color: r.hba1c>7.5?"#f87171":"#4ade80", fontWeight:700 }}>{r.hba1c}</td>
                  <td style={{ textAlign:"right", padding:"8px 8px", color: r.bp<75?"#fb923c":"#4ade80", fontWeight:700 }}>{r.bp}%</td>
                  <td style={{ textAlign:"right", padding:"8px 8px", color: r.screen<70?"#f87171":"#4ade80", fontWeight:700 }}>{r.screen}%</td>
                  <td style={{ textAlign:"right", padding:"8px 8px", color: r.mortality>5?"#f87171":"#4ade80", fontWeight:700 }}>{r.mortality}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Geographic Disparities (by ZIP)</h3>
          {ZIP_DISPARITIES.map(z => (
            <div key={z.zip} style={{ padding:"10px 12px", marginBottom:8, background:"rgba(255,255,255,0.02)", borderRadius:10, borderLeft:`3px solid ${z.life<72?"#f87171":z.life<75?"#fbbf24":"#4ade80"}` }}>
              <p style={{ fontSize:11, fontWeight:600, color:"#f1f5f9", margin:0 }}>{z.zip}</p>
              <div style={{ display:"flex", gap:14, marginTop:6, fontSize:10 }}>
                <span style={{ color:"rgba(255,255,255,0.5)" }}>DM: <strong style={{ color: z.diabetes>15?"#f87171":"#4ade80" }}>{z.diabetes}%</strong></span>
                <span style={{ color:"rgba(255,255,255,0.5)" }}>Hosp rate: <strong style={{ color: z.hosp>2.5?"#f87171":"#4ade80" }}>{z.hosp}</strong></span>
                <span style={{ color:"rgba(255,255,255,0.5)" }}>Life: <strong style={{ color: z.life<72?"#f87171":"#4ade80" }}>{z.life} yrs</strong></span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card style={{ padding:18 }}>
        <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Active Equity Interventions</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
          {INTERVENTIONS.map(i => (
            <div key={i.name} style={{ padding:"12px 14px", background:"rgba(16,185,129,0.05)", border:"1px solid rgba(16,185,129,0.15)", borderRadius:10 }}>
              <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:0 }}>{i.name}</p>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:6 }}>
                <span style={{ fontSize:11, color:"#10b981", fontWeight:700 }}>{i.impact}</span>
                <span style={{ fontSize:9, background:i.status==="active"?"rgba(74,222,128,0.15)":"rgba(251,191,36,0.15)", color:i.status==="active"?"#4ade80":"#fbbf24", borderRadius:5, padding:"2px 7px", fontWeight:700, textTransform:"uppercase" }}>{i.status}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
