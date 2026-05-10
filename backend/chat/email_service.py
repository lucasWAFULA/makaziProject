"""
Chat-specific email notifications via the shared mailer infrastructure.

All helpers are safe to call from request paths — failures are logged, never raised.
"""
from __future__ import annotations

from html import escape

from django.conf import settings

from notifications.mailer import send_html_email, _wrap_html

_ADMIN_URL = getattr(settings, "SITE_URL", "https://www.makazi-plus.com").rstrip("/")
_ADMIN_PANEL = "https://karibumakazi-api-dpifguofja-ew.a.run.app/admin/chat/chatsession/"


def _support_email() -> str:
    return getattr(settings, "SUPPORT_EMAIL", "support@makazi-plus.com")


def _display_name(user) -> str:
    if not user:
        return "Guest"
    return (
        getattr(user, "get_full_name", lambda: "")()
        or getattr(user, "first_name", "")
        or getattr(user, "username", "")
        or getattr(user, "email", "Guest")
    ).strip() or "Guest"


# ── Support notifications ──────────────────────────────────────────────────────

def notify_support_new_chat(session, first_message: str) -> None:
    """
    Email support when a new chat session is opened.
    Includes user details, topic, message text, and a direct link to the admin panel.
    """
    user = session.user
    user_label = _display_name(user)
    user_email = getattr(user, "email", "") if user else ""
    topic_display = session.get_topic_display() if hasattr(session, "get_topic_display") else session.topic

    subject = f"[MakaziPlus Chat] New message — {topic_display} · Session #{session.pk}"

    intro = (
        f"<p>A new chat session has been opened on MakaziPlus.</p>"
        f"<p><strong>User:</strong> {escape(user_label)}"
        + (f" &lt;{escape(user_email)}&gt;" if user_email else " (anonymous)")
        + f"<br><strong>Topic:</strong> {escape(topic_display)}"
        f"<br><strong>Session ID:</strong> #{session.pk}</p>"
    )

    body = (
        f"<p><strong>Message:</strong></p>"
        f"<blockquote style='border-left:3px solid #0F5F5F;padding-left:12px;color:#374151;'>"
        f"{escape(first_message)}"
        f"</blockquote>"
        f"<p style='font-size:13px;color:#6B7280;'>Reply from the admin panel below.</p>"
    )

    cta = {
        "label": "Open in Admin Panel →",
        "href": f"{_ADMIN_PANEL}{session.pk}/change/",
    }

    text = (
        f"New MakaziPlus chat — Session #{session.pk}\n"
        f"User: {user_label}{' <' + user_email + '>' if user_email else ' (anonymous)'}\n"
        f"Topic: {topic_display}\n\n"
        f"Message:\n{first_message}\n\n"
        f"Admin panel: {_ADMIN_PANEL}{session.pk}/change/\n\n— MakaziPlus Notifications"
    )

    send_html_email(
        subject, text,
        _wrap_html(subject, intro, body, cta),
        to=[_support_email()],
        reply_to=[user_email] if user_email else None,
    )


def notify_support_followup_message(session, message_text: str) -> None:
    """
    Lighter notification for follow-up messages in an existing session.
    """
    user = session.user
    user_label = _display_name(user)
    user_email = getattr(user, "email", "") if user else ""
    topic_display = session.get_topic_display() if hasattr(session, "get_topic_display") else session.topic

    subject = f"[MakaziPlus Chat] Follow-up — Session #{session.pk} · {user_label}"

    intro = (
        f"<p>A follow-up message was sent in chat session <strong>#{session.pk}</strong>.</p>"
    )
    body = (
        f"<p><strong>User:</strong> {escape(user_label)}"
        + (f" &lt;{escape(user_email)}&gt;" if user_email else "")
        + f"<br><strong>Topic:</strong> {escape(topic_display)}</p>"
        f"<p><strong>Message:</strong></p>"
        f"<blockquote style='border-left:3px solid #0F5F5F;padding-left:12px;color:#374151;'>"
        f"{escape(message_text)}"
        f"</blockquote>"
    )
    cta = {"label": "View session →", "href": f"{_ADMIN_PANEL}{session.pk}/change/"}

    text = (
        f"Follow-up · Session #{session.pk} — {user_label}\n"
        f"Message: {message_text}\n\n"
        f"Admin: {_ADMIN_PANEL}{session.pk}/change/"
    )

    send_html_email(
        subject, text,
        _wrap_html(subject, intro, body, cta),
        to=[_support_email()],
        reply_to=[user_email] if user_email else None,
    )


# ── User notifications ─────────────────────────────────────────────────────────

def notify_user_session_received(session, user_email: str, user_name: str) -> None:
    """
    Confirm to the user that their message was received and support will respond.
    """
    if not user_email or "@" not in user_email:
        return

    topic_display = session.get_topic_display() if hasattr(session, "get_topic_display") else session.topic
    subject = f"We received your message — MakaziPlus Support #{session.pk}"

    intro = (
        f"<p>Karibu <strong>{escape(user_name)}</strong>,</p>"
        f"<p>Thank you for reaching out. We have received your message about "
        f"<strong>{escape(topic_display)}</strong> and our team will get back to you shortly.</p>"
    )
    body = (
        f"<p><strong>Session reference:</strong> #{session.pk}</p>"
        f"<p>You can reply directly to this email and your message will be added to your support thread.</p>"
        f"<p style='color:#6B7280;font-size:13px;'>Typical response time: within 2 hours during business hours (EAT).</p>"
    )
    cta = {"label": "Continue on MakaziPlus →", "href": _ADMIN_URL}

    text = (
        f"Karibu {user_name},\n\nWe received your message (Session #{session.pk}).\n"
        f"Our team will respond shortly.\n\nReply to this email to continue the conversation.\n\n"
        f"— MakaziPlus Support"
    )

    send_html_email(
        subject, text,
        _wrap_html(subject, intro, body, cta),
        to=[user_email],
        reply_to=[_support_email()],
    )


def notify_user_admin_reply(session, reply_text: str, user_email: str, user_name: str) -> None:
    """
    Email the user when an admin/agent sends a reply to their chat session.
    """
    if not user_email or "@" not in user_email:
        return

    subject = f"Reply from MakaziPlus Support · Session #{session.pk}"

    intro = (
        f"<p>Hi <strong>{escape(user_name)}</strong>,</p>"
        f"<p>You have a new reply from the MakaziPlus support team.</p>"
    )
    body = (
        f"<blockquote style='border-left:3px solid #0F5F5F;padding-left:12px;margin:12px 0;'>"
        f"{escape(reply_text)}"
        f"</blockquote>"
        f"<p>To reply, simply respond to this email or return to the MakaziPlus platform.</p>"
    )
    cta = {"label": "Open MakaziPlus →", "href": _ADMIN_URL}

    text = (
        f"Hi {user_name},\n\nYou have a reply from MakaziPlus Support:\n\n"
        f"{reply_text}\n\n"
        f"Reply to this email to continue.\n\n— MakaziPlus Support"
    )

    send_html_email(
        subject, text,
        _wrap_html(subject, intro, body, cta),
        to=[user_email],
        reply_to=[_support_email()],
    )
