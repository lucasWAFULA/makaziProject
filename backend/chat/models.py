from django.conf import settings
from django.db import models


class ChatSession(models.Model):
    class Topic(models.TextChoices):
        HOUSE = "house", "House stay"
        TAXI = "taxi", "Taxi transfer"
        GROUP = "group", "Group booking"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        CLOSED = "closed", "Closed"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="chat_sessions",
    )
    client_id = models.CharField(max_length=64, db_index=True)
    topic = models.CharField(max_length=20, choices=Topic.choices, default=Topic.OTHER)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"ChatSession {self.pk} ({self.topic})"


class ChatMessage(models.Model):
    class Sender(models.TextChoices):
        USER = "user", "User"
        BOT = "bot", "Bot"
        AGENT = "agent", "Agent"

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=20, choices=Sender.choices)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender}: {self.text[:40]}"


class AIConversation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ai_conversations",
    )
    client_id = models.CharField(max_length=64, db_index=True)
    title = models.CharField(max_length=160, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"AIConversation {self.pk}"


class AIIntent(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class AIMessage(models.Model):
    class Role(models.TextChoices):
        USER = "user", "User"
        ASSISTANT = "assistant", "Assistant"
        SYSTEM = "system", "System"

    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=20, choices=Role.choices)
    content = models.TextField()
    intent = models.CharField(max_length=50, blank=True, default="")
    structured_response = models.JSONField(default=dict, blank=True)
    model_name = models.CharField(max_length=80, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.role}: {self.content[:40]}"


class AISearchLog(models.Model):
    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name="search_logs")
    intent = models.CharField(max_length=50)
    filters = models.JSONField(default=dict, blank=True)
    result_count = models.PositiveIntegerField(default=0)
    latency_ms = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class KnowledgeBase(models.Model):
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100, db_index=True)
    content = models.TextField()
    country = models.CharField(max_length=100, blank=True, default="")
    region = models.CharField(max_length=100, blank=True, default="")
    embedding = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title


class FAQArticle(models.Model):
    question = models.CharField(max_length=220)
    answer = models.TextField()
    category = models.CharField(max_length=100, blank=True, default="")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["question"]

    def __str__(self):
        return self.question


class UserPreference(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_preferences",
    )
    preferred_language = models.CharField(max_length=12, blank=True, default="")
    preferred_country = models.CharField(max_length=80, blank=True, default="")
    preferred_region = models.CharField(max_length=80, blank=True, default="")
    budget_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    budget_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    extras = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Preferences for {self.user_id}"
