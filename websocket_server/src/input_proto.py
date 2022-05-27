from typing import Any
from input import Input
from socket import socket


class InputProto(Input):
    def __init__(self, socket:socket, msg:"dict[str,Any]") -> None:
        super().__init__(socket, msg)
        self.failed = False # "page" not in msg


    def get_page(self) -> str:
        return self.msg["page"]
