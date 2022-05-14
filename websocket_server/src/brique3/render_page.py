from distutils.util import strtobool
import json
import os
from typing import Any
from partners.mongo_queries import MongoQueries, COLLECTION_PROJECTS

class RenderPage():
    def __init__(self, partners, project_id, room_type) -> None:
        self.partners = partners
        self.project_id = project_id
        self.room_type = room_type

        self.session:dict[str:Any] = self.partners["db"].aggregate_list(COLLECTION_PROJECTS, MongoQueries.getSessionFromId(self.project_id))[0]
        if not self.partners["renderer"].set_session(json.dumps(self.session)):
            raise Exception("RenderPage - PHP - session not setted")


    async def close(self):
        if strtobool(os.environ.get('RENDER_STATE', default="False")):
            return

        success, session = self.partners["renderer"].get_session()

        if not success:
            print(f"{self.project_id}-{self.room_type} - Project session {'well' if result else 'not'} retrieved")
            return

        result = await self.partners["db"].update_one_async(
            COLLECTION_PROJECTS,
            *MongoQueries.updateSessionForId(self.project_id, json.loads(session))
        )
        print(f"{self.project_id}-{self.room_type} - Mongo - Project session {'well' if result else 'not'} updated")


    def page(self, page):
        result = self.partners["renderer"].get_project_page(self.project_id, page)

        success, new_session = self.partners["renderer"].get_session()
        if success:
            new_session = json.loads(new_session)
            if self.session != new_session:
                self.session = new_session
                # programmer un envoi global

        return result


    def reset_session(self):
        if self.session != {}:
            self.session = {}
            # programmer un envoi global

        return self.partners["renderer"].reset_session()
