"""Tests for CPOE CDS (Clinical Decision Support) checks."""
from django.test import SimpleTestCase
from cds_app.cpoe import check_order


class TestCDSAllergy(SimpleTestCase):

    def test_allergy_match_is_hard_stop(self):
        result = check_order(
            patient_id="p1", encounter_id="e1",
            drug_name="Penicillin",
            dose_mg=500, route="PO", frequency="qid",
            allergies=["Penicillin"],
        )
        self.assertFalse(result.passed)
        self.assertTrue(any(a.code == "ALLERGY_MATCH" for a in result.hard_stops))

    def test_no_allergy_passes(self):
        result = check_order(
            patient_id="p1", encounter_id="e1",
            drug_name="Amoxicillin",
            dose_mg=500, route="PO", frequency="tid",
            allergies=["Sulfa"],
        )
        # No allergy match
        self.assertFalse(any(a.code == "ALLERGY_MATCH" for a in result.alerts))


class TestCDSDuplicate(SimpleTestCase):

    def test_duplicate_is_soft_stop(self):
        result = check_order(
            patient_id="p1", encounter_id="e1",
            drug_name="Aspirin",
            dose_mg=100, route="PO", frequency="daily",
            current_meds=["Aspirin"],
        )
        self.assertTrue(any(a.code == "DUPLICATE_ORDER" for a in result.soft_stops))

    def test_no_duplicate_passes(self):
        result = check_order(
            patient_id="p1", encounter_id="e1",
            drug_name="Aspirin",
            dose_mg=100, route="PO", frequency="daily",
            current_meds=["Metformin", "Lisinopril"],
        )
        self.assertFalse(any(a.code == "DUPLICATE_ORDER" for a in result.alerts))


class TestCDSRenalDose(SimpleTestCase):

    def test_metformin_blocked_low_egfr(self):
        result = check_order(
            patient_id="p1", encounter_id="e1",
            drug_name="Metformin",
            dose_mg=500, route="PO", frequency="bid",
            egfr=20.0,
        )
        self.assertTrue(any(a.code == "RENAL_DOSE_ADJUST" for a in result.alerts))

    def test_metformin_ok_normal_egfr(self):
        result = check_order(
            patient_id="p1", encounter_id="e1",
            drug_name="Metformin",
            dose_mg=500, route="PO", frequency="bid",
            egfr=75.0,
        )
        self.assertFalse(any(a.code == "RENAL_DOSE_ADJUST" for a in result.alerts))


class TestCDSMaxDose(SimpleTestCase):

    def test_paracetamol_exceeds_max_is_hard_stop(self):
        # 1000mg x 6 = 6000mg > 4000mg max
        result = check_order(
            patient_id="p1", encounter_id="e1",
            drug_name="Acetaminophen",
            dose_mg=1000, route="PO", frequency="q4h",
        )
        self.assertFalse(result.passed)
        self.assertTrue(any(a.code == "DOSE_EXCEEDS_MAX" for a in result.hard_stops))

    def test_paracetamol_safe_dose(self):
        # 500mg x 4 = 2000mg < 4000mg
        result = check_order(
            patient_id="p1", encounter_id="e1",
            drug_name="Acetaminophen",
            dose_mg=500, route="PO", frequency="qid",
        )
        self.assertFalse(any(a.code == "DOSE_EXCEEDS_MAX" for a in result.alerts))


class TestCDSDDI(SimpleTestCase):

    def test_warfarin_nsaid_is_hard_stop(self):
        result = check_order(
            patient_id="p1", encounter_id="e1",
            drug_name="Ibuprofen",
            dose_mg=400, route="PO", frequency="tid",
            current_meds=["Warfarin"],
        )
        self.assertTrue(any(a.code == "WARFARIN_NSAID" for a in result.alerts))
        hard_codes = [a.code for a in result.hard_stops]
        self.assertIn("WARFARIN_NSAID", hard_codes)

    def test_no_ddi_clean_order(self):
        result = check_order(
            patient_id="p1", encounter_id="e1",
            drug_name="Vitamin D",
            dose_mg=1000, route="PO", frequency="daily",
            current_meds=["Metformin"],
        )
        self.assertTrue(result.passed)
