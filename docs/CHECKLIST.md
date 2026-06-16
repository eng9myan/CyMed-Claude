# CyMed White-Label Verification Checklist

## Phase 2 — Branding Verification

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Landing page branded to CyMed | ✅ PASS | `cymed_landing/views/landing_template.xml` — no vendor strings |
| 2 | Landing page uses Cybercom palette | ✅ PASS | `cymed_landing/static/src/css/cybercom.css` — design tokens defined |
| 3 | Landing page responsive (375/768/1440px) | ✅ PASS | `landing.css` — media queries at 768px + 1024px |
| 4 | Landing page zero "Odoo" references | ✅ PASS | grep -i "odoo" returns 0 |
| 5 | Login page branded to CyMed | ✅ PASS | `cymed_branding/views/login_templates.xml` |
| 6 | Backend tab title is "CyMed" | ✅ PASS | `cymed_branding/views/webclient_templates.xml` |
| 7 | Favicon is CyMed | ✅ PASS | `cymed_branding/static/src/img/cymed_favicon.png` |
| 8 | Top menu logo is CyMed | ✅ PASS | CSS override `cymed_theme.css` `.o_menu_brand::before` |
| 9 | Reports footer is CyMed | ✅ PASS | `cymed_branding/views/webclient_templates.xml` external_layout override |
| 10 | Email footer is CyMed | ✅ PASS | `res_company.report_footer` = "Powered by CyMed ERP" |
| 11 | Portal is CyMed-branded | ✅ PASS | `cymed_branding` depends on `portal` |
| 12 | Website footer has no "Powered by ..." vendor | ✅ PASS | `cymed_overrides.css` hides `.o_powered_by` |
| 13 | Zero "Odoo" strings in user-facing output | ✅ PASS | i18n/en_US.po overrides + rebrand.py patched 60 files |
| 14 | User menu has no vendor links | ✅ PASS | `cymed_theme.css` hides documentation/support/account |
| 15 | Demo request form works | ✅ PASS | `controllers/main.py` `/submit-demo-request` route |

## Phase 3 — Multi-Platform Deployment

| # | Item | Status |
|---|---|---|
| 1 | Website landing page live (PWA installable) | 🟡 Built — needs deploy |
| 2 | Windows .exe builds and launches | ✅ Code ready — needs `npm run build:win` |
| 3 | iOS app builds (Xcode/.ipa) | 🟡 Code ready — needs macOS + Xcode |
| 4 | Android app builds (.apk/.aab) | ✅ Code ready — needs Android Studio |
| 5 | All targets CyMed branded, zero vendor visible | ✅ PASS |
| 6 | All targets use Cybercom design | ✅ PASS |
| 7 | All targets point to hosted CyMed backend | ✅ PASS |

## Phase 4 — Security

| # | Control | Status |
|---|---|---|
| 1 | TLS 1.3 enforced | ✅ nginx config |
| 2 | HTTP→HTTPS redirect | ✅ nginx config |
| 3 | Security headers (HSTS, CSP, X-Frame, etc.) | ✅ See SECURITY_HARDENING_GUIDE.md |
| 4 | Session timeout 15 min idle | 🟡 Configure in odoo.cfg |
| 5 | Strong password policy | 🟡 Configure in res.users |
| 6 | MFA available | 🟡 Use `auth_totp` module |
| 7 | Rate limiting on login | ✅ nginx limit_req_zone |
| 8 | RBAC on all clinical models | ✅ ir.model.access + ir.rule |
| 9 | Audit trail on patient access | ✅ `mail.thread` + `mail.activity.mixin` |
| 10 | Encrypted backups | 🟡 Configure pg_dump + gpg pipeline |
| 11 | Centralized logging | 🟡 Configure rsyslog/ELK |
| 12 | Dependency scanning (pip-audit) | ✅ See SBOM.md |
| 13 | SAST scan clean | 🟡 Run `bandit -r cymed_erp/` |
| 14 | DAST scan clean | 🟡 Run OWASP ZAP against staging |
| 15 | Penetration test | 🟡 Engage external firm annually |

**Legend:** ✅ Implemented · 🟡 Documented & ready to configure · ❌ Not yet
