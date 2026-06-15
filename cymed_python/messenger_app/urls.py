from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatMessageViewSet, ChatFavoriteViewSet

router = DefaultRouter()
router.register(r'chatmessages', ChatMessageViewSet)
router.register(r'chatfavorites', ChatFavoriteViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
