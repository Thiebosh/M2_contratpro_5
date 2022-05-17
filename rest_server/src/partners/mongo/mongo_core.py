from typing import Any, Collection
from pymongo import MongoClient, UpdateOne
from pymongo.errors import PyMongoError, WTimeoutError, WriteError

COLLECTION_ACCOUNTS="accounts"
COLLECTION_PROJECTS="projects"
COLLECTION_SYNTAX="syntax"

class MongoCoreException(Exception):
    """Base class for all MongoCore exceptions"""

class TimeoutException(MongoCoreException):
    pass

class WriteException(MongoCoreException):
    pass


class MongoCore:
    def __init__(self, mongo_url):
        self.conn = MongoClient(mongo_url, tlsAllowInvalidCertificates=True)
        self.collections = {
            COLLECTION_ACCOUNTS: self.conn.spectry.accounts,
            COLLECTION_PROJECTS: self.conn.spectry.projects,
            COLLECTION_SYNTAX: self.conn.spectry.syntax,
        }


    async def count(self, collection:Collection, filter_q:"dict[str, Any]") -> int:
        try:
            result = self.collections[collection].count_documents(filter_q)
        except WTimeoutError as err:
            raise TimeoutException() from err
        except PyMongoError as err:
            raise MongoCoreException("count global error") from err

        return result


    async def insert_one(self, collection:Collection, document:"dict[str, Any]") -> bool:
        try:
            result = self.collections[collection].insert_one(document)
        except WriteError as err:
            raise WriteException() from err
        except WTimeoutError as err:
            raise TimeoutException() from err
        except PyMongoError as err:
            raise MongoCoreException("insert_one global error") from err

        return result.acknowledged


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


    def bulk_update_one(self, filter_q:"dict[str, Any]", update_q:"dict[str, Any]") -> UpdateOne:
        return UpdateOne(filter_q, update_q)


    async def bulk_write(self, collection:Collection, operations:"list[UpdateOne]") -> bool:
        try:
            result = self.collections[collection].bulk_write(operations)
        except WriteError as err:
            raise WriteException() from err
        except WTimeoutError as err:
            raise TimeoutException() from err
        except PyMongoError as err:
            raise MongoCoreException("bulk_write global error") from err

        return result.acknowledged


    async def update_many(self, collection:Collection, filter_q:"dict[str, Any]", update_q:"dict[str, Any]") -> int:
        try:
            result = self.collections[collection].update_many(filter_q, update_q)
        except WriteError as err:
            raise WriteException() from err
        except WTimeoutError as err:
            raise TimeoutException() from err
        except PyMongoError as err:
            raise MongoCoreException("update_many global error") from err

        return result.modified_count


    async def find_one(self, collection:Collection, filter_q:"dict[str, Any]", fields:"dict[str, Any]|None"=None) -> "dict[str, Any]":
        try:
            result = self.collections[collection].find_one(filter_q, fields)
        except WTimeoutError as err:
            raise TimeoutException() from err
        except PyMongoError as err:
            raise MongoCoreException("find_one global error") from err

        return result


    async def find_list(self, collection:Collection, filter_q:"dict[str, Any]", fields:"dict[str, Any]|None"=None) -> "list[dict[str, Any]]":
        try:
            result = list(self.collections[collection].find(filter_q, fields))
        except WTimeoutError as err:
            raise TimeoutException() from err
        except PyMongoError as err:
            raise MongoCoreException("find_list global error") from err

        return result


    async def aggregate_list(self, collection:Collection, aggregation:"dict[str, Any]") -> "list[dict[str, Any]]":
        try:
            result = list(self.collections[collection].aggregate(aggregation))
        except WTimeoutError as err:
            raise TimeoutException() from err
        except PyMongoError as err:
            raise MongoCoreException("aggregate_list global error") from err

        return result


    async def delete_one(self, collection:Collection, filter_q:"dict[str, Any]") -> bool:
        try:
            result = self.collections[collection].delete_one(filter_q)
        except WTimeoutError as err:
            raise TimeoutException() from err
        except PyMongoError as err:
            raise MongoCoreException("delete_one global error") from err

        return result.acknowledged


    async def delete_many(self, collection:Collection, filter_q:"dict[str, Any]") -> int:
        try:
            result = self.collections[collection].delete_many(filter_q)
        except WTimeoutError as err:
            raise TimeoutException() from err
        except PyMongoError as err:
            raise MongoCoreException("delete_many global error") from err

        return result.deleted_count
