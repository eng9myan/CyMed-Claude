"use client";

import { useState } from "react";

type Patient = {
  mrn: string; name: string; dob: string; gender: string; nationality: string;
  nationalId: string; phone: string; insurance: string; insId: string;
  registeredAt: string; status: string;
};

const PATIENTS: Patient[] = [
  { mrn:"MRN-10492", name:"Ahmad Al-Rashid",   dob:"1979-03-15", gender:"M", nationality:"SA", nationalId:"1082345670", phone:"+966 50 123 4567", insurance:"BUPA Arabia",    insId:"BUPA-884421", registeredAt:"08:14", status:"CHECKED_IN"  },
  { mrn:"MRN-10491", name:"Sarah Thompson",     dob:"1990-07-22", gender:"F", nationality:"GB", nationalId:"NHS-400 900 2001", phone:"+44 7700 900001", insurance:"BUPA International", insId:"BUPA-INT-221", registeredAt:"08:31", status:"WAITING"    },
  { mrn:"MRN-10490", name:"Khalid Al-Dosari",   dob:"1957-11-05", gender:"M", nationality:"SA", nationalId:"1043219876", phone:"+966 55 987 6543", insurance:"Tawuniya",       insId:"TAW-112233", registeredAt:"08:45", status:"IN_CONSULT"  },
  { mrn:"MRN-10489", name:"Fatima Al-Qahtani",  dob:"1996-04-18", gender:"F", nationality:"SA", nationalId:"1099123456", phone:"+966 54 321 9876", insurance:"MedGulf",        insId:"MG-556677", registeredAt:"09:02", status:"CHECKED_IN"  },
  { mrn:"MRN-10488", name:"James O'Brien",       dob:"1965-08-30", gender:"M", nationality:"IE", nationalId:"PPS-1234567T", phone:"+353 87 123 4567", insurance:"VHI",          insId:"VHI-889922", registeredAt:"09:18", status:"WAITING"    },
  { mrn:"MRN-10487", name:"Nora Al-Otaibi",      dob:"1952-01-12", gender:"F", nationality:"SA", nationalId:"1076543210", phone:"+966 50 654 3210", insurance:"AXA Cooperative",insId:"AXA-334455", registeredAt:"09:33", status:"COMPLETED"  },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  CHECKED_IN: { bg:"rgba(34,211,238,0.12)",  color:"#22d3ee", label:"Checked In" },
  WAITING:    { bg:"rgba(251,191,36,0.12)",  color:"#fbbf24", label:"Waiting"    },
  IN_CONSULT: { bg:"rgba(167,139,250,0.15)", color:"#a78bfa", label:"In Consult" },
  COMPLETED:  { bg:"rgba(74,222,128,0.12)",  color:"#4ade80", label:"Completed"  },
};

const NAT_COLOR: Record<string, string> = {
  SA:"#22d3ee", GB:"#60a5fa", US:"#a78bfa", AE:"#34d399", KW:"#fbbf24",
  QA:"#f472b6", JO:"#fb923c", IE:"#6ee7b7",
};

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

type Tab = "queue" | "register" | "search";

const FIELD = ({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
    <label style={{ fontSize:11, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.07em" }}>{label}</label>
    {children ?? <input defaultValue={value} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:13, outline:"none" }} />}
  </div>
);

export default function ReceptionPage() {
  const [tab, setTab]         = useState<Tab>("queue");
  const [search, setSearch]   = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);

  const filtered = PATIENTS.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.mrn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding:"28px 28px 40px", minHeight:"100vh", background:"#080d18" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.3px", margin:0 }}>Reception</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)", marginTop:4 }}>Patient registration & check-in</p>
        </div>
        <button onClick={()=>setTab("register")} style={{ background:"#e67e22", color:"white", border:"none", borderRadius:12, padding:"9px 20px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          + Register Patient
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
        {([
          ["Today's Visits", PATIENTS.length, "#60a5fa"],
          ["Waiting",  PATIENTS.filter(p=>p.status==="WAITING").length,    "#fbbf24"],
          ["In Consult", PATIENTS.filter(p=>p.status==="IN_CONSULT").length,"#a78bfa"],
          ["Completed", PATIENTS.filter(p=>p.status==="COMPLETED").length,  "#4ade80"],
        ] as [string,number,string][]).map(([label,value,color])=>(
          <Card key={label} style={{ padding:16 }}>
            <p style={{ fontSize:28, fontWeight:800, color, lineHeight:1, margin:0 }}>{value}</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.38)", marginTop:4 }}>{label}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:18 }}>
        {(["queue","register","search"] as Tab[]).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:"7px 18px", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer", textTransform:"capitalize",
            background: tab===t?"rgba(230,126,34,0.15)":"transparent",
            border: `1px solid ${tab===t?"rgba(230,126,34,0.4)":"rgba(255,255,255,0.08)"}`,
            color: tab===t?"#e67e22":"rgba(255,255,255,0.4)",
          }}>{t==="queue"?"Today's Queue":t==="register"?"New Registration":"Patient Search"}</button>
        ))}
      </div>

      {tab === "queue" && (
        <div style={{ display:"grid", gridTemplateColumns:selected?"1fr 380px":"1fr", gap:16 }}>
          <Card>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                  {["Patient","MRN","Nationality","Insurance","Arrived","Status",""].map(h=>(
                    <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.28)", textTransform:"uppercase", letterSpacing:"0.07em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PATIENTS.map(p=>{
                  const st = STATUS_STYLE[p.status]??STATUS_STYLE.WAITING;
                  return (
                    <tr key={p.mrn} onClick={()=>setSelected(selected?.mrn===p.mrn?null:p)}
                      style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer", background:selected?.mrn===p.mrn?"rgba(230,126,34,0.06)":"transparent" }}>
                      <td style={{ padding:"12px 14px" }}>
                        <p style={{ color:"#f1f5f9", fontWeight:600, margin:0 }}>{p.name}</p>
                        <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", margin:0 }}>{p.gender} · DOB {p.dob}</p>
                      </td>
                      <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.45)", fontSize:12 }}>{p.mrn}</td>
                      <td style={{ padding:"12px 14px" }}>
                        <span style={{ fontSize:11, fontWeight:700, color:NAT_COLOR[p.nationality]??"#60a5fa", background:(NAT_COLOR[p.nationality]??"#60a5fa")+"15", padding:"2px 8px", borderRadius:6 }}>{p.nationality}</span>
                      </td>
                      <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.5)", fontSize:12 }}>{p.insurance}</td>
                      <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.4)", fontSize:12 }}>{p.registeredAt}</td>
                      <td style={{ padding:"12px 14px" }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:st.bg, color:st.color }}>{st.label}</span>
                      </td>
                      <td style={{ padding:"12px 14px" }}>
                        <button style={{ fontSize:11, color:"#e67e22", background:"rgba(230,126,34,0.12)", border:"1px solid rgba(230,126,34,0.25)", borderRadius:8, padding:"4px 10px", cursor:"pointer" }}>View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {selected && (
            <Card style={{ padding:20 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <h3 style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", margin:0 }}>{selected.name}</h3>
                <button onClick={()=>setSelected(null)} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer", fontSize:20, lineHeight:1 }}>×</button>
              </div>
              {([
                ["MRN",selected.mrn],["Date of Birth",selected.dob],["Gender",selected.gender],
                ["Nationality",selected.nationality],["National ID",selected.nationalId],
                ["Phone",selected.phone],["Insurance",selected.insurance],["Ins. ID",selected.insId],
              ] as [string,string][]).map(([l,v])=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{l}</span>
                  <span style={{ fontSize:12, color:"#e2e8f0", fontWeight:500 }}>{v}</span>
                </div>
              ))}
              <div style={{ display:"flex", gap:8, marginTop:16 }}>
                {["Check In","Admit","Print Wristband"].map(a=>(
                  <button key={a} style={{ flex:1, padding:"8px 0", borderRadius:10, fontSize:11, fontWeight:600, cursor:"pointer",
                    background: a==="Check In"?"#e67e22":"rgba(255,255,255,0.05)",
                    color: a==="Check In"?"white":"rgba(255,255,255,0.55)",
                    border:`1px solid ${a==="Check In"?"transparent":"rgba(255,255,255,0.08)"}`,
                  }}>{a}</button>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === "register" && (
        <Card style={{ padding:28 }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:"#f1f5f9", marginTop:0, marginBottom:20 }}>New Patient Registration</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            <FIELD label="First Name" /><FIELD label="Middle Name" /><FIELD label="Last Name" />
            <FIELD label="Date of Birth" /><FIELD label="Gender">
              <select style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:13, outline:"none" }}>
                <option value="">Select…</option><option>Male</option><option>Female</option>
              </select>
            </FIELD>
            <FIELD label="Nationality">
              <select style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:13, outline:"none" }}>
                <option>Saudi Arabia (SA)</option><option>United Kingdom (GB)</option><option>United States (US)</option>
                <option>UAE (AE)</option><option>Kuwait (KW)</option><option>Qatar (QA)</option><option>Jordan (JO)</option>
              </select>
            </FIELD>
            <FIELD label="National ID / Iqama" />
            <FIELD label="Phone Number" />
            <FIELD label="Emergency Contact" />
            <FIELD label="Insurance Provider" />
            <FIELD label="Insurance ID / Policy" />
            <FIELD label="Coverage Type">
              <select style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:13, outline:"none" }}>
                <option>Standard</option><option>VIP</option><option>Self-Pay</option><option>Government</option>
              </select>
            </FIELD>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:24 }}>
            <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:12, padding:"10px 28px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Register Patient</button>
            <button onClick={()=>setTab("queue")} style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"10px 20px", fontSize:13, cursor:"pointer" }}>Cancel</button>
          </div>
        </Card>
      )}

      {tab === "search" && (
        <Card style={{ padding:24 }}>
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search by name, MRN, national ID…"
            style={{ width:"100%", boxSizing:"border-box", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 16px", color:"#f1f5f9", fontSize:14, outline:"none", marginBottom:16 }}
          />
          {filtered.map(p=>{
            const st = STATUS_STYLE[p.status]??STATUS_STYLE.WAITING;
            return (
              <div key={p.mrn} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <p style={{ color:"#f1f5f9", fontWeight:600, margin:0 }}>{p.name}</p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", margin:0 }}>{p.mrn} · {p.nationality} · DOB {p.dob}</p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:st.bg, color:st.color }}>{st.label}</span>
                  <button style={{ fontSize:11, color:"#e67e22", background:"rgba(230,126,34,0.12)", border:"1px solid rgba(230,126,34,0.25)", borderRadius:8, padding:"4px 10px", cursor:"pointer" }}>Open</button>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
