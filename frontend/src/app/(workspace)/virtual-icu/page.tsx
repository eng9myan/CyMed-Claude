"use client";
import { Video, Heart, Activity, AlertTriangle, Eye, Mic } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const BEDS = [
  { bed:"ICU-1", patient:"Ahmad Al-Rashid", hr:84,  bp:"128/82", spo2:97, news2:2, vent:false, alert:false },
  { bed:"ICU-2", patient:"Fatima Al-Zahra", hr:112, bp:"105/68", spo2:91, news2:7, vent:true,  alert:true },
  { bed:"ICU-3", patient:"Sara Al-Ghamdi",  hr:88,  bp:"118/75", spo2:96, news2:4, vent:false, alert:false },
  { bed:"ICU-4", patient:"Khalid Al-Dosari",hr:142, bp:"88/52",  spo2:88, news2:9, vent:true,  alert:true },
  { bed:"ICU-5", patient:"Omar Al-Shehri",  hr:72,  bp:"132/84", spo2:98, news2:1, vent:false, alert:false },
  { bed:"ICU-6", patient:"Layla Al-Otaibi", hr:96,  bp:"122/78", spo2:95, news2:3, vent:false, alert:false },
];

export default function VirtualICUPage() {
  const alerts = BEDS.filter(b=>b.alert).length;

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:10 }}><Video style={{ width:24, height:24, color:"#f43f5e" }}/>Virtual ICU (Tele-ICU)</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>24/7 remote intensivist monitoring · Multi-bed centralized command · Real-time vitals streaming · Two-way video</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Card style={{ padding:"10px 16px" }}><p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0 }}>On Duty</p><p style={{ fontSize:14, color:"#22d3ee", margin:0, fontWeight:700 }}>Dr. Hassan + Nurse Layla</p></Card>
        </div>
      </div>

      {alerts > 0 && (
        <Card style={{ padding:14, marginBottom:14, background:"rgba(244,63,94,0.05)", border:"1px solid rgba(244,63,94,0.2)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <AlertTriangle style={{ width:18, height:18, color:"#f43f5e" }} />
            <p style={{ fontSize:13, fontWeight:700, color:"#f43f5e", margin:0 }}>⚠ {alerts} beds with high NEWS2 — bedside team alerted</p>
          </div>
        </Card>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        {BEDS.map(b => (
          <Card key={b.bed} style={{ padding:0, overflow:"hidden", border:b.alert?"1px solid rgba(244,63,94,0.3)":"1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ aspectRatio:"16/9", background:`linear-gradient(135deg, ${b.alert?"rgba(244,63,94,0.15)":"rgba(34,211,238,0.12)"}, rgba(255,255,255,0.02))`, position:"relative", display:"flex", alignItems:"center", justifyContent:"center", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <Video style={{ width:32, height:32, color:b.alert?"rgba(244,63,94,0.5)":"rgba(34,211,238,0.5)" }} />
              <div style={{ position:"absolute", top:8, left:8, background:"rgba(0,0,0,0.6)", borderRadius:5, padding:"3px 8px", display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#f43f5e", animation:"pulse 2s infinite" }}/>
                <span style={{ fontSize:9, color:"#fff", fontWeight:700 }}>LIVE</span>
              </div>
              <div style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.6)", borderRadius:5, padding:"3px 8px" }}>
                <span style={{ fontSize:10, color:"#fff", fontWeight:700 }}>{b.bed}</span>
              </div>
              {b.vent && <div style={{ position:"absolute", bottom:8, left:8, background:"rgba(167,139,250,0.3)", border:"1px solid rgba(167,139,250,0.5)", borderRadius:5, padding:"2px 7px" }}><span style={{ fontSize:9, color:"#fff", fontWeight:700 }}>VENT</span></div>}
            </div>
            <div style={{ padding:12 }}>
              <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:"0 0 8px" }}>{b.patient}</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
                {[
                  { l:"HR", v:b.hr, c: b.hr>120||b.hr<60 ? "#f87171":"#4ade80" },
                  { l:"BP", v:b.bp, c: parseInt(b.bp)<90 ? "#f87171":"#4ade80" },
                  { l:"SpO₂", v:`${b.spo2}%`, c: b.spo2<92 ? "#f87171":"#4ade80" },
                  { l:"NEWS2", v:b.news2, c: b.news2>=5 ? "#f87171":b.news2>=3 ? "#fbbf24":"#4ade80" },
                ].map(v => (
                  <div key={v.l} style={{ textAlign:"center" }}>
                    <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>{v.l}</p>
                    <p style={{ fontSize:13, color:v.c, margin:"2px 0 0", fontWeight:800 }}>{v.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
