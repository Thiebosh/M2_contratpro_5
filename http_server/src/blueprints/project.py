from quart import Blueprint, json, request, current_app
from flask_api import status

bp_project = Blueprint("project", __name__)


@bp_project.route("/create", methods=['GET', 'POST'])
async def create():
    return "create project", 200
    post = (await request.form)
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    search_index = post.get("search_index", type=str, default=None)

    return {
        "total": await current_app.config["partners"]["els"].count(index=search_index),
        "columns": await current_app.config["partners"]["els"].get_headers(index=search_index),
        "tags": await current_app.config["partners"]["els"].get_tags(index=""),
    }, status.HTTP_200_OK


@bp_project.route("/loggin", methods=['GET', 'POST'])
async def loggin():
    return "log to project", 200
    post = (await request.form)
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    search_index = post.get("search_index", type=str, default=None)

    return {
        "total": await current_app.config["partners"]["els"].count(index=search_index),
        "columns": await current_app.config["partners"]["els"].get_headers(index=search_index),
        "tags": await current_app.config["partners"]["els"].get_tags(index=""),
    }, status.HTTP_200_OK


@bp_project.route("/update", methods=['GET', 'POST'])
async def update():
    return "update project", 200
    post = (await request.form)
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    search_index = post.get("search_index", type=str, default=None)

    return {
        "total": await current_app.config["partners"]["els"].count(index=search_index),
        "columns": await current_app.config["partners"]["els"].get_headers(index=search_index),
        "tags": await current_app.config["partners"]["els"].get_tags(index=""),
    }, status.HTTP_200_OK


@bp_project.route("/delete", methods=['GET', 'POST'])
async def delete():
    return "delete project", 200
    post = (await request.form)
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    search_index = post.get("search_index", type=str, default=None)

    return {
        "total": await current_app.config["partners"]["els"].count(index=search_index),
        "columns": await current_app.config["partners"]["els"].get_headers(index=search_index),
        "tags": await current_app.config["partners"]["els"].get_tags(index=""),
    }, status.HTTP_200_OK
