"use client";

import { useState } from "react";
import {
  Pill, Clock, CheckCircle2, XCircle, AlertTriangle, User,
  Scan, RefreshCw, BarChart3, ShieldAlert, ChevronDown,
  FileText, Camera, Lock,
} from "lucide-react";

type AdmStatus = "due" | "given" | "held" | "refused" | "missed" | "na";
type Priority = "routine" | "urgent" | "stat";

type MedOrder = {
  id: string; drug: string; dose: string; route: string; freq: string;
  indication: string; prescriber: string; startDate: string;
  controlled?: boolean; highAlert?: boolean; ivDrip?: boolean;
  schedule: { time: string; status: AdmStatus; givenBy?: string; givenAt?: string; reason?: string }[];
};

type Patient = {
  id: string; name: string; mrn: string; dob: string; ward: string;
  bed: string; admitted: string; allergies: string[];
  weight: number; renal: string; orders: MedOrder[];
};

const PATIENTS: Patient[] = [
  {
    id:"P1", name:"Ahmad Al-Rashid", mrn:"MRN-10492", dob:"1968-04-15", ward:"Cardiology", bed:"4A",
    admitted:"2026-06-11", allergies:["Penicillin","NSAIDs"], weight:85, renal:"eGFR 60",
    orders: [
      { id:"O1", drug:"Metoprolol 50mg", dose:"50mg", route:"PO", freq:"BID", indication:"HTN/post-MI", prescriber:"Dr. Al-Mutawa", startDate:"2026-06-11",
        schedule:[{time:"08:00",status:"given",givenBy:"Nurse Rasha",givenAt:"08:04"},{time:"20:00",status:"due"}] },
      { id:"O2", drug:"Enoxaparin 80mg SC", dose:"80mg", route:"SC", freq:"BID", indication:"DVT prophylaxis", prescriber:"Dr. Al-Mutawa", startDate:"2026-06-11",
        schedule:[{time:"08:00",status:"given",givenBy:"Nurse Rasha",givenAt:"08:10"},{time:"20:00",status:"due"}] },
      { id:"O3", drug:"Atorvastatin 40mg", dose:"40mg", route:"PO", freq:"OD PM", indication:"Dyslipidaemia", prescriber:"Dr. Al-Mutawa", startDate:"2026-06-11",
        schedule:[{time:"22:00",status:"due"}] },
      { id:"O4", drug:"Morphine 2mg IV PRN", dose:"2mg", route:"IV", freq:"PRN q4h pain >6", indication:"Pain management", prescriber:"Dr. Al-Mutawa", startDate:"2026-06-12", controlled:true, highAlert:true,
        schedule:[{time:"10:30",status:"given",givenBy:"Nurse Layla",givenAt:"10:35"},{time:"14:00",status:"given",givenBy:"Nurse Rasha",givenAt:"14:03"}] },
      { id:"O5", drug:"Furosemide 40mg IV", dose:"40mg", route:"IV", freq:"BID", indication:"Fluid overload", prescriber:"Dr. Al-Mutawa", startDate:"2026-06-12",
        schedule:[{time:"08:00",status:"given",givenBy:"Nurse Rasha",givenAt:"08:08"},{time:"14:00",status:"held",reason:"K+ 3.2 â€” Dr. notified"},{time:"20:00",status:"due"}] },
      { id:"O6", drug:"Noradrenaline 0.1mcg/kg/min", dose:"variable", route:"IV drip", freq:"continuous", indication:"Vasopressor support", prescriber:"Dr. Al-Mutawa", startDate:"2026-06-13", highAlert:true, ivDrip:true,
        schedule:[{time:"running",status:"given",givenBy:"Nurse Layla",givenAt:"ongoing"}] },
    ]
  },
  {
    id:"P2", name:"Fatima Al-Zahra", mrn:"MRN-10485", dob:"1975-09-22", ward:"General Medicine", bed:"7B",
    admitted:"2026-06-12", allergies:["Sulfa"], weight:68, renal:"Normal",
    orders: [
      { id:"O7", drug:"Amoxicillin/Clavulanate 1.2g IV", dose:"1.2g", route:"IV", freq:"TID", indication:"Community pneumonia", prescriber:"Dr. Al-Ghamdi", startDate:"2026-06-12",
        schedule:[{time:"06:00",status:"given",givenBy:"Nurse Omar",givenAt:"06:05"},{time:"14:00",status:"given",givenBy:"Nurse Sana",givenAt:"14:08"},{time:"22:00",status:"due"}] },
      { id:"O8", drug:"Paracetamol 1g IV", dose:"1g", route:"IV", freq:"QID", indication:"Antipyretic/analgesic", prescriber:"Dr. Al-Ghamdi", startDate:"2026-06-12",
        schedule:[{time:"06:00",status:"given",givenBy:"Nurse Omar",givenAt:"06:10"},{time:"12:00",status:"given",givenBy:"Nurse Sana",givenAt:"12:02"},{time:"18:00",status:"due"},{time:"24:00",status:"na"}] },
    ]
  }
];

const STATUS_META: Record<AdmStatus, { label:string; color:string; bg:string }> = {
  due:     { label:"Due",     color:"#fbbf24", bg:"rgba(251,191,36,0.1)" },
  given:   { label:"Given",   color:"#4ade80", bg:"rgba(74,222,128,0.1)" },
  held:    { label:"Held",    color:"#f87171", bg:"rgba(248,113,113,0.1)" },
  refused: { label:"Refused", color:"#fb923c", bg:"rgba(251,146,60,0.1)" },
  missed:  { label:"Missed",  color:"#f43f5e", bg:"rgba(244,63,94,0.12)" },
  na:      { label:"N/A",     color:"rgba(255,255,255,0.2)", bg:"rgba(255,255,255,0.03)" },
};

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

export default function EmarPage() {
  const [activePatient, setActivePatient] = useState<Patient>(PATIENTS[0]);
  const [selectedOrder, setSelectedOrder] = useState<MedOrder | null>(null);
  const [adminModal, setAdminModal] = useState<{order:MedOrder;time:string} | null>(null);
  const [barcodeScanned, setBarcodeScanned] = useState(false);

  function markGiven(orderId: string, time: string) {
    setAdminModal(null);
    // In real app: API call
  }

  const dueCount = activePatient.orders.reduce((s, o) => s + o.schedule.filter(s2 => s2.status === "due").length, 0);
  const givenCount = activePatient.orders.reduce((s, o) => s + o.schedule.filter(s2 => s2.status === "given").length, 0);
  const heldCount = activePatient.orders.reduce((s, o) => s + o.schedule.filter(s2 => s2.status === "held").length, 0);
  const highAlertCount = activePatient.orders.filter(o => o.highAlert || o.controlled).length;

  return (
    <div style={{ padding:"24px", minHeight:"100vh", background:"#080d18" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Electronic MAR</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>
            Medication Administration Record Â· Barcode Verification Â· 5 Rights
          </p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", borderRadius:10, padding:"8px 16px", color:"#4ade80", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            <Scan style={{ width:14, height:14 }} /> Scan Wristband
          </button>
          <button style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(230,126,34,0.1)", border:"1px solid rgba(230,126,34,0.3)", borderRadius:10, padding:"8px 16px", color:"#e67e22", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            <Scan style={{ width:14, height:14 }} /> Scan Medication
          </button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:16 }}>
        {/* Patient list */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {PATIENTS.map(p => {
            const pDue = p.orders.reduce((s,o)=>s+o.schedule.filter(s2=>s2.status==="due").length,0);
            const isActive = activePatient.id === p.id;
            return (
              <Card key={p.id} style={{ padding:14, cursor:"pointer", border:`1px solid ${isActive?"rgba(230,126,34,0.3)":"rgba(255,255,255,0.07)"}`, background: isActive?"rgba(230,126,34,0.07)":"rgba(255,255,255,0.03)" }}
                onClick={() => setActivePatient(p)}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"rgba(34,211,238,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#22d3ee" }}>
                    {p.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:"#f1f5f9", margin:0 }}>{p.name}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{p.mrn} Â· Bed {p.bed}</p>
                  </div>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  <span style={{ fontSize:10, background:"rgba(251,191,36,0.15)", color:"#fbbf24", borderRadius:6, padding:"2px 8px", fontWeight:700 }}>{pDue} due</span>
                  {p.allergies.length > 0 && <span style={{ fontSize:10, background:"rgba(248,113,113,0.12)", color:"#f87171", borderRadius:6, padding:"2px 8px", fontWeight:600 }}>âš  Allergies</span>}
                </div>
              </Card>
            );
          })}

          {/* Patient info card */}
          <Card style={{ padding:14 }}>
            <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.28)", textTransform:"uppercase", letterSpacing:"0.07em", margin:"0 0 10px" }}>Patient Details</p>
            {[
              ["DOB", activePatient.dob],
              ["Weight", `${activePatient.weight} kg`],
              ["Renal", activePatient.renal],
              ["Ward", activePatient.ward],
              ["Admitted", activePatient.admitted],
            ].map(([l,v]) => (
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{l}</span>
                <span style={{ fontSize:11, color:"#f1f5f9", fontWeight:500 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop:10 }}>
              <p style={{ fontSize:10, fontWeight:700, color:"#f87171", margin:"0 0 4px", textTransform:"uppercase" }}>âš  Allergies</p>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {activePatient.allergies.map(a => (
                  <span key={a} style={{ fontSize:10, background:"rgba(248,113,113,0.12)", color:"#f87171", borderRadius:6, padding:"2px 8px", fontWeight:600, border:"1px solid rgba(248,113,113,0.2)" }}>{a}</span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* MAR Table */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {[
              { l:"Due Now", v:dueCount, c:"#fbbf24" },
              { l:"Given", v:givenCount, c:"#4ade80" },
              { l:"Held/Issues", v:heldCount, c:"#f87171" },
              { l:"High Alert / CD", v:highAlertCount, c:"#f472b6" },
            ].map(s => (
              <Card key={s.l} style={{ padding:"12px 16px" }}>
                <p style={{ fontSize:24, fontWeight:800, color:s.c, margin:0 }}>{s.v}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{s.l}</p>
              </Card>
            ))}
          </div>

          {/* Orders */}
          <Card style={{ padding:0, overflow:"hidden" }}>
            <div style={{ padding:"12px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>
                {activePatient.name} â€” Active Medication Orders
              </h3>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:"3px 0 0" }}>{activePatient.orders.length} orders Â· {activePatient.ward} Â· Bed {activePatient.bed}</p>
            </div>

            <div style={{ padding:"8px 0" }}>
              {activePatient.orders.map(order => (
                <div key={order.id}
                  onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  style={{ padding:"12px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer",
                    background: selectedOrder?.id === order.id ? "rgba(230,126,34,0.05)" : "transparent",
                    borderLeft: order.highAlert ? "3px solid #f472b6" : order.controlled ? "3px solid #a78bfa" : "3px solid transparent" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                    {/* Drug info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <Pill style={{ width:14, height:14, color: order.highAlert?"#f472b6":order.controlled?"#a78bfa":"#e67e22" }} />
                        <span style={{ fontSize:14, fontWeight:700, color:"#f1f5f9" }}>{order.drug}</span>
                        {order.highAlert && <span style={{ fontSize:9, background:"rgba(244,114,182,0.15)", color:"#f472b6", borderRadius:5, padding:"1px 6px", fontWeight:700 }}>HIGH ALERT</span>}
                        {order.controlled && <span style={{ fontSize:9, background:"rgba(167,139,250,0.15)", color:"#a78bfa", borderRadius:5, padding:"1px 6px", fontWeight:700 }}>CONTROLLED</span>}
                        {order.ivDrip && <span style={{ fontSize:9, background:"rgba(34,211,238,0.15)", color:"#22d3ee", borderRadius:5, padding:"1px 6px", fontWeight:700 }}>IV DRIP</span>}
                      </div>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"0 0 8px" }}>
                        {order.route} Â· {order.freq} Â· {order.indication} Â· Rx: {order.prescriber}
                      </p>

                      {/* Administration slots */}
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        {order.schedule.map((slot, i) => {
                          const sm = STATUS_META[slot.status];
                          return (
                            <div key={i}
                              onClick={e => { e.stopPropagation(); if (slot.status === "due") setAdminModal({ order, time:slot.time }); }}
                              style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"8px 12px", borderRadius:10,
                                background: sm.bg, border:`1px solid ${sm.color}30`, cursor: slot.status==="due"?"pointer":"default",
                                minWidth:80 }}>
                              <span style={{ fontSize:12, fontWeight:700, color:sm.color }}>{slot.time}</span>
                              <span style={{ fontSize:9, fontWeight:700, color:sm.color, textTransform:"uppercase", letterSpacing:"0.05em" }}>{sm.label}</span>
                              {slot.givenBy && <span style={{ fontSize:9, color:"rgba(255,255,255,0.25)", textAlign:"center" }}>{slot.givenBy}</span>}
                              {slot.reason && <span style={{ fontSize:9, color:"rgba(248,113,113,0.7)", textAlign:"center", maxWidth:80 }}>{slot.reason}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick action */}
                    {order.schedule.some(s2 => s2.status === "due") && (
                      <button
                        onClick={e => { e.stopPropagation(); setAdminModal({ order, time: order.schedule.find(s2=>s2.status==="due")!.time }); }}
                        style={{ background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.3)", borderRadius:10, padding:"8px 14px", color:"#4ade80", fontSize:11, fontWeight:700, cursor:"pointer", flexShrink:0, whiteSpace:"nowrap" }}>
                        âœ“ Mark Given
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Administration modal */}
      {adminModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
          <Card style={{ width:480, padding:28 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:"#f1f5f9", margin:0 }}>
                {adminModal.order.controlled ? "âš  Controlled Drug Administration" : "Confirm Administration"}
              </h3>
              <button onClick={() => setAdminModal(null)} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer", fontSize:22 }}>Ã—</button>
            </div>

            {(adminModal.order.highAlert || adminModal.order.controlled) && (
              <div style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.25)", borderRadius:12, padding:"12px 16px", marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <ShieldAlert style={{ width:16, height:16, color:"#f87171" }} />
                  <span style={{ fontSize:13, fontWeight:700, color:"#f87171" }}>
                    {adminModal.order.controlled ? "2-Nurse Verification Required" : "High-Alert Medication â€” Double Check"}
                  </span>
                </div>
                <p style={{ fontSize:11, color:"rgba(248,113,113,0.7)", margin:"6px 0 0" }}>
                  Verify patient wristband, drug, dose, route, and time before administration.
                </p>
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              {[
                { l:"Patient", v:`${activePatient.name} (${activePatient.mrn})` },
                { l:"Allergies", v:activePatient.allergies.join(", ") || "None" },
                { l:"Drug", v:adminModal.order.drug },
                { l:"Dose", v:`${adminModal.order.dose} ${adminModal.order.route}` },
                { l:"Scheduled Time", v:adminModal.order.schedule.find(s2=>s2.status==="due")?.time ?? adminModal.time },
                { l:"Indication", v:adminModal.order.indication },
              ].map(r => (
                <div key={r.l} style={{ background:"rgba(255,255,255,0.02)", borderRadius:10, padding:"10px 12px" }}>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:"0 0 3px", textTransform:"uppercase", letterSpacing:"0.05em" }}>{r.l}</p>
                  <p style={{ fontSize:12, fontWeight:600, color: r.l==="Allergies" && r.v!=="None" ? "#f87171":"#f1f5f9", margin:0 }}>{r.v}</p>
                </div>
              ))}
            </div>

            {/* Barcode verify */}
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.07em", margin:"0 0 8px" }}>Barcode Verification (5 Rights)</p>
              <button onClick={() => setBarcodeScanned(!barcodeScanned)}
                style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 0", borderRadius:12,
                  background: barcodeScanned?"rgba(74,222,128,0.12)":"rgba(255,255,255,0.04)",
                  border:`1px solid ${barcodeScanned?"rgba(74,222,128,0.3)":"rgba(255,255,255,0.1)"}`,
                  color: barcodeScanned?"#4ade80":"rgba(255,255,255,0.5)", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                {barcodeScanned ? <><CheckCircle2 style={{ width:16, height:16 }} /> Barcode Verified âœ“</> : <><Scan style={{ width:16, height:16 }} /> Scan Medication Barcode</>}
              </button>
            </div>

            {adminModal.order.controlled && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  <label style={{ fontSize:11, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.07em" }}>Witness Nurse</label>
                  <input placeholder="Witness name + PIN" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 12px", color:"#f1f5f9", fontSize:12, outline:"none" }} />
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  <label style={{ fontSize:11, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.07em" }}>Wasted Amount</label>
                  <input placeholder="e.g. 2mg wasted" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 12px", color:"#f1f5f9", fontSize:12, outline:"none" }} />
                </div>
              </div>
            )}

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => markGiven(adminModal.order.id, adminModal.time)}
                style={{ flex:1, background:"linear-gradient(135deg,#4ade80,#22c55e)", color:"white", border:"none", borderRadius:12, padding:"12px 0", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <CheckCircle2 style={{ width:16, height:16 }} /> Confirm Administration
              </button>
              <button onClick={() => { setAdminModal(null); }}
                style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.25)", borderRadius:12, padding:"0 16px", color:"#f87171", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                Hold
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


