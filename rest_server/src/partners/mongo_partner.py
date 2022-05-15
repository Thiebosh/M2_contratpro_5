from pymongo import MongoClient, UpdateOne
from pymongo.errors import WriteError

LOGGER_ID = "MongoPartner:"

class MongoPartner:
    def __init__(self, mongo_url):
        self.conn = MongoClient(mongo_url, tlsAllowInvalidCertificates=True)
        self.collections = {
            "accounts": self.conn.spectry.accounts,
            "projects": self.conn.spectry.projects,
            "syntax": self.conn.spectry.syntax,
        }


    def close(self):
        self.conn.close()


    async def count(self, collection, filter_q):
        if collection not in self.collections:
            return False

        return self.collections[collection].count_documents(filter_q)


    async def insert_one(self, collection, data):
        if collection not in self.collections:
            return False

        success = False
        try:
            result = self.collections[collection].insert_one(data)
            success = result.acknowledged
            print(f"{LOGGER_ID} inserted {result.inserted_id}")

        except WriteError as error:
            print(LOGGER_ID, error.details)

        except Exception as exception:
            print(LOGGER_ID, "something went wrong...")
            print(type(exception))
            print(exception)

        return success


    async def update_one(self, collection, filter_q, update_q):
        if collection not in self.collections:
            return False

        success = False
        try:
            result = self.collections[collection].update_one(filter_q, update_q)
            success = result.acknowledged
            print(f"{LOGGER_ID} updated {result.modified_count} doc")

        except WriteError as error:
            print(LOGGER_ID, error.details)

        except Exception as e:
            print("something went wrong...")
            print(type(e))
            print(e)

        return success


    def bulk_update_one(self, filter, update):
        return UpdateOne(filter, update)


    async def bulk_write(self, collection, operations):
        if collection not in self.collections:
            return False

        success = False
        try:
            result = self.collections[collection].bulk_write(operations)
            success = result.acknowledged
            print(f"{LOGGER_ID} updated {result.modified_count} doc")

        except WriteError as error:
            print(LOGGER_ID, error.details)

        except Exception as e:
            print("something went wrong...")
            print(type(e))
            print(e)

        return success


    async def update_many(self, collection, filter_q, update_q):
        if collection not in self.collections:
            return False

        result = 0
        try:
            result = self.collections[collection].update_many(filter_q, update_q)
            print(f"{LOGGER_ID} updated {result.modified_count}/{result.matched_count} doc")

        except WriteError as error:
            print(LOGGER_ID, error.details)

        except Exception as e:
            print("something went wrong...")
            print(type(e))
            print(e)

        return result.modified_count


    async def find_one(self, collection, filter_q, fields=None):
        if collection not in self.collections:
            return False

        return self.collections[collection].find_one(filter_q, fields)


    async def find_list(self, collection, filter_q, fields=None):
        if collection not in self.collections:
            return False

        return list(self.collections[collection].find(filter_q, fields))


    async def aggregate_list(self, collection, aggregation):
        if collection not in self.collections:
            return False

        return list(self.collections[collection].aggregate(aggregation))


    async def delete_one(self, collection, filter_q):
        if collection not in self.collections:
            return False

        success = False
        try:
            result = self.collections[collection].delete_one(filter_q)
            success = result.acknowledged
            print(f"{LOGGER_ID} deleted {result.deleted_count} doc")

        except WriteError as error:
            print(LOGGER_ID, error.details)

        except Exception as e:
            print("something went wrong...")
            print(type(e))
            print(e)

        return success


    async def delete_many(self, collection, filter_q):
        if collection not in self.collections:
            return False

        result = 0
        try:
            result = self.collections[collection].delete_many(filter_q)

            print(f"{LOGGER_ID} deleted {result.deleted_count} docs")

        except WriteError as error:
            print(LOGGER_ID, error.details)

        except Exception as e:
            print("something went wrong...")
            print(type(e))
            print(e)

        return result.deleted_count
