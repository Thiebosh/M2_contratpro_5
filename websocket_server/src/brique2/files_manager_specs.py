from .files_manager import FilesManager
import os

class FilesManagerSpecs(FilesManager):
    def __init__(self, partners, project_id, room_type) -> None:
        super().__init__(partners, project_id, room_type)
        self.files_currently_stored = True


    async def generate_files(self, specs_json):
        filepath = f"/src/brique2/cpp/{self.project_id}.json"
        open(filepath, "w").write(specs_json)
        args = (filepath,)

        lines, retcode = await self.partners["generator"].call(args)

        if os.path.exists(filepath):
            os.remove(filepath)

        if retcode == -1:
            return False

        chunks = lines.split("\n\n\n\n")

        if chunks[-1].split("\n")[0] == "error":  # retcode and retcode != 0:  # execution error
            print(f"cpp executable return error '{retcode}'")
            print(lines)
            return False

        self.files = [{"name": line.split("\n")[0], "content": line[line.find("\n")+1:]} for line in chunks][:-1]
        self.files_currently_stored = False

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
