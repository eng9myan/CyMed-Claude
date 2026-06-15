"""
CyMed Multi-Country Configuration Registry
Supports: SA, JO, GB, US, AE, KW, QA + any new country
Each CountryProfile drives: compliance modules, billing standards,
currency, health ID format, national interop, e-invoicing, insurance APIs.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional


@dataclass(frozen=True)
class CountryProfile:
    code: str                        # ISO 3166-1 alpha-2 (SA, US, GB, JO, AE, KW, QA)
    name: str
    currency: str                    # ISO 4217
    currency_symbol: str
    languages: list[str]             # BCP-47 codes, first = default
    rtl: bool
    timezone: str                    # IANA

    # Health IDs
    national_id_label: str           # "National ID", "NHS Number", "SSN", "Civil ID"
    national_id_regex: str           # Basic validation pattern
    health_id_system: str            # FHIR identifier system URI

    # Clinical standards
    icd_version: str                 # "ICD-11" | "ICD-10-CM" (US)
    drug_formulary: str              # "WHO-EML" | "FDA-NDC" | "BNF" | "MOH-KSA"
    lab_units: str                   # "SI" | "US_conventional"
    vital_temp_unit: str             # "C" | "F"

    # Regulatory & compliance
    billing_standard: str            # "NPHIES" | "NHS-ECS" | "CMS-1500" | "HAAD" | "DHPO" | "MOH-KW" | "NHCPS-QA" | "JFDA" | "generic"
    e_invoice_standard: str          # "ZATCA-UBL" | "HMRC-MTD" | "IRS-1099" | "FURS" | "generic"
    privacy_law: str                 # "PDPL" | "GDPR" | "HIPAA" | "generic"
    accreditation: str               # "CBAHI-JCI" | "CQC-JCI" | "JCI-DNV" | "CARF" | "GAHAR"

    # Interoperability
    national_fhir_endpoint: Optional[str]
    national_payer_api: Optional[str]
    tpa_support: bool                # Third-party administrator support

    # Phone / address
    phone_prefix: str                # "+966"
    address_format: str              # "line1\nline2\ncity\npostcode\ncountry"

    # UI
    date_format: str                 # "DD/MM/YYYY" | "MM/DD/YYYY"
    number_format: str               # "1,234.56" | "1.234,56"

    # AI / LLM routing note
    ai_data_residency: str           # "EU" | "US" | "MENA" | "UK" | "global"


COUNTRY_REGISTRY: dict[str, CountryProfile] = {

    # ── Saudi Arabia ──────────────────────────────────────────────────────────
    "SA": CountryProfile(
        code="SA", name="Saudi Arabia",
        currency="SAR", currency_symbol="ر.س",
        languages=["ar", "en"], rtl=True,
        timezone="Asia/Riyadh",
        national_id_label="National ID (رقم الهوية)",
        national_id_regex=r"^[12]\d{9}$",
        health_id_system="https://nhi.gov.sa/fhir/sid/national-id",
        icd_version="ICD-11",
        drug_formulary="MOH-KSA",
        lab_units="SI",
        vital_temp_unit="C",
        billing_standard="NPHIES",
        e_invoice_standard="ZATCA-UBL",
        privacy_law="PDPL",
        accreditation="CBAHI-JCI",
        national_fhir_endpoint="https://nphies.sa/fhir/R4",
        national_payer_api="https://api.nphies.sa",
        tpa_support=True,
        phone_prefix="+966",
        address_format="line1\nline2\ncity\npostcode\nSaudi Arabia",
        date_format="DD/MM/YYYY",
        number_format="1,234.56",
        ai_data_residency="MENA",
    ),

    # ── Jordan ────────────────────────────────────────────────────────────────
    "JO": CountryProfile(
        code="JO", name="Jordan",
        currency="JOD", currency_symbol="د.أ",
        languages=["ar", "en"], rtl=True,
        timezone="Asia/Amman",
        national_id_label="National Number (الرقم الوطني)",
        national_id_regex=r"^\d{10}$",
        health_id_system="https://moh.gov.jo/fhir/sid/national-number",
        icd_version="ICD-10",
        drug_formulary="WHO-EML",
        lab_units="SI",
        vital_temp_unit="C",
        billing_standard="JFDA",
        e_invoice_standard="generic",
        privacy_law="generic",
        accreditation="JCI-DNV",
        national_fhir_endpoint=None,
        national_payer_api=None,
        tpa_support=True,
        phone_prefix="+962",
        address_format="line1\nline2\ncity\nJordan",
        date_format="DD/MM/YYYY",
        number_format="1,234.56",
        ai_data_residency="MENA",
    ),

    # ── United Kingdom ────────────────────────────────────────────────────────
    "GB": CountryProfile(
        code="GB", name="United Kingdom",
        currency="GBP", currency_symbol="£",
        languages=["en"], rtl=False,
        timezone="Europe/London",
        national_id_label="NHS Number",
        national_id_regex=r"^\d{3}[\s\-]?\d{3}[\s\-]?\d{4}$",
        health_id_system="https://fhir.nhs.uk/Id/nhs-number",
        icd_version="ICD-10",
        drug_formulary="BNF",
        lab_units="SI",
        vital_temp_unit="C",
        billing_standard="NHS-ECS",
        e_invoice_standard="HMRC-MTD",
        privacy_law="GDPR",
        accreditation="CQC-JCI",
        national_fhir_endpoint="https://api.service.nhs.uk/personal-demographics/FHIR/R4",
        national_payer_api="https://api.nhs.uk",
        tpa_support=False,
        phone_prefix="+44",
        address_format="line1\nline2\ncity\npostcode\nUnited Kingdom",
        date_format="DD/MM/YYYY",
        number_format="1,234.56",
        ai_data_residency="EU",
    ),

    # ── United States ─────────────────────────────────────────────────────────
    "US": CountryProfile(
        code="US", name="United States",
        currency="USD", currency_symbol="$",
        languages=["en", "es"], rtl=False,
        timezone="America/New_York",
        national_id_label="Social Security Number (SSN)",
        national_id_regex=r"^\d{3}-\d{2}-\d{4}$",
        health_id_system="http://hl7.org/fhir/sid/us-ssn",
        icd_version="ICD-10-CM",
        drug_formulary="FDA-NDC",
        lab_units="US_conventional",
        vital_temp_unit="F",
        billing_standard="CMS-1500",
        e_invoice_standard="IRS-1099",
        privacy_law="HIPAA",
        accreditation="JCI-DNV",
        national_fhir_endpoint="https://api.cms.gov/fhir/R4",
        national_payer_api="https://api.cms.gov",
        tpa_support=True,
        phone_prefix="+1",
        address_format="line1\nline2\ncity, state postcode\nUSA",
        date_format="MM/DD/YYYY",
        number_format="1,234.56",
        ai_data_residency="US",
    ),

    # ── UAE ───────────────────────────────────────────────────────────────────
    "AE": CountryProfile(
        code="AE", name="United Arab Emirates",
        currency="AED", currency_symbol="د.إ",
        languages=["ar", "en"], rtl=True,
        timezone="Asia/Dubai",
        national_id_label="Emirates ID",
        national_id_regex=r"^\d{3}-\d{4}-\d{7}-\d{1}$",
        health_id_system="https://haad.ae/fhir/sid/emirates-id",
        icd_version="ICD-10",
        drug_formulary="WHO-EML",
        lab_units="SI",
        vital_temp_unit="C",
        billing_standard="HAAD",
        e_invoice_standard="generic",
        privacy_law="PDPL",
        accreditation="JCI-DNV",
        national_fhir_endpoint=None,
        national_payer_api="https://api.haad.ae",
        tpa_support=True,
        phone_prefix="+971",
        address_format="line1\ncity\nEmirate\nUAE",
        date_format="DD/MM/YYYY",
        number_format="1,234.56",
        ai_data_residency="MENA",
    ),

    # ── Kuwait ────────────────────────────────────────────────────────────────
    "KW": CountryProfile(
        code="KW", name="Kuwait",
        currency="KWD", currency_symbol="د.ك",
        languages=["ar", "en"], rtl=True,
        timezone="Asia/Kuwait",
        national_id_label="Civil ID",
        national_id_regex=r"^\d{12}$",
        health_id_system="https://moh.gov.kw/fhir/sid/civil-id",
        icd_version="ICD-10",
        drug_formulary="WHO-EML",
        lab_units="SI",
        vital_temp_unit="C",
        billing_standard="MOH-KW",
        e_invoice_standard="generic",
        privacy_law="generic",
        accreditation="JCI-DNV",
        national_fhir_endpoint=None,
        national_payer_api=None,
        tpa_support=True,
        phone_prefix="+965",
        address_format="line1\nline2\ncity\nblock\nKuwait",
        date_format="DD/MM/YYYY",
        number_format="1,234.56",
        ai_data_residency="MENA",
    ),

    # ── Qatar ─────────────────────────────────────────────────────────────────
    "QA": CountryProfile(
        code="QA", name="Qatar",
        currency="QAR", currency_symbol="ر.ق",
        languages=["ar", "en"], rtl=True,
        timezone="Asia/Qatar",
        national_id_label="Qatar ID",
        national_id_regex=r"^\d{11}$",
        health_id_system="https://nhcps.gov.qa/fhir/sid/qatar-id",
        icd_version="ICD-10",
        drug_formulary="WHO-EML",
        lab_units="SI",
        vital_temp_unit="C",
        billing_standard="NHCPS-QA",
        e_invoice_standard="generic",
        privacy_law="PDPL",
        accreditation="JCI-DNV",
        national_fhir_endpoint=None,
        national_payer_api=None,
        tpa_support=True,
        phone_prefix="+974",
        address_format="line1\ncity\nZone\nQatar",
        date_format="DD/MM/YYYY",
        number_format="1,234.56",
        ai_data_residency="MENA",
    ),

    # ── Egypt ─────────────────────────────────────────────────────────────────
    "EG": CountryProfile(
        code="EG", name="Egypt",
        currency="EGP", currency_symbol="ج.م",
        languages=["ar", "en"], rtl=True,
        timezone="Africa/Cairo",
        national_id_label="National ID",
        national_id_regex=r"^\d{14}$",
        health_id_system="https://mohp.gov.eg/fhir/sid/national-id",
        icd_version="ICD-10",
        drug_formulary="WHO-EML",
        lab_units="SI",
        vital_temp_unit="C",
        billing_standard="generic",
        e_invoice_standard="generic",
        privacy_law="generic",
        accreditation="JCI-DNV",
        national_fhir_endpoint=None,
        national_payer_api=None,
        tpa_support=True,
        phone_prefix="+20",
        address_format="line1\nline2\ncity\ngovernorate\nEgypt",
        date_format="DD/MM/YYYY",
        number_format="1,234.56",
        ai_data_residency="MENA",
    ),

    # ── Bahrain ───────────────────────────────────────────────────────────────
    "BH": CountryProfile(
        code="BH", name="Bahrain",
        currency="BHD", currency_symbol="BD",
        languages=["ar", "en"], rtl=True,
        timezone="Asia/Bahrain",
        national_id_label="CPR Number",
        national_id_regex=r"^\d{9}$",
        health_id_system="https://nhra.bh/fhir/sid/cpr",
        icd_version="ICD-10",
        drug_formulary="WHO-EML",
        lab_units="SI",
        vital_temp_unit="C",
        billing_standard="generic",
        e_invoice_standard="generic",
        privacy_law="generic",
        accreditation="JCI-DNV",
        national_fhir_endpoint=None,
        national_payer_api=None,
        tpa_support=True,
        phone_prefix="+973",
        address_format="line1\ncity\ngovernorate\nBahrain",
        date_format="DD/MM/YYYY",
        number_format="1,234.56",
        ai_data_residency="MENA",
    ),

    # ── Oman ──────────────────────────────────────────────────────────────────
    "OM": CountryProfile(
        code="OM", name="Oman",
        currency="OMR", currency_symbol="ر.ع",
        languages=["ar", "en"], rtl=True,
        timezone="Asia/Muscat",
        national_id_label="National ID",
        national_id_regex=r"^\d{8}$",
        health_id_system="https://moh.gov.om/fhir/sid/national-id",
        icd_version="ICD-10",
        drug_formulary="WHO-EML",
        lab_units="SI",
        vital_temp_unit="C",
        billing_standard="generic",
        e_invoice_standard="generic",
        privacy_law="generic",
        accreditation="JCI-DNV",
        national_fhir_endpoint=None,
        national_payer_api=None,
        tpa_support=True,
        phone_prefix="+968",
        address_format="line1\ncity\ngovernorate\nOman",
        date_format="DD/MM/YYYY",
        number_format="1,234.56",
        ai_data_residency="MENA",
    ),

    # ── Lebanon ───────────────────────────────────────────────────────────────
    "LB": CountryProfile(
        code="LB", name="Lebanon",
        currency="LBP", currency_symbol="ل.ل",
        languages=["ar", "fr", "en"], rtl=True,
        timezone="Asia/Beirut",
        national_id_label="National ID",
        national_id_regex=r"^\d{10,12}$",
        health_id_system="https://moph.gov.lb/fhir/sid/national-id",
        icd_version="ICD-10",
        drug_formulary="WHO-EML",
        lab_units="SI",
        vital_temp_unit="C",
        billing_standard="generic",
        e_invoice_standard="generic",
        privacy_law="generic",
        accreditation="JCI-DNV",
        national_fhir_endpoint=None,
        national_payer_api=None,
        tpa_support=True,
        phone_prefix="+961",
        address_format="line1\nline2\ncity\nLebanon",
        date_format="DD/MM/YYYY",
        number_format="1,234.56",
        ai_data_residency="MENA",
    ),

    # ── Canada ────────────────────────────────────────────────────────────────
    "CA": CountryProfile(
        code="CA", name="Canada",
        currency="CAD", currency_symbol="$",
        languages=["en", "fr"], rtl=False,
        timezone="America/Toronto",
        national_id_label="Health Card Number",
        national_id_regex=r"^\d{10}$",
        health_id_system="https://ehealthontario.ca/fhir/sid/health-card",
        icd_version="ICD-10-CA",
        drug_formulary="WHO-EML",
        lab_units="SI",
        vital_temp_unit="C",
        billing_standard="generic",
        e_invoice_standard="generic",
        privacy_law="PIPEDA",
        accreditation="Accreditation-Canada",
        national_fhir_endpoint=None,
        national_payer_api=None,
        tpa_support=True,
        phone_prefix="+1",
        address_format="line1\ncity province postcode\nCanada",
        date_format="DD/MM/YYYY",
        number_format="1,234.56",
        ai_data_residency="US",
    ),

    # ── Turkey ────────────────────────────────────────────────────────────────
    "TR": CountryProfile(
        code="TR", name="Turkey",
        currency="TRY", currency_symbol="₺",
        languages=["tr", "en"], rtl=False,
        timezone="Europe/Istanbul",
        national_id_label="TC Kimlik No",
        national_id_regex=r"^\d{11}$",
        health_id_system="https://saglik.gov.tr/fhir/sid/tc-kimlik",
        icd_version="ICD-10",
        drug_formulary="WHO-EML",
        lab_units="SI",
        vital_temp_unit="C",
        billing_standard="generic",
        e_invoice_standard="generic",
        privacy_law="KVKK",
        accreditation="JCI-DNV",
        national_fhir_endpoint=None,
        national_payer_api=None,
        tpa_support=True,
        phone_prefix="+90",
        address_format="line1\ncity postcode\nTurkey",
        date_format="DD/MM/YYYY",
        number_format="1.234,56",
        ai_data_residency="EU",
    ),
}


def get_country(code: str) -> CountryProfile:
    """Return profile for given ISO-2 code, or generic fallback."""
    return COUNTRY_REGISTRY.get(code.upper(), _make_generic(code))


def _make_generic(code: str) -> CountryProfile:
    """Fallback for any unsupported country — functional but unconfigured."""
    return CountryProfile(
        code=code.upper(), name=f"Country ({code.upper()})",
        currency="USD", currency_symbol="$",
        languages=["en"], rtl=False,
        timezone="UTC",
        national_id_label="National ID",
        national_id_regex=r"^.+$",
        health_id_system=f"urn:cymed:fhir:sid:{code.lower()}-national-id",
        icd_version="ICD-11",
        drug_formulary="WHO-EML",
        lab_units="SI",
        vital_temp_unit="C",
        billing_standard="generic",
        e_invoice_standard="generic",
        privacy_law="generic",
        accreditation="JCI-DNV",
        national_fhir_endpoint=None,
        national_payer_api=None,
        tpa_support=True,
        phone_prefix="+00",
        address_format="line1\ncity\ncountry",
        date_format="DD/MM/YYYY",
        number_format="1,234.56",
        ai_data_residency="global",
    )


SUPPORTED_COUNTRIES = list(COUNTRY_REGISTRY.keys())
GCC_COUNTRIES    = ["SA", "AE", "KW", "QA", "BH", "OM"]
ARAB_COUNTRIES   = GCC_COUNTRIES + ["JO", "EG", "LB"]
EU_GDPR_ZONE     = ["GB"]
US_HIPAA_ZONE    = ["US", "CA"]
ALL_ZONES        = ARAB_COUNTRIES + EU_GDPR_ZONE + US_HIPAA_ZONE + ["TR"]
