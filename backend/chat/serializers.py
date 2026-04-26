from rest_framework import serializers

from .models import ChatSession, ChatMessage, AIConversation, AIMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ("id", "sender", "text", "created_at")


class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatSession
        fields = ("id", "topic", "status", "created_at", "updated_at", "messages")


class ChatSessionCreateSerializer(serializers.Serializer):
    client_id = serializers.CharField(max_length=64)
    topic = serializers.ChoiceField(choices=ChatSession.Topic.choices, required=False, default=ChatSession.Topic.OTHER)
    message = serializers.CharField(max_length=2000)


class ChatMessageCreateSerializer(serializers.Serializer):
    client_id = serializers.CharField(max_length=64)
    message = serializers.CharField(max_length=2000)


class AIMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIMessage
        fields = ("id", "role", "content", "intent", "structured_response", "created_at")


class AIConversationSerializer(serializers.ModelSerializer):
    messages = AIMessageSerializer(many=True, read_only=True)

    class Meta:
        model = AIConversation
        fields = ("id", "title", "created_at", "updated_at", "messages")


class AIChatRequestSerializer(serializers.Serializer):
    client_id = serializers.CharField(max_length=64)
    message = serializers.CharField(max_length=3000)
    conversation_id = serializers.IntegerField(required=False)


class AIStructuredSearchSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=3000)
    client_id = serializers.CharField(max_length=64, required=False, default="")
