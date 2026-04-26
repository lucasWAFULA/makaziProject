from django.contrib import admin

from .models import (
    ChatSession,
    ChatMessage,
    AIConversation,
    AIMessage,
    AIIntent,
    AISearchLog,
    KnowledgeBase,
    FAQArticle,
    UserPreference,
)


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ("sender", "text", "created_at")
    can_delete = False


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "topic", "status", "user", "client_id", "updated_at", "created_at")
    list_filter = ("topic", "status", "created_at")
    search_fields = ("client_id", "user__username", "user__email")
    inlines = [ChatMessageInline]


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "sender", "created_at")
    list_filter = ("sender", "created_at")
    search_fields = ("text", "session__client_id")


@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "client_id", "updated_at", "created_at")
    search_fields = ("client_id", "user__username", "user__email", "title")


@admin.register(AIMessage)
class AIMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "conversation", "role", "intent", "model_name", "created_at")
    list_filter = ("role", "intent", "model_name", "created_at")
    search_fields = ("content", "conversation__client_id")


@admin.register(AIIntent)
class AIIntentAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name", "description")


@admin.register(AISearchLog)
class AISearchLogAdmin(admin.ModelAdmin):
    list_display = ("id", "conversation", "intent", "result_count", "latency_ms", "created_at")
    list_filter = ("intent", "created_at")


@admin.register(KnowledgeBase)
class KnowledgeBaseAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "country", "region", "is_active", "created_at")
    list_filter = ("category", "country", "region", "is_active")
    search_fields = ("title", "content")


@admin.register(FAQArticle)
class FAQArticleAdmin(admin.ModelAdmin):
    list_display = ("question", "category", "is_active", "created_at")
    list_filter = ("category", "is_active")
    search_fields = ("question", "answer")


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ("user", "preferred_language", "preferred_country", "preferred_region", "updated_at")
    search_fields = ("user__username", "user__email")
