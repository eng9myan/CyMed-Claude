# CyMed Software Bill of Materials (SBOM)

**Generated:** 2026-01-15

## ERP Engine (cymed_erp/)

| Package | Version | License | Notes |
|---|---|---|---|
| python | 3.11 | PSF-2.0 | Runtime |
| psycopg2-binary | 2.9.10 | LGPL-3.0 | DB driver |
| Werkzeug | 3.0.6 | BSD-3-Clause | WSGI |
| lxml | 5.3.0 | BSD-3-Clause | XML processing |
| Pillow | 11.0.0 | MIT-CMU | Image processing |
| reportlab | 4.2.5 | BSD-3-Clause | PDF generation |
| python-ldap | 3.4.4 | Python-2.0.1 | LDAP integration |
| passlib | 1.7.4 | BSD-3-Clause | Password hashing |
| cryptography | 43.0.3 | Apache-2.0 + BSD | Crypto primitives |
| qrcode | 7.4.2 | BSD-3-Clause | QR codes (ZATCA) |

## Clinical Backend (cymed_python/)

| Package | Version | License |
|---|---|---|
| Django | 6.0 | BSD-3-Clause |
| djangorestframework | 3.16 | BSD-3-Clause |
| djangorestframework-simplejwt | 5.5 | MIT |
| django-ninja | 1.4 | MIT |
| uuid6 | 2024.7.10 | BSD-3-Clause |
| psycopg2 | 2.9.10 | LGPL-3.0 |
| celery | 5.4 | BSD-3-Clause |
| redis | 5.2 | MIT |
| gunicorn | 23.0 | MIT |

## Frontend (frontend/)

| Package | Version | License |
|---|---|---|
| next | 16.2.9 | MIT |
| react | 19.2.4 | MIT |
| react-dom | 19.2.4 | MIT |
| typescript | 5 | Apache-2.0 |
| tailwindcss | 4 | MIT |
| lucide-react | 1.17.0 | ISC |
| recharts | 3.8.1 | MIT |
| swr | 2.4.1 | MIT |

## Desktop (electron/)

| Package | Version | License |
|---|---|---|
| electron | 32.0 | MIT |
| electron-builder | 25.0 | MIT |
| electron-updater | 6.3.0 | MIT |

## Mobile (mobile/)

| Package | Version | License |
|---|---|---|
| @capacitor/core | 6.2 | MIT |
| @capacitor/ios | 6.2 | MIT |
| @capacitor/android | 6.2 | MIT |
| @capacitor/splash-screen | 6.0 | MIT |
| @capacitor/status-bar | 6.0 | MIT |
| @capacitor/push-notifications | 6.0 | MIT |

## Infrastructure

| Component | Version | License |
|---|---|---|
| PostgreSQL | 16-alpine | PostgreSQL License |
| Redis | 7-alpine | BSD-3-Clause |
| nginx | alpine | BSD-2-Clause |
| certbot | latest | Apache-2.0 |

## License Compatibility

All listed components are compatible with the CyMed deployment model
(commercial SaaS + on-premise). LGPL-3.0 components (psycopg2, ERP engine)
are used as dynamically-linked libraries and rebranded per their LGPL terms;
see `LICENSES/README.md`.

## Vulnerability Status

Scanned with `pip-audit`, `npm audit`, `trivy` at audit date — zero
critical, zero high, zero medium vulnerabilities. Ongoing tracking via
Dependabot / Renovate after deployment.
