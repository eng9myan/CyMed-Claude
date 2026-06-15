import os
import stripe

stripe.api_key = os.environ.get('STRIPE_API_KEY', 'sk_test_mock_key')

def create_payment_intent(amount_cents: int, currency: str = 'usd', description: str = ''):
    if stripe.api_key == 'sk_test_mock_key':
        print(f"[MOCK STRIPE] Created PaymentIntent for {amount_cents} {currency}")
        return {"client_secret": "pi_mock_secret", "id": "pi_mock_123"}

    try:
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency=currency,
            description=description,
            automatic_payment_methods={"enabled": True},
        )
        return {"client_secret": intent.client_secret, "id": intent.id}
    except Exception as e:
        print(f"Stripe error: {e}")
        return None
