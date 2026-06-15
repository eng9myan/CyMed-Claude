"use client";

import { useState } from "react";

type Tenant = {
  id: string; name: string; org: string; mode: string; country: string;
  solutions: string[]; plan: string; storage: string; storageUsed: number;
  apiCalls: number; apiLimit: number; users: number; userLimit: number;
  status: string; created: string; renewsOn: string; mrr: number;
};

const TENANTS: Tenant[] = [
  { id:"T-001", name:"kfshrc", org:"King Faisal Specialist Hospital & RC", mode:"SaaS",       country:"SA", solutions:["HMS","LIS","RIS","Pharmacy ERP"],     plan:"Enterprise", storage:"2TB",  storageUsed:68, apiCalls:284000, apiLimit:500000, users:4200, userLimit:5000, status:"ACTIVE",    created:"2024-01-15", renewsOn:"2027-01-15", mrr:18500 },
  { id:"T-002", name:"nhs-em", org:"NHS East Midlands Trust",              mode:"SaaS",       country:"GB", solutions:["HMS","Care Management"],              plan:"Enterprise", storage:"1TB",  storageUsed:42, apiCalls:142000, apiLimit:300000, users:1800, userLimit:2500, status:"ACTIVE",    created:"2024-02-08", renewsOn:"2027-02-08", mrr:12200 },
  { id:"T-003", name:"seha-ae", org:"Abu Dhabi Health Services (SEHA)",    mode:"SaaS",       country:"AE", solutions:["HMS","CMS","Pharmacy ERP","LIS","RIS"],plan:"Enterprise", storage:"5TB",  storageUsed:81, apiCalls:620000, apiLimit:1000000,users:6100, userLimit:8000, status:"ACTIVE",    created:"2024-01-22", renewsOn:"2027-01-22", mrr:42000 },
  { id:"T-004", name:"moh-sa", org:"Ministry of Health — Saudi Arabia",   mode:"On-Prem",    country:"SA", solutions:["MoH","National","Population Health"],  plan:"Government", storage:"Unlimited", storageUsed:35, apiCalls:0, apiLimit:0, users:8000, userLimit:99999, status:"ACTIVE", created:"2024-03-01", renewsOn:"2027-03-01", mrr:80000 },
  { id:"T-005", name:"alrayan", org:"Al Rayan Medical Group",              mode:"SaaS",       country:"QA", solutions:["HMS","CMS","Pharmacy ERP"],           plan:"Enterprise", storage:"800GB",storageUsed:55, apiCalls:98000,  apiLimit:200000, users:2100, userLimit:3000, status:"ACTIVE",    created:"2024-04-10", renewsOn:"2027-04-10", mrr:9800  },
  { id:"T-006", name:"cu-hosp", org:"Cairo University Hospital",           mode:"SaaS",       country:"EG", solutions:["HMS","LIS"],                          plan:"Standard",   storage:"200GB",storageUsed:30, apiCalls:32000,  apiLimit:100000, users:620,  userLimit:1000, status:"ACTIVE",    created:"2024-05-18", renewsOn:"2025-05-18", mrr:2400  },
  { id:"T-007", name:"rms-jo",  org:"Jordan Royal Medical Services",       mode:"Hybrid",     country:"JO", solutions:["HMS","MoH"],                          plan:"Government", storage:"500GB",storageUsed:48, apiCalls:88000,  apiLimit:200000, users:1950, userLimit:2500, status:"ACTIVE",    created:"2024-02-28", renewsOn:"2027-02-28", mrr:6500  },
  { id:"T-008", name:"demo",    org:"Demo Environment",                    mode:"SaaS",       country:"--", solutions:["HMS","CMS","Pharmacy ERP","LIS","RIS"],plan:"Internal",   storage:"50GB", storageUsed:12, apiCalls:1200,   apiLimit:50000,  users:50,   userLimit:100,  status:"DEMO",      created:"2024-01-01", renewsOn:"2099-12-31", mrr:0     },
];

const PLAN_STYLE: Record<string, { bg: string; color: string }> = {
  Enterprise: { bg:"rgba(230,126,34,0.12)",  color:"#fb923c" },
  Standard:   { bg:"rgba(34,211,238,0.1)",   color:"#22d3ee" },
  Government: { bg:"rgba(251,191,36,0.1)",   color:"#fbbf24" },
  Internal:   { bg:"rgba(192,132,252,0.12)", color:"#c084fc" },
};

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  ACTIVE:    { bg:"rgba(74,222,128,0.1)",  color:"#4ade80", dot:"#4ade80" },
  SUSPENDED: { bg:"rgba(248,113,113,0.1)", color:"#f87171", dot:"#f87171" },
  TRIAL:     { bg:"rgba(96,165,250,0.1)",  color:"#60a5fa", dot:"#60a5fa" },
  DEMO:      { bg:"rgba(192,132,252,0.1)", color:"#c084fc", dot:"#c084fc" },
};

const MODE_COLOR: Record<string, string> = { SaaS:"#22d3ee", "On-Prem":"#fbbf24", Hybrid:"#a78bfa" };

function Bar({ pct, color }: { pct: number; color: string }) {
  const c = pct > 90 ? "#f87171" : pct > 70 ? "#f97316" : color;
  return (
    <div style={{ height:5, borderRadius:99, background:"rgba(255,255,255,0.06)", width:"100%", overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${pct}%`, background:c, borderRadius:99 }} />
    </div>
  );
}

function Card({ children, style = {}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }} onClick={onClick}>{children}</div>;
}

export default function TenantsPage() {
  const [selected, setSelected] = useState<Tenant | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const totalMRR = TENANTS.reduce((a, t) => a + t.mrr, 0);

  return (
    <div style={{ padding:"28px 28px 48px", minHeight:"100vh", color:"#f1f5f9" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>SaaS Tenants</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)", marginTop:4 }}>{TENANTS.length} tenants · ${totalMRR.toLocaleString()} MRR</p>
        </div>
        <button onClick={()=>setCreateOpen(true)} style={{ padding:"8px 20px", borderRadius:10, background:"#c084fc", color:"#050a14", fontSize:12, fontWeight:800, border:"none", cursor:"pointer" }}>
          + New Tenant
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
        {([
          ["Total Tenants",  TENANTS.length,                                                     "#c084fc"],
          ["Active",         TENANTS.filter(t=>t.status==="ACTIVE").length,                     "#4ade80"],
          ["SaaS",           TENANTS.filter(t=>t.mode==="SaaS").length,                         "#22d3ee"],
          ["MRR",            `$${totalMRR.toLocaleString()}`,                                   "#fbbf24"],
        ] as [string,string|number,string][]).map(([l,v,c])=>(
          <Card key={l} style={{ padding:16 }}>
            <p style={{ fontSize:26, fontWeight:800, color:c, lineHeight:1, margin:0 }}>{v}</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.38)", marginTop:4 }}>{l}</p>
          </Card>
        ))}
      </div>

      {/* Tenant cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(480px,1fr))", gap:12 }}>
        {TENANTS.map(t => {
          const ps = PLAN_STYLE[t.plan] ?? PLAN_STYLE.Standard;
          const ss = STATUS_STYLE[t.status] ?? STATUS_STYLE.ACTIVE;
          const isSelected = selected?.id === t.id;
          return (
            <Card key={t.id} style={{ padding:20, cursor:"pointer", border:`1px solid ${isSelected?"rgba(192,132,252,0.3)":"rgba(255,255,255,0.07)"}` }} onClick={()=>setSelected(isSelected?null:t)}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                    <code style={{ fontSize:12, fontWeight:700, color:"#c084fc", background:"rgba(192,132,252,0.12)", padding:"2px 8px", borderRadius:6 }}>{t.id}</code>
                    <code style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>/{t.name}</code>
                    <span style={{ fontSize:10, fontWeight:700, color:MODE_COLOR[t.mode]??"#22d3ee", background:(MODE_COLOR[t.mode]??"#22d3ee")+"15", padding:"2px 7px", borderRadius:5 }}>{t.mode}</span>
                  </div>
                  <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>{t.org}</p>
                </div>
                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:5, background:ps.bg, color:ps.color }}>{t.plan}</span>
                  <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99, background:ss.bg, color:ss.color }}>
                    <span style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background:ss.dot, marginRight:3, verticalAlign:"middle" }} />
                    {t.status}
                  </span>
                </div>
              </div>

              {/* Solutions */}
              <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:14 }}>
                {t.solutions.map(s=>(
                  <span key={s} style={{ fontSize:10, padding:"2px 8px", borderRadius:5, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.08)" }}>{s}</span>
                ))}
              </div>

              {/* Usage bars */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>Storage</span>
                    <span style={{ fontSize:10, color:"rgba(255,255,255,0.5)" }}>{t.storageUsed}% · {t.storage}</span>
                  </div>
                  <Bar pct={t.storageUsed} color="#60a5fa" />
                </div>
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>Users</span>
                    <span style={{ fontSize:10, color:"rgba(255,255,255,0.5)" }}>{t.users.toLocaleString()} / {t.userLimit === 99999 ? "∞" : t.userLimit.toLocaleString()}</span>
                  </div>
                  <Bar pct={t.userLimit===99999?40:Math.round((t.users/t.userLimit)*100)} color="#a78bfa" />
                </div>
              </div>

              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.28)" }}>Renews {t.renewsOn}</span>
                {t.mrr > 0 && <span style={{ fontSize:13, fontWeight:800, color:"#4ade80" }}>${t.mrr.toLocaleString()}/mo</span>}
              </div>

              {isSelected && (
                <div style={{ display:"flex", gap:8, marginTop:14, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                  {["Manage","Suspend","Upgrade","Delete"].map(a=>(
                    <button key={a} style={{ flex:1, padding:"7px 0", borderRadius:9, fontSize:11, fontWeight:600, cursor:"pointer",
                      background: a==="Manage"?"#c084fc":a==="Upgrade"?"rgba(74,222,128,0.1)":a==="Suspend"?"rgba(251,191,36,0.1)":"rgba(248,113,113,0.1)",
                      color: a==="Manage"?"#050a14":a==="Upgrade"?"#4ade80":a==="Suspend"?"#fbbf24":"#f87171",
                      border:`1px solid ${a==="Manage"?"transparent":a==="Upgrade"?"rgba(74,222,128,0.3)":a==="Suspend"?"rgba(251,191,36,0.3)":"rgba(248,113,113,0.3)"}`,
                    }}>{a}</button>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Create modal */}
      {createOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}>
          <div style={{ width:560, maxHeight:"85vh", overflowY:"auto", background:"#0a0518", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:28 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
              <h3 style={{ fontSize:16, fontWeight:800, color:"#f1f5f9", margin:0 }}>Create New Tenant</h3>
              <button onClick={()=>setCreateOpen(false)} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer", fontSize:22, lineHeight:1 }}>×</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {[
                { label:"Tenant Name (slug)", span:false, placeholder:"e.g. kfshrc-riyadh" },
                { label:"Organization",       span:false },
                { label:"Deployment Mode",    span:false, isSelect:true, options:["SaaS","On-Prem","Hybrid"] },
                { label:"Plan",               span:false, isSelect:true, options:["Enterprise","Standard","Government","Internal"] },
                { label:"Country",            span:false, isSelect:true, options:["Saudi Arabia","UAE","United Kingdom","Qatar","Jordan","Kuwait","Egypt"] },
                { label:"Admin Email",        span:false },
                { label:"Solutions",          span:true,  isSelect:true, options:["HMS","CMS","Pharmacy ERP","LIS","RIS","Telehealth","Patient Portal","MoH","National Health"] },
                { label:"Storage Quota",      span:false, placeholder:"e.g. 500GB" },
                { label:"User Limit",         span:false, placeholder:"e.g. 2000" },
              ].map(f=>(
                <div key={f.label} style={{ gridColumn: f.span?"1/-1":"auto", display:"flex", flexDirection:"column", gap:5 }}>
                  <label style={{ fontSize:11, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.07em" }}>{f.label}</label>
                  {f.isSelect
                    ? <select style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:13, outline:"none" }}>
                        {f.options?.map(o=><option key={o}>{o}</option>)}
                      </select>
                    : <input placeholder={f.placeholder??""} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:13, outline:"none" }} />
                  }
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button style={{ background:"#c084fc", color:"#050a14", border:"none", borderRadius:11, padding:"10px 24px", fontSize:13, fontWeight:800, cursor:"pointer" }}>Provision Tenant</button>
              <button onClick={()=>setCreateOpen(false)} style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:11, padding:"10px 18px", fontSize:13, cursor:"pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
