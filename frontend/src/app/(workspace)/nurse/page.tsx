"use client";

import { useState, useEffect } from "react";
import {
  Heart, Activity, AlertTriangle, Pill, ClipboardList,
  Droplets, BellRing, Clock,
} from "lucide-react";

interface Patient {
  id: string; name: string; mrn: string; room: string; bed: string;
  age: number; gender: string; diagnosis: string;
  vitals: { bp: string; hr: number; spo2: number; temp: number; news2: number };
  meds_due: { name: string; dose: string; route: string; time: string; overdue: boolean }[];
  alerts: string[];
  fall_risk: "low"|"medium"|"high";
  isolation?: string;
}

const MOCK_PATIENTS: Patient[] = [
  { id:"1", name:"Mohammed Al-Rashidi", mrn:"MRN-001", room:"A102", bed:"A", age:58, gender:"M",
    diagnosis:"STEMI — post PCI Day 2",
    vitals:{bp:"122/74",hr:68,spo2:97,temp:36.8,news2:1},
    meds_due:[
      {name:"Aspirin",     dose:"100mg", route:"PO", time:"09:00", overdue:false},
      {name:"Metoprolol",  dose:"25mg",  route:"PO", time:"09:00", overdue:true},
    ],
    alerts:[], fall_risk:"low" },
  { id:"2", name:"Fatima Al-Otaibi", mrn:"MRN-002", room:"B205", bed:"B", age:34, gender:"F",
    diagnosis:"Subarachnoid Hemorrhage",
    vitals:{bp:"168/102",hr:94,spo2:95,temp:38.1,news2:5},
    meds_due:[
      {name:"Nimodipine",   dose:"60mg",  route:"PO", time:"08:00", overdue:true},
      {name:"Levetiracetam",dose:"500mg", route:"IV", time:"10:00", overdue:false},
    ],
    alerts:["BP trending high — notify neurologist","Seizure precautions active"],
    fall_risk:"high", isolation:"contact" },
  { id:"3", name:"Abdullah Al-Ghamdi", mrn:"MRN-003", room:"CCU-1", bed:"A", age:72, gender:"M",
    diagnosis:"Acute HFrEF — exacerbation",
    vitals:{bp:"142/88",hr:92,spo2:91,temp:36.6,news2:4},
    meds_due:[
      {name:"Furosemide",    dose:"40mg", route:"IV", time:"08:00", overdue:true},
      {name:"Spironolactone",dose:"25mg", route:"PO", time:"12:00", overdue:false},
    ],
    alerts:["SpO2 <94% — consider supplemental O2","Daily weight required"],
    fall_risk:"medium" },
];

export default function NursePage() {
  const [selected, setSelected] = useState<Patient | null>(MOCK_PATIENTS[0]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const totalAlerts  = MOCK_PATIENTS.reduce((s, p) => s + p.alerts.length, 0);
  const overdueMeds  = MOCK_PATIENTS.reduce((s, p) => s + p.meds_due.filter(m => m.overdue).length, 0);

  return (
    <div className="flex h-full gap-0">
      {/* Patient list */}
      <aside className="w-[256px] flex-shrink-0 border-r overflow-y-auto"
        style={{ borderColor: "rgba(255,255,255,.06)", background: "oklch(0.075 0.016 250)" }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,.06)" }}>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" style={{ color: "#E67E22" }} />
            <span className="text-sm font-bold text-white">Nurse Station</span>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {totalAlerts > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{ background: "rgba(231,76,60,.15)", color: "#E74C3C" }}>
                {totalAlerts} Alerts
              </span>
            )}
            {overdueMeds > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{ background: "rgba(243,156,18,.15)", color: "#F39C12" }}>
                {overdueMeds} Overdue
              </span>
            )}
          </div>
        </div>
        <div className="p-2 space-y-1">
          {MOCK_PATIENTS.map(p => {
            const newsColor = p.vitals.news2 >= 5 ? "#E74C3C" : p.vitals.news2 >= 3 ? "#E67E22" : "#2ECC71";
            return (
              <button key={p.id} onClick={() => setSelected(p)}
                className="w-full text-left p-3 rounded-xl transition-all"
                style={{
                  background: selected?.id === p.id ? "rgba(230,126,34,.1)" : "rgba(255,255,255,.02)",
                  border: `1px solid ${selected?.id === p.id ? "rgba(230,126,34,.25)" : "rgba(255,255,255,.05)"}`,
                }}>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-semibold text-white truncate">{p.name}</span>
                  <span className="text-[9px] flex-shrink-0" style={{ color: "rgba(255,255,255,.4)" }}>{p.room}</span>
                </div>
                <div className="text-[10px] truncate mb-1.5" style={{ color: "rgba(255,255,255,.4)" }}>{p.diagnosis}</div>
                <div className="flex gap-1.5 flex-wrap">
                  <span className="text-[9px] font-bold" style={{ color: newsColor }}>NEWS2:{p.vitals.news2}</span>
                  {p.alerts.length > 0 && <span className="text-[9px] text-red-400">⚠ {p.alerts.length}</span>}
                  {p.meds_due.some(m => m.overdue) && <span className="text-[9px] text-yellow-400">Med!</span>}
                  {p.isolation && <span className="text-[9px] text-purple-400">Iso</span>}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Detail */}
      {selected && (
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Header */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="text-base font-bold text-white">{selected.name}</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,.4)" }}>
                  {selected.mrn} · Room {selected.room}/{selected.bed} · {selected.age}y {selected.gender}
                </div>
                <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,.6)" }}>{selected.diagnosis}</div>
              </div>
              <div className="flex flex-col gap-1 items-end text-[9px]">
                {(() => {
                  const n = selected.vitals.news2;
                  const c = n >= 5 ? "#E74C3C" : n >= 3 ? "#E67E22" : "#2ECC71";
                  const l = n >= 5 ? "HIGH RISK" : n >= 3 ? "MEDIUM" : "LOW";
                  return (
                    <span className="font-black px-2 py-0.5 rounded"
                      style={{ background: `${c}22`, color: c, border: `1px solid ${c}44` }}>
                      NEWS2:{n} {l}
                    </span>
                  );
                })()}
                {selected.isolation && (
                  <span className="px-1.5 py-0.5 rounded font-bold uppercase"
                    style={{ background: "rgba(155,89,182,.15)", color: "#9B59B6" }}>
                    {selected.isolation} isolation
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[
                {l:"BP",   v:selected.vitals.bp,         w:parseInt(selected.vitals.bp)>140},
                {l:"HR",   v:`${selected.vitals.hr}/m`,  w:selected.vitals.hr>100||selected.vitals.hr<60},
                {l:"SpO2", v:`${selected.vitals.spo2}%`, w:selected.vitals.spo2<94},
                {l:"Temp", v:`${selected.vitals.temp}°`, w:selected.vitals.temp>=38},
                {l:"NEWS2",v:selected.vitals.news2,      w:selected.vitals.news2>=5},
              ].map(v => (
                <div key={v.l} className="text-center px-2 py-2 rounded-lg"
                  style={{ background: v.w?"rgba(231,76,60,.1)":"rgba(255,255,255,.04)", border:`1px solid ${v.w?"rgba(231,76,60,.25)":"rgba(255,255,255,.07)"}` }}>
                  <div className="text-[9px] mb-0.5" style={{ color:"rgba(255,255,255,.4)" }}>{v.l}</div>
                  <div className="text-xs font-bold" style={{ color:v.w?"#E74C3C":"#fff" }}>{v.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          {selected.alerts.length > 0 && (
            <div className="space-y-2">
              {selected.alerts.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background:"rgba(231,76,60,.08)", border:"1px solid rgba(231,76,60,.2)" }}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color:"#E74C3C" }} />
                  <span className="text-xs flex-1" style={{ color:"rgba(255,255,255,.8)" }}>{a}</span>
                  <button className="text-[10px] px-2 py-0.5 rounded-lg"
                    style={{ background:"rgba(231,76,60,.15)", color:"#E74C3C" }}>Ack</button>
                </div>
              ))}
            </div>
          )}

          {/* MAR */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Pill className="w-4 h-4" style={{ color:"#E67E22" }} />
              <span className="text-sm font-semibold text-white">Medication Administration Record</span>
              <span className="ml-auto text-xs" style={{ color:"rgba(255,255,255,.4)" }}>{now.toLocaleTimeString("en-SA")}</span>
            </div>
            <div className="space-y-2">
              {selected.meds_due.map((med, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background:med.overdue?"rgba(243,156,18,.08)":"rgba(255,255,255,.03)", border:`1px solid ${med.overdue?"rgba(243,156,18,.25)":"rgba(255,255,255,.07)"}` }}>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-white">{med.name} {med.dose}</div>
                    <div className="text-[10px] mt-0.5" style={{ color:"rgba(255,255,255,.4)" }}>
                      {med.route} · Due {med.time}
                      {med.overdue && <span className="ml-1 font-bold text-yellow-400">OVERDUE</span>}
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg text-[11px] font-bold"
                    style={{ background:"rgba(46,204,113,.15)", color:"#2ECC71", border:"1px solid rgba(46,204,113,.25)" }}>
                    Given
                  </button>
                  <button className="px-2 py-1.5 rounded-lg text-[11px]"
                    style={{ background:"rgba(255,255,255,.04)", color:"rgba(255,255,255,.4)" }}>
                    Hold
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-4 gap-2">
            {[
              {icon:<Activity className="w-4 h-4"/>,     label:"Record Vitals",  color:"#E67E22"},
              {icon:<ClipboardList className="w-4 h-4"/>, label:"Nursing Note",   color:"#5DADE2"},
              {icon:<Droplets className="w-4 h-4"/>,      label:"Fluid Balance",  color:"#3498DB"},
              {icon:<BellRing className="w-4 h-4"/>,      label:"Call Physician", color:"#E74C3C"},
            ].map(a => (
              <button key={a.label}
                className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:bg-white/[0.04]"
                style={{ border:"1px solid rgba(255,255,255,.07)" }}>
                <span style={{ color:a.color }}>{a.icon}</span>
                <span className="text-[10px] text-center" style={{ color:"rgba(255,255,255,.5)" }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
