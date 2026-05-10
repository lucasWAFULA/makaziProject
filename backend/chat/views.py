import logging

from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
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
from .email_service import (
    notify_support_new_chat,
    notify_support_followup_message,
    notify_user_session_received,
    notify_user_admin_reply,
)

logger = logging.getLogger(__name__)

BOT_REPLIES = {
    ChatSession.Topic.HOUSE: "Asante! Share your destination and budget and we will suggest the best stays for you.",
    ChatSession.Topic.TAXI: "Taxi support is ready. Please share pickup location and destination in the Taxi Booking section.",
    ChatSession.Topic.GROUP: "Perfect. Tell us your group size and dates to get matching home and transfer options.",
    ChatSession.Topic.OTHER: "Thank you for your message. Our support team will review it and respond shortly.",
}


def _resolve_topic(session, user_text):
    text = (user_text or "").lower()
    if "taxi" in text or "transfer" in text:
        return ChatSession.Topic.TAXI
    if "group" in text:
        return ChatSession.Topic.GROUP
    if "house" in text or "home" in text or "stay" in text or "room" in text or "apartment" in text:
        return ChatSession.Topic.HOUSE
    return session.topic or ChatSession.Topic.OTHER


def _can_access_session(request, session, client_id):
    if request.user.is_authenticated:
        if request.user.is_staff or request.user.is_superuser:
            return True
        if session.user_id == request.user.id:
            return True
    return session.client_id == client_id


def _get_user_email(session) -> str:
    user = session.user
    return (getattr(user, "email", "") or "") if user else ""


def _get_user_name(session) -> str:
    user = session.user
    if not user:
        return "Guest"
    return (
        getattr(user, "get_full_name", lambda: "")()
        or getattr(user, "first_name", "")
        or getattr(user, "username", "Guest")
    ).strip() or "Guest"


# ── Public chat ────────────────────────────────────────────────────────────────

class ChatSessionCreateView(APIView):
    """
    POST /api/chat/sessions/
    Creates a new session + first user message. Sends Zoho email to support
    and a receipt email to the user (if registered).
    """
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

        # ── Email notifications ──────────────────────────────────────────────
        try:
            notify_support_new_chat(session, data["message"])
            user_email = _get_user_email(session)
            if user_email:
                notify_user_session_received(session, user_email, _get_user_name(session))
        except Exception as exc:
            logger.warning("Chat email notification failed (session=%s): %s", session.pk, exc)

        return Response(
            {
                "session": ChatSessionSerializer(session).data,
                "user_message": ChatMessageSerializer(user_message).data,
                "bot_message": ChatMessageSerializer(bot_message).data,
            },
            status=status.HTTP_201_CREATED,
        )


class ChatSessionDetailView(APIView):
    """GET /api/chat/sessions/<pk>/ — fetch session + all messages."""
    permission_classes = [AllowAny]

    def get(self, request, session_pk):
        client_id = request.query_params.get("client_id", "")
        session = get_object_or_404(ChatSession.objects.prefetch_related("messages"), pk=session_pk)
        if not _can_access_session(request, session, client_id):
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ChatSessionSerializer(session).data)


class ChatSessionMessageCreateView(APIView):
    """
    POST /api/chat/sessions/<pk>/messages/
    User sends a follow-up message. Notifies support via email.
    """
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

        # ── Email notification to support ────────────────────────────────────
        try:
            notify_support_followup_message(session, data["message"])
        except Exception as exc:
            logger.warning("Follow-up email notification failed (session=%s): %s", session.pk, exc)

        return Response(
            {
                "user_message": ChatMessageSerializer(user_message).data,
                "bot_message": ChatMessageSerializer(bot_message).data,
            },
            status=status.HTTP_201_CREATED,
        )


# ── Staff / admin chat endpoints ───────────────────────────────────────────────

class ChatSessionAdminListView(APIView):
    """
    GET /api/chat/sessions/admin/
    Staff-only: list all chat sessions ordered by most recent.
    Supports ?status=open|closed, ?topic=house|taxi|group|other, ?search=
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = (
            ChatSession.objects
            .select_related("user")
            .prefetch_related("messages")
            .order_by("-updated_at")
        )
        status_filter = request.query_params.get("status")
        if status_filter in ("open", "closed"):
            qs = qs.filter(status=status_filter)

        topic_filter = request.query_params.get("topic")
        if topic_filter:
            qs = qs.filter(topic=topic_filter)

        search = request.query_params.get("search", "").strip()
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(client_id__icontains=search)
                | Q(user__email__icontains=search)
                | Q(user__username__icontains=search)
                | Q(messages__text__icontains=search)
            ).distinct()

        data = []
        for session in qs[:100]:
            last_msg = session.messages.last()
            user = session.user
            data.append({
                "id": session.pk,
                "topic": session.topic,
                "topic_display": session.get_topic_display(),
                "status": session.status,
                "user_id": user.pk if user else None,
                "user_email": getattr(user, "email", "") if user else "",
                "user_name": _get_user_name(session),
                "client_id": session.client_id,
                "message_count": session.messages.count(),
                "last_message": last_msg.text[:120] if last_msg else "",
                "last_sender": last_msg.sender if last_msg else "",
                "created_at": session.created_at.isoformat(),
                "updated_at": session.updated_at.isoformat(),
            })

        return Response({"count": len(data), "results": data})


class ChatSessionAdminReplyView(APIView):
    """
    POST /api/chat/sessions/<pk>/reply/
    Staff-only: send an agent reply to a session.
    Creates a DB AGENT message + emails the user if they have an email address.

    Request body: { "message": "Your reply text here" }
    """
    permission_classes = [IsAdminUser]

    def post(self, request, session_pk):
        message_text = (request.data.get("message") or "").strip()
        if not message_text:
            return Response({"detail": "message is required."}, status=status.HTTP_400_BAD_REQUEST)

        session = get_object_or_404(ChatSession, pk=session_pk)
        if session.status != ChatSession.Status.OPEN:
            return Response({"detail": "Cannot reply to a closed session."}, status=status.HTTP_400_BAD_REQUEST)

        agent_message = ChatMessage.objects.create(
            session=session,
            sender=ChatMessage.Sender.AGENT,
            text=message_text,
        )
        session.save(update_fields=["updated_at"])

        # ── Email user ───────────────────────────────────────────────────────
        user_email = _get_user_email(session)
        emailed = False
        if user_email:
            try:
                notify_user_admin_reply(session, message_text, user_email, _get_user_name(session))
                emailed = True
            except Exception as exc:
                logger.warning("Admin reply email failed (session=%s): %s", session.pk, exc)

        return Response(
            {
                "agent_message": ChatMessageSerializer(agent_message).data,
                "user_emailed": emailed,
                "user_email": user_email or "(anonymous — no email)",
            },
            status=status.HTTP_201_CREATED,
        )


class ChatSessionAdminCloseView(APIView):
    """
    POST /api/chat/sessions/<pk>/close/
    Staff-only: close a session.
    """
    permission_classes = [IsAdminUser]

    def post(self, request, session_pk):
        session = get_object_or_404(ChatSession, pk=session_pk)
        session.status = ChatSession.Status.CLOSED
        session.save(update_fields=["status", "updated_at"])
        return Response({"detail": "Session closed.", "status": session.status})


# ── Registered-user: own sessions ─────────────────────────────────────────────

class MyChatSessionsView(APIView):
    """
    GET /api/chat/sessions/mine/
    Returns all sessions belonging to the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = (
            ChatSession.objects
            .filter(user=request.user)
            .prefetch_related("messages")
            .order_by("-updated_at")
        )
        return Response(ChatSessionSerializer(sessions, many=True).data)


# ── AI endpoints ───────────────────────────────────────────────────────────────

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
