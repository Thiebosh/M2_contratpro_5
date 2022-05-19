import os

# OS environment
OS_HOST=os.environ.get("HOST", '0.0.0.0')
OS_PORT=int(os.environ.get("PORT", default=5000))

OS_MONGO_USERNAME=os.environ.get("MONGO_USERNAME")
OS_MONGO_PASSWORD=os.environ.get("MONGO_PASSWORD")
OS_MONGO_URL=os.environ.get("MONGO_URL")

OS_IS_LOCAL=os.environ.get("IS_LOCAL", default="False")

# GLOBAL VALUES
ENCODING="utf-8"

# DICT KEYS
WEBSOCKET="websocket"
DB="db"
NAS="nas"
GENERATOR="generator"
RENDERER="renderer"
LOGGER="logger"

# LOGGIN MSGS
INIT_SERVER="start server"
INIT_PARTNERS="setup partners"
INIT_DONE="done"

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
