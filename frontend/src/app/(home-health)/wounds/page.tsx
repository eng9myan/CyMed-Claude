"use client";

import { useState } from "react";
import { Camera, TrendingDown, TrendingUp, Minus, Plus, ChevronLeft, ChevronRight, Activity } from "lucide-react";

type WoundCase = {
  id: string; patient: string; mrn: string; location: string; type: string;
  onset: string; weeks: number;
  photos: { date: string; area: number; healingScore: number }[];
};

const CASES: WoundCase[] = [
  { id:"W001", patient:"Fatima Al-Zahra", mrn:"MRN-10485", location:"Right plantar foot", type:"Diabetic foot ulcer",
    onset:"2026-04-22", weeks:7,
    photos:[
      { date:"2026-04-22", area:8.4, healingScore:25 },
      { date:"2026-04-29", area:7.6, healingScore:35 },
      { date:"2026-05-06", area:6.8, healingScore:48 },
      { date:"2026-05-13", area:5.4, healingScore:58 },
      { date:"2026-05-20", area:4.2, healingScore:67 },
      { date:"2026-05-27", area:3.5, healingScore:74 },
      { date:"2026-06-03", area:2.8, healingScore:82 },
      { date:"2026-06-10", area:2.1, healingScore:88 },
    ] },
  { id:"W002", patient:"Ahmad Al-Rashid", mrn:"MRN-10492", location:"Sacrum",  type:"Pressure injury Stage 2",
    onset:"2026-05-15", weeks:4,
    photos:[
      { date:"2026-05-15", area:5.0, healingScore:30 },
      { date:"2026-05-22", area:4.2, healingScore:45 },
      { date:"2026-05-29", area:3.1, healingScore:62 },
      { date:"2026-06-05", area:2.4, healingScore:75 },
      { date:"2026-06-12", area:1.6, healingScore:85 },
    ] },
];

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function WoundPhotosPage() {
  const [active, setActive] = useState<WoundCase>(CASES[0]);
  const [photoIdx, setPhotoIdx] = useState(active.photos.length - 1);

  const photo = active.photos[photoIdx];
  const prev = photoIdx > 0 ? active.photos[photoIdx - 1] : null;
  const first = active.photos[0];
  const areaChange = prev ? photo.area - prev.area : 0;
  const totalChange = ((photo.area - first.area) / first.area) * 100;

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Wound Photo Progression</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Mobile capture · AI-assisted measurement · Side-by-side comparison · Healing trajectory · Shared with hospital wound team</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Camera style={{ width:14, height:14 }} />Capture New Photo</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {CASES.map(c => {
            const isA = active.id === c.id;
            const latest = c.photos[c.photos.length-1];
            const f = c.photos[0];
            const change = ((latest.area - f.area) / f.area * 100).toFixed(0);
            return (
              <Card key={c.id} style={{ padding:14, cursor:"pointer", border:`1px solid ${isA?"rgba(230,126,34,0.3)":"rgba(255,255,255,0.07)"}`, background:isA?"rgba(230,126,34,0.07)":"rgba(255,255,255,0.03)" }} onClick={()=>{setActive(c);setPhotoIdx(c.photos.length-1);}}>
                <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:0 }}>{c.patient}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{c.location} · {c.type}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"4px 0 0" }}>{c.photos.length} photos · {c.weeks} weeks</p>
                <div style={{ marginTop:6, display:"flex", alignItems:"center", gap:5 }}>
                  <TrendingDown style={{ width:11, height:11, color:"#4ade80" }} />
                  <span style={{ fontSize:11, color:"#4ade80", fontWeight:700 }}>{change}% area</span>
                </div>
              </Card>
            );
          })}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Side-by-side comparison */}
          <Card style={{ padding:0, overflow:"hidden" }}>
            <div style={{ padding:"14px 22px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <h2 style={{ fontSize:15, fontWeight:800, color:"#f1f5f9", margin:0 }}>{active.patient} — {active.location}</h2>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"3px 0 0" }}>{active.type} · Onset {active.onset} · {active.weeks} weeks</p>
            </div>
            <div style={{ padding:22, display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>Baseline ({first.date})</p>
                <div style={{ aspectRatio:"1", background:"linear-gradient(135deg, rgba(248,113,113,0.1), rgba(251,146,60,0.05))", border:"1px dashed rgba(248,113,113,0.2)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
                  <Camera style={{ width:32, height:32, color:"rgba(248,113,113,0.4)" }} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:8, padding:"6px 10px", textAlign:"center" }}>
                    <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>Area</p>
                    <p style={{ fontSize:14, color:"#f87171", margin:"2px 0 0", fontWeight:800 }}>{first.area} cm²</p>
                  </div>
                  <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:8, padding:"6px 10px", textAlign:"center" }}>
                    <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>Heal Score</p>
                    <p style={{ fontSize:14, color:"#f87171", margin:"2px 0 0", fontWeight:800 }}>{first.healingScore}%</p>
                  </div>
                </div>
              </div>
              <div>
                <p style={{ fontSize:10, color:"rgba(74,222,128,0.7)", margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>Latest ({photo.date})</p>
                <div style={{ aspectRatio:"1", background:"linear-gradient(135deg, rgba(74,222,128,0.1), rgba(34,211,238,0.05))", border:"1px dashed rgba(74,222,128,0.25)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10, position:"relative" }}>
                  <Camera style={{ width:32, height:32, color:"rgba(74,222,128,0.4)" }} />
                  <div style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.6)", borderRadius:6, padding:"3px 8px" }}>
                    <p style={{ fontSize:9, color:"#4ade80", margin:0, fontFamily:"monospace", fontWeight:700 }}>AI: {photo.area} cm²</p>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:8, padding:"6px 10px", textAlign:"center" }}>
                    <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>Area</p>
                    <p style={{ fontSize:14, color:"#4ade80", margin:"2px 0 0", fontWeight:800 }}>{photo.area} cm²</p>
                  </div>
                  <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:8, padding:"6px 10px", textAlign:"center" }}>
                    <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>Heal Score</p>
                    <p style={{ fontSize:14, color:"#4ade80", margin:"2px 0 0", fontWeight:800 }}>{photo.healingScore}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding:"14px 22px", borderTop:"1px solid rgba(255,255,255,0.06)", background:"rgba(74,222,128,0.04)", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
              <TrendingDown style={{ width:18, height:18, color:"#4ade80" }} />
              <span style={{ fontSize:14, fontWeight:700, color:"#4ade80" }}>Healing: {totalChange.toFixed(0)}% area reduction since baseline</span>
            </div>
          </Card>

          {/* Photo timeline */}
          <Card style={{ padding:18 }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 12px" }}>Photo Timeline</h3>
            <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:6 }}>
              {active.photos.map((p,i) => (
                <div key={p.date} onClick={()=>setPhotoIdx(i)} style={{ flex:"0 0 auto", width:90, cursor:"pointer" }}>
                  <div style={{ aspectRatio:"1", background:`linear-gradient(135deg, ${p.healingScore>70?"rgba(74,222,128,0.15)":p.healingScore>50?"rgba(251,191,36,0.15)":"rgba(248,113,113,0.15)"}, rgba(255,255,255,0.02))`, border:`2px solid ${photoIdx===i?"#e67e22":"transparent"}`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Camera style={{ width:20, height:20, color: p.healingScore>70?"#4ade80":p.healingScore>50?"#fbbf24":"#f87171" }} />
                  </div>
                  <p style={{ fontSize:9, color:"rgba(255,255,255,0.5)", margin:"5px 0 0", textAlign:"center" }}>{p.date.slice(5)}</p>
                  <p style={{ fontSize:9, color:"#e67e22", margin:0, textAlign:"center", fontWeight:700 }}>{p.area} cm²</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
