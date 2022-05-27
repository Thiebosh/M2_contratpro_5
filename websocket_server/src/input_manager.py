from abc import ABC, abstractmethod
from typing import Any
from socket import socket
from input import Input
from input_specs import InputSpecs
from input_proto import InputProto


class InputManager(ABC):
    def __init__(self, room_id:str, room_type:str, partners:"dict[str,Any]") -> None:
        self.partners = partners
        self.room_id = room_id
        self.room_type = room_type
        self.inputs: "list[Input]" = []


    @abstractmethod
    async def close(self) -> None:
        pass


    def add_new_input(self, socket:socket, msg:"dict[str,Any]"):
        if self.room_type == "specs":
            self.inputs.append(InputSpecs(socket, msg))
        else: # self.room_type == "proto"
            self.inputs.append(InputProto(socket, msg))
