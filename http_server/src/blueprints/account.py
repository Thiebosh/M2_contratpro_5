from quart import Blueprint, json, request, current_app
from flask_api import status

bp_account = Blueprint("account", __name__)

COLLECTION = "accounts"

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

    if await current_app.config["partners"]["db"].find_one(COLLECTION, filter, fields):
        return {
            "result": "already exist"
        }, status.HTTP_200_OK

    # create user
    doc = {
        "name": username,
        "password": current_app.config["partners"]["crypt"].generate_password_hash(password).decode('utf-8')
    }

    return {
        "success": await current_app.config["partners"]["db"].insert_one(COLLECTION, doc)
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
        "result": await current_app.config["partners"]["db"].find_list(COLLECTION, filter, fields)
    }, status.HTTP_200_OK


@bp_account.route("/connect", methods=['GET', 'POST'])
async def connect():
    post = request.args # await request.form
    if len(post) != 2:
        return "", status.HTTP_400_BAD_REQUEST

    username = post.get("name", type=str, default=None)
    password = post.get("password", type=str, default=None) # should have been hashed

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

    result = await current_app.config["partners"]["db"].find_one(COLLECTION, filter, fields)

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

    result = current_app.config["partners"]["db"].find_one(COLLECTION, query)

    if result:
        return {
            "result": "name already exist"
        }, status.HTTP_200_OK
    
    # update fields
    query = ""

    result = current_app.config["partners"]["db"].update_one(COLLECTION, query)

    return {
        "result": "success/failure"
    }, status.HTTP_200_OK


@bp_account.route("/delete", methods=['GET', 'POST'])
async def delete():
    return "delete account", 200

    post = await request.form
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    user_id = post.get("id", type=int, default=None)

    query = ""

    result = current_app.config["partners"]["db"].delete_one(COLLECTION, query)

    return {
        "result": "success/failure"
    }, status.HTTP_200_OK
