from quart import Blueprint, json, request, current_app
from flask_api import status
from bson.objectid import ObjectId
from werkzeug.datastructures import ImmutableMultiDict

bp_account = Blueprint("account", __name__)

COLLECTION_ACCOUNTS = "accounts"
COLLECTION_PROJECTS = "projects"


def hash_password(password):
    return current_app.config["partners"]["crypt"].generate_password_hash(password).decode('utf-8')


@bp_account.route("/create", methods=['POST'])
async def create():
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 2:
        return "", status.HTTP_400_BAD_REQUEST

    username = post.get("name", type=str, default=None)
    password = post.get("password", type=str, default=None)

    if not (username and password):
        return "", status.HTTP_400_BAD_REQUEST

    # verify if username does not exist
    filter_q = {
        "name": username
    }
    fields = {
        "_id": 0,
        "name": 1
    }

    try:
        if await current_app.config["partners"]["db"].find_one(COLLECTION_ACCOUNTS, filter_q, fields):
            return {
                "success": "already exist"
            }, status.HTTP_200_OK
    except Exception as e:
        print(e)
        return "", status.HTTP_503_SERVICE_UNAVAILABLE

    # create user
    doc = {
        "name": username,
        "password": hash_password(password)
    }

    try:
        return {
            "success": await current_app.config["partners"]["db"].insert_one(COLLECTION_ACCOUNTS, doc)
        }, status.HTTP_200_OK
    except Exception as e:
        print(e)
        return "", status.HTTP_503_SERVICE_UNAVAILABLE


@bp_account.route("/connect", methods=['POST'])
async def connect():
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 2:
        return "", status.HTTP_400_BAD_REQUEST

    username = post.get("name", type=str, default=None)
    password = post.get("password", type=str, default=None) # should have not been hashed

    if not (username and password):
        return "", status.HTTP_400_BAD_REQUEST

    # verify if match username and password
    filter_q = {
        "name": username,
    }
    fields = {
        "_id": 0,
        "id": {
            "$toString": "$_id"
        },
        "password": 1
    }

    try:
        result = await current_app.config["partners"]["db"].find_one(COLLECTION_ACCOUNTS, filter_q, fields)
    except Exception as e:
        print(e)
        return "", status.HTTP_503_SERVICE_UNAVAILABLE

    if not result:
        return {"id": False}, status.HTTP_200_OK

    return {
        "id": result["id"] if current_app.config["partners"]["crypt"].check_password_hash(result["password"], password) else False
    }, status.HTTP_200_OK


@bp_account.route("/get", methods=['POST'])
async def get():
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    user_id = post.get("id", type=str, default=None)

    if not user_id:
        return "", status.HTTP_400_BAD_REQUEST
    
    count_filter_q = {
        "users": user_id
    }

    try:
        user_id = ObjectId(user_id)
    except Exception as e:
        print(e)
        return "", status.HTTP_400_BAD_REQUEST

    find_filter_q = {
        "_id": user_id,
    }
    find_fields = {
        "_id": 0,
        "name": 1
    }

    try:
        result = await current_app.config["partners"]["db"].find_one(COLLECTION_ACCOUNTS, find_filter_q, find_fields)
        count = await current_app.config["partners"]["db"].count(COLLECTION_PROJECTS, count_filter_q)
    except Exception as e:
        print(e)
        return "", status.HTTP_503_SERVICE_UNAVAILABLE

    if not result:
        return {}, status.HTTP_500_INTERNAL_SERVER_ERROR

    return {
        "name": result["name"],
        "nbProjects": count,
    }, status.HTTP_200_OK


@bp_account.route("/update", methods=['POST'])
async def update():
    post = ImmutableMultiDict(await request.get_json())
    if not (2 <= len(post) <= 3):
        return "", status.HTTP_400_BAD_REQUEST

    user_id = post.get("id", type=str, default=None)
    username = post.get("name", type=str, default=None)
    password = post.get("password", type=str, default=None)

    if not (user_id and (username or password)): # check if true count equals post length
        return "", status.HTTP_400_BAD_REQUEST

    try:
        user_id = ObjectId(user_id)
    except Exception as e:
        print(e)
        return "", status.HTTP_400_BAD_REQUEST

    if username:
        # verify if name does not exist for other than id
        filter_q = {
            "_id": {
                "$ne": user_id
            },
            "name": username
        }
        fields = {
            "_id": 0,
            "name": 1
        }

        try:
            if await current_app.config["partners"]["db"].find_one(COLLECTION_ACCOUNTS, filter_q, fields):
                return {
                    "success": "already exist"
                }, status.HTTP_200_OK
        except Exception as e:
            print(e)
            return "", status.HTTP_503_SERVICE_UNAVAILABLE

    # update fields
    filter_q = {
        "_id": user_id
    }
    update_q = {"$set": {}}
    if username:
        update_q["$set"]["name"] = username
    if password:
        update_q["$set"]["password"] = hash_password(password)

    try:
        return {
            "success": await current_app.config["partners"]["db"].update_one(COLLECTION_ACCOUNTS, filter_q, update_q)
        }, status.HTTP_200_OK
    except Exception as e:
        print(e)
        return "", status.HTTP_503_SERVICE_UNAVAILABLE


@bp_account.route("/search", methods=['POST'])
async def search():
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 3:
        return "", status.HTTP_400_BAD_REQUEST

    username = post.get("name", type=str, default=None)
    limit = post.get("limit", type=int, default=None)
    excluded_users = post.get("excluded_users", type=str, default=None)

    if not (username and limit and excluded_users):
        return "", status.HTTP_400_BAD_REQUEST

    aggregation = [
        {
            "$match": {
                "_id": {
                    "$nin": [ObjectId(user) for user in json.loads(excluded_users)]
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

    try:
        return {
            "result": await current_app.config["partners"]["db"].aggregate_list(COLLECTION_ACCOUNTS, aggregation)
        }, status.HTTP_200_OK
    except Exception as e:
        print(e)
        return "", status.HTTP_503_SERVICE_UNAVAILABLE


@bp_account.route("/delete", methods=['POST'])
async def delete():
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    user_id = post.get("id", type=str, default=None)

    if not user_id:
        return "", status.HTTP_400_BAD_REQUEST

    try:
        user_id = ObjectId(user_id)
    except Exception as e:
        print(e)
        return "", status.HTTP_400_BAD_REQUEST

    filter_user = {
        "_id": user_id
    }
    filter_unique_contrib_projects = {
        "users": [user_id]
    }
    filter_one_contrib_projects = {}
    update_one_contrib_projects = {
        "$pull": {
            "users": user_id
        }
    }

    fields = {
        "_id": 0,
        "id": {
            "$toString": "$_id"
        },
    }
    try:
        for project in await current_app.config["partners"]["db"].find_list(COLLECTION_PROJECTS, filter_unique_contrib_projects, fields):
            current_app.config["partners"]["nas"].remove_folder(project["id"])

        return {
            "success": await current_app.config["partners"]["db"].delete_one(COLLECTION_ACCOUNTS, filter_user),
            "deleted_projects": await current_app.config["partners"]["db"].delete_many(COLLECTION_PROJECTS, filter_unique_contrib_projects),
            "deleted_from_projects": await current_app.config["partners"]["db"].update_many(COLLECTION_PROJECTS, filter_one_contrib_projects, update_one_contrib_projects)
        }, status.HTTP_200_OK
    except Exception as e:
        print(e)
        return "", status.HTTP_503_SERVICE_UNAVAILABLE
