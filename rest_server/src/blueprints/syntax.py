from quart import Blueprint, request, current_app
from flask_api import status
from werkzeug.datastructures import ImmutableMultiDict

bp_syntax = Blueprint("syntax", __name__)

COLLECTION = "syntax"

@bp_syntax.route("/get", methods=['POST'])
async def get():
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 0:
        return "", status.HTTP_400_BAD_REQUEST

    filter_q = {}
    fields = {
        "_id": 0,
        "id": {
            "$toString": "$_id"
        },
        "name": 1,
        "description": 1,
    }
    try:
        result = await current_app.config["partners"]["db"].find_list(COLLECTION, filter_q, fields)
    except Exception as e:
        print(e)
        return "", status.HTTP_503_SERVICE_UNAVAILABLE

    if not result:
        return {}, status.HTTP_500_INTERNAL_SERVER_ERROR

    return {
        "result": result
    }, status.HTTP_200_OK
