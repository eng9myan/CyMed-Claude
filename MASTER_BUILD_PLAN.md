# CyMed Master Build Plan
## National Digital Health, Hospital, Clinic, Pharmacy, Laboratory, Imaging, ERP, AI & Patient-Controlled Health Network

> Chief Architect Document · Generated 2026-06-12

---

## AUDIT RESULTS

### Implementation Classification

| Classification | Count | Apps |
|---------------|-------|------|
| **Complete** (Models + API + Services) | 3 | patient_app, pharmacy_app, lab_app |
| **Partial** (Models exist, API/Services incomplete) | 57 | All others with model classes |
| **Placeholder** (Empty models.py) | 10 | infection_control, home_health, hospice, pathways, rtls, crm, reporting, executive_app, stewardship, occ_health |
| **Tests** | 0% | All apps — no test coverage |

### Module Map

```
PATIENT CORE         patient_app ✅ | auth_app ⚡ | scheduling_app ⚡ | audit_log_app ⚡
CLINICAL             nursing_app ⚡ | or_app ⚡ | icu_app ⚡ | bed_app ⚡ | admission_app ⚡
PHARMACY             pharmacy_app ✅ | inventory_app ⚡ | procurement_app ⚡
LABORATORY           lab_app ✅ | blood_bank_app ⚡
IMAGING              rad_app ⚡ | fhir_mapping_app ⚡
SPECIALTIES          cardiology ⚡ | oncology ⚡ | maternity ⚡ | dialysis ⚡ | dental ⚡ | pediatrics ⚡
FINANCE              billing_app ⚡ | finance_app ⚡ | payroll_app ⚡ | rcm_app ⚡
INSURANCE            insurance_app ⚡ | um_app ⚡
INTEROP              hl7_engine ⚡ | zatca_compliance ⚡ | interop_app ⚡
AI                   ai_platform ⚡ | ai_app ⚡ | cds_app ⚡ | predictive_app ⚡
ANALYTICS            analytics_app ⚡ | data_platform_app ⚡ | executive_app 🔴 | reporting_app 🔴
HR/ERP               hr_app ⚡ | payroll_app ⚡ | asset_management_app ⚡ | finance_app ⚡ | inventory_app ⚡ | procurement_app ⚡ | crm_app ⚡
POPULATION           pophealth_app ⚡ | national_health_app ⚡ | citizen_health_app ⚡
EMPTY STUBS          crm_app 🔴 | infection_control 🔴 | home_health 🔴 | hospice 🔴
                     pathways 🔴 | rtls 🔴 | stewardship 🔴 | occ_health 🔴

✅ Complete  ⚡ Partial  🔴 Empty/Missing
```

---

## ARCHITECTURE DECISIONS

### 1. Deployment Modes (Single Config)
```python
# cymed_core/settings.py
CYMED_DEPLOYMENT_MODE = env('CYMED_MODE', 'hospital')
# Options: clinic | pharmacy | laboratory | imaging | hospital | group | ministry | national

CYMED_MODULES = {
    'clinic':    ['patient', 'scheduling', 'billing', 'pharmacy', 'lab'],
    'pharmacy':  ['patient', 'pharmacy', 'billing', 'insurance'],
    'hospital':  ['ALL'],
    'national':  ['ALL', 'national_health', 'citizen_health', 'pophealth'],
}
```

### 2. Patient-Controlled Architecture
```
Patient (GPID) ─── owns ──→ LongitudinalHealthRecord
                              ├── ConsentGrant[]
                              ├── AuthorizedRepresentative[]
                              └── BreakGlassAudit[]

Provider ────→ requests access ──→ Consent Engine ──→ Patient approves/denies
```

### 3. Global Patient Identifier (GPID)
Format: `CYM-{country_code}-{year}-{sequence_uuid7}`
Example: `CYM-SA-2026-01J9K8B7C6D5E4F3G2H1`

---

## PRODUCTION BUILD PHASES

### Phase 1 — Foundation (Week 1–2) ✅ COMPLETE
- [x] Enterprise Master Patient Index (EMPI) — `patient_app/models.py` GlobalPatient/FacilityMRN
- [x] GPID generation + cross-facility lookup — `patient_app/gpid_service.py`
- [x] Patient Consent Management Platform — `consent_app/` (models + services + views + API)
- [x] Authorized Representative management — `consent_app/models.py` AuthorizedRepresentative
- [x] Break-Glass Emergency Access with full audit — `consent_app/` BreakGlassAccess + tasks
- [x] ICD-11 integration (WHO API + local cache) — `icd11_app/` models + services + views
- [x] Fix all 10 empty stub apps — models.py built for all 10
- [x] AI Gateway — `ai_platform/gateway.py` Claude→Gemini→GPT fallover
- [x] Frontend: Consent Management page — `app/(workspace)/consent/page.tsx`
- [x] Frontend: ICD-11 Search component — `components/clinical/ICD11Search.tsx`
- [x] Tests: consent_app + patient_app GPID (0% → ~30% on these modules)
- [ ] Auth: JWT + Role-Based + Facility-scoped permissions (next)

### Phase 2 — Clinical Core (Week 3–4)
- [ ] Patient Journey workflow engine (Registration → Discharge)
- [ ] EMR/EHR with SOAP notes, templates, e-signatures
- [ ] CPOE with CDS hard/soft stops
- [ ] Medication Reconciliation
- [ ] Nursing Station with assignment-scoped view
- [ ] Bed Management with predicted LOS
- [ ] Discharge Planning module

### Phase 3 — Pharmacy & Lab & Imaging (Week 5–6)
- [ ] Complete pharmacy_app: controlled drugs, MAR, POS
- [ ] Complete lab_app: LIMS full workflow, critical value alerts
- [ ] Complete rad_app: RIS + DICOM/PACS integration
- [ ] Blood Bank: crossmatch, transfusion, inventory
- [ ] Consent-gated access: patient approves before results released

### Phase 4 — Finance & Compliance (Week 7–8)
- [ ] NPHIES claim submission + auto-denial appeal
- [ ] ZATCA e-invoicing (XML signing + QR)
- [ ] ICD-11 coding + CPT mapping + DRG grouper
- [ ] Revenue cycle management (RCM) full workflow
- [ ] Insurance pre-auth + eligibility

### Phase 5 — AI Platform (Week 9–10)
- [ ] AI Gateway with routing: Claude → Gemini → GPT fallover
- [ ] Ambient documentation (Whisper → Claude SOAP generator)
- [ ] CDS Hooks at order entry (drug allergy, drug-drug, dose range)
- [ ] Predictive sepsis: NEWS2 + ML model, 2-hr pre-alert
- [ ] AI denial prevention: pre-submission claim scrubber
- [ ] Executive AI briefing with Claude API streaming

### Phase 6 — National Platform (Week 11–12)
- [ ] National HIE with FHIR R4 endpoint
- [ ] Ministry of Health dashboards
- [ ] Provider/Facility/Pharmacy/Lab registry
- [ ] Population health: disease registries, risk stratification
- [ ] Vaccination programs, screening outreach
- [ ] Arabic RTL full parity (EN + AR)

### Phase 7 — Testing & Certification (Ongoing)
- [ ] 80%+ test coverage across all apps
- [ ] Performance: 1000 concurrent users load test
- [ ] Security: OWASP top-10 pen test
- [ ] HIPAA/PDPL compliance audit
- [ ] JCI/CBAHI accreditation measures

---

### Phase 8 — ERP Backbone (HR · Accounting · Inventory · Procurement · Payroll · Assets · CRM)

> Every module in this phase must implement the **Smart Setup Wizard** pattern from the Cymed Design Philosophy — no raw config screens by default. A hospital admin must be able to activate any module in under 10 minutes with zero ERP knowledge.

#### 8A — Human Resources (`hr_app`)
Current state: 5 models (Department, Designation, HealthcareProfessional, Shift, DutyRoster, Attendance) — no API, no services.

- [ ] **Employee Lifecycle** — hire → onboard → develop → exit state machine; contract types (permanent, locum, contract); probation tracking
- [ ] **Org Chart** — reporting lines, cost-center assignment, span-of-control reporting
- [ ] **Recruitment & Onboarding** — job requisitions, applicant tracking, offer letters, document checklist, onboarding task engine
- [ ] **Leave Management** — annual, sick, emergency, maternity, Hajj, unpaid; entitlement accrual; approval workflow; leave calendar
- [ ] **Performance Reviews** — 360° reviews, KPI templates per role, quarterly/annual cycles, improvement plans
- [ ] **Training & Certifications** — mandatory clinical training tracker (BLS, ACLS, infection control), expiry alerts, CPD hours
- [ ] **Shift Scheduling** — roster generation, swap requests, overtime tracking, minimum-rest enforcement
- [ ] **Attendance & Time** — clock-in/out (biometric + mobile), late/absent flags, grace period rules
- [ ] **WPS / GOSI Integration** — Saudi Wage Protection System file export, GOSI contribution calculation
- [ ] **Smart Setup Wizard** — guided questions: facility size → departments → shift patterns → roles → auto-generate org structure

#### 8B — Payroll (`payroll_app`)
Current state: 17-line stub (no models beyond skeleton).

- [ ] **Salary Structures** — basic + housing + transport + on-call allowances; deduction rules (loans, absences, GOSI)
- [ ] **Monthly Payroll Run** — automated calculation engine, approval workflow, audit trail per payslip
- [ ] **End-of-Service Benefits (EOSB)** — Saudi Labour Law Article 84 calculation; gratuity accrual ledger
- [ ] **Overtime** — hourly rate multipliers (1.25×, 1.5×); weekly/monthly caps; rest-day rules
- [ ] **Payslip Generation** — PDF payslip (EN + AR); employee self-service portal
- [ ] **Bank Transfer Files** — WPS-compliant SIF file export; multi-bank support
- [ ] **Payroll Journal** — auto-post salary cost to GL by cost center on approval
- [ ] **Smart Setup Wizard** — guided: country → salary components → bank → auto-configure pay rules

#### 8C — Accounting & Finance (`finance_app`)
Current state: 2 models (CostCenter, AnnualBudget) — no GL, no CoA, no AP/AR.

- [ ] **Chart of Accounts** — industry-standard healthcare CoA (Saudi MOF-aligned); account types (asset, liability, equity, income, expense); multi-level hierarchy
- [ ] **General Ledger (GL)** — double-entry journal entries (manual + system-generated); period open/close controls; trial balance
- [ ] **Accounts Payable (AP)** — supplier invoice capture; payment terms; aging report; 3-way match gate; IBAN payment scheduling
- [ ] **Accounts Receivable (AR)** — auto-post from billing_app; patient/insurer aging; dunning workflow; bad-debt provisioning
- [ ] **Bank Reconciliation** — statement import (OFX/CSV); auto-match; unreconciled item workflow
- [ ] **Period Close** — month-end checklist engine; accruals; prepayments; depreciation run; inter-company eliminations
- [ ] **Financial Statements** — P&L, Balance Sheet, Cash Flow (direct + indirect); comparative periods; department drill-down
- [ ] **Budget vs Actual** — budget upload; real-time variance dashboard; re-forecast workflow
- [ ] **Multi-Currency** — exchange rate table; realized/unrealized FX gain-loss; functional currency = SAR
- [ ] **ZATCA Integration** — auto-post e-invoice on AR confirmation; QR + UBL XML; Phase 2 compliant
- [ ] **IFRS Compliance** — IFRS 16 lease recognition; IFRS 9 ECL provisioning hooks
- [ ] **Smart Setup Wizard** — guided: country → entity type → CoA template (pre-built for Saudi healthcare) → fiscal year → auto-configure in one flow

#### 8D — Inventory Management (`inventory_app`)
Current state: 3 models (StorageFacility, MedicalItem, InventoryBatch) — no movements, no reorder, no API.

- [ ] **Item Master** — medications, consumables, equipment, reagents, linen; ABC classification; GS1 barcode; SFDA product code
- [ ] **Warehouse / Store Management** — main pharmacy, ward satellites, theatre store, lab store, central store; bin locations
- [ ] **Stock Movements** — receive (GRN-linked), issue to ward/patient, inter-store transfer, return, write-off, expiry disposal; FEFO picking
- [ ] **Lot/Batch/Serial Tracking** — full genealogy; lot recall workflow; recall alert to all dispensing points
- [ ] **Expiry Management** — 30/60/90-day expiry alerts; near-expiry redistribution; disposal logging
- [ ] **Cold Chain** — temperature log integration (IoT sensor API); breach alert → quarantine workflow
- [ ] **Reorder & Auto-Requisition** — min/max levels per store; auto-generate purchase requisition on breach; safety stock calculation
- [ ] **Stock Take / Cycle Count** — count sheet generation; variance approval; adjustment journal to GL
- [ ] **Pharmacy Integration** — real-time deduction on dispense; controlled-drug reconciliation
- [ ] **Smart Setup Wizard** — guided: store types → item categories → reorder rules → cold-chain yes/no → auto-configure warehouses

#### 8E — Procurement (`procurement_app`)
Current state: ~39-line stub.

- [ ] **Vendor / Supplier Master** — IBAN, CR number, ZATCA TIN, approved vendor list, performance score
- [ ] **Purchase Requisition (PR)** — department-initiated; multi-level approval by value; budget check against fin_annual_budgets
- [ ] **RFQ / Tendering** — public tender (MOF-compliant), direct PO, framework contract; sealed-bid scoring
- [ ] **Purchase Order (PO)** — line-level delivery tracking; amendments with approval; email to vendor
- [ ] **Goods Receipt Note (GRN)** — partial receipt; discrepancy flagging; auto-update inventory_app
- [ ] **3-Way Matching** — PO ↔ GRN ↔ AP invoice; tolerance rules; mismatch hold
- [ ] **Vendor Evaluation** — delivery performance, quality score, price competitiveness; annual scorecard
- [ ] **Contract Management** — AMC/SLA contracts; renewal alerts; price validity periods
- [ ] **Smart Setup Wizard** — guided: approval thresholds → vendor types → tender rules → auto-configure workflow

#### 8F — Fixed Assets (`asset_management_app`)
Current state: ~30-line stub.

- [ ] **Asset Register** — serial number, barcode/QR, acquisition cost, useful life, location, responsible party, insurance policy
- [ ] **Depreciation** — straight-line, declining balance, units-of-production; auto-run monthly → post to GL
- [ ] **Asset Lifecycle** — acquisition → commissioning → in-service → maintenance → disposal; state machine with audit trail
- [ ] **Maintenance Schedules** — preventive maintenance calendar; work orders; downtime logging; MTBF tracking
- [ ] **AMC Management** — vendor AMC contracts linked to assets; service call logging; SLA breach alerts
- [ ] **Physical Verification** — mobile barcode scan for annual audit; discrepancy report → write-off workflow
- [ ] **IFRS 16 Leases** — right-of-use asset recognition; lease liability amortization; disclosure notes
- [ ] **Smart Setup Wizard** — guided: asset categories → depreciation method → useful lives → auto-configure asset types

#### 8G — CRM & Patient Engagement (`crm_app`)
Current state: 49-line stub.

- [ ] **Corporate / Insurance Accounts** — account manager, credit limit, contracted rates, SLA response times
- [ ] **Referral Source Tracking** — GP referrals, self-referral, emergency, corporate; referral conversion funnel
- [ ] **Patient Satisfaction** — post-visit survey (SMS/WhatsApp); NPS; department-level CSAT; alert on score < 3
- [ ] **Loyalty & VIP** — VIP tier management, complimentary services, dedicated care manager assignment
- [ ] **Marketing Campaigns** — health awareness (diabetes, cardio, oncology screening); target list by diagnosis; consent-gated SMS/email
- [ ] **Follow-Up Workflows** — post-discharge call tasks; chronic disease recall (HbA1c, INR, dialysis); no-show re-booking
- [ ] **Smart Setup Wizard** — guided: account types → referral sources → survey template → auto-configure CRM flows

---

## IMMEDIATE NEXT ACTIONS

1. Build `empi_app` — Enterprise Master Patient Index
2. Build `consent_app` — Patient Consent Management
3. Build `gpid_service` — Global Patient ID generation
4. Complete the 10 empty stub apps
5. Add ICD-11 WHO API integration
6. Add 0→80% test coverage starting with patient_app

---

## FRONTEND BUILD PLAN

### New screens required:
- Patient Timeline (longitudinal view)
- Consent Management Portal
- AI Copilot sidebar (streaming responses)
- Ambient Documentation UI (live transcription → SOAP)
- ICD-11 Code Search component
- National Dashboard (Ministry of Health view)
- Arabic RTL layout wrapper
- Role-based App Launcher (Odoo-style)

### Components to build:
- `PatientCard` — unified patient header across all screens
- `ConsentBadge` — shows current consent status
- `AICopilot` — floating AI assistant panel
- `VitalsTrend` — sparkline vital signs history
- `MedReconciliation` — comparison table home meds vs ordered
- `BedBoardLive` — real-time bed grid with drag-drop

---

*This document is the single source of truth for the CyMed master build.*
