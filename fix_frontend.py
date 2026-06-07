import re
import json

files_to_scan = [
    'd:/Kusajilisha/frontend/src/pages/FoodPage.jsx',
    'd:/Kusajilisha/frontend/src/pages/BusinessPage.jsx',
    'd:/Kusajilisha/frontend/src/pages/ProvidersPage.jsx',
    'd:/Kusajilisha/frontend/src/pages/Home.jsx'
]

locales = {
    'en': 'd:/Kusajilisha/frontend/src/locales/en.json',
    'sw': 'd:/Kusajilisha/frontend/src/locales/sw.json'
}

keys_found = set()

for f in files_to_scan:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        # Find t('key') or t("key") or t('key', 'default')
        matches = re.findall(r"t\(['\"]([^'\"]+)['\"]", content)
        for m in matches:
            keys_found.add(m)

for lang, path in locales.items():
    with open(path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    added = 0
    for k in keys_found:
        if k not in data:
            data[k] = k.replace('_', ' ').capitalize()  # fallback string
            added += 1
            
    with open(path, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=2, ensure_ascii=False)
        
    print(f"Added {added} missing keys to {lang}.json")

# Also fix index.css
css_path = 'd:/Kusajilisha/frontend/src/index.css'
with open(css_path, 'r', encoding='utf-8') as file:
    css_content = file.read()

# Make reveal-item default to opacity 1 so it NEVER hides completely
css_content = css_content.replace('.reveal-item {\n  opacity: 0;', '.reveal-item {\n  opacity: 1; /* Fixed blank section bug */')
with open(css_path, 'w', encoding='utf-8') as file:
    file.write(css_content)
    print("Fixed index.css opacity")
