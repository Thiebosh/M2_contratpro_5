from distutils.util import strtobool
import json
import os
from typing import Any
from partners.mongo_queries import MongoQueries, COLLECTION_PROJECTS
from defines import *

class RenderPage():
    def __init__(self, partners, project_id, room_type) -> None:
        self.partners = partners
        self.project_id = project_id
        self.room_type = room_type

        self.session:dict[str:Any] = self.partners[DB].aggregate_list(COLLECTION_PROJECTS, MongoQueries.getSessionFromId(self.project_id))[0]
        if not self.partners[RENDERER].set_session(json.dumps(self.session)):
            raise Exception("RenderPage - PHP - session not setted")
        self.session_update = False


    async def close(self):
        if strtobool(os.environ.get('RENDER_STATE', default="False")):
            return

        success, session = self.partners[RENDERER].get_session()

        if not success:
            self.partners[LOGGER].app_logger.debug(f"{self.project_id}-{self.room_type} - Project session {'well' if result else 'not'} retrieved")
            return

        result = await self.partners[DB].update_one_async(
            COLLECTION_PROJECTS,
            *MongoQueries.updateSessionForId(self.project_id, json.loads(session))
        )
        self.partners[LOGGER].app_logger.debug(f"{self.project_id}-{self.room_type} - Mongo - Project session {'well' if result else 'not'} updated")
    

    def page(self, page):
        result = self.partners[RENDERER].get_project_page(self.project_id, page)

        success, new_session = self.partners[RENDERER].get_session()
        if success:
            new_session = json.loads(new_session)
            if self.session != new_session:
                self.session = new_session
                self.session_update = True

        return result


    def reset_session(self):
        if self.session != {}:
            self.session = {}
            self.session_update = True

        return self.partners[RENDERER].reset_session()
