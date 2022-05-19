from typing import Any
import requests
from requests.exceptions import RequestException
from defines import *

class PhpCoreException(Exception):
    """Base class for all PhpCore exceptions"""

class PhpPartner():
    def __init__(self, base_url:str, state:bool=None) -> None:
        self.base_url = base_url
        self.session = requests.session()
        self.state = True if OS_IS_LOCAL else state or self._get("probe")[0]


    def copy_partner(self):
        return PhpPartner(base_url=self.base_url, state=self.state)


    def _call(self, method_callback, get_code:bool=False) -> "tuple[bool|int, str]":
        if hasattr(self, "state") and self.state is False:
            return False, ""

        try:
            result:requests.Response = method_callback()
        except RequestException as err:
            raise PhpCoreException("_call global error") from err

        content = result.content.decode("utf-8").encode("utf-8").decode('utf-8') # bytes to str + str without to with accents

        return (result.status_code if get_code else result.status_code == 200, content)


    def _get(self, endpoint:str, get_code:bool=False) -> "tuple[bool|int, str]":
        return self._call(lambda: self.session.get(url=f"{self.base_url}?action={endpoint}"), get_code)


    def _post(self, endpoint:str, data:"dict[str,Any]", get_code:bool=False) -> "tuple[bool|int, str]":
        return self._call(lambda: self.session.post(url=f"{self.base_url}?action={endpoint}", data=data), get_code)


    def set_project_folder(self, project_id:str) -> bool:
        return True if OS_IS_LOCAL else self._post("create_folder", { "project_name": project_id })[0]


    def set_project_files(self, project_id:str, files:"list[dict[str,str]]") -> bool:
        if OS_IS_LOCAL:
            return True

        for file in files:
            data = { 
                "project_name": project_id,
                "file_name": file['name'],
                "file_content": file['content']
            }
            if not self._post("create_file", data)[0]:
                return False

        return True


    def unset_project_files(self, project_id:str) -> bool:
        return True if OS_IS_LOCAL else self._post("remove_files", { "project_name": project_id })[0]


    def unset_project_folder(self, project_id:str) -> bool:
        return True if OS_IS_LOCAL else self._post("remove_folder", { "project_name": project_id })[0]


    def set_session(self, session:"dict[str,Any]") -> bool:
        return True if OS_IS_LOCAL else self._post("set_session", { "session": session})[0]


    def get_session(self) -> "tuple[bool,str]":
        return (True, "{}") if OS_IS_LOCAL else self._get("get_session")


    def reset_session(self) -> bool:
        return True if OS_IS_LOCAL else self._get("reset_session")[0]


    def get_project_page(self, project_id:str, page:str) -> "tuple[int,str]":
        if OS_IS_LOCAL:
            return (500, "")

        data = {
            "project_name": project_id,
            "page": page
        }
        return self._post("execute", data, get_code=True)
