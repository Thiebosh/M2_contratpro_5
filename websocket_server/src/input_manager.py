from input import Input
from utils import check_if_similar_keys
from use_cases.client_request import MasterJson

class InputManager():
    def __init__(self, room_name, send_conflict_message_callback) -> None:
        self.inputs = []
        self.master_json = MasterJson(room_name)
        self.send_conflict_message_callback = send_conflict_message_callback

    def add_new_input(self, socket, msg):
        self.inputs.append(Input(socket, msg))

    def get_inputs_copy(self):
        return self.inputs.copy()
    
    def remove_input(self, input_to_remove):
        self.inputs.remove(input_to_remove)

    def decrease_counter_on_all_inputs(self):
        for input in self.inputs:
            input.decrease_counter()

    def check_conflicts(self, input_to_process):
        for current_input in self.get_inputs_copy():
            if current_input == input_to_process:
                continue
            else:
                first_path = current_input.get_path()
                second_path = input_to_process.get_path()
                first_content = current_input.get_content()
                second_content = input_to_process.get_content()

                # 1ST CASE
                if (first_path == second_path) and check_if_similar_keys(first_content, second_content):
                    input_to_process.failed = True
                    self.send_conflict_message_callback(current_input)
                    self.remove_input(current_input)
                #2ND CASE
                #DELETE
                elif (first_path in second_path):
                    if (current_input.get_action() == "delete"):
                        #No removing on input_to_process because its action will be executed, it's the current_input deletion which conflict
                        self.send_conflict_message_callback(current_input)
                        self.remove_input(current_input)
                elif (second_path in first_path):
                    if (input_to_process.get_action() == "delete"):
                        input_to_process.failed = True
                        self.send_conflict_message_callback(current_input)
                        self.remove_input(current_input)

        if input_to_process.failed:
            self.send_conflict_message_callback(input_to_process)
            return True
        else:
            return False

    def check_and_execute_action_function(self, input_to_process):
        if input_to_process.failed : 
            pass
        action = input_to_process.get_action()
        
        if action == "update":
            self.master_json.create_from_path(input_to_process.get_path(), self.master_json.data, input_to_process.get_content())
                # Send notif to other clients to reload their json
        elif action == "delete":
            self.master_json.delete_from_path(input_to_process.get_path(), self.master_json.data, input_to_process.get_content())
        elif action == "save":
            self.master_json.update_project()        
        elif action == "generate":
            pass
        elif action == "execute":
            pass