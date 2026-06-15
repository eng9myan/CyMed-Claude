"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity, Brain, Stethoscope, Heart, FlaskConical, Radio,
  Pill, CreditCard, Shield, Users, Building2, BarChart3,
  Globe, Settings, X, Grip, Zap, Phone,
} from "lucide-react";

interface AppDef {
  id: string; label: string; label_ar: string;
  href: string; icon: React.ReactNode; color: string;
  roles: string[]; badge?: string;
}

const APPS: AppDef[] = [
  { id:"cmd",     label:"Command Center",    label_ar:"مركز القيادة",      href:"/command_center", icon:<Activity className="w-5 h-5"/>,    color:"#E67E22", roles:["admin","super_admin"] },
  { id:"exec",    label:"Executive Intel",   label_ar:"الذكاء التنفيذي",   href:"/executive",      icon:<Brain className="w-5 h-5"/>,       color:"#9B59B6", roles:["admin","super_admin"] },
  { id:"doctor",  label:"Doctor Workspace",  label_ar:"مساحة الطبيب",      href:"/doctor",         icon:<Stethoscope className="w-5 h-5"/>, color:"#5DADE2", roles:["doctor","admin"] },
  { id:"nurse",   label:"Nurse Station",     label_ar:"محطة التمريض",      href:"/nurse",          icon:<Heart className="w-5 h-5"/>,       color:"#E74C3C", roles:["nurse","doctor","admin"] },
  { id:"lab",     label:"Laboratory",        label_ar:"المختبر",            href:"/laboratory",     icon:<FlaskConical className="w-5 h-5"/>, color:"#2ECC71", roles:["lab_tech","doctor","admin"] },
  { id:"rad",     label:"Radiology",         label_ar:"الأشعة",             href:"/radiology",      icon:<Radio className="w-5 h-5"/>,       color:"#8E44AD", roles:["radiologist","doctor","admin"] },
  { id:"pharm",   label:"Pharmacy",          label_ar:"الصيدلية",           href:"/pharmacy",       icon:<Pill className="w-5 h-5"/>,         color:"#27AE60", roles:["pharmacist","admin"] },
  { id:"billing", label:"Billing & Revenue", label_ar:"الفوترة والإيرادات", href:"/billing",        icon:<CreditCard className="w-5 h-5"/>,   color:"#F39C12", roles:["billing","admin"] },
  { id:"consent", label:"My Consents",       label_ar:"موافقاتي",           href:"/consent",        icon:<Shield className="w-5 h-5"/>,       color:"#16A085", roles:["patient","admin","doctor","nurse"] },
  { id:"patient", label:"Patient Records",   label_ar:"سجلات المرضى",      href:"/admission",      icon:<Users className="w-5 h-5"/>,        color:"#2980B9", roles:["admin","doctor","nurse","receptionist"] },
  { id:"telehealth",label:"Telehealth",      label_ar:"الرعاية عن بُعد",   href:"/telehealth/new", icon:<Phone className="w-5 h-5"/>,        color:"#1ABC9C", roles:["doctor","patient","admin"], badge:"New" },
  { id:"national",label:"National Health",   label_ar:"الصحة الوطنية",     href:"/national",       icon:<Globe className="w-5 h-5"/>,        color:"#2C3E50", roles:["ministry","admin","super_admin"] },
  { id:"settings",label:"Settings",          label_ar:"الإعدادات",          href:"/settings",       icon:<Settings className="w-5 h-5"/>,     color:"#7F8C8D", roles:["admin","super_admin"] },
  { id:"analytics",label:"Analytics",        label_ar:"التحليلات",          href:"/analytics",      icon:<BarChart3 className="w-5 h-5"/>,    color:"#E67E22", roles:["admin","super_admin"] },
];

interface Props {
  userRole?: string;
  locale?: "en" | "ar";
  open?: boolean;
  onClose?: () => void;
}

export function AppLauncher({ userRole = "admin", locale = "en", open: openProp, onClose }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp !== undefined ? openProp : internalOpen;
  const setOpen = (v: boolean) => { setInternalOpen(v); if (!v && onClose) onClose(); };
  const [search, setSearch] = useState("");

  const visible = APPS.filter(a =>
    (a.roles.includes(userRole) || userRole === "super_admin") &&
    (search === "" ||
      a.label.toLowerCase().includes(search.toLowerCase()) ||
      a.label_ar.includes(search))
  );

  const isRTL = locale === "ar";

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
        style={{ background: "rgba(230,126,34,.08)", border: "1px solid rgba(230,126,34,.2)", color: "#E67E22" }}
        title="App Launcher">
        <Grip className="w-4 h-4" />
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} style={{ background: "rgba(0,0,0,.5)" }} />

      {/* Launcher panel */}
      <div
        className="fixed top-16 left-4 z-50 w-[480px] rounded-2xl overflow-hidden"
        dir={isRTL ? "rtl" : "ltr"}
        style={{ background: "oklch(0.09 0.018 250)", border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 24px 60px rgba(0,0,0,.7)" }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,.08)" }}>
          <Zap className="w-4 h-4" style={{ color: "#E67E22" }} />
          <span className="text-sm font-bold text-white">{isRTL ? "قائمة التطبيقات" : "CyMed Apps"}</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isRTL ? "ابحث…" : "Search apps…"}
            autoFocus
            className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#fff" }}
          />
          <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/5">
            <X className="w-4 h-4" style={{ color: "rgba(255,255,255,.4)" }} />
          </button>
        </div>

        {/* Apps grid */}
        <div className="p-4 grid grid-cols-4 gap-2 max-h-[360px] overflow-y-auto">
          {visible.map(app => (
            <Link key={app.id} href={app.href} onClick={() => setOpen(false)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:bg-white/[0.05] group text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center relative"
                style={{ background: `${app.color}18`, border: `1px solid ${app.color}30` }}>
                <span style={{ color: app.color }}>{app.icon}</span>
                {app.badge && (
                  <span className="absolute -top-1 -right-1 text-[8px] font-black px-1 py-px rounded-full"
                    style={{ background: "#E67E22", color: "#fff" }}>
                    {app.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-tight font-medium" style={{ color: "rgba(255,255,255,.7)" }}>
                {isRTL ? app.label_ar : app.label}
              </span>
            </Link>
          ))}
          {visible.length === 0 && (
            <div className="col-span-4 text-center py-8 text-xs" style={{ color: "rgba(255,255,255,.3)" }}>
              {isRTL ? "لا توجد تطبيقات" : "No apps found"}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
