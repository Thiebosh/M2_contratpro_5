import json

class Utils:
    @staticmethod
    def get_json(json_string:"str|None") -> "tuple[bool, dict|list|None]":
        '''returns (is_input_a_string, json_or_none)'''
        if not json_string:
            return False, None

        try:
            json_data = json.loads(json_string)
        except ValueError:
            return True, None

        return True, json_data
