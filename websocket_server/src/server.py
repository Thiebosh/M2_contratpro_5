import select
import socket
from room_manager import RoomManager
from websocket import WebSocket
from socket import timeout
import json
import os

class Server():
    def __init__(self) -> None:
        self.inputs = []
        self.polling_freq = 0.5
        self.room_m = RoomManager()
        self.ip = os.environ.get("HOST")
        self.port = int(os.environ.get("PORT"))
        self.encoding = "utf-8"
        self.init_server()

    def init_server(self, backlog=5):
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setblocking(False)

        self.socket.bind((self.ip, self.port))
        self.socket.listen(backlog)

    def read(self):
        readable, _, exception = select.select(self.inputs, [], self.inputs, self.polling_freq)
        return readable, exception
            
    def close(self):
        print("Get close signal")
        for socket in self.inputs:
            socket.close()
        for room in self.room_m.rooms.values():
            room.close_evt.set()

    def add_connection(self, socket):
        new_socket, client_address = socket.accept()
        try:
            if WebSocket.handshake(new_socket, self.encoding):
                print(f"SERVER - new connexion {client_address}")
                self.inputs.append(new_socket)  # new input socket
            else:
                print("failed handshake")

        except timeout:
            print('websocket connection timeout')
    
    def close_client_connection(self, socket):
        print(f"Close client")
        self.inputs.remove(socket)
        socket.close()

    def run(self):    
        self.inputs.append(self.socket) # Contient tous les sockets (serveur + toutes les rooms)

        while self.inputs:
            try:
                readable, exception = self.read()
            except KeyboardInterrupt:
                self.close()
                break
            # handle inputs
            for socket in readable:
                if socket is self.socket: # S'il y a une connexion, c'est le serveur qui va envoyer un message d'où le check
                   self.add_connection(socket)
                    # new_socket.send("which project ?".encode(encoding)) # tmp, dégagera quand protocole uniformisé
                   continue

                target = WebSocket.recv(socket, self.encoding)

                if not target:
                    self.close_client_connection(socket)
                    continue

                target = json.loads(target)
                
                if "action" in target and target["action"] == "connectRoom" :
                    if not target["roomName"] in self.room_m.rooms:
                        self.room_m.create_room(target["roomName"], socket, self.callback_update_server_sockets, self.encoding)

                    else:
                        self.room_m.add_client_to_room(target["roomName"], socket)

                self.inputs.remove(socket)

            # handle except
            for socket in exception:
                self.inputs.remove(socket)
                socket.close()

            self.room_m.rooms = {key: values for key, values in self.room_m.rooms.items() if not values.get_param()["close_evt"].is_set()}

    
    def callback_update_server_sockets(self,socket):
        self.inputs.append(socket)
