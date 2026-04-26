from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import TravelPackage
from .serializers import TravelPackageSerializer


class TravelPackageListView(generics.ListAPIView):
    serializer_class = TravelPackageSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = TravelPackage.objects.filter(is_active=True)
        package_type = self.request.query_params.get("package_type")
        slug = self.request.query_params.get("slug")
        if package_type:
            qs = qs.filter(package_type=package_type)
        if slug:
            qs = qs.filter(slug=slug)
        return qs
