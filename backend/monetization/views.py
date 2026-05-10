import logging

from django.utils import timezone
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import TransportPartner, ReferralClick, AdPlacement, FeaturedListing
from .serializers import TransportPartnerSerializer, AdPlacementSerializer, FeaturedListingSerializer

logger = logging.getLogger(__name__)


class TransportPartnerListView(APIView):
    """
    GET /api/monetization/transport-partners/
    Returns active transport partners, optionally filtered by country code.
    ?country=KE  → partners that include KE in their countries list (or have an empty list = all countries)
    """
    permission_classes = [AllowAny]

    def get(self, request):
        country = (request.query_params.get("country") or "").upper().strip()
        qs = TransportPartner.objects.filter(is_active=True).order_by("order", "name")
        if country:
            # Include partners that explicitly list this country OR have an empty list (global)
            filtered = [p for p in qs if not p.countries or country in p.countries]
        else:
            filtered = list(qs)

        # If deep link requested, build it with property context
        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")
        name = request.query_params.get("name", "")
        address = request.query_params.get("address", "")

        data = []
        for partner in filtered:
            serialized = TransportPartnerSerializer(partner).data
            serialized["deep_link"] = partner.build_deep_link(lat=lat, lng=lng, name=name, address=address)
            data.append(serialized)

        return Response(data)


class ReferralClickView(APIView):
    """
    POST /api/monetization/referral-click/
    Track a transport partner referral click.

    Body: { partner_slug, property_id, property_location, country }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        partner_slug = (request.data.get("partner_slug") or "").strip()
        try:
            partner = TransportPartner.objects.get(slug=partner_slug, is_active=True)
        except TransportPartner.DoesNotExist:
            return Response({"detail": "Partner not found."}, status=404)

        ReferralClick.objects.create(
            partner=partner,
            property_id=request.data.get("property_id"),
            property_location=request.data.get("property_location", "")[:200],
            country=request.data.get("country", "")[:10],
            session_key=request.session.session_key or "",
            user=request.user if request.user.is_authenticated else None,
            user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
        )
        return Response({"detail": "Click recorded."}, status=201)


class AdPlacementListView(APIView):
    """
    GET /api/monetization/ad-placements/?slot=home_banner
    Returns live ad placements for a given slot.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        slot = request.query_params.get("slot", "")
        now = timezone.now()
        qs = AdPlacement.objects.filter(
            is_active=True,
            starts_at__lte=now,
            ends_at__gte=now,
        )
        if slot:
            qs = qs.filter(slot=slot)

        # Increment impressions (lightweight, no lock needed for MVP)
        qs.update(impressions=__import__("django.db.models", fromlist=["F"]).F("impressions") + 1)

        return Response(AdPlacementSerializer(qs, many=True).data)


class FeaturedListingListView(APIView):
    """
    GET /api/monetization/featured-listings/
    Returns currently live featured listing campaigns with property details.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        now = timezone.now()
        qs = (
            FeaturedListing.objects
            .select_related("property")
            .filter(is_active=True, starts_at__lte=now, ends_at__gte=now)
            .order_by("tier", "-starts_at")
        )
        return Response(FeaturedListingSerializer(qs, many=True).data)
