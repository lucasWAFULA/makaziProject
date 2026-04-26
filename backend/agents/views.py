from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import AgentProfile
from .serializers import AgentProfileSerializer


class AgentProfileListView(generics.ListAPIView):
    serializer_class = AgentProfileSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = AgentProfile.objects.select_related("user").filter(is_active=True)
        if self.request.query_params.get("verified") == "1":
            qs = qs.filter(verified_badge=True)
        area = self.request.query_params.get("area")
        if area:
            qs = qs.filter(areas_served__icontains=area)
        return qs
