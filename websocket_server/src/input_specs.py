from input import Input
from datetime import datetime, timedelta

class InputSpecs(Input):
    def __init__(self, socket, msg) -> None:
        super().__init__(socket, msg)
        self.datetime = datetime.now()
        self.failed = False # failed if n'a pas les trois champs ?

    def get_action(self):
        return self.msg["action"]

    def get_path(self):
        return self.msg["path"]

    def get_content(self):
        return self.msg["content"]

    def check_datetime(self):
        return datetime.now() - self.datetime <= timedelta(seconds=1)
