from json import dumps

from django.contrib.auth.models import User
from django.db import models


class Room(models.Model):
    name = models.CharField(max_length=64, unique=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='author')
    time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Message(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    time = models.DateTimeField(auto_now_add=True)
    text = models.CharField(max_length=128)

    def __str__(self):
        return f'ROOM: {self.room.name} AUTHOR: {self.author.username} MESSAGE: {self.text}'


class RoomUser(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f'ROOM: {self.room.name} USER: {self.user.username}'

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['room', 'user'], name='unique user for each room'),
        ]
