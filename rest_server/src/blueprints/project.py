from quart import Blueprint, request, current_app
from werkzeug.datastructures import ImmutableMultiDict
from flask_api import status
from utils import Utils
from defines import *

from partners.mongo.mongo_core import MongoCore, MongoCoreException, WTimeoutError, WriteException, COLLECTION_PROJECTS
from partners.mongo.mongo_queries import MongoQueries
from partners.drive.drive_core import DriveCore, DriveCoreException, ExecutionException, MultipleIdsException

bp_project = Blueprint("project", __name__)


@bp_project.route("/create", methods=['POST'])
async def create():
    # 1) ACCESS TO PARTNERS AND APPLY TYPE
    mongo_partner:MongoCore = current_app.config[PARTNERS][DB]

    # 2) RETRIEVE ARGS
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 4:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_NUMBER))
        return MSG_ARGS_INVALID_NUMBER, status.HTTP_400_BAD_REQUEST

    project_name = post.get("name", type=str, default=None)
    is_users_id_json, users_id = Utils.get_json(post.get('users_id', type=str, default=None))
    syntax_id = post.get("syntax_id", type=str, default=None)
    description = post.get("description", type=str, default=None)

    # 3) TEST ARGS
    if not (project_name and is_users_id_json and syntax_id):
        current_app.logger.info(Utils.log_format(ARGS_INVALID_PARSE))
        return MSG_ARGS_INVALID_PARSE, status.HTTP_400_BAD_REQUEST

    if users_id is None:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_JSON))
        return MSG_ARGS_INVALID_JSON, status.HTTP_400_BAD_REQUEST

    # 4) USE PARTNERS WITH VALID ARGS
    current_app.logger.info(Utils.log_format(ENDPOINT_CALL))
    try:
        already_exist = await mongo_partner.find_one(COLLECTION_PROJECTS, *MongoQueries.exist_name(project_name))
        
        if not already_exist:
            result = await mongo_partner.insert_one(COLLECTION_PROJECTS, MongoQueries.create_project(project_name, users_id, syntax_id, description))
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


@bp_project.route("/get", methods=['POST'])
async def get():
    # 1) ACCESS TO PARTNERS AND APPLY TYPE
    mongo_partner:MongoCore = current_app.config[PARTNERS][DB]

    # 2) RETRIEVE ARGS
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 1:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_NUMBER))
        return MSG_ARGS_INVALID_NUMBER, status.HTTP_400_BAD_REQUEST

    project_id = post.get("id", type=str, default=None)

    # 3) TEST ARGS
    if not project_id:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_PARSE))
        return MSG_ARGS_INVALID_PARSE, status.HTTP_400_BAD_REQUEST

    project_objectId = MongoQueries.to_objectId(project_id)
    if not project_objectId:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_OBJECT_ID))
        return MSG_ARGS_INVALID_OBJECT_ID, status.HTTP_400_BAD_REQUEST

    # 4) USE PARTNERS WITH VALID ARGS
    current_app.logger.info(Utils.log_format(ENDPOINT_CALL))
    try:
        result = await mongo_partner.aggregate_list(COLLECTION_PROJECTS, MongoQueries.get_project(project_objectId))
    except WTimeoutError as err:
        current_app.logger.critical(Utils.log_format(MONGO_PARTNER_TIMEOUT), err)
        return MSG_MONGO_PARTNER_TIMEOUT, status.HTTP_500_INTERNAL_SERVER_ERROR
    except MongoCoreException as err:
        current_app.logger.error(Utils.log_format(MONGO_PARTNER_EXCEPTION), err)
        return MSG_MONGO_PARTNER_EXCEPTION, status.HTTP_500_INTERNAL_SERVER_ERROR

    # 5) FORMAT RESULT DATA

    # 6) SEND RESULT DATA
    if not result:
        return MSG_PROJECT_NOT_FOUND, status.HTTP_500_INTERNAL_SERVER_ERROR

    return {
        "result": result[0]
    }, status.HTTP_200_OK


@bp_project.route("/get_syntax_id", methods=['POST'])
async def get_syntax_id():
    # 1) ACCESS TO PARTNERS AND APPLY TYPE
    mongo_partner:MongoCore = current_app.config[PARTNERS][DB]

    # 2) RETRIEVE ARGS
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 1:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_NUMBER))
        return MSG_ARGS_INVALID_NUMBER, status.HTTP_400_BAD_REQUEST

    project_id = post.get("project_id", type=str, default=None)

    # 3) TEST ARGS
    if not project_id:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_PARSE))
        return MSG_ARGS_INVALID_PARSE, status.HTTP_400_BAD_REQUEST

    project_objectId = MongoQueries.to_objectId(project_id)
    if not project_objectId:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_OBJECT_ID))
        return MSG_ARGS_INVALID_OBJECT_ID, status.HTTP_400_BAD_REQUEST

    # 4) USE PARTNERS WITH VALID ARGS
    current_app.logger.info(Utils.log_format(ENDPOINT_CALL))
    try:
        result = await mongo_partner.find_one(COLLECTION_PROJECTS, *MongoQueries.get_syntax_id_project(project_objectId))
    except WTimeoutError as err:
        current_app.logger.critical(Utils.log_format(MONGO_PARTNER_TIMEOUT), err)
        return MSG_MONGO_PARTNER_TIMEOUT, status.HTTP_500_INTERNAL_SERVER_ERROR
    except MongoCoreException as err:
        current_app.logger.error(Utils.log_format(MONGO_PARTNER_EXCEPTION), err)
        return MSG_MONGO_PARTNER_EXCEPTION, status.HTTP_500_INTERNAL_SERVER_ERROR

    # 5) FORMAT RESULT DATA

    # 6) SEND RESULT DATA
    if not result:
        return MSG_NO_SYNTAX, status.HTTP_500_INTERNAL_SERVER_ERROR

    return {
        "id": result["syntax_id"]
    }, status.HTTP_200_OK


@bp_project.route("/exist_for_user", methods=['POST'])
async def exist_for_user():
    # 1) ACCESS TO PARTNERS AND APPLY TYPE
    mongo_partner:MongoCore = current_app.config[PARTNERS][DB]

    # 2) RETRIEVE ARGS
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 2:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_NUMBER))
        return MSG_ARGS_INVALID_NUMBER, status.HTTP_400_BAD_REQUEST

    user_id = post.get("user_id", type=str, default=None)
    project_name = post.get("project_name", type=str, default=None)

    # 3) TEST ARGS
    if not (user_id and project_name):
        current_app.logger.info(Utils.log_format(ARGS_INVALID_PARSE))
        return MSG_ARGS_INVALID_PARSE, status.HTTP_400_BAD_REQUEST

    # 4) USE PARTNERS WITH VALID ARGS
    current_app.logger.info(Utils.log_format(ENDPOINT_CALL))
    try:
        result = await mongo_partner.find_one(COLLECTION_PROJECTS, *MongoQueries.project_exist_for_user(project_name, user_id))
    except WTimeoutError as err:
        current_app.logger.critical(Utils.log_format(MONGO_PARTNER_TIMEOUT), err)
        return MSG_MONGO_PARTNER_TIMEOUT, status.HTTP_500_INTERNAL_SERVER_ERROR
    except MongoCoreException as err:
        current_app.logger.error(Utils.log_format(MONGO_PARTNER_EXCEPTION), err)
        return MSG_MONGO_PARTNER_EXCEPTION, status.HTTP_500_INTERNAL_SERVER_ERROR

    # 5) FORMAT RESULT DATA

    # 6) SEND RESULT DATA
    if not result:
        return MSG_NOT_MEMBER, status.HTTP_401_UNAUTHORIZED # specific

    return {
        "project_id": result["id"]
    }, status.HTTP_200_OK


@bp_project.route("/get_proto_pages", methods=['POST'])
async def get_proto_pages():
    # 1) ACCESS TO PARTNERS AND APPLY TYPE
    mongo_partner:MongoCore = current_app.config[PARTNERS][DB]

    # 2) RETRIEVE ARGS
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 1:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_NUMBER))
        return MSG_ARGS_INVALID_NUMBER, status.HTTP_400_BAD_REQUEST

    project_id = post.get("project_id", type=str, default=None)

    # 3) TEST ARGS
    if not project_id:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_PARSE))
        return MSG_ARGS_INVALID_PARSE, status.HTTP_400_BAD_REQUEST

    project_objectId = MongoQueries.to_objectId(project_id)
    if not project_objectId:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_OBJECT_ID))
        return MSG_ARGS_INVALID_OBJECT_ID, status.HTTP_400_BAD_REQUEST

    # 4) USE PARTNERS WITH VALID ARGS
    current_app.logger.info(Utils.log_format(ENDPOINT_CALL))
    try:
        result = await mongo_partner.aggregate_list(COLLECTION_PROJECTS, MongoQueries.project_get_proto_pages(project_objectId))
    except WTimeoutError as err:
        current_app.logger.critical(Utils.log_format(MONGO_PARTNER_TIMEOUT), err)
        return MSG_MONGO_PARTNER_TIMEOUT, status.HTTP_500_INTERNAL_SERVER_ERROR
    except MongoCoreException as err:
        current_app.logger.error(Utils.log_format(MONGO_PARTNER_EXCEPTION), err)
        return MSG_MONGO_PARTNER_EXCEPTION, status.HTTP_500_INTERNAL_SERVER_ERROR

    # 5) FORMAT RESULT DATA
    pages = [{"name": key, "link": value}for couple in result[0]["pages"] for key, value in couple.items()]

    # 6) SEND RESULT DATA
    return {
        "pages": pages
    }, status.HTTP_200_OK


@bp_project.route("/search_for_user", methods=['POST'])
async def search_for_user():
    # 1) ACCESS TO PARTNERS AND APPLY TYPE
    mongo_partner:MongoCore = current_app.config[PARTNERS][DB]

    # 2) RETRIEVE ARGS
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 1:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_NUMBER))
        return MSG_ARGS_INVALID_NUMBER, status.HTTP_400_BAD_REQUEST

    user_id = post.get("user_id", type=str, default=None)

    # 3) TEST ARGS
    if not user_id:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_PARSE))
        return MSG_ARGS_INVALID_PARSE, status.HTTP_400_BAD_REQUEST

    # 4) USE PARTNERS WITH VALID ARGS
    current_app.logger.info(Utils.log_format(ENDPOINT_CALL))
    try:
        result = await mongo_partner.aggregate_list(COLLECTION_PROJECTS, MongoQueries.project_search_for_user(user_id))
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


@bp_project.route("/update", methods=['POST'])
async def update():
    # 1) ACCESS TO PARTNERS AND APPLY TYPE
    mongo_partner:MongoCore = current_app.config[PARTNERS][DB]

    # 2) RETRIEVE ARGS
    post = ImmutableMultiDict(await request.get_json())
    if not (2 <= len(post) <= 6):
        current_app.logger.info(Utils.log_format(ARGS_INVALID_NUMBER))
        return MSG_ARGS_INVALID_NUMBER, status.HTTP_400_BAD_REQUEST

    id = post.get("id", type=str, default=None)
    name = post.get("name", type=str, default=None)
    is_add_ids_json, add_ids = Utils.get_json(post.get('addCollabIds', type=str, default=None))
    remove_ids = post.get("removeCollabIds", type=str, default=None)
    is_remove_ids_json, remove_ids = Utils.get_json(post.get('removeCollabIds', type=str, default=None))
    description = post.get("description", type=str, default=None)
    deleteDescription = post.get("deleteDescription", type=bool, default=None)

    # 3) TEST ARGS
    if not (id and (name or is_add_ids_json or is_remove_ids_json or description or deleteDescription)): # check if true count equals post length
        current_app.logger.info(Utils.log_format(ARGS_INVALID_PARSE))
        return MSG_ARGS_INVALID_PARSE, status.HTTP_400_BAD_REQUEST

    if (is_add_ids_json and add_ids is None) or (is_remove_ids_json and remove_ids is None):
        current_app.logger.info(Utils.log_format(ARGS_INVALID_JSON))
        return MSG_ARGS_INVALID_JSON, status.HTTP_400_BAD_REQUEST

    objectId = MongoQueries.to_objectId(id)
    if not objectId:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_OBJECT_ID))
        return MSG_ARGS_INVALID_OBJECT_ID, status.HTTP_400_BAD_REQUEST

    # 4) USE PARTNERS WITH VALID ARGS
    current_app.logger.info(Utils.log_format(ENDPOINT_CALL))
    if name:
        try:
            already_exist = await mongo_partner.find_one(COLLECTION_PROJECTS, *MongoQueries.unique_name(objectId, name))
        except WTimeoutError as err:
            current_app.logger.critical(Utils.log_format(MONGO_PARTNER_TIMEOUT), err)
            return MSG_MONGO_PARTNER_TIMEOUT, status.HTTP_500_INTERNAL_SERVER_ERROR
        except MongoCoreException as err:
            current_app.logger.error(Utils.log_format(MONGO_PARTNER_EXCEPTION), err)
            return MSG_MONGO_PARTNER_EXCEPTION, status.HTTP_500_INTERNAL_SERVER_ERROR

        if already_exist:
            return MSG_ALREADY_EXIST, status.HTTP_200_OK

    try:
        result = await mongo_partner.bulk_write(COLLECTION_PROJECTS, MongoQueries.project_update(objectId, name, add_ids, remove_ids, description, deleteDescription))
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


@bp_project.route("/delete", methods=['POST'])
async def delete():
    # 1) ACCESS TO PARTNERS AND APPLY TYPE
    mongo_partner:MongoCore = current_app.config[PARTNERS][DB]
    drive_partner:DriveCore = current_app.config[PARTNERS][NAS]

    # 2) RETRIEVE ARGS
    post = ImmutableMultiDict(await request.get_json())
    if len(post) != 1:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_NUMBER))
        return MSG_ARGS_INVALID_NUMBER, status.HTTP_400_BAD_REQUEST

    project_id = post.get("id", type=str, default=None)

    # 3) TEST ARGS
    if not project_id:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_PARSE))
        return MSG_ARGS_INVALID_PARSE, status.HTTP_400_BAD_REQUEST

    project_objectId = MongoQueries.to_objectId(project_id)
    if not project_objectId:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_OBJECT_ID))
        return MSG_ARGS_INVALID_OBJECT_ID, status.HTTP_400_BAD_REQUEST

    # 4) USE PARTNERS WITH VALID ARGS
    current_app.logger.info(Utils.log_format(ENDPOINT_CALL))
    try:
        mongo_result = await mongo_partner.delete_one(COLLECTION_PROJECTS, MongoQueries.filter_id(project_objectId))
    except WTimeoutError as err:
        current_app.logger.critical(Utils.log_format(MONGO_PARTNER_TIMEOUT), err)
        return MSG_MONGO_PARTNER_TIMEOUT, status.HTTP_500_INTERNAL_SERVER_ERROR
    except MongoCoreException as err:
        current_app.logger.error(Utils.log_format(MONGO_PARTNER_EXCEPTION), err)
        return MSG_MONGO_PARTNER_EXCEPTION, status.HTTP_500_INTERNAL_SERVER_ERROR

    try:
        drive_result = drive_partner.remove_folder(project_id)
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
        "success": mongo_result and drive_result
    }, status.HTTP_200_OK
