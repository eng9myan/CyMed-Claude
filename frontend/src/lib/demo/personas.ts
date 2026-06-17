/**
 * CyMed Demo Personas
 *
 * Each persona shows its operational/clinical modules PLUS the full ERP backbone
 * (HR, Payroll, Attendance, Time Off, Accounting, Inventory, POS, Procurement,
 * Assets, CRM). Sidebar groups modules into "Operations", "ERP", and "Reports"
 * sections for clarity.
 */

export type PersonaId = 'hospital' | 'clinic' | 'pharmacy' | 'lab' | 'radiology';

export interface ModuleGroup {
  label: string;
  modules: string[];
}

export interface Persona {
  id: PersonaId;
  label: string;
  tagline: string;
  heroHeadline: string;
  heroSubhead: string;
  accentColor: string;
  heroBgClass: string;

  audience: string;
  audienceDescription: string;

  heroStats: { value: string; label: string }[];
  features: { icon: string; title: string; description: string }[];

  // Modules grouped by section in the sidebar
  moduleGroups: ModuleGroup[];

  defaultRoute: string;
  tourSteps: { selector?: string; route: string; title: string; body: string }[];

  testimonial: { quote: string; author: string; role: string; org: string };
  recommendedPlan: 'Starter' | 'Professional' | 'Enterprise';
  priceFrom: string;
  painPoints: string[];
}

// Shared ERP modules — every persona gets these. Each will have persona-specific
// seed data so the numbers reflect their scale and context.
const FULL_ERP: ModuleGroup[] = [
  {
    label: 'Human Resources',
    modules: ['hr', 'attendance', 'time_off', 'payroll', 'recruitment'],
  },
  {
    label: 'Finance',
    modules: ['accounting', 'billing', 'expenses', 'banking'],
  },
  {
    label: 'Operations',
    modules: ['inventory_mgmt', 'procurement', 'assets', 'pos_erp'],
  },
  {
    label: 'Customer / Patient',
    modules: ['crm', 'marketing'],
  },
  {
    label: 'Reports',
    modules: ['reporting'],
  },
];

// Helper: flatten allowed modules
function modulesFromGroups(groups: ModuleGroup[]): string[] {
  return groups.flatMap((g) => g.modules);
}

export const PERSONAS: Record<PersonaId, Persona> = {

  // ── HOSPITAL ──────────────────────────────────────────────────────────────
  hospital: {
    id: 'hospital',
    label: 'Hospital',
    tagline: 'Multi-department healthcare operations',
    heroHeadline: 'Run your entire hospital from one screen.',
    heroSubhead: 'Patient journey from ER triage to discharge billing — plus the full ERP backbone: HR, payroll, attendance, accounting, inventory, procurement, and assets. One system, no integrations.',
    accentColor: '#E67E22',
    heroBgClass: 'from-slate-950 via-slate-900 to-orange-950',
    audience: 'Hospitals & Healthcare Networks',
    audienceDescription: '50-500 beds, multi-department, multi-facility',
    heroStats: [
      { value: '8 min', label: 'ER to admission' },
      { value: '64%', label: 'Claims rejection drop' },
      { value: '12 wks', label: 'Time to live' },
      { value: '0', label: 'Integrations to maintain' },
    ],
    features: [
      { icon: '🏥', title: 'Patient Journey',    description: 'Triage → admission → bed → doctor → orders → discharge in one timeline.' },
      { icon: '👥', title: 'HR & Payroll',        description: 'Hundreds of staff, GOSI, WPS files, EOSB accruals, multi-grade structures.' },
      { icon: '💳', title: 'Revenue Cycle',       description: 'NPHIES claims, ZATCA invoicing, AR aging, denials management.' },
      { icon: '📦', title: 'Supply Chain',        description: 'Drug + consumable inventory with FEFO, vendor scorecards, automated POs.' },
      { icon: '🏗', title: 'Fixed Assets',        description: 'Medical equipment register, depreciation, maintenance contracts, calibration tracking.' },
      { icon: '📊', title: 'Executive Dashboards',description: 'C-suite KPIs: occupancy, revenue, staff, compliance — all real-time.' },
    ],
    moduleGroups: [
      {
        label: 'Clinical',
        modules: ['command_center', 'reception', 'admission', 'nurse', 'doctor', 'bed_board', 'emar', 'pharmacy', 'laboratory', 'radiology', 'or-room', 'icu', 'patient', 'discharge', 'insurance'],
      },
      ...FULL_ERP,
    ],
    defaultRoute: '/demo/hospital/workspace/command_center',
    tourSteps: [
      { route: '/demo/hospital/workspace/command_center', title: 'Executive Command Center', body: 'Every KPI a CEO/CMO/CFO needs: occupancy, revenue, staff on duty, alerts. Real-time, no overnight batch.' },
      { route: '/demo/hospital/workspace/admission',       title: 'Patient Journey',          body: 'ER triage to bed assignment in one screen. Insurance verified in real-time against NPHIES.' },
      { route: '/demo/hospital/workspace/billing',         title: 'Revenue Cycle',            body: 'Discharge auto-generates the invoice with NPHIES claim ready. ZATCA QR code on every bill.' },
      { route: '/demo/hospital/workspace/payroll',         title: 'Payroll & GOSI',           body: '284 staff payroll runs in 4 minutes. WPS file auto-generated. GOSI deductions handled.' },
      { route: '/demo/hospital/workspace/assets',          title: 'Medical Equipment',        body: 'CT scanners, MRI, ventilators — all tracked. Maintenance contracts, calibration due dates, depreciation.' },
    ],
    testimonial: {
      quote: 'We cut our claims rejection rate by 64% in the first quarter. The unified billing-clinical-payroll workflow is transformational.',
      author: 'Dr. Reem Al-Saud',
      role: 'CMO',
      org: 'King Faisal Healthcare Network',
    },
    recommendedPlan: 'Enterprise',
    priceFrom: 'Custom — typically SAR 30K-180K/month',
    painPoints: [
      'Separate HMS, ERP, payroll, and ZATCA systems with broken integrations',
      'Insurance claims rejected for data mismatches between systems',
      'No real-time visibility for the C-suite',
      'Implementation projects that drag 18-24 months',
    ],
  },

  // ── CLINIC ────────────────────────────────────────────────────────────────
  clinic: {
    id: 'clinic',
    label: 'Clinic',
    tagline: 'Outpatient and specialty clinics',
    heroHeadline: 'The clinic ERP that doesn\'t need an IT department.',
    heroSubhead: 'Appointments, consultations, prescriptions, billing, plus full back-office: HR, payroll, accounting, inventory. Built for clinic owner-doctors.',
    accentColor: '#10B981',
    heroBgClass: 'from-slate-950 via-emerald-950 to-slate-900',
    audience: 'Clinics & Specialty Practices',
    audienceDescription: '1-20 doctors, single or multi-location, outpatient',
    heroStats: [
      { value: '2 min', label: 'Avg consult check-in' },
      { value: '+38%', label: 'Patient throughput' },
      { value: '2 wks', label: 'Time to live' },
      { value: 'SAR 0', label: 'Setup fees' },
    ],
    features: [
      { icon: '📅', title: 'Smart Scheduling',     description: 'Drag-and-drop appointments with online booking and SMS reminders.' },
      { icon: '🩺', title: 'Quick Consultation',   description: 'Streamlined SOAP form designed for 7-15 minute visits.' },
      { icon: '👥', title: 'HR & Payroll',         description: 'Staff records, attendance, leave, GOSI-ready payroll for clinics of any size.' },
      { icon: '💳', title: 'Instant Billing',      description: 'ZATCA-compliant invoice in 1 click. Card + insurance + cash.' },
      { icon: '📦', title: 'Inventory & Supplies', description: 'Track consumables, drugs in dispense, sample collection kits.' },
      { icon: '📈', title: 'Daily Insights',       description: 'Today\'s revenue, no-show rate, top procedures, cash position.' },
    ],
    moduleGroups: [
      {
        label: 'Clinical',
        modules: ['calendar', 'scheduling', 'reception', 'doctor', 'patient', 'pharmacy'],
      },
      ...FULL_ERP,
    ],
    defaultRoute: '/demo/clinic/workspace/calendar',
    tourSteps: [
      { route: '/demo/clinic/workspace/calendar',  title: 'Today\'s Schedule',      body: 'Drag to reschedule. Color-coded by visit type. SMS reminders sent automatically.' },
      { route: '/demo/clinic/workspace/doctor',    title: 'Quick Consultation',     body: 'SOAP via voice-to-text. ICD-11 search. Prescriptions auto-checked for interactions.' },
      { route: '/demo/clinic/workspace/billing',   title: 'One-Click Invoice',      body: 'All services pre-populated. Press Confirm — ZATCA QR generated, invoice printed.' },
      { route: '/demo/clinic/workspace/hr',        title: 'Your Team',              body: 'Doctors, nurses, receptionists in one roster. Attendance, leave, payroll all linked.' },
      { route: '/demo/clinic/workspace/accounting',title: 'Cash Position',          body: 'Daily cash drawer reconciliation. Monthly P&L without an accountant.' },
    ],
    testimonial: {
      quote: 'I switched from three different apps to CyMed and saw 38% more patients per day. My receptionist was up and running by lunch.',
      author: 'Dr. Hassan Al-Qahtani',
      role: 'Owner',
      org: 'Dermatology & Aesthetic Clinic, Jeddah',
    },
    recommendedPlan: 'Starter',
    priceFrom: 'SAR 2,400/month',
    painPoints: [
      'Paper records or 3 different software systems',
      'Receptionist spends 20% of time on insurance calls',
      'ZATCA compliance is a manual nightmare',
      'No idea what today\'s revenue actually is until end of month',
    ],
  },

  // ── PHARMACY ──────────────────────────────────────────────────────────────
  pharmacy: {
    id: 'pharmacy',
    label: 'Pharmacy',
    tagline: 'Retail and chain pharmacies',
    heroHeadline: 'Pharmacy ERP built for Saudi compliance — out of the box.',
    heroSubhead: 'POS, FEFO inventory, NPHIES insurance, SFDA tracking, multi-branch consolidation — plus full HR, payroll, accounting. Every requirement, pre-built.',
    accentColor: '#3B82F6',
    heroBgClass: 'from-slate-950 via-blue-950 to-slate-900',
    audience: 'Pharmacies & Pharmacy Chains',
    audienceDescription: 'Single shops to 200+ branch chains, retail and hospital pharmacies',
    heroStats: [
      { value: '< 1s', label: 'Barcode to invoice' },
      { value: '99.4%', label: 'Insurance approval rate' },
      { value: '0', label: 'Expired drugs dispensed' },
      { value: '24/7', label: 'NPHIES + SFDA integration' },
    ],
    features: [
      { icon: '🔍', title: 'Point of Sale',     description: 'Barcode scan → drug info → eligibility check → dispense in 30 seconds.' },
      { icon: '📦', title: 'FEFO Inventory',    description: 'First-Expired-First-Out enforced. Cold chain temperature monitoring.' },
      { icon: '🏥', title: 'Insurance & NPHIES',description: 'Real-time eligibility, claims submission, denials workflow.' },
      { icon: '👥', title: 'HR & Payroll',      description: 'Pharmacists, technicians, attendance, leave, multi-branch payroll.' },
      { icon: '🌐', title: 'Multi-Branch',      description: 'Stock transfers, consolidated reporting, per-branch P&L.' },
      { icon: '📊', title: 'Owner Dashboard',   description: 'Today\'s revenue across branches, top SKUs, slow movers, expiry warnings.' },
    ],
    moduleGroups: [
      {
        label: 'Pharmacy Operations',
        modules: ['pos', 'pharmacy', 'compounding', 'insurance', 'patient'],
      },
      ...FULL_ERP,
    ],
    defaultRoute: '/demo/pharmacy/workspace/pos',
    tourSteps: [
      { route: '/demo/pharmacy/workspace/pos',          title: 'Pharmacy POS',          body: 'Scan a barcode. Drug info loads, interaction check runs, sale processed in seconds.' },
      { route: '/demo/pharmacy/workspace/inventory_mgmt', title: 'FEFO Inventory',     body: 'Real stock per batch with expiry. Picking suggests oldest-first. Near-expiry alerts.' },
      { route: '/demo/pharmacy/workspace/insurance',     title: 'NPHIES Real-Time',    body: 'Patient walks in — eligibility verified in 1 second. Claim submitted at point of dispense.' },
      { route: '/demo/pharmacy/workspace/payroll',       title: 'Pharmacist Payroll',  body: 'Multi-branch payroll across all locations. GOSI, WPS, EOSB — all handled.' },
      { route: '/demo/pharmacy/workspace/accounting',    title: 'Multi-Branch P&L',    body: 'Each branch as a profit center. Consolidated GL. Daily cash position by store.' },
    ],
    testimonial: {
      quote: 'Our insurance rejection rate dropped from 18% to 0.6% within 60 days. And we finally have one HR + payroll system across all 32 branches.',
      author: 'Ahmad Al-Khalifa',
      role: 'Operations Director',
      org: 'Al-Nahdi Pharmacies (32 branches)',
    },
    recommendedPlan: 'Professional',
    priceFrom: 'SAR 4,500/month per branch',
    painPoints: [
      'Manual expiry tracking → expired drugs dispensed → fines',
      'Insurance rejections costing 10-20% of revenue',
      'HR and payroll spread across multiple branches in spreadsheets',
      'Compounding records on paper — SFDA audit nightmare',
    ],
  },

  // ── LAB ───────────────────────────────────────────────────────────────────
  lab: {
    id: 'lab',
    label: 'Laboratory',
    tagline: 'Diagnostic and reference laboratories',
    heroHeadline: 'Lab LIS + ERP that actually runs your operation.',
    heroSubhead: 'Sample tracking, auto-verification, QC, analyzer integration, patient result delivery — plus full HR, payroll, inventory, and asset management built in.',
    accentColor: '#8B5CF6',
    heroBgClass: 'from-slate-950 via-purple-950 to-slate-900',
    audience: 'Diagnostic & Reference Labs',
    audienceDescription: 'Standalone labs, hospital-integrated, reference networks',
    heroStats: [
      { value: '< 2 h', label: 'Avg TAT for stat samples' },
      { value: '94%', label: 'Auto-verified results' },
      { value: '100+', label: 'Analyzer integrations' },
      { value: '0', label: 'Manual transcription errors' },
    ],
    features: [
      { icon: '🧪', title: 'Sample Workflow',     description: 'Barcode tracking from collection to disposal. Aliquot routing, chain of custody.' },
      { icon: '🤖', title: 'Auto-Verification',   description: 'Delta checks, reference ranges, Westgard rules — rule-based release without tech touching.' },
      { icon: '🔌', title: 'Analyzer Integration',description: 'HL7 ASTM bidirectional — Roche, Abbott, Sysmex, Beckman, all pre-built.' },
      { icon: '🏗', title: 'Asset Management',    description: 'Track every analyzer: maintenance contracts, calibration, depreciation, lease vs own.' },
      { icon: '👥', title: 'HR & Payroll',        description: 'Lab techs, phlebotomists, supervisors. Shift differentials, on-call, GOSI.' },
      { icon: '📦', title: 'Reagent Inventory',   description: 'Lot-tracked reagents, expiry-aware, auto-reorder when batch sensitivity drops.' },
    ],
    moduleGroups: [
      {
        label: 'Lab Operations',
        modules: ['laboratory', 'autoverify', 'microbiology', 'lab', 'patient'],
      },
      ...FULL_ERP,
    ],
    defaultRoute: '/demo/lab/workspace/laboratory',
    tourSteps: [
      { route: '/demo/lab/workspace/laboratory', title: 'Sample Queue',          body: 'Every sample in one view. Filter by priority, test, doctor. STAT highlighted.' },
      { route: '/demo/lab/workspace/autoverify', title: 'Auto-Verification',     body: 'Define rules per analyte. Delta checks and ranges applied automatically.' },
      { route: '/demo/lab/workspace/assets',     title: 'Analyzer Register',     body: 'Every analyzer tracked: contract value, calibration date, downtime hours.' },
      { route: '/demo/lab/workspace/inventory_mgmt', title: 'Reagent Inventory', body: 'Lot-aware stock. Auto-PO when low. Cold chain monitoring for sensitive reagents.' },
      { route: '/demo/lab/workspace/payroll',    title: 'Lab Tech Payroll',      body: 'Shift differentials (24/7 lab), on-call pay, supervisor bonuses — all in one run.' },
    ],
    testimonial: {
      quote: 'CyMed cut our TAT from 4.2 hours to 1.6 hours, and our HR person stopped spending Fridays on payroll Excel sheets.',
      author: 'Dr. Layla Al-Mutairi',
      role: 'Lab Director',
      org: 'Borg Diagnostic Centers',
    },
    recommendedPlan: 'Professional',
    priceFrom: 'SAR 5,200/month',
    painPoints: [
      'Manual result entry from analyzers → transcription errors',
      'QC tracked in Excel — CAP/SCFHS audit risk',
      'Reagent inventory rotating in/out without lot tracking',
      'Multi-shift payroll calculated by hand every month',
    ],
  },

  // ── RADIOLOGY / X-RAY ─────────────────────────────────────────────────────
  radiology: {
    id: 'radiology',
    label: 'Imaging Center',
    tagline: 'Radiology and diagnostic imaging',
    heroHeadline: 'RIS, PACS, AI, ERP — in one workstation.',
    heroSubhead: 'Modality worklist, DICOM viewer, AI-assisted detection, voice reporting — plus full ERP: HR, payroll, inventory, and asset management for million-riyal imaging equipment.',
    accentColor: '#EC4899',
    heroBgClass: 'from-slate-950 via-pink-950 to-slate-900',
    audience: 'Imaging Centers & Radiology Departments',
    audienceDescription: 'Standalone imaging, hospital radiology, teleradiology networks',
    heroStats: [
      { value: '< 30 s', label: 'Image load (any modality)' },
      { value: '+47%', label: 'Reports per radiologist/day' },
      { value: '12+', label: 'AI models integrated' },
      { value: '100%', label: 'DICOM compliance' },
    ],
    features: [
      { icon: '📡', title: 'Modality Worklist',  description: 'DICOM MWL push to every modality. Patient on table = order on screen.' },
      { icon: '🧠', title: 'AI Assist',           description: 'Lung nodule, ICH, fracture, mammography — preliminary findings before you read.' },
      { icon: '🎙', title: 'Voice Reporting',    description: 'Multilingual dictation (Arabic + English) with structured templates per modality.' },
      { icon: '🏗', title: 'Equipment Lifecycle', description: 'CT, MRI, X-ray, ultrasound — depreciation, AMC, AERB licensing, dose calibration.' },
      { icon: '👥', title: 'HR & Payroll',       description: 'Radiologists (with read incentives), techs, on-call pay, GOSI compliance.' },
      { icon: '📦', title: 'Consumables',         description: 'Contrast, film, AERB cassettes, lead protection — tracked and auto-reordered.' },
    ],
    moduleGroups: [
      {
        label: 'Imaging Operations',
        modules: ['radiology', 'ai', 'dose', 'peerreview', 'patient'],
      },
      ...FULL_ERP,
    ],
    defaultRoute: '/demo/radiology/workspace/radiology',
    tourSteps: [
      { route: '/demo/radiology/workspace/radiology', title: 'Modality Worklist', body: 'Every study from every modality in one queue. STAT highlighted, priors auto-loaded.' },
      { route: '/demo/radiology/workspace/ai',        title: 'AI-Assisted Reading',body: 'Lung nodules, ICH, fractures highlighted. You confirm or override.' },
      { route: '/demo/radiology/workspace/assets',    title: 'Imaging Equipment',  body: 'CT, MRI, X-Ray — SAR 8M+ assets tracked. AMC, calibration, AERB licensing.' },
      { route: '/demo/radiology/workspace/payroll',   title: 'Radiologist Comp',   body: 'Base + read incentives + on-call. Multi-modality, multi-shift, all handled.' },
      { route: '/demo/radiology/workspace/accounting',title: 'Per-Modality P&L',   body: 'Revenue per CT, per MRI scan. ROI per equipment. Cost per read.' },
    ],
    testimonial: {
      quote: 'My read volume went up 47% because the AI surfaces what matters first. And I finally see the ROI per CT scanner.',
      author: 'Dr. Mohammed Al-Ghamdi',
      role: 'Chief Radiologist',
      org: 'Saudi German Hospitals — Riyadh',
    },
    recommendedPlan: 'Professional',
    priceFrom: 'SAR 6,800/month',
    painPoints: [
      'PACS, RIS, and reporting in three different systems',
      'No AI integration — every study read from scratch',
      'Equipment lifecycle tracked on Excel — AERB and JCI exposure',
      'Radiologist read-incentive comp calculated manually every month',
    ],
  },
};

export function getPersona(id: string): Persona | null {
  return PERSONAS[id as PersonaId] ?? null;
}

// Flat allowed-modules list (used for runtime route guards)
export function allowedModulesFor(p: Persona): string[] {
  return p.moduleGroups.flatMap((g) => g.modules);
}

export const ALL_PERSONAS = Object.values(PERSONAS);
