"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, X, Play, BookOpen, ExternalLink } from 'lucide-react';
import type { Persona } from '@/lib/demo/personas';

const MODULE_META: Record<string, { label: string; icon: string }> = {
  command_center: { label: 'Command Center', icon: '🎯' },
  reception:      { label: 'Reception',       icon: '🛎️' },
  admission:      { label: 'Admission',       icon: '🏥' },
  nurse:          { label: 'Nursing Station', icon: '👩‍⚕️' },
  doctor:         { label: 'Doctor',          icon: '🩺' },
  bed_board:      { label: 'Bed Board',       icon: '🛏️' },
  emar:           { label: 'eMAR',            icon: '💊' },
  pharmacy:       { label: 'Pharmacy',        icon: '💊' },
  laboratory:     { label: 'Laboratory',      icon: '🧪' },
  radiology:      { label: 'Radiology',       icon: '📡' },
  'or-room':      { label: 'Operating Room',  icon: '⚕️' },
  icu:            { label: 'ICU',             icon: '❤️' },
  billing:        { label: 'Billing',         icon: '💳' },
  insurance:      { label: 'Insurance',       icon: '🏷️' },
  discharge:      { label: 'Discharge',       icon: '🚪' },
  reporting:      { label: 'Reports',         icon: '📊' },
  patient:        { label: 'Patients',        icon: '👥' },
  calendar:       { label: 'Calendar',        icon: '📅' },
  scheduling:     { label: 'Scheduling',      icon: '📆' },
  inventory_mgmt: { label: 'Inventory',       icon: '📦' },
  compounding:    { label: 'Compounding',     icon: '🧬' },
  pos:            { label: 'Point of Sale',   icon: '🔍' },
  lab:            { label: 'QC & Workflow',   icon: '🔬' },
  autoverify:     { label: 'Auto-Verify',     icon: '🤖' },
  microbiology:   { label: 'Microbiology',    icon: '🦠' },
  ai:             { label: 'AI Assist',       icon: '🧠' },
  dose:           { label: 'Dose Tracking',   icon: '☢️' },
  peerreview:     { label: 'Peer Review',     icon: '👥' },
};

export function DemoShell({ persona, children }: { persona: Persona; children: React.ReactNode }) {
  const pathname = usePathname();
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const currentTourStep = persona.tourSteps[tourStep];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
        <Link href={`/demo/${persona.id}`} className="p-5 border-b border-slate-800 flex items-center gap-3 hover:bg-slate-800/40 transition-colors">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-white text-xl"
               style={{ backgroundColor: persona.accentColor }}>+</div>
          <div className="flex-1">
            <div className="font-bold text-white">CyMed</div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: persona.accentColor }}>
              for {persona.label}
            </div>
          </div>
        </Link>

        <nav className="flex-1 overflow-y-auto py-3">
          {persona.allowedModules.map((mod) => {
            const meta = MODULE_META[mod] ?? { label: mod, icon: '•' };
            const href = `/demo/${persona.id}/workspace/${mod}`;
            const isActive = pathname === href;
            return (
              <Link key={mod} href={href} className={`mx-2 my-0.5 px-3 py-2 rounded-lg flex items-center gap-3 text-sm transition-all ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold border-l-2'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
              style={isActive ? { borderColor: persona.accentColor } : {}}>
                <span className="text-lg">{meta.icon}</span>
                <span>{meta.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button onClick={() => { setTourOpen(true); setTourStep(0); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: persona.accentColor }}>
            <Play className="w-4 h-4" />
            Start Guided Tour
          </button>
          <Link href="/" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
            Visit main site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden">
        {/* Demo banner */}
        <div className="px-6 py-2 text-xs font-semibold flex items-center justify-between border-b border-slate-800"
             style={{ backgroundColor: `${persona.accentColor}11`, borderColor: `${persona.accentColor}33` }}>
          <span className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: persona.accentColor }}/>
            <span style={{ color: persona.accentColor }}>DEMO MODE — {persona.label} workspace · all data is illustrative</span>
          </span>
          <a href="mailto:sales@cy-com.com" className="text-slate-400 hover:text-white">
            Ready to talk? sales@cy-com.com
          </a>
        </div>

        {children}
      </main>

      {/* Guided Tour Overlay */}
      {tourOpen && currentTourStep && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:justify-end p-4 pointer-events-none">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 pointer-events-auto"
               style={{ boxShadow: `0 30px 80px ${persona.accentColor}33` }}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white"
                     style={{ backgroundColor: persona.accentColor }}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: persona.accentColor }}>
                    Step {tourStep + 1} of {persona.tourSteps.length}
                  </div>
                  <h3 className="font-bold text-white text-lg">{currentTourStep.title}</h3>
                </div>
              </div>
              <button onClick={() => setTourOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-5">
              {currentTourStep.body}
            </p>

            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-1">
                {persona.tourSteps.map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full transition-colors"
                       style={{ backgroundColor: i === tourStep ? persona.accentColor : '#334155' }}/>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setTourStep((s) => Math.max(0, s - 1))}
                        disabled={tourStep === 0}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {tourStep < persona.tourSteps.length - 1 ? (
                  <Link href={persona.tourSteps[tourStep + 1].route}
                        onClick={() => setTourStep((s) => s + 1)}
                        className="px-4 py-1.5 rounded-lg text-sm font-bold text-white transition-all hover:scale-105 flex items-center gap-1"
                        style={{ backgroundColor: persona.accentColor }}>
                    Next <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button onClick={() => setTourOpen(false)}
                          className="px-4 py-1.5 rounded-lg text-sm font-bold text-white transition-all hover:scale-105"
                          style={{ backgroundColor: persona.accentColor }}>
                    Finish tour ✓
                  </button>
                )}
              </div>
            </div>

            <a href="mailto:sales@cy-com.com?subject=CyMed%20Demo%20Request"
               className="block mt-4 text-center text-xs text-slate-400 hover:text-white">
              Liked what you saw? Email sales@cy-com.com →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
