# CyMed Incident Response Plan

**Owner:** CISO · **Version:** 1.0 · **Review:** Annual

## 1. Incident Classification

| Severity | Definition | Initial response time |
|---|---|---|
| **SEV-1 Critical** | PHI breach confirmed; active exploitation; full outage | 15 min |
| **SEV-2 High** | Suspected breach; partial outage; auth bypass attempt | 1 hour |
| **SEV-3 Medium** | Unauthorized access attempt blocked; single-user impact | 4 hours |
| **SEV-4 Low** | Policy violation; suspicious activity logged | 24 hours |

## 2. The 6-Phase Process

### Phase 1 — Detection (0-15 min)
- Source: SIEM alerts, user reports (security@cy-com.com), monitoring dashboards
- On-call engineer triages within initial response time
- Open INC-{YYYYMMDD}-{N} ticket in incident tracker
- Notify Incident Commander (IC)

### Phase 2 — Triage (15-30 min)
- IC classifies severity using table above
- Activates IR team:
  - SEV-1/2: CISO + Eng Lead + DPO + Legal + Comms
  - SEV-3: Eng Lead + Security Engineer
  - SEV-4: Security Engineer alone
- Create war-room Slack channel: `#inc-{ticket}`

### Phase 3 — Containment (30 min - 4 h)
**Short-term (stop the bleeding):**
- Block attacker IPs at WAF
- Revoke compromised credentials
- Disable affected accounts
- Take affected nodes offline if needed

**Long-term (sustainable fix):**
- Patch the vulnerability
- Rotate all related secrets (DB passwords, JWT keys, API tokens)
- Restore from clean backup if data integrity in doubt

### Phase 4 — Eradication (4 - 24 h)
- Remove attacker artifacts (web shells, scheduled jobs, modified configs)
- Run full malware scan
- Verify no persistence mechanisms remain
- Restore service from known-good state

### Phase 5 — Recovery (24 - 72 h)
- Bring services back online progressively
- Monitor for recurrence with elevated logging
- Hold position on enhanced monitoring for 14 days
- Communicate restoration status to stakeholders

### Phase 6 — Post-Incident Review (within 14 days)
- Blameless retrospective with full IR team
- Root cause analysis (5 Whys)
- Update detection rules and runbooks
- Track corrective actions in incident tracker
- File report: `INC-{ticket}_postmortem.md`

## 3. Regulatory Notification

| Regime | Notification trigger | Deadline |
|---|---|---|
| HIPAA | Unsecured PHI breach > 500 individuals | 60 days |
| HIPAA | Unsecured PHI breach < 500 individuals | Annual log |
| GDPR | Personal data breach with risk to rights | 72 hours to DPA |
| GDPR | High risk to data subjects | Without undue delay |
| Saudi NCA | Cybersecurity incident affecting critical systems | 72 hours |
| State (US) | Per applicable state law | Varies |

## 4. Communication Plan

### Internal
- IC: every 30 min during active incident
- Executive team: SEV-1/2 immediately, then hourly
- All staff: only what they need to know to do their job safely

### External
- **Customers:** Status page (status.cy-com.com) within 1 h of confirmation
- **Regulators:** per Section 3 deadlines
- **Affected individuals:** per regulatory requirement (HIPAA/GDPR templates ready)
- **Media:** ONLY through CISO + Legal + Comms; no individual statements

## 5. Contact List

| Role | Primary | Backup |
|---|---|---|
| Incident Commander | security@cy-com.com | ciso@cy-com.com |
| Engineering Lead | eng-lead@cy-com.com | cto@cy-com.com |
| Data Protection Officer | dpo@cy-com.com | legal@cy-com.com |
| Legal Counsel | legal@cy-com.com | external counsel |
| Executive | ceo@cy-com.com | coo@cy-com.com |
| External IR Firm | (retainer) | (retainer) |
| Insurance Carrier | cyber-claims@insurer.com | broker |

## 6. Runbooks (referenced from this plan)

- `runbooks/credential-compromise.md`
- `runbooks/sql-injection-detected.md`
- `runbooks/ransomware-response.md`
- `runbooks/dos-mitigation.md`
- `runbooks/phi-exfiltration.md`
- `runbooks/insider-threat.md`

## 7. Testing

- **Tabletop exercise:** quarterly (1 hour)
- **Red team exercise:** annual
- **Backup restoration drill:** monthly
- **IR team training:** semi-annual

## 8. Authority

The Incident Commander has full authority to take any technical action
required for containment, including service shutdown, without prior
approval. Financial commitments above $50,000 require CFO approval.

---

*Approved by: CISO · CTO · CEO · 2026-01-01*
