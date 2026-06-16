"""
Phase 1 Module Audit — inspects every module manifest and reports status.
"""
import ast
import json
from pathlib import Path

ADDONS = Path(__file__).parent / "addons"

def parse_manifest(path: Path) -> dict:
    try:
        text = path.read_text(encoding="utf-8")
        return ast.literal_eval(text)
    except Exception as e:
        return {"_error": str(e)}

def audit():
    results = []
    for module_dir in sorted(ADDONS.iterdir()):
        if not module_dir.is_dir():
            continue
        manifest = module_dir / "__manifest__.py"
        init_py = module_dir / "__init__.py"
        models_dir = module_dir / "models"
        views_dir = module_dir / "views"
        static_dir = module_dir / "static"

        if not manifest.exists():
            results.append({
                "module": module_dir.name,
                "status": "BROKEN",
                "reason": "Missing __manifest__.py",
            })
            continue

        data = parse_manifest(manifest)
        if "_error" in data:
            results.append({
                "module": module_dir.name,
                "status": "BROKEN",
                "reason": f"Manifest parse error: {data['_error']}",
            })
            continue

        results.append({
            "module": module_dir.name,
            "status": "OK",
            "name": data.get("name", ""),
            "version": data.get("version", ""),
            "category": data.get("category", ""),
            "depends": data.get("depends", []),
            "author": data.get("author", ""),
            "license": data.get("license", ""),
            "has_init": init_py.exists(),
            "has_models": models_dir.exists(),
            "has_views": views_dir.exists(),
            "has_static": static_dir.exists(),
        })
    return results

if __name__ == "__main__":
    audit_results = audit()
    out_path = Path(__file__).parent.parent / "Phase1_Audit_Data.json"
    out_path.write_text(json.dumps(audit_results, indent=2))
    ok = sum(1 for r in audit_results if r["status"] == "OK")
    broken = sum(1 for r in audit_results if r["status"] == "BROKEN")
    print(f"Audit complete: {ok} OK, {broken} broken")
    print(f"Data written to {out_path}")
