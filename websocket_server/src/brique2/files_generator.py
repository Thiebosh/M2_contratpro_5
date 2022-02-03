
class FilesGenerator():
    def __init__(self, partners, project_name) -> None:
        self.partners = partners
        self.files = self.partners["drive"].download_files_from_folder(project_name)
        print("fichiers récupérés : ", self.files)

    def get_files(self):
        return self.files

    async def generate_files(self, specs_json):
        self.files = await self.partners["cpp"].call(specs_json)

        self.partners["drive"].upload_files_to_folder(self.files)

        return self.files
