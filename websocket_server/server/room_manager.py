import threading
from .room import Room

class RoomManager():
    def __init__(self) -> None:
        self.rooms = {}

    def create_room(self, room_name, socket, callback_update_server_sockets):
        room = Room(room_name, socket, callback_update_server_sockets, self.callback_remove_room)
        self.rooms[room_name] = room

        worker = threading.Thread(target=room.run)
        worker.setDaemon(True)
        worker.start()
    
    def add_client_to_room(self, room_name, socket):
        with self.rooms[room_name].lock:
            self.rooms[room_name].queue.put(socket)

    def callback_remove_room(self, room_name):
        self.rooms.pop(room_name)
