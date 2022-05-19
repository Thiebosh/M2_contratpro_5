from typing import Any
from input_manager import InputManager
from brique1.json_handler import JsonHandler
from brique2.files_manager_specs import FilesManagerSpecs
import json
from asyncio import Event
from partners.mongo_queries import MongoQueries, COLLECTION_PROJECTS
from input_specs import InputSpecs
from defines import *

from partners.mongo_partner import MongoPartner, WTimeoutError, WriteException, MongoCoreException
from partners.cpp_partner import CppPartner
from partners.logger_partner import LoggerPartner


class InputManagerSpecs(InputManager):
    def __init__(self, room_id:str, room_type:str, shared_new_proto_flag:Event, partners:"dict[str,Any]", send_conflict_message_callback) -> None:
        super().__init__(room_id, room_type, partners)
        # 1) ACCESS TO PARTNERS AND APPLY TYPE
        db_partner:MongoPartner = self.partners[DB]
        generator_partner:CppPartner = self.partners[GENERATOR]
        logger_partner:LoggerPartner = self.partners[LOGGER]

        self.send_conflict_message_callback = send_conflict_message_callback

        self.shared_new_proto_flag = shared_new_proto_flag

        try:
            result = db_partner.find_one(COLLECTION_PROJECTS, *MongoQueries.getSyntaxIdFromId(self.room_id))
        except WTimeoutError as err:
            logger_partner.logger.critical(MONGO_PARTNER_TIMEOUT, err)
        except MongoCoreException as err:
            logger_partner.logger.error(MONGO_PARTNER_EXCEPTION, err)

        generator_partner.set_exe_file(result["syntax_id"])

        self.json_handler = JsonHandler(self.partners, room_id, room_type)
        self.files_manager = FilesManagerSpecs(self.partners, room_id, room_type)

        try:
            self.current_version_generated = db_partner.find_one(COLLECTION_PROJECTS, *MongoQueries.getProtoStateFromId(self.room_id))['latest_proto']
        except WTimeoutError as err:
            logger_partner.logger.critical(MONGO_PARTNER_TIMEOUT, err)
        except MongoCoreException as err:
            logger_partner.logger.error(MONGO_PARTNER_EXCEPTION, err)

        # tmp test
        import pathlib
        with open(f"{pathlib.Path(__file__).parent.absolute()}/brique2/needs.json", 'r') as file:
            self.json_handler.data = json.loads(file.read().replace('\n', '').replace('\n', ''))
        self.current_version_generated = False


    async def close(self) -> None:
        await self.json_handler.close()
        self.files_manager.close()


    def check_conflicts(self, input_to_process:InputSpecs) -> bool:
        for current_input in self.inputs:
            if current_input == input_to_process or current_input.failed:
                continue

            first_path = current_input.get_path()
            second_path = input_to_process.get_path()
            first_content = current_input.get_content()
            second_content = input_to_process.get_content()

            if (first_path == second_path and JsonHandler.check_if_similar_keys(first_content, second_content)) \
                or (first_path in second_path and current_input.get_action() == "delete")\
                or (second_path in first_path and input_to_process.get_action() == "delete"):
                if not input_to_process.failed:
                    input_to_process.failed = True
                    self.send_conflict_message_callback(input_to_process)

                if not current_input.failed:
                    current_input.failed = True
                    self.send_conflict_message_callback(current_input)

        return input_to_process.failed


    async def check_and_execute_action_function(self, input_to_process:InputSpecs) -> bool:
        # 1) ACCESS TO PARTNERS AND APPLY TYPE
        db_partner:MongoPartner = self.partners[DB]
        logger_partner:LoggerPartner = self.partners[LOGGER]

        if input_to_process.failed:
            return False

        action = input_to_process.get_action()
        if action == "create":
            result = self.json_handler.add_element(input_to_process.get_path().split("/"),
                                                   input_to_process.get_content())

        elif action == "update":
            result = self.json_handler.modify_element(input_to_process.get_path().split("/"),
                                                      input_to_process.get_content())

        elif action == "delete":
            result = self.json_handler.remove_element(input_to_process.get_path().split("/"),
                                                      input_to_process.get_content())

        elif action == "save":
            result = await self.json_handler.update_storage()
            logger_partner.logger.debug(f"Project {'well' if result else 'not'} updated")

        elif action == "generate":
            if self.current_version_generated:
                logger_partner.logger.debug(f"{self.room_id}-{self.room_type} - Project files already generated")
                return True

            result = await self.files_manager.generate_files(json.dumps(self.json_handler.data))
            logger_partner.logger.debug(f"{self.room_id}-{self.room_type} - Project files {'well' if result else 'not'} generated")

            if result is False:
                return False

            result = await self.files_manager.update_stored_files()
            logger_partner.logger.debug(f"{self.room_id}-{self.room_type} - Project files {'well' if result else 'not'} updated")

            self.current_version_generated = True
            try:
                await db_partner.update_one(COLLECTION_PROJECTS, *MongoQueries.updateProtoStateForId(self.room_id, True))
            except WriteException as err:
                logger_partner.logger.error(MONGO_PARTNER_WRITE_ERROR, err)
                return False
            except WTimeoutError as err:
                logger_partner.logger.critical(MONGO_PARTNER_TIMEOUT, err)
                return False
            except MongoCoreException as err:
                logger_partner.logger.error(MONGO_PARTNER_EXCEPTION, err)
                return False

            self.shared_new_proto_flag.set()

        # else: error et renvoie wrong action ?

        if action in ["create", "update", "delete"] and result:
            self.current_version_generated = False
            try:
                await db_partner.update_one(COLLECTION_PROJECTS, *MongoQueries.updateProtoStateForId(self.room_id, False))
            except WriteException as err:
                logger_partner.logger.error(MONGO_PARTNER_WRITE_ERROR, err)
                return False
            except WTimeoutError as err:
                logger_partner.logger.critical(MONGO_PARTNER_TIMEOUT, err)
                return False
            except MongoCoreException as err:
                logger_partner.logger.error(MONGO_PARTNER_EXCEPTION, err)
                return False

        return result
