from abc import ABC
from defines import *

class FilesManager(ABC):
    def __init__(self, partners, project_id, room_type) -> None:
        self.partners = partners
        self.project_id = project_id
        self.room_type = room_type

        if not self.project_id:
            raise Exception("FilesGenerator - __init__: unknow project name")

    def close(self):
        pass

    def _test(self):
        self.partners[NAS].upload_files_to_folder(self.project_id, [
            {
                "name": "test1.py",
                "content": "# !/usr/bin/python3 \n\ndef print_sorted(liste):\n    return sorted(liste)\n\n1"
            },
            {
                "name": "test2.py",
                "content": "# !/usr/bin/python3 \n\ndef print_sorted(liste):\n    return sorted(liste)\n\n2"
            },
            {
                "name": "test3.py",
                "content": "# !/usr/bin/python3 \n\ndef print_sorted(liste):\n    return sorted(liste)\n\n3"
            },
        ])

        self.files = self.partners[NAS].download_files_from_folder(self.project_id)
        print(self.files) # => working proof

        self.files = self.partners[NAS].upload_files_to_folder(self.project_id, []) # add in rest server for cleaning deleting projects
