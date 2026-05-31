from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "is_verified",
            "is_staff",
        )
        read_only_fields = ("id", "is_verified", "is_staff")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    username = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("first_name", "email", "phone_number", "password", "password_confirm", "role", "username")

    def validate_role(self, value):
        allowed = {
            User.Role.CUSTOMER,
            User.Role.AGENT,
            User.Role.HOST,
            User.Role.HOTEL_ADMIN,
            User.Role.DRIVER,
        }
        if value not in allowed:
            return User.Role.CUSTOMER
        return value

    def validate_email(self, value):
        return value.strip().lower()

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        attrs.pop("password_confirm")
        return attrs

    def create(self, validated_data):
        email = validated_data["email"]
        validated_data["username"] = email
        return User.objects.create_user(**validated_data)
