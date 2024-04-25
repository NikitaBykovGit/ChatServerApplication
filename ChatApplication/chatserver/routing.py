from django.urls import path

from .consumers import WSRoomConsumer

ws_urlpatterns = [
    path('ws/room/<int:pk>/', WSRoomConsumer.as_asgi())
]