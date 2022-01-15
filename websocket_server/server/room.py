import queue
from socket import socket
import threading
import select

from .message_manager import MessageManager
from .websocket import WebSocket
import json
from .use_cases.client_request import MasterJson
from pymongo import MongoClient
import os
from datetime import datetime
from .socker_manager import SocketManager

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

    def check_conflicts(self):
        for i in range(len(self.socket_managers)):
            for j in range(i+1, len(self.socket_managers)):
                # 1ST CASE
                if (self.socket_managers[i].get_path() == self.socket_managers[j].get_path()) and (self.socket_managers[i].get_content() == self.socket_managers[j].get_content()):
                    self.socket_managers[i].failed = True
                    self.socket_managers[j].failed = True
        return True

    def run(self, polling_freq=0.1):
        print(f"{self.room_name} - Create room")
        num_it = 0
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

            if num_it == 10:
                # If only one msg, no conflict can be found so just execute function
                if len(self.socket_managers) == 1:
                    if not self.check_and_execute_action_function(self.socket_managers[0]):
                        for client_socket in self.client_connection_queue:
                            self.add_message_in_queue(self.socket_managers[0].socket, client_socket, self.message_manager.str_message)                    
                        self.socket_managers.clear()
                        continue
                    
                if len(self.socket_managers) > 1: #If several msgs, check if there are conflicts
                    #If conflicts, send notification to them to tell them there are conflicts, and for the others, just execute the action
                    self.check_conflicts()
                    for socket_manager in self.socket_managers:
                        if not socket_manager.failed:
                            self.check_and_execute_action_function(socket_manager)
                            for client_socket in self.client_connection_queue:
                                self.add_message_in_queue(socket_manager.socket, client_socket, self.message_manager.str_message)
                        else:
                            for client_socket in self.client_connection_queue:
                                self.client_connection_queue[client_socket].put("CONFLICTS !")
                                if client_socket not in self.outputs:
                                    self.outputs.append(client_socket)

                    self.socket_managers.clear()
            
            # TODO if more than one msg and conflicts : msg removed --> to change
            #add num iteration (sémaphore) beyond which we check conflicts
            # if a msg has no conflicts with all of the others : execute action ! So don't return false in check_conflicts

            # for client_socket in self.client_connection_queue:
            #     self.add_message_in_queue(socket, client_socket, self.message_manager.str_message)
                
            for socket in writable:
                try:
                    next_msg = self.client_connection_queue[socket].get_nowait()  # unqueue msg
                except queue.Empty:
                    self.outputs.remove(socket)
                else:
                    WebSocket.send(socket, next_msg, self.encoding)

            for socket in exception:
                self.close_client_connection_to_room(socket)

            num_it += 1
            if (num_it > 10):
                num_it = 0

        self.master_json.update_project()
        print(f"{self.room_name} - Close room")
        self.callback_remove_room(self.room_name)