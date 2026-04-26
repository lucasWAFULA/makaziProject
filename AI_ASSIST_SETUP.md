# Makazi AI Setup

## 1) Environment variables

Set in `backend/.env`:

```txt
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
AI_ASSISTANT_NAME=Makazi AI
```

## 2) Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

## 3) Run migrations

```bash
python manage.py migrate
```

This creates AI tables:

- `chat_aiconversation`
- `chat_aimessage`
- `chat_aiintent`
- `chat_aisearchlog`
- `chat_knowledgebase`
- `chat_faqarticle`
- `chat_userpreference`

For PostgreSQL, pgvector extension is enabled automatically by migration.

## 4) Seed approved knowledge content (RAG source)

Prepare a JSON file (example `backend/knowledge_base.seed.json`):

```json
[
  {
    "title": "SGR to Diani",
    "category": "travel_guide",
    "content": "From Miritini SGR station, use taxi transfer to Diani via Likoni ferry. Travel early morning for lower queue times.",
    "country": "Kenya",
    "region": "Coast",
    "is_active": true
  },
  {
    "title": "Booking cancellation policy",
    "category": "booking_help",
    "content": "Cancellation policy depends on property terms. Users should review policy before payment confirmation.",
    "country": "",
    "region": "",
    "is_active": true
  }
]
```

Ingest and embed:

```bash
python manage.py ingest_knowledge_base --file backend/knowledge_base.seed.json
```

Dry run:

```bash
python manage.py ingest_knowledge_base --file backend/knowledge_base.seed.json --dry-run
```

## 5) API endpoints

- `POST /ai/chat/`
- `GET /ai/conversations/<id>/?client_id=<client_id>`
- `POST /ai/search-listings/`
- `POST /ai/recommend-package/`
- `POST /ai/match-agent/`

Also available under `/chat/ai/...` for backward compatibility.

## 6) Frontend

The chat widget is now branded as **Makazi AI** and displays:

- detected intent response
- structured result cards (stays/agents/packages)
- trusted source chips from approved knowledge content
- human escalation button (WhatsApp) for disputes/payment issues
