from pymongo import MongoClient
from pymongo.errors import WriteError

LOGGER_ID = "MongoPartner:"

class MongoPartner:
    def __init__(self, mongo_url):
        self.conn = MongoClient(mongo_url, tlsAllowInvalidCertificates=True)
        self.collections = {
            "accounts": self.conn.spectry.accounts,
            "projects": self.conn.spectry.projects
        }


    def close(self):
        self.conn.close()


    async def insert_one(self, collection, data):
        if collection not in self.collections:
            return False

        success = False
        try:
            result = self.collections[collection].insert_one(data)
            success = True
            print(f"{LOGGER_ID} inserted {result.inserted_id}")

        except WriteError as error:
            print(LOGGER_ID, error.details)

        except Exception as exception:
            print(LOGGER_ID, "something went wrong...")
            print(type(exception))
            print(exception)

        return success


    async def update_one(self, collection, data):
        if collection not in self.collections:
            return False

        try:
            result = self.collections[collection].update_one(data)

            print(f"{LOGGER_ID} updated {len(result.inserted_ids)}/{len(data)} lines")

        except WriteError as error:
            print(LOGGER_ID, error.details)

        except Exception as e:
            print("something went wrong...")
            print(type(e))
            print(e)


    async def find_one(self, collection, filter, fields=None):
        if collection not in self.collections:
            return False

        return self.collections[collection].find_one(filter, fields)


    async def find_list(self, collection, filter, fields=None):
        if collection not in self.collections:
            return False

        return list(self.collections[collection].find(filter, fields))


    async def aggregate(self, collection, aggregation):
        if collection not in self.collections:
            return False

        return list(self.collections[collection].aggregate(aggregation))


    async def delete_one(self, collection, filter):
        if collection not in self.collections:
            return False

        try:
            result = self.collections[collection].delete_one(filter)

            print(LOGGER_ID, result)
            # print(f"{LOGGER_ID} updated {len(result.inserted_ids)}/{len(data)} lines")

        except WriteError as error:
            print(LOGGER_ID, error.details)

        except Exception as e:
            print("something went wrong...")
            print(type(e))
            print(e)
