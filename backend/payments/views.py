import logging
from django.db import transaction
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_http_methods

from bookings.models import Booking
from .models import Payment
from .mpesa import stk_push

logger = logging.getLogger(__name__)


class MpesaInitiateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get("booking_id")
        phone = request.data.get("phone")
        if not booking_id or not phone:
            raise ValidationError({"detail": "booking_id and phone are required."})
        booking = Booking.objects.filter(
            id=booking_id,
            user=request.user,
            status=Booking.Status.PENDING,
        ).select_related("property").first()
        if not booking:
            raise NotFound("Booking not found or not pending.")
        amount = float(booking.total_price)
        reference = f"BK{booking_id}"
        Payment.objects.create(
            booking=booking,
            provider=Payment.Provider.MPESA,
            reference=reference,
            amount=booking.total_price,
            status=Payment.Status.PENDING,
        )
        result = stk_push(phone, amount, reference)
        if result.get("error"):
            return Response({"detail": result["error"]}, status=status.HTTP_400_BAD_REQUEST)
        if result.get("errorCode"):
            return Response(
                {"detail": result.get("errorMessage", "M-Pesa request failed")},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({
            "CheckoutRequestID": result.get("CheckoutRequestID"),
            "message": "STK Push sent. Complete payment on your phone.",
        })


@method_decorator(csrf_exempt, name="dispatch")
class MpesaCallbackView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = request.body.decode("utf-8") if request.body else "{}"
        logger.info("M-Pesa callback received: %s", payload[:500])
        try:
            data = request.data if hasattr(request, "data") and request.data else {}
            if not data and request.body:
                import json
                data = json.loads(payload)
        except Exception as e:
            logger.warning("M-Pesa callback parse error: %s", e)
            return Response({"ResultCode": 0, "ResultDesc": "Accepted"})

        body = data.get("Body", {})
        stk_result = body.get("stkCallback", {})
        result_code = stk_result.get("ResultCode")
        result_desc = stk_result.get("ResultDesc", "")
        callback_metadata = stk_result.get("CallbackMetadata", {})
        items = {item.get("Name"): item.get("Value") for item in callback_metadata if isinstance(item, dict)}

        ref = (items.get("AccountReference") or "").strip()
        if ref.startswith("BK"):
            try:
                booking_id = int(ref[2:])
            except ValueError:
                booking_id = None
        else:
            booking_id = None

        payment = None
        if booking_id:
            payment = Payment.objects.filter(
                booking_id=booking_id,
                provider=Payment.Provider.MPESA,
                status=Payment.Status.PENDING,
            ).select_related("booking").first()

        if payment:
            payment.callback_payload = data
            if result_code == 0:
                with transaction.atomic():
                    payment.status = Payment.Status.COMPLETED
                    payment.save()
                    booking = payment.booking
                    booking.status = Booking.Status.CONFIRMED
                    booking.payment_reference = str(items.get("MpesaReceiptNumber", ref))
                    booking.save()
                logger.info("Booking %s confirmed via M-Pesa.", booking_id)
            else:
                payment.status = Payment.Status.FAILED
                payment.save()
                logger.info("M-Pesa payment failed for booking %s: %s", booking_id, result_desc)
        else:
            logger.warning("M-Pesa callback no matching payment: %s", ref)

        return Response({"ResultCode": 0, "ResultDesc": "Accepted"})
