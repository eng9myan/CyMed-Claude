/**
 * CyMed Demo Personas
 *
 * Each persona is a self-contained sales experience:
 *  - Tailored landing page (hero, features, testimonials)
 *  - Filtered workspace navigation (only their modules)
 *  - Persona-relevant seed data
 *  - 5-step scripted tour with arrows
 *
 * Prospects only ever see their persona's URL — they never know
 * the others exist. This is sales-grade tailoring at scale.
 */

export type PersonaId = 'hospital' | 'clinic' | 'pharmacy' | 'lab' | 'radiology';

export interface Persona {
  id: PersonaId;
  // Branding
  label: string;
  tagline: string;
  heroHeadline: string;
  heroSubhead: string;
  accentColor: string;
  heroBgClass: string;

  // Audience
  audience: string;
  audienceDescription: string;

  // What they care about (KPIs in hero)
  heroStats: { value: string; label: string }[];

  // What you show them
  features: { icon: string; title: string; description: string }[];

  // Allow-list of modules they see in the workspace
  allowedModules: string[];

  // Default landing route after they "log in" to the demo
  defaultRoute: string;

  // Scripted tour steps (selector + content)
  tourSteps: { selector?: string; route: string; title: string; body: string }[];

  // Testimonial relevant to this vertical
  testimonial: { quote: string; author: string; role: string; org: string };

  // Pricing tier highlight
  recommendedPlan: 'Starter' | 'Professional' | 'Enterprise';
  priceFrom: string;

  // Pain points this persona has
  painPoints: string[];
}

export const PERSONAS: Record<PersonaId, Persona> = {

  // ── HOSPITAL ──────────────────────────────────────────────────────────────
  hospital: {
    id: 'hospital',
    label: 'Hospital',
    tagline: 'Multi-department healthcare operations',
    heroHeadline: 'Run your entire hospital from one screen.',
    heroSubhead: 'Patient journey from ER triage to discharge billing — across every department, every shift, every regulator. One system. No integrations.',
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
      { icon: '🏥', title: 'Patient Journey', description: 'Triage → admission → bed → doctor → orders → discharge in one timeline.' },
      { icon: '🛏', title: 'Bed Management', description: 'Live occupancy, transfer workflows, housekeeping handoffs, isolation flags.' },
      { icon: '⚕️', title: 'Clinical Workflows', description: 'EMR with SOAP, CPOE, eMAR, nursing flowsheets, surgical checklists.' },
      { icon: '💊', title: 'Pharmacy & Labs', description: 'Internal departments wired in — no integration broker needed.' },
      { icon: '💳', title: 'Revenue Cycle', description: 'NPHIES claims, ZATCA invoicing, AR aging, denials management.' },
      { icon: '📊', title: 'Executive Command Center', description: 'Real-time KPIs by department: occupancy, revenue, staff, quality.' },
    ],
    allowedModules: [
      'command_center', 'reception', 'admission', 'nurse', 'doctor',
      'bed_board', 'emar', 'pharmacy', 'laboratory', 'radiology',
      'or-room', 'icu', 'billing', 'insurance', 'discharge',
      'reporting', 'patient',
    ],
    defaultRoute: '/demo/hospital/workspace/command_center',
    tourSteps: [
      { route: '/demo/hospital/workspace/command_center', title: 'Executive Command Center', body: 'Every KPI a CEO/CMO/CFO needs in one view: occupancy, revenue, staff on duty, quality alerts. Real-time, no overnight batch.' },
      { route: '/demo/hospital/workspace/admission', title: 'Patient Admission', body: 'ER triage to bed assignment in one screen. Insurance eligibility checked in real-time against NPHIES.' },
      { route: '/demo/hospital/workspace/bed_board', title: 'Bed Management Board', body: 'Drag-and-drop bed assignments, transfers, housekeeping status. Replaces your whiteboard.' },
      { route: '/demo/hospital/workspace/doctor', title: 'Doctor Workstation', body: 'EMR, CPOE, prescriptions, lab orders — all from one chart. Voice-to-text SOAP notes built in.' },
      { route: '/demo/hospital/workspace/billing', title: 'Revenue Cycle', body: 'Discharge auto-generates the invoice with NPHIES claim ready. ZATCA QR code on every bill.' },
    ],
    testimonial: {
      quote: 'We cut our claims rejection rate by 64% in the first quarter. The unified billing-clinical-inventory workflow is transformational.',
      author: 'Dr. Reem Al-Saud',
      role: 'CMO',
      org: 'King Faisal Healthcare Network',
    },
    recommendedPlan: 'Enterprise',
    priceFrom: 'Custom — typically SAR 30K-180K/month',
    painPoints: [
      'Separate HMS, ERP, payroll, and ZATCA systems',
      'Insurance claims rejected for data mismatches',
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
    heroSubhead: 'Appointments, consultations, prescriptions, and ZATCA invoicing in a single, fast interface designed for clinic owner-doctors.',
    accentColor: '#10B981',
    heroBgClass: 'from-slate-950 via-emerald-950 to-slate-900',
    audience: 'Clinics & Specialty Practices',
    audienceDescription: '1-20 doctors, single or multi-location, outpatient',
    heroStats: [
      { value: '2 min', label: 'Avg consult check-in' },
      { value: '+38%', label: 'Patient throughput' },
      { value: '2 wks', label: 'Time to live' },
      { value: '0', label: 'Software needed at front desk' },
    ],
    features: [
      { icon: '📅', title: 'Smart Scheduling', description: 'Drag-and-drop appointments with online booking and SMS reminders.' },
      { icon: '🩺', title: 'Quick Consultation', description: 'Streamlined SOAP form designed for 7-15 minute visits.' },
      { icon: '💊', title: 'Digital Prescriptions', description: 'Drug interactions checked, sent to in-clinic or partnered pharmacy.' },
      { icon: '💳', title: 'Instant Billing', description: 'ZATCA-compliant invoice generated in 1 click. Card + insurance + cash.' },
      { icon: '👥', title: 'Patient Records', description: 'Full medical history at a glance. Search by name, MRN, phone, or condition.' },
      { icon: '📈', title: 'Daily Insights', description: 'Today\'s revenue, no-show rate, top conditions, cash position.' },
    ],
    allowedModules: [
      'calendar', 'scheduling', 'reception', 'doctor', 'patient',
      'billing', 'pharmacy', 'reporting',
    ],
    defaultRoute: '/demo/clinic/workspace/calendar',
    tourSteps: [
      { route: '/demo/clinic/workspace/calendar', title: 'Today\'s Schedule', body: 'Drag to reschedule. Color-coded by visit type. SMS reminders sent automatically 24h before.' },
      { route: '/demo/clinic/workspace/reception', title: 'Reception Check-In', body: 'Two-click check-in. Insurance eligibility verified in real-time before the consultation starts.' },
      { route: '/demo/clinic/workspace/doctor', title: 'Quick Consultation', body: 'Vital signs auto-populated from triage. SOAP note via voice-to-text. Add ICD-11 diagnosis from search.' },
      { route: '/demo/clinic/workspace/pharmacy', title: 'Send Prescription', body: 'Drug interaction check happens as you type. Send to in-clinic pharmacy or partnered network.' },
      { route: '/demo/clinic/workspace/billing', title: 'One-Click Invoice', body: 'All services from the visit pre-populated. Press Confirm — ZATCA QR generated, invoice printed.' },
    ],
    testimonial: {
      quote: 'I switched from three different apps to CyMed and saw 38% more patients per day. My reception staff was up and running by lunch.',
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
    heroSubhead: 'POS, FEFO inventory, NPHIES insurance, SFDA tracking, multi-branch consolidation. Every requirement, pre-built.',
    accentColor: '#3B82F6',
    heroBgClass: 'from-slate-950 via-blue-950 to-slate-900',
    audience: 'Pharmacies & Pharmacy Chains',
    audience_description: 'Single shops to 200+ branch chains, retail and hospital pharmacies',
    audienceDescription: 'Single shops to 200+ branch chains, retail and hospital pharmacies',
    heroStats: [
      { value: '< 1s', label: 'Barcode to invoice' },
      { value: '99.4%', label: 'Insurance approval rate' },
      { value: '0', label: 'Expired drugs dispensed' },
      { value: '24/7', label: 'NPHIES + SFDA integration' },
    ],
    features: [
      { icon: '🔍', title: 'Point of Sale', description: 'Barcode scan → drug info → eligibility check → dispense in under 30 seconds.' },
      { icon: '📦', title: 'FEFO Inventory', description: 'First-Expired-First-Out picking enforced. Cold chain temperature monitoring built in.' },
      { icon: '🏥', title: 'Insurance & NPHIES', description: 'Real-time eligibility, claims submission, denials workflow — all standard.' },
      { icon: '🧪', title: 'Compounding', description: 'Recipe management, batch records, sterile/non-sterile workflows.' },
      { icon: '🌐', title: 'Multi-Branch', description: 'Stock transfers between branches, consolidated reporting, per-branch P&L.' },
      { icon: '📊', title: 'Owner Dashboard', description: 'Today\'s revenue across all branches, top SKUs, slow movers, expiry warnings.' },
    ],
    allowedModules: [
      'pharmacy', 'inventory_mgmt', 'compounding', 'pos',
      'insurance', 'reporting', 'patient',
    ],
    defaultRoute: '/demo/pharmacy/workspace/pos',
    tourSteps: [
      { route: '/demo/pharmacy/workspace/pos', title: 'Pharmacy POS', body: 'Scan a barcode, system pulls drug info, runs interaction check, validates the prescription, processes the sale.' },
      { route: '/demo/pharmacy/workspace/inventory_mgmt', title: 'FEFO Inventory', body: 'Real stock per batch with expiry dates. Picking suggests oldest-first. Alerts for near-expiry.' },
      { route: '/demo/pharmacy/workspace/compounding', title: 'Compounding Workflow', body: 'Recipe-based with weight verification, batch records, and sterility tracking for IV/eye preparations.' },
      { route: '/demo/pharmacy/workspace/insurance', title: 'NPHIES Real-Time', body: 'Patient walks in — eligibility verified in 1 second. Claim submitted at point of dispense. Denials routed for resubmit.' },
      { route: '/demo/pharmacy/workspace/reporting', title: 'Multi-Branch View', body: 'See all your branches at once: today\'s revenue, top drugs, slow movers, expiry exposure.' },
    ],
    testimonial: {
      quote: 'Our insurance rejection rate dropped from 18% to 0.6% within 60 days. CyMed handles NPHIES exactly the way it should work.',
      author: 'Ahmad Al-Khalifa',
      role: 'Operations Director',
      org: 'Al-Nahdi Pharmacies (32 branches)',
    },
    recommendedPlan: 'Professional',
    priceFrom: 'SAR 4,500/month per branch',
    painPoints: [
      'Manual expiry tracking → expired drugs dispensed → fines',
      'Insurance rejections costing 10-20% of revenue',
      'No consolidated view across branches',
      'Compounding records on paper — SFDA audit nightmare',
    ],
  },

  // ── LAB ───────────────────────────────────────────────────────────────────
  lab: {
    id: 'lab',
    label: 'Laboratory',
    tagline: 'Diagnostic and reference laboratories',
    heroHeadline: 'Lab LIS that actually runs your operation.',
    heroSubhead: 'Sample tracking, auto-verification, QC, analyzer integration, and patient result delivery — purpose-built for diagnostic labs.',
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
      { icon: '🧪', title: 'Sample Workflow', description: 'Barcode tracking from collection to disposal. Aliquot routing, chain of custody, batch loading.' },
      { icon: '🤖', title: 'Auto-Verification', description: 'Delta checks, reference ranges, instrument flags — rule-based release without tech touching it.' },
      { icon: '📊', title: 'Quality Control', description: 'Levey-Jennings charts, Westgard rules, CV tracking. CAP-grade documentation.' },
      { icon: '🔌', title: 'Analyzer Integration', description: 'HL7 ASTM bidirectional — Roche, Abbott, Sysmex, Beckman, Mindray, all pre-built.' },
      { icon: '👥', title: 'Patient Portal', description: 'Results delivered to patients securely; doctors get push notifications.' },
      { icon: '📈', title: 'Lab Analytics', description: 'Turnaround time, instrument utilization, repeat rate, revenue per test.' },
    ],
    allowedModules: [
      'laboratory', 'lab', 'autoverify', 'microbiology', 'patient',
      'billing', 'reporting',
    ],
    defaultRoute: '/demo/lab/workspace/laboratory',
    tourSteps: [
      { route: '/demo/lab/workspace/laboratory', title: 'Sample Queue', body: 'All accessioned samples in one view. Filter by priority, doctor, test type. Color-coded for STAT.' },
      { route: '/demo/lab/workspace/autoverify', title: 'Auto-Verification Engine', body: 'Define rules per analyte. Delta checks, reference ranges, instrument flags applied automatically.' },
      { route: '/demo/lab/workspace/microbiology', title: 'Microbiology Workflow', body: 'Specimen → culture → growth → ID → AST → MIC. Sensitivity report with antibiotic guidance.' },
      { route: '/demo/lab/workspace/lab', title: 'Quality Control', body: 'Daily QC capture, Levey-Jennings charts auto-generated, Westgard rules trigger reruns.' },
      { route: '/demo/lab/workspace/reporting', title: 'Operational Metrics', body: 'TAT by test, analyzer utilization, revenue per panel. Drill into any number.' },
    ],
    testimonial: {
      quote: 'CyMed cut our average TAT from 4.2 hours to 1.6 hours. Auto-verification handles 94% of results — our techs focus only on exceptions.',
      author: 'Dr. Layla Al-Mutairi',
      role: 'Lab Director',
      org: 'Borg Diagnostic Centers',
    },
    recommendedPlan: 'Professional',
    priceFrom: 'SAR 5,200/month',
    painPoints: [
      'Manual result entry from analyzers → transcription errors',
      'QC tracked in Excel sheets — CAP/SCFHS audit risk',
      'No analyzer integration; samples re-keyed multiple times',
      'Doctors call to ask "where\'s my result?" all day',
    ],
  },

  // ── RADIOLOGY / X-RAY ─────────────────────────────────────────────────────
  radiology: {
    id: 'radiology',
    label: 'Imaging Center',
    tagline: 'Radiology and diagnostic imaging',
    heroHeadline: 'RIS, PACS, AI, and reporting — in one workstation.',
    heroSubhead: 'Modality worklist, DICOM viewer, AI-assisted detection, voice-to-text reporting, and peer review. The radiologist\'s dream stack.',
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
      { icon: '📡', title: 'Modality Worklist', description: 'DICOM MWL push to every modality. Patient on table = order on screen.' },
      { icon: '🖼', title: 'PACS Viewer', description: 'Zero-footprint web viewer. Compare priors, multi-planar reconstruction, measurements.' },
      { icon: '🧠', title: 'AI Assist', description: 'Lung nodule, ICH, fracture, mammography — preliminary findings before you read.' },
      { icon: '🎙', title: 'Voice Reporting', description: 'Multilingual dictation (Arabic + English) with structured templates per modality.' },
      { icon: '👥', title: 'Peer Review', description: 'Random sampling for QA, double-read for critical findings, discrepancy tracking.' },
      { icon: '☢️', title: 'Dose Tracking', description: 'CTDIvol/DLP per study, ICRP-103 limits, per-patient cumulative dose log.' },
    ],
    allowedModules: [
      'radiology', 'ai', 'dose', 'peerreview',
      'patient', 'billing', 'reporting',
    ],
    defaultRoute: '/demo/radiology/workspace/radiology',
    tourSteps: [
      { route: '/demo/radiology/workspace/radiology', title: 'Modality Worklist', body: 'Every study from every modality in one queue. STAT highlighted, drag to reassign, priors auto-loaded.' },
      { route: '/demo/radiology/workspace/ai', title: 'AI-Assisted Reading', body: 'Lung nodules detected. ICH probability scored. Fracture lines highlighted. You confirm or override.' },
      { route: '/demo/radiology/workspace/peerreview', title: 'Peer Review QA', body: 'Random 3% of cases auto-flagged for second read. Discrepancies logged and tracked for accreditation.' },
      { route: '/demo/radiology/workspace/dose', title: 'Dose Management', body: 'Per-study DLP, per-patient cumulative. Alert at threshold. Pediatric protocols flagged.' },
      { route: '/demo/radiology/workspace/reporting', title: 'Performance Dashboard', body: 'Studies per radiologist, average read time, AI override rate, modality utilization.' },
    ],
    testimonial: {
      quote: 'My read volume went up 47% because the AI surfaces what matters first. The Arabic voice reporting is the best I\'ve used.',
      author: 'Dr. Mohammed Al-Ghamdi',
      role: 'Chief Radiologist',
      org: 'Saudi German Hospitals — Riyadh',
    },
    recommendedPlan: 'Professional',
    priceFrom: 'SAR 6,800/month',
    painPoints: [
      'PACS, RIS, and reporting in three different systems',
      'No AI integration — every study read from scratch',
      'Dose tracking on Excel — regulatory exposure',
      'Voice software doesn\'t understand Arabic medical terminology',
    ],
  },
};

export function getPersona(id: string): Persona | null {
  return PERSONAS[id as PersonaId] ?? null;
}

export const ALL_PERSONAS = Object.values(PERSONAS);
