"use client";

import Link from "next/link";

const STATS = [
  { label:"Total Tenants",     value:"42",     delta:"+3 this month",  color:"#c084fc" },
  { label:"Organizations",     value:"284",    delta:"+18 this month", color:"#22d3ee" },
  { label:"Active Facilities", value:"1,240",  delta:"+42 this month", color:"#4ade80" },
  { label:"System Users",      value:"18,492", delta:"+312 this month",color:"#fbbf24" },
  { label:"Active Licenses",   value:"3,840",  delta:"99.2% utilized", color:"#fb923c" },
  { label:"API Calls (24h)",   value:"2.4M",   delta:"+8.3% vs avg",   color:"#60a5fa" },
  { label:"Uptime (30d)",      value:"99.97%", delta:"0 incidents",    color:"#34d399" },
  { label:"AI Requests (24h)", value:"184K",   delta:"Claude AI",      color:"#a78bfa" },
];

const TENANTS = [
  { id:"T-001", name:"King Faisal Specialist Hospital", country:"SA", tier:"Enterprise", facilities:14, users:4200, status:"ACTIVE",    lastSeen:"2m ago"  },
  { id:"T-002", name:"NHS East Midlands Trust",         country:"GB", tier:"Enterprise", facilities:6,  users:1800, status:"ACTIVE",    lastSeen:"5m ago"  },
  { id:"T-003", name:"Abu Dhabi Health Services",       country:"AE", tier:"Enterprise", facilities:22, users:6100, status:"ACTIVE",    lastSeen:"1m ago"  },
  { id:"T-004", name:"MOH Saudi Arabia",                country:"SA", tier:"Government", facilities:200,users:8000, status:"ACTIVE",    lastSeen:"12m ago" },
  { id:"T-005", name:"Al Rayan Medical Group",          country:"QA", tier:"Enterprise", facilities:8,  users:2100, status:"ACTIVE",    lastSeen:"3m ago"  },
  { id:"T-006", name:"Cairo University Hospital",       country:"EG", tier:"Standard",   facilities:3,  users:620,  status:"ACTIVE",    lastSeen:"1h ago"  },
  { id:"T-007", name:"Jordan Royal Medical Services",   country:"JO", tier:"Government", facilities:11, users:1950, status:"ACTIVE",    lastSeen:"20m ago" },
  { id:"T-008", name:"Demo Environment",                country:"--", tier:"Internal",   facilities:5,  users:50,   status:"DEMO",      lastSeen:"Just now"},
];

const RECENT_ACTIVITY = [
  { time:"09:14", action:"Tenant created",            subject:"Al-Borg Diagnostics (EG)", actor:"admin",    color:"#4ade80" },
  { time:"09:02", action:"License upgraded",          subject:"T-003 → Unlimited",        actor:"billing",  color:"#fbbf24" },
  { time:"08:55", action:"User suspended",            subject:"dr.testuser@demo.com",     actor:"security", color:"#f87171" },
  { time:"08:41", action:"New facility registered",   subject:"KFSH Jeddah Branch",       actor:"admin",    color:"#22d3ee" },
  { time:"08:30", action:"Subscription renewed",      subject:"NHS East Midlands",         actor:"billing",  color:"#4ade80" },
  { time:"08:22", action:"AI usage threshold alert",  subject:"T-001 — 90% quota",        actor:"system",   color:"#f97316" },
  { time:"07:58", action:"FHIR sync completed",       subject:"MOH SA — 18,442 records",  actor:"system",   color:"#a78bfa" },
  { time:"07:30", action:"Security audit passed",     subject:"Quarterly SOC-2 check",    actor:"security", color:"#34d399" },
];

const SOLUTIONS_STATUS = [
  { name:"HMS",         active:24,  color:"#22d3ee" },
  { name:"CMS",         active:118, color:"#4ade80" },
  { name:"Pharmacy ERP",active:64,  color:"#a78bfa" },
  { name:"LIS",         active:86,  color:"#fbbf24" },
  { name:"RIS",         active:52,  color:"#60a5fa" },
  { name:"Telehealth",  active:38,  color:"#34d399" },
  { name:"Patient Portal",active:9200, color:"#f472b6" },
  { name:"MoH",         active:4,   color:"#e67e22" },
];

const TIER_BADGE: Record<string, { bg: string; color: string }> = {
  Enterprise: { bg:"rgba(230,126,34,0.12)",  color:"#fb923c" },
  Standard:   { bg:"rgba(34,211,238,0.1)",   color:"#22d3ee" },
  Government: { bg:"rgba(251,191,36,0.1)",   color:"#fbbf24" },
  Internal:   { bg:"rgba(192,132,252,0.12)", color:"#c084fc" },
};

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  ACTIVE:    { bg:"rgba(74,222,128,0.1)",  color:"#4ade80" },
  SUSPENDED: { bg:"rgba(248,113,113,0.1)", color:"#f87171" },
  DEMO:      { bg:"rgba(192,132,252,0.1)", color:"#c084fc" },
};

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function SuperAdminDashboard() {
  return (
    <div style={{ padding:"28px 28px 48px", minHeight:"100vh", color:"#f1f5f9" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0, letterSpacing:"-0.3px" }}>Network Overview</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)", marginTop:4 }}>
            CyMed Health Network · {new Date().toLocaleDateString("en-SA", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
          </p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Link href="/superadmin/tenants/new" style={{ padding:"8px 18px", borderRadius:10, background:"#c084fc", color:"#050a14", fontSize:12, fontWeight:800, textDecoration:"none" }}>+ New Tenant</Link>
          <Link href="/superadmin/organizations/new" style={{ padding:"8px 18px", borderRadius:10, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.6)", border:"1px solid rgba(255,255,255,0.1)", fontSize:12, fontWeight:600, textDecoration:"none" }}>+ Organization</Link>
        </div>
      </div>

      {/* KPI grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
        {STATS.map(s => (
          <Card key={s.label} style={{ padding:18 }}>
            <p style={{ fontSize:26, fontWeight:800, color:s.color, lineHeight:1, margin:0 }}>{s.value}</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.38)", margin:"4px 0 3px" }}>{s.label}</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.25)", margin:0 }}>{s.delta}</p>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16, marginBottom:16 }}>
        {/* Tenant list */}
        <Card>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>Tenants</h3>
            <Link href="/superadmin/tenants" style={{ fontSize:11, color:"#c084fc", textDecoration:"none" }}>View all →</Link>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                {["Organization","Country","Tier","Facilities","Users","Status","Last Active"].map(h => (
                  <th key={h} style={{ padding:"9px 14px", textAlign:"left", fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TENANTS.map(t => {
                const tb = TIER_BADGE[t.tier] ?? TIER_BADGE.Standard;
                const sb = STATUS_BADGE[t.status] ?? STATUS_BADGE.ACTIVE;
                return (
                  <tr key={t.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer" }}>
                    <td style={{ padding:"10px 14px" }}>
                      <p style={{ color:"#f1f5f9", fontWeight:600, margin:0 }}>{t.name}</p>
                      <p style={{ fontSize:10, color:"rgba(255,255,255,0.28)", margin:0 }}>{t.id}</p>
                    </td>
                    <td style={{ padding:"10px 14px" }}>
                      <span style={{ fontSize:11, fontWeight:800, color:"#22d3ee" }}>{t.country}</span>
                    </td>
                    <td style={{ padding:"10px 14px" }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:5, background:tb.bg, color:tb.color }}>{t.tier}</span>
                    </td>
                    <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.55)" }}>{t.facilities}</td>
                    <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.55)" }}>{t.users.toLocaleString()}</td>
                    <td style={{ padding:"10px 14px" }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99, background:sb.bg, color:sb.color }}>{t.status}</span>
                    </td>
                    <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.3)", fontSize:11 }}>{t.lastSeen}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {/* Activity + Solutions */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Solutions status */}
          <Card style={{ padding:18 }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Active Solutions</h3>
            {SOLUTIONS_STATUS.map(s => (
              <div key={s.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:s.color, flexShrink:0 }} />
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.55)" }}>{s.name}</span>
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:s.color }}>{s.active.toLocaleString()}</span>
              </div>
            ))}
          </Card>

          {/* Recent activity */}
          <Card style={{ padding:18, flex:1 }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Recent Activity</h3>
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} style={{ display:"flex", gap:10, marginBottom:10 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:a.color, flexShrink:0, marginTop:4 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.6)", margin:0 }}>{a.action}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.subject}</p>
                </div>
                <span style={{ fontSize:10, color:"rgba(255,255,255,0.22)", flexShrink:0 }}>{a.time}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        {[
          { label:"Create Tenant",        href:"/superadmin/tenants/new",       color:"#c084fc", desc:"Add SaaS or standalone" },
          { label:"Register Organization",href:"/superadmin/organizations/new", color:"#22d3ee", desc:"Hospital, clinic, MOH…"  },
          { label:"Manage Licenses",      href:"/superadmin/licensing",         color:"#fbbf24", desc:"Assign & audit licenses" },
          { label:"User Management",      href:"/superadmin/users",             color:"#4ade80", desc:"All platform users"      },
        ].map(a => (
          <Link key={a.label} href={a.href} style={{ padding:"18px", borderRadius:14, background:`${a.color}0D`, border:`1px solid ${a.color}25`, textDecoration:"none", display:"block", transition:"all 0.15s" }}>
            <p style={{ fontSize:13, fontWeight:700, color:a.color, margin:"0 0 4px" }}>{a.label} →</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.38)", margin:0 }}>{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
