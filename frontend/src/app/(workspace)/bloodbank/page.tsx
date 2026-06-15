"use client";

import { useState } from "react";

type BloodUnit = {
  id: string; type: string; component: string; units: number;
  expiry: string; status: "available" | "reserved" | "crossmatched" | "low" | "critical";
};

type Request = {
  id: string; mrn: string; patient: string; component: string; bloodType: string;
  unitsReq: number; urgency: string; status: string; requestedBy: string; requestedAt: string;
  ward: string; indication: string;
};

const INVENTORY: BloodUnit[] = [
  { id:"bb1", type:"O+",  component:"pRBC",       units:18, expiry:"2026-07-01", status:"available"   },
  { id:"bb2", type:"O-",  component:"pRBC",       units:3,  expiry:"2026-06-20", status:"critical"    },
  { id:"bb3", type:"A+",  component:"pRBC",       units:12, expiry:"2026-07-05", status:"available"   },
  { id:"bb4", type:"A-",  component:"pRBC",       units:4,  expiry:"2026-06-25", status:"low"         },
  { id:"bb5", type:"B+",  component:"pRBC",       units:7,  expiry:"2026-07-10", status:"available"   },
  { id:"bb6", type:"AB+", component:"pRBC",       units:5,  expiry:"2026-07-08", status:"available"   },
  { id:"bb7", type:"O+",  component:"FFP",        units:22, expiry:"2026-09-01", status:"available"   },
  { id:"bb8", type:"O+",  component:"Platelets",  units:6,  expiry:"2026-06-17", status:"low"         },
  { id:"bb9", type:"O-",  component:"Cryoprecip", units:8,  expiry:"2026-08-15", status:"available"   },
];

const REQUESTS: Request[] = [
  { id:"TRF-441", mrn:"MRN-10492", patient:"Ahmad Al-Rashid",   component:"pRBC", bloodType:"O+", unitsReq:2, urgency:"STAT",    status:"CROSSMATCHING", requestedBy:"Dr. Al-Mutawa", requestedAt:"08:50", ward:"ED",      indication:"Sepsis + Hgb 7.2" },
  { id:"TRF-440", mrn:"MRN-10489", patient:"Sara Al-Zahrani",   component:"FFP",  bloodType:"A+", unitsReq:4, urgency:"URGENT",  status:"RESERVED",      requestedBy:"Dr. Al-Otaibi", requestedAt:"06:30", ward:"L&D",     indication:"PPH prophylaxis"   },
  { id:"TRF-439", mrn:"MRN-10488", patient:"Khalid Al-Dosari",  component:"pRBC", bloodType:"B+", unitsReq:2, urgency:"ROUTINE", status:"ISSUED",        requestedBy:"Dr. Al-Ghamdi", requestedAt:"yesterday", ward:"ICU", indication:"Pre-CABG Hgb 8.9"  },
  { id:"TRF-438", mrn:"MRN-10486", patient:"Omar Al-Shehri",    component:"Platelets", bloodType:"AB+", unitsReq:1, urgency:"URGENT", status:"COMPLETED", requestedBy:"Dr. Al-Malki", requestedAt:"yesterday", ward:"Oncology", indication:"Plt 18×10⁹" },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  CROSSMATCHING: { bg:"rgba(167,139,250,0.15)", color:"#a78bfa", label:"Crossmatching" },
  RESERVED:      { bg:"rgba(251,191,36,0.12)",  color:"#fbbf24", label:"Reserved"      },
  ISSUED:        { bg:"rgba(34,211,238,0.12)",  color:"#22d3ee", label:"Issued"        },
  COMPLETED:     { bg:"rgba(74,222,128,0.12)",  color:"#4ade80", label:"Completed"     },
};

const INV_STATUS_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  available:    { bg:"rgba(74,222,128,0.08)",  color:"#4ade80", dot:"#4ade80" },
  reserved:     { bg:"rgba(251,191,36,0.08)",  color:"#fbbf24", dot:"#fbbf24" },
  crossmatched: { bg:"rgba(167,139,250,0.08)", color:"#a78bfa", dot:"#a78bfa" },
  low:          { bg:"rgba(249,115,22,0.1)",   color:"#f97316", dot:"#f97316" },
  critical:     { bg:"rgba(239,68,68,0.12)",   color:"#f87171", dot:"#ef4444" },
};

const COMP_COLOR: Record<string, string> = {
  pRBC:"#f87171", FFP:"#fbbf24", Platelets:"#a78bfa", Cryoprecip:"#60a5fa",
};

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

export default function BloodBankPage() {
  const [tab, setTab] = useState<"inventory"|"requests">("inventory");

  const totalUnits    = INVENTORY.reduce((a,b)=>a+b.units,0);
  const criticalCount = INVENTORY.filter(u=>u.status==="critical").length;
  const lowCount      = INVENTORY.filter(u=>u.status==="low").length;
  const activeReqs    = REQUESTS.filter(r=>!["COMPLETED"].includes(r.status)).length;

  return (
    <div style={{ padding:"28px 28px 40px", minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.3px", margin:0 }}>Blood Bank</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)", marginTop:4 }}>Inventory management · Crossmatch · Issue</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:12, padding:"9px 20px", fontSize:13, fontWeight:700, cursor:"pointer" }}>+ New Request</button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
        {([
          ["Total Units",   totalUnits,    "#60a5fa"],
          ["Critical Stock",criticalCount, "#ef4444"],
          ["Low Stock",     lowCount,      "#f97316"],
          ["Active Requests",activeReqs,   "#fbbf24"],
        ] as [string,number,string][]).map(([l,v,c])=>(
          <Card key={l} style={{ padding:16 }}>
            <p style={{ fontSize:28, fontWeight:800, color:c, lineHeight:1, margin:0 }}>{v}</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.38)", marginTop:4 }}>{l}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:18 }}>
        {(["inventory","requests"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:"7px 20px", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer", textTransform:"capitalize",
            background: tab===t?"rgba(230,126,34,0.15)":"transparent",
            border:`1px solid ${tab===t?"rgba(230,126,34,0.4)":"rgba(255,255,255,0.08)"}`,
            color: tab===t?"#e67e22":"rgba(255,255,255,0.4)",
          }}>{t==="inventory"?"Inventory":"Transfusion Requests"}</button>
        ))}
      </div>

      {tab === "inventory" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10 }}>
          {INVENTORY.map(u=>{
            const st = INV_STATUS_STYLE[u.status];
            const isLowOrCritical = u.status==="low"||u.status==="critical";
            return (
              <div key={u.id} style={{ borderRadius:14, padding:16, background:st.bg, border:`1px solid ${st.color}30` }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ fontSize:22, fontWeight:900, color:st.color }}>{u.type}</span>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:st.dot }} />
                </div>
                <p style={{ fontSize:13, fontWeight:600, color:COMP_COLOR[u.component]??"#60a5fa", margin:"0 0 4px" }}>{u.component}</p>
                <p style={{ fontSize:28, fontWeight:800, color:isLowOrCritical?"#f87171":"#f1f5f9", margin:"0 0 4px" }}>{u.units} <span style={{ fontSize:12, fontWeight:400, color:"rgba(255,255,255,0.35)" }}>units</span></p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:0 }}>Exp: {u.expiry}</p>
                {isLowOrCritical && (
                  <div style={{ marginTop:8, padding:"4px 8px", borderRadius:6, background:`${st.color}20`, fontSize:10, fontWeight:700, color:st.color, textAlign:"center", textTransform:"uppercase" }}>
                    {u.status === "critical" ? "⚠ ORDER NOW" : "Low Stock"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "requests" && (
        <Card>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                {["Patient","Request ID","Component","Type","Units","Urgency","Status","Ward",""].map(h=>(
                  <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.28)", textTransform:"uppercase", letterSpacing:"0.07em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REQUESTS.map(r=>{
                const st = STATUS_STYLE[r.status]??STATUS_STYLE.RESERVED;
                return (
                  <tr key={r.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding:"12px 14px" }}>
                      <p style={{ color:"#f1f5f9", fontWeight:600, margin:0 }}>{r.patient}</p>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", margin:0 }}>{r.mrn}</p>
                    </td>
                    <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.45)", fontSize:12 }}>{r.id}</td>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{ fontSize:12, fontWeight:700, color:COMP_COLOR[r.component]??"#60a5fa" }}>{r.component}</span>
                    </td>
                    <td style={{ padding:"12px 14px", fontWeight:800, color:"#f1f5f9", fontSize:13 }}>{r.bloodType}</td>
                    <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.6)" }}>{r.unitsReq}</td>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{ fontSize:11, fontWeight:700, color:r.urgency==="STAT"?"#ef4444":r.urgency==="URGENT"?"#f97316":"#60a5fa" }}>{r.urgency}</span>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:st.bg, color:st.color }}>{st.label}</span>
                    </td>
                    <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.4)", fontSize:12 }}>{r.ward}</td>
                    <td style={{ padding:"12px 14px" }}>
                      <button style={{ fontSize:11, color:"#e67e22", background:"rgba(230,126,34,0.12)", border:"1px solid rgba(230,126,34,0.25)", borderRadius:8, padding:"4px 10px", cursor:"pointer" }}>Process</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
