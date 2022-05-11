from distutils.util import strtobool
from .files_manager import FilesManager
from partners.mongo_queries import MongoQueries, COLLECTION_PROJECTS
import os

class FilesManagerSpecs(FilesManager):
    def __init__(self, partners, project_id, room_type) -> None:
        super().__init__(partners, project_id, room_type)
        self.files_currently_stored = True
        self.files=[]
        self.pages=[]


    async def generate_files(self, specs_json):
        if strtobool(os.environ.get('RENDER_STATE', default="False")):
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

        self.files_currently_stored = False
        self.files = [{"name": line.split("\n")[0], "content": line[line.find("\n")+1:]} for line in chunks][:-1]
        self.pages = [
            {''.join(value.split(".")[:-1]): value}
            for page in self.files 
            for key, value in page.items() 
            if key == "name" 
            and value.split(".")[-1] == "html"
        ]

        return True


    async def update_stored_files(self):
        if self.files_currently_stored:
            print(f"{self.project_id}-{self.room_type} - Project files already stored")
            return True

        result = self.partners["storage"].upload_files_to_folder(self.project_id, self.files)
        if not result:
            print(f"{self.project_id}-{self.room_type} - Project upload to storage failed")
            return False

        result = await self.partners["db"].update_one_async(COLLECTION_PROJECTS, *MongoQueries.updateProtoPagesForId(self.project_id, self.pages))
        if not result:
            print(f"{self.project_id}-{self.room_type} - Project pages update in db failed")
            return False

        self.files_currently_stored = True
        return True
