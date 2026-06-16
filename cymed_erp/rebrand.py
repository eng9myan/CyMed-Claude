"""
CyMed ERP Rebrand Script
========================
Rewrites visible vendor strings in module manifests and XML view labels.

LGPL compliance: this script DOES NOT touch copyright headers in .py source files.
It only modifies user-facing strings (manifest author/website/category, XML labels).

Usage:  python rebrand.py
"""
import os
import re
import sys
from pathlib import Path

ADDONS_DIR = Path(__file__).parent / "addons"

# Visible string replacements (case-sensitive)
REPLACEMENTS = [
    ("Odoo S.A.", "CyMed Healthcare Systems"),
    ("Odoo SA", "CyMed Healthcare Systems"),
    ("Odoo Apps", "CyMed Apps"),
    ("https://www.odoo.com", "https://cy-com.com"),
    ("http://www.odoo.com", "https://cy-com.com"),
    ("www.odoo.com", "cy-com.com"),
    ("odoo.com", "cy-com.com"),
]

# Manifest fields to overwrite (regardless of original value)
MANIFEST_OVERRIDES = {
    "author": "CyMed Healthcare Systems",
    "website": "https://cy-com.com",
    "maintainer": "CyMed Healthcare Systems",
}

# Files to skip (legal/license/changelog files keep originals)
SKIP_FILES = {"LICENSE", "COPYRIGHT", "CHANGELOG", "CHANGELOG.md", "AUTHORS"}


def patch_manifest(path: Path) -> bool:
    """Rewrite manifest author/website to CyMed branding."""
    try:
        text = path.read_text(encoding="utf-8")
        original = text
        for key, value in MANIFEST_OVERRIDES.items():
            pattern = rf"'{key}'\s*:\s*['\"][^'\"]*['\"]"
            replacement = f"'{key}': '{value}'"
            text = re.sub(pattern, replacement, text)
        for old, new in REPLACEMENTS:
            text = text.replace(old, new)
        if text != original:
            path.write_text(text, encoding="utf-8")
            return True
    except Exception as e:
        print(f"  [ERR] {path}: {e}", file=sys.stderr)
    return False


def patch_xml(path: Path) -> bool:
    """Rewrite visible strings in XML view files."""
    try:
        text = path.read_text(encoding="utf-8")
        original = text
        for old, new in REPLACEMENTS:
            text = text.replace(old, new)
        if text != original:
            path.write_text(text, encoding="utf-8")
            return True
    except Exception:
        pass
    return False


def main():
    if not ADDONS_DIR.exists():
        print(f"Addons directory not found: {ADDONS_DIR}", file=sys.stderr)
        sys.exit(1)

    manifest_count = 0
    xml_count = 0

    for module_dir in ADDONS_DIR.iterdir():
        if not module_dir.is_dir():
            continue

        manifest = module_dir / "__manifest__.py"
        if manifest.exists():
            if patch_manifest(manifest):
                manifest_count += 1

        for xml_file in module_dir.rglob("*.xml"):
            if xml_file.name in SKIP_FILES:
                continue
            if patch_xml(xml_file):
                xml_count += 1

    print(f"Rebrand complete:")
    print(f"  Manifests patched: {manifest_count}")
    print(f"  XML files patched: {xml_count}")


if __name__ == "__main__":
    main()
