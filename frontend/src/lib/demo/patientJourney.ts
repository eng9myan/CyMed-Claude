/**
 * Complete patient journey for hospital demo.
 *
 * 14 steps that mirror a real ED visit ending in inpatient admission. Each
 * step has:
 *  - Role: who is doing this
 *  - Screen: which module they are working in
 *  - Time: cumulative wall-clock from arrival
 *  - Fields entered: literal list of every data point the employee captures
 *  - Auto actions: what CyMed does behind the scenes
 *  - Next trigger: what hands the patient off to the next role
 *
 * Patient: Ahmed Al-Rashid, 62-year-old male, walks into ER with chest pain.
 */

export interface JourneyStep {
  id: number;
  time: string;
  role: string;
  roleColor: string;
  screen: string;        // module slug (links to /demo/hospital/workspace/{screen})
  title: string;
  scenario: string;      // what is happening to the patient
  fields: { label: string; value: string }[];
  autoActions: string[];
  nextTrigger: string;
}

export const PATIENT: { mrn: string; name: string; arrival: string; chiefComplaint: string } = {
  mrn: 'P-2026-08471',
  name: 'Ahmed Al-Rashid',
  arrival: 'Walk-in to ER · 11:42:00',
  chiefComplaint: 'Chest pain × 2 hours, radiating to left arm',
};

export const JOURNEY: JourneyStep[] = [
  // ── 1. REGISTRATION ───────────────────────────────────────────────────────
  {
    id: 1,
    time: '11:42  (T+0:00)',
    role: 'Reception Clerk',
    roleColor: '#3B82F6',
    screen: 'reception',
    title: 'Patient registration at ER reception',
    scenario: 'Ahmed walks to ER reception, gripping his chest. Clerk Saleh prioritizes him.',
    fields: [
      { label: 'National ID / Iqama',  value: '1098765432 → auto-pulls name, DOB, nationality from Absher API' },
      { label: 'Patient name (AR)',     value: 'أحمد عبدالله الرشيد' },
      { label: 'Patient name (EN)',     value: 'Ahmed Abdullah Al-Rashid' },
      { label: 'Date of birth',         value: '1962-04-12 (62 yrs)' },
      { label: 'Gender',                value: 'Male' },
      { label: 'Nationality',           value: 'Saudi' },
      { label: 'Phone',                 value: '+966 50 123 4567' },
      { label: 'Emergency contact',     value: 'Wife — Fatima — +966 50 987 6543' },
      { label: 'Blood type (if known)', value: 'A+ (from prior visit)' },
      { label: 'Preferred language',    value: 'Arabic' },
      { label: 'Religion',              value: 'Muslim' },
      { label: 'Insurance card scan',   value: 'BUPA Arabia · Policy BUP-2024-887421 · Member 4421' },
      { label: 'Source of arrival',     value: 'Walk-in (not EMS, not transfer)' },
      { label: 'Chief complaint',       value: 'Chest pain × 2 hrs' },
      { label: 'Consent — Treatment',   value: 'Patient signed on tablet (digital signature captured)' },
      { label: 'Consent — Privacy',     value: 'Acknowledged' },
    ],
    autoActions: [
      'MRN P-2026-08471 generated (UUIDv7 backed)',
      'New encounter opened ER-2026-44871 · linked to patient',
      'NPHIES eligibility request fired → response in 0.8s → COVERED · co-pay SAR 100',
      'Patient added to triage queue with timestamp + chief complaint',
      'SMS sent to patient: "Welcome to KFSH. Your queue number is T-47. Triage room 3."',
      'Audit log: who/when/IP for HIPAA + Saudi NCA compliance',
      'Prior visit history auto-loaded (cardiac stent 2023, hypertension, T2 DM)',
    ],
    nextTrigger: 'Clerk clicks "Send to Triage" → triage nurse station gets red banner alert',
  },

  // ── 2. TRIAGE ────────────────────────────────────────────────────────────
  {
    id: 2,
    time: '11:44  (T+0:02)',
    role: 'Triage Nurse',
    roleColor: '#10B981',
    screen: 'admission',
    title: 'ESI scoring + vitals + allergies',
    scenario: 'Nurse Layla calls Ahmed into triage room. She sees chief complaint, takes vitals fast.',
    fields: [
      { label: 'Blood pressure',        value: '168 / 96 mmHg (high)' },
      { label: 'Heart rate',            value: '104 bpm' },
      { label: 'Respiratory rate',      value: '22 / min' },
      { label: 'SpO₂',                  value: '94% on room air' },
      { label: 'Temperature',           value: '37.2 °C' },
      { label: 'Pain score',            value: '8 / 10 · substernal' },
      { label: 'Weight / Height',       value: '94 kg / 174 cm (BMI 31)' },
      { label: 'ESI level',             value: 'ESI-2 (Critical) — ACS suspected' },
      { label: 'Allergies',             value: 'Penicillin → rash · No known food / latex' },
      { label: 'Current medications',   value: 'Atorvastatin 40mg QHS · Metformin 1g BID · Aspirin 81mg QD · Amlodipine 10mg QD' },
      { label: 'Last meal',             value: '07:00 (4h NPO sufficient if going to cath lab)' },
      { label: 'Past medical hx',       value: 'HTN, T2 DM, CAD s/p PCI (2023), obesity' },
      { label: 'Past surgical hx',      value: 'LAD stent 2023' },
      { label: 'Family hx',             value: 'Father — MI age 58 · Mother — CVA age 72' },
      { label: 'Social hx',             value: 'Former smoker (quit 2020, 30 pack-year) · No alcohol · No drugs' },
      { label: 'Fall risk (Morse)',     value: '35 (low)' },
      { label: 'Suicide risk',          value: 'Negative on Columbia screen' },
      { label: 'Sepsis screen',         value: 'NEGATIVE (no SIRS criteria)' },
    ],
    autoActions: [
      'ESI-2 → bed board flashes orange → bed request priority queued',
      'EKG protocol auto-fires → triage tech goes to acquire 12-lead within 10 min of arrival',
      'Troponin + BNP + BMP + CBC + lipid + HbA1c labs auto-suggested (cardiac panel)',
      'Cardiology on-call paged with "Possible ACS — pending EKG"',
      'Sepsis screen NEGATIVE → sepsis bundle not activated',
      'Vitals stream to bed-board card and command center live',
    ],
    nextTrigger: 'Triage complete → "Request Bed" button → charge nurse assigns bed',
  },

  // ── 3. BED ASSIGNMENT ────────────────────────────────────────────────────
  {
    id: 3,
    time: '11:46  (T+0:04)',
    role: 'Charge Nurse',
    roleColor: '#F59E0B',
    screen: 'bed_board',
    title: 'Bed assignment & nursing ratio check',
    scenario: 'Charge nurse Maryam sees Ahmed in the queue. Drag-and-drops his card to ER-Cardiac-2.',
    fields: [
      { label: 'Bed selected',          value: 'ER-Cardiac-2 (telemetry-monitored)' },
      { label: 'Reason for choice',     value: 'ACS rule-out — continuous telemetry needed' },
      { label: 'Isolation precautions', value: 'Standard only (no airborne/contact)' },
      { label: 'Equipment requested',   value: 'Cardiac monitor, 12-lead capable, defib pad ready' },
      { label: 'Assigned nurse',        value: 'Nurse Hala (current ratio 1:3, within ICU step-down policy)' },
      { label: 'Assigned MD',           value: 'Dr. Khalid Al-Otaibi (ER attending on shift)' },
      { label: 'Estimated LOS',         value: '8-24h (rule-out vs. admit)' },
      { label: 'Telemetry orders',      value: 'Lead II + V1 · alarm: HR>110, HR<50, ST elevation' },
    ],
    autoActions: [
      'stock.location ER-Cardiac-2 → assigned to encounter ER-2026-44871',
      'Bed marked "occupied" → housekeeping queue updated',
      'Patient wristband prints: MRN, name, DOB, allergies, bed',
      'Nurse Hala\'s worklist gets new patient card with priority badge',
      'Dr. Khalid\'s doctor queue gets new patient with "ESI-2 · ACS R/O" tag',
      'Door sign auto-generated: precautions, fall risk, allergies',
    ],
    nextTrigger: 'Patient wheeled to bed → wristband barcode scanned at arrival → "In Bed" event fires',
  },

  // ── 4. DOCTOR FIRST CONTACT ──────────────────────────────────────────────
  {
    id: 4,
    time: '11:52  (T+0:10)',
    role: 'ER Physician',
    roleColor: '#E67E22',
    screen: 'doctor',
    title: 'Doctor evaluation + initial orders',
    scenario: 'Dr. Khalid opens Ahmed\'s chart on his workstation. Sees AI summary of prior cardiac history.',
    fields: [
      { label: 'HPI',                   value: '62 y/o M w/ CAD s/p PCI presents w/ substernal chest pain × 2 hrs, radiating to L arm, 8/10, associated diaphoresis, no relief w/ rest...' },
      { label: 'ROS',                   value: 'CV: +CP +diaphoresis. Resp: +mild SOB. Otherwise negative.' },
      { label: 'Physical exam',         value: 'Gen: anxious, diaphoretic. CV: RRR no MRG. Lungs: clear. Abd: soft. Ext: no edema.' },
      { label: 'Working dx (ICD-11)',   value: 'BA41 — Acute coronary syndrome, possible NSTEMI' },
      { label: 'Differential',          value: 'NSTEMI · Unstable angina · Aortic dissection · GERD · Costochondritis' },
      { label: 'Lab orders',            value: 'Troponin I (q3h ×3) · BMP · CBC · PT/INR · Lipid · BNP · Mg' },
      { label: 'Imaging orders',        value: '12-lead EKG (STAT, repeat q15min) · CXR PA/Lat (STAT) · Bedside echo (within 1h)' },
      { label: 'Medication orders',     value: 'ASA 325mg PO chewed · Clopidogrel 600mg load PO · Atorvastatin 80mg PO · Nitroglycerin 0.4mg SL PRN q5min × 3 · Metoprolol 25mg PO (hold if SBP<100, HR<60)' },
      { label: 'IV access',             value: 'Two 18g IV — already in place by nursing' },
      { label: 'Consults',              value: 'Interventional Cardiology — Dr. Reem Al-Saud (STAT)' },
      { label: 'Disposition pending',   value: 'Likely admit to CCU or step-down based on troponin + EKG' },
    ],
    autoActions: [
      'CPOE runs allergy check → blocks penicillin if ordered',
      'CPOE runs interaction check → flags clopidogrel + aspirin (acceptable — DAPT for ACS)',
      'CPOE runs renal-dose check → checks recent creatinine, adjusts dose if CKD',
      'Each medication order routes to pharmacy queue with priority',
      'Each lab order generates barcode label at nurse station + LIS receives the order',
      'EKG order pushes to modality worklist on the cardiac monitor',
      'Cardiology consult page → Dr. Reem\'s pager + phone + app + SMS',
      'Charge for every order is posted to the encounter (real-time RCM)',
      'Door-to-EKG clock stops at 11:52 (within 10-min CMS target)',
    ],
    nextTrigger: 'Orders signed → nursing station + pharmacy + lab + radiology all receive tasks simultaneously',
  },

  // ── 5. NURSE EXECUTES ORDERS ─────────────────────────────────────────────
  {
    id: 5,
    time: '11:55  (T+0:13)',
    role: 'Floor Nurse',
    roleColor: '#8B5CF6',
    screen: 'nurse',
    title: 'Nurse worklist: meds + labs + EKG',
    scenario: 'Nurse Hala sees new tasks on her work board: 5 stat orders for ER-Cardiac-2.',
    fields: [
      { label: 'Task 1',                value: 'Draw blood × labs ordered — 11:55 done, sent to lab' },
      { label: 'Task 2',                value: '12-lead EKG — acquired 11:56, sent to cardiology AI for pre-read' },
      { label: 'Task 3',                value: 'Administer ASA 325mg PO chewed — see eMAR' },
      { label: 'Task 4',                value: 'Administer Clopidogrel 600mg load — see eMAR' },
      { label: 'Task 5',                value: 'IV access ×2 — both 18g in AC bilateral — confirmed patent' },
      { label: 'Task 6',                value: 'CXR PA/Lat — bedside portable, tech notified' },
      { label: 'Hand-off SBAR ready',   value: 'Auto-generated draft from current state for shift change' },
      { label: 'I/O',                   value: 'No PO since 07:00 · 100mL NS @ TKO · UO not measured (no foley)' },
    ],
    autoActions: [
      'Each task completion = barcode wristband scan + barcode of supply used',
      'Lab specimens labeled with tube-system barcode (avoids mix-ups)',
      'Pneumatic tube logs entry/exit times for chain of custody',
      'Inventory deducted from ER-Cardiac-2 stock location (gauze, alcohol pads, etc.)',
      'EKG result auto-posted to chart + AI annotates: "ST depression V4-V6 — concerning for NSTEMI"',
      'Cardiology pre-alerted by AI finding (catheter lab put on standby)',
    ],
    nextTrigger: 'Meds ready in pharmacy → barcode dispense → nurse retrieves → eMAR scan',
  },

  // ── 6. eMAR ─────────────────────────────────────────────────────────────
  {
    id: 6,
    time: '11:58  (T+0:16)',
    role: 'Med-Admin Nurse',
    roleColor: '#EC4899',
    screen: 'emar',
    title: 'Medication administration with 5-rights barcode scan',
    scenario: 'Nurse Hala wheels med cart to bedside. Per dose: scan patient → scan drug → confirm → give.',
    fields: [
      { label: 'Pre-admin assessment',  value: 'Pain 8/10 · BP 168/96 · HR 104 — within holding parameters for ASA + Plavix' },
      { label: 'Scan 1 — patient',      value: '✓ Wristband barcode matches encounter ER-2026-44871' },
      { label: 'Scan 2 — drug ASA',     value: '✓ ASA 325mg chewable · NDC 0573-0151-30 · lot AS24K9 · expiry 2027-08' },
      { label: 'Scan 3 — dose check',   value: '✓ 325mg matches order' },
      { label: 'Scan 4 — route',        value: '✓ PO chewed (NOT swallowed whole — patient educated)' },
      { label: 'Scan 5 — time',         value: '✓ 11:58 within 30-min window of order time 11:52' },
      { label: 'Admin',                 value: 'Given · patient swallowed water after · no immediate reaction' },
      { label: 'Witness (if needed)',   value: 'Not required (non-controlled)' },
      { label: 'Repeat for Clopidogrel',value: '5-rights scan · 8 tablets of 75mg = 600mg load · given 11:59' },
      { label: 'Repeat for Atorvastatin',value: 'Already ordered as next dose at QHS — not now' },
      { label: 'Post-admin reassess',   value: 'No reaction · scheduled BP recheck at 12:15' },
    ],
    autoActions: [
      'Pharmacy inventory decremented by exact qty scanned',
      'Controlled substance log — N/A (ASA + Plavix non-controlled)',
      'Charge captured for every dose dispensed and administered',
      'eMAR record permanent — who scanned what, when, where, witnessed by whom',
      'If override required (e.g. give before lab back) → reason + co-signer mandatory',
    ],
    nextTrigger: 'Labs return → trigger doctor review',
  },

  // ── 7. LAB RESULTS RETURN ────────────────────────────────────────────────
  {
    id: 7,
    time: '12:30  (T+0:48)',
    role: 'Lab Technologist',
    roleColor: '#06B6D4',
    screen: 'laboratory',
    title: 'Critical lab value escalation',
    scenario: 'Troponin I returns at 0.84 ng/mL (normal <0.04). Lab tech sees critical value.',
    fields: [
      { label: 'Troponin I',            value: '0.84 ng/mL · 21× upper limit · CRITICAL' },
      { label: 'CK-MB',                 value: '12.4 ng/mL (high)' },
      { label: 'BNP',                   value: '184 pg/mL (mildly elevated)' },
      { label: 'BMP',                   value: 'Cr 1.4 (mild AKI) · K 4.2 · Glu 184' },
      { label: 'CBC',                   value: 'WBC 11.2 · Hgb 13.8 · Plt 248' },
      { label: 'Auto-verify decision',  value: 'Auto-verified (delta check pass, within instrument flags)' },
      { label: 'Critical value alert',  value: 'Phoned to nurse Hala at 12:30 · readback confirmed · documented' },
    ],
    autoActions: [
      'Result posted to chart + bed-board card flashes red',
      'Dr. Khalid receives push notification + popup on doctor screen',
      'Critical value documented per CAP requirements with read-back signature',
      'Cardiology alerted (already on consult)',
      'CCU bed pre-reserved on bed board (admission likely)',
      'Charge captured for each test panel (RCM live update)',
    ],
    nextTrigger: 'Doctor sees critical → confirms NSTEMI → admits',
  },

  // ── 8. ADMISSION DECISION ───────────────────────────────────────────────
  {
    id: 8,
    time: '12:38  (T+0:56)',
    role: 'ER Physician',
    roleColor: '#E67E22',
    screen: 'doctor',
    title: 'NSTEMI confirmed → admission orders',
    scenario: 'Dr. Khalid sees troponin + EKG findings. Calls cardiology. Plan: admit, cath next AM unless deteriorates.',
    fields: [
      { label: 'Final ER diagnosis',    value: 'NSTEMI (Type 1) · ICD-11 BA41.0' },
      { label: 'Admission disposition', value: 'Admit to CCU · Cardiology service · Dr. Reem Al-Saud as attending' },
      { label: 'Admission orders',      value: 'Heparin gtt (weight-based) · DAPT continue · Beta-blocker · Statin · ACE-I pending Cr · NPO after midnight for cath' },
      { label: 'Continued monitoring',  value: 'Telemetry · Troponin q3h × 2 more · BMP daily · EKG q AM' },
      { label: 'Risk stratification',   value: 'GRACE score 142 (intermediate) — early invasive strategy' },
      { label: 'Family communication',  value: 'Wife called at 12:35 · informed · coming to hospital' },
      { label: 'Pre-procedure consent', value: 'Coronary angiogram + possible PCI · explained · signed' },
    ],
    autoActions: [
      'Encounter status → ED → "Admit pending bed"',
      'CCU charge nurse notified — accepts the admission',
      'CCU-3 bed reserved (was already flagged)',
      'Pharmacy receives full admission med reconciliation request',
      'Lab orders for q3h troponin auto-scheduled with collection times',
      'Cardiology service (Dr. Reem) becomes attending of record',
      'Insurance receives admission notification → pre-cert continues',
      'Cath lab schedule updated: tentative slot 06:30 next morning',
    ],
    nextTrigger: 'Patient transferred to CCU bed → handoff SBAR generated',
  },

  // ── 9. TRANSFER TO CCU ──────────────────────────────────────────────────
  {
    id: 9,
    time: '13:15  (T+1:33)',
    role: 'ER Nurse → CCU Nurse',
    roleColor: '#8B5CF6',
    screen: 'bed_board',
    title: 'Hand-off and patient transfer',
    scenario: 'ER nurse Hala wheels Ahmed to CCU-3. Hands off to CCU nurse Nadia using SBAR.',
    fields: [
      { label: 'SBAR — Situation',      value: '62 M, NSTEMI, troponin 0.84, on heparin gtt' },
      { label: 'SBAR — Background',     value: 'CAD s/p PCI 2023, HTN, T2 DM, allergic to PCN' },
      { label: 'SBAR — Assessment',     value: 'CP 4/10 with NTG · stable VS · awaiting AM cath' },
      { label: 'SBAR — Recommendation', value: 'Continue heparin per weight · NPO after midnight · alert if CP recurs or hemodynamic change' },
      { label: 'Lines / drips',         value: '2× 18g PIV · heparin gtt @ 18 U/kg/hr · IV NS @ TKO' },
      { label: 'Pending tasks',         value: 'Next troponin draw 14:55 · BMP AM · cath consent confirmed' },
      { label: 'Belongings',            value: 'Phone + watch + wallet — given to wife in waiting area · signed log' },
    ],
    autoActions: [
      'Bed-board: ER-Cardiac-2 marked "vacating" → housekeeping queued (15-min target turnover)',
      'Encounter location updated → CCU-3',
      'Nurse assignment changes: ER nurse Hala signs off, CCU nurse Nadia signs on',
      'Telemetry monitoring transitions seamlessly (same vendor, central station auto-recognizes)',
      'All pending orders, meds, labs, follow Ahmed to CCU (no re-entry)',
      'Family directed to CCU waiting area',
    ],
    nextTrigger: 'CCU nurse Nadia begins admission assessment',
  },

  // ── 10. PHARMACY VERIFICATION ───────────────────────────────────────────
  {
    id: 10,
    time: '13:30  (T+1:48)',
    role: 'Pharmacist',
    roleColor: '#10B981',
    screen: 'pharmacy',
    title: 'Pharmacist verifies admission med rec',
    scenario: 'Pharmacist Sara reviews Ahmed\'s admission med list against home meds + new orders.',
    fields: [
      { label: 'Home medications',      value: 'Atorvastatin 40mg QHS · Metformin 1g BID · Aspirin 81mg QD · Amlodipine 10mg QD' },
      { label: 'Admission orders',      value: 'ASA 81mg (continue) · Atorvastatin 80mg (uptitrated) · Clopidogrel 75mg QD (NEW) · Metoprolol 25mg BID (NEW) · Amlodipine 10mg (continue) · Hold Metformin (pre-cath, contrast risk)' },
      { label: 'Med rec — Continued',   value: 'ASA, Amlodipine — verified dose + frequency' },
      { label: 'Med rec — Uptitrated',  value: 'Atorvastatin 40 → 80mg (per ACS guidelines)' },
      { label: 'Med rec — Added',       value: 'Clopidogrel + Metoprolol (per ACS DAPT + beta-blocker)' },
      { label: 'Med rec — Held',        value: 'Metformin (contrast-induced nephropathy prevention)' },
      { label: 'Allergy verified',      value: 'PCN allergy noted — no beta-lactams ordered' },
      { label: 'Interaction check',     value: 'DAPT acceptable (Plavix + ASA) · No contraindications' },
      { label: 'Renal dose check',      value: 'Cr 1.4 (eGFR 56) → enoxaparin not used, heparin gtt OK' },
      { label: 'Cost-effective sub',    value: 'Generic atorvastatin (already)' },
      { label: 'Counseling',            value: 'Patient education on new Plavix + Metoprolol after extubation if applicable' },
    ],
    autoActions: [
      'Med rec complete → unlocks med admin for CCU nurses',
      'Pharmacy queue marks Ahmed as "Verified"',
      'Formulary substitutions logged for P&T review',
      'Cost saved by generic logged for RCM efficiency dashboard',
    ],
    nextTrigger: 'Heparin gtt continues, next troponin scheduled',
  },

  // ── 11. CCU NURSING ──────────────────────────────────────────────────────
  {
    id: 11,
    time: '14:00  (T+2:18)',
    role: 'CCU Nurse',
    roleColor: '#8B5CF6',
    screen: 'nurse',
    title: 'CCU admission assessment + ongoing monitoring',
    scenario: 'CCU nurse Nadia completes admission assessment. Q4h vitals + neuro checks.',
    fields: [
      { label: 'Q-shift physical',       value: 'Head-to-toe assessment documented · Braden 18 (low risk) · Falls 35 (low)' },
      { label: 'IV site assessment',     value: 'Both AC sites: no redness, swelling, infiltration · patent' },
      { label: 'Skin',                   value: 'Intact · no pressure injury · Braden 18' },
      { label: 'Mobility',               value: 'Bed rest with bathroom privileges · cardiac chair OK if no CP' },
      { label: 'Education provided',     value: 'CCU orientation · call bell use · cardiac diet · activity limits · upcoming cath' },
      { label: 'Family interaction',     value: 'Wife visited 14:00-14:30 · spouse coping well · 2 adult children notified' },
      { label: 'Vitals (Q4h)',           value: '14:00 — BP 142/82 · HR 78 · RR 18 · SpO2 96% · pain 2/10' },
      { label: 'Pain reassess',          value: 'Pain 2/10 (down from 8) — improved with treatment' },
      { label: 'I/O (Q-shift)',          value: 'In: 350mL IV · 200mL PO water · Out: 420mL urine voided · Net +130' },
      { label: 'Telemetry interp',       value: 'Sinus rhythm 70-85 · occasional PVCs · no ST changes since admission' },
    ],
    autoActions: [
      'Each vitals entry → trends auto-charted on flowsheet',
      'Alarm limits set on monitor: HR>100 or <50, ST elevation >2mm, SpO2<90',
      'Q4h reminder fires for next vitals 18:00',
      'Family visits logged for visitor policy compliance',
      'Education documentation completes Joint Commission requirement',
    ],
    nextTrigger: 'Overnight uneventful → AM cath proceeds',
  },

  // ── 12. RADIOLOGY (next AM cath) ─────────────────────────────────────────
  {
    id: 12,
    time: 'Next AM 07:00  (T+19:18)',
    role: 'Cath Lab Team',
    roleColor: '#EC4899',
    screen: 'radiology',
    title: 'Coronary angiogram + PCI',
    scenario: 'Patient prepped, brought to cath lab. Cardiologist Dr. Reem performs angiogram.',
    fields: [
      { label: 'Pre-procedure verify',  value: 'Identity (wristband scan) · NPO since 24:00 · INR 1.1 · creatinine 1.4 · consent in chart' },
      { label: 'Vascular access',       value: 'Right radial · ultrasound-guided · 6F sheath placed' },
      { label: 'Contrast used',         value: 'Iodixanol 320 · 87 mL total (within recommended limit)' },
      { label: 'Findings',              value: '90% in-stent restenosis of prior LAD stent · 60% non-flow-limiting RCA' },
      { label: 'Intervention',          value: 'Drug-eluting stent ×1 to LAD ISR · 3.0×18mm Promus Elite' },
      { label: 'Implant placed',        value: 'UDI: (01)08714729034201(11)260615(17)280601(10)A4K9 (Promus Elite)' },
      { label: 'Final TIMI flow',       value: 'TIMI 3 (normal) in LAD post-PCI' },
      { label: 'Closure',               value: 'Hemostasis radial band applied · 2-hour wear' },
      { label: 'Dose tracking',         value: 'DAP 4,820 mGy·cm² · Air Kerma 480 mGy · within reference levels' },
    ],
    autoActions: [
      'Implant recorded in cymed.implant.placement → permanent patient record',
      'UDI captured for FDA UDI + JCI traceability',
      'Cost of implant SAR 12,400 + cath SAR 18,400 posted to encounter',
      'Pre-auth claim updated to insurance with confirmed PCI',
      'Recovery bed reserved in CCU (patient returns)',
      'Post-cath orders auto-generated (vital monitoring, sheath care, hold Metformin 48h)',
    ],
    nextTrigger: 'Patient returns to CCU → recovery → step-down → discharge planning',
  },

  // ── 13. DISCHARGE PLANNING ───────────────────────────────────────────────
  {
    id: 13,
    time: 'Day 3 11:00  (T+71:18)',
    role: 'Discharge Planner',
    roleColor: '#06B6D4',
    screen: 'discharge',
    title: 'Discharge readiness + medication reconciliation',
    scenario: 'Day 3, Ahmed clinically stable. Cardiac rehab arranged. Discharge planner finalizes.',
    fields: [
      { label: 'Discharge readiness',   value: 'Hemodynamically stable · ambulating · cardiac diet tolerating · pain 0/10 · family ready' },
      { label: 'Discharge meds',        value: 'ASA 81mg QD lifelong · Plavix 75mg QD × 12 mo · Atorvastatin 80mg QHS · Metoprolol 50mg BID · Lisinopril 10mg QD (new, eGFR now 64) · Restart Metformin 1g BID · Amlodipine continue' },
      { label: 'Med rec — patient print',value: 'Patient receives bilingual (AR/EN) med list with photos + dosing schedule' },
      { label: 'DME (durable equipment)',value: 'BP cuff at home — supplied by pharmacy partner' },
      { label: 'Transportation',        value: 'Wife will drive · no ambulance needed' },
      { label: 'Home health',           value: 'N/A · independent ADLs' },
      { label: 'Cardiac rehab referral',value: 'Phase II at outpatient clinic · 36 sessions over 12 weeks' },
      { label: 'Follow-up appts',       value: 'Cardiology (Dr. Reem) — 2 weeks · PCP — 1 month · Lab (BMP) — 2 weeks' },
      { label: 'Patient education',     value: 'Stent care · ACS warning signs · when to call 911 · diet · activity · DAPT compliance' },
      { label: 'Smoking cessation',     value: 'N/A (former smoker, quit 2020)' },
      { label: 'Readmit risk (AI)',     value: '14% (low) — stent compliance + follow-up adherence drivers' },
    ],
    autoActions: [
      'Discharge prescription sent to patient\'s preferred pharmacy electronically',
      'Follow-up appointments auto-booked in cardiology + PCP calendars',
      'Cardiac rehab referral routes to outpatient services',
      'Discharge summary auto-generated for PCP via FHIR / fax',
      'Patient portal updated with full hospital course + discharge summary',
      'CCU-3 vacated → housekeeping → bed available in 18 min',
    ],
    nextTrigger: 'Patient walked to wife\'s car at 14:00 → encounter closes',
  },

  // ── 14. BILLING & RCM ────────────────────────────────────────────────────
  {
    id: 14,
    time: 'Day 3 14:30  (T+74:48)',
    role: 'Billing / RCM',
    roleColor: '#F59E0B',
    screen: 'billing',
    title: 'Charge capture, coding, claim submission',
    scenario: 'Encounter closed. Billing team reviews real-time-captured charges and codes the encounter.',
    fields: [
      { label: 'Total charges',         value: 'SAR 84,200' },
      { label: 'Diagnosis codes',       value: 'I21.4 (NSTEMI) · I25.10 (CAD) · I10 (HTN) · E11.9 (T2 DM)' },
      { label: 'Procedure codes',       value: '93458 (Coronary angiogram) · 92928 (PCI single vessel) · I46.x bundled' },
      { label: 'DRG assigned',          value: 'DRG 247 (Percutaneous Cardiovascular Procedure with DES, w/o MCC)' },
      { label: 'NPHIES claim',          value: 'Built · validated · submitted to BUPA · response within 24-48h' },
      { label: 'ZATCA e-invoice',       value: 'XML generated · QR code stamped · cleared in 0.6s · UUID stored' },
      { label: 'Patient responsibility',value: 'SAR 100 co-pay (per BUPA policy) · billed at discharge' },
      { label: 'Expected reimbursement',value: 'SAR 78,400 (after contractual + co-pay)' },
      { label: 'Denial risk (AI)',      value: '4% (low) — strong documentation + appropriate DRG' },
    ],
    autoActions: [
      'Claim generated from real-time charge capture (no retrospective coding)',
      'NPHIES transmission · ZATCA stamp · audit log of submission timestamp',
      'AR aging clock starts',
      'Patient portal shows itemized bill',
      'Quality metrics fire: door-to-EKG, door-to-cath time, length of stay vs DRG benchmark',
      'Outcome data feeds population health + denial prediction model',
    ],
    nextTrigger: 'Payment received in 21 days · auto-reconciled to encounter',
  },
];
