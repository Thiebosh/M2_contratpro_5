import json
from typing import Any
from asyncio import Event
from socket import socket
from input_manager_specs import InputManagerSpecs
from room import Room
from input import Input


class RoomSpecs(Room):
    def __init__(self, room_id:str, room_type:str, shared_new_proto_flag:Event, partners:"dict[str, Any]", callback_update_server_sockets, callback_remove_room) -> None:
        input_manager = InputManagerSpecs(room_id, room_type, shared_new_proto_flag, partners, self.send_conflict_message)
        super().__init__(room_id, room_type, partners, callback_update_server_sockets, callback_remove_room, input_manager)


    def open_client_connection_to_room(self, socket:socket, name:str) -> None:
        super().open_client_connection_to_room(socket, name)

        self.add_message_in_queue(socket, json.dumps({"init": self.input_manager.json_handler.data}))


    def send_conflict_message(self, input_to_process:Input) -> None:
        self.add_message_in_queue(input_to_process.socket, json.dumps({"error": "conflict"}))


    async def process_running_inputs(self) -> None:
        for input_to_process in self.input_manager.inputs:
            if (input_to_process.check_datetime()) or input_to_process.failed:
                continue

            #If no conflicts, execute the action ; in every case : remove socket from list
            if self.input_manager.check_conflicts(input_to_process):
                continue

            result = await self.input_manager.check_and_execute_action_function(input_to_process)
            self.add_message_in_queue(input_to_process.socket, json.dumps({input_to_process.get_action(): result}, ensure_ascii=False))

            if result is False:
                continue

            msg = json.dumps({"author": self.socket_name[input_to_process.get_socket()], **input_to_process.get_msg()})
            self.broadcast_message(input_to_process.socket, msg)

        self.input_manager.inputs = [input_unit for input_unit in self.input_manager.inputs if input_unit.check_datetime() and not input_unit.failed]
