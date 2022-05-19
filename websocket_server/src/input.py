from abc import ABC
from socket import socket
from typing import Any


class Input(ABC):
    def __init__(self, socket:socket, msg:"dict[str,Any]") -> None:
        self.socket = socket
        self.msg = msg
        self.failed = "action" not in msg


    def get_socket(self) -> socket:
        return self.socket


    def get_msg(self) -> "dict[str,Any]":
        return self.msg


    def get_action(self) -> str:
        return self.msg["action"]
