from channels.layers import get_channel_layer
from django.db.models import Q
from asgiref.sync import async_to_sync
from app.models import User
import sys



def send_change_state(user):
    print("[SEND CHANGE STATE] form", user.username, "with state : ", user.state, file=sys.stderr)
    type_state = 'online'
    if user.state == User.State.OFFLINE:
        type_state = 'offline'
    if user.state == User.State.INGAME:
        type_state = 'ingame'

    # send to all friend user that the user is connected for update the state in real time
    all_username =  get_all_friend_username(user)
    for username in all_username:
        print("[SEND CHANGE STATE] form", user.username, "with state : ", user.state, "to", username, file=sys.stderr)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            username, {'type':'send_ws', 'type2':type_state, 'sender':user.username}
        )


def get_all_friend_username(user):
    from app.models import Discussion

    all_discussion = Discussion.objects.filter(Q(user1=user) | Q(user2=user))
    all_username = []
    for discussion in all_discussion:
        all_username.append(discussion.get_other_username(user.username))
    return all_username