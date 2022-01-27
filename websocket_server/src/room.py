import queue
import threading
import select

from websocket import WebSocket
import json
from input_manager import InputManager

class Room():
    def __init__(self, room_name, room_socket, callback_update_server_sockets, callback_remove_room, encoding) -> None:
        self.close_evt = threading.Event()
        self.queue = queue.Queue()
        self.lock = threading.Lock()
        self.room_name = room_name
        self.room_socket = room_socket
        self.inputs = [self.room_socket]
        self.outputs = []
        self.client_connection_queue = {self.room_socket: queue.Queue()}
        self.callback_update_server_sockets = callback_update_server_sockets
        self.callback_remove_room = callback_remove_room

        self.encoding = encoding
        self.input_manager = InputManager(room_name, self.send_conflict_message)
        

    def get_param(self):
        return {
                "close_evt": self.close_evt,
                "add_queue": self.queue,
                "add_lock": self.lock
        }
    

    def read(self, polling_freq):
        readable, writable, exception = select.select(self.inputs, self.outputs, self.inputs, polling_freq)
        return readable, writable, exception


    def close(self):
        print(f"{self.room_name} - Get close signal")
        for socket in self.inputs:
            socket.close()


    def open_client_connection_to_room(self):
        socket = self.queue.get() # When "get" called, it removes item from queue
        self.inputs.append(socket)
        self.client_connection_queue[socket] = queue.Queue()
        print(f"{self.room_name} - Get client {socket.getpeername()}")
        
        self.client_connection_queue[socket].put("\n".join(self.input_manager.master_json.data))
        
        self.outputs.append(socket)


    def close_client_connection_to_room(self, socket):
        print(f"{self.room_name} - Close client")
        if socket in self.outputs:
            self.outputs.remove(socket)
        self.inputs.remove(socket)
        del self.client_connection_queue[socket]
        self.callback_update_server_sockets(socket)


    def add_message_in_queue(self, socket, client_socket, b_msg):
        if client_socket != socket:
            self.client_connection_queue[client_socket].put(b_msg)
            if client_socket not in self.outputs:
                self.outputs.append(client_socket)


    def send_conflict_message(self, input_to_process):
        self.client_connection_queue[input_to_process.socket].put("CONFLICTS !")
        if input_to_process.socket not in self.outputs:
            self.outputs.append(input_to_process.socket)


    def run(self, polling_freq=0.1):
        print(f"{self.room_name} - Create room")
        while not self.close_evt.is_set() and self.inputs:
            with self.lock:
                while not self.queue.empty():
                    self.open_client_connection_to_room()
            try:
                readable, writable, exception = self.read(polling_freq)
            except KeyboardInterrupt:
                self.close()
                break

            for socket in readable: #Get all sockets and put the ones which have a msg to a list
                msg = WebSocket.recv(socket, self.encoding)
                if not msg:
                    self.close_client_connection_to_room(socket)
                    continue
                
                msg = json.loads(msg)

                if msg["action"] == "exitRoom":
                    self.close_client_connection_to_room(socket)
                    continue

                self.input_manager.add_new_input(socket, msg)
            

            for input_to_process in self.input_manager.get_inputs_copy():
                if input_to_process.counter == 0:
                    #If no conflicts, execute the action ; in every case : remove socket from list
                    if not self.input_manager.check_conflicts(input_to_process):
                        self.input_manager.check_and_execute_action_function(input_to_process)
                        for client_socket in self.client_connection_queue:
                            self.add_message_in_queue(input_to_process.socket, client_socket, json.dumps(self.input_manager.master_json.data))
                            #json_dumps(...) to change : should be only the last modification accepted by the server, not all the json
                    self.input_manager.inputs.remove(input_to_process)

            self.input_manager.decrease_counter_on_all_inputs()

                
            for socket in writable:
                try:
                    next_msg = self.client_connection_queue[socket].get_nowait()  # unqueue msg
                except queue.Empty:
                    self.outputs.remove(socket)
                else:
                    WebSocket.send(socket, next_msg, self.encoding)

            for socket in exception:
                self.close_client_connection_to_room(socket)

        self.input_manager.master_json.update_project()
        print(f"{self.room_name} - Close room")
        self.callback_remove_room(self.room_name)