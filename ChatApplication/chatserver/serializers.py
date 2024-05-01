from .models import *
from rest_framework import serializers


class TimeRepresentationMixin(serializers.HyperlinkedModelSerializer):
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['time'] = instance.time.strftime("%d/%m/%Y %H:%M")
        return representation


class RoomSerializer(TimeRepresentationMixin):
    author = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())
    members = serializers.SerializerMethodField('get_members_count')

    def create(self, validated_data):
        new_room = super().create(validated_data)
        RoomUser.objects.create(room=new_room, user=validated_data['author'])
        return new_room

    def get_members_count(self, obj):
        return RoomUser.objects.filter(room=obj).count()

    class Meta:
        model = Room
        fields = ['id', 'name', 'author', 'time', 'members', ]


class MessageSerializer(TimeRepresentationMixin):
    author = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())
    room = serializers.SlugRelatedField(slug_field='name', queryset=Room.objects.all())

    class Meta:
        model = Message
        fields = ['id', 'author', 'room', 'time', 'text', ]


class RoomUserSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())
    room = serializers.SlugRelatedField(slug_field='name', queryset=Room.objects.all())

    class Meta:
        model = RoomUser
        fields = ['id', 'room', 'user', ]


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', ]
