import pathlib
from input import Input
from brique1.json_handler import JsonHandler
from brique2.files_manager import FilesManager
from brique3.render_page import RenderPage
import json

class InputManager():
    def __init__(self, room_name, partners, send_conflict_message_callback) -> None:
        self.partners = partners
        self.room_name = room_name
        self.send_conflict_message_callback = send_conflict_message_callback

        self.inputs: "list[Input]" = []

        self.json_handler = JsonHandler(partners, room_name)
        self.files_manager = FilesManager(partners, room_name)
        self.render_page = RenderPage(partners, room_name)

        # tmp test
        with open(f"{pathlib.Path(__file__).parent.absolute()}/brique2/needs.json", 'r') as file:
            self.json_handler.data = json.loads(file.read().replace('\n', '').replace('\n', ''))

    def close(self):
        self.json_handler.close()
        self.files_manager.close()

    def add_new_input(self, socket, msg):
        self.inputs.append(Input(socket, msg))

    def check_conflicts(self, input_to_process):
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
            result = self.json_handler.update_storage()
            print(f"Project {'well' if result else 'not'} updated")

        elif action == "generate":
            if self.json_handler.current_version_generated:
                print(f"{self.room_name} - Project files already generated")
                return True

            result = await self.files_manager.generate_files(json.dumps(self.json_handler.data))
            print(f"{self.room_name} - Project files {'well' if result else 'not'} generated")

            if result is False:
                return False

            self.json_handler.current_version_generated = result

            result = self.files_manager.update_stored_files()
            print(f"{self.room_name} - Project files {'well' if result else 'not'} updated")

        elif action == "execute":
            success, content = self.render_page.page(input_to_process.get_page())
            result = {
                "success": success,
                "content": content
            }

        return result
