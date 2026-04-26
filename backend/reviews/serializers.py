from rest_framework import serializers
from .models import Review
from users.serializers import UserSerializer


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ("id", "booking", "rating", "comment_sw", "user", "created_at")
        read_only_fields = ("created_at",)

    def get_user(self, obj):
        return UserSerializer(obj.booking.user).data if obj.booking else None


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ("booking", "rating", "comment_sw")

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate(self, attrs):
        booking = attrs["booking"]
        if booking.user_id != self.context["request"].user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only review your own bookings.")
        if booking.status != "confirmed":
            raise serializers.ValidationError({"booking": "Can only review confirmed bookings."})
        if Review.objects.filter(booking=booking).exists():
            raise serializers.ValidationError({"booking": "Already reviewed."})
        return attrs
