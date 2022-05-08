from input import Input

class InputProto(Input):
    def __init__(self, socket, msg) -> None:
        super().__init__(socket, msg)
        self.failed = False # failed if n'a pas le champ ?

    def get_content(self):
        return self.msg["content"]

    def get_page(self):
        return self.msg["page"]
