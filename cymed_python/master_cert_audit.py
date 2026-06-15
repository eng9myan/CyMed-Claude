import os
import ast
import json

base_dir = os.path.dirname(os.path.abspath(__file__))

stats = {
    "total_models": 0,
    "total_apis": 0,
    "total_celery_tasks": 0,
    "unused_models": [],
    "total_test_files": 0,
    "apps": [],
}

def analyze_app(app_path):
    app_stats = {"models": 0, "apis": 0, "tasks": 0, "tests": 0}
    
    # Models
    models_path = os.path.join(app_path, "models.py")
    if os.path.exists(models_path):
        with open(models_path, "r", encoding="utf-8") as f:
            tree = ast.parse(f.read())
            classes = [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]
            app_stats["models"] = len(classes)
            stats["total_models"] += len(classes)
            
    # APIs (Views)
    views_path = os.path.join(app_path, "views.py")
    if os.path.exists(views_path):
        with open(views_path, "r", encoding="utf-8") as f:
            tree = ast.parse(f.read())
            funcs = [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
            classes = [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]
            app_stats["apis"] = len(funcs) + len(classes)
            stats["total_apis"] += app_stats["apis"]

    # Tasks
    tasks_path = os.path.join(app_path, "tasks.py")
    if os.path.exists(tasks_path):
        with open(tasks_path, "r", encoding="utf-8") as f:
            tree = ast.parse(f.read())
            funcs = [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
            app_stats["tasks"] = len(funcs)
            stats["total_celery_tasks"] += len(funcs)
            
    # Tests
    tests_path = os.path.join(app_path, "tests.py")
    if os.path.exists(tests_path):
        with open(tests_path, "r", encoding="utf-8") as f:
            content = f.read()
            if "def test_" in content or "class Test" in content:
                app_stats["tests"] = 1
                stats["total_test_files"] += 1
                
    return app_stats

for item in os.listdir(base_dir):
    item_path = os.path.join(base_dir, item)
    if os.path.isdir(item_path) and item.endswith("_app"):
        stats["apps"].append({item: analyze_app(item_path)})

with open("cert_audit_results.json", "w") as f:
    json.dump(stats, f, indent=4)

print("Audit Complete.")
