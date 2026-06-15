"use client";
import { useState } from "react";
import { Mic, Brain, FileText, CheckCircle2, Edit3, Volume2 } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const SESSIONS = [
  { id:"AI001", patient:"Ahmad Al-Rashid", duration:"12 min", date:"2026-06-13 09:14", model:"Whisper + Claude Med-2026", confidence:96 },
  { id:"AI002", patient:"Fatima Al-Zahra",  duration:"8 min",  date:"2026-06-13 10:42", model:"Whisper + Claude Med-2026", confidence:94 },
  { id:"AI003", patient:"Khalid Al-Dosari", duration:"15 min", date:"2026-06-13 11:30", model:"Whisper + Claude Med-2026", confidence:91 },
];

const TRANSCRIPT = `[Provider] Good morning Mr. Al-Rashid. How have you been since our last visit?
[Patient] Better, doctor. The new medication seems to be helping with my chest pain.
[Provider] That's good to hear. Have you noticed any side effects?
[Patient] A little dizziness in the mornings but it goes away after breakfast.
[Provider] Are you taking the metoprolol with food as we discussed?
[Patient] Yes, I take it with my breakfast around 8 AM.
[Provider] Good. Let me check your blood pressure and heart rate today...`;

const GENERATED_NOTE = {
  S: "55M with HTN and history of stable angina returns for routine follow-up. Reports improvement in exertional chest pain since starting metoprolol 50mg BID 4 weeks ago. Notes mild morning dizziness, which resolves after meals. Compliant with morning dosing post-breakfast.",
  O: "Vitals: BP 128/82, HR 68, regular. SpO₂ 98% RA. Heart S1S2 normal, no murmurs/gallops/rubs. Lungs CTAB. No peripheral edema.",
  A: "1) Coronary artery disease — improving on beta-blocker therapy. 2) HTN — well controlled. 3) Orthostatic dizziness — mild, likely volume-related vs medication-induced.",
  P: "1) Continue metoprolol 50mg BID. 2) Check supine/standing BP at next visit. 3) Encourage adequate hydration. 4) Statin therapy already in place. 5) F/U in 3 months with lipid panel and ECG.",
  ICD: ["I25.10 — Atherosclerotic heart disease", "I10 — Essential HTN", "R42 — Dizziness"],
};

export default function AIScribePage() {
  const [recording, setRecording] = useState(false);

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:10 }}><Brain style={{ width:24, height:24, color:"#a855f7" }}/>Ambient Clinical AI Scribe</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Auto-transcribe visit conversations · Generate SOAP notes · Extract ICD-10 codes · Save 2+ hours/day · HIPAA-compliant</p>
        </div>
        <button onClick={()=>setRecording(!recording)} style={{ background:recording?"#f43f5e":"#a855f7", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Mic style={{ width:14, height:14 }}/>{recording ? "Stop Recording" : "Start Recording"}</button>
      </div>

      {recording && (
        <Card style={{ padding:16, marginBottom:14, background:"rgba(244,63,94,0.05)", border:"1px solid rgba(244,63,94,0.2)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:14, height:14, borderRadius:"50%", background:"#f43f5e", boxShadow:"0 0 12px #f43f5e", animation:"pulse 1.5s infinite" }} />
            <span style={{ fontSize:13, fontWeight:700, color:"#f43f5e" }}>● Recording in progress</span>
            <Volume2 style={{ width:14, height:14, color:"#f43f5e", marginLeft:"auto" }} />
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>Audio level: ▮▮▮▮▮▯▯▯</span>
          </div>
        </Card>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:7 }}><Mic style={{ width:13, height:13, color:"#22d3ee" }} />Live Transcript</h3>
          </div>
          <div style={{ padding:18, maxHeight:480, overflowY:"auto" }}>
            <pre style={{ fontSize:12, color:"rgba(255,255,255,0.75)", margin:0, fontFamily:"inherit", whiteSpace:"pre-wrap", lineHeight:1.7 }}>{TRANSCRIPT}</pre>
          </div>
        </Card>

        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:7 }}><FileText style={{ width:13, height:13, color:"#4ade80" }} />AI-Generated SOAP Note</h3>
            <button style={{ background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", borderRadius:8, padding:"5px 12px", fontSize:11, color:"#4ade80", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}><Edit3 style={{ width:11, height:11 }}/>Review & Sign</button>
          </div>
          <div style={{ padding:18, maxHeight:480, overflowY:"auto" }}>
            {[["S — Subjective", GENERATED_NOTE.S, "#22d3ee"], ["O — Objective", GENERATED_NOTE.O, "#4ade80"], ["A — Assessment", GENERATED_NOTE.A, "#fbbf24"], ["P — Plan", GENERATED_NOTE.P, "#a78bfa"]].map(([t,b,c]) => (
              <div key={t as string} style={{ marginBottom:12, padding:12, background:"rgba(255,255,255,0.02)", borderLeft:`3px solid ${c as string}`, borderRadius:8 }}>
                <p style={{ fontSize:11, fontWeight:800, color:c as string, margin:"0 0 5px", letterSpacing:"0.05em" }}>{t}</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.75)", margin:0, lineHeight:1.6 }}>{b}</p>
              </div>
            ))}
            <div style={{ padding:12, background:"rgba(244,114,182,0.05)", borderLeft:"3px solid #f472b6", borderRadius:8 }}>
              <p style={{ fontSize:11, fontWeight:800, color:"#f472b6", margin:"0 0 6px", letterSpacing:"0.05em" }}>ICD-10 Codes Suggested</p>
              {GENERATED_NOTE.ICD.map(c => <p key={c} style={{ fontSize:11, color:"#f1f5f9", margin:"3px 0", fontFamily:"monospace" }}>• {c}</p>)}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
