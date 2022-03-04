import requests
from requests.exceptions import RequestException

class PhpPartner():
    def __init__(self, base_url, state=None) -> None:
        self.base_url = base_url
        self.session = requests.session()
        self.state = state or self._get("probe")[0]


    def copy_partner(self):
        return PhpPartner(base_url=self.base_url, state=self.state)


    def _call(self, method_callback, endpoint, print_=False, get_code=False):
        if hasattr(self, "state") and self.state is False:
            return False, ""

        print("php - call", endpoint)
        try:
            result = method_callback()
        except RequestException:
            raise Exception("php - server not started")

        content = result.content.decode("utf-8").encode("utf-8").decode('utf-8') # bytes to str + str without to with accents

        if print_:
            print(f"php - status_code {result.status_code}")
            print("php - content")
            print(content)
            print("php - finish")

        return result.status_code if get_code else result.status_code == 200, content


    def _get(self, endpoint, print_=False, get_code=False):
        return self._call(lambda: self.session.get(url=f"{self.base_url}?action={endpoint}"), endpoint, print_, get_code)


    def _post(self, endpoint, data, print_=False, get_code=False):
        return self._call(lambda: self.session.post(url=f"{self.base_url}?action={endpoint}", data=data), endpoint, print_, get_code)


    def set_project_folder(self, project_name):
        return self._post("create_folder", { "project_name": project_name })[0]


    def set_project_files(self, project_name, files):
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
        return self._post("remove_files", { "project_name": project_name })[0]


    def unset_project_folder(self, project_name):
        return self._post("remove_folder", { "project_name": project_name })[0]


    def set_session(self, session):
        return self._post("set_session", { "session": session}, print_=True)[0]


    def get_session(self):
        return self._get("get_session", print_=True)


    def get_project_page(self, project_name, page):
        data = {
            "project_name": project_name,
            "page": page
        }
        return self._post("execute", data, get_code=True)
