from rest_framework import serializers
from .models import ChatMessage, ChatFavorite

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = '__all__'

class ChatFavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatFavorite
        fields = '__all__'

