# CyMed Information Security Policy

**Version:** 1.0 — Effective 2026-01-01
**Owner:** CISO, CyMed Healthcare Systems
**Review cycle:** Annual

## 1. Purpose

This policy establishes the security principles and controls protecting the
confidentiality, integrity, and availability of patient health information
(PHI) and operational data processed by CyMed.

## 2. Scope

Applies to: all CyMed deployments (web, desktop, mobile), all employees,
contractors, and third parties with access to CyMed systems.

## 3. Roles & Responsibilities

| Role | Responsibility |
|---|---|
| CISO | Owns this policy; reviews quarterly |
| Engineering Lead | Implements technical controls; reviews PRs for security |
| DPO | GDPR/HIPAA compliance, data subject requests |
| All staff | Annual security training; reports incidents within 24h |

## 4. Access Control

- **Authentication:** strong passwords (≥12 chars, complexity) + MFA mandatory for clinical roles
- **Authorization:** role-based, least-privilege. Patient PHI accessed only by assigned care team
- **Sessions:** idle timeout 15 min for clinical UIs; absolute lifetime 8h
- **Privileged access:** quarterly review; audit log on every admin action
- **Onboarding/offboarding:** access provisioned/revoked within 24h of role change

## 5. Data Protection

- **Classification:** PHI / PII / Confidential / Internal / Public
- **Encryption at rest:** AES-256 (PostgreSQL TDE / LUKS / encrypted EBS)
- **Encryption in transit:** TLS 1.2+ (TLS 1.3 preferred); HSTS enforced
- **PHI field-level encryption** for SSN, financial identifiers, sensitive diagnoses
- **Backups:** encrypted at rest; tested quarterly; 90-day retention minimum

## 6. Network & Infrastructure

- All admin access via VPN + SSH key (no password auth)
- Firewall: default-deny; only 80, 443, 22 (restricted IPs) open
- WAF (ModSecurity / AWS WAF) on all public endpoints
- DDoS protection via Cloudflare or AWS Shield
- Production network segregated from development/staging

## 7. Incident Response

- Incidents reported to security@cy-com.com within 1h of discovery
- IR team activates Incident Response Plan (see INCIDENT_RESPONSE_PLAN.md)
- HIPAA breach: notification within 60 days; GDPR breach: 72 hours
- Post-incident review within 14 days; corrective actions tracked

## 8. Acceptable Use

- No sharing of credentials; password managers required
- No PHI on personal devices, USB, or unencrypted storage
- No email attachments containing PHI without encryption
- Monthly mandatory security update for all workstations

## 9. Compliance

CyMed implements controls aligned with:
- HIPAA Security Rule (45 CFR § 164.302-318)
- GDPR (Articles 25, 32, 33, 35)
- ISO/IEC 27001:2022
- OWASP ASVS v4.0 Level 2
- NIST Cybersecurity Framework 2.0
- Saudi NCA Essential Cybersecurity Controls (ECC-1:2018)

## 10. Policy Violations

Violations are reported to the CISO. Investigation may result in
disciplinary action up to and including termination, civil action, or
criminal prosecution as appropriate.

## 11. Review & Amendments

This policy is reviewed annually or upon material change to systems,
regulations, or threat landscape. Amendments require CISO + CTO approval.

---

*Approved by: CISO, CyMed Healthcare Systems · 2026-01-01*
