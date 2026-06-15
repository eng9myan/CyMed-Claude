"use client";

import { useState } from "react";

type Org = {
  id: string; name: string; type: string; country: string; city: string;
  facilities: number; users: number; tier: string; status: string; created: string; contact: string;
};

const ORGS: Org[] = [
  { id:"ORG-001", name:"King Faisal Specialist Hospital & RC", type:"Hospital",          country:"SA", city:"Riyadh",      facilities:14, users:4200, tier:"Enterprise", status:"ACTIVE", created:"2024-01-15", contact:"admin@kfshrc.edu.sa"    },
  { id:"ORG-002", name:"NHS East Midlands Trust",              type:"Hospital Network",  country:"GB", city:"Nottingham",  facilities:6,  users:1800, tier:"Enterprise", status:"ACTIVE", created:"2024-02-08", contact:"it@nhs-em.nhs.uk"        },
  { id:"ORG-003", name:"Abu Dhabi Health Services (SEHA)",     type:"Healthcare Group",  country:"AE", city:"Abu Dhabi",   facilities:22, users:6100, tier:"Enterprise", status:"ACTIVE", created:"2024-01-22", contact:"admin@seha.ae"           },
  { id:"ORG-004", name:"Ministry of Health — Saudi Arabia",    type:"Ministry",          country:"SA", city:"Riyadh",      facilities:200,users:8000, tier:"Government", status:"ACTIVE", created:"2024-03-01", contact:"digital@moh.gov.sa"      },
  { id:"ORG-005", name:"Al Rayan Medical Group",               type:"Healthcare Group",  country:"QA", city:"Doha",        facilities:8,  users:2100, tier:"Enterprise", status:"ACTIVE", created:"2024-04-10", contact:"admin@alrayan.qa"        },
  { id:"ORG-006", name:"Cairo University Hospital",            type:"Hospital",          country:"EG", city:"Cairo",       facilities:3,  users:620,  tier:"Standard",   status:"ACTIVE", created:"2024-05-18", contact:"it@cu-hospital.edu.eg"   },
  { id:"ORG-007", name:"Jordan Royal Medical Services",        type:"Government Health", country:"JO", city:"Amman",       facilities:11, users:1950, tier:"Government", status:"ACTIVE", created:"2024-02-28", contact:"admin@rms.jo"            },
  { id:"ORG-008", name:"Kuwait Ministry of Health",            type:"Ministry",          country:"KW", city:"Kuwait City", facilities:45, users:5800, tier:"Government", status:"ACTIVE", created:"2024-06-01", contact:"digital@moh.gov.kw"      },
  { id:"ORG-009", name:"Medcare Hospital Group",               type:"Healthcare Group",  country:"AE", city:"Dubai",       facilities:5,  users:980,  tier:"Standard",   status:"ACTIVE", created:"2024-07-12", contact:"admin@medcare.ae"        },
  { id:"ORG-010", name:"Demo Organization",                    type:"Demo",              country:"--", city:"—",           facilities:2,  users:25,   tier:"Internal",   status:"DEMO",   created:"2024-01-01", contact:"demo@cymed.health"       },
];

const ORG_TYPES = ["ALL","Hospital","Hospital Network","Healthcare Group","Ministry","Government Health","Clinic","Pharmacy","Laboratory","Demo"];

const TIER_STYLE: Record<string, { bg: string; color: string }> = {
  Enterprise: { bg:"rgba(230,126,34,0.12)",  color:"#fb923c" },
  Standard:   { bg:"rgba(34,211,238,0.1)",   color:"#22d3ee" },
  Government: { bg:"rgba(251,191,36,0.1)",   color:"#fbbf24" },
  Internal:   { bg:"rgba(192,132,252,0.12)", color:"#c084fc" },
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ACTIVE:    { bg:"rgba(74,222,128,0.1)",  color:"#4ade80" },
  SUSPENDED: { bg:"rgba(248,113,113,0.1)", color:"#f87171" },
  DEMO:      { bg:"rgba(192,132,252,0.1)", color:"#c084fc" },
};

const COUNTRY_COLOR: Record<string, string> = { SA:"#22d3ee", GB:"#60a5fa", AE:"#34d399", QA:"#f472b6", JO:"#fb923c", KW:"#fbbf24", EG:"#a78bfa" };

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

type DrawerMode = "create" | "view" | null;

export default function OrganizationsPage() {
  const [filter, setFilter]     = useState("ALL");
  const [search, setSearch]     = useState("");
  const [drawer, setDrawer]     = useState<DrawerMode>(null);
  const [selected, setSelected] = useState<Org | null>(null);

  const displayed = ORGS.filter(o =>
    (filter === "ALL" || o.type === filter) &&
    (!search || o.name.toLowerCase().includes(search.toLowerCase()) || o.country.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding:"28px 28px 48px", minHeight:"100vh", color:"#f1f5f9" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Organizations</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)", marginTop:4 }}>{ORGS.length} total · {ORGS.filter(o=>o.status==="ACTIVE").length} active</p>
        </div>
        <button onClick={()=>{setSelected(null);setDrawer("create");}} style={{ padding:"8px 20px", borderRadius:10, background:"#c084fc", color:"#050a14", fontSize:12, fontWeight:800, border:"none", cursor:"pointer" }}>
          + Create Organization
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
        {([
          ["Total",      ORGS.length,                                 "#60a5fa"],
          ["Enterprise", ORGS.filter(o=>o.tier==="Enterprise").length,"#fb923c"],
          ["Government", ORGS.filter(o=>o.tier==="Government").length,"#fbbf24"],
          ["Countries",  new Set(ORGS.map(o=>o.country)).size,        "#4ade80"],
        ] as [string,number,string][]).map(([l,v,c])=>(
          <Card key={l} style={{ padding:16 }}>
            <p style={{ fontSize:26, fontWeight:800, color:c, lineHeight:1, margin:0 }}>{v}</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.38)", marginTop:4 }}>{l}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search organizations…"
          style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"7px 14px", color:"#f1f5f9", fontSize:12, outline:"none", width:220 }} />
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {ORG_TYPES.slice(0,6).map(t=>(
            <button key={t} onClick={()=>setFilter(t)} style={{
              padding:"5px 12px", borderRadius:8, fontSize:11, fontWeight:600, cursor:"pointer",
              background: filter===t?"rgba(192,132,252,0.15)":"transparent",
              border:`1px solid ${filter===t?"rgba(192,132,252,0.35)":"rgba(255,255,255,0.1)"}`,
              color: filter===t?"#c084fc":"rgba(255,255,255,0.4)",
            }}>{t}</button>
          ))}
        </div>
      </div>

      <Card>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              {["Organization","Type","Country","Facilities","Users","Tier","Status","Created",""].map(h=>(
                <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map(o=>{
              const ts = TIER_STYLE[o.tier]??TIER_STYLE.Standard;
              const ss = STATUS_STYLE[o.status]??STATUS_STYLE.ACTIVE;
              return (
                <tr key={o.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer" }}
                  onClick={()=>{setSelected(o);setDrawer("view");}}>
                  <td style={{ padding:"11px 14px" }}>
                    <p style={{ color:"#f1f5f9", fontWeight:600, margin:0 }}>{o.name}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.28)", margin:0 }}>{o.id} · {o.city}</p>
                  </td>
                  <td style={{ padding:"11px 14px", color:"rgba(255,255,255,0.5)" }}>{o.type}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{ fontSize:11, fontWeight:800, color:COUNTRY_COLOR[o.country]??"#60a5fa" }}>{o.country}</span>
                  </td>
                  <td style={{ padding:"11px 14px", color:"rgba(255,255,255,0.6)" }}>{o.facilities}</td>
                  <td style={{ padding:"11px 14px", color:"rgba(255,255,255,0.6)" }}>{o.users.toLocaleString()}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:5, background:ts.bg, color:ts.color }}>{o.tier}</span>
                  </td>
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99, background:ss.bg, color:ss.color }}>{o.status}</span>
                  </td>
                  <td style={{ padding:"11px 14px", color:"rgba(255,255,255,0.3)", fontSize:11 }}>{o.created}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button style={{ fontSize:10, color:"#c084fc", background:"rgba(192,132,252,0.12)", border:"1px solid rgba(192,132,252,0.25)", borderRadius:7, padding:"3px 9px", cursor:"pointer" }}>Manage</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Drawer */}
      {drawer && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:100, display:"flex", justifyContent:"flex-end" }} onClick={()=>setDrawer(null)}>
          <div style={{ width:480, height:"100%", overflowY:"auto", background:"#0a0518", borderLeft:"1px solid rgba(255,255,255,0.1)", padding:28 }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
              <h2 style={{ fontSize:16, fontWeight:800, color:"#f1f5f9", margin:0 }}>{drawer==="create"?"Create Organization":"Organization Details"}</h2>
              <button onClick={()=>setDrawer(null)} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer", fontSize:22, lineHeight:1 }}>×</button>
            </div>

            {drawer === "view" && selected ? (
              <>
                {([
                  ["Organization ID", selected.id], ["Name", selected.name], ["Type", selected.type],
                  ["Country", selected.country], ["City", selected.city],
                  ["Facilities", String(selected.facilities)], ["Users", selected.users.toLocaleString()],
                  ["Tier", selected.tier], ["Status", selected.status], ["Created", selected.created],
                  ["Contact", selected.contact],
                ] as [string,string][]).map(([l,v])=>(
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{l}</span>
                    <span style={{ fontSize:12, color:"#e2e8f0", fontWeight:500, textAlign:"right", maxWidth:280 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:"flex", gap:8, marginTop:20 }}>
                  {["Edit","Suspend","Delete"].map(a=>(
                    <button key={a} style={{ flex:1, padding:"9px 0", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer",
                      background: a==="Edit"?"#c084fc":a==="Suspend"?"rgba(251,191,36,0.1)":"rgba(248,113,113,0.1)",
                      color: a==="Edit"?"#050a14":a==="Suspend"?"#fbbf24":"#f87171",
                      border:`1px solid ${a==="Edit"?"transparent":a==="Suspend"?"rgba(251,191,36,0.3)":"rgba(248,113,113,0.3)"}`,
                    }}>{a}</button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display:"grid", gap:16 }}>
                {[
                  { label:"Organization Name", placeholder:"King Abdullah Medical Center" },
                  { label:"Organization Type", isSelect:true, options:ORG_TYPES.slice(1) },
                  { label:"Country", isSelect:true, options:["Saudi Arabia","UAE","United Kingdom","Qatar","Jordan","Kuwait","Egypt","United States"] },
                  { label:"City / Region" },
                  { label:"Primary Contact Email" },
                  { label:"Phone Number" },
                  { label:"License Tier", isSelect:true, options:["Enterprise","Standard","Government","Internal"] },
                ].map(f=>(
                  <div key={f.label} style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    <label style={{ fontSize:11, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.07em" }}>{f.label}</label>
                    {f.isSelect ? (
                      <select style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:13, outline:"none" }}>
                        {f.options?.map(o=><option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input placeholder={f.placeholder??""} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:13, outline:"none" }} />
                    )}
                  </div>
                ))}
                <button style={{ padding:"10px", borderRadius:12, background:"#c084fc", color:"#050a14", fontSize:13, fontWeight:800, border:"none", cursor:"pointer", marginTop:4 }}>
                  Create Organization
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
