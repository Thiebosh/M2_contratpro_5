from datetime import datetime
from quart import Blueprint, json, request, current_app
from flask_api import status
from bson.objectid import ObjectId
from werkzeug.datastructures import ImmutableMultiDict

bp_project = Blueprint("project", __name__)

COLLECTION = "projects"

@bp_project.route("/create", methods=['POST'])
async def create():
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 2:
        return "", status.HTTP_400_BAD_REQUEST

    project_name = post.get("name", type=str, default=None)
    users_id = post.get("users_id", type=str, default=None)

    if not (project_name and users_id):
        return "", status.HTTP_400_BAD_REQUEST

    # verify if name does not exist
    filter_q = {
        "name": project_name
    }
    fields = {
        "_id": 0,
        "name": 1
    }

    try:
        if await current_app.config["partners"]["db"].find_one(COLLECTION, filter_q, fields):
            return {
                "success": "already exist"
            }, status.HTTP_200_OK
    except Exception as e:
        print(e)
        return "", status.HTTP_503_SERVICE_UNAVAILABLE

    # create project
    doc = {
        "name": project_name,
        "users": json.loads(users_id),
        "description": "",
        "creation": datetime.utcnow(),
        "last_specs": None,
        "latest_proto": True,
        "specs": { "root": {} },
        "pages": [{ "default": ""}],
        "session": {},
    }

    try:
        return {
            "success": await current_app.config["partners"]["db"].insert_one(COLLECTION, doc),
        }, status.HTTP_200_OK
    except Exception as e:
        print(e)
        return "", status.HTTP_503_SERVICE_UNAVAILABLE


@bp_project.route("/get", methods=['POST'])
async def get():
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    project_id = post.get("id", type=str, default=None)

    if not project_id:
        return "", status.HTTP_400_BAD_REQUEST

    try:
        project_id = ObjectId(project_id)
    except Exception as e:
        print(e)
        return "", status.HTTP_400_BAD_REQUEST

    aggregation = [
        {
            "$match": {
                "_id": project_id
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
                }
            }
        },
    ]

    try:
        result = await current_app.config["partners"]["db"].aggregate_list(COLLECTION, aggregation)
    except Exception as e:
        print(e)
        return "", status.HTTP_503_SERVICE_UNAVAILABLE

    if not result:
        return {}, status.HTTP_500_INTERNAL_SERVER_ERROR

    return {
        "result": result[0]
    }, status.HTTP_200_OK


@bp_project.route("/exist_for_user", methods=['POST'])
async def exist_for_user():
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 2:
        return "", status.HTTP_400_BAD_REQUEST

    user_id = post.get("user_id", type=str, default=None)
    project_name = post.get("project_name", type=str, default=None)

    if not (user_id and project_name):
        return "", status.HTTP_400_BAD_REQUEST

    filter_q = {
        "name": project_name,
        "users": user_id
    }
    fields = {
        "_id": 0,
        "id": {
            "$toString": "$_id"
        },
    }

    try:
        result = await current_app.config["partners"]["db"].find_one(COLLECTION, filter_q, fields)
    except Exception as e:
        print(e)
        return "", status.HTTP_503_SERVICE_UNAVAILABLE

    if not result:
        return {"id": False}, status.HTTP_200_OK

    return {
        "id": result["id"]
    }, status.HTTP_200_OK


@bp_project.route("/get_proto_pages", methods=['POST'])
async def get_proto_pages():
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    project_id = post.get("project_id", type=str, default=None)

    if not project_id:
        return "", status.HTTP_400_BAD_REQUEST

    aggregation = [
        {
            "$match": {
                "_id": ObjectId(project_id)
            }
        },
        {
            "$project": {
                "_id": 0,
                "pages": 1
            }
        },
    ]

    try:
        pages = (await current_app.config["partners"]["db"].aggregate_list(COLLECTION, aggregation))[0]["pages"]
    except Exception as e:
        print(e)
        return "", status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "pages": [{"name": key, "link": value}for couple in pages for key, value in couple.items()]
    }, status.HTTP_200_OK


@bp_project.route("/search_for_user", methods=['POST'])
async def search_for_user():
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    user_id = post.get("user_id", type=str, default=None)

    if not user_id:
        return "", status.HTTP_400_BAD_REQUEST

    aggregation = [
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
                }
            }
        },
    ]

    try:
        return {
            "result": await current_app.config["partners"]["db"].aggregate_list(COLLECTION, aggregation)
        }, status.HTTP_200_OK
    except Exception as e:
        print(e)
        return "", status.HTTP_503_SERVICE_UNAVAILABLE


@bp_project.route("/update", methods=['POST'])
async def update():
    post = ImmutableMultiDict(await request.get_json())
    if not (2 <= len(post) <= 6):
        return "", status.HTTP_400_BAD_REQUEST

    id = post.get("id", type=str, default=None)
    name = post.get("name", type=str, default=None)
    add_ids = post.get("addCollabIds", type=str, default=None)
    remove_ids = post.get("removeCollabIds", type=str, default=None)
    description = post.get("description", type=str, default=None)
    deleteDescription = post.get("deleteDescription", type=bool, default=None)

    if not (id and (name or add_ids or remove_ids or description or deleteDescription)): # check if true count equals post length
        return "", status.HTTP_400_BAD_REQUEST

    try:
        id = ObjectId(id)
    except Exception as e:
        print(e)
        return "", status.HTTP_400_BAD_REQUEST

    if name:
        # verify if name does not exist for other than id
        filter_q = {
            "_id": {
                "$ne": id
            },
            "name": name
        }
        fields = {
            "_id": 0,
            "name": 1
        }

        try:
            if await current_app.config["partners"]["db"].find_one(COLLECTION, filter_q, fields):
                return {
                    "success": "already exist"
                }, status.HTTP_200_OK
        except Exception as e:
            print(e)
            return "", status.HTTP_503_SERVICE_UNAVAILABLE

    # update fields
    filter_q = {
        "_id": id
    }
    operations = []

    if name:
        operations.append(current_app.config["partners"]["db"].bulk_update_one(filter_q, {
            "$set": {
                "name": name
            }
        }))

    if add_ids:
        operations.append(current_app.config["partners"]["db"].bulk_update_one(filter_q, {
            "$addToSet": {
                "users": {
                    "$each": json.loads(add_ids)
                }
            }
        }))

    if remove_ids:
        operations.append(current_app.config["partners"]["db"].bulk_update_one(filter_q, {
            "$pullAll": {
                "users": json.loads(remove_ids)
            }
        }))

    if description:
        operations.append(current_app.config["partners"]["db"].bulk_update_one(filter_q, {
            "$set": {
                "description": description
            }
        }))

    if deleteDescription and not description:
        operations.append(current_app.config["partners"]["db"].bulk_update_one(filter_q, {
            "$set": {
                "description": ''
            }
        }))

    try:
        return {
            "success": await current_app.config["partners"]["db"].bulk_write(COLLECTION, operations)
        }, status.HTTP_200_OK
    except Exception as e:
        print(e)
        return "", status.HTTP_503_SERVICE_UNAVAILABLE


@bp_project.route("/delete", methods=['POST'])
async def delete():
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    project_id = post.get("id", type=str, default=None)

    if not project_id:
        return "", status.HTTP_400_BAD_REQUEST

    try:
        project_id = ObjectId(project_id)
    except Exception as e:
        print(e)
        return "", status.HTTP_400_BAD_REQUEST

    filter_q = {
        "_id": project_id
    }

    try:
        return {
            "success": await current_app.config["partners"]["db"].delete_one(COLLECTION, filter_q) \
                        and current_app.config["partners"]["nas"].remove_folder(project_id)
        }, status.HTTP_200_OK
    except Exception as e:
        print(e)
        return "", status.HTTP_503_SERVICE_UNAVAILABLE
