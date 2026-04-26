from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from properties.models import Property
from .models import Review
from .serializers import ReviewSerializer, ReviewCreateSerializer


class PropertyReviewsView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = []

    def get_queryset(self):
        prop = get_object_or_404(Property, pk=self.kwargs["property_pk"], is_active=True)
        return Review.objects.filter(booking__property=prop).select_related("booking__user").order_by("-created_at")


class ReviewCreateView(generics.CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewCreateSerializer
    permission_classes = [IsAuthenticated]
