from quart import Blueprint, request, current_app
from werkzeug.datastructures import ImmutableMultiDict
from flask_api import status
from utils import Utils
from defines import *

from partners.mongo.mongo_core import MongoCore, MongoCoreException, WTimeoutError, COLLECTION_SYNTAX
from partners.mongo.mongo_queries import MongoQueries

bp_syntax = Blueprint("syntax", __name__)


@bp_syntax.route("/get", methods=['POST'])
async def get():
    # 1) ACCESS TO PARTNERS AND APPLY TYPE
    mongo_partner:MongoCore = current_app.config[PARTNERS][DB]

    # 2) RETRIEVE ARGS
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 0:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_NUMBER))
        return MSG_ARGS_INVALID_NUMBER, status.HTTP_400_BAD_REQUEST

    # 3) TEST ARGS

    # 4) USE PARTNERS WITH VALID ARGS
    current_app.logger.info(Utils.log_format(ENDPOINT_CALL))
    try:
        result = await mongo_partner.find_list(COLLECTION_SYNTAX, *MongoQueries.get_syntaxes())
    except WTimeoutError as err:
        current_app.logger.critical(Utils.log_format(MONGO_PARTNER_TIMEOUT), err)
        return MSG_MONGO_PARTNER_TIMEOUT, status.HTTP_500_INTERNAL_SERVER_ERROR
    except MongoCoreException as err:
        current_app.logger.error(Utils.log_format(MONGO_PARTNER_EXCEPTION), err)
        return MSG_MONGO_PARTNER_EXCEPTION, status.HTTP_500_INTERNAL_SERVER_ERROR

    # 5) FORMAT RESULT DATA

    # 6) SEND RESULT DATA
    if not result:
        current_app.logger.warning(Utils.log_format(NO_SYNTAX))
        return MSG_NO_SYNTAX, status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "result": result
    }, status.HTTP_200_OK
