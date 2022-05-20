from typing import Any
from input import Input
from datetime import datetime, timedelta
from socket import socket


class InputSpecs(Input):
    def __init__(self, socket:socket, msg:"dict[str,Any]") -> None:
        super().__init__(socket, msg)
        self.datetime = datetime.now()
        self.failed = False # failed if n'a pas les trois champs ?


    def get_path(self) -> str:
        return self.msg["path"]


    def get_content(self) -> "int|float|str|dict[str,Any]":
        return self.msg["content"]


    def get_chat(self) -> str:
        return self.msg["chat"]


    def check_datetime(self) -> bool:
        return datetime.now() - self.datetime <= timedelta(seconds=1)
