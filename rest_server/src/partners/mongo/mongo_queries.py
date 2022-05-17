from typing import Any
from bson.objectid import ObjectId

class MongoQueries:
    @staticmethod
    def to_objectId(id:str) -> "ObjectId|bool":
        try:
            return ObjectId(id)
        except TypeError:
            return False

    @staticmethod
    def get_syntaxes() -> "tuple[dict[str, Any], dict[str, Any]]":
        return (
            {},
            {
                "_id": 0,
                "id": {
                    "$toString": "$_id"
                },
                "name": 1,
                "description": 1,
            }
        )

    @staticmethod
    def exist_user(username:str) -> "tuple[dict[str, Any], dict[str, Any]]":
        return (
            {
                "name": username
            },
            {
                "_id": 0,
                "name": 1
            }
        )

    @staticmethod
    def create_user(username:str, password:str) -> "dict[str, Any]":
        return {
            "name": username,
            "password": password
        }

    @staticmethod
    def get_user_id_password(username:str) -> "tuple[dict[str, Any], dict[str, Any]]":
        return (
            {
                "name": username,
            },
            {
                "_id": 0,
                "id": {
                    "$toString": "$_id"
                },
                "password": 1
            }
        )

    @staticmethod
    def count_user_projects(user_id:str) -> "dict[str, Any]":
        return {
            "users": user_id
        }

    @staticmethod
    def get_user_name(user_objectId:ObjectId) -> "tuple[dict[str, Any], dict[str, Any]]":
        return (
            {
                "_id": user_objectId,
            },
            {
                "_id": 0,
                "name": 1
            }
        )

    @staticmethod
    def exist_user_not_id(user_id:ObjectId, username:str) -> "tuple[dict[str, Any], dict[str, Any]]":
        return (
            {
                "_id": {
                    "$ne": user_id
                },
                "name": username
            },
            {
                "_id": 0,
                "name": 1
            }
        )

    @staticmethod
    def update_user(user_id:ObjectId, username:"str|None", password:"str|None") -> "tuple[dict[str, Any], dict[str, Any]]":
        filter_q = {
            "_id": user_id
        }

        update_q = {"$set": {}}
        if username:
            update_q["$set"]["name"] = username
        if password:
            update_q["$set"]["password"] = password

        return (filter_q, update_q)

    @staticmethod
    def search_account(excluded_users_ids:"list[ObjectId]", username:str, limit:int) -> "list[dict[str, Any]]":
        return [
            {
                "$match": {
                    "_id": {
                        "$nin": excluded_users_ids
                    },
                    "name": {
                        "$regex": username,
                        "$options": "i"
                    }
                }
            },
            { 
                "$limit" : limit
            },
            {
                "$project": {
                    "_id": 0,
                    "id": {
                        "$toString": "$_id"
                    },
                    "name": 1
                }
            },
        ]

    @staticmethod
    def filter_user(user_objectId:ObjectId) -> "dict[str, Any]":
        return {
            "_id": user_objectId
        }

    @staticmethod
    def filter_unique_contrib_projects(user_objectId:ObjectId) -> "dict[str, Any]":
        return {
            "users": [user_objectId]
        }

    @staticmethod
    def get_unique_contrib_projects(user_objectId:ObjectId) -> "tuple[dict[str, Any], dict[str, Any]]":
        return (
            MongoQueries.filter_unique_contrib_projects(user_objectId),
            {
                "_id": 0,
                "id": {
                    "$toString": "$_id"
                },
            }
        )

    @staticmethod
    def delete_one_contrib_projects(user_objectId:ObjectId) -> "tuple[dict[str, Any], dict[str, Any]]":
        return (
            {},
            {
                "$pull": {
                    "users": user_objectId
                }
            }
        )
