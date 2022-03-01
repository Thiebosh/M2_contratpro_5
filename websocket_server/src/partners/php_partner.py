import requests
from requests.exceptions import RequestException

class PhpPartner():
    def __init__(self, base_url, state=None) -> None:
        self.base_url = base_url
        self.state = state or False

        if state == None:
            self.state = self._get("probe")[0]


    def copy_partner(self):
        return PhpPartner(base_url=self.base_url, state=self.state)


    def _get(self, endpoint, print_=False):
        print("php - call", endpoint)
        try:
            result = requests.get(url=f"{self.base_url}?action={endpoint}")
        except RequestException:
            print("big exception") # serveur not started or bad url
            return False, ""

        if print_:
            print("status_code", result.status_code)
            print("content\n________\n", result.content.decode("utf-8"))
            print("________\nfinish")

        return result.status_code == 200, result.content.decode("utf-8")


    def _post(self, endpoint, data, print_=False):
        print("php - call to ",endpoint)
        try:
            result = requests.post(url=f"{self.base_url}?action={endpoint}", data=data)
        except RequestException:
            print("big exception") # serveur not started or bad url
            return False, ""

        if print_:
            print("status_code", result.status_code)
            if result.status_code != 200:
                print("data : ", data)

            print("content\n________\n", result.content.decode("utf-8"))
            print("________\nfinish")

        return result.status_code == 200, result.content.decode("utf-8")


    def set_project_folder(self, project_name):
        if not self.state:
            return False

        return self._post("create_folder", { "project_name": project_name })[0]


    def set_project_files(self, project_name, files):
        if not self.state:
            return False

        print("upload all files")

        for file in files:
            data = { 
                "project_name": project_name,
                "file_name": file['name'],
                "file_content": file['content']
            }
            if not self._post("create_file", data)[0]:
                return False

        print("finish all files")

        return True


    def unset_project_files(self, project_name):
        print("call unset_project_files")
        if not self.state:
            return False

        return self._post("remove_files", { "project_name": project_name })[0]


    def unset_project_folder(self, project_name):
        print("call unset_project_folder")
        if not self.state:
            return False

        return self._post("remove_folder", { "project_name": project_name })[0]


    def get_project_page(self, project_name, page):
        if not self.state:
            return False

        data = {
            "project_name": project_name,
            "page": page
        }
        return self._post("execute", data)
