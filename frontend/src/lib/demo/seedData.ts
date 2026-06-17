/**
 * CyMed demo seed data — per persona × module.
 *
 * Each entry produces a realistic, sales-ready view:
 *  - subtitle: tagline for the page
 *  - kpis: 2-4 metric cards in the header
 *  - table: a list view of typical operational data
 *
 * Numbers are illustrative but plausible for Saudi healthcare scale.
 */

export interface ModuleData {
  subtitle?: string;
  kpis?: { label: string; value: string; sub?: string }[];
  tableTitle?: string;
  table?: {
    cols: string[];
    rows: (string | number | { badge: string })[][];
  };
}

type SeedShape = Record<string, Record<string, ModuleData>>;

export const DEMO_DATA: SeedShape = {

  // ── HOSPITAL ──────────────────────────────────────────────────────────────
  hospital: {
    command_center: {
      subtitle: 'Real-time operations across all departments · Updated 30 sec ago',
      kpis: [
        { label: 'Bed Occupancy',    value: '87%',     sub: '174 of 200 beds' },
        { label: 'Revenue Today',    value: 'SAR 412K', sub: '+18% vs avg' },
        { label: 'Staff on Duty',    value: '284',     sub: '24 doctors · 142 nurses · 118 others' },
        { label: 'STAT Alerts',      value: '3',       sub: 'ER · ICU · Labor' },
      ],
      tableTitle: 'Department Status (Live)',
      table: {
        cols: ['Department', 'Census', 'Capacity', 'Wait Time', 'Status'],
        rows: [
          ['Emergency Room',           18, 24, '12 min',  { badge: 'BUSY' }],
          ['ICU',                      14, 16, '—',       { badge: 'NEAR CAP' }],
          ['Cardiology Ward',          22, 30, '—',       { badge: 'NORMAL' }],
          ['Internal Medicine',        38, 44, '—',       { badge: 'NORMAL' }],
          ['Surgery (active OR)',       6,  8, 'next 14:30',{ badge: 'ON SCHED' }],
          ['Maternity',                12, 14, '—',       { badge: 'NEAR CAP' }],
          ['Pediatrics',               19, 25, '—',       { badge: 'NORMAL' }],
        ],
      },
    },
    admission: {
      subtitle: '5 patients in triage · 2 waiting for bed assignment',
      kpis: [
        { label: 'Admitted Today', value: '23', sub: 'avg time ER→bed: 47 min' },
        { label: 'In Triage Now',  value: '5',  sub: '2 ESI-1 · 2 ESI-2 · 1 ESI-3' },
        { label: 'Pending Bed',    value: '2',  sub: 'awaiting room ready' },
        { label: 'Avg LOS',        value: '4.2 days', sub: 'med-surg' },
      ],
      tableTitle: 'Active Admissions',
      table: {
        cols: ['Patient', 'MRN', 'Chief Complaint', 'Triage', 'Bed', 'Status'],
        rows: [
          ['Ahmed Al-Rashid',     'P-2026-08471', 'Chest pain, dyspnea',     'ESI-1', 'ICU-4', { badge: 'ADMITTED' }],
          ['Fatima Al-Zahra',     'P-2026-08472', 'Fever, productive cough', 'ESI-3', 'Med-12', { badge: 'ADMITTED' }],
          ['Khalid Al-Otaibi',    'P-2026-08473', 'Post-op review',          'ESI-4', 'Surg-3', { badge: 'STABLE' }],
          ['Sara Al-Ghamdi',      'P-2026-08474', 'Headache, altered MS',   'ESI-2', '—',     { badge: 'AWAITING BED' }],
          ['Mohammed Al-Harbi',   'P-2026-08475', 'Trauma — RTA',            'ESI-1', 'ER-Trauma1',{ badge: 'IN ER' }],
        ],
      },
    },
    bed_board: {
      subtitle: 'Live bed availability across all wards',
      kpis: [
        { label: 'Total Beds',    value: '200', sub: '174 occupied / 26 free' },
        { label: 'Available Now', value: '26',  sub: 'Med-Surg 14 · ICU 2 · others 10' },
        { label: 'Cleaning',      value: '8',   sub: 'avg cleanup: 38 min' },
        { label: 'Discharges Today', value: '17', sub: 'beds freeing up' },
      ],
      tableTitle: 'Bed Status by Ward',
      table: {
        cols: ['Ward', 'Beds', 'Occupied', 'Available', 'Cleaning', 'Status'],
        rows: [
          ['ICU',              16, 14, 2, 0, { badge: 'NEAR CAP' }],
          ['CCU',              12,  9, 2, 1, { badge: 'NORMAL' }],
          ['Med-Surg A',       44, 38, 4, 2, { badge: 'NORMAL' }],
          ['Med-Surg B',       44, 36, 6, 2, { badge: 'NORMAL' }],
          ['Maternity',        14, 12, 1, 1, { badge: 'NEAR CAP' }],
          ['Pediatrics',       25, 19, 5, 1, { badge: 'NORMAL' }],
          ['Surgical Recovery', 8,  6, 2, 0, { badge: 'NORMAL' }],
        ],
      },
    },
    doctor: {
      subtitle: 'Dr. Khalid Al-Otaibi · Internal Medicine · 14 patients on service',
      kpis: [
        { label: 'My Patients', value: '14', sub: '6 admitted · 8 outpatient' },
        { label: 'Pending Orders', value: '4', sub: '2 lab · 1 rad · 1 Rx' },
        { label: 'Notes Due',   value: '3',  sub: 'before EOD' },
        { label: 'Avg Read Time', value: '6m 12s', sub: 'per chart' },
      ],
      tableTitle: 'My Patient List (Today)',
      table: {
        cols: ['Patient', 'Room', 'Reason', 'Last Note', 'Pending'],
        rows: [
          ['Ahmed Al-Rashid', 'ICU-4',  'Acute MI · post-PCI',    '2h ago', { badge: 'TROP @ 4h' }],
          ['Fatima Al-Zahra', 'Med-12', 'CAP · COPD exacerbation','5h ago', { badge: 'ABG' }],
          ['Hala Al-Saud',    'Med-18', 'CHF · vol overload',     '1d ago', { badge: 'NOTE DUE' }],
          ['Omar Al-Mansour', 'Med-23', 'Type 2 DM · DKA',        '8h ago', { badge: 'NOTE DUE' }],
        ],
      },
    },
    billing: {
      subtitle: 'Revenue cycle · NPHIES claims · ZATCA e-invoicing',
      kpis: [
        { label: 'Today\'s Charges', value: 'SAR 412K', sub: '147 invoices' },
        { label: 'Pending Claims',   value: '83',      sub: 'SAR 1.2M in flight' },
        { label: 'Denials This Wk',  value: '4',       sub: '2.7% rate · best in network' },
        { label: 'Avg DSO',          value: '23 days', sub: 'down from 47' },
      ],
      tableTitle: 'Recent Invoices',
      table: {
        cols: ['Invoice', 'Patient', 'Service', 'Amount', 'Payer', 'Status'],
        rows: [
          ['INV-2026-22841', 'Ahmed Al-Rashid', 'ICU + PCI',       'SAR 84,200', 'BUPA',     { badge: 'CLAIM SUBMITTED' }],
          ['INV-2026-22842', 'Fatima Al-Zahra', 'Admit + Labs',    'SAR 12,400', 'Tawuniya', { badge: 'CLAIM SUBMITTED' }],
          ['INV-2026-22843', 'Khalid Al-Otaibi','Post-op visit',   'SAR    450', 'Self-pay', { badge: 'PAID' }],
          ['INV-2026-22844', 'Sara Al-Ghamdi',  'CT head + admit', 'SAR  6,800', 'MedGulf',  { badge: 'PRE-AUTH' }],
        ],
      },
    },
  },

  // ── CLINIC ────────────────────────────────────────────────────────────────
  clinic: {
    calendar: {
      subtitle: 'Today, June 17 · 12 appointments · 1 no-show · 4 walk-ins',
      kpis: [
        { label: 'Today\'s Appointments', value: '12', sub: '8 done · 3 upcoming · 1 no-show' },
        { label: 'Avg Wait Time',         value: '6 min', sub: 'industry avg: 22 min' },
        { label: 'Today\'s Revenue',      value: 'SAR 14,200', sub: '4 cash · 5 insurance · 3 corporate' },
        { label: 'No-Show Rate',          value: '4.2%',  sub: 'SMS reminders enabled' },
      ],
      tableTitle: 'Today\'s Schedule',
      table: {
        cols: ['Time', 'Patient', 'Reason', 'Type', 'Status'],
        rows: [
          ['09:00', 'Norah Al-Ahmadi',  'Follow-up · acne',          'Insurance', { badge: 'DONE' }],
          ['09:30', 'Yousef Al-Shehri', 'Initial consult',           'Cash',      { badge: 'DONE' }],
          ['10:00', 'Lina Al-Ghamdi',   'Mole biopsy result',        'Insurance', { badge: 'DONE' }],
          ['10:30', 'Mohammed Al-Saud', 'Cosmetic consult',          'Cash',      { badge: 'IN ROOM' }],
          ['11:00', '(walk-in)',        'Rash, itching',             '—',         { badge: 'WAITING' }],
          ['11:30', 'Aisha Al-Otaibi',  'Acne follow-up',            'Insurance', { badge: 'UPCOMING' }],
          ['12:00', 'Hassan Al-Mansour','Botox follow-up',           'Cash',      { badge: 'UPCOMING' }],
        ],
      },
    },
    reception: {
      subtitle: 'Quick check-in · insurance verified in real-time',
      kpis: [
        { label: 'Checked-In Today', value: '8', sub: 'avg time: 1m 47s' },
        { label: 'Waiting Now',      value: '2', sub: 'longest wait: 4 min' },
        { label: 'Insurance Verified', value: '7/8', sub: '1 pending response' },
        { label: 'Walk-Ins',         value: '3',  sub: 'all accommodated' },
      ],
      tableTitle: 'Reception Queue',
      table: {
        cols: ['Patient', 'Appt Time', 'Type', 'Insurance', 'Status'],
        rows: [
          ['Walk-in',          'now',  'Walk-in', '—',           { badge: 'INTAKE' }],
          ['Aisha Al-Otaibi',  '11:30','Scheduled','BUPA — VERIFIED', { badge: 'CHECK-IN' }],
          ['Hassan Al-Mansour','12:00','Scheduled','Self-pay',    { badge: 'WAITING' }],
        ],
      },
    },
    doctor: {
      subtitle: 'Dr. Fatima Al-Zahra · Dermatology · Quick Consultation View',
      kpis: [
        { label: 'Patients Seen Today', value: '8',   sub: 'avg consult: 11 min' },
        { label: 'Avg per Day (mo)',    value: '24',  sub: '+38% vs last clinic' },
        { label: 'Patient Satisfaction',value: '4.9',  sub: '/ 5.0 (47 reviews)' },
        { label: 'Re-Visit Rate',       value: '68%', sub: 'follow-ups booked' },
      ],
      tableTitle: 'Current Patient',
      table: {
        cols: ['Field', 'Value'],
        rows: [
          ['Patient',         'Mohammed Al-Saud · M · 34 yrs'],
          ['Chief Complaint', 'Cosmetic consultation — fine lines, dynamic wrinkles'],
          ['Allergies',       'NKDA'],
          ['Prior visits',    '2 (botox 6 mo ago, filler 3 mo ago)'],
          ['Vitals (today)',  'BP 124/78 · HR 72 · Wt 78 kg'],
          ['Plan',            'Botox 30 units glabellar + forehead · F/U in 2 wk'],
          ['Invoice draft',   'SAR 1,800 (cash) — generate'],
        ],
      },
    },
    billing: {
      subtitle: 'ZATCA-compliant invoices · QR generated automatically',
      kpis: [
        { label: 'Today\'s Revenue', value: 'SAR 14,200', sub: '11 invoices' },
        { label: 'Month-to-Date',    value: 'SAR 287K',   sub: 'on track for SAR 410K' },
        { label: 'Cash %',           value: '34%',        sub: 'insurance 51% · corp 15%' },
        { label: 'ZATCA Submitted',  value: '11/11',      sub: '100% real-time' },
      ],
      tableTitle: 'Today\'s Invoices',
      table: {
        cols: ['Invoice', 'Patient', 'Amount', 'Method', 'ZATCA'],
        rows: [
          ['INV-2026-A4471', 'Norah Al-Ahmadi',  'SAR 380',   'BUPA',     { badge: 'ZATCA OK' }],
          ['INV-2026-A4472', 'Yousef Al-Shehri', 'SAR 600',   'Cash',     { badge: 'ZATCA OK' }],
          ['INV-2026-A4473', 'Lina Al-Ghamdi',   'SAR 1,200', 'Tawuniya', { badge: 'ZATCA OK' }],
          ['INV-2026-A4474', 'Mohammed Al-Saud', 'SAR 1,800', 'Cash',     { badge: 'DRAFT' }],
        ],
      },
    },
  },

  // ── PHARMACY ──────────────────────────────────────────────────────────────
  pharmacy: {
    pos: {
      subtitle: 'Active POS · barcode scan to invoice in <30 sec',
      kpis: [
        { label: 'Sales Today',       value: 'SAR 24,800', sub: '147 transactions' },
        { label: 'Avg Basket',        value: 'SAR 168',    sub: '+12% vs last week' },
        { label: 'Insurance Approval',value: '99.4%',      sub: 'NPHIES real-time' },
        { label: 'Avg Dispense Time', value: '23 sec',     sub: 'per Rx' },
      ],
      tableTitle: 'Recent Transactions',
      table: {
        cols: ['Time', 'Items', 'Total', 'Payment', 'Status'],
        rows: [
          ['11:42', 'Augmentin 625mg ×21, Brufen 400mg ×10', 'SAR 87.50',  'BUPA',     { badge: 'APPROVED' }],
          ['11:38', 'Lantus 100U/ml, BD needles ×100',       'SAR 412.00', 'Tawuniya', { badge: 'APPROVED' }],
          ['11:35', 'Panadol Extra ×24',                      'SAR  18.50', 'Cash',     { badge: 'PAID' }],
          ['11:31', 'Concor 5mg ×30, Crestor 20mg ×30',       'SAR 198.00', 'BUPA',     { badge: 'APPROVED' }],
          ['11:27', 'Insulin pen needles, glucometer strips', 'SAR 156.00', 'MedGulf',  { badge: 'APPROVED' }],
        ],
      },
    },
    inventory_mgmt: {
      subtitle: 'Live stock by batch · FEFO picking enforced',
      kpis: [
        { label: 'Total SKUs',     value: '3,841', sub: 'across 32 branches' },
        { label: 'Near Expiry',    value: '47',    sub: 'expires in 30 days' },
        { label: 'Stockouts',      value: '3',     sub: 'auto-PO triggered' },
        { label: 'Inventory Value',value: 'SAR 8.4M', sub: 'at cost' },
      ],
      tableTitle: 'Stock Levels (Main Pharmacy)',
      table: {
        cols: ['SKU', 'Drug', 'Qty', 'Earliest Expiry', 'Status'],
        rows: [
          ['MED-001234', 'Amoxicillin 500mg', 2840, '2027-03-01', { badge: 'OK' }],
          ['MED-002891', 'Insulin Glargine 100U/ml',  48, '2026-08-15', { badge: 'LOW' }],
          ['MED-003456', 'Atorvastatin 20mg', 1200, '2027-09-01', { badge: 'OK' }],
          ['VAC-000021', 'Pfizer COVID Vaccine',  0, '2026-09-01', { badge: 'STOCKOUT' }],
          ['REA-003312', 'Insulin Lispro',        84, '2026-07-01', { badge: 'NEAR EXPIRY' }],
        ],
      },
    },
    compounding: {
      subtitle: 'Recipe-based · batch records · sterility tracking',
      kpis: [
        { label: 'Active Compounds', value: '8', sub: '5 sterile · 3 non-sterile' },
        { label: 'Today\'s Batches', value: '17', sub: '11 done · 6 in-progress' },
        { label: 'Avg Prep Time',    value: '12 min', sub: 'per batch' },
        { label: 'Failed QC',        value: '0', sub: 'zero rejections this month' },
      ],
      tableTitle: 'Active Compounds Today',
      table: {
        cols: ['Batch', 'Recipe', 'Patient', 'Type', 'Status'],
        rows: [
          ['CMP-2026-1247', 'TPN 2400 kcal',           'NICU-2',    'Sterile',     { badge: 'READY' }],
          ['CMP-2026-1248', 'Vancomycin 1g IV',         'Ward-Med8', 'Sterile',     { badge: 'PREPARING' }],
          ['CMP-2026-1249', 'Triamcinolone cream 0.1%', 'OPD-Derm',  'Non-sterile', { badge: 'READY' }],
          ['CMP-2026-1250', 'Levothyroxine 75mcg susp', 'Peds-12',   'Non-sterile', { badge: 'PREPARING' }],
        ],
      },
    },
    insurance: {
      subtitle: 'NPHIES real-time eligibility + claim submission',
      kpis: [
        { label: 'Claims Today',     value: '127',   sub: 'SAR 89,200' },
        { label: 'Approval Rate',    value: '99.4%', sub: 'best in network' },
        { label: 'Avg Response Time',value: '1.2 sec', sub: 'NPHIES SLA: 5 sec' },
        { label: 'Pending Resubmit', value: '3',     sub: 'all <SAR 200' },
      ],
      tableTitle: 'Live Claim Activity',
      table: {
        cols: ['Time', 'Patient', 'Payer', 'Amount', 'Decision'],
        rows: [
          ['11:43:21', 'Norah Al-Ahmadi',  'BUPA',     'SAR  87.50', { badge: 'APPROVED' }],
          ['11:42:18', 'Khalid Al-Otaibi', 'Tawuniya', 'SAR 412.00', { badge: 'APPROVED' }],
          ['11:40:55', 'Aisha Al-Saud',    'MedGulf',  'SAR 198.00', { badge: 'APPROVED' }],
          ['11:39:12', 'Mohammed Al-Harbi','BUPA',     'SAR  64.00', { badge: 'DENIED · CODING' }],
        ],
      },
    },
  },

  // ── LAB ───────────────────────────────────────────────────────────────────
  lab: {
    laboratory: {
      subtitle: 'Sample queue · 87 active · 23 STAT',
      kpis: [
        { label: 'Active Samples',  value: '87',  sub: '23 STAT · 41 routine · 23 outpatient' },
        { label: 'Avg TAT (STAT)',  value: '1 h 23 m', sub: 'target: <2 h' },
        { label: 'Auto-Verified',   value: '94%', sub: 'tech reviews 6% only' },
        { label: 'Critical Values', value: '2',   sub: 'all phoned within 10 min' },
      ],
      tableTitle: 'Sample Queue',
      table: {
        cols: ['Accession', 'Patient', 'Test Panel', 'Priority', 'Status'],
        rows: [
          ['LAB-2026-94871', 'Ahmed Al-Rashid',  'Troponin, CK-MB, BNP', 'STAT', { badge: 'AUTO-VERIFIED' }],
          ['LAB-2026-94872', 'Fatima Al-Zahra',  'CBC, CRP, blood cult.','STAT', { badge: 'IN PROCESS' }],
          ['LAB-2026-94873', 'Sara Al-Ghamdi',   'BMP, lipid, HbA1c',    'ROUTINE', { badge: 'AUTO-VERIFIED' }],
          ['LAB-2026-94874', 'Khalid Al-Otaibi', 'PT, aPTT, INR',        'ROUTINE', { badge: 'ON ANALYZER' }],
          ['LAB-2026-94875', 'Norah Al-Ahmadi',  'TSH, T3, T4',          'OUTPATIENT', { badge: 'IN PROCESS' }],
        ],
      },
    },
    autoverify: {
      subtitle: 'Rule-based auto-release · delta checks · Westgard',
      kpis: [
        { label: 'Auto-Verified Today', value: '847', sub: '94% of total' },
        { label: 'Flagged for Review',  value: '54',  sub: '6% sent to tech queue' },
        { label: 'Critical Released',   value: '12',  sub: 'all flagged automatically' },
        { label: 'Rule Hits',           value: '237', sub: 'delta-check 91 · range 146' },
      ],
      tableTitle: 'Auto-Verification Activity',
      table: {
        cols: ['Time', 'Sample', 'Analyte', 'Value', 'Decision'],
        rows: [
          ['11:42', 'LAB-94871', 'Troponin I',      '12.4 ng/L',      { badge: 'AUTO-RELEASE' }],
          ['11:42', 'LAB-94871', 'CK-MB',            '4.2 ng/mL',      { badge: 'AUTO-RELEASE' }],
          ['11:41', 'LAB-94870', 'Potassium',        '6.8 mmol/L · CRIT', { badge: 'CRITICAL · PHONED' }],
          ['11:40', 'LAB-94869', 'WBC',              '32.4 ×10⁹/L',    { badge: 'DELTA CHECK FAIL' }],
          ['11:39', 'LAB-94868', 'HbA1c',            '7.2%',           { badge: 'AUTO-RELEASE' }],
        ],
      },
    },
    microbiology: {
      subtitle: 'Culture · growth · ID · AST workflow',
      kpis: [
        { label: 'Active Cultures',  value: '142', sub: 'blood · urine · sputum · CSF' },
        { label: 'Growth Today',     value: '34',  sub: 'avg time to positive: 18 h' },
        { label: 'Sensitivities Done', value: '21', sub: 'MIC + Vitek' },
        { label: 'Critical Organisms', value: '3', sub: 'phoned within 1 h' },
      ],
      tableTitle: 'Active Cultures',
      table: {
        cols: ['Sample', 'Patient', 'Source', 'Day', 'Status'],
        rows: [
          ['MIC-2026-3401', 'Ahmed Al-Rashid',  'Blood (×2 bottles)', 'D3', { badge: 'POS · S. aureus · MIC' }],
          ['MIC-2026-3402', 'Fatima Al-Zahra',  'Sputum',             'D2', { badge: 'POS · K. pneumoniae' }],
          ['MIC-2026-3403', 'Hala Al-Saud',     'Urine',              'D2', { badge: 'POS · E. coli · AST' }],
          ['MIC-2026-3404', 'Khalid Al-Otaibi', 'Wound',              'D1', { badge: 'NO GROWTH 24 H' }],
        ],
      },
    },
    lab: {
      subtitle: 'Quality control · Levey-Jennings · Westgard rules',
      kpis: [
        { label: 'QC Today',  value: '92',  sub: 'all analyzers' },
        { label: 'QC Pass Rate', value: '99.2%', sub: 'within 2SD' },
        { label: 'Westgard Violations', value: '2', sub: '1-3s · 2-2s — investigated' },
        { label: 'Calibration Due', value: '0', sub: 'all current' },
      ],
      tableTitle: 'QC Status (Today)',
      table: {
        cols: ['Analyzer', 'Test', 'Level', 'Value', 'Status'],
        rows: [
          ['Roche Cobas 8000', 'Glucose',  'L1', '95.2 mg/dL (target 95.0 ±2.5)', { badge: 'PASS' }],
          ['Roche Cobas 8000', 'Glucose',  'L2', '252.1 mg/dL (target 250.0 ±5.0)',{ badge: 'PASS' }],
          ['Sysmex XN-1000',   'WBC',      'L1', '4.32 ×10⁹/L (target 4.30 ±0.15)',{ badge: 'PASS' }],
          ['Abbott Architect', 'Troponin', 'L2', '4.8 ng/L · 1-3s violation',     { badge: 'INVESTIGATE' }],
        ],
      },
    },
  },

  // ── RADIOLOGY ─────────────────────────────────────────────────────────────
  radiology: {
    radiology: {
      subtitle: 'Modality worklist · all modalities · sorted by priority',
      kpis: [
        { label: 'Studies in Queue',  value: '47', sub: '8 STAT · 12 routine · 27 OPD' },
        { label: 'Avg Read Time',     value: '4m 23s', sub: 'per study · +47% vs avg' },
        { label: 'AI-Assisted',       value: '38',  sub: '12 findings flagged' },
        { label: 'Studies Today',     value: '184', sub: 'across 6 radiologists' },
      ],
      tableTitle: 'Reading Queue',
      table: {
        cols: ['Study', 'Patient', 'Modality', 'AI Findings', 'Priority'],
        rows: [
          ['CT-2026-8471', 'Ahmed Al-Rashid',  'CT Chest',     'Possible PE — 87%',    { badge: 'STAT' }],
          ['MR-2026-8472', 'Fatima Al-Zahra',  'MRI Brain',    'No acute finding',     { badge: 'ROUTINE' }],
          ['XR-2026-8473', 'Khalid Al-Otaibi', 'CXR PA/Lat',   'Consolidation R-base', { badge: 'ROUTINE' }],
          ['MG-2026-8474', 'Sara Al-Ghamdi',   'Mammogram',    'BIRADS-2 (benign)',    { badge: 'ROUTINE' }],
          ['CT-2026-8475', 'Mohammed Al-Saud', 'CT Abdo/Pelvis','Renal stone L · 6 mm',{ badge: 'STAT' }],
        ],
      },
    },
    ai: {
      subtitle: '12 AI models integrated · preliminary findings before you read',
      kpis: [
        { label: 'Studies AI-Read', value: '38',  sub: 'today · all auto-triaged' },
        { label: 'Findings Flagged',value: '12',  sub: '4 critical · 8 incidental' },
        { label: 'Avg AI Time',     value: '12 s',sub: 'per study (CT/MR)' },
        { label: 'Radiologist Confirmed', value: '94%', sub: '6% override rate' },
      ],
      tableTitle: 'AI Findings (Last 1h)',
      table: {
        cols: ['Study', 'Modality', 'AI Model', 'Finding', 'Confidence'],
        rows: [
          ['CT-2026-8471', 'CT Chest',     'PE-Detector v3',    'Pulmonary embolism · saddle',   '87%'],
          ['CT-2026-8475', 'CT Abdo/Pelvis','RenalStone-Net',    '6mm stone, L mid-ureter',       '94%'],
          ['MG-2026-8474', 'Mammogram',    'BreastAI v2',        'BIRADS-2 (benign calcifications)','92%'],
          ['CT-2026-8470', 'CT Head',      'ICH-Detector',       'No hemorrhage',                  '99%'],
          ['XR-2026-8473', 'CXR',          'LungScreen v4',      'Consolidation R-lower lobe',     '88%'],
        ],
      },
    },
    peerreview: {
      subtitle: 'Random sampling · double-read on critical · discrepancy tracking',
      kpis: [
        { label: 'Studies Sampled', value: '47',   sub: '3% random + 100% critical' },
        { label: 'Concordance Rate',value: '97.8%',sub: 'better than 95% target' },
        { label: 'Open Discrepancies', value: '2', sub: 'awaiting review' },
        { label: 'Avg Time to Review', value: '2 days', sub: 'reviewer SLA' },
      ],
      tableTitle: 'Recent Peer Reviews',
      table: {
        cols: ['Study', 'Primary Read', 'Peer Reviewer', 'Outcome', 'Status'],
        rows: [
          ['CT-2026-8412', 'Dr. Al-Ghamdi',  'Dr. Al-Mansour', 'Concordant',        { badge: 'CLOSED' }],
          ['MR-2026-8418', 'Dr. Al-Saud',    'Dr. Al-Otaibi',  'Concordant',        { badge: 'CLOSED' }],
          ['CT-2026-8425', 'Dr. Al-Mansour', 'Dr. Al-Ghamdi',  'Discrepancy MINOR', { badge: 'EDUCATION' }],
          ['CT-2026-8434', 'Dr. Al-Otaibi',  'Dr. Al-Saud',    'Concordant',        { badge: 'CLOSED' }],
        ],
      },
    },
    dose: {
      subtitle: 'Per-study DLP · per-patient cumulative · ICRP-103 limits',
      kpis: [
        { label: 'Studies Today',   value: '184', sub: 'CT 47 · XR 92 · MG 12 · etc.' },
        { label: 'Avg CTDIvol',     value: '6.2 mGy', sub: 'CT chest · within DRL' },
        { label: 'Pediatric Studies',value: '14', sub: 'all with pediatric protocols' },
        { label: 'Cumulative Alerts',value: '2',  sub: 'patients near annual limit' },
      ],
      tableTitle: 'Today\'s Dose Records',
      table: {
        cols: ['Study', 'Patient', 'Modality', 'DLP / KAP', 'Status'],
        rows: [
          ['CT-2026-8471', 'Ahmed Al-Rashid',  'CT Chest',     '184 mGy·cm', { badge: 'OK · DRL 200' }],
          ['CT-2026-8475', 'Mohammed Al-Saud', 'CT Abdo/Pelvis','410 mGy·cm', { badge: 'OK · DRL 450' }],
          ['XR-2026-8473', 'Khalid Al-Otaibi', 'CXR PA/Lat',   '0.42 Gy·cm²',{ badge: 'OK' }],
          ['CT-2026-8467', 'Lina Al-Ghamdi (P)','CT Brain (peds)','310 mGy·cm', { badge: 'PEDS PROTOCOL' }],
        ],
      },
    },
  },
};
