import os
from quart import Quart, current_app
from flask_api import status

# from partners.db_partner import dbPartner

from blueprints.account import bp_account
from blueprints.project import bp_project


def create_app(config, db=None) -> Quart:
    # base setup
    app = Quart(__name__)
    app.config.from_object(config)
    app.url_map.strict_slashes = False

    # partners setup
    # app.config["partners"] = dict(
    #     els = els or ElsPartner(els_url=f"https://{os.environ.get('ELS_USERNAME')}:{os.environ.get('ELS_PASSWORD')}@{os.environ.get('ELS_URL')}")
    # )

    # routes setup
    @app.route("/<path:_>")
    def error(_):
        return "", status.HTTP_400_BAD_REQUEST

    # register blueprints
    app.register_blueprint(bp_account, url_prefix="/account")
    app.register_blueprint(bp_project, url_prefix="/project")

    return app

async def close_app():
    for partner in current_app.config["partners"].values():
        await partner.close()
