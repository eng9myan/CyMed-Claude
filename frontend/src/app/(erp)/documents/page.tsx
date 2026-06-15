"use client";
import { useState } from "react";
import { Folder, File, FileText, Image, Download, Eye, Lock, Plus, Upload, Search } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const FOLDERS = [
  { name:"Contracts", count:284, c:"#22d3ee" },
  { name:"Vendor agreements", count:142, c:"#a78bfa" },
  { name:"Policies & procedures", count:88,  c:"#4ade80" },
  { name:"HR — employee files", count:4240, c:"#f472b6" },
  { name:"Quality & accreditation", count:62,c:"#fbbf24" },
  { name:"Insurance documents",   count:184, c:"#fb923c" },
];

const RECENT = [
  { name:"Bupa contract amendment 2026-Q2.pdf",    folder:"Contracts",        size:"482 KB", modified:"2026-06-13 10:14", uploader:"Legal",     version:"v3",  signed:true,  ocr:true },
  { name:"JCI inspection checklist.docx",         folder:"Quality",          size:"124 KB", modified:"2026-06-12 16:30", uploader:"Quality",   version:"v1",  signed:false, ocr:false },
  { name:"Vendor SLA — GE Healthcare.pdf",        folder:"Vendor agreements", size:"824 KB", modified:"2026-06-12 09:22", uploader:"Procurement",version:"v2", signed:true,  ocr:true },
  { name:"Employee handbook 2026.pdf",             folder:"Policies",          size:"1.2 MB", modified:"2026-06-08 14:00", uploader:"HR",        version:"v8",  signed:false, ocr:true },
  { name:"NPHIES integration agreement.pdf",       folder:"Insurance",         size:"680 KB", modified:"2026-06-05 11:30", uploader:"IT",        version:"v1",  signed:true,  ocr:true },
  { name:"OR-2 equipment maintenance log Q2.xlsx",folder:"Quality",          size:"245 KB", modified:"2026-06-04 17:42", uploader:"Biomed",    version:"v1",  signed:false, ocr:false },
];

export default function DocumentsPage() {
  const [search, setSearch] = useState("");

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Document Management</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Versioning · Full-text + OCR search · E-signature · Workflow · Retention · Audit trail</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.3)", color:"#a78bfa", borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><Upload style={{ width:13, height:13 }}/>Upload</button>
          <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>New folder</button>
        </div>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"0 14px", marginBottom:16 }}>
        <Search style={{ width:14, height:14, color:"rgba(255,255,255,0.3)" }} />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search documents by name or contents (OCR enabled)..." style={{ flex:1, background:"none", border:"none", color:"#f1f5f9", fontSize:13, outline:"none", padding:"11px 0" }} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:10, marginBottom:18 }}>
        {FOLDERS.map(f => (
          <Card key={f.name} style={{ padding:14, cursor:"pointer", borderLeft:`3px solid ${f.c}` }}>
            <Folder style={{ width:18, height:18, color:f.c, marginBottom:8 }} />
            <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>{f.name}</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"4px 0 0" }}>{f.count.toLocaleString()} files</p>
          </Card>
        ))}
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>Recent activity</h3>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {["Name","Folder","Version","Modified","Uploader","Size","Flags"].map(h => <th key={h} style={{ textAlign:"left", padding:"10px 14px" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {RECENT.map((r,i) => {
              const ext = r.name.split(".").pop();
              const isPdf = ext === "pdf";
              const isImg = ext === "jpg" || ext === "png";
              return (
                <tr key={i} style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"10px 14px", color:"#f1f5f9", display:"flex", alignItems:"center", gap:8 }}>
                    {isPdf ? <FileText style={{ width:14, height:14, color:"#f87171" }}/> : isImg ? <Image style={{ width:14, height:14, color:"#a78bfa" }}/> : <File style={{ width:14, height:14, color:"#22d3ee" }}/>}
                    {r.name}
                  </td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.5)" }}>{r.folder}</td>
                  <td style={{ padding:"10px 14px" }}><span style={{ fontSize:10, background:"rgba(167,139,250,0.12)", color:"#a78bfa", borderRadius:5, padding:"2px 7px", fontWeight:700, fontFamily:"monospace" }}>{r.version}</span></td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.5)" }}>{r.modified}</td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.5)" }}>{r.uploader}</td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.5)" }}>{r.size}</td>
                  <td style={{ padding:"10px 14px", display:"flex", gap:4 }}>
                    {r.signed && <span style={{ fontSize:9, background:"rgba(74,222,128,0.12)", color:"#4ade80", borderRadius:4, padding:"1px 6px", fontWeight:700 }}>SIGNED</span>}
                    {r.ocr && <span style={{ fontSize:9, background:"rgba(34,211,238,0.12)", color:"#22d3ee", borderRadius:4, padding:"1px 6px", fontWeight:700 }}>OCR</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
