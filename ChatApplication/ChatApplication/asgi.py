import os

from django.core.asgi import get_asgi_application

from channels.routing import ProtocolTypeRouter
from channels.auth import AuthMiddlewareStack
from channels.routing import URLRouter

from chatserver.routing import ws_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ChatApplication.settings')

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(ws_urlpatterns)
    )
})
