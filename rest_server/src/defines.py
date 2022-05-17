import os

# OS environment
OS_HOST=os.environ.get("HOST", '0.0.0.0')
OS_PORT=int(os.environ.get("PORT", default=5000))

OS_MONGO_USERNAME=os.environ.get("MONGO_USERNAME")
OS_MONGO_PASSWORD=os.environ.get("MONGO_PASSWORD")
OS_MONGO_URL=os.environ.get("MONGO_URL")

OS_IS_LOCAL=os.environ.get("IS_LOCAL", default="False")

# DICT KEYS
PARTNERS="partners"
DB="db"
NAS="nas"
CRYPT="crypt"

# LOGGIN MSGS
INIT_PARTNERS="init: setup partners"
INIT_ENDPOINTS="inti: load blueprints"
INIT_DONE="init: done"

ENDPOINT_CALL="call"

ARGS_INVALID_NUMBER="args: invalid number"
ARGS_INVALID_PARSE="args: invalid name or format"
ARGS_INVALID_VALUE="args: invalid value"
ARGS_OVERLOAD_VALUE="args: overload value"
ARGS_INVALID_JSON="args: invalid json format"
ARGS_INVALID_OBJECT_ID="args: invalid objectId"

MONGO_PARTNER_EXCEPTION="mongo partner failure: %s"
MONGO_PARTNER_TIMEOUT="mongo partner: timeout - check wifi (%s)"
MONGO_PARTNER_WRITE_ERROR="mongo partner: write operation failure (%s)"

DRIVE_PARTNER_EXCEPTION="drive partner failure: %s"
DRIVE_PARTNER_ERROR="drive partner: execution error (%s)"
DRIVE_PARTNER_MULTIPLE_IDS="drive partner: multiple ids for folder name (%s)"

NO_SYNTAX="no syntax found in db"
NO_ACCOUNT="no account found (%s)"

# RETURN MSGS
MSG_ARGS_INVALID_NUMBER="incorrect nb of params"
MSG_ARGS_INVALID_PARSE="invalid params name or format"
MSG_ARGS_INVALID_VALUE="invalid params value"
MSG_ARGS_INVALID_JSON="invalid json params"
MSG_ARGS_INVALID_OBJECT_ID="invalid objectId"

MSG_MONGO_PARTNER_EXCEPTION="db request error"
MSG_MONGO_PARTNER_TIMEOUT="operation timeout"
MSG_MONGO_PARTNER_WRITE_ERROR="operation failure"

MSG_DRIVE_PARTNER_EXCEPTION="drive request error"
MSG_DRIVE_PARTNER_ERROR="drive request execution error"
MSG_DRIVE_PARTNER_MULTIPLE_IDS="multiple ids error"

MSG_NO_SYNTAX="no syntax found"
MSG_NO_ACCOUNT="no account found"
MSG_PROJECT_NOT_FOUND="project not found"
MSG_NOT_MEMBER="not in project or no project"

MSG_ALREADY_EXIST={"success": "already exist"}
