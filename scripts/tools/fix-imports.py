import os
import re
import shutil

dir_moves = {
    # 1. Types & Workers
    "types": "shared/types",
    "workers": "app/workers",
    # 2. Domain (Entities)
    "domain/repositories": "entities/shared/api/repositories",
    "domain/services": "entities/shared/lib/services",
    "domain/chatbot": "entities/chatbot/model",
    # 3. Infra & Core-Infra (Shared API & Libs)
    "infra/firebase": "shared/api/firebase",
    "infra/monitoring": "shared/lib/monitoring",
    "infra/di": "app/providers/di",
    "infra/mappers": "shared/api/mappers",
    "infra/repositories": "shared/api/repositories",
    "infra/services": "shared/api/services",
    "core-infra/hubspot": "shared/api/hubspot",
    "core-infra/enterprise": "shared/api/enterprise",
    # 4. Application & Adapters
    "application/use-cases": "features/shared/model/use-cases",
    "adapters": "shared/api/adapters",
    # 5. Command-Center
    "command-center/components": "pages/admin/command-center/ui"
}

file_moves = {
    "domain/entities": "entities/shared/model/entities"
}

root = os.path.join(os.getcwd(), 'src')

print("\n🚀 Iniciando Motor Antigravity FSD (Fase 6 - Consolidación Final )...")

moved_count = 0

# specific files
for old, new in file_moves.items():
    for ext in ['.ts', '.tsx', '.js', '.jsx']:
        old_path = os.path.join(root, old + ext)
        new_path = os.path.join(root, new + ext)
        if os.path.exists(old_path):
            os.makedirs(os.path.dirname(new_path), exist_ok=True)
            os.rename(old_path, new_path)
            moved_count += 1
            break

# Move entire directories recursively
for old_dir, new_dir in dir_moves.items():
    old_path = os.path.join(root, old_dir)
    new_path = os.path.join(root, new_dir)
    if os.path.exists(old_path):
        os.makedirs(new_path, exist_ok=True)
        for item in os.listdir(old_path):
            abs_item_old = os.path.join(old_path, item)
            abs_item_new = os.path.join(new_path, item)
            if not os.path.exists(abs_item_new): # avoid errors if already moved
                shutil.move(abs_item_old, abs_item_new)
        # only delete if empty, since there could be nested directories moved partially
        if not os.listdir(old_path):
            shutil.rmtree(old_path)
        moved_count += 1

print(f"✅ Carpetas/Archivos consolidados físicamente: {moved_count}")

# Auto cleanup old roots if they are empty
for dir_to_clean in ["types", "workers", "domain", "infra", "core-infra", "application", "adapters", "command-center"]:
    cln = os.path.join(root, dir_to_clean)
    try:
        if os.path.exists(cln) and not os.listdir(cln):
            os.rmdir(cln)
            print(f"🗑️ Eliminada carpeta legacy vacía: {dir_to_clean}")
    except Exception:
        pass

# Import replacement
files_mutated = 0
total_replaces = 0

all_files = []
for dirpath, dirnames, filenames in os.walk(root):
    dirnames[:] = [d for d in dirnames if d not in ['node_modules', '.next', 'dist', 'build', '.git']]
    for f in filenames:
        if f.endswith('.ts') or f.endswith('.tsx'):
            all_files.append(os.path.join(dirpath, f))

# Combined map for imports
full_import_map = file_moves.copy()
for old_dir, new_dir in dir_moves.items():
    full_import_map[old_dir] = new_dir

# Sort by length descending to match deepest paths first
sorted_map = dict(sorted(full_import_map.items(), key=lambda item: len(item[0]), reverse=True))

for file in all_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        continue

    orig = content
    for old, new in sorted_map.items():
        abs_old = f"@/{old}"
        abs_new = f"@/{new}"
        
        # Absolute imports @/old
        pattern1 = re.compile(r'(from\s+[\'"])' + re.escape(abs_old) + r'(.*?)([\'"])')
        n = len(pattern1.findall(content))
        total_replaces += n
        content = pattern1.sub(rf'\g<1>{abs_new}\g<2>\g<3>', content)
        
        # dynamic/side-effect imports import('@/old')
        pattern1_dyn = re.compile(r'(import\(?[\'"])' + re.escape(abs_old) + r'(.*?)([\'"]\)?)(?!\s*from)')
        n = len(pattern1_dyn.findall(content))
        total_replaces += n
        content = pattern1_dyn.sub(rf'\g<1>{abs_new}\g<2>\g<3>', content)
        
        # Relative mapping
        pattern2 = re.compile(r'(from\s+[\'"](?!@).*?)' + re.escape(old) + r'(.*?)([\'"])')
        n = len(pattern2.findall(content))
        total_replaces += n
        content = pattern2.sub(rf"from '{abs_new}\g<2>'", content)
        
        pattern2_dyn = re.compile(r'(import\(?[\'"](?!@).*?)' + re.escape(old) + r'(.*?)([\'"]\)?)(?!\s*from)')
        n = len(pattern2_dyn.findall(content))
        total_replaces += n
        content = pattern2_dyn.sub(rf"import '{abs_new}\g<2>'", content)

    if content != orig:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        files_mutated += 1

print(f"✅ Escaneo completado. Archivos Modificados: {files_mutated}, Rutas Arregladas: {total_replaces}")
print("🏁 ¡Fase 6 terminada exitosamente!\n")
