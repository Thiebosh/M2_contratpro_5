from typing import Any
from input_manager import InputManager
from brique2.files_manager_proto import FilesManagerProto
from brique3.render_page import RenderPage
from input_proto import InputProto
from defines import *

from partners.logger_partner import LoggerPartner

class InputManagerProto(InputManager):
    def __init__(self, room_id:str, room_type:str, partners:"dict[str,Any]") -> None:
        super().__init__(room_id, room_type, partners)
        logger_partner:LoggerPartner = self.partners[LOGGER]

        logger_partner.logger.info(f"{self.room_id}-{self.room_type} - create input manager")

        self.files_manager = FilesManagerProto(partners, room_id, room_type)
        self.render_page = RenderPage(partners, room_id, room_type)


    async def close(self) -> None:
        self.files_manager.close()
        await self.render_page.close()


    async def check_and_execute_action_function(self, input_to_process:InputProto) -> "bool|dict[str,Any]":
        logger_partner:LoggerPartner = self.partners[LOGGER]

        if input_to_process.failed:
            return False

        action = input_to_process.get_action()

        if action == "execute":
            logger_partner.logger.info(f"{self.room_id}-{self.room_type} - execute page")

            success, content = self.render_page.page(input_to_process.get_page())
            result = {
                "success": success,
                "content": content
            }

        elif action == "reset_session":
            logger_partner.logger.info(f"{self.room_id}-{self.room_type} - reset session")

            result = self.render_page.reset_session()

        # else: error et renvoie wrong action ?

        return result
