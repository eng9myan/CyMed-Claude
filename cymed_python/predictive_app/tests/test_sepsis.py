"""Tests for predictive sepsis alert engine."""
from django.test import SimpleTestCase
from predictive_app.sepsis_alert import assess_patient, compute_qsofa, _compute_news2


class TestNEWS2(SimpleTestCase):

    def test_normal_vitals_score_zero(self):
        score = _compute_news2(rr=16, hr=72, sbp=120, temp=36.8, spo2=98, gcs=15)
        self.assertEqual(score, 0)

    def test_septic_shock_high_score(self):
        score = _compute_news2(rr=28, hr=130, sbp=85, temp=38.9, spo2=90, gcs=12)
        self.assertGreaterEqual(score, 9)

    def test_elevated_rr_scores(self):
        score = _compute_news2(rr=22, hr=80, sbp=120, temp=37.0, spo2=98, gcs=15)
        self.assertGreaterEqual(score, 2)

    def test_low_spo2_scores(self):
        score = _compute_news2(rr=16, hr=80, sbp=120, temp=37.0, spo2=91, gcs=15)
        self.assertGreaterEqual(score, 3)


class TestQSOFA(SimpleTestCase):

    def test_all_three_max_score(self):
        score = compute_qsofa(respiratory_rate=25, altered_mentation=True, sbp=95)
        self.assertEqual(score, 3)

    def test_normal_zero_score(self):
        score = compute_qsofa(respiratory_rate=16, altered_mentation=False, sbp=120)
        self.assertEqual(score, 0)


class TestSepsisAssessment(SimpleTestCase):

    def test_critical_patient_triggers_alert(self):
        result = assess_patient(
            patient_id="p1",
            encounter_id="e1",
            vitals={"respiratory_rate": 26, "heart_rate": 130, "sbp": 85,
                    "temp_c": 39.5, "spo2": 88, "gcs": 12},
            labs={"lactate": 3.2, "creatinine": 1.8},
        )
        self.assertTrue(result.alert_triggered)
        self.assertIn(result.risk_level, ["high", "critical"])

    def test_normal_patient_no_alert(self):
        result = assess_patient(
            patient_id="p2",
            encounter_id="e2",
            vitals={"respiratory_rate": 16, "heart_rate": 72, "sbp": 120,
                    "temp_c": 36.8, "spo2": 99, "gcs": 15},
        )
        self.assertFalse(result.alert_triggered)
        self.assertEqual(result.risk_level, "low")

    def test_recommendations_present_on_critical(self):
        result = assess_patient(
            patient_id="p3",
            encounter_id="e3",
            vitals={"respiratory_rate": 28, "heart_rate": 135, "sbp": 80,
                    "temp_c": 40.0, "spo2": 87, "gcs": 11},
        )
        self.assertGreater(len(result.recommendations), 0)
        recs_text = " ".join(result.recommendations).lower()
        self.assertIn("sepsis", recs_text)

    def test_lactate_critical_flag(self):
        result = assess_patient(
            patient_id="p4",
            encounter_id="e4",
            vitals={"respiratory_rate": 22, "heart_rate": 110, "sbp": 95,
                    "temp_c": 38.5, "spo2": 93, "gcs": 14},
            labs={"lactate": 4.5},
        )
        self.assertTrue(result.alert_triggered)
        # Should have critical lactate in first recommendation
        self.assertTrue(any("lactate" in r.lower() for r in result.recommendations))
