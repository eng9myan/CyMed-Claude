# CyMed Compliance Tracking

## OWASP ASVS v4.0 — Level 2

| Req | Control | Status | Evidence |
|---|---|---|---|
| V1.1 | Threat model documented | ✅ | docs/THREAT_MODEL.md |
| V1.2 | Architecture documented | ✅ | docs/ARCHITECTURE.md |
| V2.1 | Strong passwords (≥12 chars, complexity) | ✅ | hardening guide §5 |
| V2.2 | MFA available | ✅ | auth_totp module |
| V2.3 | Account lockout / rate limiting | ✅ | nginx limit_req |
| V3.1 | Secure session cookies | ✅ | HttpOnly+Secure+SameSite |
| V3.2 | Session timeout | ✅ | 15 min idle, 8h absolute |
| V4.1 | RBAC implemented | ✅ | ir.model.access + ir.rule |
| V4.2 | Least-privilege enforced | ✅ | reviewed per module |
| V5.1 | Input validation | ✅ | ORM + form validation |
| V5.2 | Output encoding | ✅ | QWeb t-esc, React auto-escape |
| V6.1 | TLS 1.2+ | ✅ | nginx ssl_protocols |
| V6.2 | Strong ciphers | ✅ | Mozilla modern profile |
| V7.1 | No sensitive data in errors | ✅ | debug=False in prod |
| V8.1 | PHI encryption at rest | 🟡 | OS-level config required |
| V9.1 | All comms over TLS | ✅ | HTTPS-only |
| V10.1 | No malicious code introduction | ✅ | code review process |
| V11.1 | Business logic guards | ✅ | state machines |
| V12.1 | File upload validation | ✅ | ir.attachment type/size |
| V13.1 | API authentication | ✅ | JWT + JSON-RPC session |
| V14.1 | Production config hardened | ✅ | hardening guide |

**Score: 20/21 PASS, 1/21 CONFIG-PENDING — Level 2 compliant pending deployment hardening**

## ISO/IEC 27001:2022

| Control | Status |
|---|---|
| A.5 Organizational Policies | ✅ SECURITY_POLICY.md |
| A.6 People Controls (training) | 🟡 Annual training scheduled |
| A.7 Physical Controls | ✅ Cloud provider responsibility (AWS/Azure compliance) |
| A.8.1 User endpoint security | 🟡 Customer responsibility |
| A.8.2 Privileged access | ✅ MFA + audit |
| A.8.3 Information access | ✅ RBAC |
| A.8.4 Access to source code | ✅ Private repo + branch protection |
| A.8.5 Secure authentication | ✅ bcrypt + MFA |
| A.8.6 Capacity management | ✅ workers + memory limits |
| A.8.7 Protection from malware | ✅ Container scanning |
| A.8.8 Technical vulnerabilities | ✅ pip-audit + npm audit |
| A.8.9 Configuration management | ✅ IaC (Terraform) |
| A.8.10 Information deletion | ✅ Soft-delete + retention |
| A.8.11 Data masking | 🟡 Module recommended |
| A.8.12 DLP | 🟡 Customer-side controls |
| A.8.13 Backups | ✅ Encrypted, tested |
| A.8.14 Redundancy | ✅ Multi-AZ deployment guide |
| A.8.15 Logging | ✅ Syslog + retention |
| A.8.16 Monitoring | ✅ Documented |
| A.8.17 Time synchronization | ✅ NTP enabled |
| A.8.18 Use of privileged utilities | ✅ Restricted |
| A.8.19 Software installation | ✅ Approved modules only |
| A.8.20 Network controls | ✅ Firewall + WAF |
| A.8.21 Network services security | ✅ Only 80/443/22 |
| A.8.22 Network segregation | ✅ VPC subnets |
| A.8.23 Web filtering | ✅ CSP |
| A.8.24 Cryptography | ✅ AES-256, TLS 1.3 |
| A.8.25 SDLC | ✅ Code review + CI |
| A.8.26 Application security | ✅ This audit |
| A.8.27 Secure architecture | ✅ Documented |
| A.8.28 Secure coding | ✅ Linting + SAST |
| A.8.29 Security testing | ✅ SAST/DAST in CI |
| A.8.30 Outsourced development | N/A |
| A.8.31 Dev/test/prod separation | ✅ Documented |
| A.8.32 Change management | ✅ Git workflow |
| A.8.33 Test information | ✅ Anonymized fixtures |
| A.8.34 Audit testing | ✅ This document |

## HIPAA Security Rule (45 CFR § 164.302-318)

| Safeguard | Implementation |
|---|---|
| §164.308(a)(1) Security management | SECURITY_POLICY.md |
| §164.308(a)(2) Assigned security responsibility | CISO designated |
| §164.308(a)(3) Workforce security | Onboarding/offboarding process |
| §164.308(a)(4) Information access management | RBAC |
| §164.308(a)(5) Security awareness training | Annual + phishing simulation |
| §164.308(a)(6) Security incident procedures | INCIDENT_RESPONSE_PLAN.md |
| §164.308(a)(7) Contingency plan | Backup + DR documented |
| §164.308(a)(8) Evaluation | Annual audit + this report |
| §164.310 Physical safeguards | Cloud provider compliance |
| §164.312(a) Access control | Unique user ID, auto-logoff, encryption |
| §164.312(b) Audit controls | Audit logs on PHI access |
| §164.312(c) Integrity | Versioning + checksums |
| §164.312(d) Authentication | bcrypt + MFA |
| §164.312(e) Transmission security | TLS 1.3 |

## GDPR

| Article | Implementation |
|---|---|
| Art. 5 (principles) | Lawfulness, purpose limitation, minimization documented |
| Art. 6 (lawfulness) | Consent + contract + legal obligation |
| Art. 13 (information) | Privacy notice at registration |
| Art. 15 (access) | Data export wizard |
| Art. 16 (rectification) | User profile editable |
| Art. 17 (erasure) | Delete request workflow |
| Art. 25 (privacy by design) | Default-private RBAC |
| Art. 32 (security) | This audit covers |
| Art. 33 (breach notification) | 72-hour process in IR plan |
| Art. 35 (DPIA) | DPIA template available |

## Saudi NCA ECC-1:2018

| Domain | Coverage |
|---|---|
| Governance | SECURITY_POLICY.md + CISO designation |
| Cybersecurity defence | nginx + WAF + IDS recommendations |
| Cybersecurity resilience | DR plan + backups |
| Third-party cybersecurity | Vendor assessment template |
| Industrial control | N/A (healthcare ERP) |
| Cloud computing | Cloud security responsibility matrix |
