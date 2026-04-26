import json
import math
import re
import time
from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.db.models import Q

from agents.models import AgentProfile
from packages.models import TravelPackage
from properties.models import Property
from taxi.models import DriverProfile, TransportRoute

from .models import AISearchLog, FAQArticle, KnowledgeBase

try:
    from openai import OpenAI
except Exception:  # pragma: no cover - optional dependency in some environments
    OpenAI = None


SUPPORTED_INTENTS = {
    "property_search",
    "hotel_search",
    "taxi_booking",
    "agent_request",
    "package_request",
    "travel_guide",
    "payment_help",
    "general_support",
}
STOPWORDS = {
    "find",
    "me",
    "need",
    "with",
    "and",
    "for",
    "the",
    "from",
    "that",
    "this",
    "under",
    "over",
    "near",
    "show",
    "please",
    "book",
}

LOCATION_HINTS = [
    "diani",
    "mombasa",
    "nyali",
    "bamburi",
    "zanzibar",
    "dar",
    "dar es salaam",
    "malindi",
    "watamu",
]

TYPE_MAP = {
    "bnb": Property.ListingType.BNB,
    "b&b": Property.ListingType.BNB,
    "hotel": Property.ListingType.HOTEL,
    "house": Property.ListingType.HOUSE,
    "apartment": Property.ListingType.APARTMENT,
    "villa": Property.ListingType.VILLA,
}

EMBEDDING_MODEL = "text-embedding-3-small"


def _openai_client():
    if not settings.OPENAI_API_KEY or OpenAI is None:
        return None
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def _extract_filters(message):
    text = (message or "").lower()
    filters = {}

    for loc in LOCATION_HINTS:
        if loc in text:
            filters["location"] = loc
            break

    for key, listing_type in TYPE_MAP.items():
        if key in text:
            filters["listing_type"] = listing_type
            break

    max_price_match = re.search(r"(?:under|below|less than)\s*(?:ksh|kes|tzs)?\s*([\d,]+)", text)
    if max_price_match:
        try:
            filters["max_price"] = Decimal(max_price_match.group(1).replace(",", ""))
        except InvalidOperation:
            pass

    nights_match = re.search(r"(\d+)\s*night", text)
    if nights_match:
        filters["nights"] = int(nights_match.group(1))

    guests_match = re.search(r"(?:for|guests?)\s*(\d+)", text)
    if guests_match:
        filters["guests"] = int(guests_match.group(1))

    return filters


def _normalize_filters(filters):
    normalized = dict(filters or {})
    location = normalized.get("location")
    if location is not None:
        normalized["location"] = str(location).strip()[:80]

    listing_type = normalized.get("listing_type")
    valid_listing_types = {item[0] for item in Property.ListingType.choices}
    if listing_type not in valid_listing_types:
        normalized.pop("listing_type", None)

    max_price = normalized.get("max_price")
    if max_price is not None:
        try:
            if isinstance(max_price, str):
                max_price = max_price.replace(",", "").strip()
            normalized["max_price"] = Decimal(str(max_price))
        except (InvalidOperation, ValueError, TypeError):
            normalized.pop("max_price", None)

    for int_key in ("nights", "guests"):
        raw = normalized.get(int_key)
        if raw is None:
            continue
        try:
            casted = int(raw)
            if casted <= 0:
                raise ValueError("must be positive")
            normalized[int_key] = casted
        except (ValueError, TypeError):
            normalized.pop(int_key, None)
    return normalized


def _json_safe(value):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, dict):
        return {key: _json_safe(val) for key, val in value.items()}
    if isinstance(value, list):
        return [_json_safe(item) for item in value]
    return value


def _detect_intent_local(message):
    text = (message or "").lower()
    if any(word in text for word in ["guide", "tips", "visit", "safety", "currency", "how to", "how do i"]):
        if any(word in text for word in ["route", "transfer", "taxi", "ferry", "sgr", "airport", "transport", "travel", "get to", "from", "reach"]):
            return "travel_guide"
        return "travel_guide"
    if any(word in text for word in ["payment", "refund", "mpesa", "airtel", "card", "dispute"]):
        return "payment_help"
    if any(word in text for word in ["route", "routes", "transfer", "transport", "ferry", "sgr", "airport to", "get to", "reach"]):
        return "travel_guide"
    if any(word in text for word in ["taxi", "pickup", "driver"]):
        return "taxi_booking"
    if any(word in text for word in ["agent", "wakala", "broker"]):
        return "agent_request"
    if any(word in text for word in ["package", "honeymoon", "holiday"]):
        return "package_request"
    if any(word in text for word in ["hotel"]):
        return "hotel_search"
    if any(word in text for word in ["home", "house", "stay", "bnb", "villa", "apartment"]):
        return "property_search"
    return "general_support"


def _detect_intent_openai(message):
    client = _openai_client()
    if client is None:
        return None, {}
    try:
        prompt = (
            "Classify travel booking intent and extract lightweight filters. "
            "Return strict JSON with keys intent and filters. "
            "Valid intents: property_search, hotel_search, taxi_booking, agent_request, "
            "package_request, travel_guide, payment_help, general_support."
        )
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": message},
            ],
        )
        payload = json.loads(response.choices[0].message.content or "{}")
        intent = payload.get("intent")
        if intent not in SUPPORTED_INTENTS:
            intent = None
        return intent, payload.get("filters") or {}
    except Exception:
        return None, {}


def _get_embedding(text):
    client = _openai_client()
    if client is None:
        return None
    try:
        emb = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=text or "",
        )
        return emb.data[0].embedding
    except Exception:
        return None


def _cosine_similarity(vec_a, vec_b):
    if not vec_a or not vec_b:
        return -1.0
    if len(vec_a) != len(vec_b):
        return -1.0
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    mag_a = math.sqrt(sum(a * a for a in vec_a))
    mag_b = math.sqrt(sum(b * b for b in vec_b))
    if mag_a == 0 or mag_b == 0:
        return -1.0
    return dot / (mag_a * mag_b)


def _property_results(filters):
    qs = Property.objects.filter(is_active=True, approval_status=Property.ApprovalStatus.APPROVED).select_related("destination")
    location = str(filters.get("location") or "").strip()
    if location:
        qs = qs.filter(
            Q(location__icontains=location)
            | Q(country__icontains=location)
            | Q(region__icontains=location)
            | Q(town__icontains=location)
            | Q(destination__destination_name__icontains=location)
        )
    if filters.get("listing_type"):
        qs = qs.filter(listing_type=filters["listing_type"])
    if filters.get("max_price") is not None:
        qs = qs.filter(price_per_night__lte=filters["max_price"])

    items = list(qs[:4])
    results = [
        {
            "id": item.id,
            "title": item.title_sw,
            "price": float(item.price_per_night),
            "location": item.location,
            "rating": None,
            "actions": ["View", "Book", "WhatsApp"],
        }
        for item in items
    ]
    return results, qs.count()


def _agent_results(filters):
    qs = AgentProfile.objects.filter(is_active=True, verified_badge=True).select_related("user")
    location = str(filters.get("location") or "").strip()
    if location:
        qs = qs.filter(Q(areas_served__icontains=location) | Q(agency_name__icontains=location))
    items = list(qs[:4])
    results = [
        {
            "id": item.id,
            "name": item.user.get_full_name() or item.user.username,
            "agency": item.agency_name,
            "areas_served": item.areas_served,
            "rating": float(item.rating),
            "verified": item.verified_badge,
            "actions": ["View profile", "Chat", "WhatsApp"],
        }
        for item in items
    ]
    return results, qs.count()


def _package_results(message):
    qs = TravelPackage.objects.filter(is_active=True)
    text = (message or "").strip().lower()
    if text:
        tokens = [tok for tok in re.findall(r"[a-z0-9\-]+", text) if len(tok) > 2 and tok not in STOPWORDS][:8]
        if tokens:
            query = Q()
            for tok in tokens:
                query |= (
                    Q(name__icontains=tok)
                    | Q(description__icontains=tok)
                    | Q(includes__icontains=tok)
                    | Q(package_type__icontains=tok)
                )
            qs = qs.filter(query)
    items = list(qs[:4])
    results = [
        {
            "id": item.id,
            "name": item.name,
            "price_from": float(item.price_from),
            "duration": item.duration_label,
            "includes": item.includes,
            "actions": ["View", "Book package", "Ask AI"],
        }
        for item in items
    ]
    return results, qs.count()


def _transport_route_results(message):
    qs = TransportRoute.objects.filter(is_active=True)
    text = (message or "").strip().lower()
    
    origin_match = None
    destination_match = None
    
    origin_terms = ["from", "airport", "sgr", "ferry port"]
    destination_terms = ["to", "destination", "reach", "get to"]
    
    if "to" in text or "from" in text:
        parts = re.split(r"\s+(?:to|from)\s+", text)
        if len(parts) >= 2:
            origin_match = parts[0] if "from" in text else parts[-1]
            destination_match = parts[1] if "to" in text else parts[0]
    
    if origin_match:
        qs = qs.filter(origin__icontains=origin_match.strip())
    if destination_match:
        qs = qs.filter(destination__icontains=destination_match.strip())
    
    if not origin_match and not destination_match:
        tokens = [tok for tok in re.findall(r"[a-z0-9\-\s]+", text) if len(tok) > 2 and tok not in STOPWORDS][:8]
        if tokens:
            query = Q()
            for tok in tokens:
                query |= (
                    Q(origin__icontains=tok)
                    | Q(destination__icontains=tok)
                    | Q(notes__icontains=tok)
                    | Q(route_category__icontains=tok)
                )
            qs = qs.filter(query)
    
    qs = qs.order_by("country", "price_min")
    items = list(qs[:5])
    results = [
        {
            "id": item.id,
            "route": f"{item.origin} → {item.destination}",
            "transport_type": item.transport_type,
            "estimated_time": item.estimated_time or "Variable",
            "price_range": f"{item.currency} {float(item.price_min or 0):,.0f} - {float(item.price_max or 0):,.0f}" if item.price_min and item.price_max else "Contact for pricing",
            "notes": item.notes,
            "category": item.route_category,
            "country": item.country,
            "actions": ["Book taxi", "View details"],
        }
        for item in items
    ]
    return results, qs.count()


def _knowledge_answer(message):
    text = (message or "").strip()
    query_embedding = _get_embedding(text)

    if query_embedding:
        candidates = list(
            KnowledgeBase.objects.filter(is_active=True).exclude(embedding=[]).values(
                "id",
                "title",
                "category",
                "content",
                "embedding",
            )[:120]
        )
        if candidates:
            ranked = sorted(
                candidates,
                key=lambda item: _cosine_similarity(query_embedding, item.get("embedding") or []),
                reverse=True,
            )
            top = ranked[0]
            if _cosine_similarity(query_embedding, top.get("embedding") or []) > 0.48:
                return top["content"], [
                    {
                        "title": top["title"],
                        "category": top["category"],
                        "source": "knowledge_base",
                    }
                ]

    tokens = [tok for tok in re.findall(r"[a-z0-9\-]+", text.lower()) if len(tok) > 2 and tok not in STOPWORDS][:10]
    faq_query = Q(question__icontains=text) | Q(answer__icontains=text) | Q(category__icontains=text)
    kb_query = Q(title__icontains=text) | Q(content__icontains=text) | Q(category__icontains=text)
    if tokens:
        token_faq_query = Q()
        token_kb_query = Q()
        for tok in tokens:
            token_faq_query |= Q(question__icontains=tok) | Q(answer__icontains=tok) | Q(category__icontains=tok)
            token_kb_query |= Q(title__icontains=tok) | Q(content__icontains=tok) | Q(category__icontains=tok)
        faq_query |= token_faq_query
        kb_query |= token_kb_query

    faq = FAQArticle.objects.filter(is_active=True).filter(faq_query).first()
    if faq:
        return faq.answer, [{"title": faq.question, "category": faq.category, "source": "faq"}]
    kb = KnowledgeBase.objects.filter(is_active=True).filter(kb_query).first()
    if kb:
        return kb.content, [{"title": kb.title, "category": kb.category, "source": "knowledge_base"}]
    return (
        "I can guide booking steps, payments, taxi transfer, ferry and SGR routes, and safety tips. "
        "For disputes or payment reversals, I will escalate to human support."
    ), []


def build_ai_response(message, conversation, forced_intent=None):
    start = time.monotonic()
    local_filters = _extract_filters(message)
    ai_intent, ai_filters = _detect_intent_openai(message)
    detected_intent = ai_intent or _detect_intent_local(message)
    intent = forced_intent if forced_intent in SUPPORTED_INTENTS else detected_intent
    filters = _normalize_filters({**local_filters, **(ai_filters or {})})

    results = []
    sources = []
    total_count = 0
    response_message = ""

    if intent in {"property_search", "hotel_search"}:
        if intent == "hotel_search" and not filters.get("listing_type"):
            filters["listing_type"] = Property.ListingType.HOTEL
        results, total_count = _property_results(filters)
        response_message = (
            f"I found {len(results)} verified stay options"
            + (f" in {filters.get('location')}" if filters.get("location") else "")
            + "."
        )
        if len(results) == 0:
            response_message = "I could not find matching verified stays right now. Try a nearby area or a higher budget."
    elif intent == "agent_request":
        results, total_count = _agent_results(filters)
        response_message = f"I found {len(results)} verified agents that match your request."
        if len(results) == 0:
            response_message = "I could not find a verified agent for that exact request. Try a nearby area or broader requirement."
    elif intent == "package_request":
        results, total_count = _package_results(message)
        response_message = f"I found {len(results)} packages that match your travel plan."
        if len(results) == 0:
            response_message = "I could not find a matching package right now. Try terms like honeymoon, family, airport pickup, or Zanzibar ferry."
    elif intent == "taxi_booking":
        available_drivers = DriverProfile.objects.filter(is_available=True, is_verified=True).count()
        total_count = available_drivers
        response_message = (
            "Taxi support is ready. Share pickup point, destination, date, and time. "
            f"Currently {available_drivers} verified drivers are marked available."
        )
    elif intent in {"travel_guide", "payment_help", "general_support"}:
        text = (message or "").lower()
        is_transport_query = any(word in text for word in ["route", "routes", "transfer", "ferry", "sgr", "airport", "transport", "from", "to", "get to", "reach"])
        
        if intent == "travel_guide" and is_transport_query:
            results, total_count = _transport_route_results(message)
            if len(results) > 0:
                response_message = f"I found {len(results)} transport route options that match your query. Prices and travel times are estimates."
            else:
                response_message = "I couldn't find specific transport routes for that query. Try including origin and destination (e.g., 'from Moi Airport to Diani')."
        
        if not response_message:
            response_message, sources = _knowledge_answer(message)

    safe_filters = _json_safe(filters)
    structured = {
        "assistant_name": settings.AI_ASSISTANT_NAME,
        "intent": intent,
        "message": response_message,
        "filters": safe_filters,
        "results": results,
        "sources": sources,
        "escalate_to_human": intent in {"payment_help"} and "dispute" in (message or "").lower(),
    }

    latency_ms = int((time.monotonic() - start) * 1000)
    AISearchLog.objects.create(
        conversation=conversation,
        intent=intent,
        filters=safe_filters,
        result_count=total_count,
        latency_ms=max(latency_ms, 1),
    )
    return structured
