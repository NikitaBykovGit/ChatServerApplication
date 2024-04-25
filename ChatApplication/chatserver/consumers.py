import json
from time import sleep

from channels.generic.websocket import WebsocketConsumer


class WSRoomConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        for i in range(100):
            self.send(json.dumps({'message': i}))
            sleep(1)


