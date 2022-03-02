from quart import Blueprint, request, current_app
from flask_api import status
from bson.objectid import ObjectId

bp_account = Blueprint("account", __name__)

COLLECTION_ACCOUNTS = "accounts"
COLLECTION_PROJECTS = "projects"


def hash_password(password):
    return current_app.config["partners"]["crypt"].generate_password_hash(password).decode('utf-8')


@bp_account.route("/create", methods=['GET', 'POST'])
async def create():
    post = await request.form # request.args
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

    if await current_app.config["partners"]["db"].find_one(COLLECTION_ACCOUNTS, filter_q, fields):
        return {
            "success": "already exist"
        }, status.HTTP_200_OK

    # create user
    doc = {
        "name": username,
        "password": hash_password(password)
    }

    return {
        "success": await current_app.config["partners"]["db"].insert_one(COLLECTION_ACCOUNTS, doc)
    }, status.HTTP_200_OK


@bp_account.route("/connect", methods=['GET', 'POST'])
async def connect():
    post = await request.form # request.args
    if len(post) != 2:
        return "", status.HTTP_400_BAD_REQUEST

    username = post.get("name", type=str, default=None)
    password = post.get("password", type=str, default=None) # should have been hashed

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

    result = await current_app.config["partners"]["db"].find_one(COLLECTION_ACCOUNTS, filter_q, fields)

    if not result:
        return {"id": False}, status.HTTP_200_OK

    return {
        "id": result["id"] if current_app.config["partners"]["crypt"].check_password_hash(result["password"], password) else False
    }, status.HTTP_200_OK


@bp_account.route("/update", methods=['GET', 'POST'])
async def update():
    post = await request.form # request.args
    if not (2 <= len(post) <= 3):
        return "", status.HTTP_400_BAD_REQUEST

    user_id = post.get("id", type=str, default=None)
    username = post.get("name", type=str, default=None)
    password = post.get("password", type=str, default=None)

    if not (user_id and (username or password)):
        return "", status.HTTP_400_BAD_REQUEST

    user_id = ObjectId(user_id)

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

        if await current_app.config["partners"]["db"].find_one(COLLECTION_ACCOUNTS, filter_q, fields):
            return {
                "success": "already exist"
            }, status.HTTP_200_OK

    # update fields
    filter_q = {
        "_id": user_id
    }
    update_q = {
        "$set": {
            "name": username
        } if username else {
            "password": hash_password(password)
        }
    }

    return {
        "success": await current_app.config["partners"]["db"].update_one(COLLECTION_ACCOUNTS, filter_q, update_q)
    }, status.HTTP_200_OK


@bp_account.route("/search", methods=['GET', 'POST'])
async def search():
    post = await request.form # request.args
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    username = post.get("name", type=str, default=None)

    if not username:
        return "", status.HTTP_400_BAD_REQUEST

    filter_q = {
        "name": {
            "$regex": username,
            "$options": "i"
        }
    }
    fields = {
        "_id": 0,
        "id": {
            "$toString": "$_id"
        },
        "name": 1
    }

    return {
        "result": await current_app.config["partners"]["db"].find_list(COLLECTION_ACCOUNTS, filter_q, fields)
    }, status.HTTP_200_OK


@bp_account.route("/delete", methods=['GET', 'POST'])
async def delete():
    post = await request.form # request.args
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

    fields = {
        "_id": 0,
        "id": {
            "$toString": "$_id"
        },
    }
    for project in await current_app.config["partners"]["db"].find_list(COLLECTION_PROJECTS, filter_unique_contrib_projects, fields):
        print(project)
        current_app.config["partners"]["nas"].remove_folder(project["id"])

    return {
        "success": await current_app.config["partners"]["db"].delete_one(COLLECTION_ACCOUNTS, filter_user),
        "deleted_projects": await current_app.config["partners"]["db"].delete_many(COLLECTION_PROJECTS, filter_unique_contrib_projects),
        "deleted_from_projects": await current_app.config["partners"]["db"].update_many(COLLECTION_PROJECTS, filter_one_contrib_projects, update_one_contrib_projects)
    }, status.HTTP_200_OK
