import base64
import json
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def get_mpesa_token():
    key = getattr(settings, "MPESA_CONSUMER_KEY", "") or ""
    secret = getattr(settings, "MPESA_CONSUMER_SECRET", "") or ""
    if not key or not secret:
        return None
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    if getattr(settings, "MPESA_ENVIRONMENT", "sandbox") == "production":
        url = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    auth = base64.b64encode(f"{key}:{secret}".encode()).decode()
    resp = requests.get(url, headers={"Authorization": f"Basic {auth}"}, timeout=10)
    if resp.status_code != 200:
        logger.warning("M-Pesa token request failed: %s %s", resp.status_code, resp.text)
        return None
    return resp.json().get("access_token")


def stk_push(phone: str, amount: float, reference: str) -> dict:
    token = get_mpesa_token()
    if not token:
        return {"error": "M-Pesa not configured"}
    base = "https://sandbox.safaricom.co.ke"
    if getattr(settings, "MPESA_ENVIRONMENT", "sandbox") == "production":
        base = "https://api.safaricom.co.ke"
    url = f"{base}/mpesa/stkpush/v1/processrequest"
    callback = f"{settings.MPESA_CALLBACK_BASE_URL.rstrip('/')}/payments/mpesa/callback/"
    passkey = getattr(settings, "MPESA_PASSKEY", "") or ""
    shortcode = getattr(settings, "MPESA_SHORTCODE", "") or ""
    phone_clean = phone.strip().replace("+", "").replace(" ", "")
    if phone_clean.startswith("0"):
        phone_clean = "254" + phone_clean[1:]
    elif not phone_clean.startswith("254"):
        phone_clean = "254" + phone_clean
    from datetime import datetime
    ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    password_str = (shortcode + passkey + ts).encode() if passkey else b""
    payload = {
        "BusinessShortCode": shortcode,
        "Password": base64.b64encode(password_str).decode() if passkey else "",
        "Timestamp": ts,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(round(amount, 0)),
        "PartyA": phone_clean,
        "PartyB": shortcode,
        "PhoneNumber": phone_clean,
        "CallBackURL": callback,
        "AccountReference": reference[:20],
        "TransactionDesc": "Kusajilisha booking",
    }

    resp = requests.post(
        url,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json=payload,
        timeout=15,
    )
    data = resp.json() if resp.text else {}
    logger.info("M-Pesa STK Push response: %s %s", resp.status_code, data)
    return data
