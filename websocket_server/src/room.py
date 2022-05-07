import queue
import threading
import select
import json
from input_manager import InputManager

class Room():
    def __init__(self, room_id, partners, callback_update_server_sockets, callback_remove_room, encoding) -> None:
        print(f"{room_id} - Create room...")
        self.close_evt = threading.Event()
        self.queue = queue.Queue()
        self.lock = threading.Lock()
        self.room_id = room_id
        self.socket_name = {}
        self.inputs = []
        self.outputs = []
        self.client_connection_queue = {}
        self.callback_update_server_sockets = callback_update_server_sockets
        self.callback_remove_room = callback_remove_room
        self.partners = partners

        self.encoding = encoding
        self.input_manager = InputManager(room_id, self.partners, self.send_conflict_message)
        print(f"{room_id} - Room created")


    async def close(self):
        print(f"{self.room_id} - Closing room...")
        for socket in self.inputs:
            socket.close()
        await self.input_manager.close()
        self.callback_remove_room(self.room_id)
        print(f"{self.room_id} - Room closed")


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

        self.client_connection_queue[socket].put(json.dumps({"init": self.input_manager.json_handler.data}))
        self.outputs.append(socket)


    def close_client_connection_to_room(self, socket):
        print(f"{self.room_id} - Close client")
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


    def send_conflict_message(self, input_to_process):
        self.client_connection_queue[input_to_process.socket].put("CONFLICTS !")
        if input_to_process.socket not in self.outputs:
            self.outputs.append(input_to_process.socket)


    async def process_running_inputs(self):
        for input_to_process in self.input_manager.inputs:
            if (input_to_process.check_datetime()) or input_to_process.failed:
                continue

            #If no conflicts, execute the action ; in every case : remove socket from list
            if self.input_manager.check_conflicts(input_to_process):
                continue

            result = await self.input_manager.check_and_execute_action_function(input_to_process)
            self.add_message_in_queue(input_to_process.socket, json.dumps({input_to_process.get_action(): result}, ensure_ascii=False))

            if result is False:
                continue

            msg = json.dumps({"author": self.socket_name[input_to_process.get_socket()], **input_to_process.get_msg()})
            for client_socket in self.client_connection_queue:
                if input_to_process.socket == client_socket:
                    continue
                self.add_message_in_queue(client_socket, msg)

        self.input_manager.inputs = [input_unit for input_unit in self.input_manager.inputs if input_unit.check_datetime() and not input_unit.failed]

    async def run(self, polling_freq=0.1):
        print(f"{self.room_id} - Room ready")
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
                    print(f"{self.room_id} - malformed json : {msg}")
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
