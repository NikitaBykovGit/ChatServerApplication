from django.urls import path

from .consumers import WSRoomConsumer

ws_urlpatterns = [
    path('ws/room/<str:room>/', WSRoomConsumer.as_asgi())
]