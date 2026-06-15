"use client";

import { useState } from "react";
import { Sparkles, Send, X, Brain, MessageSquare } from "lucide-react";

const SUGGESTIONS = [
  "Why is AP for GE Healthcare overdue?",
  "Summarise this customer's AR aging",
  "Forecast Q3 payroll vs budget",
  "Which SKUs expire in next 30 days?",
  "Top 3 vendors by spend this quarter",
  "Generate JCI inspection prep checklist",
];

const SAMPLE_RESPONSE = `Looking at GE Healthcare's account, the SAR 284K bill (AP-2026-1843) is currently 17 days overdue:

• Bill received: 2026-05-27
• Net 30 terms — was due 2026-06-26
• 3-way match failed: GRN missing for 4 line items (CT scanner consumables)

**Recommendation**: Ping Warehouse Manager to complete GRN, then auto-release for payment. I can draft the email if you'd like.

Related risk: This is the 3rd overdue GE bill in 60 days. Worth a vendor relationship review.`;

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");

  function send(text?: string) {
    const msg = text ?? input;
    if (!msg.trim()) return;
    const userMsg = { role: "user" as const, text: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "ai", text: SAMPLE_RESPONSE }]);
    }, 600);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ position:"fixed", bottom:24, right:24, width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg, #a855f7, #7e22ce)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(168,85,247,0.5)", zIndex:100 }}
        aria-label="Open AI Assistant"
      >
        <Sparkles style={{ width:22, height:22, color:"white" }} />
      </button>

      {open && (
        <div style={{ position:"fixed", bottom:90, right:24, width:420, height:600, background:"#0c111c", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, display:"flex", flexDirection:"column", zIndex:9998, overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.6)" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:10, background:"linear-gradient(135deg, #a855f7, #7e22ce)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Brain style={{ width:16, height:16, color:"white" }} />
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>CyMed AI Copilot</p>
              <p style={{ fontSize:10, color:"rgba(168,85,247,0.8)", margin:0 }}>● Connected to your data · Claude</p>
            </div>
            <button onClick={() => setOpen(false)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer" }}>
              <X style={{ width:16, height:16 }} />
            </button>
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:10 }}>
            {messages.length === 0 ? (
              <>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", margin:"0 0 12px" }}>I can read your live ERP data. Ask me anything:</p>
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{ textAlign:"left", padding:"10px 14px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, color:"#f1f5f9", fontSize:12, cursor:"pointer" }}
                  >
                    <Sparkles style={{ width:10, height:10, color:"#a855f7", display:"inline", marginRight:6, verticalAlign:"-1px" }} />
                    {s}
                  </button>
                ))}
              </>
            ) : (
              messages.map((m, i) => (
                <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth:"85%" }}>
                  <div style={{ padding:"10px 14px", borderRadius:12, background: m.role === "user" ? "rgba(230,126,34,0.15)" : "rgba(168,85,247,0.08)", border: m.role === "user" ? "1px solid rgba(230,126,34,0.3)" : "1px solid rgba(168,85,247,0.2)", fontSize:12, color:"#f1f5f9", lineHeight:1.55, whiteSpace:"pre-wrap" }}>
                    {m.text}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ padding:14, borderTop:"1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display:"flex", gap:8, alignItems:"center", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"0 12px" }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), send())}
                placeholder="Ask about anything in your ERP..."
                style={{ flex:1, background:"none", border:"none", color:"#f1f5f9", fontSize:12, outline:"none", padding:"10px 0" }}
              />
              <button onClick={() => send()} disabled={!input.trim()} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}>
                <Send style={{ width:14, height:14, color:input.trim() ? "#a855f7" : "rgba(255,255,255,0.2)" }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
