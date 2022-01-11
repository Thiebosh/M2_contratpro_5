from pymongo import MongoClient
from pymongo.errors import WriteError

LOGGER_ID = "MongoPartner:"

class MongoPartner:
    def __init__(self, mongo_url):
        print(mongo_url)
        self.conn = MongoClient(mongo_url, tlsAllowInvalidCertificates=True)
        self.db = self.conn.spectry
        self.accounts = self.db.accounts
        self.projects = self.db.projects


    def close(self):
        self.conn.close()


    async def make_insert(self, collection, data):
        try:
            result = collection.insert_many(data)
            print(f"{LOGGER_ID} inserted {len(result.inserted_ids)}/{len(data)} lines")

        except WriteError as error:
            print(LOGGER_ID, error.details)

        except Exception as exception:
            print(LOGGER_ID, "something went wrong...")
            print(type(exception))
            print(exception)


    async def make_update(self, collection, data):
        try:
            result = collection.update_many(data)

            print(f"{LOGGER_ID} updated {len(result.inserted_ids)}/{len(data)} lines")

        except WriteError as error:
            print(LOGGER_ID, error.details)

        except Exception as e:
            print("something went wrong...")
            print(type(e))
            print(e)


    async def make_find(self, collection, filter):
        return collection.find(filter)


    async def make_aggregate(self, collection, aggregation):
        return list(collection.aggregate(aggregation))[0]


    async def create_user():
        query = ""

        # db call

        return False


    async def read_user():
        query = ""

        # db call

        return False


    async def update_user():
        query = ""

        # db call

        return False


    async def delete_user():
        query = ""

        # db call

        return False


    async def create_project():
        query = ""

        # db call

        return False


    async def read_project():
        query = ""

        # db call

        return False


    async def update_project():
        query = ""

        # db call

        return False


    async def delete_project():
        query = ""

        # db call

        return False
