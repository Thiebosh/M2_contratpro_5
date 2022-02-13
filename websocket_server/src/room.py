import queue
import threading
import select
import json
from input_manager import InputManager

class Room():
    def __init__(self, room_name, partners, callback_update_server_sockets, callback_remove_room, encoding) -> None:
        print(f"{room_name} - Create room")
        self.close_evt = threading.Event()
        self.queue = queue.Queue()
        self.lock = threading.Lock()
        self.room_name = room_name
        self.inputs = []
        self.outputs = []
        self.client_connection_queue = {}
        self.callback_update_server_sockets = callback_update_server_sockets
        self.callback_remove_room = callback_remove_room
        self.partners = partners

        self.encoding = encoding
        self.input_manager = InputManager(room_name, self.partners, self.send_conflict_message)


    def get_param(self):
        return {
            "close_evt": self.close_evt,
            "add_queue": self.queue,
            "add_lock": self.lock
        }


    def read(self, polling_freq):
        return select.select(self.inputs, self.outputs, self.inputs, polling_freq)


    def close(self):
        print(f"{self.room_name} - Get close signal")
        for socket in self.inputs:
            socket.close()


    def open_client_connection_to_room(self, socket):
        self.inputs.append(socket)
        self.client_connection_queue[socket] = queue.Queue()
        print(f"{self.room_name} - Get client {socket.getpeername()}")

        self.client_connection_queue[socket].put(json.dumps({"init": self.input_manager.master_json.data}))
        self.outputs.append(socket)


    def close_client_connection_to_room(self, socket):
        print(f"{self.room_name} - Close client")
        if socket in self.outputs:
            self.outputs.remove(socket)
        self.inputs.remove(socket)
        del self.client_connection_queue[socket]
        self.callback_update_server_sockets(socket)


    def add_message_in_queue(self, socket_sender, socket_receiver, msg):
        if socket_receiver == socket_sender:
            return

        self.client_connection_queue[socket_receiver].put(msg)
        if socket_receiver not in self.outputs:
            self.outputs.append(socket_receiver)


    def send_conflict_message(self, input_to_process):
        self.client_connection_queue[input_to_process.socket].put("CONFLICTS !")
        if input_to_process.socket not in self.outputs:
            self.outputs.append(input_to_process.socket)


    def process_running_inputs(self):
        for input_to_process in self.input_manager.inputs:
            if input_to_process.counter != 0 or input_to_process.failed:
                continue

            #If no conflicts, execute the action ; in every case : remove socket from list
            if self.input_manager.check_conflicts(input_to_process):
                continue

            self.input_manager.check_and_execute_action_function(input_to_process)

            for client_socket in self.client_connection_queue:
                self.add_message_in_queue(input_to_process.socket, client_socket, json.dumps(input_to_process.msg))
                #json_dumps(...) to change : should be  only the last modification accepted by the server, not all the json

        self.input_manager.inputs = [input_unit for input_unit in self.input_manager.inputs if input_unit.counter != 0 and not input_unit.failed]

        self.input_manager.decrease_counter_on_all_inputs()


    def run(self, polling_freq=0.1):
        print(f"{self.room_name} - Room ready")
        while not self.close_evt.is_set() and self.inputs:
            with self.lock:
                while not self.queue.empty():
                    self.open_client_connection_to_room(self.queue.get()) # When "get" called, it removes item from queue
            try:
                readable, writable, exception = self.read(polling_freq)
            except KeyboardInterrupt:
                self.close()
                break

            for socket in readable: #Get all sockets and put the ones which have a msg to a list
                msg = self.partners["websocket"].recv(socket, self.encoding)
                if not msg:
                    self.close_client_connection_to_room(socket)
                    continue

                msg = json.loads(msg)

                if msg["action"] == "exitRoom":
                    self.close_client_connection_to_room(socket)
                    continue

                self.input_manager.add_new_input(socket, msg)

            self.process_running_inputs()

            for socket in writable:
                try:
                    next_msg = self.client_connection_queue[socket].get_nowait()  # unqueue msg
                except queue.Empty:
                    self.outputs.remove(socket)
                else:
                    self.partners["websocket"].send(socket, next_msg, self.encoding)

            for socket in exception:
                self.close_client_connection_to_room(socket)

        result = self.input_manager.master_json.update_storage()
        print(f"{self.room_name} - Project {'well' if result else 'not'} updated")
        print(f"{self.room_name} - Close room")
        self.callback_remove_room(self.room_name)
