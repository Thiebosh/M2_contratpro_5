from typing import Any
from bson.objectid import ObjectId
from datetime import datetime
from pymongo import UpdateOne

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
    def exist_name(name:str) -> "tuple[dict[str, Any], dict[str, Any]]":
        return (
            {
                "name": name
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
    def unique_name(id:ObjectId, name:str) -> "tuple[dict[str, Any], dict[str, Any]]":
        return (
            {
                "_id": {
                    "$ne": id
                },
                "name": name
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
    def filter_id(objectId:ObjectId) -> "dict[str, Any]":
        return {
            "_id": objectId
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

    @staticmethod
    def create_project(
            project_name:str,
            users_id:"list[str]",
            syntax_id:str,
            description:str,
        ) -> "dict[str, Any]":
        return {
            "name": project_name,
            "users": users_id,
            "syntax_id": syntax_id,
            "description": description,
            "creation": datetime.utcnow(),
            "last_specs": None,
            "latest_proto": True,
            "specs": { "root": {} },
            "pages": [{ "default": ""}],
            "session": {},
            "chat": [],
        }

    @staticmethod
    def get_project(project_objectId:ObjectId) -> "list[dict[str, Any]]":
        return [
            {
                "$match": {
                    "_id": project_objectId
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "name": 1,
                    "users": {
                        "$map": {
                            "input": "$users",
                            "in": { "$toObjectId": "$$this" }
                        }
                    },
                    "syntax_id": {
                        "$toObjectId": "$syntax_id"
                    },
                    "creation": 1,
                    "last_specs": 1,
                    "latest_proto": 1,
                    "description": 1,
                }
            },
            {
                "$lookup": {
                    "from": "accounts",
                    "localField": "users",
                    "foreignField": "_id",
                    "as": "users"
                }
            },
            {
                "$lookup": {
                    "from": "syntax",
                    "localField": "syntax_id",
                    "foreignField": "_id",
                    "as": "syntaxes"
                }
            },
            {
                "$addFields": {
                    "users": {
                        "$map": {
                            "input": "$users",
                            "in": { 
                                "id": {
                                    "$toString": "$$this._id"
                                },
                                "name": "$$this.name"
                            }
                        }
                    },
                    "syntax": {
                        "$arrayElemAt": ["$syntaxes", 0]
                    }
                }
            },
            {
                "$project": {
                    "id": 1,
                    "name": 1,
                    "users": 1,
                    "syntax": "$syntax.name",
                    "creation": 1,
                    "last_specs": 1,
                    "latest_proto": 1,
                    "description": 1,
                }
            },
        ]

    @staticmethod
    def get_syntax_id_project(project_objectId:ObjectId) -> "tuple[dict[str, Any], dict[str, Any]]":
        return (
            {
                "_id": project_objectId,
            },
            {
                "_id": 0,
                "syntax_id": 1,
            }
        )

    @staticmethod
    def project_exist_for_user(project_name:str, user_id:str) -> "tuple[dict[str, Any], dict[str, Any]]":
        return (
            {
                "name": project_name,
                "users": user_id
            },
            {
                "_id": 0,
                "id": {
                    "$toString": "$_id"
                }
            }
        )

    @staticmethod
    def project_get_proto_pages(project_objectId:ObjectId) -> "list[dict[str, Any]]":
        return [
            {
                "$match": {
                    "_id": project_objectId
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "pages": 1
                }
            },
        ]

    @staticmethod
    def project_search_for_user(user_id:str) -> "list[dict[str, Any]]":
        return [
            {
                "$match": {
                    "users": user_id
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "id": {
                        "$toString": "$_id"
                    },
                    "name": 1,
                    "users": {
                        "$map": {
                            "input": "$users",
                            "in": { "$toObjectId": "$$this" }
                        }
                    },
                    "syntax_id": {
                        "$toObjectId": "$syntax_id"
                    },
                    "creation": 1,
                    "last_specs": 1,
                    "latest_proto": 1
                }
            },
            {
                "$lookup": {
                    "from": "accounts",
                    "localField": "users",
                    "foreignField": "_id",
                    "as": "users"
                }
            },
            {
                "$lookup": {
                    "from": "syntax",
                    "localField": "syntax_id",
                    "foreignField": "_id",
                    "as": "syntaxes"
                }
            },
            {
                "$addFields": {
                    "users": {
                        "$map": {
                            "input": "$users",
                            "in": { 
                                "id": {
                                    "$toString": "$$this._id"
                                },
                                "name": "$$this.name"
                            }
                        }
                    },
                    "syntax": {
                        "$arrayElemAt": ["$syntaxes", 0]
                    }
                }
            },
            {
                "$project": {
                    "id": 1,
                    "name": 1,
                    "users": 1,
                    "syntax_name": "$syntax.name",
                    "creation": 1,
                    "last_specs": 1,
                    "latest_proto": 1
                }
            },
        ]

    @staticmethod
    def project_update(
            objectId:ObjectId,
            name:"str|None",
            add_ids:"list[str]|None",
            remove_ids:"list[str]|None",
            description:"str|None",
            deleteDescription:"bool|None",
        ) -> "list[UpdateOne]":
        filter_q = {
            "_id": objectId
        }
        operations = []

        if name:
            operations.append(UpdateOne(filter_q, {
                "$set": {
                    "name": name
                }
            }))

        if add_ids:
            operations.append(UpdateOne(filter_q, {
                "$addToSet": {
                    "users": {
                        "$each": add_ids
                    }
                }
            }))

        if remove_ids:
            operations.append(UpdateOne(filter_q, {
                "$pullAll": {
                    "users": remove_ids
                }
            }))

        if description:
            operations.append(UpdateOne(filter_q, {
                "$set": {
                    "description": description
                }
            }))

        if deleteDescription and not description:
            operations.append(UpdateOne(filter_q, {
                "$set": {
                    "description": ''
                }
            }))

        return operations
