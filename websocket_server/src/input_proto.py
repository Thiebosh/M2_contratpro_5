from input import Input

class InputProto(Input):
    def __init__(self, socket, msg) -> None:
        super().__init__(socket, msg)
        self.failed = "page" not in msg

    def get_page(self):
        return self.msg["page"]
