import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCountry } from '@/lib/setup/countries';

const MODULE_CONFIG: { id: string; name: string; description: string; preLoaded: string[]; needsInput: string[]; icon: string; color: string }[] = [
  {
    id: 'accounting',
    name: 'Accounting',
    icon: '📒', color: '#F59E0B',
    description: 'GL, AP/AR, journals, financial reports.',
    preLoaded: ['Chart of Accounts (country-specific)', 'Tax codes & rates', 'Fiscal year + periods', 'Default journals (Sales, Purchase, Bank, Cash, Misc)', 'Payment terms (Net 30/60/90, COD, Custom)', 'Currency + FX update schedule', 'IFRS report templates'],
    needsInput: ['Company VAT/TIN number', 'Bank accounts (IBAN, account #)', 'Opening balance migration (CSV upload)'],
  },
  {
    id: 'hr',
    name: 'Human Resources',
    icon: '👥', color: '#3B82F6',
    description: 'Employees, departments, contracts.',
    preLoaded: ['Department template (medical: Clinical/Admin/Support)', 'Standard job titles (200+ healthcare roles)', 'Contract templates (Full-time, Part-time, Locum, Resident)', 'Onboarding checklist', 'Org chart auto-generation'],
    needsInput: ['Existing employee data (CSV/Excel import wizard)', 'Letterhead + signature for contracts', 'Approval workflow (1-step / 2-step / matrix)'],
  },
  {
    id: 'payroll',
    name: 'Payroll',
    icon: '💸', color: '#10B981',
    description: 'Salary structures, GOSI, WPS, EOSB.',
    preLoaded: ['Salary structure templates (basic + housing + transport + other)', 'Country social security rules', 'Income tax tables (where applicable)', 'EOSB calculation rules', 'Payslip template (bilingual)', 'WPS bank file formats'],
    needsInput: ['Bank for salary disbursement', 'Pay cycle (monthly / bi-weekly)', 'Tax registration numbers', 'Existing salaries import'],
  },
  {
    id: 'attendance',
    name: 'Attendance & Time Off',
    icon: '⏱', color: '#8B5CF6',
    description: 'Check-in, schedules, leave management.',
    preLoaded: ['Leave types (Annual, Sick, Maternity, Hajj, Emergency, Unpaid, Bereavement)', 'Public holidays calendar', 'Working schedule templates (5/2, 6/1, shift)', 'Geo-fencing rules', 'Overtime calculation', 'Shift differential rules'],
    needsInput: ['Biometric device IP/serial (optional)', 'Approval hierarchy', 'Annual leave balance per role'],
  },
  {
    id: 'inventory',
    name: 'Inventory',
    icon: '📦', color: '#06B6D4',
    description: 'Stock, FEFO, lots, warehouses.',
    preLoaded: ['Storage location templates', 'UoM (mg, ml, units, packs, etc.)', 'Product categories (Drug, Consumable, Reagent, Vaccine, Cold Chain, etc.)', 'FEFO routing rules', 'Reorder rule templates', 'Cold chain monitoring rules'],
    needsInput: ['Existing stock count (CSV/Excel)', 'SFDA drug code mapping (if applicable)', 'Storage location IDs / barcodes'],
  },
  {
    id: 'procurement',
    name: 'Procurement',
    icon: '🛒', color: '#EC4899',
    description: 'PR → PO → GRN workflow, vendors.',
    preLoaded: ['PR/PO/GRN workflow with 3-way matching', 'Vendor categories', 'Approval matrix templates (by amount)', 'PO numbering sequence', 'NUPCO catalog connector (Saudi)', 'Vendor scorecard rules'],
    needsInput: ['Approval matrix amounts (your thresholds)', 'Existing vendor master (CSV import)', 'Procurement category owners'],
  },
  {
    id: 'assets',
    name: 'Fixed Assets',
    icon: '🏗', color: '#EF4444',
    description: 'Medical equipment, depreciation, AMC.',
    preLoaded: ['Asset categories (Imaging, Lab, Monitoring, Surgical, IT, Furniture)', 'Depreciation methods (Straight-line, Declining-balance, Units-of-production)', 'Useful life templates per category', 'Maintenance contract templates', 'Calibration schedule rules', 'Insurance tracking'],
    needsInput: ['Asset register import (CSV/Excel)', 'Opening accumulated depreciation', 'AMC contract uploads'],
  },
  {
    id: 'crm',
    name: 'CRM & Patient Relations',
    icon: '🧠', color: '#06B6D4',
    description: 'Leads, opportunities, patient lifecycle.',
    preLoaded: ['Pipeline stages (Lead → Qualified → Proposal → Won)', 'Patient lifecycle templates', 'Activity types', 'SMS/Email templates (bilingual)', 'NPS survey templates'],
    needsInput: ['SMS gateway credentials (optional)', 'Email server / sending domain', 'Existing contacts import'],
  },
  {
    id: 'pos',
    name: 'Point of Sale',
    icon: '🧾', color: '#F59E0B',
    description: 'Front-desk payments, cafeteria, retail.',
    preLoaded: ['POS layout templates (clinic / pharmacy / cafeteria / gift)', 'Payment methods (Cash, Card, Insurance, Corporate, Mada, Apple Pay, Google Pay)', 'Receipt printer protocols (ESC/POS, ZPL)', 'Cash drawer reconciliation flow', 'Tax-inclusive vs exclusive pricing'],
    needsInput: ['Card terminal credentials (gateway)', 'Receipt printer model', 'Opening cash float'],
  },
];

export async function generateStaticParams() {
  return [];
}

export default async function ModuleSetupOverview({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const c = getCountry(country);
  if (!c) notFound();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto py-12">
        <Link href={`/setup/${country}`} className="text-sm text-slate-400 hover:text-white mb-6 inline-flex items-center gap-2">
          ← Back to integrations
        </Link>

        <div className="mb-10">
          <div className="text-xs uppercase tracking-wider font-bold mb-3 text-orange-400">
            Step 3 of 8 — Module Configuration ({c.flag} {c.name})
          </div>
          <h1 className="text-4xl font-extrabold mb-3">Configure your modules</h1>
          <p className="text-slate-400 max-w-2xl">
            Each module ships with country-aware defaults. You only need to provide the small list of inputs unique to your facility.
          </p>
        </div>

        <div className="bg-slate-900 rounded-full h-2 mb-10 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full" style={{ width: '37.5%' }} />
        </div>

        <div className="space-y-4 mb-10">
          {MODULE_CONFIG.map((m) => (
            <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: `${m.color}22` }}>{m.icon}</div>
                    <div>
                      <h3 className="font-bold text-lg">{m.name}</h3>
                      <p className="text-sm text-slate-400">{m.description}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <div className="text-xs uppercase font-bold text-emerald-400 mb-2">✓ Pre-loaded for {c.name}</div>
                      <ul className="space-y-1">
                        {m.preLoaded.map((p, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs uppercase font-bold text-amber-400 mb-2">⚠ You provide</div>
                      <ul className="space-y-1">
                        {m.needsInput.map((p, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                            <span className="text-amber-400 mt-0.5">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-bold text-orange-400 border border-slate-700 flex-shrink-0">
                  Configure →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-6 flex items-center justify-between">
          <Link href={`/setup/${country}`} className="text-slate-400 hover:text-white text-sm">
            ← Back to integrations
          </Link>
          <button className="px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm">
            Finish setup → Launch CyMed
          </button>
        </div>
      </div>
    </div>
  );
}
