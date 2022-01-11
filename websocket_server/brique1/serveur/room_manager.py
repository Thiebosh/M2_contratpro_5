import threading
from room import Room

class RoomManager():
    def __init__(self) -> None:
        self.rooms = {}

    def create_room(self, room_name, socket):
        room = Room(room_name, socket)
        self.rooms[room_name] = room

        worker = threading.Thread(target=room.run)
        worker.setDaemon(True)
        worker.start()
    
    def add_message(self, room_name, socket):
        with self.rooms[room_name].lock:
            self.rooms[room_name].queue.put(socket)
