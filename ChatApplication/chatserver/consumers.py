from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from chatserver.models import Message, Room


class WSRoomConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        room_id = self.scope['url_route']['kwargs']['pk']
        self.group_name = "chat_%s" % await database_sync_to_async(Room.objects.get)(id=room_id)
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def receive_json(self, content, **kwargs):
        if content['type'] == 'message':
            author = await database_sync_to_async(User.objects.get)(username=content['author'])
            room = await database_sync_to_async(Room.objects.get)(id=content['room'])
            new_message = await database_sync_to_async(Message.objects.create)(
                author=author,
                room=room,
                text=content['text']),
            content['time'] = new_message[0].time.strftime("%d/%m/%Y %H:%M")
            await self.channel_layer.group_send(self.group_name, content)

    async def message(self, event):
        await self.send_json(event)
