import django_filters
from rest_framework import viewsets, permissions, status

from .serializers import *
from .models import *


class RoomViewset(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    def get_queryset(self):
        queryset = Room.objects.all()
        user = self.request.query_params.get('user', None)
        notuser = self.request.query_params.get('notuser', None)
        if user is not None:
            queryset = queryset.filter(roomuser__user__username=user)
        if notuser is not None:
            queryset = queryset.exclude(roomuser__user__username=notuser)
        return queryset


class MessageViewset(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
    filterset_fields = ["room__name"]


class RoomUserViewset(viewsets.ModelViewSet):
    queryset = RoomUser.objects.all()
    serializer_class = RoomUserSerializer
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
    filterset_fields = ["room__name", "user__username"]


class UserViewset(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
    filterset_fields = ["username"]
