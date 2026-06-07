import os

files = [
    'd:/Kusajilisha/frontend/src/pages/FoodPage.jsx',
    'd:/Kusajilisha/frontend/src/pages/BusinessPage.jsx',
    'd:/Kusajilisha/frontend/src/pages/ProvidersPage.jsx'
]

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Remove the class that causes items to be hidden without intersection observer
    content = content.replace('reveal-item', '')
    
    # Fix the missing default translation for FoodPage buttons
    if 'FoodPage.jsx' in f:
        content = content.replace("t('cta_browse_restaurants')", "t('cta_browse_restaurants', 'Browse Restaurants')")
        content = content.replace("t('cta_register_restaurant')", "t('cta_register_restaurant', 'Register Restaurant')")
        
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f'Fixed {f}')
