"use client";
import { Gauge, TrendingUp, DollarSign, Server, Users } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const TENANTS = [
  { id:"T001", name:"King Fahd Medical City",  apiCalls:8.4, apiQuota:10, storage:824, storageQuota:1000, seats:1240, seatsQuota:1500, overageMRR:0,    healthScore:94 },
  { id:"T002", name:"Riyadh National Hospital", apiCalls:14.2,apiQuota:10, storage:1240,storageQuota:1000, seats:1820, seatsQuota:1500, overageMRR:18400, healthScore:78 },
  { id:"T003", name:"Jeddah Health Network",    apiCalls:3.8, apiQuota:5,  storage:380, storageQuota:500,  seats:480,  seatsQuota:600,  overageMRR:0,    healthScore:96 },
  { id:"T004", name:"Eastern Medical Group",    apiCalls:6.2, apiQuota:5,  storage:680, storageQuota:500,  seats:840,  seatsQuota:600,  overageMRR:9800, healthScore:82 },
  { id:"T005", name:"Al Nahda Clinics",          apiCalls:1.4, apiQuota:2,  storage:120, storageQuota:200,  seats:140,  seatsQuota:250,  overageMRR:0,    healthScore:99 },
];

export default function MeteringPage() {
  const totalOverage = TENANTS.reduce((s,t)=>s+t.overageMRR,0);
  const overageTenants = TENANTS.filter(t=>t.overageMRR>0).length;
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:10 }}><Gauge style={{ width:24, height:24, color:"#e67e22" }}/>Usage Metering & Pay-Per-Use</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>API call counting · Storage metering · Active user seats · Overage invoicing · Per-tenant dashboards</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Tenants Monitored</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>{TENANTS.length}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Total API Calls (M/mo)</p><p style={{ fontSize:24, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>{TENANTS.reduce((s,t)=>s+t.apiCalls,0).toFixed(1)}M</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Overage Revenue</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>SAR {(totalOverage/1000).toFixed(1)}K</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Tenants in Overage</p><p style={{ fontSize:24, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>{overageTenants}</p></Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>Tenant Usage Dashboard</h3>
        </div>
        {TENANTS.map(t => {
          const apiPct = (t.apiCalls/t.apiQuota)*100;
          const storagePct = (t.storage/t.storageQuota)*100;
          const seatPct = (t.seats/t.seatsQuota)*100;
          return (
            <div key={t.id} style={{ padding:"16px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>{t.name}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{t.id} · Health Score {t.healthScore}/100</p>
                </div>
                {t.overageMRR > 0 && <span style={{ fontSize:12, background:"rgba(74,222,128,0.12)", color:"#4ade80", borderRadius:6, padding:"4px 12px", fontWeight:700 }}>+SAR {(t.overageMRR/1000).toFixed(1)}K MRR overage</span>}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
                {[
                  { label:"API Calls", v:`${t.apiCalls}M / ${t.apiQuota}M`, pct:apiPct, c:apiPct>100?"#f87171":apiPct>80?"#fbbf24":"#4ade80" },
                  { label:"Storage GB", v:`${t.storage} / ${t.storageQuota} GB`, pct:storagePct, c:storagePct>100?"#f87171":storagePct>80?"#fbbf24":"#4ade80" },
                  { label:"Seats", v:`${t.seats} / ${t.seatsQuota}`, pct:seatPct, c:seatPct>100?"#f87171":seatPct>80?"#fbbf24":"#4ade80" },
                ].map(m => (
                  <div key={m.label}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{m.label}</span>
                      <span style={{ fontSize:11, color:m.c, fontWeight:700 }}>{m.v}</span>
                    </div>
                    <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden" }}>
                      <div style={{ height:"100%", background:m.c, width:`${Math.min(100, m.pct)}%` }} />
                    </div>
                    {m.pct > 100 && <p style={{ fontSize:9, color:"#f87171", margin:"3px 0 0", fontWeight:700 }}>⚠ {(m.pct-100).toFixed(0)}% over quota — overage billing applies</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
