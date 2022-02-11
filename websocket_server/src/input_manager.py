import os
import pathlib
from input import Input
from brique1.jsonHandler import JsonHandler
from brique2.files_generator import FilesGenerator
from partners.cpp_partner import CppPartner
from partners.mongo_partner import MongoPartner
from partners.drive_partner import DrivePartner

class InputManager():
    def __init__(self, room_name, partners, send_conflict_message_callback) -> None:
        self.inputs = []
        self.partners = partners
        
        self.master_json = JsonHandler(partners, room_name)
        self.files_generator = FilesGenerator(partners, room_name)
        self.send_conflict_message_callback = send_conflict_message_callback

    def add_new_input(self, socket, msg):
        self.inputs.append(Input(socket, msg))

    def decrease_counter_on_all_inputs(self):
        for input in self.inputs:
            input.decrease_counter()

    def check_conflicts(self, input_to_process):
        conflict_list = []

        for current_input in self.inputs:
            if current_input == input_to_process:
                continue

            first_path = current_input.get_path()
            second_path = input_to_process.get_path()
            first_content = current_input.get_content()
            second_content = input_to_process.get_content()

            # 1ST CASE
            if (first_path == second_path) and JsonHandler.check_if_similar_keys(first_content, second_content):
                input_to_process.failed = True
                self.send_conflict_message_callback(current_input)
                conflict_list.append(current_input)
            #2ND CASE
            #DELETE
            elif first_path in second_path and current_input.get_action() == "delete":
                #No removing on input_to_process because its action will be executed, it's the current_input deletion which conflict
                input_to_process.failed = True
                self.send_conflict_message_callback(current_input)
                conflict_list.append(current_input)

            elif second_path in first_path and input_to_process.get_action() == "delete":
                input_to_process.failed = True
                self.send_conflict_message_callback(current_input)
                conflict_list.append(current_input)

        if input_to_process.failed:
            self.send_conflict_message_callback(input_to_process)

        return conflict_list

    def check_and_execute_action_function(self, input_to_process):
        if input_to_process.failed : 
            return
        action = input_to_process.get_action()

        if action == "create":
            self.master_json.add_element(input_to_process.get_path().split("/"), input_to_process.get_content())
            # Send notif to other clients to reload their json
        elif action == "update":
            self.master_json.modify_element(input_to_process.get_path().split("/"), input_to_process.get_content())
            # Send notif to other clients to reload their json
        elif action == "delete":
            self.master_json.remove_element(input_to_process.get_path().split("/"), input_to_process.get_content())
            # Send notif to other clients to reload their json
        elif action == "save":
            result = self.master_json.update_storage()
            print(f"Project {'well' if result else 'not'} updated")
        elif action == "generate":
            # result = self.files_generator.generate_files(self.master_json.data)
            with open(f"{pathlib.Path(__file__).parent.absolute()}/brique2/needs.json", 'r') as file:
                test = file.read().replace('\n', '')
            result = self.files_generator.generate_files(test)
            print(f"Project {'well' if result else 'not'} generated")
            return
        elif action == "execute":
            return
