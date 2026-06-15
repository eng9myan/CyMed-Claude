"use client";
import { useState, useRef, useEffect } from "react";
import { Hash, Users, AtSign, Send, Paperclip, Smile, Search, Plus, Pin, Bell, BellOff, Phone, Video, ThumbsUp, MessageSquare } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

type ChannelType = "public"|"private"|"dm";
type Channel = { id:string; name:string; type:ChannelType; unread:number; pinned?:boolean; members?:number; muted?:boolean; lastMsg:string; lastTime:string };
type Msg = { id:string; sender:string; role:string; text:string; time:string; mine:boolean; reactions?:{ emoji:string; count:number }[]; replies?:number; pinned?:boolean };

const CHANNELS: Channel[] = [
  { id:"c1", name:"general",          type:"public",  unread:0, pinned:true, members:1240, lastMsg:"Welcome to CyMed!", lastTime:"08:00" },
  { id:"c2", name:"announcements",    type:"public",  unread:3, pinned:true, members:1240, lastMsg:"Q3 all-hands scheduled", lastTime:"14:42" },
  { id:"c3", name:"finance-team",     type:"private", unread:5, members:24,  lastMsg:"Q2 close is on track", lastTime:"14:38" },
  { id:"c4", name:"clinical-protocols",type:"public", unread:0, members:380, lastMsg:"New sepsis bundle v4", lastTime:"13:14" },
  { id:"c5", name:"icu-ward",          type:"public",  unread:8, members:42,  lastMsg:"⚠ Bed 4 critical", lastTime:"14:50" },
  { id:"c6", name:"hr-announcements", type:"public",   unread:1, members:1240,lastMsg:"Hajj leave window opened", lastTime:"11:30" },
  { id:"dm1",name:"Dr. Al-Mutawa",     type:"dm",      unread:2, lastMsg:"Can you look at Bed 4?", lastTime:"14:48" },
  { id:"dm2",name:"CFO Hassan",        type:"dm",      unread:0, lastMsg:"Need your sign-off on AP run", lastTime:"13:00" },
  { id:"dm3",name:"Pharm. Sami",       type:"dm",      unread:0, lastMsg:"Inventory levels look good", lastTime:"11:22" },
];

const MESSAGES: Record<string, Msg[]> = {
  c5: [
    { id:"m1", sender:"Sr. Nurse Layla", role:"RN — ICU", text:"Bed 4 MAP dropping, currently 58/32. Started norad 0.1mcg/kg/min", time:"14:46", mine:false, reactions:[{emoji:"👀",count:3}] },
    { id:"m2", sender:"Dr. Al-Mutawa", role:"Attending", text:"On my way. Did we send a fresh ABG?", time:"14:47", mine:false },
    { id:"m3", sender:"Me", role:"Attending", text:"Yes — drawn at 14:42. Should be back in <10 min", time:"14:48", mine:true, reactions:[{emoji:"✅",count:2}] },
    { id:"m4", sender:"Dr. Al-Mutawa", role:"Attending", text:"Good. Get echo ready too in case we need it.", time:"14:49", mine:false, replies:2 },
    { id:"m5", sender:"Sr. Nurse Layla", role:"RN — ICU", text:"@Echo team ready in 3 min", time:"14:50", mine:false },
  ],
  c2: [
    { id:"m1", sender:"CEO Office", role:"Comms", text:"Q3 all-hands scheduled for Sunday 14:00 at the main auditorium. Hybrid option available.", time:"14:42", mine:false, pinned:true, reactions:[{emoji:"👍",count:42},{emoji:"🎉",count:18}] },
  ],
};

const ROLE_C: Record<string,string> = { "Attending":"#22d3ee","Cardiologist":"#a78bfa","RN — ICU":"#4ade80","Comms":"#fbbf24" };

export default function DiscussPage() {
  const [active, setActive] = useState(CHANNELS[4]);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState(MESSAGES);
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [active, msgs]);

  const channelMsgs = msgs[active.id] ?? [];

  function send() {
    if (!input.trim()) return;
    const m: Msg = { id:`m${Date.now()}`, sender:"Me", role:"Attending", text:input, time:new Date().toLocaleTimeString("en-SA",{hour:"2-digit",minute:"2-digit"}), mine:true };
    setMsgs(prev => ({ ...prev, [active.id]: [...(prev[active.id]??[]), m] }));
    setInput("");
  }

  return (
    <div style={{ padding:0, height:"100vh", background:"#080d18", display:"flex" }}>
      <div style={{ width:280, borderRight:"1px solid rgba(255,255,255,0.07)", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"16px 16px 12px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <h2 style={{ fontSize:15, fontWeight:800, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:7 }}>
              <MessageSquare style={{ width:15, height:15, color:"#e67e22" }} /> Discuss
            </h2>
            <button style={{ background:"rgba(230,126,34,0.15)", border:"none", color:"#e67e22", borderRadius:6, width:24, height:24, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Plus style={{ width:13, height:13 }} /></button>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"0 10px" }}>
            <Search style={{ width:11, height:11, color:"rgba(255,255,255,0.3)" }} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search messages..." style={{ flex:1, background:"none", border:"none", color:"#f1f5f9", fontSize:11, outline:"none", padding:"7px 0" }} />
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"6px 0" }}>
          <div style={{ padding:"4px 16px", fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Channels</div>
          {CHANNELS.filter(c => c.type !== "dm" && (!search || c.name.includes(search.toLowerCase()))).map(c => (
            <div key={c.id} onClick={()=>setActive(c)} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 16px", cursor:"pointer", background: active.id===c.id?"rgba(230,126,34,0.12)":"transparent" }}>
              {c.pinned && <Pin style={{ width:9, height:9, color:"rgba(255,255,255,0.3)" }} />}
              <Hash style={{ width:13, height:13, color: c.type==="private" ? "#fbbf24" : "rgba(255,255,255,0.4)" }} />
              <span style={{ fontSize:12, fontWeight: c.unread>0?700:500, color: active.id===c.id?"#f1f5f9":"rgba(255,255,255,0.65)", flex:1 }}>{c.name}</span>
              {c.unread > 0 && <span style={{ fontSize:9, background:"#e67e22", color:"white", borderRadius:9, padding:"0 6px", fontWeight:800 }}>{c.unread}</span>}
            </div>
          ))}
          <div style={{ padding:"10px 16px 4px", fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Direct messages</div>
          {CHANNELS.filter(c => c.type === "dm" && (!search || c.name.toLowerCase().includes(search.toLowerCase()))).map(c => (
            <div key={c.id} onClick={()=>setActive(c)} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 16px", cursor:"pointer", background: active.id===c.id?"rgba(230,126,34,0.12)":"transparent" }}>
              <div style={{ width:9, height:9, borderRadius:"50%", background:"#4ade80" }} />
              <span style={{ fontSize:12, fontWeight: c.unread>0?700:500, color: active.id===c.id?"#f1f5f9":"rgba(255,255,255,0.65)", flex:1 }}>{c.name}</span>
              {c.unread > 0 && <span style={{ fontSize:9, background:"#e67e22", color:"white", borderRadius:9, padding:"0 6px", fontWeight:800 }}>{c.unread}</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <div style={{ padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {active.type === "dm" ? <AtSign style={{ width:16, height:16, color:"rgba(255,255,255,0.5)" }} /> : <Hash style={{ width:16, height:16, color:"rgba(255,255,255,0.5)" }} />}
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>{active.name}</p>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0 }}>
                {active.type === "dm" ? "Direct message" : `${active.members} members · ${active.type}`}
              </p>
            </div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {[Phone, Video, Bell].map((I,i) => (
              <button key={i} style={{ width:30, height:30, borderRadius:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.5)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <I style={{ width:13, height:13 }} />
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>
          {channelMsgs.length === 0 && <p style={{ fontSize:12, color:"rgba(255,255,255,0.3)", textAlign:"center", marginTop:40 }}>No messages yet — say hello.</p>}
          {channelMsgs.map((m, i) => {
            const prev = i > 0 ? channelMsgs[i-1] : null;
            const showSender = !prev || prev.sender !== m.sender || prev.mine !== m.mine;
            return (
              <div key={m.id} style={{ display:"flex", flexDirection:"column", alignItems: m.mine ? "flex-end" : "flex-start", marginTop: showSender ? 14 : 2 }}>
                {showSender && (
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                    <div style={{ width:24, height:24, borderRadius:"50%", background:`${ROLE_C[m.role]??"#888"}20`, border:`1px solid ${ROLE_C[m.role]??"#888"}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:ROLE_C[m.role]??"#888" }}>{m.sender.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
                    <span style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.7)" }}>{m.sender}</span>
                    <span style={{ fontSize:9, color:ROLE_C[m.role]??"#888", background:`${ROLE_C[m.role]??"#888"}15`, borderRadius:4, padding:"1px 6px", fontWeight:600 }}>{m.role}</span>
                  </div>
                )}
                <div style={{ maxWidth:"72%" }}>
                  <div style={{ padding:"8px 14px", borderRadius: m.mine ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.mine?"rgba(230,126,34,0.15)":"rgba(255,255,255,0.05)", border:`1px solid ${m.mine?"rgba(230,126,34,0.3)":"rgba(255,255,255,0.08)"}` }}>
                    {m.pinned && <p style={{ fontSize:9, color:"#fbbf24", margin:"0 0 4px", fontWeight:700 }}><Pin style={{ width:8, height:8, display:"inline", marginRight:3 }}/>Pinned</p>}
                    <p style={{ fontSize:12, color: m.mine?"#fde8d0":"#e2e8f0", margin:0, lineHeight:1.55 }}>{m.text}</p>
                    <div style={{ display:"flex", justifyContent:"flex-end", marginTop:2 }}>
                      <span style={{ fontSize:9, color:"rgba(255,255,255,0.3)" }}>{m.time}</span>
                    </div>
                  </div>
                  {m.reactions && (
                    <div style={{ display:"flex", gap:4, marginTop:4, justifyContent: m.mine?"flex-end":"flex-start" }}>
                      {m.reactions.map(r => (
                        <span key={r.emoji} style={{ fontSize:10, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"1px 8px", color:"rgba(255,255,255,0.6)", cursor:"pointer" }}>{r.emoji} {r.count}</span>
                      ))}
                    </div>
                  )}
                  {m.replies && <span style={{ fontSize:10, color:"#22d3ee", marginTop:4, display:"inline-block", cursor:"pointer" }}>↳ {m.replies} replies in thread</span>}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding:"12px 20px", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button style={{ width:32, height:32, borderRadius:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.4)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Paperclip style={{ width:14, height:14 }} /></button>
            <div style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"0 14px" }}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),send())} placeholder={`Message #${active.name}...`} style={{ width:"100%", background:"none", border:"none", color:"#f1f5f9", fontSize:13, outline:"none", padding:"10px 0" }} />
            </div>
            <button style={{ width:32, height:32, borderRadius:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.4)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Smile style={{ width:14, height:14 }} /></button>
            <button onClick={send} disabled={!input.trim()} style={{ width:32, height:32, borderRadius:8, background:input.trim()?"#e67e22":"rgba(255,255,255,0.04)", border:"none", color:input.trim()?"white":"rgba(255,255,255,0.25)", cursor: input.trim() ? "pointer" : "not-allowed", display:"flex", alignItems:"center", justifyContent:"center" }}><Send style={{ width:14, height:14 }} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
