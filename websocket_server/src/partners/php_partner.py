from distutils.util import strtobool
import requests # eventuellement requests_async mais à voir car doit garder session
from requests.exceptions import RequestException

import os # tmp

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

        if print_:
            print("php - call", endpoint)
        try:
            result:requests.Response = method_callback()
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
        if strtobool(os.environ.get('RENDER_STATE', default="false")):
            return 500, ""
        return self._call(lambda: self.session.get(url=f"{self.base_url}?action={endpoint}"), endpoint, print_, get_code)


    def _post(self, endpoint, data, print_=False, get_code=False):
        if strtobool(os.environ.get('RENDER_STATE', default="False")):
            return 200, ""
        return self._call(lambda: self.session.post(url=f"{self.base_url}?action={endpoint}", data=data), endpoint, print_, get_code)


    def set_project_folder(self, project_id):
        return self._post("create_folder", { "project_name": project_id })[0]


    def set_project_files(self, project_id, files):
        # print("upload all files")

        for file in files:
            data = { 
                "project_name": project_id,
                "file_name": file['name'],
                "file_content": file['content']
            }
            if not self._post("create_file", data)[0]:
                return False

        # print("finish uploading all files")

        return True


    def unset_project_files(self, project_id):
        return self._post("remove_files", { "project_name": project_id })[0]


    def unset_project_folder(self, project_id):
        return self._post("remove_folder", { "project_name": project_id })[0]


    def set_session(self, session):
        return self._post("set_session", { "session": session})[0]


    def get_session(self):
        if strtobool(os.environ.get('RENDER_STATE', default="false")):
            return True, "{}"
        return self._get("get_session")


    def reset_session(self):
        return self._get("reset_session")[0]


    def get_project_page(self, project_id, page):
        data = {
            "project_name": project_id,
            "page": page
        }
        return self._post("execute", data, get_code=True)
