from typing import Any
from partners.mongo_queries import MongoQueries, COLLECTION_PROJECTS
from utils import InitFailedException
from defines import *

from partners.mongo_partner import MongoPartner, WTimeoutError,WriteException, MongoCoreException
from partners.logger_partner import LoggerPartner

class JsonHandler():

    @staticmethod
    def check_if_similar_keys(dict1:"dict[str,Any]", dict2:"dict[str,Any]") -> bool:
        return not set(dict1).isdisjoint(dict2)

    def __init__(self, partners:"dict[str,Any]", project_id:str, room_type:str):
        self.partners = partners
        self.project_id = project_id
        self.room_type = room_type
        self.json_currently_stored = True

        # 1) ACCESS TO PARTNERS AND APPLY TYPE
        db_partner:MongoPartner = self.partners[DB]
        logger_partner:LoggerPartner = self.partners[LOGGER]

        logger_partner.logger.info(f"{self.project_id}-{self.room_type} - call")

        try:
            self.data = db_partner.aggregate_list(COLLECTION_PROJECTS, MongoQueries.getSpecsFromId(self.project_id))[0]
        except WTimeoutError as err:
            logger_partner.logger.critical(MONGO_PARTNER_TIMEOUT, err)
            raise InitFailedException() from err
        except MongoCoreException as err:
            logger_partner.logger.error(MONGO_PARTNER_EXCEPTION, err)
            raise InitFailedException() from err


    async def close(self) -> None:
        # 1) ACCESS TO PARTNERS AND APPLY TYPE
        logger_partner:LoggerPartner = self.partners[LOGGER]

        logger_partner.logger.info(f"{self.project_id}-{self.room_type} - call")

        result = await self.update_storage()
        logger_partner.logger.info(f"{self.project_id}-{self.room_type} - Mongo - Project {'well' if result else 'not'} updated")


    async def update_storage(self) -> bool:
        # 1) ACCESS TO PARTNERS AND APPLY TYPE
        db_partner:MongoPartner = self.partners[DB]
        logger_partner:LoggerPartner = self.partners[LOGGER]

        logger_partner.logger.info(f"{self.project_id}-{self.room_type} - call")

        if self.json_currently_stored:
            return True

        try:
            self.json_currently_stored = await db_partner.update_one(COLLECTION_PROJECTS, *MongoQueries.updateSpecsForId(self.project_id, self.data))
        except WriteException as err:
            logger_partner.logger.error(MONGO_PARTNER_WRITE_ERROR, err)
            return False
        except WTimeoutError as err:
            logger_partner.logger.critical(MONGO_PARTNER_TIMEOUT, err)
            return False
        except MongoCoreException as err:
            logger_partner.logger.error(MONGO_PARTNER_EXCEPTION, err)
            return False

        return self.json_currently_stored


    def _path_climber(self, path:"list[str]", container:"int|float|str|list[Any]|dict[str, Any]") -> "False|int|float|str|list[Any]|dict[str,Any]":
        container_type = type(container)
        key = path[0]

        if container_type == dict:
            if key not in container:
                return False

        elif container_type == list:
            if not key.isnumeric() or not len(container) > int(key):
                return False

            key = int(key)

        else:
            return False

        return container[key] if len(path) == 1 else self._path_climber(path[1:], container[key])


    def add_element(self, path: str, content:"int|float|str|dict[str, Any]"):
        container = self._path_climber(path.split("/"), self.data)

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


    def remove_element(self, path: str, target: str) -> bool:
        container = self._path_climber(path.split("/"), self.data)

        if container is False:
            return False

        container_type = type(container)

        if container_type is dict:
            container.pop(target, None)
            return True

        if container_type is list:
            if not target.isnumeric() or not len(container) > int(target):
                return False

            del container[int(target)]
            self.json_currently_stored = False
            return True
            
        return False


    def modify_element(self, path: str, content:"int|float|str") -> bool:
        if type(content) not in (int, float, str, bool):
            return False

        path = path.split("/")
        
        container = self._path_climber(path[:-1], self.data)

        if container is False or path[-1] not in container.keys():
            return False

        container[path[-1]] = content

        self.json_currently_stored = False
        return True
