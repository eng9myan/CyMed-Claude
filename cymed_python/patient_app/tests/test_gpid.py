"""Tests for GPID generation and EMPI service."""
import pytest
from django.test import TestCase
from patient_app.gpid_service import generate_gpid, validate_gpid, get_or_create_global_patient
from datetime import date


class TestGPIDGeneration(TestCase):

    def test_format_is_valid(self):
        gpid = generate_gpid("SA")
        self.assertTrue(validate_gpid(gpid), f"Invalid GPID: {gpid}")

    def test_starts_with_cym(self):
        gpid = generate_gpid("SA")
        self.assertTrue(gpid.startswith("CYM-SA-"))

    def test_year_in_gpid(self):
        gpid = generate_gpid("SA")
        self.assertIn("2026", gpid)

    def test_different_country(self):
        gpid = generate_gpid("AE")
        self.assertTrue(gpid.startswith("CYM-AE-"))

    def test_validate_invalid(self):
        self.assertFalse(validate_gpid("INVALID"))
        self.assertFalse(validate_gpid("CYM-SA-2026"))
        self.assertFalse(validate_gpid(""))

    def test_uniqueness(self):
        ids = {generate_gpid("SA") for _ in range(100)}
        self.assertEqual(len(ids), 100)


class TestEMPI(TestCase):

    def test_create_new_patient(self):
        patient, created = get_or_create_global_patient(
            first_name="Mohammed",
            last_name="Al-Rashidi",
            date_of_birth=date(1985, 3, 15),
            national_id="1023456789",
            country_code="SA",
        )
        self.assertTrue(created)
        self.assertTrue(validate_gpid(patient.gpid))

    def test_dedup_by_national_id(self):
        _, _ = get_or_create_global_patient(
            first_name="Fatima", last_name="Al-Otaibi",
            date_of_birth=date(1990, 7, 1), national_id="1099887766",
        )
        _, created2 = get_or_create_global_patient(
            first_name="Fatimah", last_name="Al-Otaibi",
            date_of_birth=date(1990, 7, 1), national_id="1099887766",
        )
        self.assertFalse(created2, "Should have deduplicated by national_id")

    def test_dedup_by_name_dob(self):
        _, _ = get_or_create_global_patient(
            first_name="Nora", last_name="Hassan",
            date_of_birth=date(1975, 12, 20),
        )
        _, created2 = get_or_create_global_patient(
            first_name="Nora", last_name="Hassan",
            date_of_birth=date(1975, 12, 20),
        )
        self.assertFalse(created2, "Should have deduplicated by name + DOB")

    def test_different_patients_separate(self):
        _, c1 = get_or_create_global_patient(
            first_name="Ahmed", last_name="Al-Ghamdi",
            date_of_birth=date(1980, 1, 1), national_id="2000000001",
        )
        _, c2 = get_or_create_global_patient(
            first_name="Ali", last_name="Al-Ghamdi",
            date_of_birth=date(1980, 1, 1), national_id="2000000002",
        )
        self.assertTrue(c1)
        self.assertTrue(c2)
