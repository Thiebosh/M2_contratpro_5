from unittest import result
from quart import Blueprint, json, request, current_app
from flask_api import status
from bson.objectid import ObjectId

bp_account = Blueprint("account", __name__)

COLLECTION_ACCOUNTS = "accounts"
COLLECTION_PROJECTS = "projects"

@bp_account.route("/create", methods=['GET', 'POST'])
async def create():
    post = request.args # await request.form
    if len(post) != 2:
        return "", status.HTTP_400_BAD_REQUEST

    username = post.get("name", type=str, default=None)
    password = post.get("password", type=str, default=None)

    if not (username and password):
        return "", status.HTTP_400_BAD_REQUEST

    # verify if username does not exist
    filter = {
        "name": username
    }
    fields = {
        "_id": 0,
        "name": 1
    }

    if await current_app.config["partners"]["db"].find_one(COLLECTION_ACCOUNTS, filter, fields):
        return {
            "result": "already exist"
        }, status.HTTP_200_OK

    # create user
    doc = {
        "name": username,
        "password": current_app.config["partners"]["crypt"].generate_password_hash(password).decode('utf-8')
    }

    return {
        "success": await current_app.config["partners"]["db"].insert_one(COLLECTION_ACCOUNTS, doc)
    }, status.HTTP_200_OK


@bp_account.route("/connect", methods=['GET', 'POST'])
async def connect():
    post = request.args # await request.form
    if len(post) != 2:
        return "", status.HTTP_400_BAD_REQUEST

    username = post.get("name", type=str, default=None)
    password = post.get("password", type=str, default=None) # should have been hashed

    if not (username and password):
        return "", status.HTTP_400_BAD_REQUEST

    # verify if match username and password
    filter = {
        "name": username,
    }
    fields = {
        "_id": {
            "$toString": "$_id" # $toObjectId: "$_id" for reverse operation
        },
        "password": 1
    }

    result = await current_app.config["partners"]["db"].find_one(COLLECTION_ACCOUNTS, filter, fields)

    response = {
        "result": current_app.config["partners"]["crypt"].check_password_hash(result["password"], password)
    }
    if response["result"]:
        response["id"] = result["_id"]

    return response, status.HTTP_200_OK


@bp_account.route("/update", methods=['GET', 'POST'])
async def update():
    return "update account", 200

    post = await request.form
    if len(post) != 3:
        return "", status.HTTP_400_BAD_REQUEST

    user_id = post.get("id", type=int, default=None)
    username = post.get("name", type=str, default=None)
    password = post.get("password", type=str, default=None) # should have been hashed

    # verify if name does not exist for other than id
    query = ""

    result = current_app.config["partners"]["db"].find_one(COLLECTION_ACCOUNTS, query)

    if result:
        return {
            "result": "name already exist"
        }, status.HTTP_200_OK
    
    # update fields
    query = ""

    result = current_app.config["partners"]["db"].update_one(COLLECTION_ACCOUNTS, query)

    return {
        "result": "success/failure"
    }, status.HTTP_200_OK


@bp_account.route("/delete", methods=['GET', 'POST'])
async def delete():
    post = request.args # await request.form
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    user_id = post.get("id", type=str, default=None)

    if not user_id:
        return "", status.HTTP_400_BAD_REQUEST

    filter_user = {
        "_id": ObjectId(user_id)
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

    return {
        "deleted_user": await current_app.config["partners"]["db"].delete_one(COLLECTION_ACCOUNTS, filter_user),
        "deleted_projects": await current_app.config["partners"]["db"].delete_many(COLLECTION_PROJECTS, filter_unique_contrib_projects),
        "deleted_from_projects": await current_app.config["partners"]["db"].update_many(COLLECTION_PROJECTS, filter_one_contrib_projects, update_one_contrib_projects)
    }, status.HTTP_200_OK


@bp_account.route("/search", methods=['GET', 'POST'])
async def search():
    post = request.args # await request.form
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    username = post.get("name", type=str, default=None)

    if not username:
        return "", status.HTTP_400_BAD_REQUEST

    # verify if username exist
    filter = {
        "name": {
            "$regex": username,
            "$options": "i"
        }
    }
    fields = {
        "_id": {
            "$toString": "$_id" # $toObjectId: "$_id" for reverse operation
        },
        "name": 1
    }

    return {
        "result": await current_app.config["partners"]["db"].find_list(COLLECTION_ACCOUNTS, filter, fields)
    }, status.HTTP_200_OK
