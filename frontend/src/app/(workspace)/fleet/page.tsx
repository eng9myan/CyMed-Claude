"use client";

import { useState } from "react";
import {
  Truck, MapPin, Activity, AlertTriangle, CheckCircle2,
  Clock, Fuel, Wrench, Phone, Radio, Navigation,
  User, Plus, BarChart3,
} from "lucide-react";

type VehicleStatus = "available" | "dispatched" | "at_scene" | "returning" | "maintenance" | "offline";
type VehicleType = "als_ambulance" | "bls_ambulance" | "patient_transport" | "supervisor" | "motorcycle";

type Vehicle = {
  id: string; callSign: string; type: VehicleType; status: VehicleStatus;
  crew: string[]; location: string; odometer: number;
  lastService: string; nextService: number; fuelLevel: number;
  missionId?: string; eta?: string;
};

type Mission = {
  id: string; type: string; priority: "P1" | "P2" | "P3";
  patient?: string; location: string; dispatchedAt: string;
  assignedVehicle?: string; status: "pending" | "en_route" | "on_scene" | "transporting" | "completed";
  notes?: string;
};

const STATUS_META: Record<VehicleStatus, { color:string; bg:string; label:string }> = {
  available:    { color:"#4ade80", bg:"rgba(74,222,128,0.1)",   label:"Available" },
  dispatched:   { color:"#22d3ee", bg:"rgba(34,211,238,0.1)",   label:"Dispatched" },
  at_scene:     { color:"#fbbf24", bg:"rgba(251,191,36,0.1)",   label:"At Scene" },
  returning:    { color:"#a78bfa", bg:"rgba(167,139,250,0.1)",  label:"Returning" },
  maintenance:  { color:"#fb923c", bg:"rgba(251,146,60,0.1)",   label:"Maintenance" },
  offline:      { color:"rgba(255,255,255,0.3)", bg:"rgba(255,255,255,0.05)", label:"Offline" },
};

const TYPE_LABELS: Record<VehicleType, string> = {
  als_ambulance:"ALS Ambulance", bls_ambulance:"BLS Ambulance",
  patient_transport:"Patient Transport", supervisor:"Supervisor", motorcycle:"Motorcycle First Responder",
};

const VEHICLES: Vehicle[] = [
  { id:"V01", callSign:"AMB-01", type:"als_ambulance", status:"dispatched", crew:["Paramedic Khalid","EMT Sana"], location:"King Fahd Road", odometer:82440, lastService:"2026-05-01", nextService:90000, fuelLevel:78, missionId:"M001", eta:"08 min" },
  { id:"V02", callSign:"AMB-02", type:"als_ambulance", status:"available", crew:["Paramedic Omar","EMT Rasha"], location:"Base Station â€” CyMed Main", odometer:61200, lastService:"2026-04-20", nextService:70000, fuelLevel:95 },
  { id:"V03", callSign:"AMB-03", type:"bls_ambulance", status:"at_scene", crew:["EMT Fahad","EMT Layla"], location:"Al Olaya District", odometer:44800, lastService:"2026-05-15", nextService:50000, fuelLevel:62, missionId:"M002" },
  { id:"V04", callSign:"AMB-04", type:"bls_ambulance", status:"returning", crew:["EMT Ahmad","EMT Sara"], location:"Al Nakheel Road â†’ Base", odometer:71300, lastService:"2026-05-10", nextService:80000, fuelLevel:55, eta:"15 min" },
  { id:"V05", callSign:"PT-01", type:"patient_transport", status:"dispatched", crew:["Driver Majed"], location:"KFSH Route", odometer:38900, lastService:"2026-04-28", nextService:45000, fuelLevel:88, missionId:"M003", eta:"22 min" },
  { id:"V06", callSign:"SUP-01", type:"supervisor", status:"available", crew:["Sup. Al-Otaibi"], location:"Base Station", odometer:52100, lastService:"2026-05-05", nextService:60000, fuelLevel:70 },
  { id:"V07", callSign:"AMB-05", type:"als_ambulance", status:"maintenance", crew:[], location:"Workshop Bay 2", odometer:93800, lastService:"2026-06-13", nextService:100000, fuelLevel:40 },
  { id:"V08", callSign:"MFRA-01", type:"motorcycle", status:"available", crew:["CFR Hassan"], location:"City Center", odometer:18400, lastService:"2026-05-25", nextService:20000, fuelLevel:90 },
];

const MISSIONS: Mission[] = [
  { id:"M001", type:"Cardiac Arrest", priority:"P1", patient:"Unknown Male 60y", location:"Al Nakheel District, Block 12", dispatchedAt:"14:28", assignedVehicle:"AMB-01", status:"en_route", notes:"CPR in progress by bystander" },
  { id:"M002", type:"RTA â€” Multiple Casualties", priority:"P1", patient:"3 patients", location:"King Fahdâ€“King Abdulaziz junction", dispatchedAt:"14:19", assignedVehicle:"AMB-03", status:"on_scene", notes:"ICS activated, MCI protocol" },
  { id:"M003", type:"Scheduled Transfer", priority:"P3", patient:"Mrs. Al-Ghamdi MRN-10490", location:"CyMed â†’ KFSH Oncology", dispatchedAt:"14:00", assignedVehicle:"PT-01", status:"transporting", notes:"Chemotherapy transfer" },
  { id:"M004", type:"Chest Pain", priority:"P2", patient:"Male 55y", location:"Sulaymaniyah Mosque St.", dispatchedAt:"14:41", status:"pending" },
];

const PRIORITY_META = {
  P1: { color:"#f43f5e", bg:"rgba(244,63,94,0.15)", pulse:true },
  P2: { color:"#fbbf24", bg:"rgba(251,191,36,0.1)", pulse:false },
  P3: { color:"#4ade80", bg:"rgba(74,222,128,0.1)", pulse:false },
};

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

export default function FleetPage() {
  const [selectedV, setSelectedV] = useState<Vehicle | null>(null);
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(MISSIONS[0]);

  const available  = VEHICLES.filter(v => v.status === "available").length;
  const dispatched = VEHICLES.filter(v => ["dispatched","at_scene","returning"].includes(v.status)).length;
  const maintenance = VEHICLES.filter(v => v.status === "maintenance").length;
  const activeMissions = MISSIONS.filter(m => m.status !== "completed").length;

  return (
    <div style={{ padding:"24px", minHeight:"100vh", background:"#080d18" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Fleet & Ambulance Management</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>
            Real-time dispatch Â· GPS tracking Â· Maintenance Â· ED pre-notification
          </p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => setDispatchOpen(true)}
            style={{ display:"flex", alignItems:"center", gap:7, background:"linear-gradient(135deg,#f43f5e,#e11d48)", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
            <Radio style={{ width:14, height:14 }} /> Dispatch Unit
          </button>
          <button style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"8px 16px", fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.6)", cursor:"pointer" }}>
            <Plus style={{ width:13, height:13 }} /> New Vehicle
          </button>
        </div>
      </div>

      {/* KPI bar */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:20 }}>
        {[
          { l:"Available", v:available, c:"#4ade80" },
          { l:"Active Missions", v:dispatched, c:"#22d3ee" },
          { l:"In Maintenance", v:maintenance, c:"#fb923c" },
          { l:"P1 Incidents", v:MISSIONS.filter(m=>m.priority==="P1"&&m.status!=="completed").length, c:"#f43f5e" },
          { l:"Total Fleet", v:VEHICLES.length, c:"rgba(255,255,255,0.5)" },
        ].map(s => (
          <Card key={s.l} style={{ padding:"12px 16px" }}>
            <p style={{ fontSize:26, fontWeight:800, color:s.c, margin:0 }}>{s.v}</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{s.l}</p>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:16 }}>
        {/* Vehicles */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.6)", margin:0, textTransform:"uppercase", letterSpacing:"0.07em" }}>Fleet Status</h3>
          {VEHICLES.map(v => {
            const sm = STATUS_META[v.status];
            const needsService = v.odometer >= v.nextService * 0.97;
            const lowFuel = v.fuelLevel < 25;
            return (
              <Card key={v.id} style={{ padding:16, cursor:"pointer",
                border:`1px solid ${selectedV?.id===v.id?"rgba(230,126,34,0.35)":"rgba(255,255,255,0.07)"}`,
                background:selectedV?.id===v.id?"rgba(230,126,34,0.06)":"rgba(255,255,255,0.03)" }}
                onClick={() => setSelectedV(selectedV?.id===v.id?null:v)}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  {/* Icon */}
                  <div style={{ width:44, height:44, borderRadius:12, background:sm.bg, border:`1px solid ${sm.color}30`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Truck style={{ width:20, height:20, color:sm.color }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:14, fontWeight:800, color:"#f1f5f9" }}>{v.callSign}</span>
                      <span style={{ fontSize:10, background:sm.bg, color:sm.color, borderRadius:6, padding:"2px 8px", fontWeight:700 }}>{sm.label}</span>
                      <span style={{ fontSize:10, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.4)", borderRadius:6, padding:"2px 8px" }}>{TYPE_LABELS[v.type]}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"rgba(255,255,255,0.5)" }}>
                        <MapPin style={{ width:11, height:11 }} />{v.location}
                      </span>
                      {v.crew.length > 0 && (
                        <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"rgba(255,255,255,0.4)" }}>
                          <User style={{ width:11, height:11 }} />{v.crew.join(", ")}
                        </span>
                      )}
                      {v.eta && (
                        <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#22d3ee", fontWeight:600 }}>
                          <Clock style={{ width:11, height:11 }} />ETA {v.eta}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Indicators */}
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    {/* Fuel */}
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                      <Fuel style={{ width:13, height:13, color: lowFuel?"#f87171":"rgba(255,255,255,0.35)" }} />
                      <div style={{ width:40, height:5, background:"rgba(255,255,255,0.08)", borderRadius:4, overflow:"hidden" }}>
                        <div style={{ height:"100%", background: lowFuel?"#f87171":"#4ade80", width:`${v.fuelLevel}%` }} />
                      </div>
                      <span style={{ fontSize:9, color: lowFuel?"#f87171":"rgba(255,255,255,0.3)" }}>{v.fuelLevel}%</span>
                    </div>
                    {/* Maintenance */}
                    {needsService && (
                      <div style={{ display:"flex", alignItems:"center", gap:4, background:"rgba(251,146,60,0.1)", border:"1px solid rgba(251,146,60,0.25)", borderRadius:6, padding:"3px 8px" }}>
                        <Wrench style={{ width:11, height:11, color:"#fb923c" }} />
                        <span style={{ fontSize:9, color:"#fb923c", fontWeight:700 }}>SERVICE DUE</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded mission info */}
                {selectedV?.id === v.id && v.missionId && (
                  <div style={{ marginTop:12, padding:"10px 14px", background:"rgba(34,211,238,0.06)", border:"1px solid rgba(34,211,238,0.15)", borderRadius:10 }}>
                    {(() => {
                      const m = MISSIONS.find(mi => mi.id === v.missionId);
                      if (!m) return null;
                      return (
                        <>
                          <p style={{ fontSize:12, fontWeight:700, color:"#22d3ee", margin:"0 0 4px" }}>Mission: {m.id} â€” {m.type}</p>
                          <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:"0 0 4px" }}>ðŸ“ {m.location}</p>
                          {m.notes && <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>{m.notes}</p>}
                        </>
                      );
                    })()}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Missions / Incidents panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.6)", margin:0, textTransform:"uppercase", letterSpacing:"0.07em" }}>Active Incidents</h3>
          {MISSIONS.map(m => {
            const pm = PRIORITY_META[m.priority];
            const isA = selectedMission?.id === m.id;
            return (
              <Card key={m.id} style={{ padding:16, cursor:"pointer",
                border:`1px solid ${isA?pm.color+"50":pm.color+"25"}`,
                background: isA?`${pm.color}08`:`${pm.color}04` }}
                onClick={() => setSelectedMission(isA?null:m)}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:11, fontWeight:800, background:pm.bg, color:pm.color, borderRadius:6, padding:"3px 10px", animation:pm.pulse?"pulse 1.5s infinite":"none" }}>{m.priority}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:"#f1f5f9" }}>{m.type}</span>
                  </div>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{m.dispatchedAt}</span>
                </div>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.55)", margin:"0 0 6px", display:"flex", alignItems:"center", gap:5 }}>
                  <MapPin style={{ width:11, height:11 }} />{m.location}
                </p>
                {m.patient && <p style={{ fontSize:11, color:"rgba(255,255,255,0.45)", margin:"0 0 6px" }}>Patient: {m.patient}</p>}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:10, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.45)", borderRadius:5, padding:"2px 8px" }}>{m.status.replace("_"," ")}</span>
                  {m.assignedVehicle ? (
                    <span style={{ fontSize:10, color:"#22d3ee", fontWeight:700 }}>{m.assignedVehicle}</span>
                  ) : (
                    <button onClick={e => { e.stopPropagation(); setDispatchOpen(true); }}
                      style={{ fontSize:10, background:"rgba(244,63,94,0.15)", border:"1px solid rgba(244,63,94,0.3)", borderRadius:6, padding:"3px 10px", color:"#f43f5e", fontWeight:700, cursor:"pointer" }}>
                      Assign Unit
                    </button>
                  )}
                </div>
                {m.notes && isA && (
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"8px 0 0", padding:"8px 10px", background:"rgba(255,255,255,0.02)", borderRadius:8 }}>
                    ðŸ“‹ {m.notes}
                  </p>
                )}
              </Card>
            );
          })}

          {/* ED Pre-notification */}
          <Card style={{ padding:16 }}>
            <h4 style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:"0 0 12px", display:"flex", alignItems:"center", gap:6 }}>
              <Phone style={{ width:13, height:13, color:"#e67e22" }} /> ED Pre-Notification
            </h4>
            {MISSIONS.filter(m=>["P1","P2"].includes(m.priority)&&m.assignedVehicle).map(m => (
              <div key={m.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:0 }}>{m.type}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{m.assignedVehicle} Â· {VEHICLES.find(v=>v.callSign===m.assignedVehicle)?.eta ?? "ETA unknown"}</p>
                </div>
                <button style={{ fontSize:10, background:"rgba(230,126,34,0.15)", border:"1px solid rgba(230,126,34,0.3)", borderRadius:7, padding:"4px 10px", color:"#e67e22", fontWeight:700, cursor:"pointer" }}>
                  Alert ED
                </button>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Dispatch modal */}
      {dispatchOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
          <Card style={{ width:480, padding:28 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:"#f1f5f9", margin:0 }}>Dispatch Unit</h3>
              <button onClick={() => setDispatchOpen(false)} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer", fontSize:22 }}>Ã—</button>
            </div>
            <div style={{ display:"grid", gap:12 }}>
              {[{l:"Incident Type"},{l:"Location / Address"},{l:"Patient Info"},{l:"Priority"}].map(f => (
                <div key={f.l} style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  <label style={{ fontSize:11, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.07em" }}>{f.l}</label>
                  {f.l === "Priority" ? (
                    <select style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:13, outline:"none" }}>
                      <option>P1 â€” Life threatening</option>
                      <option>P2 â€” Urgent</option>
                      <option>P3 â€” Non-urgent</option>
                    </select>
                  ) : (
                    <input style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:13, outline:"none" }} />
                  )}
                </div>
              ))}
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                <label style={{ fontSize:11, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.07em" }}>Assign Unit</label>
                <select style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:13, outline:"none" }}>
                  {VEHICLES.filter(v=>v.status==="available").map(v => (
                    <option key={v.id} value={v.callSign}>{v.callSign} â€” {TYPE_LABELS[v.type]} ({v.crew.join(", ")})</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button style={{ flex:1, background:"linear-gradient(135deg,#f43f5e,#e11d48)", color:"white", border:"none", borderRadius:12, padding:"12px 0", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <Radio style={{ width:16, height:16 }} /> Dispatch Now
              </button>
              <button onClick={() => setDispatchOpen(false)} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"0 20px", color:"rgba(255,255,255,0.4)", fontSize:13, cursor:"pointer" }}>Cancel</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


