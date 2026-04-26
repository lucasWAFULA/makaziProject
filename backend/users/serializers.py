from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "phone_number", "role", "is_verified")
        read_only_fields = ("id", "is_verified")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "email", "phone_number", "password", "password_confirm", "role")

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

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        attrs.pop("password_confirm")
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
