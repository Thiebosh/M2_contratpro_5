from pymongo import MongoClient
from pymongo.errors import WriteError

LOGGER_ID = "MongoPartner:"

class MongoPartner:
    def __init__(self, mongo_url):
        self.mongo_url = mongo_url
        self.conn = MongoClient(mongo_url, tlsAllowInvalidCertificates=True)
        self.collections = {
            "projects": self.conn.spectry.projects
        }

    def copy_partner(self):
        return MongoPartner(self.mongo_url)

    def close(self):
        self.conn.close()


    async def update_one_async(self, collection, filter_q, update_q):
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


    def find_one(self, collection, filter_q, fields=None):
        if collection not in self.collections:
            return False

        return self.collections[collection].find_one(filter_q, fields)


    def aggregate_list(self, collection, aggregation):
        if collection not in self.collections:
            return False

        return list(self.collections[collection].aggregate(aggregation))
