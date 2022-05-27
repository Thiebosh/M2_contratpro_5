import json
import sys
from simple_bcrypt import Bcrypt

class Utils:
    @staticmethod
    def func_name(stack_level:int=0) -> str:
        '''returns the name of the nth call stack function'''
        return sys._getframe(stack_level + 1).f_code.co_name # pylint: disable=protected-access

    @staticmethod
    def log_format(msg:str, func_name:str=None) -> str:
        '''returns normalized log'''
        return f"{func_name or Utils.func_name(1)} - {msg}"

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

    @staticmethod
    def encrypt_password(instance:Bcrypt, password:str):
        return instance.generate_password_hash(password).decode('utf-8')

