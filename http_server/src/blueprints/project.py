from quart import Blueprint, json, request, current_app
from flask_api import status
from datetime import datetime

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
    filter = {
        "name": project_name
    }
    fields = {
        "_id": 0,
        "name": 1
    }

    if await current_app.config["partners"]["db"].find_one(COLLECTION, filter, fields):
        return {
            "result": "already exist"
        }, status.HTTP_200_OK

    # create project
    users_id = json.loads(users_id)
    needs = { "root": {} }

    query = {
        "name": project_name,
        "users": users_id,
        "creation": datetime.utcnow(),
        "last_specs": None,
        "last_proto": None,
        "specs": needs,
        "session": {}
    }

    return {
        "success": await current_app.config["partners"]["db"].insert_one(COLLECTION, query),
    }, status.HTTP_200_OK


@bp_project.route("/search", methods=['GET', 'POST'])
async def search():
    post = request.args # await request.form
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    project_name = post.get("name", type=str, default=None)

    if not project_name:
        return "", status.HTTP_400_BAD_REQUEST

    # verify if project_name exist
    filter = {
        "name": {
            "$regex": project_name,
            "$options": "i"
        }
    }
    fields = {
        "_id": {
            "$toString": "$_id" # $toObjectId: "$_id" for reverse operation
        },
        "name": 1,
        "users": 1,
        "creation": 1,
        "last_specs": 1,
        "last_proto": 1
    }

    return {
        "result": await current_app.config["partners"]["db"].find_list(COLLECTION, filter, fields)
    }, status.HTTP_200_OK


@bp_project.route("/connect", methods=['GET', 'POST'])
async def connect():
    return "log to project", 200

    post = await request.form
    if len(post) != 2:
        return "", status.HTTP_400_BAD_REQUEST

    user_id = post.get("user_id", type=str, default=None)
    project = post.get("project", type=str, default=None)

    # verify if name exist and if user have rights on it
    query = ""

    result = current_app.config["partners"]["db"].find_one(COLLECTION, query)

    return {
        "result": "success/failure",
        "account": "json"
    }, status.HTTP_200_OK


@bp_project.route("/update", methods=['GET', 'POST'])
async def update():
    return "update project", 200

    post = await request.form
    if len(post) != 3:
        return "", status.HTTP_400_BAD_REQUEST

    project_id = post.get("id", type=int, default=None)
    project_name = post.get("project", type=str, default=None)
    users_id = post.get("users_id", type=str, default=None) # convert to json

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


@bp_project.route("/delete", methods=['GET', 'POST'])
async def delete():
    return "delete project", 200

    post = await request.form
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    user_id = post.get("id", type=int, default=None)

    query = ""

    result = current_app.config["partners"]["db"].delete_one(COLLECTION, query)

    return {
        "result": "success/failure"
    }, status.HTTP_200_OK
