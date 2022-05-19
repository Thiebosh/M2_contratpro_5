from abc import ABC, abstractmethod
from typing import Any
from defines import *

class FilesManager(ABC):
    def __init__(self, partners:"dict[str,Any]", project_id:str, room_type:str):
        self.partners = partners
        self.project_id = project_id
        self.room_type = room_type

        if not self.project_id:
            raise Exception("FilesGenerator - __init__: unknow project name")

    def close(self):
        pass
