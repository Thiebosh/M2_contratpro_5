
class FilesGenerator():
    def __init__(self, partners, project_name) -> None:
        self.partners = partners
        ## tmp upload files => test download
        # self.partners["drive"].upload_files_to_folder([
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
        # ], project_name)
        self.files = self.partners["drive"].download_files_from_folder(project_name)
        # print(self.files) # => working proof
        # self.files = self.partners["drive"].upload_files_to_folder([], project_name) # add in rest server for cleaning deleting projects

    def get_files(self):
        return self.files

    async def generate_files(self, specs_json):
        self.files = await self.partners["cpp"].call(specs_json)

        self.partners["drive"].upload_files_to_folder(self.files)

        return self.files
