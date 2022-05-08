from abc import ABC

class Input(ABC):
    def __init__(self, socket, msg) -> None:
        self.socket = socket
        self.msg = msg

    def get_socket(self):
        return self.socket

    def get_msg(self):
        return self.msg
