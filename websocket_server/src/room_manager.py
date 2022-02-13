import threading
from room import Room

class RoomManager():
    def __init__(self, partners) -> None:
        self.rooms = {}
        self.partners = partners

    def copy_partners_dict(self):
        return { key: p.copy_partner() for key, p in self.partners.items()}

    def create_room(self, room_name, socket, callback_update_server_sockets, encoding):
        room = Room(room_name, self.copy_partners_dict(), callback_update_server_sockets, self.callback_remove_room, encoding)
        room.open_client_connection_to_room(socket)
        self.rooms[room_name] = room

        worker = threading.Thread(target=room.run)
        worker.setDaemon(True)
        worker.start()

    def add_client_to_room(self, room_name, socket):
        with self.rooms[room_name].lock:
            self.rooms[room_name].queue.put(socket)

    def callback_remove_room(self, room_name):
        self.rooms.pop(room_name)
