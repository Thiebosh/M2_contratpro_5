from quart import Blueprint, json, request, current_app
from flask_api import status

bp_account = Blueprint("account", __name__)


@bp_account.route("/create", methods=['GET', 'POST'])
async def create():
    return "create account", 200
    post = (await request.form)
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    search_index = post.get("search_index", type=str, default=None)

    return {
        "total": await current_app.config["partners"]["els"].count(index=search_index),
        "columns": await current_app.config["partners"]["els"].get_headers(index=search_index),
        "tags": await current_app.config["partners"]["els"].get_tags(index=""),
    }, status.HTTP_200_OK


@bp_account.route("/loggin", methods=['GET', 'POST'])
async def loggin():
    return "log to account", 200
    post = (await request.form)
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    search_index = post.get("search_index", type=str, default=None)

    return {
        "total": await current_app.config["partners"]["els"].count(index=search_index),
        "columns": await current_app.config["partners"]["els"].get_headers(index=search_index),
        "tags": await current_app.config["partners"]["els"].get_tags(index=""),
    }, status.HTTP_200_OK


@bp_account.route("/update", methods=['GET', 'POST'])
async def update():
    return "update account", 200
    post = (await request.form)
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    search_index = post.get("search_index", type=str, default=None)

    return {
        "total": await current_app.config["partners"]["els"].count(index=search_index),
        "columns": await current_app.config["partners"]["els"].get_headers(index=search_index),
        "tags": await current_app.config["partners"]["els"].get_tags(index=""),
    }, status.HTTP_200_OK


@bp_account.route("/delete", methods=['GET', 'POST'])
async def delete():
    return "delete account", 200
    post = (await request.form)
    if len(post) != 1:
        return "", status.HTTP_400_BAD_REQUEST

    search_index = post.get("search_index", type=str, default=None)

    return {
        "total": await current_app.config["partners"]["els"].count(index=search_index),
        "columns": await current_app.config["partners"]["els"].get_headers(index=search_index),
        "tags": await current_app.config["partners"]["els"].get_tags(index=""),
    }, status.HTTP_200_OK
