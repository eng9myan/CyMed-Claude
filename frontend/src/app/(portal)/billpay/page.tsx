"use client";

import { useState } from "react";
import { CreditCard, Receipt, CheckCircle2, Clock, AlertTriangle, Calendar, ChevronRight, Banknote, Smartphone } from "lucide-react";

type BillStatus = "due" | "overdue" | "paid" | "partial" | "in_plan";

type Bill = {
  id: string; invoiceNumber: string; provider: string; service: string;
  serviceDate: string; dueDate: string;
  totalAmount: number; paidAmount: number; insurance: number; patientResp: number;
  status: BillStatus;
};

const BILLS: Bill[] = [
  { id:"B001", invoiceNumber:"INV-2026-08471", provider:"CyMed General — Cardiology", service:"Echocardiogram + Consultation", serviceDate:"2026-06-08", dueDate:"2026-07-08", totalAmount:1850, paidAmount:0, insurance:1480, patientResp:370, status:"due" },
  { id:"B002", invoiceNumber:"INV-2026-08440", provider:"CyMed Lab",                   service:"Comprehensive Metabolic Panel + HbA1c", serviceDate:"2026-06-05", dueDate:"2026-07-05", totalAmount:280, paidAmount:0, insurance:200, patientResp:80, status:"due" },
  { id:"B003", invoiceNumber:"INV-2026-08323", provider:"CyMed Imaging",               service:"MRI Knee with contrast", serviceDate:"2026-05-20", dueDate:"2026-06-20", totalAmount:3200, paidAmount:0, insurance:2400, patientResp:800, status:"overdue" },
  { id:"B004", invoiceNumber:"INV-2026-08210", provider:"CyMed Pharmacy",              service:"Prescription refill — multiple", serviceDate:"2026-05-15", dueDate:"2026-06-15", totalAmount:420, paidAmount:420, insurance:340, patientResp:80, status:"paid" },
  { id:"B005", invoiceNumber:"INV-2026-08105", provider:"CyMed Surgical",              service:"Outpatient knee arthroscopy (Payment Plan)", serviceDate:"2026-04-22", dueDate:"2026-10-22", totalAmount:8500, paidAmount:2000, insurance:5500, patientResp:1000, status:"in_plan" },
];

const STATUS_META: Record<BillStatus,{c:string;bg:string;label:string}> = {
  due:    {c:"#fbbf24",bg:"rgba(251,191,36,0.1)",label:"Due"},
  overdue:{c:"#f87171",bg:"rgba(248,113,113,0.1)",label:"Overdue"},
  paid:   {c:"#4ade80",bg:"rgba(74,222,128,0.1)",label:"Paid"},
  partial:{c:"#fb923c",bg:"rgba(251,146,60,0.1)",label:"Partial"},
  in_plan:{c:"#a78bfa",bg:"rgba(167,139,250,0.1)",label:"Payment Plan"},
};

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function BillPayPage() {
  const [active, setActive] = useState<Bill|null>(BILLS[0]);
  const [payMethod, setPayMethod] = useState<"card"|"mada"|"bank">("card");

  const totalDue = BILLS.filter(b=>b.status==="due"||b.status==="overdue").reduce((s,b)=>s+b.patientResp-b.paidAmount, 0);
  const overdueAmt = BILLS.filter(b=>b.status==="overdue").reduce((s,b)=>s+b.patientResp-b.paidAmount, 0);

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Bill Pay</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>View invoices · Make payments · Set up payment plans · Price estimator</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Total You Owe</p>
          <p style={{ fontSize:28, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>SAR {totalDue.toLocaleString()}</p>
        </Card>
        <Card style={{ padding:"14px 18px" }}>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Overdue</p>
          <p style={{ fontSize:28, fontWeight:800, color:"#f87171", margin:"4px 0 0" }}>SAR {overdueAmt.toLocaleString()}</p>
        </Card>
        <Card style={{ padding:"14px 18px" }}>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Insurance Covered</p>
          <p style={{ fontSize:28, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>SAR {BILLS.reduce((s,b)=>s+b.insurance,0).toLocaleString()}</p>
        </Card>
        <Card style={{ padding:"14px 18px" }}>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Payment Plan Active</p>
          <p style={{ fontSize:28, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>1</p>
        </Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:16 }}>
        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>Your Bills</h3>
          </div>
          {BILLS.map(b => {
            const sm = STATUS_META[b.status];
            const isA = active?.id === b.id;
            return (
              <div key={b.id} onClick={()=>setActive(b)} style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer", background:isA?"rgba(230,126,34,0.05)":"transparent" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                  <div>
                    <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:0 }}>{b.service}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{b.provider} · {b.invoiceNumber}</p>
                  </div>
                  <span style={{ fontSize:10, background:sm.bg, color:sm.c, borderRadius:5, padding:"2px 8px", fontWeight:700 }}>{sm.label}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0 }}>Service: {b.serviceDate} · Due: {b.dueDate}</p>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>Your responsibility</p>
                    <p style={{ fontSize:15, fontWeight:800, color: b.status==="paid"?"#4ade80":b.status==="overdue"?"#f87171":"#fbbf24", margin:0 }}>SAR {(b.patientResp - b.paidAmount).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </Card>

        {active && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <Card style={{ padding:18 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 12px" }}>Bill Detail</h3>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}><span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>Total billed</span><span style={{ fontSize:12, color:"#f1f5f9", fontWeight:600 }}>SAR {active.totalAmount}</span></div>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}><span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>Insurance covered</span><span style={{ fontSize:12, color:"#4ade80", fontWeight:600 }}>−SAR {active.insurance}</span></div>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}><span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>Already paid</span><span style={{ fontSize:12, color:"#22d3ee", fontWeight:600 }}>−SAR {active.paidAmount}</span></div>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0 4px" }}><span style={{ fontSize:13, color:"#f1f5f9", fontWeight:700 }}>Balance due</span><span style={{ fontSize:18, color:"#e67e22", fontWeight:800 }}>SAR {(active.patientResp - active.paidAmount).toLocaleString()}</span></div>
            </Card>

            <Card style={{ padding:18 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 12px" }}>Payment Method</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:14 }}>
                {([{k:"card",l:"Visa/MC",i:CreditCard},{k:"mada",l:"Mada",i:Smartphone},{k:"bank",l:"Bank",i:Banknote}] as const).map(p => (
                  <button key={p.k} onClick={()=>setPayMethod(p.k)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, padding:"10px 0", borderRadius:10, cursor:"pointer", background:payMethod===p.k?"rgba(230,126,34,0.15)":"rgba(255,255,255,0.04)", border:`1px solid ${payMethod===p.k?"rgba(230,126,34,0.4)":"rgba(255,255,255,0.08)"}` }}>
                    <p.i style={{ width:16, height:16, color:payMethod===p.k?"#e67e22":"rgba(255,255,255,0.4)" }} />
                    <span style={{ fontSize:11, color:payMethod===p.k?"#e67e22":"rgba(255,255,255,0.5)", fontWeight:600 }}>{p.l}</span>
                  </button>
                ))}
              </div>
              <button style={{ width:"100%", background:"linear-gradient(135deg,#e67e22,#d35400)", color:"white", border:"none", borderRadius:12, padding:"12px 0", fontSize:14, fontWeight:700, cursor:"pointer", marginBottom:8 }}>Pay SAR {(active.patientResp - active.paidAmount).toLocaleString()}</button>
              <button style={{ width:"100%", background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.3)", color:"#a78bfa", borderRadius:12, padding:"10px 0", fontSize:12, fontWeight:600, cursor:"pointer" }}>Set up payment plan</button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
