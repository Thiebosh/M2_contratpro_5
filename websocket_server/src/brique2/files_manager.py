from abc import ABC
from defines import *

class FilesManager(ABC):
    def __init__(self, partners, project_id, room_type) -> None:
        self.partners = partners
        self.project_id = project_id
        self.room_type = room_type

        if not self.project_id:
            raise Exception("FilesGenerator - __init__: unknow project name")

    def close(self):
        pass
