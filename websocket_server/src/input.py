class Input():
    def __init__(self, socket, msg) -> None:
        self.socket = socket
        self.msg = msg
        self.counter = 10
        self.failed = False

    def get_action(self):
        return self.msg["action"]

    def get_path(self):
        return self.msg["path"]

    def get_content(self):
        return self.msg["content"]

    def get_page(self):
        return self.msg["page"]

    def decrease_counter(self):
        self.counter -= 1
