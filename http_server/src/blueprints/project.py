from datetime import datetime
from quart import Blueprint, json, request, current_app
from flask_api import status
from bson.objectid import ObjectId

bp_project = Blueprint("project", __name__)

COLLECTION = "projects"

@bp_project.route("/create", methods=['GET', 'POST'])
async def create():
    post = request.args # await request.form
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

    if await current_app.config["partners"]["db"].find_one(COLLECTION, filter_q, fields):
        return {
            "result": "already exist"
        }, status.HTTP_200_OK

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

    return {
        "success": await current_app.config["partners"]["db"].insert_one(COLLECTION, doc),
    }, status.HTTP_200_OK


@bp_project.route("/add_user", methods=['GET', 'POST'])
async def add_user():
    post = request.args # await request.form
    if len(post) != 2:
        return "", status.HTTP_400_BAD_REQUEST

    project_id = post.get("id", type=str, default=None)
    user_id = post.get("user_id", type=str, default=None)

    if not (project_id and user_id):
        return "", status.HTTP_400_BAD_REQUEST

    filter_q = {
        "_id": ObjectId(project_id),
        "users": {
            "$ne": user_id
        }
    }
    update_q = {
        "$push": {
            "users": user_id
        }
    }

    return {
        "updated": await current_app.config["partners"]["db"].update_one(COLLECTION, filter_q, update_q)
    }, status.HTTP_200_OK


@bp_project.route("/remove_user", methods=['GET', 'POST'])
async def remove_user():
    post = request.args # await request.form
    if len(post) != 2:
        return "", status.HTTP_400_BAD_REQUEST

    project_id = post.get("id", type=str, default=None)
    user_id = post.get("user_id", type=str, default=None)

    if not (project_id and user_id):
        return "", status.HTTP_400_BAD_REQUEST

    filter_q = {
        "_id": ObjectId(project_id),
        "users": user_id
    }
    update_q = {
        "$pull": {
            "users": user_id
        }
    }

    return {
        "updated": await current_app.config["partners"]["db"].update_one(COLLECTION, filter_q, update_q)
    }, status.HTTP_200_OK


@bp_project.route("/search_by_user", methods=['GET', 'POST'])
async def search_by_user():
    post = request.args # await request.form
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    user_id = post.get("id", type=str, default=None)

    if not user_id:
        return "", status.HTTP_400_BAD_REQUEST

    filter_q = {
        "users": user_id
    }
    fields = {
        "_id": {
            "$toString": "$_id"
        },
        "name": 1,
        "users": 1,
        "creation": 1,
        "last_specs": 1,
        "last_proto": 1
    }

    return {
        "result": await current_app.config["partners"]["db"].find_list(COLLECTION, filter_q, fields)
    }, status.HTTP_200_OK


@bp_project.route("/delete", methods=['GET', 'POST'])
async def delete():
    post = request.args # await request.form
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    project_id = post.get("id", type=str, default=None)

    if not project_id:
        return "", status.HTTP_400_BAD_REQUEST

    filter_q = {
        "_id": ObjectId(project_id)
    }

    return {
        "deleted": await current_app.config["partners"]["db"].delete_one(COLLECTION, filter_q)
    }, status.HTTP_200_OK
