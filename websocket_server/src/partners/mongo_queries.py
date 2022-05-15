from typing import Any
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

    @staticmethod
    def getProtoStateFromId(id:str):
        return (
            {"_id": ObjectId(id)},
            {
                "_id": 0,
                "latest_proto": 1,
            }
        )

    @staticmethod
    def updateProtoStateForId(id:str, state:bool):
        return (
            {"_id": ObjectId(id)},
            {"$set": {
                "latest_proto": state,
                }
            }
        )

    @staticmethod
    def updateProtoPagesForId(id:str, pages:"list[dict[str, Any]]"):
        return (
            {"_id": ObjectId(id)},
            {"$set": {
                "pages": pages,
                }
            }
        )

    @staticmethod
    def getSyntaxIdFromId(id:str):
        return (
            {"_id": ObjectId(id)},
            {
                "_id": 0,
                "syntax_id": 1,
            }
        )
