import threading
import asyncio
import traceback
from socket import socket
from typing import Any
from room import Room
from room_specs import RoomSpecs
from room_proto import RoomProto
from utils import InitFailedException
from defines import *

from partners.logger_partner import LoggerPartner


class RoomManager():
    def __init__(self, partners:"dict[str,Any]") -> None:
        self.rooms:"dict[str, Room]" = {}
        self.shared:"dict[str,dict[str,Any]]" = {}
        self.partners = partners


    def copy_partners_dict(self) -> "dict[str,Any]":
        return {key: p.copy_partner() for key, p in self.partners.items()}


    def create_room(self, room_id:str, room_type:str, socket:socket, name, callback_update_server_sockets):
        logger_partner:LoggerPartner = self.partners[LOGGER]

        logger_partner.logger.info(f"{room_id}-{room_type} - start creating room")

        if room_id not in self.shared:
            self.shared[room_id] = {"new_proto_flag": asyncio.Event()}
        shared_new_proto_flag = self.shared[room_id]["new_proto_flag"]

        args = {
            "room_id": room_id,
            "room_type": room_type,
            "shared_new_proto_flag": shared_new_proto_flag,
            "partners": self.copy_partners_dict(),
            "callback_update_server_sockets": callback_update_server_sockets,
            "callback_remove_room": self.callback_remove_room,
        }
        try:
            if room_type == "specs":
                room = RoomSpecs(**args)
            else: # room_type == "proto"
                room = RoomProto(**args)
        except InitFailedException as err:
            logger_partner.logger.error("init room failed :", err)
            if not any(room_id in name for name in self.rooms.keys()):
                del self.shared[room_id]
            return

        room.open_client_connection_to_room(socket, name)
        self.rooms[f"{room_id}-{room_type}"] = room

        try:
            worker = threading.Thread(target=lambda: asyncio.run(room.run()))
            worker.setDaemon(True)
            worker.start()
        except Exception as err:
            traceback.print_exc()
            logger_partner.logger.critical("running room failed :", err)
            return


    def add_client_to_room(self, room_id:str, room_type:str, socket:socket, name:str) -> None:
        with self.rooms[f"{room_id}-{room_type}"].lock:
            self.rooms[f"{room_id}-{room_type}"].queue.put({"socket": socket, "name": name})


    def callback_remove_room(self, room_id:str, room_type:str) -> None:
        self.rooms.pop(f"{room_id}-{room_type}")

        if not any(room_id in name for name in self.rooms.keys()):
            del self.shared[room_id]
