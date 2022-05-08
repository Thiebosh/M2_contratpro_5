from abc import ABC, abstractmethod
import queue
import threading
import select
import json

from input_manager import InputManager

class Room(ABC):
    def __init__(self, room_id, room_type, partners, callback_update_server_sockets, callback_remove_room, encoding, input_manager) -> None:
        print(f"{room_id}-{room_type} - Create room...")
        self.close_evt = threading.Event()
        self.queue = queue.Queue()
        self.lock = threading.Lock()
        self.room_id = room_id
        self.room_type = room_type
        self.socket_name = {}
        self.inputs = []
        self.outputs = []
        self.client_connection_queue = {}
        self.callback_update_server_sockets = callback_update_server_sockets
        self.callback_remove_room = callback_remove_room
        self.partners = partners

        self.encoding = encoding
        self.input_manager:InputManager = input_manager
        print(f"{room_id}-{room_type} - Room created")


    async def close(self):
        print(f"{self.room_id}-{self.room_type} - Closing room...")
        for socket in self.inputs:
            socket.close()
        await self.input_manager.close()
        self.callback_remove_room(self.room_id, self.room_type)
        print(f"{self.room_id}-{self.room_type} - Room closed")


    def get_param(self):
        return {
            "close_evt": self.close_evt,
            "add_queue": self.queue,
            "add_lock": self.lock
        }


    def read(self, polling_freq):
        return select.select(self.inputs, self.outputs, self.inputs, polling_freq)


    def open_client_connection_to_room(self, socket, name):
        self.inputs.append(socket)
        self.socket_name[socket] = name
        self.client_connection_queue[socket] = queue.Queue()


    def close_client_connection_to_room(self, socket):
        print(f"{self.room_id}-{self.room_type} - Close client")
        if socket in self.outputs:
            self.outputs.remove(socket)
        self.inputs.remove(socket)
        del self.client_connection_queue[socket]
        del self.socket_name[socket]
        self.callback_update_server_sockets(socket)


    def add_message_in_queue(self, socket_receiver, msg):
        self.client_connection_queue[socket_receiver].put(msg)
        if socket_receiver not in self.outputs:
            self.outputs.append(socket_receiver)


    @abstractmethod
    async def process_running_inputs(self):
        pass


    async def run(self, polling_freq=0.1):
        print(f"{self.room_id}-{self.room_type} - Room ready")
        while not self.close_evt.is_set() and self.inputs:
            with self.lock:
                while not self.queue.empty():
                    client = self.queue.get()
                    self.open_client_connection_to_room(client["socket"], client["name"]) # When "get" called, it removes item from queue
            try:
                readable, writable, exception = self.read(polling_freq)
            except KeyboardInterrupt:
                break

            for socket in readable: #Get all sockets and put the ones which have a msg to a list
                msg = self.partners["websocket"].recv(socket, self.encoding)
                if not msg:
                    self.close_client_connection_to_room(socket)
                    continue

                try:
                    msg = json.loads(msg)
                except json.JSONDecodeError:
                    print(f"{self.room_id}-{self.room_type} - malformed json : {msg}")
                    # self.close_client_connection_to_room(socket)
                    continue

                if msg["action"] == "exitRoom":
                    self.close_client_connection_to_room(socket)
                    continue

                self.input_manager.add_new_input(socket, msg)

            await self.process_running_inputs()

            for socket in writable:
                try:
                    next_msg = self.client_connection_queue[socket].get_nowait()  # unqueue msg
                except queue.Empty:
                    self.outputs.remove(socket)
                else:
                    self.partners["websocket"].send(socket, next_msg, self.encoding)

            for socket in exception:
                self.close_client_connection_to_room(socket)

        await self.close()
