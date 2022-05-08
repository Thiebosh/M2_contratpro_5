from .files_manager import FilesManager

class FilesManagerProto(FilesManager):
    def __init__(self, partners, project_id, room_type) -> None:
        super().__init__(partners, project_id, room_type)

        self.files = self.partners["storage"].download_files_from_folder(self.project_id)

        if not self.partners["renderer"].set_project_folder(self.project_id):
            raise Exception(f"{self.project_id}-{self.room_type} - PHP - folder not created")

        # security
        if not self.partners["renderer"].unset_project_files(self.project_id):
            raise Exception(f"{self.project_id}-{self.room_type} - PHP - folder emptiness pb")

        if not self.partners["renderer"].set_project_files(self.project_id, self.files):
            raise Exception(f"{self.project_id}-{self.room_type} - PHP - files not uploaded")


    def close(self):
        result = self.partners["renderer"].unset_project_files(self.project_id)
        print(f"{self.project_id}-{self.room_type} - PHP - Project files {'well' if result else 'not'} removed")
        if result is False:
            return # error ?
        result = self.partners["renderer"].unset_project_folder(self.project_id)
        print(f"{self.project_id}-{self.room_type} - PHP - Project directory {'well' if result else 'not'} removed")
