from typing import Any, Collection
from pymongo import MongoClient
from pymongo.errors import PyMongoError, WTimeoutError, WriteError

COLLECTION_PROJECTS="projects"

class MongoCoreException(Exception):
    """Base class for all MongoCore exceptions"""

class TimeoutException(MongoCoreException):
    pass

class WriteException(MongoCoreException):
    pass


class MongoPartner:
    def __init__(self, mongo_url:str):
        self.mongo_url = mongo_url
        self.conn = MongoClient(mongo_url, tlsAllowInvalidCertificates=True)
        self.collections = {
            COLLECTION_PROJECTS: self.conn.spectry.projects,
        }


    def copy_partner(self):
        return MongoPartner(self.mongo_url)


    def close(self) -> None:
        self.conn.close()


    async def update_one(self, collection:Collection, filter_q:"dict[str, Any]", update_q:"dict[str, Any]") -> bool:
        try:
            result = self.collections[collection].update_one(filter_q, update_q)
        except WriteError as err:
            raise WriteException() from err
        except WTimeoutError as err:
            raise TimeoutException() from err
        except PyMongoError as err:
            raise MongoCoreException("update_one global error") from err

        return result.acknowledged


    def find_one(self, collection:Collection, filter_q:"dict[str, Any]", fields:"dict[str, Any]|None"=None) -> "dict[str, Any]":
        try:
            result = self.collections[collection].find_one(filter_q, fields)
        except WTimeoutError as err:
            raise TimeoutException() from err
        except PyMongoError as err:
            raise MongoCoreException("find_one global error") from err

        return result


    def aggregate_list(self, collection:Collection, aggregation:"dict[str, Any]") -> "list[dict[str, Any]]":
        try:
            result = list(self.collections[collection].aggregate(aggregation))
        except WTimeoutError as err:
            raise TimeoutException() from err
        except PyMongoError as err:
            raise MongoCoreException("aggregate_list global error") from err

        return result
