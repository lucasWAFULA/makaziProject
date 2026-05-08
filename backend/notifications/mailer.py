"""Lightweight transactional email helpers used across the project.

All public helpers are safe to call from request paths: any failure is logged
but never raised, so a failed SMTP send never breaks a user-facing operation.
"""
from __future__ import annotations

import logging
from html import escape
from typing import Iterable, Optional, Sequence

from django.conf import settings
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger(__name__)


def _coerce_recipients(recipients: Optional[Iterable[str]]) -> list[str]:
    if not recipients:
        return []
    return [r for r in (str(addr).strip() for addr in recipients) if r and "@" in r]


def send_html_email(
    subject: str,
    text_body: str,
    html_body: str,
    to: Sequence[str],
    *,
    cc: Optional[Sequence[str]] = None,
    bcc: Optional[Sequence[str]] = None,
    reply_to: Optional[Sequence[str]] = None,
    from_email: Optional[str] = None,
) -> bool:
    """Send a multipart (text + HTML) email. Returns True on success, False on failure."""
    if not getattr(settings, "EMAIL_NOTIFICATIONS_ENABLED", True):
        logger.info("Email notifications disabled; skipping send: %s", subject)
        return False

    to_list = _coerce_recipients(to)
    if not to_list:
        logger.info("Skipping email '%s' – no valid recipients.", subject)
        return False

    sender = from_email or getattr(settings, "DEFAULT_FROM_EMAIL", None)
    reply_to_list = _coerce_recipients(reply_to) or [
        getattr(settings, "EMAIL_REPLY_TO", None) or getattr(settings, "SUPPORT_EMAIL", "")
    ]

    try:
        message = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=sender,
            to=to_list,
            cc=_coerce_recipients(cc) or None,
            bcc=_coerce_recipients(bcc) or None,
            reply_to=[r for r in reply_to_list if r] or None,
        )
        message.attach_alternative(html_body, "text/html")
        message.send(fail_silently=False)
        logger.info("Email sent: subject=%r to=%s", subject, to_list)
        return True
    except Exception as exc:  # pragma: no cover - relies on real SMTP at runtime
        logger.warning("Email send failed (subject=%r to=%s): %s", subject, to_list, exc)
        return False


# ---- Templates -----------------------------------------------------------

_BRAND_NAME = "MakaziPlus"
_BRAND_TAGLINE = "Nyumba. Safari. Mazingira Bora."
_SITE_URL = "https://www.makazi-plus.com"
_LOGO_URL = "https://www.makazi-plus.com/logo.png"


def _wrap_html(title: str, intro_html: str, body_html: str, cta: dict | None = None) -> str:
    cta_html = ""
    if cta and cta.get("href") and cta.get("label"):
        cta_html = (
            f'<p style="margin:24px 0 0;">'
            f'<a href="{escape(cta["href"])}" '
            f'style="background:#0F5F5F;color:#ffffff;text-decoration:none;'
            f'padding:12px 22px;border-radius:8px;font-weight:600;display:inline-block;">'
            f'{escape(cta["label"])}</a></p>'
        )
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>{escape(title)}</title></head>
<body style="margin:0;background:#F6F7F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2933;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F7F9;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E5E7EB;">
        <tr><td style="padding:24px 32px;background:linear-gradient(135deg,#0F5F5F,#117A7A);color:#ffffff;">
          <table role="presentation" width="100%"><tr>
            <td><strong style="font-size:18px;letter-spacing:0.4px;">{escape(_BRAND_NAME)}</strong>
                <div style="font-size:12px;opacity:0.85;margin-top:2px;">{escape(_BRAND_TAGLINE)}</div></td>
            <td align="right"><img src="{_LOGO_URL}" width="38" height="38" alt="" style="display:block;border-radius:6px;"></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <h1 style="margin:0 0 8px;font-size:20px;color:#0F5F5F;">{escape(title)}</h1>
          <div style="font-size:15px;line-height:1.6;color:#1f2933;">{intro_html}</div>
          <div style="font-size:14px;line-height:1.6;color:#1f2933;margin-top:16px;">{body_html}</div>
          {cta_html}
        </td></tr>
        <tr><td style="padding:18px 32px 28px;border-top:1px solid #E5E7EB;font-size:12px;color:#6B7280;line-height:1.5;">
          Need help? Reply to this email or write to
          <a href="mailto:{escape(getattr(settings, 'SUPPORT_EMAIL', 'support@makazi-plus.com'))}"
             style="color:#0F5F5F;">{escape(getattr(settings, 'SUPPORT_EMAIL', 'support@makazi-plus.com'))}</a>.
          <br>{escape(_BRAND_NAME)} &middot; <a href="{_SITE_URL}" style="color:#0F5F5F;">{_SITE_URL}</a>
          &middot; <a href="{_SITE_URL}/privacy" style="color:#0F5F5F;">Privacy</a>
          &middot; <a href="{_SITE_URL}/terms" style="color:#0F5F5F;">Terms</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>"""


def _format_money(amount) -> str:
    try:
        return f"KES {float(amount):,.2f}"
    except (TypeError, ValueError):
        return str(amount)


# ---- Public booking helpers ---------------------------------------------

def send_booking_received_email(booking) -> None:
    """Email the guest that we received their booking and are waiting for payment."""
    user = getattr(booking, "user", None)
    if not user or not getattr(user, "email", ""):
        return
    prop = getattr(booking, "property", None)
    title = getattr(prop, "title_sw", None) or "your stay"
    name = (getattr(user, "first_name", "") or user.get_username() or "there").strip()
    nights = max(1, (booking.check_out - booking.check_in).days)
    subject = f"We received your booking · {booking.booking_reference}"
    intro = f"<p>Hi <strong>{escape(name)}</strong>,</p><p>We have received your booking request for <strong>{escape(title)}</strong>. Complete payment to lock in your dates.</p>"
    body = (
        f"<p><strong>Reference:</strong> {escape(booking.booking_reference)}<br>"
        f"<strong>Check-in:</strong> {booking.check_in}<br>"
        f"<strong>Check-out:</strong> {booking.check_out}<br>"
        f"<strong>Nights:</strong> {nights}<br>"
        f"<strong>Total:</strong> {_format_money(booking.total_price)}</p>"
        "<p>If you don\u2019t complete payment within 24 hours, the dates may be released.</p>"
    )
    cta = {"label": "Complete payment", "href": f"{_SITE_URL}/pay/{booking.id}"}
    text = (
        f"Hi {name},\n\nWe received your booking for {title}.\n"
        f"Reference: {booking.booking_reference}\nCheck-in: {booking.check_in}\n"
        f"Check-out: {booking.check_out}\nNights: {nights}\nTotal: {_format_money(booking.total_price)}\n\n"
        f"Complete payment: {cta['href']}\n\n— MakaziPlus"
    )
    send_html_email(subject, text, _wrap_html(subject, intro, body, cta), [user.email])


def send_host_new_booking_email(booking) -> None:
    """Notify the host that a new booking is awaiting payment."""
    prop = getattr(booking, "property", None)
    host = getattr(prop, "host", None) if prop else None
    if not host or not getattr(host, "email", ""):
        return
    title = getattr(prop, "title_sw", None) or "your listing"
    host_name = (getattr(host, "first_name", "") or host.get_username() or "there").strip()
    nights = max(1, (booking.check_out - booking.check_in).days)
    subject = f"New booking request · {booking.booking_reference}"
    intro = f"<p>Hi <strong>{escape(host_name)}</strong>,</p><p>You have a new booking request for <strong>{escape(title)}</strong>. We will confirm it once the guest pays.</p>"
    body = (
        f"<p><strong>Reference:</strong> {escape(booking.booking_reference)}<br>"
        f"<strong>Guest:</strong> {escape(booking.user.get_full_name() or booking.user.get_username())}<br>"
        f"<strong>Check-in:</strong> {booking.check_in}<br>"
        f"<strong>Check-out:</strong> {booking.check_out}<br>"
        f"<strong>Nights:</strong> {nights}<br>"
        f"<strong>Total:</strong> {_format_money(booking.total_price)}</p>"
    )
    cta = {"label": "Open dashboard", "href": f"{_SITE_URL}/dashboard"}
    text = (
        f"Hi {host_name},\n\nNew booking request for {title}.\n"
        f"Reference: {booking.booking_reference}\nDates: {booking.check_in} → {booking.check_out}\n"
        f"Total: {_format_money(booking.total_price)}\n\nDashboard: {cta['href']}\n\n— MakaziPlus"
    )
    send_html_email(subject, text, _wrap_html(subject, intro, body, cta), [host.email])


def send_booking_confirmed_email(booking) -> None:
    """Email the guest that payment was received and the booking is confirmed."""
    user = getattr(booking, "user", None)
    if not user or not getattr(user, "email", ""):
        return
    prop = getattr(booking, "property", None)
    title = getattr(prop, "title_sw", None) or "your stay"
    name = (getattr(user, "first_name", "") or user.get_username() or "there").strip()
    subject = f"Payment received \u2014 booking confirmed · {booking.booking_reference}"
    intro = f"<p>Asante <strong>{escape(name)}</strong>!</p><p>Your payment was received and your booking at <strong>{escape(title)}</strong> is now confirmed.</p>"
    body = (
        f"<p><strong>Reference:</strong> {escape(booking.booking_reference)}<br>"
        f"<strong>Check-in:</strong> {booking.check_in}<br>"
        f"<strong>Check-out:</strong> {booking.check_out}<br>"
        f"<strong>Receipt:</strong> {escape(str(booking.payment_reference or ''))}</p>"
        "<p>The host has been notified. Have a great stay!</p>"
    )
    cta = {"label": "View booking", "href": f"{_SITE_URL}/bookings"}
    text = (
        f"Hi {name},\n\nYour payment was received and your booking is confirmed.\n"
        f"Reference: {booking.booking_reference}\nDates: {booking.check_in} → {booking.check_out}\n"
        f"Receipt: {booking.payment_reference or ''}\n\nView booking: {cta['href']}\n\n— MakaziPlus"
    )
    send_html_email(subject, text, _wrap_html(subject, intro, body, cta), [user.email])


def send_host_booking_confirmed_email(booking) -> None:
    """Notify the host that a booking was paid and confirmed."""
    prop = getattr(booking, "property", None)
    host = getattr(prop, "host", None) if prop else None
    if not host or not getattr(host, "email", ""):
        return
    title = getattr(prop, "title_sw", None) or "your listing"
    host_name = (getattr(host, "first_name", "") or host.get_username() or "there").strip()
    subject = f"Booking confirmed · {booking.booking_reference}"
    intro = f"<p>Hi <strong>{escape(host_name)}</strong>,</p><p>Booking <strong>{escape(booking.booking_reference)}</strong> for <strong>{escape(title)}</strong> has been paid and confirmed.</p>"
    body = (
        f"<p><strong>Guest:</strong> {escape(booking.user.get_full_name() or booking.user.get_username())}<br>"
        f"<strong>Check-in:</strong> {booking.check_in}<br>"
        f"<strong>Check-out:</strong> {booking.check_out}<br>"
        f"<strong>Total:</strong> {_format_money(booking.total_price)}<br>"
        f"<strong>Receipt:</strong> {escape(str(booking.payment_reference or ''))}</p>"
    )
    cta = {"label": "Open dashboard", "href": f"{_SITE_URL}/dashboard"}
    text = (
        f"Hi {host_name},\n\nBooking {booking.booking_reference} is paid and confirmed.\n"
        f"Dates: {booking.check_in} → {booking.check_out}\n"
        f"Total: {_format_money(booking.total_price)}\n"
        f"Receipt: {booking.payment_reference or ''}\n\nDashboard: {cta['href']}\n\n— MakaziPlus"
    )
    send_html_email(subject, text, _wrap_html(subject, intro, body, cta), [host.email])


def send_test_email(to: str) -> bool:
    """Sanity-check helper used by `manage.py send_test_email`."""
    subject = "MakaziPlus SMTP test"
    intro = "<p>This is a test email from your MakaziPlus backend.</p>"
    body = (
        "<p>If you can read this, your Zoho SMTP configuration is working and "
        "transactional booking emails will reach your guests and hosts.</p>"
    )
    text = (
        "MakaziPlus SMTP test\n\n"
        "If you can read this, your Zoho SMTP configuration is working and "
        "transactional booking emails will reach your guests and hosts.\n"
    )
    return send_html_email(subject, text, _wrap_html(subject, intro, body), [to])
