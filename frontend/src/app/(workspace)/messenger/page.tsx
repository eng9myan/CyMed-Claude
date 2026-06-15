"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare, Send, Search, Paperclip, Phone, Video,
  Users, Lock, AlertTriangle, CheckCheck, Check,
  Bell, BellOff, Pin, Star, Hash, AtSign, ChevronDown,
} from "lucide-react";

type MessageStatus = "sending" | "sent" | "delivered" | "read";
type ChannelType = "direct" | "group" | "department";

type Channel = {
  id: string; name: string; type: ChannelType; unread: number;
  lastMsg: string; lastTime: string; pinned?: boolean; muted?: boolean;
  members?: number; avatar?: string; urgent?: boolean;
};

type Msg = {
  id: string; sender: string; role: string; text: string; time: string;
  status: MessageStatus; mine: boolean; urgent?: boolean;
  attachment?: { name: string; size: string; type: string };
  replyTo?: string;
};

const CHANNELS: Channel[] = [
  { id:"ch1", name:"ICU Ward â€” Night",        type:"group",      unread:3, lastMsg:"Vitals stable on Bed 4", lastTime:"14:41", pinned:true, urgent:true, members:8 },
  { id:"ch2", name:"Dr. Al-Ghamdi",           type:"direct",     unread:1, lastMsg:"Can you review the echo?",lastTime:"14:38" },
  { id:"ch3", name:"Emergency Team",          type:"department", unread:7, lastMsg:"Incoming STEMI ETA 12 min",lastTime:"14:35", urgent:true, members:15 },
  { id:"ch4", name:"Pharmacy â€” Inpatient",    type:"department", unread:0, lastMsg:"Warfarin hold confirmed",  lastTime:"13:50", members:6 },
  { id:"ch5", name:"Sr. Nurse Layla",         type:"direct",     unread:0, lastMsg:"Handover done âœ“",          lastTime:"13:20" },
  { id:"ch6", name:"Radiology Reads",         type:"department", unread:2, lastMsg:"STAT CT head ready",       lastTime:"12:55", members:5 },
  { id:"ch7", name:"OR Team â€” Theatre 2",     type:"group",      unread:0, lastMsg:"Patient prepped",          lastTime:"11:30", pinned:true, members:7 },
  { id:"ch8", name:"Dr. Al-Mutawa",           type:"direct",     unread:0, lastMsg:"Labs reviewed, proceed",   lastTime:"10:15" },
  { id:"ch9", name:"Blood Bank",              type:"department", unread:0, lastMsg:"2 units FFP ready",        lastTime:"09:40", members:4 },
];

const MESSAGES: Record<string, Msg[]> = {
  ch1: [
    { id:"m1", sender:"Sr. Nurse Layla", role:"RN", text:"Good evening team. Shift handover for ICU.\nBed 1: Mr. Al-Rashid â€” post CABG Day 2, vitals stable, weaning vent tomorrow.\nBed 2: Mrs. Al-Zahra â€” sepsis protocol, improving. WBC down.", time:"20:02", status:"read", mine:false },
    { id:"m2", sender:"Dr. Al-Harbi", role:"Intensivist", text:"Thanks Layla. Any concerns on Bed 4?", time:"20:05", status:"read", mine:false },
    { id:"m3", sender:"Me", role:"Attending", text:"Bed 4 MAP dropping earlier, I've already adjusted norad to 0.15. Watching closely.", time:"20:06", status:"read", mine:true },
    { id:"m4", sender:"Sr. Nurse Layla", role:"RN", text:"Vitals stable on Bed 4 â€” MAP 72 now âœ“", time:"20:12", status:"read", mine:false },
    { id:"m5", sender:"Dr. Al-Harbi", role:"Intensivist", text:"Good. Check K+ on next ABG â€” was borderline 3.3 earlier.", time:"20:14", status:"delivered", mine:false, urgent:true },
    { id:"m6", sender:"Me", role:"Attending", text:"On it â€” will order ABG now and supplement if <3.5.", time:"20:15", status:"read", mine:true },
  ],
  ch3: [
    { id:"m1", sender:"Dr. Al-Ghamdi", role:"Cardiologist", text:"âš  STEMI incoming. Male, 52y, anterior STEMI, BP 90/60, ETA 12 minutes.", time:"14:31", status:"read", mine:false, urgent:true },
    { id:"m2", sender:"Cath Lab Nurse", role:"RN", text:"Cath lab activated. Team alerted, table ready.", time:"14:32", status:"read", mine:false },
    { id:"m3", sender:"Pharmacist Sami", role:"Pharmacist", text:"Aspirin 300mg + Ticagrelor 180mg loaded and ready.", time:"14:33", status:"read", mine:false },
    { id:"m4", sender:"Me", role:"Attending", text:"Copy all. I'm on my way to the ED entrance now.", time:"14:34", status:"delivered", mine:true },
    { id:"m5", sender:"Dr. Al-Ghamdi", role:"Cardiologist", text:"Incoming STEMI ETA 12 min", time:"14:35", status:"delivered", mine:false },
  ],
};

const ROLE_COLORS: Record<string, string> = {
  "Intensivist":"#f472b6","Cardiologist":"#a78bfa","Attending":"#22d3ee",
  "RN":"#4ade80","Pharmacist":"#fbbf24","Cath Lab Nurse":"#4ade80",
};

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

export default function MessengerPage() {
  const [activeChannel, setActiveChannel] = useState<Channel>(CHANNELS[0]);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(MESSAGES);
  const [isUrgent, setIsUrgent] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const msgs = messages[activeChannel.id] ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [activeChannel, msgs.length]);

  function sendMessage() {
    if (!input.trim()) return;
    const newMsg: Msg = {
      id: `m${Date.now()}`, sender:"Me", role:"Attending",
      text: input.trim(), time: new Date().toLocaleTimeString("en-SA",{hour:"2-digit",minute:"2-digit"}),
      status:"sending", mine:true, urgent:isUrgent,
    };
    setMessages(prev => ({ ...prev, [activeChannel.id]: [...(prev[activeChannel.id] ?? []), newMsg] }));
    setInput("");
    setIsUrgent(false);
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [activeChannel.id]: prev[activeChannel.id].map(m => m.id === newMsg.id ? { ...m, status:"delivered" } : m),
      }));
    }, 800);
  }

  const filteredChannels = CHANNELS.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding:0, height:"100vh", background:"#080d18", display:"flex" }}>
      {/* Sidebar */}
      <div style={{ width:280, borderRight:"1px solid rgba(255,255,255,0.07)", display:"flex", flexDirection:"column", flexShrink:0 }}>
        {/* Header */}
        <div style={{ padding:"18px 16px 12px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <h2 style={{ fontSize:16, fontWeight:800, color:"#f1f5f9", margin:"0 0 12px", display:"flex", alignItems:"center", gap:8 }}>
            <Lock style={{ width:14, height:14, color:"#4ade80" }} />
            CyMed Secure Chat
          </h2>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"0 12px" }}>
            <Search style={{ width:13, height:13, color:"rgba(255,255,255,0.3)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search channels..." style={{ flex:1, background:"none", border:"none", color:"#f1f5f9", fontSize:12, outline:"none", padding:"9px 0" }} />
          </div>
        </div>

        {/* Channel list */}
        <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
          {/* Pinned */}
          {filteredChannels.filter(c => c.pinned).length > 0 && (
            <div style={{ padding:"6px 16px 4px", fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.08em" }}>
              <Pin style={{ width:9, height:9, display:"inline", marginRight:4 }} />Pinned
            </div>
          )}
          {filteredChannels.filter(c => c.pinned).map(ch => <ChannelRow key={ch.id} ch={ch} active={activeChannel.id === ch.id} onClick={() => setActiveChannel(ch)} />)}

          {/* All channels */}
          <div style={{ padding:"10px 16px 4px", fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.08em" }}>
            All Channels
          </div>
          {filteredChannels.filter(c => !c.pinned).map(ch => <ChannelRow key={ch.id} ch={ch} active={activeChannel.id === ch.id} onClick={() => setActiveChannel(ch)} />)}
        </div>

        {/* User status */}
        <div style={{ padding:"12px 16px", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(34,211,238,0.2)", border:"2px solid #22d3ee", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#22d3ee", flexShrink:0 }}>Me</div>
          <div>
            <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:0 }}>Dr. [You]</p>
            <p style={{ fontSize:10, color:"#4ade80", margin:0 }}>â— Online Â· HIPAA-secured</p>
          </div>
        </div>
      </div>

      {/* Main chat */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        {/* Chat header */}
        <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background: activeChannel.urgent?"rgba(248,113,113,0.15)":"rgba(255,255,255,0.06)", border:`1px solid ${activeChannel.urgent?"rgba(248,113,113,0.3)":"rgba(255,255,255,0.1)"}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {activeChannel.type === "department" ? <Hash style={{ width:16, height:16, color: activeChannel.urgent?"#f87171":"rgba(255,255,255,0.5)" }} />
                : activeChannel.type === "group" ? <Users style={{ width:16, height:16, color: activeChannel.urgent?"#f87171":"rgba(255,255,255,0.5)" }} />
                : <AtSign style={{ width:16, height:16, color:"rgba(255,255,255,0.5)" }} />}
            </div>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:6 }}>
                {activeChannel.name}
                {activeChannel.urgent && <span style={{ fontSize:9, background:"rgba(248,113,113,0.2)", color:"#f87171", borderRadius:4, padding:"1px 6px", fontWeight:700 }}>URGENT</span>}
              </p>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:0 }}>
                {activeChannel.type === "direct" ? "Direct Message" : `${activeChannel.members} members Â· ${activeChannel.type}`}
              </p>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {[Phone, Video, Search].map((Icon, i) => (
              <button key={i} style={{ width:34, height:34, borderRadius:10, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <Icon style={{ width:15, height:15, color:"rgba(255,255,255,0.4)" }} />
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 20px", display:"flex", flexDirection:"column", gap:4 }}>
          {msgs.map((msg, idx) => {
            const prevMsg = idx > 0 ? msgs[idx-1] : null;
            const showSender = !msg.mine && (!prevMsg || prevMsg.sender !== msg.sender || prevMsg.mine);
            return (
              <div key={msg.id} style={{ display:"flex", flexDirection:"column", alignItems: msg.mine ? "flex-end":"flex-start", gap:2, marginTop: showSender ? 12 : 2 }}>
                {showSender && (
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                    <div style={{ width:26, height:26, borderRadius:"50%", background:`${ROLE_COLORS[msg.role]??"#888"}20`, border:`1px solid ${ROLE_COLORS[msg.role]??"#888"}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:ROLE_COLORS[msg.role]??"#888" }}>
                      {msg.sender.split(" ").map(w=>w[0]).join("").slice(0,2)}
                    </div>
                    <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.7)" }}>{msg.sender}</span>
                    <span style={{ fontSize:10, background:`${ROLE_COLORS[msg.role]??"#888"}20`, color:ROLE_COLORS[msg.role]??"#888", borderRadius:4, padding:"1px 6px", fontWeight:600 }}>{msg.role}</span>
                  </div>
                )}
                <div style={{ maxWidth:"72%", padding:"10px 14px", borderRadius: msg.mine ? "16px 16px 4px 16px":"16px 16px 16px 4px",
                  background: msg.urgent ? "rgba(248,113,113,0.12)" : msg.mine ? "rgba(230,126,34,0.15)" : "rgba(255,255,255,0.05)",
                  border:`1px solid ${msg.urgent ? "rgba(248,113,113,0.3)" : msg.mine ? "rgba(230,126,34,0.3)" : "rgba(255,255,255,0.08)"}`,
                }}>
                  {msg.urgent && (
                    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
                      <AlertTriangle style={{ width:11, height:11, color:"#f87171" }} />
                      <span style={{ fontSize:10, fontWeight:700, color:"#f87171", textTransform:"uppercase", letterSpacing:"0.05em" }}>Urgent</span>
                    </div>
                  )}
                  <p style={{ fontSize:13, color: msg.mine?"#fde8d0":"#e2e8f0", margin:0, lineHeight:1.55, whiteSpace:"pre-wrap" }}>{msg.text}</p>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:4, marginTop:4 }}>
                    <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{msg.time}</span>
                    {msg.mine && (
                      msg.status === "read" ? <CheckCheck style={{ width:12, height:12, color:"#22d3ee" }} />
                        : msg.status === "delivered" ? <CheckCheck style={{ width:12, height:12, color:"rgba(255,255,255,0.35)" }} />
                        : <Check style={{ width:12, height:12, color:"rgba(255,255,255,0.25)" }} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div style={{ padding:"12px 20px", borderTop:"1px solid rgba(255,255,255,0.07)", flexShrink:0 }}>
          {isUrgent && (
            <div style={{ marginBottom:8, display:"flex", alignItems:"center", gap:6, background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.25)", borderRadius:8, padding:"5px 12px" }}>
              <AlertTriangle style={{ width:12, height:12, color:"#f87171" }} />
              <span style={{ fontSize:11, color:"#f87171", fontWeight:600 }}>Urgent message â€” recipients will be notified with priority alert</span>
              <button onClick={() => setIsUrgent(false)} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.3)", fontSize:14 }}>Ã—</button>
            </div>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={() => setIsUrgent(!isUrgent)}
              style={{ width:36, height:36, borderRadius:10, flexShrink:0, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                background: isUrgent?"rgba(248,113,113,0.2)":"rgba(255,255,255,0.04)", border:`1px solid ${isUrgent?"rgba(248,113,113,0.4)":"rgba(255,255,255,0.08)"}` }}>
              <AlertTriangle style={{ width:15, height:15, color: isUrgent?"#f87171":"rgba(255,255,255,0.35)" }} />
            </button>
            <button style={{ width:36, height:36, borderRadius:10, flexShrink:0, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
              background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
              <Paperclip style={{ width:15, height:15, color:"rgba(255,255,255,0.35)" }} />
            </button>
            <div style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"0 14px", display:"flex", alignItems:"center" }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder={`Message ${activeChannel.name}â€¦`}
                style={{ flex:1, background:"none", border:"none", color:"#f1f5f9", fontSize:13, outline:"none", padding:"10px 0" }}
              />
            </div>
            <button onClick={sendMessage} disabled={!input.trim()}
              style={{ width:36, height:36, borderRadius:10, flexShrink:0, cursor: input.trim()?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center",
                background: input.trim()?"#e67e22":"rgba(255,255,255,0.04)", border:`1px solid ${input.trim()?"transparent":"rgba(255,255,255,0.08)"}` }}>
              <Send style={{ width:15, height:15, color: input.trim()?"white":"rgba(255,255,255,0.25)" }} />
            </button>
          </div>
          <p style={{ fontSize:10, color:"rgba(255,255,255,0.2)", margin:"6px 0 0", textAlign:"center" }}>
            ðŸ”’ HIPAA-compliant end-to-end encrypted Â· 7-year message retention
          </p>
        </div>
      </div>
    </div>
  );
}

function ChannelRow({ ch, active, onClick }: { ch: Channel; active: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 16px", cursor:"pointer", transition:"all 0.1s",
      background: active?"rgba(230,126,34,0.12)":"transparent" }}>
      <div style={{ width:36, height:36, borderRadius:10, background: ch.urgent?"rgba(248,113,113,0.15)":active?"rgba(230,126,34,0.2)":"rgba(255,255,255,0.06)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
        {ch.type === "department" ? <Hash style={{ width:14, height:14, color: ch.urgent?"#f87171":active?"#e67e22":"rgba(255,255,255,0.4)" }} />
          : ch.type === "group" ? <Users style={{ width:14, height:14, color: ch.urgent?"#f87171":active?"#e67e22":"rgba(255,255,255,0.4)" }} />
          : <AtSign style={{ width:14, height:14, color: active?"#e67e22":"rgba(255,255,255,0.4)" }} />}
        {ch.unread > 0 && (
          <span style={{ position:"absolute", top:-3, right:-3, width:16, height:16, borderRadius:"50%", background: ch.urgent?"#f87171":"#e67e22", fontSize:9, fontWeight:700, color:"white", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {ch.unread}
          </span>
        )}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:12, fontWeight: ch.unread>0?700:500, color: active?"#f1f5f9":"rgba(255,255,255,0.65)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ch.name}</p>
        <p style={{ fontSize:10, color:"rgba(255,255,255,0.28)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ch.lastMsg}</p>
      </div>
      <span style={{ fontSize:9, color:"rgba(255,255,255,0.25)", flexShrink:0 }}>{ch.lastTime}</span>
    </div>
  );
}


