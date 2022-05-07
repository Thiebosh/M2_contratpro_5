from bson import ObjectId
from datetime import datetime

COLLECTION_PROJECTS = "projects"

class MongoQueries():
    @staticmethod
    def getSpecsFromId(id:str):
        return [
            {
                "$match": {
                    "_id": ObjectId(id)
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "specs": 1,
                }
            },
            {
                "$replaceRoot": {
                    "newRoot": "$specs"
                }
            }
        ]

    @staticmethod
    def updateSpecsForId(id:str, data:dict):
        return (
            {"_id": ObjectId(id)},
            {"$set": {
                "last_specs":datetime.utcnow(),
                "specs": data
                }
            }
        )

    @staticmethod
    def getSessionFromId(id:str):
        return [
            {
                "$match": {
                    "_id": ObjectId(id)
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "session": 1,
                }
            },
            {
                "$replaceRoot": {
                    "newRoot": "$session"
                }
            }
        ]

    @staticmethod
    def updateSessionForId(id:str, data:dict):
        return (
            {"_id": ObjectId(id)},
            {"$set": {
                "session": data
                }
            }
        )
