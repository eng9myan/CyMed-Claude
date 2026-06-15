import os
from twilio.rest import Client

def send_sms_notification(phone_number: str, message: str):
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID', 'test_sid')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN', 'test_token')
    twilio_phone = os.environ.get('TWILIO_PHONE_NUMBER', '+1234567890')

    # Mock mode if tokens are fake
    if account_sid == 'test_sid':
        print(f"[MOCK SMS] To: {phone_number} | Message: {message}")
        return True

    try:
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            body=message,
            from_=twilio_phone,
            to=phone_number
        )
        return message.sid
    except Exception as e:
        print(f"Failed to send SMS: {e}")
        return False
