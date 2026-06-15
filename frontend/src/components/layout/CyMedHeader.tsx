"use client";

import { useState, useEffect } from "react";
import { Bell, Menu, User, ChevronDown, Grid3X3, Globe } from "lucide-react";
import { AppLauncher } from "./AppLauncher";

export function CyMedHeader() {
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [locale, setLocale] = useState<"en" | "ar">("en");
  const [notifCount] = useState(3);

  useEffect(() => {
    const saved = (typeof window !== "undefined" ? localStorage.getItem("cymed_locale") : null) as "en" | "ar" | null;
    if (saved) setLocale(saved);
  }, []);

  function toggleLocale() {
    const next: "en" | "ar" = locale === "en" ? "ar" : "en";
    setLocale(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("cymed_locale", next);
      document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = next;
    }
  }

  return (
    <>
      <header className="h-16 bg-slate-900/95 backdrop-blur border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 z-10 w-full shrink-0">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button className="md:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-lg">
            <Menu className="h-5 w-5" />
          </button>

          {/* App Launcher */}
          <button
            onClick={() => setLauncherOpen(true)}
            className="flex items-center gap-2 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="App Launcher"
          >
            <Grid3X3 className="h-5 w-5" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center text-sm text-slate-400 gap-1">
            <span className="text-slate-600">/</span>
            <span className="text-slate-300 font-medium">CyMed Health System</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Locale Toggle */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 transition"
          >
            <Globe className="w-3.5 h-3.5" />
            {locale === "en" ? "EN" : "عربي"}
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition">
            <Bell className="h-5 w-5" />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center border border-slate-900">
                {notifCount}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-slate-700 mx-1" />

          {/* User */}
          <div className="flex items-center gap-2.5 cursor-pointer p-1.5 pr-3 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow">
              A
            </div>
            <div className="hidden md:block text-sm">
              <p className="font-semibold text-slate-200 leading-none">Admin User</p>
              <p className="text-xs text-slate-500 mt-0.5">Super Admin</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500 hidden md:block" />
          </div>
        </div>
      </header>

      <AppLauncher open={launcherOpen} onClose={() => setLauncherOpen(false)} />
    </>
  );
}
