import threading
from room import Room

class RoomManager():
    def __init__(self, partners) -> None:
        self.rooms = {}
        self.partners = partners
        
    def copy_partners_dict(self):
        partner_dict = {}
        for key, p in self.partners.items():
            partner_dict[key] = p.copy_partner()
       
        return partner_dict

    def create_room(self, room_name, socket, callback_update_server_sockets, encoding):
        room = Room(room_name, socket, self.copy_partners_dict(), callback_update_server_sockets, self.callback_remove_room, encoding)
        self.rooms[room_name] = room

        worker = threading.Thread(target=room.run)
        worker.setDaemon(True)
        worker.start()
    
    def add_client_to_room(self, room_name, socket):
        with self.rooms[room_name].lock:
            self.rooms[room_name].queue.put(socket)

    def callback_remove_room(self, room_name):
        self.rooms.pop(room_name)
