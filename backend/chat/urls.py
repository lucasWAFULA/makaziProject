from django.urls import path

from .views import (
    ChatSessionCreateView,
    ChatSessionDetailView,
    ChatSessionMessageCreateView,
    ChatSessionAdminListView,
    ChatSessionAdminReplyView,
    ChatSessionAdminCloseView,
    MyChatSessionsView,
    AIChatView,
    AIConversationDetailView,
    AISearchListingsView,
    AIRecommendPackageView,
    AIMatchAgentView,
)


urlpatterns = [
    # ── Public / user session endpoints ──────────────────────────────────────
    path("sessions/", ChatSessionCreateView.as_view(), name="chat-session-create"),
    path("sessions/mine/", MyChatSessionsView.as_view(), name="chat-sessions-mine"),
    path("sessions/<int:session_pk>/", ChatSessionDetailView.as_view(), name="chat-session-detail"),
    path("sessions/<int:session_pk>/messages/", ChatSessionMessageCreateView.as_view(), name="chat-session-message-create"),

    # ── Staff / admin endpoints ───────────────────────────────────────────────
    path("sessions/admin/", ChatSessionAdminListView.as_view(), name="chat-session-admin-list"),
    path("sessions/<int:session_pk>/reply/", ChatSessionAdminReplyView.as_view(), name="chat-session-admin-reply"),
    path("sessions/<int:session_pk>/close/", ChatSessionAdminCloseView.as_view(), name="chat-session-admin-close"),

    # ── AI endpoints ──────────────────────────────────────────────────────────
    path("ai/chat/", AIChatView.as_view(), name="ai-chat"),
    path("ai/conversations/<int:conversation_pk>/", AIConversationDetailView.as_view(), name="ai-conversation-detail"),
    path("ai/search-listings/", AISearchListingsView.as_view(), name="ai-search-listings"),
    path("ai/recommend-package/", AIRecommendPackageView.as_view(), name="ai-recommend-package"),
    path("ai/match-agent/", AIMatchAgentView.as_view(), name="ai-match-agent"),
]
