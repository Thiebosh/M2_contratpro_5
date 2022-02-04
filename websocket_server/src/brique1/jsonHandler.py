from datetime import datetime

COLLECTION_PROJECTS = "projects"

class JsonHandler():

    @staticmethod
    def check_if_similar_keys(dict1, dict2):
        return not set(dict1).isdisjoint(dict2)

    def __init__(self, partners, project_name) -> None:
        self.partners = partners
        self.project_name = project_name
        self.data = self.partners["db"].find_one(COLLECTION_PROJECTS, {"name":project_name}, {"_id": 0,"specs": 1})["specs"]


    def update_storage(self):
        return self.partners["db"].update_one(
            COLLECTION_PROJECTS,
            {"name":self.project_name}, 
            {"$set":
                {
                    "last_specs":datetime.utcnow(), 
                    "specs":self.data
                }
            }
        )


    def _path_climber(self, path:"list[str]", container):
        container_type = type(container)
        key = path[0]

        if container_type == dict:
            if key not in container:
                return False

        elif container_type == list:
            if not (key.isnumeric() and len(container) > int(key)):
                return False

            key = int(key)

        else:
            return False

        return container[key] if len(path) == 1 else self._path_climber(path[1:], container[key])


    def add_element(self, path:"list[str]", content):
        container = self._path_climber(path, self.data)

        if container is False:
            return False

        container_type = type(container)
        content_type = type(content)

        if container_type is list:
            if content_type is list:
                return False

            container.append(content)

        elif container_type is dict:
            if content_type is not dict:
                return False

            if JsonHandler.check_if_similar_keys(container, content):
                return False

            container.update(content)

        else:
            False

        return True


    def remove_element(self, path:"list[str]", target:str):
        container = self._path_climber(path, self.data)

        if container is False:
            return False

        container_type = type(container)

        if container_type is dict:
            return not not container.pop(target, None)

        elif container_type is list:
            if not (target.isnumeric() and len(container) > int(target)):
                return False

            del container[int(target)]
            return True

        return False


    def modify_element(self, path:"list[str]", content):
        if type(content) not in (int, float, str):
            return False

        return self.remove_element(path[:-1], path[-1]) and self.add_element(path[:-1], {path[-1]: content})
