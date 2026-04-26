from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Destination
from .serializers import DestinationSerializer


class DestinationListView(generics.ListAPIView):
    serializer_class = DestinationSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Destination.objects.filter(is_active=True)
        country = self.request.query_params.get("country")
        region = self.request.query_params.get("region")
        category = self.request.query_params.get("category")
        featured = self.request.query_params.get("featured")
        if country:
            qs = qs.filter(country__iexact=country)
        if region:
            qs = qs.filter(region__iexact=region)
        if category:
            qs = qs.filter(tourism_category__iexact=category)
        if featured == "1":
            qs = qs.filter(is_featured=True)
        return qs


class DestinationDetailView(generics.RetrieveAPIView):
    queryset = Destination.objects.filter(is_active=True)
    serializer_class = DestinationSerializer
    permission_classes = [AllowAny]
    lookup_field = "destination_slug"
