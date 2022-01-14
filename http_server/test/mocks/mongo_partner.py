ID = "61e131ce9c11b699edc38a1e"
PASSWORD = {
    "text": "some",
    "hash": "$2b$06$88TtU0r7BDfsjvwcDH72QeLCbq3CyjK5J8Mbe1HmfDiotl8TaVfq2"
}
FIND_LIST = [
    {"selected_fields": "associated_values"},
    {"selected_fields": "associated_values"}
]
MANY_COUNT = 5

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
        return MANY_COUNT

    async def find_one(self, *_):
        return {
            "selected_fields": "associated_values",
            "_id": ID,
            "password": PASSWORD["hash"],
        }

    async def find_list(self, *_):
        return FIND_LIST

    async def aggregate(self, *_):
        return FIND_LIST

    async def delete_one(self, *_):
        return True

    async def delete_many(self, *_):
        return MANY_COUNT
