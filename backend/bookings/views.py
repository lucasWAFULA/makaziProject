from datetime import timedelta
from django.db import transaction
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from properties.models import Property
from .models import Booking, Availability
from .serializers import BookingSerializer, BookingCreateSerializer, AvailabilitySerializer


def date_range(start, end):
    d = start
    while d < end:
        yield d
        d += timedelta(days=1)


class MyBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related("property").order_by("-created_at")


class BookingCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Booking.objects.all()

    def get_serializer_class(self):
        return BookingCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        property_id = serializer.validated_data["property"].id
        check_in = serializer.validated_data["check_in"]
        check_out = serializer.validated_data["check_out"]
        prop = get_object_or_404(Property, pk=property_id, is_active=True)

        with transaction.atomic():
            dates = list(date_range(check_in, check_out))
            rows = list(
                Availability.objects.filter(
                    property_id=property_id,
                    date__in=dates,
                    is_available=True,
                ).select_for_update().order_by("date")
            )
            if len(rows) != len(dates):
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"detail": "Not all selected dates are available."})

            nights = len(dates)
            total_price = prop.price_per_night * nights
            booking = Booking.objects.create(
                user=request.user,
                property=prop,
                check_in=check_in,
                check_out=check_out,
                total_price=total_price,
                status=Booking.Status.PENDING,
            )
            Availability.objects.filter(
                property_id=property_id,
                date__in=dates,
            ).update(is_available=False)

        return Response(
            BookingSerializer(booking).data,
            status=201,
        )


class AvailabilityListView(generics.ListAPIView):
    serializer_class = AvailabilitySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        prop = get_object_or_404(Property, pk=self.kwargs["property_pk"], is_active=True)
        return Availability.objects.filter(property=prop).order_by("date")


class AvailabilityBulkView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, property_pk):
        prop = get_object_or_404(Property, pk=property_pk)
        if prop.host_id != request.user.id and not request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()
        dates = request.data.get("dates", [])
        is_available = request.data.get("is_available", True)
        for d in dates:
            Availability.objects.update_or_create(
                property=prop,
                date=d,
                defaults={"is_available": is_available},
            )
        return Response({"status": "ok"})
