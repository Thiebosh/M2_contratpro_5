
class PhpPartner():
    def __init__(self) -> None:
        pass

    def copy_partner(self):
        return PhpPartner()

    def call_project_page(self, project_name, page):
        url = f"localhost:8003?action=render&project={project_name}&page={page}"
        print("call to ", url)
