from django.urls import path

from .views import AIChatView, AIConversationDetailView, AISearchListingsView, AIRecommendPackageView, AIMatchAgentView


urlpatterns = [
    path("chat/", AIChatView.as_view(), name="ai-chat-direct"),
    path("conversations/<int:conversation_pk>/", AIConversationDetailView.as_view(), name="ai-conversation-detail-direct"),
    path("search-listings/", AISearchListingsView.as_view(), name="ai-search-listings-direct"),
    path("recommend-package/", AIRecommendPackageView.as_view(), name="ai-recommend-package-direct"),
    path("match-agent/", AIMatchAgentView.as_view(), name="ai-match-agent-direct"),
]
