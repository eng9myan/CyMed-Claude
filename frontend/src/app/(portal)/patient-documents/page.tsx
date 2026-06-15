"use client";

import { useState } from "react";
import { FileDown, FileText, FileJson, Shield, CheckCircle2, Calendar, Stethoscope, Lock } from "lucide-react";

type DocType = "ccda" | "fhir" | "pdf" | "avs" | "vaccination" | "lab" | "imaging";

type Doc = {
  id: string; type: DocType; title: string; date: string; size: string; description: string;
};

const DOCS: Doc[] = [
  { id:"D1", type:"ccda", title:"Continuity of Care Document (CCDA)", date:"2026-06-13", size:"248 KB", description:"Full XML clinical summary — interoperable with any HIPAA-compliant system" },
  { id:"D2", type:"fhir", title:"FHIR R4 Patient Bundle", date:"2026-06-13", size:"412 KB", description:"FHIR R4 JSON bundle — Patient, Encounters, Observations, Conditions, MedicationStatements" },
  { id:"D3", type:"avs",  title:"After-Visit Summary — Dr. Al-Mutawa", date:"2026-06-10", size:"82 KB",  description:"Visit summary with diagnoses, meds, follow-up instructions" },
  { id:"D4", type:"pdf",  title:"Complete Health Record PDF", date:"2026-06-13", size:"4.2 MB", description:"Full lifetime medical record — printable" },
  { id:"D5", type:"vaccination", title:"Vaccination Certificate", date:"2026-06-13", size:"38 KB", description:"WHO-compliant immunization record with QR code" },
  { id:"D6", type:"lab",  title:"Lab Results — Q2 2026", date:"2026-06-11", size:"156 KB", description:"All laboratory results from April-June 2026" },
  { id:"D7", type:"imaging", title:"Radiology Reports Bundle", date:"2026-06-08", size:"892 KB", description:"All radiology reports and DICOM viewer access codes" },
];

const TYPE_META: Record<DocType,{c:string;icon:React.ReactNode;label:string}> = {
  ccda:{c:"#22d3ee",icon:<FileText style={{ width:14, height:14 }} />,label:"CCDA XML"},
  fhir:{c:"#a78bfa",icon:<FileJson style={{ width:14, height:14 }} />,label:"FHIR R4 JSON"},
  pdf:{c:"#f87171",icon:<FileText style={{ width:14, height:14 }} />,label:"PDF"},
  avs:{c:"#4ade80",icon:<FileText style={{ width:14, height:14 }} />,label:"After-Visit"},
  vaccination:{c:"#fbbf24",icon:<Shield style={{ width:14, height:14 }} />,label:"Vaccination"},
  lab:{c:"#22d3ee",icon:<FileText style={{ width:14, height:14 }} />,label:"Lab Results"},
  imaging:{c:"#f472b6",icon:<FileText style={{ width:14, height:14 }} />,label:"Imaging"},
};

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function DocumentsPage() {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>My Health Documents</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Download CCDA · FHIR R4 JSON · PDF · OpenNotes · Vaccination certificates · Share with other providers</p>
        </div>
        <button onClick={()=>setShareOpen(true)} style={{ display:"flex", alignItems:"center", gap:7, background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}><Lock style={{ width:14, height:14 }} />Share Securely</button>
      </div>

      <Card style={{ padding:18, marginBottom:14, background:"linear-gradient(135deg, rgba(34,211,238,0.08), rgba(167,139,250,0.05))" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Shield style={{ width:24, height:24, color:"#22d3ee" }} />
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>Your records are portable</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:"2px 0 0" }}>CyMed exports your data in international standards — CCDA, FHIR R4, HL7 — so you can take it to any provider.</p>
          </div>
        </div>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:12 }}>
        {DOCS.map(d => {
          const m = TYPE_META[d.type];
          return (
            <Card key={d.id} style={{ padding:18 }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                <div style={{ width:42, height:42, borderRadius:12, background:`${m.c}15`, border:`1px solid ${m.c}30`, color:m.c, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{m.icon}</div>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:9, background:`${m.c}18`, color:m.c, borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{m.label}</span>
                  <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"6px 0 4px" }}>{d.title}</p>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.45)", margin:"0 0 10px", lineHeight:1.5 }}>{d.description}</p>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{d.date} · {d.size}</span>
                    <button style={{ display:"flex", alignItems:"center", gap:5, background:`${m.c}15`, border:`1px solid ${m.c}30`, color:m.c, borderRadius:8, padding:"5px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                      <FileDown style={{ width:11, height:11 }} />Download
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
