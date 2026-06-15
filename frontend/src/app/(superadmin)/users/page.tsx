"use client";

import { useState } from "react";

type User = {
  id: string; name: string; email: string; role: string; tenant: string;
  solutions: string[]; lastLogin: string; status: string; mfa: boolean; country: string;
};

const USERS: User[] = [
  { id:"USR-001", name:"Dr. Ahmad Al-Mutawa",    email:"a.mutawa@kfshrc.edu.sa",    role:"Physician",         tenant:"T-001", solutions:["HMS"],                   lastLogin:"2m ago",   status:"ACTIVE",  mfa:true,  country:"SA" },
  { id:"USR-002", name:"Nurse Aisha Al-Barrak",  email:"a.barrak@kfshrc.edu.sa",    role:"Head Nurse",        tenant:"T-001", solutions:["HMS"],                   lastLogin:"5m ago",   status:"ACTIVE",  mfa:true,  country:"SA" },
  { id:"USR-003", name:"Dr. James Thompson",     email:"j.thompson@nhs-em.nhs.uk",  role:"Consultant",        tenant:"T-002", solutions:["HMS","Telehealth"],       lastLogin:"1h ago",   status:"ACTIVE",  mfa:true,  country:"GB" },
  { id:"USR-004", name:"Fatima Al-Rashidi",      email:"f.rashidi@seha.ae",         role:"Lab Technician",    tenant:"T-003", solutions:["LIS"],                   lastLogin:"15m ago",  status:"ACTIVE",  mfa:false, country:"AE" },
  { id:"USR-005", name:"Mohammed Al-Ghamdi",     email:"m.ghamdi@moh.gov.sa",       role:"System Admin",      tenant:"T-004", solutions:["MoH","National"],        lastLogin:"30m ago",  status:"ACTIVE",  mfa:true,  country:"SA" },
  { id:"USR-006", name:"Dr. Layla Al-Qahtani",   email:"l.qahtani@alrayan.qa",      role:"Radiologist",       tenant:"T-005", solutions:["RIS"],                   lastLogin:"2h ago",   status:"ACTIVE",  mfa:true,  country:"QA" },
  { id:"USR-007", name:"Omar Pharmacy",          email:"o.pharma@cu-hosp.edu.eg",   role:"Pharmacist",        tenant:"T-006", solutions:["Pharmacy ERP"],          lastLogin:"3h ago",   status:"ACTIVE",  mfa:false, country:"EG" },
  { id:"USR-008", name:"Billing Admin",          email:"billing@rms.jo",            role:"Billing Manager",   tenant:"T-007", solutions:["HMS"],                   lastLogin:"1d ago",   status:"ACTIVE",  mfa:false, country:"JO" },
  { id:"USR-009", name:"Demo Physician",         email:"doctor@cymed.demo",         role:"Demo User",         tenant:"T-008", solutions:["HMS","LIS","RIS"],       lastLogin:"Just now", status:"DEMO",    mfa:false, country:"--" },
  { id:"USR-010", name:"Suspended User",         email:"suspended@test.com",        role:"Nurse",             tenant:"T-006", solutions:["HMS"],                   lastLogin:"30d ago",  status:"SUSPENDED",mfa:false,country:"EG" },
];

const ROLES = ["ALL","Physician","Nurse","Head Nurse","Pharmacist","Lab Technician","Radiologist","Billing Manager","System Admin","Demo User"];

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  ACTIVE:    { bg:"rgba(74,222,128,0.1)",  color:"#4ade80", dot:"#4ade80" },
  SUSPENDED: { bg:"rgba(248,113,113,0.1)", color:"#f87171", dot:"#f87171" },
  DEMO:      { bg:"rgba(192,132,252,0.1)", color:"#c084fc", dot:"#c084fc" },
};

const COUNTRY_COLOR: Record<string, string> = { SA:"#22d3ee", GB:"#60a5fa", AE:"#34d399", QA:"#f472b6", JO:"#fb923c", KW:"#fbbf24", EG:"#a78bfa" };

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function UsersPage() {
  const [filterRole, setFilterRole]     = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch]             = useState("");
  const [selected, setSelected]         = useState<User | null>(null);

  const displayed = USERS.filter(u =>
    (filterRole === "ALL" || u.role === filterRole) &&
    (filterStatus === "ALL" || u.status === filterStatus) &&
    (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding:"28px 28px 48px", minHeight:"100vh", color:"#f1f5f9" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>User Management</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)", marginTop:4 }}>
            {USERS.length} total · {USERS.filter(u=>u.mfa).length} MFA enabled · {USERS.filter(u=>u.status==="SUSPENDED").length} suspended
          </p>
        </div>
        <button style={{ padding:"8px 20px", borderRadius:10, background:"#c084fc", color:"#050a14", fontSize:12, fontWeight:800, border:"none", cursor:"pointer" }}>
          + Create User
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:20 }}>
        {([
          ["Total Users",   USERS.length,                              "#c084fc"],
          ["Active",        USERS.filter(u=>u.status==="ACTIVE").length,"#4ade80"],
          ["MFA Enabled",   USERS.filter(u=>u.mfa).length,             "#22d3ee"],
          ["Suspended",     USERS.filter(u=>u.status==="SUSPENDED").length,"#f87171"],
          ["Countries",     new Set(USERS.map(u=>u.country)).size,     "#fbbf24"],
        ] as [string,number,string][]).map(([l,v,c])=>(
          <Card key={l} style={{ padding:16 }}>
            <p style={{ fontSize:26, fontWeight:800, color:c, lineHeight:1, margin:0 }}>{v}</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.38)", marginTop:4 }}>{l}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or email…"
          style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"7px 14px", color:"#f1f5f9", fontSize:12, outline:"none", width:240 }} />
        <div style={{ display:"flex", gap:5 }}>
          {["ALL","ACTIVE","SUSPENDED","DEMO"].map(s=>{
            const ss = STATUS_STYLE[s];
            return (
              <button key={s} onClick={()=>setFilterStatus(s)} style={{
                padding:"5px 12px", borderRadius:8, fontSize:11, fontWeight:600, cursor:"pointer",
                background: filterStatus===s?(ss?.bg??"rgba(192,132,252,0.15)"):"transparent",
                border:`1px solid ${filterStatus===s?(ss?.color??"#c084fc")+"50":"rgba(255,255,255,0.1)"}`,
                color: filterStatus===s?(ss?.color??"#c084fc"):"rgba(255,255,255,0.4)",
              }}>{s}</button>
            );
          })}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:selected?"1fr 360px":"1fr", gap:16 }}>
        <Card>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                {["User","Role","Tenant","Solutions","Country","MFA","Status","Last Login",""].map(h=>(
                  <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map(u=>{
                const ss = STATUS_STYLE[u.status]??STATUS_STYLE.ACTIVE;
                return (
                  <tr key={u.id} onClick={()=>setSelected(selected?.id===u.id?null:u)}
                    style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer", background:selected?.id===u.id?"rgba(192,132,252,0.05)":"transparent" }}>
                    <td style={{ padding:"11px 14px" }}>
                      <p style={{ color:"#f1f5f9", fontWeight:600, margin:0 }}>{u.name}</p>
                      <p style={{ fontSize:10, color:"rgba(255,255,255,0.28)", margin:0 }}>{u.email}</p>
                    </td>
                    <td style={{ padding:"11px 14px", color:"rgba(255,255,255,0.5)", fontSize:11 }}>{u.role}</td>
                    <td style={{ padding:"11px 14px" }}>
                      <code style={{ fontSize:10, color:"#c084fc", background:"rgba(192,132,252,0.1)", padding:"2px 6px", borderRadius:4 }}>{u.tenant}</code>
                    </td>
                    <td style={{ padding:"11px 14px" }}>
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                        {u.solutions.slice(0,2).map(s=>(
                          <span key={s} style={{ fontSize:9, padding:"1px 6px", borderRadius:4, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.45)" }}>{s}</span>
                        ))}
                        {u.solutions.length>2 && <span style={{ fontSize:9, color:"rgba(255,255,255,0.3)" }}>+{u.solutions.length-2}</span>}
                      </div>
                    </td>
                    <td style={{ padding:"11px 14px" }}>
                      <span style={{ fontSize:11, fontWeight:800, color:COUNTRY_COLOR[u.country]??"#60a5fa" }}>{u.country}</span>
                    </td>
                    <td style={{ padding:"11px 14px" }}>
                      <span style={{ fontSize:10, fontWeight:700, color:u.mfa?"#4ade80":"rgba(255,255,255,0.25)" }}>{u.mfa?"✓ ON":"OFF"}</span>
                    </td>
                    <td style={{ padding:"11px 14px" }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99, background:ss.bg, color:ss.color }}>
                        <span style={{ display:"inline-block", width:4, height:4, borderRadius:"50%", background:ss.dot, marginRight:4, verticalAlign:"middle" }} />
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding:"11px 14px", color:"rgba(255,255,255,0.3)", fontSize:11 }}>{u.lastLogin}</td>
                    <td style={{ padding:"11px 14px" }}>
                      <button style={{ fontSize:10, color:"#c084fc", background:"rgba(192,132,252,0.1)", border:"1px solid rgba(192,132,252,0.25)", borderRadius:7, padding:"3px 9px", cursor:"pointer" }}>Edit</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {selected && (
          <Card style={{ padding:20, alignSelf:"start", position:"sticky", top:20 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#c084fc,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:"white" }}>
                {selected.name[0]}
              </div>
              <button onClick={()=>setSelected(null)} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer", fontSize:20, lineHeight:1 }}>×</button>
            </div>
            <p style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", margin:"0 0 2px" }}>{selected.name}</p>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", margin:"0 0 16px" }}>{selected.email}</p>
            {([
              ["User ID", selected.id], ["Role", selected.role], ["Tenant", selected.tenant],
              ["Country", selected.country], ["MFA", selected.mfa?"Enabled":"Disabled"],
              ["Status", selected.status], ["Last Login", selected.lastLogin],
            ] as [string,string][]).map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{l}</span>
                <span style={{ fontSize:12, color:"#e2e8f0", fontWeight:500 }}>{v}</span>
              </div>
            ))}
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.28)", margin:"14px 0 6px", textTransform:"uppercase", letterSpacing:"0.07em" }}>Solutions</p>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {selected.solutions.map(s=>(
                <span key={s} style={{ fontSize:11, padding:"3px 9px", borderRadius:7, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.55)", border:"1px solid rgba(255,255,255,0.08)" }}>{s}</span>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, marginTop:16 }}>
              {["Edit","Reset Pwd","Suspend"].map(a=>(
                <button key={a} style={{ flex:1, padding:"8px 0", borderRadius:9, fontSize:11, fontWeight:600, cursor:"pointer",
                  background: a==="Edit"?"#c084fc":a==="Reset Pwd"?"rgba(34,211,238,0.1)":"rgba(248,113,113,0.1)",
                  color: a==="Edit"?"#050a14":a==="Reset Pwd"?"#22d3ee":"#f87171",
                  border:`1px solid ${a==="Edit"?"transparent":a==="Reset Pwd"?"rgba(34,211,238,0.3)":"rgba(248,113,113,0.3)"}`,
                }}>{a}</button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
