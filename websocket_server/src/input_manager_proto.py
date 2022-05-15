from input_manager import InputManager
from brique2.files_manager_proto import FilesManagerProto
from brique3.render_page import RenderPage
from input_proto import InputProto

class InputManagerProto(InputManager):
    def __init__(self, room_id, room_type, partners) -> None:
        super().__init__(room_id, room_type, partners)

        self.files_manager = FilesManagerProto(partners, room_id, room_type)
        self.render_page = RenderPage(partners, room_id, room_type)

    async def close(self):
        self.files_manager.close()
        await self.render_page.close()

    async def check_and_execute_action_function(self, input_to_process:InputProto):
        if input_to_process.failed:
            return False

        action = input_to_process.get_action()

        if action == "execute":
            success, content = self.render_page.page(input_to_process.get_page())
            result = {
                "success": success,
                "content": content
            }

        elif action == "reset_session":
            result = self.render_page.reset_session()

        # else: error et renvoie wrong action ?

        return result
