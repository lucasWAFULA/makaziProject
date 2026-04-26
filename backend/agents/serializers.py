from rest_framework import serializers

from .models import AgentProfile


class AgentProfileSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = AgentProfile
        fields = (
            "id",
            "agency_name",
            "areas_served",
            "languages",
            "verified_badge",
            "rating",
            "commission_rate",
            "is_active",
            "created_at",
            "user",
        )

    def get_user(self, obj):
        return {
            "id": obj.user_id,
            "username": obj.user.username,
            "email": obj.user.email,
            "phone_number": obj.user.phone_number,
        }
