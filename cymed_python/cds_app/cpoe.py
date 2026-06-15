"""
CPOE — Computerized Physician Order Entry with CDS Hard/Soft stops.
CDS checks: drug allergy, drug-drug interaction, dose range, renal dose adjustment, duplicate orders.
"""
from __future__ import annotations
import logging
from dataclasses import dataclass, field
from typing import Literal

log = logging.getLogger("cpoe_cds")

AlertSeverity = Literal["hard", "soft", "info"]


@dataclass
class CDSAlert:
    severity: AlertSeverity
    code:     str
    title:    str
    message:  str
    override_required: bool = False


@dataclass
class OrderCheckResult:
    order_id:    str
    passed:      bool
    alerts:      list[CDSAlert] = field(default_factory=list)
    hard_stops:  list[CDSAlert] = field(default_factory=list)
    soft_stops:  list[CDSAlert] = field(default_factory=list)
    infos:       list[CDSAlert] = field(default_factory=list)

    def __post_init__(self):
        for a in self.alerts:
            if a.severity == "hard":
                self.hard_stops.append(a)
            elif a.severity == "soft":
                self.soft_stops.append(a)
            else:
                self.infos.append(a)
        self.passed = len(self.hard_stops) == 0


def check_order(
    *,
    patient_id,
    encounter_id,
    drug_name: str,
    dose_mg: float,
    route: str,
    frequency: str,
    current_meds: list[str] | None = None,
    allergies: list[str] | None = None,
    egfr: float | None = None,
    weight_kg: float | None = None,
) -> OrderCheckResult:
    """
    Run all CDS checks on a new medication order.
    Returns OrderCheckResult — if hard_stops exist, order MUST be blocked.
    """
    alerts: list[CDSAlert] = []
    current_meds = current_meds or []
    allergies    = allergies or []
    drug_upper   = drug_name.upper()

    # 1. Drug allergy check
    for allergen in allergies:
        if allergen.upper() in drug_upper or drug_upper in allergen.upper():
            alerts.append(CDSAlert(
                severity="hard", code="ALLERGY_MATCH",
                title=f"Allergy Alert: {drug_name}",
                message=f"Patient has documented allergy to {allergen}. This order is blocked.",
                override_required=True,
            ))

    # 2. Duplicate order check
    for med in current_meds:
        if med.upper() == drug_upper:
            alerts.append(CDSAlert(
                severity="soft", code="DUPLICATE_ORDER",
                title="Duplicate Medication",
                message=f"{drug_name} is already ordered for this patient.",
            ))

    # 3. Drug-drug interactions (simplified — real system uses RxNorm/SNOMED)
    DDI_PAIRS = [
        ({"warfarin"}, {"aspirin","ibuprofen","naproxen"}, "hard", "WARFARIN_NSAID",
         "Warfarin + NSAID increases bleeding risk significantly."),
        ({"ssri","fluoxetine","sertraline","citalopram"}, {"tramadol","fentanyl"},
         "hard", "SEROTONIN_SYNDROME", "Risk of serotonin syndrome."),
        ({"metformin"}, {"contrast"}, "soft", "METFORMIN_CONTRAST",
         "Hold metformin 48h before/after IV contrast."),
        ({"ace inhibitor","lisinopril","enalapril"}, {"potassium"}, "soft", "HYPERKALEMIA_RISK",
         "Monitor potassium — ACE inhibitor + potassium supplementation risk."),
    ]
    for drug_set_a, drug_set_b, sev, code, msg in DDI_PAIRS:
        drug_matches_a = any(d in drug_upper.lower() for d in drug_set_a)
        existing_matches_b = any(
            any(d in m.lower() for d in drug_set_b)
            for m in current_meds
        )
        drug_matches_b = any(d in drug_upper.lower() for d in drug_set_b)
        existing_matches_a = any(
            any(d in m.lower() for d in drug_set_a)
            for m in current_meds
        )
        if (drug_matches_a and existing_matches_b) or (drug_matches_b and existing_matches_a):
            alerts.append(CDSAlert(severity=sev, code=code, title="Drug Interaction", message=msg))  # type: ignore[arg-type]

    # 4. Renal dose adjustment
    RENAL_ADJUST = {
        "metformin": 30,   # eGFR threshold below which to block
        "gabapentin": 30,
        "ciprofloxacin": 30,
        "vancomycin": 50,
    }
    if egfr is not None:
        for drug, threshold in RENAL_ADJUST.items():
            if drug in drug_upper.lower() and egfr < threshold:
                sev = "hard" if egfr < threshold * 0.5 else "soft"
                alerts.append(CDSAlert(
                    severity=sev, code="RENAL_DOSE_ADJUST",  # type: ignore[arg-type]
                    title=f"Renal Dose Alert — {drug_name}",
                    message=f"Patient eGFR {egfr:.0f} < {threshold}. Dose adjustment required.",
                ))

    # 5. Dose range check (simplified)
    MAX_DOSES = {
        "acetaminophen": 4000,  # mg/day
        "ibuprofen": 2400,
        "aspirin": 4000,
    }
    daily_doses = {"daily": 1, "bid": 2, "tid": 3, "qid": 4, "q4h": 6, "q6h": 4, "q8h": 3}
    freq_mult = daily_doses.get(frequency.lower().split()[0], 1)
    daily_dose = dose_mg * freq_mult
    for drug, max_dose in MAX_DOSES.items():
        if drug in drug_upper.lower() and daily_dose > max_dose:
            alerts.append(CDSAlert(
                severity="hard", code="DOSE_EXCEEDS_MAX",
                title=f"Maximum Dose Exceeded — {drug_name}",
                message=f"Ordered daily dose {daily_dose}mg exceeds maximum {max_dose}mg.",
            ))

    result = OrderCheckResult(order_id="", alerts=alerts)
    if alerts:
        log.info("CDS check for %s: %d alerts (%d hard, %d soft)",
                 drug_name, len(alerts), len(result.hard_stops), len(result.soft_stops))
    return result
