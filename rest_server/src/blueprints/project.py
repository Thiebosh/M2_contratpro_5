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
        "creation": datetime.utcnow(),
        "last_specs": None,
        "last_proto": None,
        "specs": { "root": {} },
        "session": {}
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
                "last_proto": 1
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


@bp_project.route("/update", methods=['POST'])
async def update():
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 2:
        return "", status.HTTP_400_BAD_REQUEST

    project_id = post.get("id", type=str, default=None)
    project_name = post.get("name", type=str, default=None)

    if not (project_id and project_name):
        return "", status.HTTP_400_BAD_REQUEST

    try:
        project_id = ObjectId(project_id)
    except Exception as e:
        print(e)
        return "", status.HTTP_400_BAD_REQUEST

    # verify if name does not exist for other than id
    filter_q = {
        "_id": {
            "$ne": project_id
        },
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

    # update fields
    filter_q = {
        "_id": project_id
    }
    update_q = {
        "$set": {
            "name": project_name
        }
    }

    try:
        return {
            "success": await current_app.config["partners"]["db"].update_one(COLLECTION, filter_q, update_q)
        }, status.HTTP_200_OK
    except Exception as e:
        print(e)
        return "", status.HTTP_503_SERVICE_UNAVAILABLE


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
                "last_proto": 1
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


@bp_project.route("/add_user", methods=['POST'])
async def add_user():
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 2:
        return "", status.HTTP_400_BAD_REQUEST

    project_id = post.get("id", type=str, default=None)
    user_id = post.get("user_id", type=str, default=None)

    if not (project_id and user_id):
        return "", status.HTTP_400_BAD_REQUEST

    try:
        project_id = ObjectId(project_id)
    except Exception as e:
        print(e)
        return "", status.HTTP_400_BAD_REQUEST

    filter_q = {
        "_id": project_id,
        "users": {
            "$ne": user_id
        }
    }
    update_q = {
        "$push": {
            "users": user_id
        }
    }

    try:
        return {
            "success": await current_app.config["partners"]["db"].update_one(COLLECTION, filter_q, update_q)
        }, status.HTTP_200_OK
    except Exception as e:
        print(e)
        return "", status.HTTP_503_SERVICE_UNAVAILABLE


@bp_project.route("/remove_user", methods=['POST'])
async def remove_user():
    post = ImmutableMultiDict(await request.get_json()) 
    if len(post) != 2:
        return "", status.HTTP_400_BAD_REQUEST

    project_id = post.get("id", type=str, default=None)
    user_id = post.get("user_id", type=str, default=None)

    if not (project_id and user_id):
        return "", status.HTTP_400_BAD_REQUEST

    try:
        project_id = ObjectId(project_id)
    except Exception as e:
        print(e)
        return "", status.HTTP_400_BAD_REQUEST

    filter_q = {
        "_id": project_id,
        "users": user_id
    }
    update_q = {
        "$pull": {
            "users": user_id
        }
    }

    try:
        return {
            "success": await current_app.config["partners"]["db"].update_one(COLLECTION, filter_q, update_q)
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
