import os
from quart import Quart, current_app
from flask_api import status
from simple_bcrypt import Bcrypt

from partners.mongo_partner import MongoPartner

from blueprints.account import bp_account
from blueprints.project import bp_project


def create_app(config, db=None) -> Quart:
    # base setup
    app = Quart(__name__)
    app.config.from_object(config)
    app.url_map.strict_slashes = False

    # partners setup
    app.config["partners"] = {
        "db": db or MongoPartner(mongo_url=f"mongodb+srv://{os.environ.get('MONGO_USERNAME')}:{os.environ.get('MONGO_PASSWORD')}@{os.environ.get('MONGO_URL')}"),
        "crypt": Bcrypt(app)
    }

    # routes setup
    @app.route("/<path:_>")
    def not_found(_):
        return "", status.HTTP_404_NOT_FOUND

    # register blueprints
    app.register_blueprint(bp_account, url_prefix="/account")
    app.register_blueprint(bp_project, url_prefix="/project")

    return app

async def close_app():
    for partner in current_app.config["partners"].values():
        await partner.close()
