from quart import Blueprint, json, request, current_app
from flask_api import status

bp_account = Blueprint("account", __name__)

COLLECTION = "accounts"

@bp_account.route("/create", methods=['GET', 'POST'])
async def create():
    post = request.args # (await request.form)
    if len(post) != 2:
        return "", status.HTTP_400_BAD_REQUEST

    username = post.get("username", type=str, default=None)
    password = post.get("password", type=str, default=None) # should have been hashed

    if not (username and password):
        return "pas mes args", status.HTTP_400_BAD_REQUEST

    # verify if username does not exist
    filter = {
        "username": {
            "$regex": username,
            "$options": "i"
        }
    }

    if await current_app.config["partners"]["db"].find(COLLECTION, filter):
        return {
            "result": "already exist"
        }, status.HTTP_200_OK

    # create user
    doc = {
        "username": username,
        "password": password
    }

    return {
        "success": await current_app.config["partners"]["db"].insert(COLLECTION, doc)
    }, status.HTTP_200_OK


@bp_account.route("/search", methods=['GET', 'POST'])
async def search():
    pass


@bp_account.route("/connect", methods=['GET', 'POST'])
async def connect():
    return "log to account", 200

    post = (await request.form)
    if len(post) != 2:
        return "", status.HTTP_400_BAD_REQUEST

    username = post.get("username", type=str, default=None)
    password = post.get("password", type=str, default=None) # should have been hashed

    # verify if match username and password
    query = ""

    result = current_app.config["partners"]["db"].find(COLLECTION, query)

    return {
        "result": "success/failure",
        "id": 123
    }, status.HTTP_200_OK


@bp_account.route("/update", methods=['GET', 'POST'])
async def update():
    return "update account", 200

    post = (await request.form)
    if len(post) != 3:
        return "", status.HTTP_400_BAD_REQUEST

    user_id = post.get("id", type=int, default=None)
    username = post.get("username", type=str, default=None)
    password = post.get("password", type=str, default=None) # should have been hashed

    # verify if name does not exist for other than id
    query = ""

    result = current_app.config["partners"]["db"].find(COLLECTION, query)

    if result:
        return {
            "result": "name already exist"
        }, status.HTTP_200_OK
    
    # update fields
    query = ""

    result = current_app.config["partners"]["db"].update(COLLECTION, query)

    return {
        "result": "success/failure"
    }, status.HTTP_200_OK


@bp_account.route("/delete", methods=['GET', 'POST'])
async def delete():
    return "delete account", 200

    post = (await request.form)
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    user_id = post.get("id", type=int, default=None)

    query = ""

    result = current_app.config["partners"]["db"].delete(COLLECTION, query)

    return {
        "result": "success/failure"
    }, status.HTTP_200_OK
