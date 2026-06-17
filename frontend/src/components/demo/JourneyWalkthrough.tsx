"use client";
import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Database, Zap, User, Stethoscope, Pill, Activity, Microscope, FileCheck, Clipboard, DollarSign } from 'lucide-react';
import type { Persona } from '@/lib/demo/personas';
import { JOURNEY, PATIENT } from '@/lib/demo/patientJourney';

const ROLE_ICON: Record<string, React.ReactNode> = {
  'Reception Clerk':       <User className="w-5 h-5" />,
  'Triage Nurse':          <Activity className="w-5 h-5" />,
  'Charge Nurse':          <Clipboard className="w-5 h-5" />,
  'ER Physician':          <Stethoscope className="w-5 h-5" />,
  'Floor Nurse':           <Activity className="w-5 h-5" />,
  'Med-Admin Nurse':       <Pill className="w-5 h-5" />,
  'Lab Technologist':      <Microscope className="w-5 h-5" />,
  'ER Nurse → CCU Nurse':  <Clipboard className="w-5 h-5" />,
  'Pharmacist':            <Pill className="w-5 h-5" />,
  'CCU Nurse':             <Activity className="w-5 h-5" />,
  'Cath Lab Team':         <Stethoscope className="w-5 h-5" />,
  'Discharge Planner':     <FileCheck className="w-5 h-5" />,
  'Billing / RCM':         <DollarSign className="w-5 h-5" />,
};

export function JourneyWalkthrough({ persona }: { persona: Persona }) {
  const [stepIdx, setStepIdx] = useState(0);
  const step = JOURNEY[stepIdx];

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Banner */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/demo/${persona.id}`} className="text-xs text-slate-400 hover:text-white">← Back to demo</Link>
            <div className="h-4 w-px bg-slate-700" />
            <div className="text-xs uppercase tracking-wider font-bold" style={{ color: persona.accentColor }}>
              Patient Journey · Live Walkthrough
            </div>
          </div>
          <div className="text-xs text-slate-400">
            Step {stepIdx + 1} of {JOURNEY.length} · {step.time}
          </div>
        </div>
        {/* Progress bar */}
        <div className="bg-slate-800 h-1">
          <div className="h-1 transition-all"
               style={{ width: `${((stepIdx + 1) / JOURNEY.length) * 100}%`, backgroundColor: persona.accentColor }} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Patient header card */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-800 rounded-2xl p-5 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-wider font-bold mb-1" style={{ color: persona.accentColor }}>
                Patient under care
              </div>
              <h2 className="text-2xl font-bold mb-1">{PATIENT.name}</h2>
              <div className="text-sm text-slate-400 font-mono">{PATIENT.mrn}</div>
            </div>
            <div className="text-right text-sm">
              <div className="text-slate-400 mb-1"><span className="font-bold text-white">Arrival:</span> {PATIENT.arrival}</div>
              <div className="text-slate-400"><span className="font-bold text-white">Chief complaint:</span> {PATIENT.chiefComplaint}</div>
            </div>
          </div>
        </div>

        {/* Step header */}
        <div className="mb-6 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
               style={{ backgroundColor: step.roleColor }}>
            {ROLE_ICON[step.role] ?? <User className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <span className="text-xs uppercase tracking-wider font-bold px-2 py-1 rounded"
                    style={{ backgroundColor: `${step.roleColor}22`, color: step.roleColor }}>
                {step.role}
              </span>
              <span className="text-xs text-slate-400">→</span>
              <Link href={`/demo/${persona.id}/workspace/${step.screen}`}
                    className="text-xs text-orange-400 hover:underline font-mono">
                /workspace/{step.screen}
              </Link>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400">{step.time}</span>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight">{step.title}</h1>
            <p className="text-slate-300 mt-2">{step.scenario}</p>
          </div>
        </div>

        {/* Two columns: fields + auto-actions */}
        <div className="grid md:grid-cols-3 gap-5 mb-6">

          {/* Fields */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2">
              <Database className="w-4 h-4" style={{ color: step.roleColor }} />
              <span className="font-bold text-sm">Fields the {step.role} enters ({step.fields.length})</span>
            </div>
            <div className="divide-y divide-slate-800">
              {step.fields.map((f, i) => (
                <div key={i} className="px-5 py-3 flex items-start gap-3 hover:bg-slate-800/30">
                  <span className="text-xs font-mono font-bold text-slate-500 w-6 mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase tracking-wider font-bold text-slate-400">{f.label}</div>
                    <div className="text-sm text-white mt-0.5 break-words">{f.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auto actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-fit sticky top-24">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-sm">CyMed auto-actions ({step.autoActions.length})</span>
            </div>
            <ul className="divide-y divide-slate-800/50">
              {step.autoActions.map((a, i) => (
                <li key={i} className="px-5 py-3 text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">⚡</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Next trigger */}
        <div className="bg-slate-900 border-l-4 border-orange-500 rounded-r-xl p-4 mb-8 flex items-start gap-3">
          <ArrowRight className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-orange-400 mb-1">Next trigger</div>
            <div className="text-sm">{step.nextTrigger}</div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setStepIdx(Math.max(0, stepIdx - 1))}
                  disabled={stepIdx === 0}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-bold disabled:opacity-30 inline-flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {/* Dots */}
          <div className="flex gap-1.5 flex-wrap justify-center">
            {JOURNEY.map((s, i) => (
              <button key={s.id} onClick={() => setStepIdx(i)}
                      title={`${i + 1}. ${s.title}`}
                      className="w-2.5 h-2.5 rounded-full transition-all"
                      style={{
                        backgroundColor: i === stepIdx ? persona.accentColor : i < stepIdx ? '#475569' : '#1e293b',
                        transform: i === stepIdx ? 'scale(1.5)' : 'scale(1)',
                      }} />
            ))}
          </div>

          {stepIdx < JOURNEY.length - 1 ? (
            <button onClick={() => setStepIdx(stepIdx + 1)}
                    className="px-5 py-2 rounded-lg text-white text-sm font-bold inline-flex items-center gap-2"
                    style={{ backgroundColor: persona.accentColor }}>
              Next step <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <Link href={`/demo/${persona.id}/workspace`} className="px-5 py-2 rounded-lg text-white text-sm font-bold inline-flex items-center gap-2"
                  style={{ backgroundColor: persona.accentColor }}>
              Finish · Open workspace <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Open screen link */}
        <div className="mt-8 text-center">
          <Link href={`/demo/${persona.id}/workspace/${step.screen}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-sm">
            <span>Open the {step.role}&apos;s actual screen</span>
            <ArrowRight className="w-4 h-4" style={{ color: persona.accentColor }} />
          </Link>
        </div>
      </div>
    </div>
  );
}
