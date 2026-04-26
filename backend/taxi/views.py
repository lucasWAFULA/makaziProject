from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q

from .models import TaxiBooking, DriverProfile, TransportRoute, TransportPartner
from .serializers import TaxiBookingSerializer, DriverProfileSerializer, TransportRouteSerializer, TransportPartnerSerializer


class TaxiBookingCreateView(generics.CreateAPIView):
    queryset = TaxiBooking.objects.all()
    serializer_class = TaxiBookingSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)


class MyTaxiBookingsView(generics.ListAPIView):
    serializer_class = TaxiBookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TaxiBooking.objects.filter(user=self.request.user).order_by("-created_at")


class DriverListView(generics.ListAPIView):
    serializer_class = DriverProfileSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = DriverProfile.objects.select_related("user").filter(is_available=True)
        if self.request.query_params.get("verified") == "1":
            qs = qs.filter(is_verified=True)
        vehicle_type = self.request.query_params.get("vehicle_type")
        if vehicle_type:
            qs = qs.filter(vehicle_type=vehicle_type)
        return qs.order_by("-is_verified", "-rating")


class TransportRouteListView(generics.ListAPIView):
    serializer_class = TransportRouteSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = TransportRoute.objects.filter(is_active=True)
        
        country = self.request.query_params.get("country")
        if country:
            qs = qs.filter(country__iexact=country)
        
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(route_category__icontains=category)
        
        origin = self.request.query_params.get("origin")
        if origin:
            qs = qs.filter(origin__icontains=origin)
        
        destination = self.request.query_params.get("destination")
        if destination:
            qs = qs.filter(destination__icontains=destination)
        
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(origin__icontains=search) |
                Q(destination__icontains=search) |
                Q(notes__icontains=search)
            )
        
        featured = self.request.query_params.get("featured")
        if featured == "1" or featured == "true":
            qs = qs.filter(is_featured=True)
        
        return qs.order_by("country", "route_category", "origin")


class TransportPartnerListView(generics.ListAPIView):
    serializer_class = TransportPartnerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = TransportPartner.objects.filter(active=True)

        region = self.request.query_params.get("region")
        if region:
            qs = qs.filter(region__icontains=region)

        city = self.request.query_params.get("city")
        if city:
            qs = qs.filter(city__icontains=city)

        service_type = self.request.query_params.get("service_type")
        if service_type:
            qs = qs.filter(service_type=service_type)

        featured = self.request.query_params.get("featured")
        if featured in {"1", "true"}:
            qs = qs.filter(is_featured=True)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(region__icontains=search)
                | Q(city__icontains=search)
                | Q(description__icontains=search)
            )

        return qs.order_by("priority", "name")
