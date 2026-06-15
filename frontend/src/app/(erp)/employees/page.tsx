"use client";
import { useState } from "react";
import { Users, Search, Plus, Mail, Phone, Award, Briefcase, FileText, GraduationCap, TrendingUp, MapPin } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

type Employee = {
  id: string; name: string; role: string; dept: string; grade: string;
  salary: number; status: "active"|"leave"|"notice"|"probation"; email: string; phone: string;
  joinedAt: string; manager?: string; nationality: string; gosi: string;
  skills: string[]; certs: { name: string; expires: string; }[];
  contracts: { type: string; from: string; to: string; status: string }[];
  trainings: { name: string; completed: string; score?: number }[];
  performance: { period: string; rating: number; comment: string }[];
};

const EMPLOYEES: Employee[] = [
  { id:"EMP-1041", name:"Dr. Layla Al-Mutawa", role:"Consultant — Internal Medicine", dept:"Internal Medicine", grade:"A4", salary:42000, status:"active", email:"l.almutawa@cymed.sa", phone:"+966-50-1234567", joinedAt:"2018-03-14", manager:"CMO Hassan", nationality:"Saudi", gosi:"1041-2018-A41",
    skills:["Internal Medicine","Critical Care","Endocrinology","Diabetes","Teaching","Research"],
    certs:[{ name:"Saudi Board IM",  expires:"2028-04-22" },{ name:"BLS",          expires:"2026-09-12" },{ name:"ACLS",  expires:"2026-08-08" }],
    contracts:[{ type:"Permanent",  from:"2018-03-14", to:"—",          status:"active" },{ type:"Probation",  from:"2018-03-14", to:"2018-09-14", status:"completed" }],
    trainings:[{ name:"JCI standards 2026",   completed:"2026-03-12", score:96 },{ name:"Patient safety",      completed:"2026-01-22", score:92 },{ name:"Infection control",   completed:"2025-11-08", score:88 }],
    performance:[{ period:"2025", rating:4.5, comment:"Exceeds expectations — research output and patient outcomes." },{ period:"2024", rating:4.3, comment:"Strong clinical performance." }],
  },
  { id:"EMP-1042", name:"Dr. Ahmed Al-Ghamdi", role:"Cardiologist", dept:"Cardiology", grade:"A4", salary:48000, status:"active", email:"a.alghamdi@cymed.sa", phone:"+966-50-1234568", joinedAt:"2016-08-01", manager:"CMO Hassan", nationality:"Saudi", gosi:"1042-2016-A42",
    skills:["Interventional Cardiology","Echo","Cath Lab","Heart Failure"], certs:[{ name:"Saudi Board Cardiology", expires:"2027-06-10" }],
    contracts:[{ type:"Permanent", from:"2016-08-01", to:"—", status:"active" }],
    trainings:[{ name:"Cath lab refresher", completed:"2026-02-18" }],
    performance:[{ period:"2025", rating:4.8, comment:"Outstanding interventional outcomes; top decile." }],
  },
  { id:"EMP-1043", name:"Sr. Nurse Layla Hassan", role:"Senior ICU Nurse", dept:"ICU", grade:"B3", salary:18500, status:"active", email:"l.hassan@cymed.sa", phone:"+966-50-1234569", joinedAt:"2019-05-12", manager:"DON Reem", nationality:"Filipino", gosi:"1043-2019-B33",
    skills:["Critical care","Ventilator management","ECG","CPR","Wound care"], certs:[{ name:"BLS", expires:"2026-08-14" },{ name:"ACLS", expires:"2026-08-14" },{ name:"PALS", expires:"2027-02-22" }],
    contracts:[{ type:"3-year contract", from:"2025-05-12", to:"2028-05-12", status:"active" }],
    trainings:[{ name:"Sepsis bundle", completed:"2026-04-08", score:95 },{ name:"Ventilator basics", completed:"2026-01-15", score:91 }],
    performance:[{ period:"2025", rating:4.6, comment:"Excellent bedside skills, mentors junior staff." }],
  },
  { id:"EMP-1044", name:"Pharm. Sami Al-Otaibi", role:"Lead Pharmacist", dept:"Pharmacy", grade:"B4", salary:22000, status:"active", email:"s.alotaibi@cymed.sa", phone:"+966-50-1234570", joinedAt:"2020-11-04", manager:"Director Khalid", nationality:"Saudi", gosi:"1044-2020-B44",
    skills:["Clinical pharmacy","CD management","TPN","Chemo prep"], certs:[{ name:"Saudi Pharm Council", expires:"2028-11-04" }],
    contracts:[{ type:"Permanent", from:"2020-11-04", to:"—", status:"active" }],
    trainings:[{ name:"USP 797/800", completed:"2026-03-22", score:94 }],
    performance:[{ period:"2025", rating:4.4, comment:"Strong leadership of compounding team." }],
  },
  { id:"EMP-1045", name:"Tech. Hassan Mohammed", role:"Lab Technician", dept:"Laboratory", grade:"C2", salary:9800, status:"probation", email:"h.mohammed@cymed.sa", phone:"+966-50-1234571", joinedAt:"2026-04-01", manager:"Lab Lead Omar", nationality:"Egyptian", gosi:"1045-2026-C32",
    skills:["Chemistry analyzers","Phlebotomy","QC"], certs:[{ name:"MT Saudi", expires:"2028-04-01" }],
    contracts:[{ type:"Probation 3-month", from:"2026-04-01", to:"2026-07-01", status:"active" }], trainings:[], performance:[],
  },
  { id:"EMP-1047", name:"Acc. Reem Bin Salem", role:"Senior Accountant", dept:"Finance", grade:"B2", salary:14500, status:"leave", email:"r.binsalem@cymed.sa", phone:"+966-50-1234573", joinedAt:"2021-07-22", manager:"CFO Hassan", nationality:"Saudi", gosi:"1047-2021-B22",
    skills:["IFRS","Tax","Reconciliation","SAP"], certs:[{ name:"SOCPA", expires:"2027-12-31" }],
    contracts:[{ type:"Permanent", from:"2021-07-22", to:"—", status:"active" }],
    trainings:[{ name:"ZATCA phase 2", completed:"2026-02-08", score:88 }],
    performance:[{ period:"2025", rating:4.2, comment:"Reliable, detail-oriented." }],
  },
];

const STATUS: Record<string,{c:string;bg:string}> = {
  active:{c:"#4ade80",bg:"rgba(74,222,128,0.1)"},
  leave:{c:"#fbbf24",bg:"rgba(251,191,36,0.1)"},
  notice:{c:"#fb923c",bg:"rgba(251,146,60,0.1)"},
  probation:{c:"#a78bfa",bg:"rgba(167,139,250,0.1)"},
};

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(EMPLOYEES[0]);
  const [tab, setTab] = useState<"profile"|"skills"|"contracts"|"training"|"performance">("profile");

  const filtered = EMPLOYEES.filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.id.includes(search) || e.dept.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Employees</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Directory · Skills · Contracts · Training · Performance · Saudi labor law / GOSI compliant</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.3)", color:"#a78bfa", borderRadius:10, padding:"8px 14px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><Briefcase style={{ width:13, height:13 }}/>Org chart</button>
          <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>Add employee</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"12px 16px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Headcount</p><p style={{ fontSize:22, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>4,240</p></Card>
        <Card style={{ padding:"12px 16px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Active</p><p style={{ fontSize:22, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>4,082</p></Card>
        <Card style={{ padding:"12px 16px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>On probation</p><p style={{ fontSize:22, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>34</p></Card>
        <Card style={{ padding:"12px 16px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Saudization</p><p style={{ fontSize:22, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>62%</p></Card>
        <Card style={{ padding:"12px 16px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Open roles</p><p style={{ fontSize:22, fontWeight:800, color:"#fb923c", margin:"4px 0 0" }}>34</p></Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 420px", gap:16 }}>
        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", gap:10 }}>
            <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"0 12px" }}>
              <Search style={{ width:13, height:13, color:"rgba(255,255,255,0.3)" }} />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, ID, department..." style={{ flex:1, background:"none", border:"none", color:"#f1f5f9", fontSize:12, outline:"none", padding:"8px 0" }} />
            </div>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead><tr style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
              {["Employee","Role","Dept","Grade","Salary","Status"].map(h => <th key={h} style={{ textAlign:"left", padding:"10px 14px" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map(e => {
                const sm = STATUS[e.status];
                return (
                  <tr key={e.id} onClick={() => { setActive(e); setTab("profile"); }} style={{ borderTop:"1px solid rgba(255,255,255,0.04)", cursor:"pointer", background: active.id === e.id ? "rgba(230,126,34,0.06)" : "transparent" }}>
                    <td style={{ padding:"10px 14px" }}>
                      <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:0 }}>{e.name}</p>
                      <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0", fontFamily:"monospace" }}>{e.id}</p>
                    </td>
                    <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.6)" }}>{e.role}</td>
                    <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.5)" }}>{e.dept}</td>
                    <td style={{ padding:"10px 14px", color:"#a78bfa", fontWeight:700 }}>{e.grade}</td>
                    <td style={{ padding:"10px 14px", color:"#4ade80", fontWeight:700 }}>SAR {e.salary.toLocaleString()}</td>
                    <td style={{ padding:"10px 14px" }}><span style={{ fontSize:10, background:sm.bg, color:sm.c, borderRadius:5, padding:"2px 8px", fontWeight:700, textTransform:"uppercase" }}>{e.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card style={{ padding:0, overflow:"hidden", display:"flex", flexDirection:"column" }}>
          <div style={{ padding:18, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
              <div style={{ width:52, height:52, borderRadius:14, background:"rgba(167,139,250,0.2)", color:"#a78bfa", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800 }}>{active.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
              <div>
                <p style={{ fontSize:15, fontWeight:800, color:"#f1f5f9", margin:0 }}>{active.name}</p>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:"2px 0 0" }}>{active.role}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>{active.dept} · {active.grade} · {active.nationality}</p>
              </div>
            </div>
            <div style={{ display:"flex", gap:3 }}>
              {(["profile","skills","contracts","training","performance"] as const).map(t => (
                <button key={t} onClick={()=>setTab(t)} style={{ padding:"6px 12px", background:tab===t?"rgba(230,126,34,0.12)":"transparent", border:"none", borderBottom:`2px solid ${tab===t?"#e67e22":"transparent"}`, color:tab===t?"#e67e22":"rgba(255,255,255,0.4)", fontSize:11, fontWeight:tab===t?700:500, cursor:"pointer", textTransform:"capitalize" }}>{t}</button>
              ))}
            </div>
          </div>

          <div style={{ flex:1, padding:18, overflowY:"auto" }}>
            {tab === "profile" && (
              <>
                {[
                  [Mail, "Email", active.email],
                  [Phone, "Phone", active.phone],
                  [Briefcase, "Manager", active.manager ?? "—"],
                  [MapPin, "Joined", active.joinedAt],
                  [FileText, "GOSI ID", active.gosi],
                ].map(([I,l,v]) => (
                  <div key={l as string} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    {(() => { const Ic = I as React.ElementType; return <Ic style={{ width:13, height:13, color:"rgba(255,255,255,0.5)" }} />; })()}
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", flex:1 }}>{l as string}</span>
                    <span style={{ fontSize:12, color:"#f1f5f9", fontWeight:500 }}>{v as string}</span>
                  </div>
                ))}
              </>
            )}

            {tab === "skills" && (
              <>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.5)", margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Skills</p>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:18 }}>
                  {active.skills.map(s => <span key={s} style={{ fontSize:11, background:"rgba(34,211,238,0.12)", color:"#22d3ee", borderRadius:6, padding:"3px 9px", fontWeight:600 }}>{s}</span>)}
                </div>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.5)", margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Certifications</p>
                {active.certs.map(c => (
                  <div key={c.name} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize:12, color:"#f1f5f9" }}><Award style={{ width:11, height:11, display:"inline", color:"#fbbf24", marginRight:5 }}/>{c.name}</span>
                    <span style={{ fontSize:10, color:"rgba(255,255,255,0.5)" }}>expires {c.expires}</span>
                  </div>
                ))}
              </>
            )}

            {tab === "contracts" && active.contracts.map(c => (
              <div key={c.type + c.from} style={{ padding:"10px 12px", marginBottom:6, background:"rgba(255,255,255,0.02)", borderRadius:10, borderLeft:`3px solid ${c.status==="active"?"#4ade80":"#94a3b8"}` }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:12, fontWeight:700, color:"#f1f5f9" }}>{c.type}</span>
                  <span style={{ fontSize:10, color:c.status==="active"?"#4ade80":"rgba(255,255,255,0.5)", fontWeight:700, textTransform:"uppercase" }}>{c.status}</span>
                </div>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"4px 0 0" }}>{c.from} → {c.to}</p>
              </div>
            ))}

            {tab === "training" && (
              active.trainings.length === 0 ? <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>No training records yet.</p> :
              active.trainings.map(t => (
                <div key={t.name} style={{ padding:"10px 12px", marginBottom:6, background:"rgba(255,255,255,0.02)", borderRadius:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:12, color:"#f1f5f9" }}><GraduationCap style={{ width:11, height:11, display:"inline", color:"#a78bfa", marginRight:5 }}/>{t.name}</span>
                    {t.score !== undefined && <span style={{ fontSize:11, color:t.score>=90?"#4ade80":"#fbbf24", fontWeight:700 }}>{t.score}%</span>}
                  </div>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"4px 0 0" }}>Completed {t.completed}</p>
                </div>
              ))
            )}

            {tab === "performance" && (
              active.performance.length === 0 ? <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>No reviews yet.</p> :
              active.performance.map(p => (
                <div key={p.period} style={{ padding:"12px 14px", marginBottom:8, background:"rgba(255,255,255,0.02)", borderRadius:10, borderLeft:`3px solid ${p.rating>=4.5?"#4ade80":p.rating>=4?"#fbbf24":"#fb923c"}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:"#f1f5f9" }}><TrendingUp style={{ width:11, height:11, display:"inline", color:"#4ade80", marginRight:5 }}/>{p.period} review</span>
                    <span style={{ fontSize:13, fontWeight:800, color:p.rating>=4.5?"#4ade80":"#fbbf24" }}>{p.rating}/5</span>
                  </div>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.6)", margin:0, lineHeight:1.5 }}>{p.comment}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
