"use client";

import { useState } from "react";

type License = {
  id: string; tenant: string; org: string; solution: string; plan: string;
  seats: number; seatsUsed: number; modules: string[]; validFrom: string;
  validTo: string; status: string; mrr: number; country: string;
};

const LICENSES: License[] = [
  { id:"LIC-1001", tenant:"T-001", org:"KFSHRC",              solution:"HMS",            plan:"Enterprise",  seats:5000, seatsUsed:4200, modules:["ER","ICU","OR","Admissions","Billing","Pharmacy","Lab","Radiology"], validFrom:"2024-01-15", validTo:"2027-01-15", status:"ACTIVE",   mrr:8500,  country:"SA" },
  { id:"LIC-1002", tenant:"T-001", org:"KFSHRC",              solution:"LIS",            plan:"Enterprise",  seats:500,  seatsUsed:380,  modules:["Orders","Analyzers","Results","Critical Values"],                  validFrom:"2024-01-15", validTo:"2027-01-15", status:"ACTIVE",   mrr:3200,  country:"SA" },
  { id:"LIC-1003", tenant:"T-001", org:"KFSHRC",              solution:"RIS",            plan:"Enterprise",  seats:200,  seatsUsed:140,  modules:["PACS","DICOM","Reporting","Teleradiology"],                        validFrom:"2024-01-15", validTo:"2027-01-15", status:"ACTIVE",   mrr:2800,  country:"SA" },
  { id:"LIC-1004", tenant:"T-002", org:"NHS East Midlands",   solution:"HMS",            plan:"Enterprise",  seats:2500, seatsUsed:1800, modules:["Admissions","Nursing","Billing","Pharmacy"],                       validFrom:"2024-02-08", validTo:"2027-02-08", status:"ACTIVE",   mrr:7200,  country:"GB" },
  { id:"LIC-1005", tenant:"T-003", org:"SEHA Abu Dhabi",      solution:"HMS",            plan:"Enterprise",  seats:8000, seatsUsed:6100, modules:["Full Suite"],                                                      validFrom:"2024-01-22", validTo:"2027-01-22", status:"ACTIVE",   mrr:18000, country:"AE" },
  { id:"LIC-1006", tenant:"T-003", org:"SEHA Abu Dhabi",      solution:"Pharmacy ERP",   plan:"Enterprise",  seats:1000, seatsUsed:680,  modules:["Dispensing","Inventory","POS","Controlled Drugs"],                 validFrom:"2024-01-22", validTo:"2027-01-22", status:"ACTIVE",   mrr:6500,  country:"AE" },
  { id:"LIC-1007", tenant:"T-004", org:"MOH Saudi Arabia",    solution:"MoH Platform",   plan:"Government",  seats:99999,seatsUsed:8000, modules:["Full Suite"],                                                      validFrom:"2024-03-01", validTo:"2027-03-01", status:"ACTIVE",   mrr:40000, country:"SA" },
  { id:"LIC-1008", tenant:"T-005", org:"Al Rayan Group",      solution:"HMS",            plan:"Enterprise",  seats:3000, seatsUsed:2100, modules:["ER","Admissions","Billing","Nursing"],                             validFrom:"2024-04-10", validTo:"2027-04-10", status:"ACTIVE",   mrr:5400,  country:"QA" },
  { id:"LIC-1009", tenant:"T-006", org:"Cairo University",    solution:"HMS",            plan:"Standard",    seats:1000, seatsUsed:520,  modules:["Admissions","Billing","Nursing"],                                  validFrom:"2024-05-18", validTo:"2025-05-18", status:"EXPIRING", mrr:1800,  country:"EG" },
  { id:"LIC-1010", tenant:"T-006", org:"Cairo University",    solution:"LIS",            plan:"Standard",    seats:200,  seatsUsed:100,  modules:["Orders","Results"],                                                validFrom:"2024-05-18", validTo:"2025-05-18", status:"EXPIRING", mrr:600,   country:"EG" },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  ACTIVE:    { bg:"rgba(74,222,128,0.1)",  color:"#4ade80", dot:"#4ade80" },
  EXPIRING:  { bg:"rgba(251,191,36,0.1)",  color:"#fbbf24", dot:"#fbbf24" },
  SUSPENDED: { bg:"rgba(248,113,113,0.1)", color:"#f87171", dot:"#f87171" },
  EXPIRED:   { bg:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.3)", dot:"rgba(255,255,255,0.2)" },
};

const PLAN_STYLE: Record<string, { bg: string; color: string }> = {
  Enterprise: { bg:"rgba(230,126,34,0.12)",  color:"#fb923c" },
  Standard:   { bg:"rgba(34,211,238,0.1)",   color:"#22d3ee" },
  Government: { bg:"rgba(251,191,36,0.1)",   color:"#fbbf24" },
};

const SOL_COLOR: Record<string, string> = {
  "HMS":"#22d3ee","LIS":"#fbbf24","RIS":"#60a5fa","Pharmacy ERP":"#a78bfa",
  "CMS":"#4ade80","MoH Platform":"#e67e22","Telehealth":"#34d399",
};

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

function UsageBar({ used, total }: { used: number; total: number }) {
  const pct = total >= 99999 ? 40 : Math.round((used / total) * 100);
  const color = pct > 90 ? "#f87171" : pct > 75 ? "#f97316" : "#4ade80";
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
        <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>{used.toLocaleString()} / {total >= 99999 ? "∞" : total.toLocaleString()}</span>
        <span style={{ fontSize:10, fontWeight:700, color }}>{total >= 99999 ? "∞%" : `${pct}%`}</span>
      </div>
      <div style={{ height:4, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:99 }} />
      </div>
    </div>
  );
}

export default function LicensingPage() {
  const [filterSol, setFilterSol] = useState("ALL");
  const [selected, setSelected]   = useState<License | null>(null);

  const solutions = ["ALL",...Array.from(new Set(LICENSES.map(l=>l.solution)))];
  const displayed = filterSol === "ALL" ? LICENSES : LICENSES.filter(l => l.solution === filterSol);

  const totalMRR   = LICENSES.reduce((a, l) => a + l.mrr, 0);
  const expiring   = LICENSES.filter(l => l.status === "EXPIRING").length;
  const totalSeats = LICENSES.reduce((a, l) => a + (l.seats >= 99999 ? 0 : l.seats), 0);

  return (
    <div style={{ padding:"28px 28px 48px", minHeight:"100vh", color:"#f1f5f9" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Licensing</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)", marginTop:4 }}>
            {LICENSES.length} licenses · ${totalMRR.toLocaleString()} MRR · {expiring} expiring soon
          </p>
        </div>
        <button style={{ padding:"8px 20px", borderRadius:10, background:"#c084fc", color:"#050a14", fontSize:12, fontWeight:800, border:"none", cursor:"pointer" }}>
          + Issue License
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
        {([
          ["Total Licenses", LICENSES.length,    "#c084fc"],
          ["Total MRR",      `$${totalMRR.toLocaleString()}`, "#4ade80"],
          ["Expiring",       expiring,            "#fbbf24"],
          ["Seat Pool",      totalSeats.toLocaleString(), "#22d3ee"],
        ] as [string,string|number,string][]).map(([l,v,c])=>(
          <Card key={l} style={{ padding:16 }}>
            <p style={{ fontSize:26, fontWeight:800, color:c, lineHeight:1, margin:0 }}>{v}</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.38)", marginTop:4 }}>{l}</p>
          </Card>
        ))}
      </div>

      {/* Solution filter */}
      <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
        {solutions.map(s=>(
          <button key={s} onClick={()=>setFilterSol(s)} style={{
            padding:"6px 14px", borderRadius:9, fontSize:11, fontWeight:600, cursor:"pointer",
            background: filterSol===s?(SOL_COLOR[s]??"rgba(192,132,252,0.15)")+"18":"transparent",
            border:`1px solid ${filterSol===s?(SOL_COLOR[s]??"#c084fc")+"50":"rgba(255,255,255,0.1)"}`,
            color: filterSol===s?(SOL_COLOR[s]??"#c084fc"):"rgba(255,255,255,0.4)",
          }}>{s==="ALL"?"All Solutions":s}</button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:selected?"1fr 360px":"1fr", gap:16 }}>
        <Card>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                {["License","Organization","Solution","Plan","Seat Usage","Valid Until","Status","MRR",""].map(h=>(
                  <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map(lic=>{
                const ss = STATUS_STYLE[lic.status]??STATUS_STYLE.ACTIVE;
                const ps = PLAN_STYLE[lic.plan]??PLAN_STYLE.Standard;
                const pct = lic.seats>=99999?40:Math.round((lic.seatsUsed/lic.seats)*100);
                const barColor = pct>90?"#f87171":pct>75?"#f97316":"#4ade80";
                return (
                  <tr key={lic.id} onClick={()=>setSelected(selected?.id===lic.id?null:lic)}
                    style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer", background:selected?.id===lic.id?"rgba(192,132,252,0.04)":"transparent" }}>
                    <td style={{ padding:"11px 14px" }}>
                      <code style={{ fontSize:11, color:"#c084fc", background:"rgba(192,132,252,0.1)", padding:"2px 7px", borderRadius:5 }}>{lic.id}</code>
                    </td>
                    <td style={{ padding:"11px 14px" }}>
                      <p style={{ color:"#f1f5f9", fontWeight:600, margin:0, fontSize:12 }}>{lic.org}</p>
                      <p style={{ fontSize:10, color:"rgba(255,255,255,0.28)", margin:0 }}>{lic.tenant}</p>
                    </td>
                    <td style={{ padding:"11px 14px" }}>
                      <span style={{ fontSize:11, fontWeight:800, color:SOL_COLOR[lic.solution]??"#60a5fa" }}>{lic.solution}</span>
                    </td>
                    <td style={{ padding:"11px 14px" }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:5, background:ps.bg, color:ps.color }}>{lic.plan}</span>
                    </td>
                    <td style={{ padding:"11px 14px", minWidth:120 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ flex:1, height:4, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${pct}%`, background:barColor, borderRadius:99 }} />
                        </div>
                        <span style={{ fontSize:10, fontWeight:700, color:barColor, flexShrink:0 }}>{lic.seats>=99999?"∞":pct+"%"}</span>
                      </div>
                    </td>
                    <td style={{ padding:"11px 14px", color: lic.status==="EXPIRING"?"#fbbf24":"rgba(255,255,255,0.4)", fontSize:11 }}>{lic.validTo}</td>
                    <td style={{ padding:"11px 14px" }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99, background:ss.bg, color:ss.color }}>
                        <span style={{ display:"inline-block", width:4, height:4, borderRadius:"50%", background:ss.dot, marginRight:4, verticalAlign:"middle" }} />
                        {lic.status}
                      </span>
                    </td>
                    <td style={{ padding:"11px 14px", fontWeight:700, color:"#4ade80" }}>${lic.mrr.toLocaleString()}</td>
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
              <h3 style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", margin:0 }}>License Detail</h3>
              <button onClick={()=>setSelected(null)} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer", fontSize:20, lineHeight:1 }}>×</button>
            </div>
            {([
              ["License ID", selected.id], ["Organization", selected.org], ["Tenant", selected.tenant],
              ["Solution", selected.solution], ["Plan", selected.plan], ["Country", selected.country],
              ["Seats", `${selected.seatsUsed.toLocaleString()} / ${selected.seats>=99999?"∞":selected.seats.toLocaleString()}`],
              ["Valid From", selected.validFrom], ["Valid To", selected.validTo],
              ["Status", selected.status], ["MRR", `$${selected.mrr.toLocaleString()}/mo`],
            ] as [string,string][]).map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{l}</span>
                <span style={{ fontSize:12, color:"#e2e8f0", fontWeight:500, textAlign:"right", maxWidth:200 }}>{v}</span>
              </div>
            ))}
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.28)", margin:"14px 0 6px", textTransform:"uppercase", letterSpacing:"0.07em" }}>Seat Usage</p>
            <UsageBar used={selected.seatsUsed} total={selected.seats} />
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.28)", margin:"14px 0 6px", textTransform:"uppercase", letterSpacing:"0.07em" }}>Modules</p>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {selected.modules.map(m=>(
                <span key={m} style={{ fontSize:10, padding:"3px 8px", borderRadius:6, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.08)" }}>{m}</span>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, marginTop:16 }}>
              {["Renew","Upgrade","Revoke"].map(a=>(
                <button key={a} style={{ flex:1, padding:"8px 0", borderRadius:9, fontSize:11, fontWeight:600, cursor:"pointer",
                  background: a==="Renew"?"#c084fc":a==="Upgrade"?"rgba(74,222,128,0.1)":"rgba(248,113,113,0.1)",
                  color: a==="Renew"?"#050a14":a==="Upgrade"?"#4ade80":"#f87171",
                  border:`1px solid ${a==="Renew"?"transparent":a==="Upgrade"?"rgba(74,222,128,0.3)":"rgba(248,113,113,0.3)"}`,
                }}>{a}</button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
