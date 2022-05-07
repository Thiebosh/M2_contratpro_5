import threading
import asyncio
from room import Room

class RoomManager():
    def __init__(self, partners) -> None:
        self.rooms = {}
        self.partners = partners

    def copy_partners_dict(self):
        return {key: p.copy_partner() for key, p in self.partners.items()}

    def create_room(self, room_id, socket, name, callback_update_server_sockets, encoding):
        room = Room(room_id, self.copy_partners_dict(), callback_update_server_sockets, self.callback_remove_room, encoding)
        room.open_client_connection_to_room(socket, name)
        self.rooms[room_id] = room

        worker = threading.Thread(target=lambda: asyncio.run(room.run()))
        worker.setDaemon(True)
        worker.start()

    def add_client_to_room(self, room_id, socket, name):
        with self.rooms[room_id].lock:
            self.rooms[room_id].queue.put({"socket": socket, "name": name})

    def callback_remove_room(self, room_id):
        self.rooms.pop(room_id)
