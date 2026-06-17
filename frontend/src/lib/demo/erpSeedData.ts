/**
 * Shared ERP seed data — same modules but persona-specific numbers.
 *
 * Each function returns the seed for a given persona scale:
 *   hospital  → 284 staff, multi-dept, large
 *   clinic    → 12 staff, small
 *   pharmacy  → 87 staff across 32 branches
 *   lab       → 64 staff, 3 shifts
 *   radiology → 24 staff, specialist comp
 */
import type { ModuleData } from './seedData';
import type { PersonaId } from './personas';

// Per-persona scale parameters
const SCALE: Record<PersonaId, {
  staffCount: number;
  monthlyPayroll: number; // SAR
  monthlyRevenue: number;  // SAR
  inventoryValue: number;  // SAR
  assetValue: number;      // SAR (cost basis)
  vendorCount: number;
  topItem: string;
  topItemSub: string;
}> = {
  hospital:  { staffCount: 284, monthlyPayroll: 4820000, monthlyRevenue: 18400000, inventoryValue: 8400000, assetValue: 84000000, vendorCount: 142, topItem: 'CT Scanner (Siemens SOMATOM)', topItemSub: 'Imaging · purchased 2024-03' },
  clinic:    { staffCount: 12,  monthlyPayroll: 168000,  monthlyRevenue: 410000,    inventoryValue: 84000,   assetValue: 720000,   vendorCount: 24,  topItem: 'Dermatology Microscope', topItemSub: 'Examination · purchased 2024-09' },
  pharmacy:  { staffCount: 87,  monthlyPayroll: 1245000, monthlyRevenue: 12400000,  inventoryValue: 14200000,assetValue: 4800000,  vendorCount: 67,  topItem: 'POS Workstations (×64)',  topItemSub: 'IT · refresh cycle 2025' },
  lab:       { staffCount: 64,  monthlyPayroll: 920000,  monthlyRevenue: 6800000,   inventoryValue: 1840000, assetValue: 28000000, vendorCount: 38,  topItem: 'Roche Cobas 8000 c702',  topItemSub: 'Chemistry · purchased 2023-11' },
  radiology: { staffCount: 24,  monthlyPayroll: 1240000, monthlyRevenue: 4200000,   inventoryValue: 480000,  assetValue: 38000000, vendorCount: 18,  topItem: 'GE Signa Premier 3T MRI', topItemSub: 'Imaging · purchased 2024-06' },
};

function fmtSAR(n: number): string {
  if (n >= 1_000_000) return `SAR ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `SAR ${(n / 1_000).toFixed(0)}K`;
  return `SAR ${n.toLocaleString()}`;
}

// ── HR: Employees ───────────────────────────────────────────────────────────
function hrData(p: PersonaId): ModuleData {
  const s = SCALE[p];
  const samples: Record<PersonaId, [string, string, string, string, string][]> = {
    hospital: [
      ['Dr. Ahmed Al-Rashid',  'Senior Cardiologist', 'Cardiology', 'Active', 'Full-time'],
      ['Nurse Fatima Al-Zahra','RN Charge Nurse',    'ICU',         'Active', 'Full-time'],
      ['Dr. Khalid Al-Otaibi', 'Consultant Surgeon', 'Surgery',     'On Leave', 'Full-time'],
      ['Sara Al-Ghamdi',       'Senior Pharmacist',  'Pharmacy',    'Active', 'Full-time'],
      ['Mohammed Al-Harbi',    'Lab Technologist',   'Laboratory',  'Active', 'Full-time'],
    ],
    clinic: [
      ['Dr. Hassan Al-Qahtani','Owner / Dermatologist','Clinical', 'Active', 'Full-time'],
      ['Dr. Layla Al-Saud',    'Aesthetic Doctor',     'Clinical', 'Active', 'Full-time'],
      ['Nurse Aisha Al-Otaibi','Aesthetic Nurse',      'Clinical', 'Active', 'Full-time'],
      ['Reema Al-Harbi',       'Reception',            'Front Desk','Active', 'Full-time'],
      ['Khaled Al-Ghamdi',     'Receptionist',         'Front Desk','Active', 'Part-time'],
    ],
    pharmacy: [
      ['Ahmad Al-Khalifa',     'Operations Director',  'HQ',        'Active', 'Full-time'],
      ['Dr. Salma Al-Saud',    'Branch Pharmacist',    'Riyadh-12', 'Active', 'Full-time'],
      ['Yousef Al-Mansour',    'Pharmacy Technician',  'Riyadh-12', 'Active', 'Full-time'],
      ['Norah Al-Otaibi',      'Branch Pharmacist',    'Jeddah-04', 'Active', 'Full-time'],
      ['Faisal Al-Ghamdi',     'Driver / Stock',       'Logistics', 'Active', 'Full-time'],
    ],
    lab: [
      ['Dr. Layla Al-Mutairi', 'Lab Director',         'Management','Active','Full-time'],
      ['Mohammed Al-Harbi',    'Senior Tech (Hema)',   'Lab Floor', 'Active','Shift A'],
      ['Lina Al-Ghamdi',       'Tech (Chemistry)',     'Lab Floor', 'Active','Shift B'],
      ['Hala Al-Saud',         'Phlebotomist',         'Collection','Active','Shift A'],
      ['Khalid Al-Otaibi',     'Microbiology Tech',    'Lab Floor', 'Active','Shift C'],
    ],
    radiology: [
      ['Dr. Mohammed Al-Ghamdi','Chief Radiologist',   'Reading',   'Active','Full-time'],
      ['Dr. Sara Al-Mansour',   'Radiologist',         'Reading',   'Active','Full-time'],
      ['Nasser Al-Otaibi',      'CT/MRI Technologist', 'Scan Bay',  'Active','Shift A'],
      ['Reem Al-Harbi',         'X-Ray Technologist',  'X-Ray',     'Active','Shift B'],
      ['Faisal Al-Saud',        'PACS Administrator',  'IT',        'Active','Full-time'],
    ],
  };
  return {
    subtitle: `${s.staffCount} active employees · ${fmtSAR(s.monthlyPayroll)} monthly payroll`,
    kpis: [
      { label: 'Total Headcount', value: String(s.staffCount), sub: 'all departments' },
      { label: 'Active Today',    value: String(Math.round(s.staffCount * 0.86)), sub: '86% attendance' },
      { label: 'Open Positions',  value: p === 'hospital' ? '14' : p === 'pharmacy' ? '8' : '3', sub: 'recruiting' },
      { label: 'Avg Tenure',      value: '3.4 yrs', sub: '92% retention YoY' },
    ],
    tableTitle: 'Employee Directory (sample)',
    table: {
      cols: ['Name', 'Job Title', 'Department', 'Status', 'Type'],
      rows: samples[p].map((r) => [...r.slice(0, 3), { badge: r[3] }, r[4]]),
    },
  };
}

// ── HR: Attendance ──────────────────────────────────────────────────────────
function attendanceData(p: PersonaId): ModuleData {
  const s = SCALE[p];
  const present = Math.round(s.staffCount * 0.86);
  return {
    subtitle: `Today, June 17 · ${present} of ${s.staffCount} checked in · biometric + mobile`,
    kpis: [
      { label: 'Present Today', value: String(present), sub: `${Math.round(present/s.staffCount*100)}% of staff` },
      { label: 'On Leave',      value: String(Math.round(s.staffCount * 0.05)), sub: 'planned + sick' },
      { label: 'Late Arrivals', value: String(Math.round(s.staffCount * 0.02)), sub: 'over 15 min' },
      { label: 'Overtime Hours',value: String(Math.round(s.staffCount * 1.4)), sub: 'this week' },
    ],
    tableTitle: 'Today\'s Check-Ins',
    table: {
      cols: ['Employee', 'Department', 'Shift', 'Check-In', 'Status'],
      rows: [
        ['Dr. Ahmed Al-Rashid',  p === 'hospital' ? 'Cardiology' : 'Senior',  'Morning (07:00-15:00)', '06:54', { badge: 'ON TIME' }],
        ['Nurse Fatima Al-Zahra',p === 'hospital' ? 'ICU' : p === 'clinic' ? 'Clinical' : 'Operations', 'Night (19:00-07:00)', '18:48', { badge: 'ON TIME' }],
        ['Sara Al-Ghamdi',       'Pharmacy',  'Morning',           '07:18', { badge: 'LATE 18 MIN' }],
        ['Mohammed Al-Harbi',    'Laboratory','Afternoon (15-23)', '14:55', { badge: 'ON TIME' }],
        ['Lina Al-Otaibi',       p === 'radiology' ? 'X-Ray' : 'Admin', 'Morning', '—', { badge: 'ABSENT' }],
      ],
    },
  };
}

// ── HR: Time Off ────────────────────────────────────────────────────────────
function timeOffData(p: PersonaId): ModuleData {
  const s = SCALE[p];
  return {
    subtitle: 'Leave requests · annual · sick · emergency · maternity',
    kpis: [
      { label: 'Pending Approval', value: p === 'hospital' ? '12' : p === 'clinic' ? '2' : '6', sub: 'awaiting manager' },
      { label: 'On Leave Today',   value: String(Math.round(s.staffCount * 0.05)), sub: 'across all types' },
      { label: 'Avg Leave Balance',value: '18.4 days', sub: 'Saudi Labor Law: 21' },
      { label: 'Sick Leave This Mo',value: String(Math.round(s.staffCount * 0.08)), sub: 'tracking trend' },
    ],
    tableTitle: 'Pending Leave Requests',
    table: {
      cols: ['Employee', 'Type', 'From', 'To', 'Days', 'Status'],
      rows: [
        ['Dr. Khalid Al-Otaibi', 'Annual',     '2026-06-20', '2026-07-04', '14', { badge: 'APPROVED' }],
        ['Nurse Hanan Al-Dosari','Sick',       '2026-06-15', '2026-06-17', '3',  { badge: 'PENDING' }],
        ['Sara Al-Ghamdi',       'Emergency',  '2026-06-16', '2026-06-16', '1',  { badge: 'PENDING' }],
        ['Mohammed Al-Harbi',    'Hajj Leave', '2026-07-01', '2026-07-15', '14', { badge: 'PENDING' }],
        ['Lina Al-Otaibi',       'Maternity',  '2026-08-01', '2026-12-01', '90', { badge: 'APPROVED' }],
      ],
    },
  };
}

// ── HR: Payroll ─────────────────────────────────────────────────────────────
function payrollData(p: PersonaId): ModuleData {
  const s = SCALE[p];
  const gosi = Math.round(s.monthlyPayroll * 0.1175);
  const eosb = Math.round(s.monthlyPayroll * 0.083);
  return {
    subtitle: `June 2026 payroll run · ${fmtSAR(s.monthlyPayroll)} gross · WPS-ready`,
    kpis: [
      { label: 'Gross Payroll MTD', value: fmtSAR(s.monthlyPayroll), sub: `${s.staffCount} employees` },
      { label: 'GOSI Contribution', value: fmtSAR(gosi),             sub: '11.75% employer · 9.75% employee' },
      { label: 'EOSB Accrual',      value: fmtSAR(eosb),             sub: 'Saudi Labour Law Art. 84' },
      { label: 'WPS File',          value: 'Ready',                  sub: 'auto-generated each cycle' },
    ],
    tableTitle: 'June 2026 Pay Run (sample)',
    table: {
      cols: ['Employee', 'Basic', 'Allowances', 'Overtime', 'Deductions', 'Net'],
      rows: [
        ['Dr. Ahmed Al-Rashid',   'SAR 28,000', 'SAR 14,000', 'SAR 2,100', 'SAR 3,108', 'SAR 40,992'],
        ['Nurse Fatima Al-Zahra', 'SAR 14,000', 'SAR  7,000', 'SAR 1,050', 'SAR 1,554', 'SAR 20,496'],
        ['Sara Al-Ghamdi',        'SAR 18,000', 'SAR  9,000', 'SAR    0',  'SAR 1,755', 'SAR 25,245'],
        ['Mohammed Al-Harbi',     'SAR 12,000', 'SAR  6,000', 'SAR   900', 'SAR 1,287', 'SAR 17,613'],
        ['Lina Al-Otaibi',        'SAR 10,000', 'SAR  5,000', 'SAR   600', 'SAR 1,074', 'SAR 14,526'],
      ],
    },
  };
}

// ── HR: Recruitment ─────────────────────────────────────────────────────────
function recruitmentData(p: PersonaId): ModuleData {
  return {
    subtitle: 'Open positions · candidate pipeline · interview workflow',
    kpis: [
      { label: 'Open Positions',  value: p === 'hospital' ? '14' : '4', sub: 'across departments' },
      { label: 'Active Candidates',value: p === 'hospital' ? '187' : '32', sub: 'all stages' },
      { label: 'Hires This Mo',   value: p === 'hospital' ? '8' : '2', sub: 'avg time-to-hire 32 days' },
      { label: 'Offer Acceptance',value: '89%', sub: '↑ from 76% last quarter' },
    ],
    tableTitle: 'Open Positions',
    table: {
      cols: ['Position', 'Department', 'Candidates', 'Stage', 'Status'],
      rows: [
        ['Senior Cardiologist',  p === 'clinic' ? 'Clinical' : 'Cardiology', '12', 'Final interview', { badge: 'ACTIVE' }],
        ['Registered Nurse',     p === 'clinic' ? 'Clinical' : 'ICU',        '34', 'Reference check', { badge: 'CLOSING' }],
        ['Pharmacy Technician',  'Pharmacy',                                  '18', 'Phone screen',    { badge: 'ACTIVE' }],
        ['Lab Technologist',     'Laboratory',                                '11', 'Technical test',  { badge: 'ACTIVE' }],
      ],
    },
  };
}

// ── Accounting ──────────────────────────────────────────────────────────────
function accountingData(p: PersonaId): ModuleData {
  const s = SCALE[p];
  const expenses = Math.round(s.monthlyRevenue * 0.74);
  const net = s.monthlyRevenue - expenses;
  return {
    subtitle: 'GL · trial balance · AP/AR · ZATCA compliance · IFRS reporting',
    kpis: [
      { label: 'Revenue MTD',    value: fmtSAR(s.monthlyRevenue), sub: '+8.3% vs last month' },
      { label: 'Expenses MTD',   value: fmtSAR(expenses),         sub: `${Math.round(expenses/s.monthlyRevenue*100)}% of revenue` },
      { label: 'Net Profit MTD', value: fmtSAR(net),              sub: `${Math.round(net/s.monthlyRevenue*100)}% margin` },
      { label: 'Cash Position',  value: fmtSAR(s.monthlyRevenue * 1.4), sub: 'across all accounts' },
    ],
    tableTitle: 'Recent Journal Entries',
    table: {
      cols: ['Reference', 'Date', 'Description', 'Source', 'Amount', 'Status'],
      rows: [
        ['JE-2026-22841', '2026-06-15', 'June payroll posting',         'Payroll',   fmtSAR(s.monthlyPayroll), { badge: 'POSTED' }],
        ['JE-2026-22840', '2026-06-15', 'NPHIES claims AR batch',       'Billing',   fmtSAR(s.monthlyRevenue * 0.6), { badge: 'POSTED' }],
        ['JE-2026-22839', '2026-06-14', 'Pharmacy inventory receipt',   'Inventory', fmtSAR(s.monthlyRevenue * 0.08), { badge: 'POSTED' }],
        ['JE-2026-22838', '2026-06-14', 'Equipment depreciation — June','Assets',    fmtSAR(s.assetValue / 60), { badge: 'DRAFT' }],
        ['JE-2026-22837', '2026-06-13', 'Bank charges — SABB',          'Banking',   'SAR 4,820',   { badge: 'POSTED' }],
      ],
    },
  };
}

// ── Billing ─────────────────────────────────────────────────────────────────
function billingData(p: PersonaId): ModuleData {
  const s = SCALE[p];
  const labels: Record<PersonaId, string> = {
    hospital: 'Patient invoicing · NPHIES claims · ZATCA e-invoicing',
    clinic: 'Consultation invoices · ZATCA QR · insurance + cash + corporate',
    pharmacy: 'Sales invoices · NPHIES real-time · ZATCA-compliant',
    lab: 'Test panel invoices · direct + corporate + insurance',
    radiology: 'Study-based invoices · per-modality pricing · NPHIES',
  };
  return {
    subtitle: labels[p],
    kpis: [
      { label: 'Invoiced Today',  value: fmtSAR(s.monthlyRevenue / 30), sub: `${Math.round(s.staffCount * 0.5)} invoices` },
      { label: 'Outstanding AR',  value: fmtSAR(s.monthlyRevenue * 0.4), sub: 'DSO 23 days' },
      { label: 'Collection Rate', value: '96.3%', sub: '↑ from 84% pre-CyMed' },
      { label: 'ZATCA Submission',value: '100%',  sub: 'real-time, no batch' },
    ],
    tableTitle: 'Today\'s Invoices',
    table: {
      cols: ['Invoice', 'Customer', 'Amount', 'Method', 'ZATCA'],
      rows: [
        ['INV-2026-A4471', 'Ahmed Al-Rashid', 'SAR 84,200', 'BUPA',       { badge: 'ZATCA OK' }],
        ['INV-2026-A4472', 'Fatima Al-Zahra', 'SAR 12,400', 'Tawuniya',   { badge: 'ZATCA OK' }],
        ['INV-2026-A4473', 'Khalid Al-Otaibi','SAR    450', 'Self-pay',   { badge: 'ZATCA OK' }],
        ['INV-2026-A4474', 'Sara Al-Ghamdi',  'SAR  6,800', 'MedGulf',    { badge: 'DRAFT' }],
      ],
    },
  };
}

// ── Expenses ────────────────────────────────────────────────────────────────
function expensesData(p: PersonaId): ModuleData {
  return {
    subtitle: 'Employee expense submissions · approval workflow · reimbursement',
    kpis: [
      { label: 'Pending Review',  value: p === 'hospital' ? '47' : '12', sub: 'avg approval: 1.4 days' },
      { label: 'Reimbursed MTD',  value: p === 'hospital' ? 'SAR 84,200' : 'SAR 22,400', sub: 'across all categories' },
      { label: 'Largest Category',value: 'Travel',                       sub: '42% of total' },
      { label: 'Policy Violations',value: '3',                           sub: 'auto-flagged for review' },
    ],
    tableTitle: 'Recent Expense Reports',
    table: {
      cols: ['Employee', 'Description', 'Category', 'Amount', 'Status'],
      rows: [
        ['Dr. Khalid Al-Otaibi', 'Conference — Dubai cardio summit', 'Travel & Training', 'SAR 8,400', { badge: 'APPROVED' }],
        ['Sara Al-Ghamdi',       'Continuing ed — Pharmacy CE',      'Training',          'SAR 2,400', { badge: 'PENDING' }],
        ['Mohammed Al-Harbi',    'Equipment — calibration tools',    'Lab Supplies',      'SAR 1,840', { badge: 'PENDING' }],
        ['Ahmad Al-Khalifa',     'Client lunch — corporate sale',    'Sales & Marketing', 'SAR   620', { badge: 'APPROVED' }],
      ],
    },
  };
}

// ── Banking ─────────────────────────────────────────────────────────────────
function bankingData(p: PersonaId): ModuleData {
  const s = SCALE[p];
  return {
    subtitle: 'Bank accounts · reconciliation · cash flow forecasting',
    kpis: [
      { label: 'Cash on Hand',    value: fmtSAR(s.monthlyRevenue * 1.4), sub: 'liquid · operating' },
      { label: 'Bank Accounts',   value: p === 'hospital' ? '8' : p === 'pharmacy' ? '12' : '4', sub: 'SAR + USD + EUR' },
      { label: 'Reconciled',      value: '99.4%',                        sub: 'auto via SAMA feed' },
      { label: 'Next AP Payment', value: '2026-06-22',                   sub: 'SAR 184K to 14 vendors' },
    ],
    tableTitle: 'Bank Account Summary',
    table: {
      cols: ['Bank', 'Account', 'Currency', 'Balance', 'Last Reconciled'],
      rows: [
        ['Al Rajhi Bank',      'Operating ····7842', 'SAR', fmtSAR(s.monthlyRevenue * 0.8), '2026-06-15'],
        ['SABB',               'Payroll ····3201',    'SAR', fmtSAR(s.monthlyPayroll * 1.2), '2026-06-15'],
        ['Riyad Bank',         'Reserve ····5510',    'SAR', fmtSAR(s.monthlyRevenue * 2.0), '2026-06-14'],
        ['Saudi National Bank','USD Operations ····8801','USD', '$ 48,200', '2026-06-13'],
      ],
    },
  };
}

// ── Inventory ───────────────────────────────────────────────────────────────
function inventoryData(p: PersonaId): ModuleData {
  const s = SCALE[p];
  const items: Record<PersonaId, [string, string, string, string, string][]> = {
    hospital: [
      ['MED-001234', 'Amoxicillin 500mg Caps', 'Medication',     '2840 Caps',  'Main Pharmacy'],
      ['CON-001102', 'Surgical Gloves Sterile 7.5','Consumable', '1200 Pairs', 'OR Store'],
      ['VAC-000021', 'Pfizer COVID Vaccine',   'Vaccine',        '320 Vials',  'Cold Chain'],
      ['CON-004201', 'IV Cannula 18G',         'Consumable',     '4200 Pcs',   'Main Store'],
      ['IMG-008812', 'Iodixanol Contrast 320', 'Imaging Supply', '180 Vials',  'Radiology'],
    ],
    clinic: [
      ['DRG-001',    'Botox 100U',             'Aesthetic',      '24 Vials',  'Clinic Store'],
      ['DRG-002',    'HA Filler 1ml',          'Aesthetic',      '48 Syringes','Clinic Store'],
      ['CON-001',    'Microneedles 36-pin',    'Consumable',     '120 Pcs',   'Treatment Room'],
      ['CON-002',    'Numbing Cream 30g',      'Consumable',     '34 Tubes',  'Treatment Room'],
      ['CON-003',    'Gauze 4×4',              'Consumable',     '1800 Pcs',  'General'],
    ],
    pharmacy: [
      ['MED-001234', 'Amoxicillin 500mg Caps', 'Medication',     '2840 Caps',  'Main Branch'],
      ['MED-002891', 'Insulin Glargine 100U/ml','Medication',    '48 Pens',    'Riyadh-12'],
      ['MED-003456', 'Atorvastatin 20mg',      'Medication',     '1200 Tabs',  'Main Branch'],
      ['SUP-000418', 'Vitamin D3 5000IU',      'Supplement',     '840 Caps',   'Main Branch'],
      ['VAC-000021', 'Influenza Vaccine 2026', 'Vaccine',        '180 Vials',  'Cold Chain'],
    ],
    lab: [
      ['REA-001',    'Roche CK-MB Reagent',    'Chemistry',      '12 Kits',    'Lab Floor'],
      ['REA-002',    'Sysmex CBC Reagent Pack','Hematology',     '8 Packs',    'Lab Floor'],
      ['REA-003',    'BD BACTEC Bottles',      'Microbiology',   '320 Bottles','Micro'],
      ['CON-001',    'Vacutainer EDTA 4ml',    'Collection',     '2400 Tubes', 'Phleb Station'],
      ['CON-002',    'Pipette Tips 200μl',     'Consumable',     '8400 Pcs',   'Lab Floor'],
    ],
    radiology: [
      ['IMG-001',    'Iodixanol 320mg/ml',     'Contrast',       '180 Vials',  'CT Suite'],
      ['IMG-002',    'Gadobutrol 1.0M',        'MR Contrast',    '64 Vials',   'MR Suite'],
      ['CON-001',    'CT Power Injector Kit',  'Consumable',     '240 Kits',   'CT Suite'],
      ['CON-002',    'Lead Apron Protective',  'PPE',            '24 Pcs',     'All Areas'],
      ['CON-003',    'X-Ray Film 14×17',       'Imaging',        '480 Sheets', 'X-Ray Room'],
    ],
  };
  return {
    subtitle: `${fmtSAR(s.inventoryValue)} inventory value · FEFO enforcement · lot/batch tracking`,
    kpis: [
      { label: 'Total SKUs',      value: p === 'hospital' || p === 'pharmacy' ? '3,841' : '847', sub: 'active items' },
      { label: 'Inventory Value', value: fmtSAR(s.inventoryValue), sub: 'at cost' },
      { label: 'Near Expiry',     value: '47', sub: 'expires in 30 days' },
      { label: 'Stockouts',       value: '3',  sub: 'auto-PO triggered' },
    ],
    tableTitle: 'Stock Levels (sample)',
    table: {
      cols: ['SKU', 'Item', 'Category', 'On Hand', 'Location'],
      rows: items[p].map((r) => [r[0], r[1], r[2], r[3], r[4]]),
    },
  };
}

// ── Procurement ─────────────────────────────────────────────────────────────
function procurementData(p: PersonaId): ModuleData {
  const s = SCALE[p];
  return {
    subtitle: 'PR → PO → GRN · vendor scorecards · automated approvals',
    kpis: [
      { label: 'Open Requisitions', value: '18',                  sub: 'awaiting approval' },
      { label: 'Active POs',        value: '34',                  sub: `${fmtSAR(s.monthlyRevenue * 0.18)} value` },
      { label: 'Active Vendors',    value: String(s.vendorCount), sub: 'qualified suppliers' },
      { label: 'Avg Lead Time',     value: '4.2 days',            sub: 'top suppliers' },
    ],
    tableTitle: 'Purchase Orders',
    table: {
      cols: ['PO #', 'Vendor', 'Items', 'Total', 'Delivery', 'Status'],
      rows: [
        ['PO-2026-XX1', 'Al-Dawaa Medical Supplies', '6',  'SAR 97,175',  '2026-06-18', { badge: 'SENT' }],
        ['PO-2026-XX2', 'IQVIA Arabia',              '12', 'SAR 241,500', '2026-06-20', { badge: 'APPROVED' }],
        ['PO-2026-XX3', 'Integrated Gulf Biosystems','4',  'SAR 36,800',  '2026-06-17', { badge: 'PARTIAL' }],
        ['PO-2026-XX4', 'Roche Diagnostics ME',      '8',  'SAR 184,400', '2026-06-22', { badge: 'SENT' }],
        ['PO-2026-XX5', 'GE Healthcare KSA',         '3',  'SAR 412,000', '2026-07-01', { badge: 'APPROVED' }],
      ],
    },
  };
}

// ── Assets ──────────────────────────────────────────────────────────────────
function assetsData(p: PersonaId): ModuleData {
  const s = SCALE[p];
  const items: Record<PersonaId, [string, string, string, string, string, string][]> = {
    hospital: [
      ['AST-00142', 'Siemens SOMATOM Definition CT', 'Imaging',       'SAR 4,200,000', 'SAR 2,940,000', 'In Service'],
      ['AST-00089', 'Philips IntelliVue MX800',      'Monitoring',    'SAR 85,000',    'SAR 42,500',    'In Service'],
      ['AST-00231', 'GE CARESCAPE R860 Ventilator',  'Life Support',  'SAR 320,000',   'SAR 224,000',   'Maintenance'],
      ['AST-00301', 'Roche Cobas 8000 Analyzer',     'Lab Equipment', 'SAR 1,800,000', 'SAR 1,440,000', 'In Service'],
      ['AST-00412', 'Olympus Endoscopy Tower',       'Surgical',      'SAR 650,000',   'SAR 520,000',   'In Service'],
    ],
    clinic: [
      ['AST-001',   'Aesthetic Laser (Cynosure)',     'Treatment',     'SAR 320,000',   'SAR 224,000',   'In Service'],
      ['AST-002',   'Dermatology Microscope',         'Examination',   'SAR  48,000',   'SAR  38,400',   'In Service'],
      ['AST-003',   'Treatment Couches (×4)',         'Furniture',     'SAR  18,000',   'SAR  10,800',   'In Service'],
      ['AST-004',   'Reception Workstations',         'IT',            'SAR  24,000',   'SAR  12,000',   'In Service'],
      ['AST-005',   'POS Terminal',                   'IT',            'SAR   4,200',   'SAR   2,940',   'In Service'],
    ],
    pharmacy: [
      ['AST-001',   'POS Workstations (×64)',         'IT',            'SAR 384,000',   'SAR 230,400',   'In Service'],
      ['AST-002',   'Refrigerator Cold Chain (×32)',  'Storage',       'SAR 480,000',   'SAR 336,000',   'In Service'],
      ['AST-003',   'Barcode Scanners (×128)',        'IT',            'SAR  64,000',   'SAR  38,400',   'In Service'],
      ['AST-004',   'Compounding Hood (×8)',          'Lab',           'SAR 264,000',   'SAR 184,800',   'In Service'],
      ['AST-005',   'Delivery Vans (×12)',            'Logistics',     'SAR 1,800,000', 'SAR 1,080,000', 'In Service'],
    ],
    lab: [
      ['AST-001',   'Roche Cobas 8000 c702',          'Chemistry',     'SAR 4,800,000', 'SAR 3,840,000', 'In Service'],
      ['AST-002',   'Sysmex XN-1000 CBC',             'Hematology',    'SAR 1,200,000', 'SAR 960,000',   'In Service'],
      ['AST-003',   'Abbott Architect i2000',         'Immunoassay',   'SAR 2,100,000', 'SAR 1,680,000', 'In Service'],
      ['AST-004',   'BD BACTEC FX40',                 'Microbiology',  'SAR 420,000',   'SAR 336,000',   'In Service'],
      ['AST-005',   'BD MAX Molecular',               'Molecular',     'SAR 680,000',   'SAR 544,000',   'Maintenance'],
    ],
    radiology: [
      ['AST-001',   'GE Signa Premier 3T MRI',        'Imaging',       'SAR 12,400,000','SAR 9,920,000', 'In Service'],
      ['AST-002',   'Siemens SOMATOM Definition CT',  'Imaging',       'SAR 4,200,000', 'SAR 2,940,000', 'In Service'],
      ['AST-003',   'Carestream X-Ray DRX',           'Imaging',       'SAR 840,000',   'SAR 588,000',   'In Service'],
      ['AST-004',   'Mindray DC-80 Ultrasound',       'Imaging',       'SAR 320,000',   'SAR 224,000',   'In Service'],
      ['AST-005',   'GE Senographe Pristina Mammo',   'Imaging',       'SAR 1,400,000', 'SAR 1,120,000', 'In Service'],
    ],
  };
  return {
    subtitle: `${fmtSAR(s.assetValue)} asset register · depreciation · maintenance contracts · ${p === 'radiology' ? 'AERB licensing' : 'JCI compliance'}`,
    kpis: [
      { label: 'Total Assets',      value: p === 'hospital' ? '1,284' : '147', sub: 'registered' },
      { label: 'Total Cost',        value: fmtSAR(s.assetValue),               sub: 'original purchase' },
      { label: 'Net Book Value',    value: fmtSAR(s.assetValue * 0.7),         sub: 'after depreciation' },
      { label: 'Maintenance Due',   value: '14',                               sub: 'within 30 days' },
    ],
    tableTitle: 'Asset Register (Top 5 by Value)',
    table: {
      cols: ['Tag', 'Asset', 'Category', 'Cost', 'Book Value', 'Status'],
      rows: items[p].map((r) => [r[0], r[1], r[2], r[3], r[4], { badge: r[5] }]),
    },
  };
}

// ── POS Front Desk (ERP) ────────────────────────────────────────────────────
function posErpData(p: PersonaId): ModuleData {
  const labels: Record<PersonaId, { name: string; sample: [string, string, string, string][] }> = {
    hospital: {
      name: 'Front-Desk Payments & Cafeteria',
      sample: [
        ['11:42', 'Cafeteria — meal × 14',         'SAR 168', 'Cash'],
        ['11:38', 'Gift Shop — flowers + card',    'SAR  84', 'Card'],
        ['11:35', 'Visitor parking validation',    'SAR  15', 'Cash'],
      ],
    },
    clinic: {
      name: 'Reception Payments',
      sample: [
        ['11:42', 'Cash co-pay — Norah Al-Ahmadi', 'SAR  60', 'Cash'],
        ['11:38', 'Skincare product (retail)',     'SAR 280', 'Card'],
        ['11:35', 'Membership renewal',            'SAR 600', 'Card'],
      ],
    },
    pharmacy: {
      name: 'POS Front Desk',
      sample: [
        ['11:42', 'OTC: Panadol + cough syrup',    'SAR  42', 'Cash'],
        ['11:38', 'Cosmetics: 3 items',            'SAR 184', 'Card'],
        ['11:35', 'Baby formula 900g × 2',         'SAR 268', 'BUPA'],
      ],
    },
    lab: {
      name: 'Direct Patient POS',
      sample: [
        ['11:42', 'CBC + lipid panel (walk-in)',   'SAR 240', 'Cash'],
        ['11:38', 'HbA1c + TSH (walk-in)',         'SAR 320', 'Card'],
        ['11:35', 'Pre-employment package',        'SAR 420', 'Corp'],
      ],
    },
    radiology: {
      name: 'Walk-In Patient POS',
      sample: [
        ['11:42', 'CXR PA/Lat (walk-in)',          'SAR 180', 'Cash'],
        ['11:38', 'CT brain non-contrast',         'SAR 920', 'BUPA'],
        ['11:35', 'Ultrasound abdomen',            'SAR 320', 'Cash'],
      ],
    },
  };
  const { name, sample } = labels[p];
  return {
    subtitle: `${name} · cash drawer reconciliation · ZATCA each receipt`,
    kpis: [
      { label: 'Sales Today',     value: 'SAR 14,200',  sub: '147 transactions' },
      { label: 'Avg Ticket',      value: 'SAR 96.50',   sub: '↑ 12% vs avg' },
      { label: 'Card vs Cash',    value: '68 / 32',     sub: '% of transactions' },
      { label: 'Refunds',         value: '2',           sub: 'both approved by manager' },
    ],
    tableTitle: 'Recent Transactions',
    table: {
      cols: ['Time', 'Items', 'Amount', 'Method'],
      rows: sample.map((r) => [r[0], r[1], r[2], r[3]]),
    },
  };
}

// ── CRM ─────────────────────────────────────────────────────────────────────
function crmData(p: PersonaId): ModuleData {
  const labels: Record<PersonaId, string> = {
    hospital: 'Patient relations · referring physicians · corporate accounts · loyalty',
    clinic: 'Patient lifecycle · loyalty program · referral tracking · birthday campaigns',
    pharmacy: 'Loyalty program · prescription refill reminders · upsell opportunities',
    lab: 'Referring physician relationships · corporate accounts · ad-hoc clients',
    radiology: 'Referring physicians · teleradiology partners · hospital contracts',
  };
  return {
    subtitle: labels[p],
    kpis: [
      { label: 'Active Contacts',  value: p === 'hospital' ? '24,802' : p === 'pharmacy' ? '184,012' : '4,841', sub: 'in CRM' },
      { label: 'NPS Score',        value: '72',  sub: 'industry avg: 38' },
      { label: 'Active Opportunities', value: '34', sub: p === 'lab' || p === 'radiology' ? 'corporate deals' : 'in pipeline' },
      { label: 'Retention Rate',   value: '94%', sub: 'YoY' },
    ],
    tableTitle: 'Active Opportunities',
    table: {
      cols: ['Account', 'Type', 'Expected Revenue', 'Probability', 'Owner'],
      rows: [
        ['Saudi Aramco Corporate Wellness',  'Corporate Contract',   'SAR 4.8M / yr', '75%', 'Sales Lead'],
        ['Mouwasat Hospital Group',          'Referral Partnership', 'SAR 2.4M / yr', '60%', 'BD Manager'],
        ['Almarai Employee Benefits',        'Corporate Account',    'SAR 1.2M / yr', '40%', 'Sales Lead'],
        ['Ministry of Health Tender',        'RFP',                  'SAR 12M total','30%', 'Executive'],
      ],
    },
  };
}

// ── Marketing ───────────────────────────────────────────────────────────────
function marketingData(p: PersonaId): ModuleData {
  return {
    subtitle: 'Campaigns · email · SMS · social · ROI tracking',
    kpis: [
      { label: 'Active Campaigns', value: '8',  sub: 'across channels' },
      { label: 'SMS Sent Today',   value: '4,200', sub: 'reminders + promos' },
      { label: 'Open Rate (email)',value: '34%',sub: 'industry: 21%' },
      { label: 'Campaign ROI',     value: '4.2x',sub: 'last 90 days' },
    ],
    tableTitle: 'Active Campaigns',
    table: {
      cols: ['Campaign', 'Channel', 'Audience', 'Sent', 'Conversions'],
      rows: [
        ['Annual checkup reminder',  'SMS + Email', 'All patients due', '4,200', '684 (16%)'],
        ['Ramadan healthy living',   'Social + Email','Diabetic patients','2,400','318 (13%)'],
        ['Corporate wellness pkg',   'B2B email',   'HR directors',     '320',   '22 deals'],
        ['New service: Genomics',    'Email',       'Premium members',  '840',   '47 (6%)'],
      ],
    },
  };
}

// ── Reporting ───────────────────────────────────────────────────────────────
function reportingData(p: PersonaId): ModuleData {
  const s = SCALE[p];
  return {
    subtitle: 'Operational · financial · clinical · regulatory reports',
    kpis: [
      { label: 'Reports Generated', value: '184', sub: 'this month' },
      { label: 'Scheduled Reports', value: '32',  sub: 'auto-emailed' },
      { label: 'Custom Dashboards', value: '14',  sub: 'role-based' },
      { label: 'Export Formats',    value: '6',   sub: 'PDF · XLSX · CSV · JSON · BI · API' },
    ],
    tableTitle: 'Available Reports',
    table: {
      cols: ['Report', 'Category', 'Frequency', 'Last Run'],
      rows: [
        ['Monthly P&L Statement',      'Finance',    'Monthly',  '2026-06-01'],
        ['Trial Balance (IFRS)',       'Finance',    'Monthly',  '2026-06-01'],
        ['ZATCA E-Invoicing Summary',  'Compliance', 'Daily',    '2026-06-17'],
        ['NPHIES Claims Aging',        'Revenue',    'Weekly',   '2026-06-14'],
        ['Payroll & GOSI Summary',     'HR',         'Monthly',  '2026-06-01'],
        ['Inventory Movement',         'Operations', 'Weekly',   '2026-06-14'],
        ['Staff Productivity',         'HR',         'Monthly',  '2026-06-01'],
        ['Asset Depreciation Schedule','Finance',    'Monthly',  '2026-06-01'],
      ],
    },
  };
}

// ── Supply Chain Dashboard ──────────────────────────────────────────────────
function supplyDashboardData(p: PersonaId): ModuleData {
  const s = SCALE[p];
  return {
    subtitle: 'Inventory value · stock aging · vendor performance · forecast accuracy',
    kpis: [
      { label: 'Total Inventory Value',  value: fmtSAR(s.inventoryValue), sub: 'at cost · all locations' },
      { label: 'Stock at Risk',          value: fmtSAR(s.inventoryValue * 0.06), sub: 'aged > 180 days' },
      { label: 'Expiring < 90 days',     value: '47 SKUs', sub: fmtSAR(s.inventoryValue * 0.04) + ' value' },
      { label: 'Active Stockouts',       value: '3',  sub: 'auto-PO triggered' },
      { label: 'Inventory Turnover',     value: '8.4x',sub: 'annualized · industry: 6.2x' },
      { label: 'Carrying Cost MTD',      value: fmtSAR(s.inventoryValue * 0.025), sub: '~2.5% holding rate' },
      { label: 'Vendor Performance Avg', value: '94%',sub: 'OTIF score' },
      { label: 'AI Forecast Accuracy',   value: '91%',sub: 'rolling 30 days' },
    ],
    tableTitle: 'Top Vendors (Performance Scorecard)',
    table: {
      cols: ['Vendor', 'Open POs', 'OTIF %', 'Quality %', 'Score', 'Grade'],
      rows: [
        ['Al-Dawaa Medical Supplies', '14', '98%', '99%', '4.8', { badge: 'A' }],
        ['IQVIA Arabia',              '8',  '94%', '97%', '4.6', { badge: 'A' }],
        ['Integrated Gulf Biosystems','4',  '88%', '94%', '4.2', { badge: 'B' }],
        ['Roche Diagnostics ME',      '6',  '99%', '100%','4.9', { badge: 'A+' }],
        ['GE Healthcare KSA',         '3',  '92%', '98%', '4.5', { badge: 'A' }],
      ],
    },
  };
}

// ── Master export ───────────────────────────────────────────────────────────
export function getERPData(persona: PersonaId, moduleId: string): ModuleData | null {
  const handlers: Record<string, (p: PersonaId) => ModuleData> = {
    hr:            hrData,
    attendance:    attendanceData,
    time_off:      timeOffData,
    payroll:       payrollData,
    recruitment:   recruitmentData,
    accounting:    accountingData,
    billing:       billingData,
    expenses:      expensesData,
    banking:       bankingData,
    inventory_mgmt:inventoryData,
    procurement:   procurementData,
    assets:        assetsData,
    pos_erp:       posErpData,
    crm:           crmData,
    marketing:     marketingData,
    reporting:     reportingData,
    supply_dashboard: supplyDashboardData,
  };
  return handlers[moduleId]?.(persona) ?? null;
}
