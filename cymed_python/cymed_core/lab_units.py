"""
Lab units localization — SI (international) vs US conventional.

Used by frontend to display lab values in the patient's locale.
Conversion factors are dimensionless multipliers from SI → conventional.
"""
from typing import Dict, Tuple, Optional


# (LOINC/code) → (SI label, US conventional label, SI→US multiplier)
LAB_UNIT_TABLE: Dict[str, Tuple[str, str, float]] = {
    # Chemistry
    "glucose":        ("mmol/L", "mg/dL", 18.018),
    "creatinine":     ("μmol/L", "mg/dL", 0.0113),
    "urea":           ("mmol/L", "mg/dL", 2.801),     # BUN as urea in SI
    "cholesterol":    ("mmol/L", "mg/dL", 38.67),
    "triglycerides":  ("mmol/L", "mg/dL", 88.57),
    "ldl":            ("mmol/L", "mg/dL", 38.67),
    "hdl":            ("mmol/L", "mg/dL", 38.67),
    "bilirubin_total":("μmol/L", "mg/dL", 0.0585),
    "albumin":        ("g/L",    "g/dL",  0.10),
    "calcium":        ("mmol/L", "mg/dL", 4.008),
    "phosphate":      ("mmol/L", "mg/dL", 3.097),
    "magnesium":      ("mmol/L", "mg/dL", 2.43),
    "uric_acid":      ("μmol/L", "mg/dL", 0.01682),
    "iron":           ("μmol/L", "μg/dL", 5.585),
    "ferritin":       ("μg/L",   "ng/mL", 1.0),       # numerically equal
    "tsh":            ("mIU/L",  "μIU/mL",1.0),       # numerically equal
    "vitamin_d":      ("nmol/L", "ng/mL", 0.4006),

    # Haematology — most are unitless ratios; counts differ
    "hemoglobin":     ("g/L",    "g/dL",  0.10),
    "hematocrit":     ("L/L",    "%",     100.0),     # 0.42 → 42%
    "wbc":            ("10⁹/L",  "10³/μL",1.0),       # numerically equal
    "rbc":            ("10¹²/L", "10⁶/μL",1.0),       # numerically equal
    "platelets":      ("10⁹/L",  "10³/μL",1.0),       # numerically equal

    # Blood gas
    "ph":             ("",       "",      1.0),       # ratio unit
    "pco2":           ("kPa",    "mmHg",  7.5),       # 5.3 kPa → 40 mmHg
    "po2":            ("kPa",    "mmHg",  7.5),
    "bicarbonate":    ("mmol/L", "mEq/L", 1.0),       # numerically equal
    "lactate":        ("mmol/L", "mg/dL", 9.01),

    # Endocrine
    "hba1c":          ("mmol/mol","%",    1.0),       # SI: IFCC mmol/mol, conv: NGSP %
    "insulin":        ("pmol/L", "μIU/mL",0.139),
    "cortisol":       ("nmol/L", "μg/dL", 0.0362),
}


# Countries using US conventional units (LOINC display)
US_CONVENTIONAL_COUNTRIES = {"US", "PR"}


def get_unit_system(country_code: str) -> str:
    """Return 'us_conventional' or 'si' for a given country."""
    return "us_conventional" if country_code.upper() in US_CONVENTIONAL_COUNTRIES else "si"


def localize_value(test_code: str, si_value: float, country_code: str) -> Tuple[float, str]:
    """
    Convert an SI lab value to the locale-appropriate unit.

    Returns (value, unit_label).
    If the test is unknown, returns (si_value, '').
    """
    entry = LAB_UNIT_TABLE.get(test_code.lower())
    if entry is None:
        return si_value, ""

    si_label, us_label, multiplier = entry
    if get_unit_system(country_code) == "us_conventional":
        return round(si_value * multiplier, 3), us_label
    return si_value, si_label


def localize_reference_range(
    test_code: str,
    si_low: Optional[float],
    si_high: Optional[float],
    country_code: str,
) -> Tuple[Optional[float], Optional[float], str]:
    """Convert SI reference range to locale-appropriate range."""
    entry = LAB_UNIT_TABLE.get(test_code.lower())
    if entry is None:
        return si_low, si_high, ""

    si_label, us_label, multiplier = entry
    if get_unit_system(country_code) == "us_conventional":
        low = round(si_low * multiplier, 3) if si_low is not None else None
        high = round(si_high * multiplier, 3) if si_high is not None else None
        return low, high, us_label
    return si_low, si_high, si_label
