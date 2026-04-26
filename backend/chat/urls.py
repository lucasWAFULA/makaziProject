from django.urls import path

from .views import (
    ChatSessionCreateView,
    ChatSessionDetailView,
    ChatSessionMessageCreateView,
    AIChatView,
    AIConversationDetailView,
    AISearchListingsView,
    AIRecommendPackageView,
    AIMatchAgentView,
)


urlpatterns = [
    path("sessions/", ChatSessionCreateView.as_view(), name="chat-session-create"),
    path("sessions/<int:session_pk>/", ChatSessionDetailView.as_view(), name="chat-session-detail"),
    path("sessions/<int:session_pk>/messages/", ChatSessionMessageCreateView.as_view(), name="chat-session-message-create"),
    path("ai/chat/", AIChatView.as_view(), name="ai-chat"),
    path("ai/conversations/<int:conversation_pk>/", AIConversationDetailView.as_view(), name="ai-conversation-detail"),
    path("ai/search-listings/", AISearchListingsView.as_view(), name="ai-search-listings"),
    path("ai/recommend-package/", AIRecommendPackageView.as_view(), name="ai-recommend-package"),
    path("ai/match-agent/", AIMatchAgentView.as_view(), name="ai-match-agent"),
]
