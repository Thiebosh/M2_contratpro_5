import queue
import threading
import select

from message_manager import MessageManager
from websocket import WebSocket
import json
from use_cases.client_request import MasterJson
from utils import check_if_similar_keys
from socker_manager import SocketManager

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
        self.master_json = MasterJson(self.room_name)
        self.message_manager = MessageManager()

        self.encoding = encoding
        self.socket_managers = []
        

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
        
        self.client_connection_queue[socket].put("\n".join(self.master_json.data))
        
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


    def check_and_execute_action_function(self, socket_manager):
        if socket_manager.failed : 
            pass
        action = socket_manager.get_action()
        
        if action == "update":
            if self.master_json.create_from_path(socket_manager.get_path(), self.master_json.data, socket_manager.get_content()):
                self.message_manager.json_to_str(self.master_json.data)
                # Send notif to other clients to reload their json
            pass
        elif action == "delete":
            if self.master_json.delete_from_path(socket_manager.get_path(), self.master_json.data, socket_manager.get_content()):
                self.message_manager.json_to_str(self.master_json.data)
            pass        
        elif action == "save":
            self.master_json.update_project()        
        elif action == "generate":
            pass
        elif action == "execute":
            pass

    def check_conflicts(self, socket_manager):
        conflict_sockets_list = []
        for i in range(len(self.socket_managers)):
            if self.socket_managers[i] == socket_manager:
                continue
            else:
                first_path = self.socket_managers[i].get_path()
                second_path = socket_manager.get_path()
                first_content = self.socket_managers[i].get_content()
                second_content = socket_manager.get_content()

                # 1ST CASE
                if (first_path == second_path) and check_if_similar_keys(first_content, second_content):
                    self.socket_managers[i].failed = True
                    socket_manager.failed = True
                    conflict_sockets_list.append(self.socket_managers[i])
                
                #2ND CASE
                #DELETE
                elif (first_path in second_path):
                    if (self.socket_managers[i].get_action() == "delete"):
                        self.socket_managers[i].failed = True
                        conflict_sockets_list.append(self.socket_managers[i])
                    
                elif (second_path in first_path):
                    if (socket_manager.get_action() == "delete"):
                        socket_manager.failed = True
                        conflict_sockets_list.append(self.socket_managers[i])
        if len(conflict_sockets_list) > 0:
            conflict_sockets_list.append(socket_manager)
        return conflict_sockets_list

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

                self.socket_managers.append(SocketManager(socket, msg))
            

            socket_managers = self.socket_managers.copy()
            for socket_manager in socket_managers:
                if socket_manager.to_handle:
                    #If conflicts, send notification to them to tell them there are conflicts, and for the others, just execute the action
                    conflict_sockets_list = self.check_conflicts(socket_manager)
                    if len(conflict_sockets_list) == 0:
                        self.check_and_execute_action_function(socket_manager)
                        for client_socket in self.client_connection_queue:
                            self.add_message_in_queue(socket_manager.socket, client_socket, self.message_manager.str_message)
                        self.socket_managers.remove(socket_manager)
                    else:       
                        for socket_manager in conflict_sockets_list:
                            self.client_connection_queue[socket_manager.socket].put("CONFLICTS !")
                            if socket_manager.socket not in self.outputs:
                                self.outputs.append(socket_manager.socket)
                            self.socket_managers.remove(socket_manager)

            for socket_manager in self.socket_managers:
                    socket_manager.decrease_counter()

                
            for socket in writable:
                try:
                    next_msg = self.client_connection_queue[socket].get_nowait()  # unqueue msg
                except queue.Empty:
                    self.outputs.remove(socket)
                else:
                    WebSocket.send(socket, next_msg, self.encoding)

            for socket in exception:
                self.close_client_connection_to_room(socket)

        self.master_json.update_project()
        print(f"{self.room_name} - Close room")
        self.callback_remove_room(self.room_name)