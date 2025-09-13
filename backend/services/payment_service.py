import stripe
import os
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class PaymentService:
    def __init__(self):
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
        self.webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    def create_payment_intent(
        self,
        amount: float,
        currency: str = "usd",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        try:
            # Convert amount to cents
            amount_cents = int(amount * 100)
            
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency,
                metadata=metadata or {},
                automatic_payment_methods={
                    'enabled': True,
                },
            )
            
            return {
                "client_secret": intent.client_secret,
                "payment_intent_id": intent.id,
                "status": intent.status
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            raise Exception(f"Payment processing error: {str(e)}")
    
    def confirm_payment(self, payment_intent_id: str) -> Dict[str, Any]:
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            return {
                "payment_intent_id": intent.id,
                "status": intent.status,
                "amount": intent.amount / 100,  # Convert back to dollars
                "currency": intent.currency
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            raise Exception(f"Payment confirmation error: {str(e)}")
    
    def create_refund(
        self,
        payment_intent_id: str,
        amount: Optional[float] = None,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        try:
            refund_data = {"payment_intent": payment_intent_id}
            
            if amount:
                refund_data["amount"] = int(amount * 100)  # Convert to cents
            
            if reason:
                refund_data["reason"] = reason
            
            refund = stripe.Refund.create(**refund_data)
            
            return {
                "refund_id": refund.id,
                "status": refund.status,
                "amount": refund.amount / 100,  # Convert back to dollars
                "currency": refund.currency
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe refund error: {str(e)}")
            raise Exception(f"Refund processing error: {str(e)}")

# Initialize payment service
payment_service = PaymentService()
