"use client";

import { useState } from "react";
import {
  Stethoscope, User, Clock, AlertTriangle, CheckCircle2,
  ChevronRight, FileText, Pill, FlaskConical, Radio,
  Brain, Mic, MicOff, Send, Activity, Heart,
  Clipboard, PenLine, Zap,
} from "lucide-react";
import { ICD11Search } from "@/components/clinical/ICD11Search";

interface QueuePatient {
  id: string; name: string; mrn: string; age: number; gender: string;
  chief_complaint: string; triage: number; wait_min: number;
  status: "waiting" | "in_consultation" | "orders_pending" | "completed";
  vitals?: { bp: string; hr: number; spo2: number; temp: number; news2: number };
  allergies: string[];
}

const TRIAGE_COLOR = ["","#E74C3C","#E67E22","#F1C40F","#2ECC71","#3498DB"];
const TRIAGE_LABEL = ["","IMMEDIATE","EMERGENT","URGENT","LESS URGENT","NON-URGENT"];

const MOCK_QUEUE: QueuePatient[] = [
  { id:"1", name:"Mohammed Al-Rashidi", mrn:"MRN-001", age:58, gender:"M",
    chief_complaint:"Chest pain, diaphoresis 2hrs", triage:2, wait_min:8,
    status:"waiting", allergies:["Penicillin"],
    vitals:{bp:"155/92",hr:104,spo2:96,temp:37.1,news2:5} },
  { id:"2", name:"Fatima Al-Otaibi", mrn:"MRN-002", age:34, gender:"F",
    chief_complaint:"Severe headache, photophobia", triage:2, wait_min:12,
    status:"waiting", allergies:[],
    vitals:{bp:"148/96",hr:88,spo2:99,temp:38.2,news2:3} },
  { id:"3", name:"Abdullah Al-Ghamdi", mrn:"MRN-003", age:72, gender:"M",
    chief_complaint:"SOB, bilateral leg edema", triage:3, wait_min:25,
    status:"in_consultation", allergies:["Aspirin","Sulfa"],
    vitals:{bp:"142/88",hr:92,spo2:91,temp:36.8,news2:4} },
  { id:"4", name:"Nora Hassan", mrn:"MRN-004", age:29, gender:"F",
    chief_complaint:"Abdominal pain, nausea x3 days", triage:3, wait_min:40,
    status:"waiting", allergies:[],
    vitals:{bp:"118/74",hr:82,spo2:99,temp:37.6,news2:1} },
  { id:"5", name:"Ibrahim Al-Zahrani", mrn:"MRN-005", age:45, gender:"M",
    chief_complaint:"Routine follow-up T2DM", triage:5, wait_min:55,
    status:"waiting", allergies:[],
    vitals:{bp:"132/84",hr:76,spo2:98,temp:36.9,news2:0} },
];

function TriageBadge({ level }: { level: number }) {
  const color = TRIAGE_COLOR[level] || "#95A5A6";
  const label = TRIAGE_LABEL[level] || "UNKNOWN";
  return (
    <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44`, letterSpacing: "0.06em" }}>
      T{level} {label}
    </span>
  );
}

function VitalPill({ label, value, unit, warn }: { label: string; value: string | number; unit?: string; warn?: boolean }) {
  return (
    <div className="text-center px-2 py-1 rounded-lg"
      style={{ background: warn ? "rgba(231,76,60,.12)" : "rgba(255,255,255,.04)", border: `1px solid ${warn ? "rgba(231,76,60,.3)" : "rgba(255,255,255,.08)"}` }}>
      <div className="text-[9px]" style={{ color: "rgba(255,255,255,.4)" }}>{label}</div>
      <div className="text-xs font-bold" style={{ color: warn ? "#E74C3C" : "#fff" }}>
        {value}{unit && <span className="text-[9px] ml-0.5 font-normal opacity-50">{unit}</span>}
      </div>
    </div>
  );
}

function AICopilot({ patient }: { patient: QueuePatient | null }) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "I'm your AI clinical assistant. Ask me about differentials, drug interactions, or ask me to generate a SOAP note from your dictation." },
  ]);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!prompt.trim()) return;
    const userMsg = prompt;
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setPrompt("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 1100));
    const aiReply = `Based on the presentation (${patient?.chief_complaint || "current case"}), consider:\n\n1. **Primary:** ACS / STEMI — ST changes, troponin rise, diaphoresis\n2. **Differential:** Aortic dissection — BP asymmetry, tearing quality\n3. **Rule out:** PE — Wells score, D-dimer if low-intermediate\n\nRecommendations:\n• 12-lead ECG immediately\n• Troponin I serial (0h/3h/6h)\n• Aspirin 300mg PO if not contraindicated\n• IV access + O2 if SpO2 <94%\n\nNEWS2 ${patient?.vitals?.news2 ?? 0} → ${(patient?.vitals?.news2 ?? 0) >= 5 ? "HIGH RISK — consider escalation" : "moderate — monitor closely"}`;
    setMessages(m => [...m, { role: "ai", text: aiReply }]);
    setLoading(false);
  }

  return (
    <div className="glass-card rounded-2xl flex flex-col" style={{ height: 420 }}>
      <div className="flex items-center gap-2 p-4 border-b flex-shrink-0" style={{ borderColor: "rgba(255,255,255,.06)" }}>
        <Brain className="w-4 h-4" style={{ color: "#E67E22" }} />
        <span className="text-sm font-semibold text-white">AI Clinical Copilot</span>
        <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ background: "rgba(46,204,113,.12)", color: "#2ECC71" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Claude
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[85%] px-3 py-2 rounded-xl text-xs whitespace-pre-wrap leading-relaxed"
              style={m.role === "user"
                ? { background: "rgba(230,126,34,.15)", color: "#fff", border: "1px solid rgba(230,126,34,.25)" }
                : { background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.85)", border: "1px solid rgba(255,255,255,.07)" }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-xl text-[10px]" style={{ background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.4)" }}>
              <span className="animate-pulse">Thinking…</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 border-t flex-shrink-0 flex gap-2" style={{ borderColor: "rgba(255,255,255,.06)" }}>
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask AI… differentials, drug check, SOAP note"
          className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
          style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff" }}
        />
        <button onClick={send} className="p-2 rounded-lg" style={{ background: "linear-gradient(135deg,#E67E22,#d4691a)", color: "#fff" }}>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function DoctorPage() {
  const [selected, setSelected]   = useState<QueuePatient | null>(MOCK_QUEUE[0]);
  const [soapNote, setSoapNote]   = useState("");
  const [activeTab, setActiveTab] = useState<"soap"|"orders"|"history">("soap");

  return (
    <div className="flex h-full gap-0">
      {/* Queue */}
      <aside className="w-[272px] flex-shrink-0 border-r overflow-y-auto"
        style={{ borderColor: "rgba(255,255,255,.06)", background: "oklch(0.075 0.016 250)" }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,.06)" }}>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4" style={{ color: "#E67E22" }} />
            <span className="text-sm font-bold text-white">My Queue</span>
            <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold"
              style={{ background: "rgba(230,126,34,.15)", color: "#E67E22" }}>
              {MOCK_QUEUE.filter(p => p.status !== "completed").length}
            </span>
          </div>
        </div>
        <div className="p-2 space-y-1">
          {MOCK_QUEUE.map(p => (
            <button key={p.id} onClick={() => setSelected(p)}
              className="w-full text-left p-3 rounded-xl transition-all"
              style={{
                background: selected?.id === p.id ? "rgba(230,126,34,.1)" : "rgba(255,255,255,.02)",
                border: `1px solid ${selected?.id === p.id ? "rgba(230,126,34,.25)" : "rgba(255,255,255,.05)"}`,
              }}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                <TriageBadge level={p.triage} />
              </div>
              <div className="text-[10px] truncate mb-1.5" style={{ color: "rgba(255,255,255,.45)" }}>{p.chief_complaint}</div>
              <div className="flex items-center gap-2">
                <span className="text-[9px]" style={{ color: "rgba(255,255,255,.3)" }}>
                  <Clock className="w-2.5 h-2.5 inline mr-0.5" />{p.wait_min}m
                </span>
                {p.vitals && (
                  <span className={`text-[9px] font-bold ${p.vitals.news2 >= 5 ? "text-red-400" : "text-green-400"}`}>
                    NEWS2:{p.vitals.news2}
                  </span>
                )}
                {p.allergies.length > 0 && <span className="text-[9px] text-yellow-400">⚠ Allergy</span>}
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Workspace */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {selected && (
          <>
            {/* Patient header */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                    style={{ background: "rgba(93,173,226,.15)", color: "#5DADE2" }}>
                    {selected.gender}
                  </div>
                  <div>
                    <div className="text-base font-bold text-white">{selected.name}</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,.4)" }}>
                      {selected.mrn} · {selected.age}y
                      {selected.allergies.length > 0 && (
                        <span className="ml-2 text-yellow-400 font-semibold">⚠ {selected.allergies.join(", ")}</span>
                      )}
                    </div>
                  </div>
                </div>
                <TriageBadge level={selected.triage} />
              </div>
              {selected.vitals && (
                <div className="grid grid-cols-6 gap-2">
                  <VitalPill label="BP" value={selected.vitals.bp} warn={parseInt(selected.vitals.bp) > 140} />
                  <VitalPill label="HR" value={selected.vitals.hr} unit="/min" warn={selected.vitals.hr > 100} />
                  <VitalPill label="SpO2" value={selected.vitals.spo2} unit="%" warn={selected.vitals.spo2 < 94} />
                  <VitalPill label="Temp" value={selected.vitals.temp} unit="°C" warn={selected.vitals.temp >= 38} />
                  <VitalPill label="NEWS2" value={selected.vitals.news2} warn={selected.vitals.news2 >= 5} />
                  <VitalPill label="Pain" value="—" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Clinical docs */}
              <div className="space-y-3">
                <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)" }}>
                  {(["soap","orders","history"] as const).map(t => (
                    <button key={t} onClick={() => setActiveTab(t)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
                      style={activeTab === t
                        ? { background: "rgba(230,126,34,.15)", color: "#E67E22", border: "1px solid rgba(230,126,34,.25)" }
                        : { color: "rgba(255,255,255,.4)" }}>
                      {t === "soap" ? "SOAP Note" : t === "orders" ? "Orders" : "History"}
                    </button>
                  ))}
                </div>

                {activeTab === "soap" && (
                  <div className="glass-card rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <PenLine className="w-4 h-4" style={{ color: "#E67E22" }} />
                      <span className="text-sm font-semibold text-white">Clinical Note</span>
                      <button className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                        style={{ background: "rgba(230,126,34,.12)", color: "#E67E22", border: "1px solid rgba(230,126,34,.2)" }}>
                        <Mic className="w-3 h-3" /> Dictate
                      </button>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: "rgba(255,255,255,.35)" }}>Diagnosis (ICD-11)</label>
                      <ICD11Search onSelect={r => {}} placeholder="Search ICD-11 diagnosis…" />
                    </div>
                    <textarea
                      value={soapNote}
                      onChange={e => setSoapNote(e.target.value)}
                      placeholder={"S: Patient presents with...\nO: Examination reveals...\nA: Assessment...\nP: Plan..."}
                      rows={8}
                      className="w-full px-3 py-2.5 rounded-xl text-xs leading-relaxed outline-none resize-none"
                      style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", color: "#fff" }}
                    />
                    <button className="w-full py-2 rounded-xl text-xs font-semibold"
                      style={{ background: "linear-gradient(135deg,#E67E22,#d4691a)", color: "#fff" }}>
                      Sign & Save Note
                    </button>
                  </div>
                )}

                {activeTab === "orders" && (
                  <div className="glass-card rounded-2xl p-4 space-y-3">
                    <div className="text-sm font-semibold text-white mb-2">CPOE — Order Entry</div>
                    {[
                      { icon: <FlaskConical className="w-4 h-4"/>, label: "Lab Orders",  color: "#2ECC71" },
                      { icon: <Radio className="w-4 h-4"/>,         label: "Imaging",     color: "#9B59B6" },
                      { icon: <Pill className="w-4 h-4"/>,          label: "Medications", color: "#E67E22" },
                      { icon: <FileText className="w-4 h-4"/>,      label: "Consults",    color: "#5DADE2" },
                    ].map(o => (
                      <button key={o.label}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-white/[0.04]"
                        style={{ border: "1px solid rgba(255,255,255,.07)" }}>
                        <span style={{ color: o.color }}>{o.icon}</span>
                        <span className="text-xs font-medium text-white">{o.label}</span>
                        <ChevronRight className="w-3 h-3 ml-auto opacity-30" />
                      </button>
                    ))}
                  </div>
                )}

                {activeTab === "history" && (
                  <div className="glass-card rounded-2xl p-4">
                    <div className="text-sm font-semibold text-white mb-3">Patient History</div>
                    <div className="text-xs space-y-2" style={{ color: "rgba(255,255,255,.45)" }}>
                      <div>No previous encounters found in this facility.</div>
                      <div className="text-[10px] mt-2 p-2 rounded-lg" style={{ background: "rgba(93,173,226,.06)", color: "#5DADE2", border: "1px solid rgba(93,173,226,.15)" }}>
                        Connect NPHIES to pull national health record.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Copilot */}
              <AICopilot patient={selected} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
