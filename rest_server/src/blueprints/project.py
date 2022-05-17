from quart import Blueprint, json, request, current_app
from werkzeug.datastructures import ImmutableMultiDict
from flask_api import status
from datetime import datetime
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
    users_id = post.get("users_id", type=str, default=None)
    syntax_id = post.get("syntax_id", type=str, default=None)
    description = post.get("description", type=str, default=None)

    # 3) TEST ARGS
    if not (project_name and users_id and syntax_id):
        current_app.logger.info(Utils.log_format(ARGS_INVALID_PARSE))
        return MSG_ARGS_INVALID_PARSE, status.HTTP_400_BAD_REQUEST

    # 4) USE PARTNERS WITH VALID ARGS
    current_app.logger.info(Utils.log_format(ENDPOINT_CALL))
    # verify if name does not exist
    filter_q = {
        "name": project_name
    }
    fields = {
        "_id": 0,
        "name": 1
    }

    # create project
    doc = {
        "name": project_name,
        "users": json.loads(users_id),
        "syntax_id": syntax_id,
        "description": description,
        "creation": datetime.utcnow(),
        "last_specs": None,
        "latest_proto": True,
        "specs": { "root": {} },
        "pages": [{ "default": ""}],
        "session": {},
    }

    try:
        already_exist = await mongo_partner.find_one(COLLECTION_PROJECTS, filter_q, fields)
        
        if not already_exist:
            result = await mongo_partner.insert_one(COLLECTION_PROJECTS, doc)
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
    aggregation = [
        {
            "$match": {
                "_id": project_objectId
            }
        },
        {
            "$project": {
                "_id": 0,
                "name": 1,
                "users": {
                    "$map": {
                        "input": "$users",
                        "in": { "$toObjectId": "$$this" }
                    }
                },
                "syntax_id": {
                    "$toObjectId": "$syntax_id"
                },
                "creation": 1,
                "last_specs": 1,
                "latest_proto": 1,
                "description": 1,
            }
        },
        {
            "$lookup": {
                "from": "accounts",
                "localField": "users",
                "foreignField": "_id",
                "as": "users"
            }
        },
        {
            "$lookup": {
                "from": "syntax",
                "localField": "syntax_id",
                "foreignField": "_id",
                "as": "syntaxes"
            }
        },
        {
            "$addFields": {
                "users": {
                    "$map": {
                        "input": "$users",
                        "in": { 
                            "id": {
                                "$toString": "$$this._id"
                            },
                            "name": "$$this.name"
                        }
                    }
                },
                "syntax": {
                    "$arrayElemAt": ["$syntaxes", 0]
                }
            }
        },
        {
            "$project": {
                "id": 1,
                "name": 1,
                "users": 1,
                "syntax": "$syntax.name",
                "creation": 1,
                "last_specs": 1,
                "latest_proto": 1,
                "description": 1,
            }
        },
    ]

    try:
        result = await mongo_partner.aggregate_list(COLLECTION_PROJECTS, aggregation)
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
    filter_q = {
        "_id": project_objectId,
    }
    fields = {
        "_id": 0,
        "syntax_id": 1
    }

    try:
        result = await mongo_partner.find_one(COLLECTION_PROJECTS, filter_q, fields)
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
    filter_q = {
        "name": project_name,
        "users": user_id
    }
    fields = {
        "_id": 0,
        "id": {
            "$toString": "$_id"
        }
    }

    try:
        result = await mongo_partner.find_one(COLLECTION_PROJECTS, filter_q, fields)
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
    aggregation = [
        {
            "$match": {
                "_id": project_objectId
            }
        },
        {
            "$project": {
                "_id": 0,
                "pages": 1
            }
        },
    ]

    try:
        result = await mongo_partner.aggregate_list(COLLECTION_PROJECTS, aggregation)
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
    aggregation = [
        {
            "$match": {
                "users": user_id
            }
        },
        {
            "$project": {
                "_id": 0,
                "id": {
                    "$toString": "$_id"
                },
                "name": 1,
                "users": {
                    "$map": {
                        "input": "$users",
                        "in": { "$toObjectId": "$$this" }
                    }
                },
                "syntax_id": {
                    "$toObjectId": "$syntax_id"
                },
                "creation": 1,
                "last_specs": 1,
                "latest_proto": 1
            }
        },
        {
            "$lookup": {
                "from": "accounts",
                "localField": "users",
                "foreignField": "_id",
                "as": "users"
            }
        },
        {
            "$lookup": {
                "from": "syntax",
                "localField": "syntax_id",
                "foreignField": "_id",
                "as": "syntaxes"
            }
        },
        {
            "$addFields": {
                "users": {
                    "$map": {
                        "input": "$users",
                        "in": { 
                            "id": {
                                "$toString": "$$this._id"
                            },
                            "name": "$$this.name"
                        }
                    }
                },
                "syntax": {
                    "$arrayElemAt": ["$syntaxes", 0]
                }
            }
        },
        {
            "$project": {
                "id": 1,
                "name": 1,
                "users": 1,
                "syntax_name": "$syntax.name",
                "creation": 1,
                "last_specs": 1,
                "latest_proto": 1
            }
        },
    ]

    try:
        result = await mongo_partner.aggregate_list(COLLECTION_PROJECTS, aggregation)
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
    add_ids = post.get("addCollabIds", type=str, default=None)
    remove_ids = post.get("removeCollabIds", type=str, default=None)
    description = post.get("description", type=str, default=None)
    deleteDescription = post.get("deleteDescription", type=bool, default=None)

    # 3) TEST ARGS
    if not (id and (name or add_ids or remove_ids or description or deleteDescription)): # check if true count equals post length
        current_app.logger.info(Utils.log_format(ARGS_INVALID_PARSE))
        return MSG_ARGS_INVALID_PARSE, status.HTTP_400_BAD_REQUEST

    objectId = MongoQueries.to_objectId(id)
    if not objectId:
        current_app.logger.info(Utils.log_format(ARGS_INVALID_OBJECT_ID))
        return MSG_ARGS_INVALID_OBJECT_ID, status.HTTP_400_BAD_REQUEST

    # 4) USE PARTNERS WITH VALID ARGS
    current_app.logger.info(Utils.log_format(ENDPOINT_CALL))
    if name:
        # verify if name does not exist for other than id
        filter_q = {
            "_id": {
                "$ne": objectId
            },
            "name": name
        }
        fields = {
            "_id": 0,
            "name": 1
        }

        try:
            already_exist = await mongo_partner.find_one(COLLECTION_PROJECTS, filter_q, fields)
        except WTimeoutError as err:
            current_app.logger.critical(Utils.log_format(MONGO_PARTNER_TIMEOUT), err)
            return MSG_MONGO_PARTNER_TIMEOUT, status.HTTP_500_INTERNAL_SERVER_ERROR
        except MongoCoreException as err:
            current_app.logger.error(Utils.log_format(MONGO_PARTNER_EXCEPTION), err)
            return MSG_MONGO_PARTNER_EXCEPTION, status.HTTP_500_INTERNAL_SERVER_ERROR

        if already_exist:
            return MSG_ALREADY_EXIST, status.HTTP_200_OK

    # update fields
    filter_q = {
        "_id": objectId
    }
    operations = []

    if name:
        operations.append(mongo_partner.bulk_update_one(filter_q, {
            "$set": {
                "name": name
            }
        }))

    if add_ids:
        operations.append(mongo_partner.bulk_update_one(filter_q, {
            "$addToSet": {
                "users": {
                    "$each": json.loads(add_ids)
                }
            }
        }))

    if remove_ids:
        operations.append(mongo_partner.bulk_update_one(filter_q, {
            "$pullAll": {
                "users": json.loads(remove_ids)
            }
        }))

    if description:
        operations.append(mongo_partner.bulk_update_one(filter_q, {
            "$set": {
                "description": description
            }
        }))

    if deleteDescription and not description:
        operations.append(mongo_partner.bulk_update_one(filter_q, {
            "$set": {
                "description": ''
            }
        }))

    try:
        result = await mongo_partner.bulk_write(COLLECTION_PROJECTS, operations)
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
    filter_q = {
        "_id": project_objectId
    }

    try:
        mongo_result = await mongo_partner.delete_one(COLLECTION_PROJECTS, filter_q)
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
