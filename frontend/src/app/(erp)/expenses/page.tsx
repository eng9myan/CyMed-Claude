"use client";
import { useState } from "react";
import { Receipt, Plus, Upload, CheckCircle2, X, Camera, FileText } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

type Status = "draft"|"submitted"|"approved"|"reimbursed"|"rejected";
type Expense = { id:string; date:string; merchant:string; category:string; amount:number; vat:number; vendor?:string; submittedBy:string; project?:string; status:Status; receiptAttached:boolean; note?:string };

const EXPENSES: Expense[] = [
  { id:"EXP-2026-0241", date:"2026-06-12", merchant:"Saudia Airlines",       category:"Travel",       amount:1840, vat:0,    submittedBy:"Dr. Al-Mutawa", project:"Conference — Madinah", status:"submitted", receiptAttached:true,  note:"Round trip RUH-MED" },
  { id:"EXP-2026-0240", date:"2026-06-11", merchant:"Hilton Riyadh",          category:"Accommodation",amount:2400, vat:360, submittedBy:"Dr. Al-Mutawa", project:"Conference — Madinah", status:"submitted", receiptAttached:true },
  { id:"EXP-2026-0239", date:"2026-06-10", merchant:"Office Depot",           category:"Office supplies", amount:240,  vat:36,  submittedBy:"Acc. Reem",    project:"Finance",                  status:"approved", receiptAttached:true },
  { id:"EXP-2026-0238", date:"2026-06-10", merchant:"Aramex (courier)",       category:"Logistics",    amount:142,  vat:21,  submittedBy:"Pharm. Sami",  status:"approved",  receiptAttached:true },
  { id:"EXP-2026-0237", date:"2026-06-09", merchant:"Domino's Pizza",         category:"Meals",        amount:184,  vat:28,  submittedBy:"Sr. Nurse Layla",project:"ICU team lunch",          status:"reimbursed", receiptAttached:true },
  { id:"EXP-2026-0236", date:"2026-06-08", merchant:"Careem",                 category:"Transport",    amount:84,   vat:13,  submittedBy:"Dr. Al-Ghamdi",                                     status:"reimbursed", receiptAttached:true },
  { id:"EXP-2026-0235", date:"2026-06-05", merchant:"Conference fee — Annual Cardio",category:"Training",amount:3400,vat:0,  submittedBy:"Dr. Al-Ghamdi", project:"Education",               status:"rejected",   receiptAttached:false, note:"Receipt missing" },
];

const STATUS: Record<Status,{c:string;bg:string}> = {
  draft:{c:"#94a3b8",bg:"rgba(148,163,184,0.1)"},
  submitted:{c:"#fbbf24",bg:"rgba(251,191,36,0.1)"},
  approved:{c:"#22d3ee",bg:"rgba(34,211,238,0.1)"},
  reimbursed:{c:"#4ade80",bg:"rgba(74,222,128,0.1)"},
  rejected:{c:"#f87171",bg:"rgba(248,113,113,0.1)"},
};

export default function ExpensesPage() {
  const [newOpen, setNewOpen] = useState(false);
  const totalThisMonth = EXPENSES.filter(e => e.date.startsWith("2026-06")).reduce((s,e)=>s+e.amount, 0);
  const awaiting = EXPENSES.filter(e=>e.status==="submitted").length;
  const reimbursed = EXPENSES.filter(e=>e.status==="reimbursed").reduce((s,e)=>s+e.amount, 0);

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Expenses</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Submit receipts · Approval workflow · Reimbursement · VAT auto-extraction · Mobile snap</p>
        </div>
        <button onClick={()=>setNewOpen(true)} style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>New expense</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>This month</p><p style={{ fontSize:22, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>SAR {totalThisMonth.toLocaleString()}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Awaiting approval</p><p style={{ fontSize:22, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>{awaiting}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Reimbursed</p><p style={{ fontSize:22, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>SAR {reimbursed.toLocaleString()}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Avg processing</p><p style={{ fontSize:22, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>3.4 days</p></Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {["ID","Date","Merchant","Category","Project","Submitted by","Amount","VAT","Status"].map(h => <th key={h} style={{ textAlign:"left", padding:"10px 14px" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {EXPENSES.map(e => {
              const sm = STATUS[e.status];
              return (
                <tr key={e.id} style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"10px 14px", color:"#22d3ee", fontFamily:"monospace" }}>{e.id}</td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.6)" }}>{e.date}</td>
                  <td style={{ padding:"10px 14px", color:"#f1f5f9", fontWeight:600 }}>{e.merchant} {e.receiptAttached && <FileText style={{ width:10, height:10, display:"inline", color:"#4ade80", marginLeft:5 }}/>}</td>
                  <td style={{ padding:"10px 14px" }}><span style={{ fontSize:10, background:"rgba(167,139,250,0.12)", color:"#a78bfa", borderRadius:5, padding:"2px 8px", fontWeight:600 }}>{e.category}</span></td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.5)" }}>{e.project ?? "—"}</td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.6)" }}>{e.submittedBy}</td>
                  <td style={{ padding:"10px 14px", color:"#f1f5f9", fontWeight:700, fontFamily:"monospace" }}>SAR {e.amount.toLocaleString()}</td>
                  <td style={{ padding:"10px 14px", color:"#fbbf24", fontFamily:"monospace" }}>{e.vat > 0 ? `SAR ${e.vat}` : "—"}</td>
                  <td style={{ padding:"10px 14px" }}><span style={{ fontSize:10, background:sm.bg, color:sm.c, borderRadius:5, padding:"2px 8px", fontWeight:700, textTransform:"uppercase" }}>{e.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {newOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
          <Card style={{ width:520, padding:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", margin:0 }}>New expense claim</h3>
              <button onClick={()=>setNewOpen(false)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer" }}><X style={{ width:16, height:16 }} /></button>
            </div>
            <div style={{ background:"rgba(34,211,238,0.06)", border:"1px dashed rgba(34,211,238,0.25)", borderRadius:12, padding:24, textAlign:"center", marginBottom:14, cursor:"pointer" }}>
              <Camera style={{ width:28, height:28, color:"#22d3ee", margin:"0 auto 8px" }} />
              <p style={{ fontSize:12, color:"#22d3ee", margin:0, fontWeight:600 }}>Drop receipt or snap photo — VAT auto-extracted</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[
                { l:"Merchant", p:"Saudia Airlines" },
                { l:"Category", p:"Travel" },
                { l:"Amount (SAR)", p:"1840" },
                { l:"Date", p:"2026-06-13" },
              ].map(f => (
                <div key={f.l}>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>{f.l}</p>
                  <input placeholder={f.p} style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 12px", color:"#f1f5f9", fontSize:12, outline:"none" }} />
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, marginTop:16 }}>
              <button onClick={()=>setNewOpen(false)} style={{ flex:1, background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"10px 0", fontSize:13, fontWeight:700, cursor:"pointer" }}>Submit for approval</button>
              <button onClick={()=>setNewOpen(false)} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)", borderRadius:10, padding:"0 16px", fontSize:12, cursor:"pointer" }}>Save draft</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
