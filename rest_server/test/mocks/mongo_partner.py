DEFAULT_COUNT = 0
DOC = {"keys": "values"}
DOC_LIST = [DOC, DOC]

class MongoPartnerMock:
    def __init__(self, *_):
        pass

    def close(self):
        pass

    async def insert_one(self, *_):
        return True

    async def update_one(self, *_):
        return True

    async def update_many(self, *_):
        return DEFAULT_COUNT

    async def find_one(self, *_):
        return DOC

    async def find_list(self, *_):
        return DOC_LIST

    async def aggregate(self, *_):
        return DOC_LIST

    async def delete_one(self, *_):
        return True

    async def delete_many(self, *_):
        return DEFAULT_COUNT
