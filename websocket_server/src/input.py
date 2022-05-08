from abc import ABC

class Input(ABC):
    def __init__(self, socket, msg) -> None:
        self.socket = socket
        self.msg = msg
        self.failed = "action" not in msg

    def get_socket(self):
        return self.socket

    def get_msg(self):
        return self.msg

    def get_action(self):
        return self.msg["action"]
