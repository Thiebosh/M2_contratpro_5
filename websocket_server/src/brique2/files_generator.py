
COLLECTION_PROJECTS = "projects"

class FilesGenerator():
    def __init__(self, partners, project_name) -> None:
        self.partners = partners

        filter_q = {
            "name": project_name
        }
        fields = {
            "_id": 0,
            "id": {
                "$toString": "$_id"
            },
        }
        self.project_id = self.partners["db"].find_one(COLLECTION_PROJECTS, filter_q, fields)["id"]
        if not self.project_id:
            raise Exception("FilesGenerator - __init__: unknow project name")

        ## tmp upload files => test download
        # self.partners["drive"].upload_files_to_folder(self.project_id, [
        #     {
        #         "name": "test1.py",
        #         "content": "# !/usr/bin/python3 \n\ndef print_sorted(liste):\n    return sorted(liste)\n\n1"
        #     },
        #     {
        #         "name": "test2.py",
        #         "content": "# !/usr/bin/python3 \n\ndef print_sorted(liste):\n    return sorted(liste)\n\n2"
        #     },
        #     {
        #         "name": "test3.py",
        #         "content": "# !/usr/bin/python3 \n\ndef print_sorted(liste):\n    return sorted(liste)\n\n3"
        #     },
        # ])
        self.files = self.partners["drive"].download_files_from_folder(self.project_id)
        # print(self.files) # => working proof
        # self.files = self.partners["drive"].upload_files_to_folder(self.project_id, []) # add in rest server for cleaning deleting projects

    def get_files(self):
        return self.files

    async def generate_files(self, specs_json):
        self.files = await self.partners["cpp"].call(specs_json)

        self.partners["drive"].upload_files_to_folder(self.project_id, self.files)

        return self.files
