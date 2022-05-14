import json
from input_manager_proto import InputManagerProto
from room import Room

class RoomProto(Room):
    def __init__(self, room_id, room_type, partners, callback_update_server_sockets, callback_remove_room, encoding) -> None:
        input_manager = InputManagerProto(room_id, room_type, partners)
        super().__init__(room_id, room_type, partners, callback_update_server_sockets, callback_remove_room, encoding, input_manager)


    def open_client_connection_to_room(self, socket, name):
        super().open_client_connection_to_room(socket, name)

        result = self.input_manager.render_page.get_session()
        if result[0]:
            self.add_message_in_queue(socket, json.dumps({"set_session": json.loads(result[1])}))


    async def process_running_inputs(self):
        for input_to_process in self.input_manager.inputs:
            result = await self.input_manager.check_and_execute_action_function(input_to_process)
            self.add_message_in_queue(input_to_process.socket, json.dumps({input_to_process.get_action(): result}, ensure_ascii=False))

        self.input_manager.inputs = []
