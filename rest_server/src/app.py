import logging
from http.client import HTTPConnection
import pathlib
from quart import Quart, abort
from quart_cors import cors
from flask_api import status
from simple_bcrypt import Bcrypt
from config import Config
from utils import Utils
from defines import *

from partners.mongo.mongo_core import MongoCore
from partners.drive.drive_core import DriveCore

from blueprints.account import bp_account
from blueprints.project import bp_project
from blueprints.syntax import bp_syntax


def create_app(config:Config, db=None, nas=None) -> Quart:
    '''returns a fully configured Quart server, ready to start'''
    # 1) INITIALIZE BASE APP CONFIG
    app = Quart(__name__)
    app = cors(app, allow_origin="*")
    app.config.from_object(config) # setup with the configuration provided by the user / environment
    app.url_map.strict_slashes = False

    # set logs levels
    logging.getLogger("quart.serving").disabled = True

    logger_level = logging.INFO

    app.logger.setLevel(logger_level)
    HTTPConnection.debuglevel = logger_level == logging.DEBUG
    logging.getLogger("requests.packages.urllib3").setLevel(logger_level)
    logging.getLogger("elasticsearch").setLevel(logger_level)

    # 2) INITIALIZE PARTNERS
    app.logger.info(Utils.log_format(INIT_PARTNERS))

    app.config["partners"] = {
        DB: db or MongoCore(
            mongo_url=f"mongodb+srv://{OS_MONGO_USERNAME}:{OS_MONGO_PASSWORD}@{OS_MONGO_URL}"
        ),
        NAS: nas or DriveCore(
            creds_relative_path=f"{pathlib.Path(__file__).parent.absolute()}/../credentials/service_account.json",
            scopes=['https://www.googleapis.com/auth/drive']
        ),
        CRYPT: Bcrypt(app)
    }

    # 3) SETUP ENDPOINTS
    app.logger.info(Utils.log_format(INIT_ENDPOINTS))

    # setup base routes
    @app.route("/<path:_>")
    def error(_):
        abort(status.HTTP_404_NOT_FOUND)

    @app.route("/probe")
    def probe():
        return "alive", status.HTTP_200_OK

    # register blueprints
    app.register_blueprint(bp_account, url_prefix="/account")
    app.register_blueprint(bp_project, url_prefix="/project")
    app.register_blueprint(bp_syntax, url_prefix="/syntax")

    # 4) APP INITIALIZED
    app.logger.info(Utils.log_format(INIT_DONE))

    return app
