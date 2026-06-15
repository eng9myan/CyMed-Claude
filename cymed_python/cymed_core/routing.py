from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/telehealth/(?P<room_name>\w+)/$', consumers.TelehealthConsumer.as_asgi()),
    re_path(r'ws/iot/vitals/(?P<bed_id>[\w-]+)/$', consumers.IoTConsumer.as_asgi()),
]
