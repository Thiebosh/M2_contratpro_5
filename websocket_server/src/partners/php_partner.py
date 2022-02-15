import requests
from requests.exceptions import RequestException

class PhpPartner():
    def __init__(self, base_url, state=None) -> None:
        self.base_url = f"http://{base_url}"
        self.state = state or False

        if state == None:
            try:
                result = requests.get(url=f"{self.base_url}?action=probe")
            except RequestException:
                print("big exception") # serveur not started or bad url
            else:
                # print("status_code", result.status_code)
                self.state = result.status_code == 200


    def copy_partner(self):
        return PhpPartner(base_url=self.base_url, state=self.state)

    
    def set_project_folder(self, project_name):
        if not self.state:
            return False

        # try:
        #     result = requests.get(url=f"{self.base_url}?action=...")
        # except RequestException:
        #     print("big exception")
        #     return False

        return True

    
    def set_project_files(self, project_name, files):
        if not self.state:
            return False

        # for file in files:
        #     try:
        #         result = requests.get(url=f"{self.base_url}?action=...")
        #     except RequestException:
        #         print("big exception")
        #         return False

        return True


    def unset_project_files(self, project_name):
        if not self.state:
            return False

        # try:
        #     result = requests.get(url=f"{self.base_url}?action=...")
        # except RequestException:
        #     print("big exception")
        #     return False

        return True


    def unset_project_folder(self, project_name):
        if not self.state:
            return False

        # try:
        #     result = requests.get(url=f"{self.base_url}?action=...")
        # except RequestException:
        #     print("big exception")
        #     return False

        return True


    def get_project_page(self, project_name, page):
        if not self.state:
            return False

        print("call to ", f"{self.base_url}?action=render&project={project_name}&page={page}")
        try:
            result = requests.get(url=f"{self.base_url}?action=render&project={project_name}&page={page}")
        except RequestException:
            print("big exception") # serveur not started or bad url
            return False

        print("status_code", result.status_code)
        print("content", result.content.decode("utf-8"))

        return True
