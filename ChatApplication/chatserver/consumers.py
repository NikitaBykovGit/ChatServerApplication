import json
from datetime import datetime

from django.forms.models import model_to_dict
from channels.generic.websocket import WebsocketConsumer

from chatserver.models import Message


class WSRoomConsumer(WebsocketConsumer):
    is_activated = None

    def connect(self):
        self.accept()
        self.is_activated = datetime.now()
        while True:
            new_message = Message.objects.filter(time__gt=self.is_activated)
            if new_message.exists():
                dict_message = model_to_dict(new_message[0])
                print(json.dumps(dict_message))
                self.is_activated = datetime.now()
                self.send(json.dumps(dict_message))
