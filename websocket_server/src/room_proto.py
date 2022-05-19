import json
from typing import Any
from asyncio import Event
from socket import socket
from input_manager_proto import InputManagerProto
from room import Room

class RoomProto(Room):
    def __init__(self, room_id:str, room_type:str, shared_new_proto_flag:Event, partners:"dict[str,Any]", callback_update_server_sockets, callback_remove_room, encoding:str) -> None:
        shared_new_proto_flag.clear()

        input_manager = InputManagerProto(room_id, room_type, partners)
        super().__init__(room_id, room_type, partners, callback_update_server_sockets, callback_remove_room, encoding, input_manager)

        self.shared_new_proto_flag = shared_new_proto_flag
        self.update_proto:int = 0


    def open_client_connection_to_room(self, socket:socket, name:str) -> None:
        super().open_client_connection_to_room(socket, name)

        self.add_message_in_queue(socket, json.dumps({"set_session": self.input_manager.render_page.session}))


    async def process_running_inputs(self) -> None:
        if self.update_proto > 1:
            self.update_proto -= 1
            return

        if self.update_proto == 1:
            self.update_proto = 0
            self.input_manager.inputs = [] # discard all requests

            self.input_manager.render_page.reset_session()
            self.input_manager.files_manager.reload_files()

            self.broadcast_message(None, json.dumps({"proto_update": False}))
            self.broadcast_message(None, json.dumps({"set_session": self.input_manager.render_page.session}))
            return

        for input_to_process in self.input_manager.inputs:
            result = await self.input_manager.check_and_execute_action_function(input_to_process)
            self.add_message_in_queue(input_to_process.socket, json.dumps({input_to_process.get_action(): result}, ensure_ascii=False))

        if self.input_manager.render_page.session_update:
            self.broadcast_message(None, json.dumps({"set_session": self.input_manager.render_page.session}))
            self.input_manager.render_page.session_update = False

        self.input_manager.inputs = []

        if self.shared_new_proto_flag.is_set():
            self.shared_new_proto_flag.clear()
            self.update_proto = 3 # let time to send broadcast

            self.broadcast_message(None, json.dumps({"proto_update": True}))
            return
