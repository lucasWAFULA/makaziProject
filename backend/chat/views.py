from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ChatSession, ChatMessage, AIConversation, AIMessage
from .serializers import (
    ChatSessionSerializer,
    ChatSessionCreateSerializer,
    ChatMessageCreateSerializer,
    ChatMessageSerializer,
    AIConversationSerializer,
    AIChatRequestSerializer,
    AIStructuredSearchSerializer,
)
from .ai_service import build_ai_response


BOT_REPLIES = {
    ChatSession.Topic.HOUSE: "Great choice. Share destination and budget and we will suggest suitable stays.",
    ChatSession.Topic.TAXI: "Taxi support is ready. Please share pickup and destination details in Taxi Booking.",
    ChatSession.Topic.GROUP: "Perfect. Tell us your group size and dates to get matching home and transfer options.",
    ChatSession.Topic.OTHER: "Thank you. Our support team will review this and respond shortly.",
}


def _resolve_topic(session, user_text):
    text = (user_text or "").lower()
    if "taxi" in text or "transfer" in text:
        return ChatSession.Topic.TAXI
    if "group" in text:
        return ChatSession.Topic.GROUP
    if "house" in text or "home" in text or "stay" in text:
        return ChatSession.Topic.HOUSE
    return session.topic or ChatSession.Topic.OTHER


def _can_access_session(request, session, client_id):
    if request.user.is_authenticated and session.user_id == request.user.id:
        return True
    return session.client_id == client_id


class ChatSessionCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ChatSessionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = request.user if request.user.is_authenticated else None
        session = ChatSession.objects.create(
            user=user,
            client_id=data["client_id"],
            topic=data["topic"],
        )
        user_message = ChatMessage.objects.create(
            session=session,
            sender=ChatMessage.Sender.USER,
            text=data["message"],
        )
        topic = _resolve_topic(session, data["message"])
        if topic != session.topic:
            session.topic = topic
            session.save(update_fields=["topic", "updated_at"])
        bot_message = ChatMessage.objects.create(
            session=session,
            sender=ChatMessage.Sender.BOT,
            text=BOT_REPLIES.get(topic, BOT_REPLIES[ChatSession.Topic.OTHER]),
        )
        return Response(
            {
                "session": ChatSessionSerializer(session).data,
                "user_message": ChatMessageSerializer(user_message).data,
                "bot_message": ChatMessageSerializer(bot_message).data,
            },
            status=status.HTTP_201_CREATED,
        )


class ChatSessionDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, session_pk):
        client_id = request.query_params.get("client_id", "")
        session = get_object_or_404(ChatSession.objects.prefetch_related("messages"), pk=session_pk)
        if not _can_access_session(request, session, client_id):
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ChatSessionSerializer(session).data)


class ChatSessionMessageCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, session_pk):
        serializer = ChatMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        session = get_object_or_404(ChatSession, pk=session_pk)
        if not _can_access_session(request, session, data["client_id"]):
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        if session.status != ChatSession.Status.OPEN:
            return Response({"detail": "This chat session is closed."}, status=status.HTTP_400_BAD_REQUEST)

        user_message = ChatMessage.objects.create(
            session=session,
            sender=ChatMessage.Sender.USER,
            text=data["message"],
        )
        topic = _resolve_topic(session, data["message"])
        if topic != session.topic:
            session.topic = topic
            session.save(update_fields=["topic", "updated_at"])
        bot_message = ChatMessage.objects.create(
            session=session,
            sender=ChatMessage.Sender.BOT,
            text=BOT_REPLIES.get(topic, BOT_REPLIES[ChatSession.Topic.OTHER]),
        )
        return Response(
            {
                "user_message": ChatMessageSerializer(user_message).data,
                "bot_message": ChatMessageSerializer(bot_message).data,
            },
            status=status.HTTP_201_CREATED,
        )


def _resolve_ai_conversation(user, client_id, conversation_id=None):
    if conversation_id:
        conversation = get_object_or_404(AIConversation, pk=conversation_id)
        if user.is_authenticated and conversation.user_id == user.id:
            return conversation
        if conversation.client_id == client_id:
            return conversation
        return None
    return AIConversation.objects.create(
        user=user if user.is_authenticated else None,
        client_id=client_id,
    )


class AIChatView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AIChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        conversation = _resolve_ai_conversation(
            request.user,
            data["client_id"],
            data.get("conversation_id"),
        )
        if conversation is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        user_message = AIMessage.objects.create(
            conversation=conversation,
            role=AIMessage.Role.USER,
            content=data["message"],
        )
        structured = build_ai_response(data["message"], conversation)
        assistant_message = AIMessage.objects.create(
            conversation=conversation,
            role=AIMessage.Role.ASSISTANT,
            content=structured["message"],
            intent=structured["intent"],
            structured_response=structured,
            model_name=settings.OPENAI_MODEL if settings.OPENAI_API_KEY else "rules",
        )

        if not conversation.title:
            conversation.title = data["message"][:80]
            conversation.save(update_fields=["title", "updated_at"])

        return Response(
            {
                "conversation_id": conversation.id,
                "assistant_name": structured.get("assistant_name"),
                "intent": structured.get("intent"),
                "user_message": {
                    "id": user_message.id,
                    "role": user_message.role,
                    "content": user_message.content,
                },
                "assistant_message": {
                    "id": assistant_message.id,
                    "role": assistant_message.role,
                    "content": assistant_message.content,
                    "structured_response": structured,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class AIConversationDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, conversation_pk):
        client_id = request.query_params.get("client_id", "")
        conversation = get_object_or_404(AIConversation.objects.prefetch_related("messages"), pk=conversation_pk)
        if request.user.is_authenticated and conversation.user_id == request.user.id:
            return Response(AIConversationSerializer(conversation).data)
        if conversation.client_id == client_id:
            return Response(AIConversationSerializer(conversation).data)
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)


class AISearchListingsView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AIStructuredSearchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        client_id = serializer.validated_data.get("client_id") or "public-client"
        conversation = AIConversation.objects.create(
            user=request.user if request.user.is_authenticated else None,
            client_id=client_id,
            title="Listing search",
        )
        structured = build_ai_response(
            serializer.validated_data["message"],
            conversation,
            forced_intent="property_search",
        )
        return Response(structured)


class AIRecommendPackageView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AIStructuredSearchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        client_id = serializer.validated_data.get("client_id") or "public-client"
        conversation = AIConversation.objects.create(
            user=request.user if request.user.is_authenticated else None,
            client_id=client_id,
            title="Package recommendation",
        )
        structured = build_ai_response(
            serializer.validated_data["message"],
            conversation,
            forced_intent="package_request",
        )
        return Response(structured)


class AIMatchAgentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AIStructuredSearchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        client_id = serializer.validated_data.get("client_id") or "public-client"
        conversation = AIConversation.objects.create(
            user=request.user if request.user.is_authenticated else None,
            client_id=client_id,
            title="Agent matching",
        )
        structured = build_ai_response(
            serializer.validated_data["message"],
            conversation,
            forced_intent="agent_request",
        )
        return Response(structured)
