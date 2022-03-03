from datetime import datetime

COLLECTION_PROJECTS = "projects"

class JsonHandler():

    @staticmethod
    def check_if_similar_keys(dict1, dict2):
        return not set(dict1).isdisjoint(dict2)

    def __init__(self, partners, project_name) -> None:
        self.partners = partners
        self.project_name = project_name
        self.json_currently_stored = True
        self.current_version_generated = False # add field to db

        aggregation = [
            {
                "$match": {
                    "name": self.project_name
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "specs": 1,
                }
            },
            {
                "$replaceRoot": {
                    "newRoot": "$specs"
                }
            }
        ]
        self.data = self.partners["db"].aggregate_list(COLLECTION_PROJECTS, aggregation)[0]

    def close(self):
        result = self.update_storage()
        print(f"{self.project_name} - Mongo - Project {'well' if result else 'not'} updated")


    def update_storage(self):
        print(f"{self.project_name} - {'' if self.json_currently_stored else 'no '}need of db update")
        if self.json_currently_stored:
            return True

        self.json_currently_stored = self.partners["db"].update_one(
            COLLECTION_PROJECTS,
            {"name":self.project_name},
            {"$set": {
                "last_specs":datetime.utcnow(),
                "specs":self.data
                }
            }
        )
        return self.json_currently_stored


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


    def add_element(self, path: "list[str]", content):
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
            return False

        self.json_currently_stored = False
        self.current_version_generated = False
        return True


    def remove_element(self, path: "list[str]", target: str):
        container = self._path_climber(path, self.data)

        if container is False:
            return False

        container_type = type(container)

        if container_type is dict:
            return not container.pop(target, None)

        if container_type is list:
            if not (target.isnumeric() and len(container) > int(target)):
                return False

            del container[int(target)]
            self.json_currently_stored = False
            self.current_version_generated = False
            return True

        return False


    def modify_element(self, path: "list[str]", content):
        if type(content) not in (int, float, str):
            return False

        container = self._path_climber(path[:-1], self.data)

        if container is False or path[-1] not in container.keys():
            return False

        container[path[-1]] = content

        self.json_currently_stored = False
        self.current_version_generated = False
        return True
