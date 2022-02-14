from email.mime import base
import requests
from requests.exceptions import RequestException, HTTPError

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


    def call_project_page(self, project_name, page):
        if not self.state:
            return False

        print("call to ", f"{self.base_url}?action=render&project={project_name}&page={page}")
        result = requests.get(url=f"{self.base_url}?action=render&project={project_name}&page={page}")
        print("status_code", result.status_code)
        print("content", result.content.decode("utf-8"))
