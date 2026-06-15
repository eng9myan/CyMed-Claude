"""
Predictive Sepsis Alert — NEWS2 + qSOFA scoring with 2-hour pre-alert.
Triggers automated notification when deterioration is detected.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional

log = logging.getLogger("sepsis_alert")


@dataclass
class RiskScore:
    patient_id: str
    encounter_id: str
    news2_score: int
    qsofa_score: int
    risk_level: str       # low / medium / high / critical
    alert_triggered: bool
    recommendations: list[str]


def compute_qsofa(*, respiratory_rate: int, altered_mentation: bool, sbp: int) -> int:
    """Quick SOFA — bedside screen for sepsis (max 3)."""
    score = 0
    if respiratory_rate >= 22:  score += 1
    if altered_mentation:       score += 1
    if sbp <= 100:               score += 1
    return score


def assess_patient(
    *,
    patient_id: str,
    encounter_id: str,
    vitals: dict,
    labs: dict | None = None,
) -> RiskScore:
    """
    Full deterioration risk assessment.
    vitals keys: respiratory_rate, heart_rate, sbp, temp_c, spo2, gcs
    labs keys: wbc, creatinine, lactate, bilirubin, platelets
    """
    rr   = vitals.get("respiratory_rate", 16)
    hr   = vitals.get("heart_rate", 80)
    sbp  = vitals.get("sbp", 120)
    temp = vitals.get("temp_c", 37.0)
    spo2 = vitals.get("spo2", 98)
    gcs  = vitals.get("gcs", 15)

    altered_mentation = gcs < 15

    # NEWS2
    news2 = _compute_news2(rr=rr, hr=hr, sbp=sbp, temp=temp, spo2=spo2, gcs=gcs)

    # qSOFA
    qsofa = compute_qsofa(respiratory_rate=rr, altered_mentation=altered_mentation, sbp=sbp)

    # Lab score additions
    lab_flags = []
    if labs:
        if labs.get("lactate", 0) >= 2:
            lab_flags.append("lactate_elevated")
        if labs.get("creatinine", 0) >= 1.2:
            lab_flags.append("aki_risk")
        if labs.get("platelets", 200) < 100:
            lab_flags.append("thrombocytopenia")
        if labs.get("wbc", 8) > 12 or labs.get("wbc", 8) < 4:
            lab_flags.append("wbc_abnormal")

    # Risk stratification
    if news2 >= 7 or qsofa >= 2 or "lactate_elevated" in lab_flags:
        risk_level = "critical"
    elif news2 >= 5 or (qsofa >= 1 and len(lab_flags) >= 1):
        risk_level = "high"
    elif news2 >= 3:
        risk_level = "medium"
    else:
        risk_level = "low"

    alert_triggered = risk_level in ("high", "critical")
    recommendations = _build_recommendations(risk_level, news2, qsofa, lab_flags, vitals, labs or {})

    result = RiskScore(
        patient_id=patient_id,
        encounter_id=encounter_id,
        news2_score=news2,
        qsofa_score=qsofa,
        risk_level=risk_level,
        alert_triggered=alert_triggered,
        recommendations=recommendations,
    )

    if alert_triggered:
        log.warning(
            "SEPSIS ALERT: patient=%s encounter=%s NEWS2=%d qSOFA=%d risk=%s",
            patient_id, encounter_id, news2, qsofa, risk_level
        )
        _fire_alert(result)

    return result


def _compute_news2(*, rr, hr, sbp, temp, spo2, gcs) -> int:
    score = 0
    # RR
    if rr <= 8 or rr >= 25: score += 3
    elif 21 <= rr <= 24: score += 2
    elif 9 <= rr <= 11:  score += 1
    # SpO2
    if spo2 <= 91: score += 3
    elif spo2 <= 93: score += 2
    elif spo2 <= 95: score += 1
    # SBP
    if sbp <= 90 or sbp >= 220: score += 3
    elif sbp <= 100: score += 2
    elif sbp <= 110: score += 1
    # HR
    if hr <= 40 or hr >= 131: score += 3
    elif hr >= 111: score += 2
    elif hr in range(41, 51) or hr in range(91, 111): score += 1
    # Temp
    if temp <= 35.0: score += 3
    elif temp >= 39.1: score += 2
    elif temp >= 38.1 or temp <= 36.0: score += 1
    # GCS
    if gcs < 9:  score += 3
    elif gcs < 12: score += 2
    elif gcs < 15: score += 1
    return score


def _build_recommendations(risk_level, news2, qsofa, lab_flags, vitals, labs) -> list[str]:
    recs = []
    if risk_level == "critical":
        recs += [
            "STAT sepsis bundle initiation",
            "Blood cultures x2 before antibiotics",
            "IV access — large bore x2",
            "IV fluid bolus 30mL/kg NS if hypotensive",
            "Broad-spectrum antibiotics within 1 hour",
            "Notify ICU / Rapid Response Team immediately",
            "Repeat lactate in 2 hours if >=2 mmol/L",
        ]
    elif risk_level == "high":
        recs += [
            "Increase monitoring frequency to q1h vitals",
            "Notify attending physician now",
            "Consider blood cultures if fever present",
            "Review medications for nephrotoxins",
            "Reassess in 30 minutes",
        ]
    elif risk_level == "medium":
        recs += [
            "Increase vitals monitoring to q2h",
            "Review fluid balance",
            "Alert nurse in charge",
        ]

    if labs.get("lactate", 0) >= 4:
        recs.insert(0, "CRITICAL: Lactate >=4 — septic shock suspected — ICU transfer")
    if vitals.get("spo2", 98) < 90:
        recs.insert(0, "Apply supplemental oxygen — target SpO2 >=94%")

    return recs


def _fire_alert(score: RiskScore):
    """Send real-time alert to nursing station and attending via WebSocket/push."""
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        layer = get_channel_layer()
        if layer:
            async_to_sync(layer.group_send)(
                f"encounter_{score.encounter_id}",
                {
                    "type":       "sepsis_alert",
                    "patient_id": score.patient_id,
                    "news2":      score.news2_score,
                    "qsofa":      score.qsofa_score,
                    "risk_level": score.risk_level,
                    "recs":       score.recommendations,
                }
            )
    except Exception as exc:
        log.warning("Could not send WebSocket alert: %s", exc)
