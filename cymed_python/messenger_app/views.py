from rest_framework import viewsets
from rest_framework.permissions import DjangoModelPermissions, IsAuthenticated
from .models import ChatMessage, ChatFavorite
from .serializers import ChatMessageSerializer, ChatFavoriteSerializer

class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

class ChatFavoriteViewSet(viewsets.ModelViewSet):
    queryset = ChatFavorite.objects.all()
    serializer_class = ChatFavoriteSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

