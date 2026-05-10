from django.contrib import admin
from django.utils.html import format_html
from django.utils.timezone import localtime

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
    ordering = ("created_at",)

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = (
        "id", "topic_badge", "status_badge", "user_link",
        "last_message_preview", "message_count", "updated_at",
    )
    list_filter = ("topic", "status", "created_at")
    search_fields = ("client_id", "user__username", "user__email", "messages__text")
    readonly_fields = ("client_id", "created_at", "updated_at", "user")
    inlines = [ChatMessageInline]
    actions = ["close_sessions", "send_test_reply"]

    fieldsets = (
        ("Session", {
            "fields": ("user", "client_id", "topic", "status"),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    # ── Custom columns ────────────────────────────────────────────────────────

    @admin.display(description="Topic")
    def topic_badge(self, obj):
        colours = {
            "house": "#0F5F5F",
            "taxi": "#B45309",
            "group": "#1D4ED8",
            "other": "#6B7280",
        }
        colour = colours.get(obj.topic, "#6B7280")
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:999px;font-size:11px;">{}</span>',
            colour,
            obj.get_topic_display(),
        )

    @admin.display(description="Status")
    def status_badge(self, obj):
        colour = "#059669" if obj.status == "open" else "#6B7280"
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:999px;font-size:11px;">{}</span>',
            colour,
            obj.status.upper(),
        )

    @admin.display(description="User")
    def user_link(self, obj):
        if obj.user:
            email = getattr(obj.user, "email", "") or ""
            name = (getattr(obj.user, "get_full_name", lambda: "")() or obj.user.username or "User").strip()
            return format_html('<a href="mailto:{}">{}</a>', email, name)
        return format_html('<em style="color:#9CA3AF;">Anonymous</em>')

    @admin.display(description="Last message")
    def last_message_preview(self, obj):
        msg = obj.messages.order_by("-created_at").first()
        if msg:
            sender_colour = {"user": "#0F5F5F", "bot": "#6B7280", "agent": "#B45309"}.get(msg.sender, "#6B7280")
            return format_html(
                '<span style="color:{};font-weight:600;">[{}]</span> {}',
                sender_colour,
                msg.sender.upper(),
                msg.text[:80] + ("…" if len(msg.text) > 80 else ""),
            )
        return "—"

    @admin.display(description="Messages")
    def message_count(self, obj):
        return obj.messages.count()

    # ── Admin actions ─────────────────────────────────────────────────────────

    @admin.action(description="✓ Close selected sessions")
    def close_sessions(self, request, queryset):
        updated = queryset.filter(status=ChatSession.Status.OPEN).update(status=ChatSession.Status.CLOSED)
        self.message_user(request, f"{updated} session(s) closed.")

    @admin.action(description="📧 Send test reply email to user")
    def send_test_reply(self, request, queryset):
        from .email_service import notify_user_admin_reply
        sent = 0
        for session in queryset:
            user_email = getattr(session.user, "email", "") if session.user else ""
            if user_email:
                notify_user_admin_reply(
                    session,
                    "Thank you for contacting MakaziPlus support. We have reviewed your request and will follow up shortly.",
                    user_email,
                    getattr(session.user, "first_name", "") or session.user.username,
                )
                sent += 1
        self.message_user(request, f"Test reply sent to {sent} user(s).")


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "session_link", "sender", "text_preview", "created_at")
    list_filter = ("sender", "created_at")
    search_fields = ("text", "session__client_id", "session__user__email")
    readonly_fields = ("session", "sender", "created_at")

    @admin.display(description="Session")
    def session_link(self, obj):
        return format_html(
            '<a href="/admin/chat/chatsession/{}/change/">Session #{}</a>',
            obj.session_id, obj.session_id,
        )

    @admin.display(description="Message")
    def text_preview(self, obj):
        return obj.text[:100] + ("…" if len(obj.text) > 100 else "")


@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "title", "message_count", "updated_at", "created_at")
    search_fields = ("client_id", "user__username", "user__email", "title")
    readonly_fields = ("client_id", "created_at", "updated_at")

    @admin.display(description="Messages")
    def message_count(self, obj):
        return obj.messages.count()


@admin.register(AIMessage)
class AIMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "conversation", "role", "intent", "content_preview", "model_name", "created_at")
    list_filter = ("role", "intent", "model_name", "created_at")
    search_fields = ("content", "conversation__client_id")

    @admin.display(description="Content")
    def content_preview(self, obj):
        return obj.content[:80] + ("…" if len(obj.content) > 80 else "")


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
