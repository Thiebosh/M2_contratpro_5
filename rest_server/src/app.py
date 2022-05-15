from quart import Quart, current_app
from quart_cors import cors
from flask_api import status
from simple_bcrypt import Bcrypt

from partners.mongo_partner import MongoPartner
from partners.drive_partner import DrivePartner

from blueprints.account import bp_account
from blueprints.project import bp_project
from blueprints.syntax import bp_syntax


def create_app(config, db=None, nas=None) -> Quart:
    # base setup
    app = Quart(__name__)
    app = cors(app, allow_origin="*")
    app.config.from_object(config)
    app.url_map.strict_slashes = False

    # partners setup
    app.config["partners"] = {
        "db": db or MongoPartner(mongo_url=app.config["MONGO_URL"]),
        "nas": nas or DrivePartner(creds_relative_path=app.config["DRIVE_PATH"], scopes=app.config["DRIVE_SCOPES"]),
        "crypt": Bcrypt(app)
    }

    # routes setup
    @app.route("/<path:_>")
    def not_found(_):
        return "", status.HTTP_404_NOT_FOUND

    @app.route("/probe")
    def probe():
        return "alive", status.HTTP_200_OK

    # register blueprints
    app.register_blueprint(bp_account, url_prefix="/account")
    app.register_blueprint(bp_project, url_prefix="/project")
    app.register_blueprint(bp_syntax, url_prefix="/syntax")

    return app

async def close_app():
    for partner in current_app.config["partners"].values():
        partner.close()
