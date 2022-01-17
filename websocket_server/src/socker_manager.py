class SocketManager():
    def __init__(self, socket, msg) -> None:
        self.socket = socket
        self.msg = msg
        self.failed = False
    
    def get_action(self):
        return self.msg["action"]
    
    def get_path(self):
        return self.msg["path"]

    def get_content(self):
        return self.msg["content"]