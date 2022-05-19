from abc import ABC, abstractmethod
import asyncio
from datetime import datetime, timedelta
from queue import Queue, Empty
import threading
from select import select
from socket import socket
import json
from typing import Any
from input_manager import InputManager
from utils import Utils
from defines import *

from partners.websocket_partner import WebSocketPartner
from partners.logger_partner import LoggerPartner

class Room(ABC):
    def __init__(self, room_id:str, room_type:str, partners:"dict[str, Any]", callback_update_server_sockets, callback_remove_room, encoding:str, input_manager:InputManager):
        logger_partner:LoggerPartner = partners[LOGGER]
        logger_partner.logger.debug(f"{room_id} - {room_type} - Creating room...")

        self.close_evt = threading.Event()
        self.queue = Queue()
        self.lock = threading.Lock()
        self.room_id = room_id
        self.room_type = room_type
        self.socket_name:"dict[socket, str]" = {}
        self.inputs:"list[socket]" = []
        self.outputs:"list[socket]" = []
        self.client_connection_queue:"dict[socket, Queue]" = {}
        self.callback_update_server_sockets = callback_update_server_sockets
        self.callback_remove_room = callback_remove_room
        self.partners = partners
        self.encoding = encoding
        self.delay = datetime.now()

        self.input_manager = input_manager
        logger_partner.logger.debug(f"{room_id} - {room_type} - Room created")


    async def close(self) -> None:
        # 1) ACCESS TO PARTNERS AND APPLY TYPE
        logger_partner:LoggerPartner = self.partners[LOGGER]

        logger_partner.logger.debug(f"{self.room_id}-{self.room_type} - Closing room...")

        for socket in self.inputs:
            socket.close()
        await self.input_manager.close()
        self.callback_remove_room(self.room_id, self.room_type)
        logger_partner.logger.debug(f"{self.room_id}-{self.room_type} - Room closed")



    def get_param(self) -> "dict[str, Any]":
        return {
            "close_evt": self.close_evt,
            "add_queue": self.queue,
            "add_lock": self.lock
        }


    def open_client_connection_to_room(self, socket:socket, name:str) -> None:
        names = list(self.socket_name.values())

        self.inputs.append(socket)
        self.socket_name[socket] = name
        self.client_connection_queue[socket] = Queue()

        self.add_message_in_queue(socket, json.dumps({"init_collabs": names}))
        self.broadcast_message(socket, json.dumps({"add_collab": name}))


    def close_client_connection_to_room(self, socket:socket) -> None:
        # 1) ACCESS TO PARTNERS AND APPLY TYPE
        logger_partner:LoggerPartner = self.partners[LOGGER]

        logger_partner.logger.debug(f"{self.room_id}-{self.room_type} - Close client")
        if socket in self.outputs:
            self.outputs.remove(socket)
        self.inputs.remove(socket)
        del self.client_connection_queue[socket]
        name = self.socket_name.pop(socket)
        self.callback_update_server_sockets(socket)
        self.delay = datetime.now()

        self.broadcast_message(socket, json.dumps({"remove_collab": name}))


    def add_message_in_queue(self, socket_receiver:socket, msg:str) -> None:
        self.client_connection_queue[socket_receiver].put(msg)
        if socket_receiver not in self.outputs:
            self.outputs.append(socket_receiver)


    def broadcast_message(self, socket_sender:socket, msg:str) -> None:
        for client_socket in self.client_connection_queue:
            if socket_sender == client_socket:
                continue
            self.add_message_in_queue(client_socket, msg)


    @abstractmethod
    async def process_running_inputs(self):
        pass


    async def run(self, polling_freq:int=0.1) -> None:
        # 1) ACCESS TO PARTNERS AND APPLY TYPE
        websocket_partner:WebSocketPartner = self.partners[WEBSOCKET]
        logger_partner:LoggerPartner = self.partners[LOGGER]

        logger_partner.logger.debug(f"{self.room_id}-{self.room_type} - Room ready")

        try:
            while not self.close_evt.is_set() and (self.inputs or (datetime.now() - self.delay <= timedelta(minutes=5))):
                with self.lock:
                    while not self.queue.empty():
                        client = self.queue.get()
                        self.open_client_connection_to_room(client["socket"], client["name"]) # When "get" called, it removes item from queue

                if not self.inputs:
                    await asyncio.sleep(1)
                    continue

                try:
                    readable, writable, exception = select(self.inputs, self.outputs, self.inputs, polling_freq)
                except KeyboardInterrupt:
                    break

                for socket in readable: #Get all sockets and put the ones which have a msg to a list
                    msg = websocket_partner.recv(socket, self.encoding)
                    if not msg:
                        logger_partner.logger.debug(f"close {self.socket_name[socket]} because empty msg")
                        self.close_client_connection_to_room(socket)
                        continue

                    is_msg_json, msg = Utils.get_json(msg)
                    if not is_msg_json:
                        logger_partner.logger.debug(f"{self.room_id}-{self.room_type} - malformed json : {msg}")
                        self.close_client_connection_to_room(socket) # reset this line if front memory leak persist
                        continue

                    if msg["action"] == "exitRoom":
                        logger_partner.logger.debug(f"close {self.socket_name[socket]} because asked")
                        self.close_client_connection_to_room(socket)
                        continue

                    self.input_manager.add_new_input(socket, msg)

                await self.process_running_inputs()

                for socket in writable:
                    try:
                        next_msg = self.client_connection_queue[socket].get_nowait()  # unqueue msg
                    except Empty:
                        self.outputs.remove(socket)
                    else:
                        websocket_partner.send(socket, next_msg, self.encoding)

                for socket in exception:
                    self.close_client_connection_to_room(socket)

                await asyncio.sleep(0.1)
        except Exception as e:
            logger_partner.logger.debug(f"{self.room_id}-{self.room_type} CRITICAL: {e}")


        await self.close()
