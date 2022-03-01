from datetime import datetime, timedelta

class Input():
    def __init__(self, socket, msg) -> None:
        self.socket = socket
        self.msg = msg
        self.datetime = datetime.now()
        self.failed = False

    def get_socket(self):
        return self.socket

    def get_action(self):
        return self.msg["action"]

    def get_path(self):
        return self.msg["path"]

    def get_content(self):
        return self.msg["content"]

    def get_page(self):
        return self.msg["page"]

    def get_msg(self):
        return self.msg

    def check_datetime(self):
        return datetime.now() - self.datetime <= timedelta(seconds=1)
