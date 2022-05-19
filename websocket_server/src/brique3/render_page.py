import json
from typing import Any
from partners.mongo_queries import MongoQueries, COLLECTION_PROJECTS
from utils import Utils
from defines import *

from partners.mongo_partner import MongoPartner, WTimeoutError, WriteException, MongoCoreException
from partners.php_partner import PhpPartner
from partners.logger_partner import LoggerPartner

class RenderPage():
    def __init__(self, partners:"dict[str,Any]", project_id:str, room_type:str):
        self.partners = partners
        self.project_id = project_id
        self.room_type = room_type

        # 1) ACCESS TO PARTNERS AND APPLY TYPE
        db_partner:MongoPartner = self.partners[DB]
        renderer_partner:PhpPartner = self.partners[RENDERER]
        logger_partner:LoggerPartner = self.partners[LOGGER]

        try:
            self.session = db_partner.aggregate_list(COLLECTION_PROJECTS, MongoQueries.getSessionFromId(self.project_id))[0]        
        except WTimeoutError as err:
            logger_partner.logger.critical(MONGO_PARTNER_TIMEOUT, err)
        except MongoCoreException as err:
            logger_partner.logger.error(MONGO_PARTNER_EXCEPTION, err)

        if not renderer_partner.set_session(json.dumps(self.session)):
            raise Exception("RenderPage - PHP - session not setted")
        self.session_update = False


    async def close(self) -> None:
        # 1) ACCESS TO PARTNERS AND APPLY TYPE
        db_partner:MongoPartner = self.partners[DB]
        renderer_partner:PhpPartner = self.partners[RENDERER]
        logger_partner:LoggerPartner = self.partners[LOGGER]

        if OS_IS_LOCAL:
            return

        success, session = renderer_partner.get_session()

        if not success:
            logger_partner.logger.debug(f"{self.project_id}-{self.room_type} - Project session {'well' if result else 'not'} retrieved")
            return

        is_session_json, session = Utils.get_json(session)
        if not is_session_json:
            logger_partner.logger.debug(f"{self.project_id}-{self.room_type} - Project session format not json")
            return

        try:
            result = await db_partner.update_one(COLLECTION_PROJECTS, *MongoQueries.updateSessionForId(self.project_id, session))
        except WriteException as err:
            logger_partner.logger.error(MONGO_PARTNER_WRITE_ERROR, err)
            return False
        except WTimeoutError as err:
            logger_partner.logger.critical(MONGO_PARTNER_TIMEOUT, err)
            return False
        except MongoCoreException as err:
            logger_partner.logger.error(MONGO_PARTNER_EXCEPTION, err)
            return False

        logger_partner.logger.debug(f"{self.project_id}-{self.room_type} - Mongo - Project session {'well' if result else 'not'} updated")
    

    def page(self, page:str) -> "tuple[bool,str]":
        # 1) ACCESS TO PARTNERS AND APPLY TYPE
        renderer_partner:PhpPartner = self.partners[RENDERER]
        logger_partner:LoggerPartner = self.partners[LOGGER]

        result = renderer_partner.get_project_page(self.project_id, page)

        success, new_session = renderer_partner.get_session()
        if success:
            is_new_session_json, new_session = Utils.get_json(new_session)
            if not is_new_session_json:
                logger_partner.logger.debug(f"{self.project_id}-{self.room_type} - Php session format not json")
                return (False, "")

            if self.session != new_session:
                self.session = new_session
                self.session_update = True

        return result


    def reset_session(self) -> bool:
        # 1) ACCESS TO PARTNERS AND APPLY TYPE
        renderer_partner:PhpPartner = self.partners[RENDERER]

        if self.session != {}:
            self.session = {}
            self.session_update = True

        return renderer_partner.reset_session()
