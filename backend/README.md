<div align="center">
  <h1>CyMed</h1>
  <p><strong>Enterprise Healthcare ERP &amp; EMR Platform</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Laravel-13-FF2D20?style=flat&logo=laravel" alt="Laravel 13">
    <img src="https://img.shields.io/badge/PHP-8.3+-777BB4?style=flat&logo=php" alt="PHP 8.3+">
    <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql" alt="PostgreSQL 16">
    <img src="https://img.shields.io/badge/FHIR-R4-green?style=flat" alt="FHIR R4">
    <img src="https://img.shields.io/badge/NPHIES-Saudi_Arabia-009639?style=flat" alt="NPHIES">
  </p>
</div>

---

CyMed is a comprehensive, modular healthcare ERP built on Laravel 13 and PostgreSQL 16. It covers the full hospital lifecycle — from patient registration and clinical care through billing, analytics, and regulatory compliance — designed for multi-facility deployments in Saudi Arabia and the broader MENA region.

## Features

### Clinical
- **Patient Master Index** — MRN management, duplicate detection, merge workflow
- **EMR / Clinical Notes** — SOAP notes, templates, e-signatures, addenda, AI-assisted documentation
- **Pharmacy** — CPOE, drug–drug interaction checking (AI-powered), MAR, controlled substances
- **Laboratory** — Orders, specimen tracking, results, critical value alerts, delta checks
- **Radiology** — Imaging orders, PACS integration (DICOM study UIDs), structured reports
- **Specialty Modules** — Cardiology, Oncology, Dialysis, Maternity/OB, NICU, Blood Bank, ICU, OT, ED Triage, Dental, Dermatology, Psychiatry, Ophthalmology, Physiotherapy, Pediatrics, ENT, Orthopedics, Transplant

### Operations
- **Bed Management** — Ward/bed board, assignments, housekeeping workflow
- **Appointments** — Schedule templates, slot generation, patient portal booking, reminders
- **Billing** — Charge capture (CPT/SFDA), invoicing, payment posting, ZATCA e-invoicing
- **Insurance / RCM** — Pre-auth, NPHIES claim submission, EDI 837/835, denial management, appeals
- **Supply Chain** — Procurement, inventory, cold-chain temperature monitoring

### Intelligence
- **AI/NLP** — Claude API integration for discharge summaries, ICD/CPT coding suggestions, drug interaction checks, NEWS2 scoring
- **Predictive Analytics** — ML-based readmission and deterioration risk scores
- **BI Reports** — Operational dashboards, financial summaries, census, KPI tracking
- **Population Health** — Disease registries, care gap identification, risk stratification
- **Clinical Decision Support** — Rule-based and AI-driven alerts, triage scoring

### Compliance and Integration
- **FHIR R4** — Native data model with FHIR mappers for Patient, Encounter, Observation, MedicationRequest
- **NPHIES** — Saudi NPHIES claim submission and eligibility verification
- **ZATCA** — Saudi VAT e-invoicing (XML signing, QR code generation)
- **HL7** — Integration engine for legacy system connectivity
- **RBAC** — 20 clinical roles, 300+ granular permissions, break-glass emergency access
- **Audit Trail** — PHI access logging, clinical event history, security audit

## Tech Stack

| Component | Choice |
|-----------|--------|
| Framework | Laravel 13 / PHP 8.3+ |
| Database | PostgreSQL 16 (JSONB, GIN indexes, uuid-ossp) |
| Auth | Laravel Passport v13 (OAuth2, 8-hr access tokens) |
| RBAC | Spatie Permission v8 |
| Modules | nwidart/laravel-modules v13 (66 modules) |
| Queue | Redis + Laravel Horizon |
| AI | Claude API (Anthropic) |
| Storage | AWS S3 / MinIO |
| Search | Elasticsearch (audit trail) |

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Make

### Setup (first time)

```bash
git clone <repo-url> cymed && cd cymed
make setup
```

This builds the containers, installs dependencies, runs migrations, seeds roles/permissions, and installs Passport keys. The API is available at http://localhost.

### Day-to-day

```bash
make up          # Start all services
make down        # Stop all services
make shell       # Shell into the app container
make tinker      # Laravel Tinker REPL
make migrate     # Run new migrations
make test        # Run full test suite (parallel)
make test-filter filter=RcmTest   # Run one test class
make logs        # Tail app + horizon logs
```

## Architecture

The platform is a **modular monolith** using nwidart/laravel-modules. All API routes are centralised in `routes/api.php`. New waves follow the pattern in `CLAUDE.md`.

```
Modules/
├── Patient/          Core patient data, encounters, insurance
├── EMR/              Clinical notes, vitals, orders
├── Pharmacy/         Medication orders, MAR, dispensing
├── Laboratory/       Lab orders, results, critical alerts
├── Radiology/        Imaging orders, reports, PACS
├── Billing/          Charges, invoices, payments, ZATCA
├── Insurance/        Claims, NPHIES, eligibility
├── RCM/              Revenue cycle management
├── DataWarehouse/    Analytics facts (encounter, lab, financial)
├── ClinicalDecisionSupport/  CDS rules and alerts
├── PredictiveAnalytics/      Risk scoring models
├── NLP/              Note summarisation, coding suggestions
└── ... (66 modules total)
```

## API

Base URL: `http://localhost/api/v1`

Authentication: Bearer token via `POST /api/v1/auth/login`. FHIR R4: `/api/v1/fhir/r4/{resourceType}`.

| Prefix | Description |
|--------|-------------|
| `/patients` | Patient PMI |
| `/encounters` | Encounters + nested notes, vitals, orders |
| `/encounters/{id}/pharmacy/orders` | Medication orders |
| `/encounters/{id}/lab/orders` | Lab orders |
| `/encounters/{id}/radiology/orders` | Imaging orders |
| `/appointments` | Scheduling |
| `/beds` | Bed board, assignments |
| `/billing` | Charges, invoices, payments |
| `/insurance` | Eligibility, claims |
| `/dw` | Data warehouse metrics |
| `/command-center` | Operational alerts, real-time capacity |
| `/fhir/r4` | FHIR R4 API |

## Testing

```bash
make test                                    # All 109 tests, parallel
make test-suite suite=Feature                # Feature tests only
make test-filter filter=EncounterController  # One class
```

All tests use `RefreshDatabase` + `Passport::actingAs()` + `RolesAndPermissionsSeeder`. Each wave has a feature test verifying RBAC (happy path + 403 for unauthorized role).

## Contributing

See `CLAUDE.md` for the full architecture guide, module conventions, permission patterns, and wave map. When adding a new wave:

1. Create migration `database/migrations/2024_01_01_000NNN_*.php`
2. Add models under `Modules/YourModule/Models/` with `HasUuids`
3. Add controller under `Modules/YourModule/Http/Controllers/Api/`
4. Register routes in `routes/api.php`
5. Add permissions to `database/seeders/RolesAndPermissionsSeeder.php`
6. Add `tests/Feature/YourModule/YourTest.php`

## License

Proprietary — CyMed Healthcare Technology. All rights reserved.
