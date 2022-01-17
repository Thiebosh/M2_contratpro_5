import json

class MessageManager():
    def __init__(self) -> None:
        self.str_message = ""
        self.json_message = {}
    
    def json_to_str(self, json_message):
        self.json_message = json_message
        self.str_message = json.dumps(json_message)

    def str_to_json(self, str_message):
        self.str_message = str_message
        self.json_message = json.loads(str_message)
