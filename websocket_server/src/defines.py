import os
from distutils.util import strtobool

# OS environment
OS_HOST=os.environ.get("HOST", '0.0.0.0')
OS_PORT=int(os.environ.get("PORT", default=5000))

OS_MONGO_USERNAME=os.environ.get("MONGO_USERNAME")
OS_MONGO_PASSWORD=os.environ.get("MONGO_PASSWORD")
OS_MONGO_URL=os.environ.get("MONGO_URL")

OS_IS_LOCAL=strtobool(os.environ.get("IS_LOCAL", default="False"))

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

MONGO_PARTNER_EXCEPTION="mongo partner failure: %s"
MONGO_PARTNER_TIMEOUT="mongo partner: timeout - check wifi (%s)"
MONGO_PARTNER_WRITE_ERROR="mongo partner: write operation failure (%s)"

DRIVE_PARTNER_EXCEPTION="drive partner failure: %s"
DRIVE_PARTNER_ERROR="drive partner: execution error (%s)"
DRIVE_PARTNER_MULTIPLE_IDS="drive partner: multiple ids for folder name (%s)"
