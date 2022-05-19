from abc import ABC
from typing import Any
from utils import InitFailedException
from defines import *

from partners.logger_partner import LoggerPartner

class FilesManager(ABC):
    def __init__(self, partners:"dict[str,Any]", project_id:str, room_type:str):
        self.partners = partners
        self.project_id = project_id
        self.room_type = room_type

        logger_partner:LoggerPartner = self.partners[LOGGER]

        if not self.project_id:
            logger_partner.logger.error("FilesGenerator - __init__: unknow project name")
            raise InitFailedException()

    def close(self):
        pass
