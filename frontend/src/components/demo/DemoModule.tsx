"use client";
import { useMemo } from 'react';
import type { Persona } from '@/lib/demo/personas';
import { DEMO_DATA } from '@/lib/demo/seedData';
import { getERPData } from '@/lib/demo/erpSeedData';
import { getClinicalData, NETWORK_FACILITIES } from '@/lib/demo/clinicalSeedData';

interface Props { persona: Persona; moduleId: string; }

const TITLES: Record<string, string> = {
  // Clinical / operational
  command_center: 'Executive Command Center',
  reception:      'Reception · Patient Check-In',
  admission:      'Patient Admission',
  nurse:          'Nursing Station',
  doctor:         'Doctor Workstation',
  bed_board:      'Bed Management Board',
  emar:           'eMAR · Medication Administration',
  pharmacy:       'Pharmacy Operations',
  laboratory:     'Laboratory Workflow',
  radiology:      'Radiology / Imaging',
  'or-room':      'Operating Room',
  icu:            'Intensive Care Unit',
  billing:        'Billing & Revenue Cycle',
  insurance:      'Insurance & NPHIES',
  discharge:      'Discharge Workflow',
  reporting:      'Reports & Analytics',
  patient:        'Patient Records',
  calendar:       "Today's Schedule",
  scheduling:     'Appointment Scheduling',
  inventory_mgmt: 'Inventory Management',
  compounding:    'Pharmacy Compounding',
  pos:            'Point of Sale',
  lab:            'Lab Quality Control',
  autoverify:     'Auto-Verification Engine',
  microbiology:   'Microbiology Workflow',
  ai:             'AI-Assisted Reading',
  dose:           'Radiation Dose Management',
  peerreview:     'Peer Review & QA',
  // HR
  hr:             'Employees',
  attendance:     'Attendance & Time Tracking',
  time_off:       'Time Off & Leave Management',
  payroll:        'Payroll & GOSI',
  recruitment:    'Recruitment Pipeline',
  // Finance
  accounting:     'Accounting · GL · Trial Balance',
  expenses:       'Expense Reports',
  banking:        'Bank Accounts & Reconciliation',
  // Operations
  procurement:    'Procurement · PR/PO/GRN',
  assets:         'Fixed Assets & Maintenance',
  pos_erp:        'Point of Sale (Front Desk)',
  // Customer
  marketing:      'Marketing Campaigns',
};

export function DemoModule({ persona, moduleId }: Props) {
  const data = useMemo(() => {
    return DEMO_DATA[persona.id]?.[moduleId]
        ?? getClinicalData(persona.id, moduleId)
        ?? getERPData(persona.id, moduleId);
  }, [persona.id, moduleId]);
  const title = TITLES[moduleId] ?? moduleId;
  const facilities = NETWORK_FACILITIES[persona.id] ?? [];

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <header className="mb-6">
        <div className="text-xs uppercase tracking-wider font-bold mb-1" style={{ color: persona.accentColor }}>
          {persona.label} workspace
        </div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {data?.subtitle && <p className="text-slate-400 text-sm mt-1">{data.subtitle}</p>}
      </header>

      {/* Network facilities badge */}
      {facilities.length > 0 && (
        <div className="mb-6 bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3 overflow-x-auto">
          <span className="text-xs uppercase font-bold tracking-wider flex-shrink-0" style={{ color: persona.accentColor }}>
            🌐 Network ({facilities.length})
          </span>
          <div className="flex gap-2 flex-wrap">
            {facilities.map((f) => (
              <span key={f} className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300 whitespace-nowrap">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* KPI row */}
      {data?.kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {data.kpis.map((k, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-2">{k.label}</div>
              <div className="text-2xl font-bold" style={{ color: i === 0 ? persona.accentColor : '#fff' }}>{k.value}</div>
              {k.sub && <div className="text-xs text-slate-500 mt-1">{k.sub}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Main panel */}
      {data?.table ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 font-semibold">{data.tableTitle ?? 'Data'}</div>
          <table className="w-full text-sm">
            <thead className="bg-slate-800/40 text-xs text-slate-400 uppercase tracking-wider">
              <tr>{data.table.cols.map((c) => <th key={c} className="text-left p-3">{c}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.table.rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-slate-800/30">
                  {row.map((cell, ci) => (
                    <td key={ci} className="p-3">
                      {typeof cell === 'object' && cell !== null && 'badge' in cell ? (
                        <span className="text-xs px-2 py-1 rounded-full font-semibold"
                              style={{ backgroundColor: `${persona.accentColor}22`, color: persona.accentColor }}>
                          {cell.badge}
                        </span>
                      ) : (
                        <span className={ci === 0 ? 'text-white font-medium' : 'text-slate-300'}>{String(cell)}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">Live in your demo</h3>
          <p className="text-slate-400 max-w-xl mx-auto">
            This module is fully functional in the live CyMed deployment. Demo data for this specific view will be added on request.
          </p>
          <button className="mt-6 px-5 py-2.5 rounded-lg text-white font-semibold transition-all hover:scale-105"
                  style={{ backgroundColor: persona.accentColor }}
                  onClick={() => window.location.href = `mailto:sales@cy-com.com?subject=CyMed ${persona.label} demo`}>
            Talk to Sales
          </button>
        </div>
      )}

      {/* CTA strip */}
      <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
        <div>
          <div className="font-bold">Ready to see this with YOUR data?</div>
          <div className="text-sm text-slate-400 mt-1">Book a 30-minute personalized demo with our team.</div>
        </div>
        <a href="mailto:sales@cy-com.com?subject=CyMed%20Demo%20Request"
           className="px-5 py-2.5 rounded-lg text-white font-bold transition-all hover:scale-105"
           style={{ backgroundColor: persona.accentColor }}>
          Book Demo →
        </a>
      </div>
    </div>
  );
}
