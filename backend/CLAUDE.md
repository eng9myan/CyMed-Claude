# CyMed Healthcare ERP — Project Guide

## What This Is

CyMed is a **100-wave enterprise healthcare ERP** built on Laravel 11 + PostgreSQL 16. It covers the full hospital lifecycle: patient registration → clinical care → billing → analytics → compliance. Every table uses UUID PKs, every sensitive column uses JSONB, every financial figure is `decimal:2`.

## Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Laravel 13 / PHP 8.3+ | Strict mode on in non-production |
| Database | **PostgreSQL 16 only** | JSONB, GIN indexes, uuid-ossp, pg_trgm |
| Auth | Laravel Passport v13 | 8-hour access tokens, 30-day refresh |
| RBAC | Spatie Permission v8 | guard_name='web' everywhere |
| Modules | nwidart/laravel-modules v13 | `Modules\` namespace → `Modules/` dir |
| Tests | PHPUnit via `php artisan test` | RefreshDatabase + Passport::actingAs() |
| Queue | Redis | CACHE_STORE=array in tests |
| Docker | PHP 8.4-fpm-alpine + Nginx + PG16 | `docker/` directory |

**Never** use MySQL/MariaDB — the schema uses JSONB and GIN indexes that are PostgreSQL-only.

## Module Architecture

There are 66 modules under `Modules/`. Two structural patterns exist:

**nwidart modules** (Waves 1–42, 39 modules) — have `module.json`, their own `Routes/api.php` stub (empty, routes are all centralised in `routes/api.php`), `Providers/`, etc.

**Bare modules** (Waves 43–100, 27 modules) — only `Models/` and `Http/Controllers/Api/`. Routes are registered directly in `routes/api.php`.

All routes live in **`routes/api.php`** (615 routes, ~950 lines). The module-level `Routes/api.php` stubs are intentionally empty.

## Key Conventions

### Models
- All models use `HasUuids` — never integer PKs.
- JSONB arrays cast as `'array'`; JSONB objects cast as `'array'` or `'object'`.
- Monetary columns: `decimal:2` cast + `decimal(12,2)` in migration.
- Soft deletes (`SoftDeletes`) on patient-facing models.

### Controllers
- Permission check pattern (no Policy classes):
  ```php
  $user = $request->user();
  if (!$user->hasPermissionTo('some.permission')) {
      abort(403);
  }
  ```
- `super-admin` bypasses all checks via `Gate::before()` in `AuthServiceProvider`.
- `break-glass` gets after-the-fact access logged to the activity log.

### Tests
```php
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Passport\Passport;

protected function setUp(): void {
    parent::setUp();
    $this->artisan('db:seed', ['--class' => 'RolesAndPermissionsSeeder']);
    // create Facility, then assign roles to test users
}

public function test_something(): void {
    Passport::actingAs($this->physician, ['*']);
    $response = $this->postJson('/api/v1/...', [...]);
    $response->assertStatus(201);
}
```
Always test a **403 for nurse** (or another role without the permission) at the end of each test class.

### Migrations
- File pattern: `database/migrations/2024_01_01_000NNN_create_*.php`
- Sequence: 001–097, no gaps.
- Every table: `$table->uuid('id')->primary()` + `$table->foreignUuid('facility_id')->constrained()->cascadeOnDelete()`.
- PostgreSQL extensions required: `uuid-ossp`, `pg_trgm`.

## Roles & Permissions

20 roles seeded by `RolesAndPermissionsSeeder`:

| Role | Key permissions |
|------|----------------|
| `super-admin` | Gate::before bypass — everything |
| `hospital-admin` | Facility ops, staff, inventory, billing |
| `medical-director` | Clinical governance, HAI, quality |
| `system-admin` | Wave 53-60 analytics, DW, NLP, predictive |
| `physician` | Clinical notes, orders, prescriptions |
| `resident` | Same as physician (supervised) |
| `charge-nurse` | Nursing management |
| `nurse` | Vitals, nursing notes (limited scope) |
| `pharmacist` | Dispense, interventions |
| `lab-technician` | Lab orders, results |
| `radiologist` | Imaging reports |
| `billing-officer` | Charges, invoices |
| `insurance-coordinator` | Claims, pre-auth |
| `receptionist` | Registration, scheduling |
| `hr-officer` | Staff, payroll |
| `quality-officer` | Incidents, accreditation |
| `coding-specialist` | ICD/CPT coding |
| `break-glass` | Emergency read-all (logged) |
| `patient` | Patient portal |

## Wave Map (what each group built)

| Waves | Theme | Key modules |
|-------|-------|-------------|
| 1–5 | Foundation | Auth, MFA, RBAC, Facility, Patient PMI |
| 6–10 | Core Clinical | Lab, Radiology, EMR, Pharmacy, Bed, ED Triage |
| 11–15 | Inpatient | ICU, OT, Ambulance, Coding, Infection, RPM |
| 16–20 | Extended Clinical | Telemedicine, Documents, Procurement, Assets, Reporting |
| 21–25 | Specialty | Blood Bank, Maternity, NICU, Dialysis, Oncology |
| 26–30 | More Specialty | Cardiology, Pediatrics, Psychiatry, Dermatology, Ophthalmology |
| 31–35 | More Specialty | Physiotherapy, Dental, ENT, Orthopedics, Transplant |
| 36–40 | Operations | Referrals, Multi-clinic, Queue, Clinic Billing, Patient Engagement |
| 41–44 | Academic | Medical Education, CBME, CME, Grand Rounds |
| 45–52 | Research & Diagnostics | Research, Genomics, PACS, Lab Analyzers |
| 53–60 | Intelligence | RCM, Data Warehouse, Population Health, Surveillance, Command Center, CDS, Predictive Analytics, NLP |
| 61–68 | Integration | Interoperability (FHIR/HL7), Integration Hub, Mobile API, Notifications, Compliance, Tenant Config |
| 69–76 | Advanced Ops | Telemedicine+, Advanced Scheduling, Security, Audit Trail, DevOps, Localization, Document Advanced, Quality Advanced |
| 77–84 | Safety & Governance | Patient Safety, Consent Mgmt, Workflows, Staff Performance, Financial Planning, Medical Devices, PROMS, Supply Chain |
| 85–92 | Analytics & Coord | BI Reports, Patient Satisfaction, Data Exchange, Care Coordination, Pharmacy Advanced, Infection Advanced |
| 93–100 | Readiness | Capacity Planning, Go-Live Checklist |

## Running Tests

```bash
# Requires PostgreSQL 16 with uuid-ossp and pg_trgm extensions
cp .env.example .env.testing
# Edit .env.testing: DB_DATABASE=cymed_test, QUEUE_CONNECTION=sync, CACHE_STORE=array
php artisan migrate --env=testing
php artisan test --parallel
```

CI runs on every push via `.github/workflows/ci.yml` with PostgreSQL 16 + Redis services.

## Adding a New Wave

1. Create migration `database/migrations/2024_01_01_000NNN_create_*.php` (next sequential number after 097 is 098).
2. Create models under `Modules/YourModule/Models/` with `HasUuids`.
3. Create controller under `Modules/YourModule/Http/Controllers/Api/YourController.php`.
4. Add routes to `routes/api.php` inside the `auth:api` middleware group.
5. Add permissions to `database/seeders/RolesAndPermissionsSeeder.php` and assign to the appropriate roles.
6. Create `tests/Feature/YourModule/YourTest.php` with `RefreshDatabase` + role tests.

## Critical Files

| File | Purpose |
|------|---------|
| `routes/api.php` | All 615 API routes |
| `database/seeders/RolesAndPermissionsSeeder.php` | All roles + permissions (must stay in sync with routes) |
| `database/migrations/2024_01_01_000001–097` | Schema — PostgreSQL only |
| `app/Providers/AuthServiceProvider.php` | Passport config, Gate::before super-admin bypass, break-glass |
| `app/Providers/AppServiceProvider.php` | Model::shouldBeStrict, rate limiting, password policy |
| `.github/workflows/ci.yml` | CI pipeline (PG16 + Redis) |
| `docker/Dockerfile` | PHP 8.4-fpm-alpine production image |

## Common Gotchas

- **`insurance_claims` table already exists** in migration 014 (billing). The RCM module uses `rcm_claims` instead. Never create a table called `insurance_claims` again.
- **guard_name must be `'web'`** for all Spatie permissions/roles — Passport uses `api` guard but Spatie is wired to `web`.
- **`Modules\Core\Models\Facility`** — use this, not `App\Models\Facility`, in tests and controllers.
- **Parallel test teardown** — `--parallel` can produce deadlock warnings on FK constraint drops. These are pre-existing and non-fatal; individual test results are accurate.
- **`Model::shouldBeStrict()`** is on in non-production. Accessing an unloaded relation or an unfilled attribute will throw. Always eager-load and always declare `$fillable`.
- **UUID seeding in tests** — `HasUuids` auto-generates IDs; never pass `'id' => Str::uuid()` in `create()` calls unless testing a specific UUID.

## ERP Backbone Modules (Phase 8)

Seven ERP modules live under `cymed_python/` and `Modules/` — all currently thin stubs that need full build-out per the MASTER_BUILD_PLAN.md Phase 8:

| App (Django) | Module (Laravel) | Domain | Current state |
|---|---|---|---|
| `hr_app` | `HR` | Employee lifecycle, roster, attendance, WPS/GOSI | Partial (6 models) |
| `payroll_app` | `Payroll` | Salary run, EOSB, WPS file, GL posting | Stub only |
| `finance_app` | `Finance` | GL, CoA, AP, AR, bank recon, financial statements | 2 models |
| `inventory_app` | `Inventory` | Item master, movements, FEFO, cold chain, reorder | 3 models |
| `procurement_app` | `Procurement` | PR → RFQ → PO → GRN → 3-way match | Stub only |
| `asset_management_app` | `AssetManagement` | Asset register, depreciation, maintenance, IFRS 16 | Stub only |
| `crm_app` | — | Corporate accounts, referrals, satisfaction, campaigns | Partial |

All ERP modules **must implement Smart Setup Wizards** (see Design Philosophy below) — no raw admin config screens as the default user experience.

## CyMed Design Philosophy — Consumer Simplicity at Enterprise Scale

CyMed must not simply duplicate traditional ERP functionality. Every configuration-heavy area must be redesigned with the following principles:

- **Smart Setup Wizards** — replace raw form-filling with guided, step-by-step flows that surface only what is needed at each stage.
- **Industry Templates** — pre-built configurations for common hospital types (general, specialty, clinic chain, academic medical centre) that users select and then refine.
- **AI Configuration Assistants** — AI-driven dialogue that asks business questions and auto-generates the underlying technical configuration.
- **Guided Business Questions** — replace technical fields (e.g., "Set `depreciation_method`") with plain-language questions (e.g., "How does your hospital track equipment value over time?").
- **Auto-Generated Configurations** — the system produces the correct technical config from business answers; the user never sees raw ERP parameters unless they opt into advanced mode.

Any setup that normally requires an ERP consultant must be completable by a department manager with no ERP experience. Advanced configuration remains available for power users, but the **default** CyMed experience must:

1. Reduce implementation effort by at least **80%** compared to traditional ERP onboarding.
2. Support **100%** of enterprise functionality — simplicity is in the UI layer, not a feature cut.

> **Strategic rationale:** Most ERP vendors compete on features. CyMed competes on enterprise power with consumer-level simplicity. This is one of the biggest opportunities to outperform established systems — transforming technical ERP configuration into business-oriented setup flows that any department manager can complete without specialised ERP knowledge.
