import threading
import asyncio
from room_specs import RoomSpecs
from room_proto import RoomProto

class RoomManager():
    def __init__(self, partners) -> None:
        self.rooms = {}
        self.shared = {} # room id to tuple lock - container
        self.partners = partners

    def copy_partners_dict(self):
        return {key: p.copy_partner() for key, p in self.partners.items()}

    def create_room(self, room_id, room_type, socket, name, callback_update_server_sockets, encoding):
        if room_id not in self.shared:
            self.shared[room_id] = {"new_proto_flag": asyncio.Event()}
        shared_new_proto_flag = self.shared[room_id]["new_proto_flag"]

        args = {
            "room_id": room_id,
            "room_type": room_type,
            "shared_new_proto_flag": shared_new_proto_flag,
            "partners": self.copy_partners_dict(),
            "callback_update_server_sockets": callback_update_server_sockets,
            "callback_remove_room": self.callback_remove_room,
            "encoding": encoding
        }
        if room_type == "specs":
            room = RoomSpecs(**args)
        else: # room_type == "proto"
            room = RoomProto(**args)

        room.open_client_connection_to_room(socket, name)
        self.rooms[f"{room_id}-{room_type}"] = room

        worker = threading.Thread(target=lambda: asyncio.run(room.run()))
        worker.setDaemon(True)
        worker.start()

    def add_client_to_room(self, room_id, room_type, socket, name):
        with self.rooms[f"{room_id}-{room_type}"].lock:
            self.rooms[f"{room_id}-{room_type}"].queue.put({"socket": socket, "name": name})

    def callback_remove_room(self, room_id, room_type):
        self.rooms.pop(f"{room_id}-{room_type}")

        if not any(room_id in name for name in self.rooms.keys()):
            del self.shared[room_id]
