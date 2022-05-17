from quart import Blueprint, request, current_app
from werkzeug.datastructures import ImmutableMultiDict
from flask_api import status
from simple_bcrypt import Bcrypt
from utils import Utils
from defines import *

from partners.mongo.mongo_core import MongoCore, MongoCoreException, WTimeoutError, WriteException, COLLECTION_ACCOUNTS, COLLECTION_PROJECTS
from partners.mongo.mongo_queries import MongoQueries
from partners.drive.drive_core import DriveCore, DriveCoreException, ExecutionException, MultipleIdsException

bp_account = Blueprint("account", __name__)


@bp_account.route("/create", methods=['POST'])
async def create():
    # 1) ACCESS TO PARTNERS AND APPLY TYPE
    mongo_partner:MongoCore = current_app.config[PARTNERS][DB]
    cryp_partner:Bcrypt = current_app.config[PARTNERS][CRYPT]

    # 2) RETRIEVE ARGS
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 2:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_NUMBER))
        return MSG_ARGS_INVALID_NUMBER, status.HTTP_400_BAD_REQUEST

    username = post.get("name", type=str, default=None)
    password = post.get("password", type=str, default=None)

    # 3) TEST ARGS
    if not (username and password):
        current_app.logger.info(Utils.log_format(ARGS_INVALID_PARSE))
        return MSG_ARGS_INVALID_PARSE, status.HTTP_400_BAD_REQUEST

    # 4) USE PARTNERS WITH VALID ARGS
    current_app.logger.info(Utils.log_format(ENDPOINT_CALL))
    try:
        already_exist = await mongo_partner.find_one(COLLECTION_ACCOUNTS, *MongoQueries.exist_user(username))

        if not already_exist:
            result = await mongo_partner.insert_one(COLLECTION_ACCOUNTS, MongoQueries.create_user(username, Utils.encrypt_password(cryp_partner, password)))
    except WriteException as err:
        current_app.logger.error(Utils.log_format(MONGO_PARTNER_WRITE_ERROR), err)
        return MSG_MONGO_PARTNER_WRITE_ERROR, status.HTTP_500_INTERNAL_SERVER_ERROR
    except WTimeoutError as err:
        current_app.logger.critical(Utils.log_format(MONGO_PARTNER_TIMEOUT), err)
        return MSG_MONGO_PARTNER_TIMEOUT, status.HTTP_500_INTERNAL_SERVER_ERROR
    except MongoCoreException as err:
        current_app.logger.error(Utils.log_format(MONGO_PARTNER_EXCEPTION), err)
        return MSG_MONGO_PARTNER_EXCEPTION, status.HTTP_500_INTERNAL_SERVER_ERROR

    # 5) FORMAT RESULT DATA

    # 6) SEND RESULT DATA
    if already_exist:
        return MSG_ALREADY_EXIST, status.HTTP_200_OK

    return {
        "success": result
    }, status.HTTP_200_OK


@bp_account.route("/connect", methods=['POST'])
async def connect():
    # 1) ACCESS TO PARTNERS AND APPLY TYPE
    mongo_partner:MongoCore = current_app.config[PARTNERS][DB]
    cryp_partner:Bcrypt = current_app.config[PARTNERS][CRYPT]

    # 2) RETRIEVE ARGS
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 2:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_NUMBER))
        return MSG_ARGS_INVALID_NUMBER, status.HTTP_400_BAD_REQUEST

    username = post.get("name", type=str, default=None)
    password = post.get("password", type=str, default=None) # should have not been hashed

    # 3) TEST ARGS
    if not (username and password):
        current_app.logger.info(Utils.log_format(ARGS_INVALID_PARSE))
        return MSG_ARGS_INVALID_PARSE, status.HTTP_400_BAD_REQUEST

    # 4) USE PARTNERS WITH VALID ARGS
    current_app.logger.info(Utils.log_format(ENDPOINT_CALL))
    try:
        result = await mongo_partner.find_one(COLLECTION_ACCOUNTS, *MongoQueries.get_user_id_password(username))
    except WTimeoutError as err:
        current_app.logger.critical(Utils.log_format(MONGO_PARTNER_TIMEOUT), err)
        return MSG_MONGO_PARTNER_TIMEOUT, status.HTTP_500_INTERNAL_SERVER_ERROR
    except MongoCoreException as err:
        current_app.logger.error(Utils.log_format(MONGO_PARTNER_EXCEPTION), err)
        return MSG_MONGO_PARTNER_EXCEPTION, status.HTTP_500_INTERNAL_SERVER_ERROR

    # 5) FORMAT RESULT DATA

    # 6) SEND RESULT DATA
    if not result:
        return {"id": False}, status.HTTP_200_OK

    return {
        "id": result["id"] if cryp_partner.check_password_hash(result["password"], password) else False
    }, status.HTTP_200_OK


@bp_account.route("/get", methods=['POST'])
async def get():
    # 1) ACCESS TO PARTNERS AND APPLY TYPE
    mongo_partner:MongoCore = current_app.config[PARTNERS][DB]

    # 2) RETRIEVE ARGS
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 1:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_NUMBER))
        return MSG_ARGS_INVALID_NUMBER, status.HTTP_400_BAD_REQUEST

    user_id = post.get("id", type=str, default=None)

    # 3) TEST ARGS
    if not user_id:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_PARSE))
        return MSG_ARGS_INVALID_PARSE, status.HTTP_400_BAD_REQUEST

    user_objectId = MongoQueries.to_objectId(user_id)
    if not user_objectId:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_OBJECT_ID))
        return MSG_ARGS_INVALID_OBJECT_ID, status.HTTP_400_BAD_REQUEST

    # 4) USE PARTNERS WITH VALID ARGS
    current_app.logger.info(Utils.log_format(ENDPOINT_CALL))
    try:
        result = await mongo_partner.find_one(COLLECTION_ACCOUNTS, *MongoQueries.get_user_name(user_objectId))
        count = await mongo_partner.count(COLLECTION_PROJECTS, MongoQueries.count_user_projects(user_id))
    except WTimeoutError as err:
        current_app.logger.critical(Utils.log_format(MONGO_PARTNER_TIMEOUT), err)
        return MSG_MONGO_PARTNER_TIMEOUT, status.HTTP_500_INTERNAL_SERVER_ERROR
    except MongoCoreException as err:
        current_app.logger.error(Utils.log_format(MONGO_PARTNER_EXCEPTION), err)
        return MSG_MONGO_PARTNER_EXCEPTION, status.HTTP_500_INTERNAL_SERVER_ERROR

    # 5) FORMAT RESULT DATA

    # 6) SEND RESULT DATA
    if not result:
        current_app.logger.warning(Utils.log_format(NO_ACCOUNT), user_id)
        return MSG_NO_ACCOUNT, status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "name": result["name"],
        "nbProjects": count,
    }, status.HTTP_200_OK


@bp_account.route("/update", methods=['POST'])
async def update():
    # 1) ACCESS TO PARTNERS AND APPLY TYPE
    mongo_partner:MongoCore = current_app.config[PARTNERS][DB]
    cryp_partner:Bcrypt = current_app.config[PARTNERS][CRYPT]

    # 2) RETRIEVE ARGS
    post = ImmutableMultiDict(await request.get_json())
    if not (2 <= len(post) <= 3):
        current_app.logger.info(Utils.log_format(ARGS_INVALID_NUMBER))
        return MSG_ARGS_INVALID_NUMBER, status.HTTP_400_BAD_REQUEST

    user_id = post.get("id", type=str, default=None)
    username = post.get("name", type=str, default=None)
    password = post.get("password", type=str, default=None)

    # 3) TEST ARGS
    if not (user_id and (username or password)):
        current_app.logger.info(Utils.log_format(ARGS_INVALID_PARSE))
        return MSG_ARGS_INVALID_PARSE, status.HTTP_400_BAD_REQUEST

    user_objectId = MongoQueries.to_objectId(user_id)
    if not user_objectId:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_OBJECT_ID))
        return MSG_ARGS_INVALID_OBJECT_ID, status.HTTP_400_BAD_REQUEST

    password = Utils.encrypt_password(cryp_partner, password) if password else None

    # 4) USE PARTNERS WITH VALID ARGS
    current_app.logger.info(Utils.log_format(ENDPOINT_CALL))
    if username:
        try:
            result = await mongo_partner.find_one(COLLECTION_ACCOUNTS, *MongoQueries.exist_user_not_id(user_objectId, username))
        except WTimeoutError as err:
            current_app.logger.critical(Utils.log_format(MONGO_PARTNER_TIMEOUT), err)
            return MSG_MONGO_PARTNER_TIMEOUT, status.HTTP_500_INTERNAL_SERVER_ERROR
        except MongoCoreException as err:
            current_app.logger.error(Utils.log_format(MONGO_PARTNER_EXCEPTION), err)
            return MSG_MONGO_PARTNER_EXCEPTION, status.HTTP_500_INTERNAL_SERVER_ERROR

        if result:
            return MSG_ALREADY_EXIST, status.HTTP_200_OK

    try:
        result = await mongo_partner.update_one(COLLECTION_ACCOUNTS, *MongoQueries.update_user(user_objectId, username, password))
    except WriteException as err:
        current_app.logger.error(Utils.log_format(MONGO_PARTNER_WRITE_ERROR), err)
        return MSG_MONGO_PARTNER_WRITE_ERROR, status.HTTP_500_INTERNAL_SERVER_ERROR
    except WTimeoutError as err:
        current_app.logger.critical(Utils.log_format(MONGO_PARTNER_TIMEOUT), err)
        return MSG_MONGO_PARTNER_TIMEOUT, status.HTTP_500_INTERNAL_SERVER_ERROR
    except MongoCoreException as err:
        current_app.logger.error(Utils.log_format(MONGO_PARTNER_EXCEPTION), err)
        return MSG_MONGO_PARTNER_EXCEPTION, status.HTTP_500_INTERNAL_SERVER_ERROR

    # 5) FORMAT RESULT DATA

    # 6) SEND RESULT DATA
    return {
        "success": result
    }, status.HTTP_200_OK


@bp_account.route("/search", methods=['POST'])
async def search():
    # 1) ACCESS TO PARTNERS AND APPLY TYPE
    mongo_partner:MongoCore = current_app.config[PARTNERS][DB]

    # 2) RETRIEVE ARGS
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 3:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_NUMBER))
        return MSG_ARGS_INVALID_NUMBER, status.HTTP_400_BAD_REQUEST

    username = post.get("name", type=str, default=None)
    limit = post.get("limit", type=int, default=None)
    is_excluded_users_json, excluded_users = Utils.get_json(post.get('excluded_users', type=str, default=None))

    # 3) TEST ARGS
    if not (username and limit and is_excluded_users_json):
        current_app.logger.info(Utils.log_format(ARGS_INVALID_PARSE))
        return MSG_ARGS_INVALID_PARSE, status.HTTP_400_BAD_REQUEST

    if excluded_users is None:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_JSON))
        return MSG_ARGS_INVALID_JSON, status.HTTP_400_BAD_REQUEST

    excluded_users_ids = [MongoQueries.to_objectId(user) for user in excluded_users]
    if False in excluded_users_ids:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_OBJECT_ID))
        return MSG_ARGS_INVALID_OBJECT_ID, status.HTTP_400_BAD_REQUEST

    # 4) USE PARTNERS WITH VALID ARGS
    current_app.logger.info(Utils.log_format(ENDPOINT_CALL))
    try:
        result = await mongo_partner.aggregate_list(COLLECTION_ACCOUNTS, MongoQueries.search_account(excluded_users_ids, username, limit))
    except WTimeoutError as err:
        current_app.logger.critical(Utils.log_format(MONGO_PARTNER_TIMEOUT), err)
        return MSG_MONGO_PARTNER_TIMEOUT, status.HTTP_500_INTERNAL_SERVER_ERROR
    except MongoCoreException as err:
        current_app.logger.error(Utils.log_format(MONGO_PARTNER_EXCEPTION), err)
        return MSG_MONGO_PARTNER_EXCEPTION, status.HTTP_500_INTERNAL_SERVER_ERROR

    # 5) FORMAT RESULT DATA

    # 6) SEND RESULT DATA
    return {
        "result": result
    }, status.HTTP_200_OK


@bp_account.route("/delete", methods=['POST'])
async def delete():
    # 1) ACCESS TO PARTNERS AND APPLY TYPE
    mongo_partner:MongoCore = current_app.config[PARTNERS][DB]
    drive_partner:DriveCore = current_app.config[PARTNERS][NAS]

    # 2) RETRIEVE ARGS
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 1:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_NUMBER))
        return MSG_ARGS_INVALID_NUMBER, status.HTTP_400_BAD_REQUEST

    user_id = post.get("id", type=str, default=None)

    # 3) TEST ARGS
    if not user_id:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_PARSE))
        return MSG_ARGS_INVALID_PARSE, status.HTTP_400_BAD_REQUEST

    user_objectId = MongoQueries.to_objectId(user_id)
    if not user_objectId:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_OBJECT_ID))
        return MSG_ARGS_INVALID_OBJECT_ID, status.HTTP_400_BAD_REQUEST

    # 4) USE PARTNERS WITH VALID ARGS
    current_app.logger.info(Utils.log_format(ENDPOINT_CALL))
    try:
        projectList = await mongo_partner.find_list(COLLECTION_PROJECTS, *MongoQueries.get_unique_contrib_projects(user_objectId))

        success = await mongo_partner.delete_one(COLLECTION_ACCOUNTS, MongoQueries.filter_user(user_objectId))
        deleted_projects = await mongo_partner.delete_many(COLLECTION_PROJECTS, MongoQueries.filter_unique_contrib_projects(user_objectId))
        deleted_from_projects = await mongo_partner.update_many(COLLECTION_PROJECTS, *MongoQueries.delete_one_contrib_projects(user_objectId))
    except WriteException as err:
        current_app.logger.error(Utils.log_format(MONGO_PARTNER_WRITE_ERROR), err)
        return MSG_MONGO_PARTNER_WRITE_ERROR, status.HTTP_500_INTERNAL_SERVER_ERROR
    except WTimeoutError as err:
        current_app.logger.critical(Utils.log_format(MONGO_PARTNER_TIMEOUT), err)
        return MSG_MONGO_PARTNER_TIMEOUT, status.HTTP_500_INTERNAL_SERVER_ERROR
    except MongoCoreException as err:
        current_app.logger.error(Utils.log_format(MONGO_PARTNER_EXCEPTION), err)
        return MSG_MONGO_PARTNER_EXCEPTION, status.HTTP_500_INTERNAL_SERVER_ERROR

    try:
        for project in projectList:
            drive_partner.remove_folder(project["id"])
    except MultipleIdsException as err:
        current_app.logger.critical(Utils.log_format(DRIVE_PARTNER_MULTIPLE_IDS), err)
        return MSG_DRIVE_PARTNER_MULTIPLE_IDS, status.HTTP_500_INTERNAL_SERVER_ERROR
    except ExecutionException as err:
        current_app.logger.error(Utils.log_format(DRIVE_PARTNER_ERROR), err)
        return MSG_DRIVE_PARTNER_ERROR, status.HTTP_500_INTERNAL_SERVER_ERROR
    except DriveCoreException as err:
        current_app.logger.error(Utils.log_format(MONGO_PARTNER_EXCEPTION), err)
        return MSG_DRIVE_PARTNER_EXCEPTION, status.HTTP_500_INTERNAL_SERVER_ERROR

    # 5) FORMAT RESULT DATA

    # 6) SEND RESULT DATA
    return {
        "success": success,
        "deleted_projects": deleted_projects,
        "deleted_from_projects": deleted_from_projects,
    }, status.HTTP_200_OK
