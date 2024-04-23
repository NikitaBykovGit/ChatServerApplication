from django.urls import path, include
from rest_framework import routers
from .views import *


router = routers.DefaultRouter()
router.register(r'rooms', RoomViewset)
router.register(r'messages', MessageViewset)
router.register(r'roomusers', RoomUserViewset)
router.register(r'users', UserViewset)

urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]