from input_manager import InputManager
from brique1.json_handler import JsonHandler
from brique2.files_manager_specs import FilesManagerSpecs
import json
from partners.mongo_queries import MongoQueries, COLLECTION_PROJECTS
from input_specs import InputSpecs


class InputManagerSpecs(InputManager):
    def __init__(self, room_id, room_type, shared_new_proto_flag, partners, send_conflict_message_callback) -> None:
        super().__init__(room_id, room_type, partners)

        self.send_conflict_message_callback = send_conflict_message_callback

        self.shared_new_proto_flag = shared_new_proto_flag

        self.partners["generator"].set_exe_file(self.partners["db"].find_one(COLLECTION_PROJECTS, *MongoQueries.getSyntaxIdFromId(self.room_id))["syntax_id"])

        self.json_handler = JsonHandler(self.partners, room_id, room_type)
        self.files_manager = FilesManagerSpecs(self.partners, room_id, room_type)

        self.current_version_generated = self.partners["db"].find_one(COLLECTION_PROJECTS, *MongoQueries.getProtoStateFromId(self.room_id))['latest_proto']

        # tmp test
        # import pathlib
        # with open(f"{pathlib.Path(__file__).parent.absolute()}/brique2/needs.json", 'r') as file:
        #     self.json_handler.data = json.loads(file.read().replace('\n', '').replace('\n', ''))
        # self.current_version_generated = False

    async def close(self):
        await self.json_handler.close()
        self.files_manager.close()

    def check_conflicts(self, input_to_process:InputSpecs):
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


    async def check_and_execute_action_function(self, input_to_process):
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
            self.partners["logger"].app_logger.debug(f"Project {'well' if result else 'not'} updated")

        elif action == "generate":
            if self.current_version_generated:
                self.partners["logger"].app_logger.debug(f"{self.room_id}-{self.room_type} - Project files already generated")
                return True

            result = await self.files_manager.generate_files(json.dumps(self.json_handler.data))
            self.partners["logger"].app_logger.debug(f"{self.room_id}-{self.room_type} - Project files {'well' if result else 'not'} generated")

            if result is False:
                return False

            result = await self.files_manager.update_stored_files()
            self.partners["logger"].app_logger.debug(f"{self.room_id}-{self.room_type} - Project files {'well' if result else 'not'} updated")

            self.current_version_generated = True
            await self.partners["db"].update_one_async(COLLECTION_PROJECTS, *MongoQueries.updateProtoStateForId(self.room_id, True))

            self.shared_new_proto_flag.set()

        # else: error et renvoie wrong action ?

        if action in ["create", "update", "delete"] and result:
            self.current_version_generated = False
            await self.partners["db"].update_one_async(COLLECTION_PROJECTS, *MongoQueries.updateProtoStateForId(self.room_id, False))

        return result
