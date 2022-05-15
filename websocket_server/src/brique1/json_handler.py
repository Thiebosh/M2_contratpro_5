from partners.mongo_queries import MongoQueries, COLLECTION_PROJECTS

class JsonHandler():

    @staticmethod
    def check_if_similar_keys(dict1, dict2):
        return not set(dict1).isdisjoint(dict2)

    def __init__(self, partners, project_id, room_type) -> None:
        self.partners = partners
        self.project_id = project_id
        self.room_type = room_type
        self.json_currently_stored = True

        self.data = self.partners["db"].aggregate_list(COLLECTION_PROJECTS, MongoQueries.getSpecsFromId(self.project_id))[0]


    async def close(self):
        result = await self.update_storage()
        print(f"{self.project_id}-{self.room_type} - Mongo - Project {'well' if result else 'not'} updated")


    async def update_storage(self):
        print(f"{self.project_id}-{self.room_type} - {'no ' if self.json_currently_stored else ''}need of db update")
        if self.json_currently_stored:
            return True

        self.json_currently_stored = await self.partners["db"].update_one_async(
            COLLECTION_PROJECTS,
            *MongoQueries.updateSpecsForId(self.project_id, self.data)
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
        return True
