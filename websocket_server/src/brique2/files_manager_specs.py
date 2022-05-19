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

        if retcode == -1 or "ERROR :" in lines:
            self.partners["logger"].app_logger.debug(f"cpp executable return error: {lines}")
            return False

        try:
            chunks = [chunk.strip() for chunk in lines.split("\n\n\n\n") if chunk != '']

            self.files_currently_stored = False
            self.files = [{"name": line.split("\n")[0], "content": line[line.find("\n")+1:]} for line in chunks][1:]
            self.pages = [{"Default": chunks[0].split("\n")[1]}] + [
                {''.join(value.split(".")[:-1]): value}
                for page in self.files 
                for key, value in page.items() 
                if key == "name" 
                and value.split(".")[-1] == "html"
            ]
        except Exception as e:
            self.partners["logger"].app_logger.debug(f"cpp generated parse error: {e}")
            return False

        return True


    async def update_stored_files(self):
        if self.files_currently_stored:
            self.partners["logger"].app_logger.debug(f"{self.project_id}-{self.room_type} - Project files already stored")
            return True

        result = self.partners["storage"].upload_files_to_folder(self.project_id, self.files)
        if not result:
            self.partners["logger"].app_logger.debug(f"{self.project_id}-{self.room_type} - Project upload to storage failed")
            return False

        result = await self.partners["db"].update_one_async(COLLECTION_PROJECTS, *MongoQueries.updateProtoPagesForId(self.project_id, self.pages))
        if not result:
            self.partners["logger"].app_logger.debug(f"{self.project_id}-{self.room_type} - Project pages update in db failed")
            return False

        self.files_currently_stored = True
        return True
