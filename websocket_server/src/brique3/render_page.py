class RenderPage():
    def __init__(self, partners, project_name) -> None:
        self.partners = partners
        self.project_name = project_name


    def page(self, page):
        return self.partners["renderer"].get_project_page(self.project_name, page)
