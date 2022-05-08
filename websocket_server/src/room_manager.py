import threading
import asyncio
from room_specs import RoomSpecs
from room_proto import RoomProto

class RoomManager():
    def __init__(self, partners) -> None:
        self.rooms = {}
        self.partners = partners

    def copy_partners_dict(self):
        return {key: p.copy_partner() for key, p in self.partners.items()}

    def create_room(self, room_id, room_type, socket, name, callback_update_server_sockets, encoding):
        if room_type == "specs":
            room = RoomSpecs(room_id, room_type, self.copy_partners_dict(), callback_update_server_sockets, self.callback_remove_room, encoding)
        else: # room_type == "proto"
            room = RoomProto(room_id, room_type, self.copy_partners_dict(), callback_update_server_sockets, self.callback_remove_room, encoding)

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
