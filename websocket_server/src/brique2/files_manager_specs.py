from distutils.util import strtobool
from .files_manager import FilesManager
import os

class FilesManagerSpecs(FilesManager):
    def __init__(self, partners, project_id, room_type) -> None:
        super().__init__(partners, project_id, room_type)
        self.files_currently_stored = True


    async def generate_files(self, specs_json):
        if strtobool(os.environ.get('RENDER_STATE', default="False")):
            print("generate file bypass?")
            return True

        filepath = f"/src/brique2/cpp/{self.project_id}.json"
        open(filepath, "w").write(specs_json)
        args = (filepath,)

        lines, retcode = await self.partners["generator"].call(args)

        if os.path.exists(filepath):
            os.remove(filepath)

        error_line = lines.split('\n')[-1]
        if retcode == -1 or "GENERATION_ERROR:" in error_line:
            print(f"cpp executable return error '{retcode}' : {error_line}")
            return False

        chunks = lines.split("\n\n\n\n")

        self.files = [{"name": line.split("\n")[0], "content": line[line.find("\n")+1:]} for line in chunks][:-1]
        self.files_currently_stored = False

        import pprint
        pprint.pprint(self.files)

        return True


    def update_stored_files(self):
        if self.files_currently_stored:
            print(f"{self.project_id}-{self.room_type} - Project files already stored")
            return True

        result = self.partners["storage"].upload_files_to_folder(self.project_id, self.files)
        if not result:
            print(f"{self.project_id}-{self.room_type} - Project upload to storage failed")
            return False

        self.files_currently_stored = True
        return True
