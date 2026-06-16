# CyMed — Enterprise Healthcare ERP

CyMed is a full-stack healthcare operations platform: clinical workflows,
ERP backbone (finance / HR / inventory / procurement / assets / CRM),
Saudi-specific compliance (ZATCA, NPHIES, GOSI), and a CyMed-branded
multi-platform UI.

## Targets

| Target | Status |
|---|---|
| Website (https://cymed.cy-com.com) | Ready to deploy |
| PWA (installable from browser) | Built in |
| Windows desktop (.exe) | Electron app in `electron/` |
| iOS app | Capacitor app in `mobile/` |
| Android app (.aab + .apk) | Capacitor app in `mobile/` |

## Architecture

```
┌────────────────────────────────────────────────────────┐
│  Windows .exe   iOS app    Android app   Browser/PWA   │
│       │            │             │             │       │
│       └────────────┴──────┬──────┴─────────────┘       │
│                           │                            │
│                           ▼                            │
│              ┌─────────── nginx ───────────┐           │
│              │ TLS · WAF · rate-limit · CSP│           │
│              └──┬─────────────────────┬────┘           │
│                 │                     │                │
│                 ▼                     ▼                │
│  ┌───────── Next.js shell ───┐  ┌── cymed_erp ──┐      │
│  │ landing · clinical UI     │  │ branded ERP   │      │
│  │ ERP wrapper pages         │  │ engine        │      │
│  └─────────┬─────────────────┘  └───────┬───────┘      │
│            │                            │              │
│            ▼                            │              │
│  ┌──── cymed_python ─────┐              │              │
│  │ Django clinical apps  │              │              │
│  │ Patient · EMR · Lab · │              │              │
│  │ Pharmacy · Billing    │              │              │
│  └──────┬────────────────┘              │              │
│         │                               │              │
│         └─────────────┬─────────────────┘              │
│                       │                                │
│           ┌───────────▼──────────┐                     │
│           │  PostgreSQL · Redis  │                     │
│           └──────────────────────┘                     │
└────────────────────────────────────────────────────────┘
```

## Repository map

| Path | Purpose |
|---|---|
| `cymed_erp/` | ERP engine + cymed_branding + cymed_landing modules (37 modules) |
| `cymed_python/` | Django clinical apps (75+ modules) |
| `frontend/` | Next.js shell — clinical workspaces + ERP wrapper pages |
| `electron/` | Windows / macOS / Linux desktop wrapper |
| `mobile/` | Capacitor iOS + Android wrapper |
| `nginx/` | Reverse proxy configs (HTTP, HTTPS, security headers) |
| `docs/` | Build, security, compliance, branding documentation |
| `LICENSES/` | Open-source license attributions |
| `docker-compose.full.yml` | Production-ready stack (db + redis + erp + django + nextjs + nginx) |

## Quick start

```bash
# Local development — full stack
docker compose -f docker-compose.full.yml up -d --build
# Visit http://localhost

# Frontend dev only (port 4000)
cd frontend
npm install
npm run dev

# Windows desktop
cd electron
npm install
npm run build:win
# Output: electron/dist/CyMed-1.0.0-x64.exe

# Mobile
cd mobile
npm install
npx cap add ios     # macOS only
npx cap add android
npm run open:ios    # or open:android
```

Full build instructions: [docs/build/BUILD.md](docs/build/BUILD.md)

## Security & compliance

| Document | Purpose |
|---|---|
| [SECURITY_POLICY.md](docs/security/SECURITY_POLICY.md) | Information security policy |
| [SECURITY_AUDIT_REPORT.md](docs/security/SECURITY_AUDIT_REPORT.md) | OWASP ASVS Level 2 audit findings |
| [SECURITY_HARDENING_GUIDE.md](docs/security/SECURITY_HARDENING_GUIDE.md) | Production hardening checklist |
| [INCIDENT_RESPONSE_PLAN.md](docs/security/INCIDENT_RESPONSE_PLAN.md) | IR procedures |
| [COMPLIANCE_CHECKLIST.md](docs/compliance/COMPLIANCE_CHECKLIST.md) | OWASP / ISO / HIPAA / GDPR / NCA tracking |
| [VULNERABILITY_TRACKING.md](docs/compliance/VULNERABILITY_TRACKING.md) | CVE log |
| [SBOM.md](docs/compliance/SBOM.md) | Software bill of materials |

Compliance posture: OWASP ASVS Level 2 (20/21 controls), HIPAA Security
Rule mapped, GDPR Articles 5/15/17/25/32/33 addressed, Saudi NCA-ECC
addressed.

## Design & branding

See [docs/BRANDING_ASSETS.md](docs/BRANDING_ASSETS.md) and
[docs/LANDING_PAGE_DESIGN.md](docs/LANDING_PAGE_DESIGN.md) for the Cybercom
design system, color palette (navy + orange), typography (Inter), and brand
voice.

## Licenses

CyMed is distributed under the LGPL-v3 license (combined work). Underlying
components carry their own licenses; see [LICENSES/](LICENSES/) for full
attribution.

## Support

- Documentation: https://cy-com.com/docs
- Email: support@cy-com.com
- Security disclosure: security@cy-com.com (PGP key in `docs/security/`)
