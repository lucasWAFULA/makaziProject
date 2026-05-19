import requests
from bs4 import BeautifulSoup
import re
import json
from django.conf import settings
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sync_playwright = None

class PropertyScraper:
    def scrape(self, url):
        # Basic validation to ensure it's likely a property listing
        if not any(keyword in url.lower() for keyword in ["properties", "property", "listing", "house", "apartment", "villa", "rent", "sale"]):
            return {"error": "The provided link does not appear to be a valid property listing page. Please use a direct link to a property listing."}

        if "jumuika.co.ke" in url:
            return self.scrape_jumuika(url)
        return self.scrape_generic(url)

    def _get_openai_client(self):
        if not settings.OPENAI_API_KEY or OpenAI is None:
            return None
        return OpenAI(api_key=settings.OPENAI_API_KEY)

    def scrape_jumuika(self, url):
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 405:
                return {"error": "Access denied by the website (Method Not Allowed). This link might be an internal system URL rather than a public property page."}
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            # Extract Title
            title = ""
            title_tag = soup.find('h1')
            if title_tag:
                title = title_tag.get_text().strip()

            # Extract Price
            price_text = ""
            price_tag = soup.find('div', class_='price') # Need to verify class
            # Based on the markdown, price was near "KSh 260,000"
            if not price_tag:
                # Try finding text with KSh
                price_match = re.search(r'KSh\s*([\d,]+)', response.text)
                if price_match:
                    price_text = price_match.group(1).replace(',', '')

            # Extract Description
            description = ""
            desc_tag = soup.find('div', class_='description') # Need to verify class
            if not desc_tag:
                # Look for "About this property" section
                about_section = soup.find(lambda tag: tag.name == "h2" and "About this property" in tag.text)
                if about_section:
                    # Get next siblings until next h2
                    siblings = about_section.find_next_siblings()
                    for sibling in siblings:
                        if sibling.name == "h2":
                            break
                        description += sibling.get_text().strip() + "\n"

            # Extract Location
            location = ""
            breadcrumb = soup.find('nav', class_='breadcrumb') # Verify
            if not breadcrumb:
                # Try finding location from title or meta tags
                meta_loc = soup.find('meta', property='og:description')
                if meta_loc:
                    # often contains location
                    pass

            # Extract Features
            features = []
            features_section = soup.find(lambda tag: tag.name == "h3" and "Highlights" in tag.text)
            if features_section:
                list_tag = features_section.find_next('ul')
                if list_tag:
                    features = [li.get_text().strip() for li in list_tag.find_all('li')]

            # Extract Images
            images = []
            # Look for gallery or main images
            img_tags = soup.find_all('img', src=re.compile(r'assets\.jumuika\.co\.ke/properties'))
            for img in img_tags:
                src = img.get('src')
                if src and src not in images:
                    images.append(src)

            return {
                "title": title,
                "price": price_text,
                "description": description.strip(),
                "features": features,
                "images": images,
                "source_url": url
            }
        except Exception as e:
            return {"error": str(e)}

    def scrape_with_browser(self, url):
        if not sync_playwright:
            return None

        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                context = browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
                )
                page = context.new_page()
                # Booking.com specific: wait for network idle to ensure JS executes
                page.goto(url, wait_until="networkidle", timeout=30000)
                content = page.content()
                browser.close()
                return content
        except Exception:
            return None

    def scrape_generic(self, url):
        client = self._get_openai_client()
        if not client:
            return {"error": "AI scraping not configured (missing API key)"}

        try:
            html_content = None
            # Try direct request first (faster)
            response = requests.get(url, timeout=15, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            })
            
            # Check for JS challenge (202 status or specific text)
            if response.status_code == 202 or "javascript" in response.text.lower()[:500]:
                html_content = self.scrape_with_browser(url)
            
            if not html_content:
                if response.status_code == 405:
                    return {"error": "Access denied by the website (Method Not Allowed). This link might be an internal system URL rather than a public property page."}
                response.raise_for_status()
                html_content = response.text

            soup = BeautifulSoup(html_content, 'html.parser')

            # Clean up the HTML to reduce tokens
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.extract()

            # Get text content and some meta tags
            text_content = soup.get_text(separator=' ', strip=True)[:8000] # Limit to 8k chars
            meta_tags = {
                meta.get('property', meta.get('name')): meta.get('content')
                for meta in soup.find_all('meta') if meta.get('content')
            }

            # Extract all potential images
            potential_images = []
            for img in soup.find_all('img'):
                src = img.get('src') or img.get('data-src')
                if src and src.startswith('http'):
                    potential_images.append(src)
            
            # Use OG image if available
            og_image = meta_tags.get('og:image')
            if og_image:
                potential_images.insert(0, og_image)

            prompt = (
                "You are a professional real estate listing assistant. Your goal is to extract property metadata from the provided website content and TRANSFORM it into a fresh, original summary. "
                "CRITICAL RULES:\n"
                "1. NEVER copy the description verbatim. Rewrite it into a concise, professional summary highlighting key facts.\n"
                "2. Extract these fields: title, price (numeric), description (rewritten summary), features (list), location, base_currency.\n"
                "3. Normalize formatting. If price is missing, use null.\n"
                "Return a strict JSON object."
            )

            user_content = f"URL: {url}\n\nMeta Tags: {json.dumps(meta_tags)}\n\nPage Text: {text_content}"

            ai_response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": user_content}
                ],
                response_format={"type": "json_object"},
                temperature=0.3 # Slightly higher temperature for better rewriting
            )

            data = json.loads(ai_response.choices[0].message.content)
            # Focus on metadata; do not store full third-party image arrays to reduce risk
            data["images"] = [] 
            data["attribution"] = f"Extracted from {url}"
            data["source_url"] = url
            return data

        except Exception as e:
            return {"error": f"AI Scraping failed: {str(e)}"}
