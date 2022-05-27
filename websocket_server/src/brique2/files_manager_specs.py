from typing import Any
from .files_manager import FilesManager
from partners.mongo_queries import MongoQueries, COLLECTION_PROJECTS
import os
from defines import *

from partners.mongo_partner import MongoPartner, WTimeoutError,WriteException, MongoCoreException
from partners.drive_partner import DrivePartner, MultipleIdsException, ExecutionException, DriveCoreException
from partners.cpp_partner import CppPartner
from partners.logger_partner import LoggerPartner

class FilesManagerSpecs(FilesManager):
    def __init__(self, partners:"dict[str,Any]", project_id:str, room_type:str):
        super().__init__(partners, project_id, room_type)
        self.files_currently_stored = True
        self.files=[]
        self.pages=[]


    async def generate_files(self, specs_json:str) -> bool:
        if OS_IS_LOCAL:
            return True

        # 1) ACCESS TO PARTNERS AND APPLY TYPE
        generator_partner:CppPartner = self.partners[GENERATOR]
        logger_partner:LoggerPartner = self.partners[LOGGER]

        logger_partner.logger.info(f"{self.project_id}-{self.room_type} - generate files")

        filepath = f"/src/brique2/cpp/{self.project_id}.json"
        open(filepath, "w").write(specs_json)
        args = (filepath,)

        lines, retcode = await generator_partner.call(args)

        if os.path.exists(filepath):
            os.remove(filepath)

        if retcode == -1 or "ERROR :" in lines:
            logger_partner.logger.warning(f"cpp executable return error: {lines}")
            return False

        try:
            chunks = [chunk.strip() for chunk in lines.split("\n\n\n\n") if chunk != '']

            self.files_currently_stored = False
            self.files = [{"name": line.split("\n")[0], "content": line[line.find("\n")+1:]} for line in chunks][1:]
            self.pages = [{"Default": chunks[0].split("\n")[1]}] + [
                {''.join(value.split(".")[:-1]): value}
                for page in self.files 
                for key, value in page.items() 
                if key == "name" 
                and value.split(".")[-1] == "html"
            ]
        except Exception as err:
            logger_partner.logger.error(f"cpp generated parse error: {err}")
            return False

        return True


    async def update_stored_files(self) -> bool:
        # 1) ACCESS TO PARTNERS AND APPLY TYPE
        db_partner:MongoPartner = self.partners[DB]
        nas_partner:DrivePartner = self.partners[NAS]
        logger_partner:LoggerPartner = self.partners[LOGGER]

        logger_partner.logger.info(f"{self.project_id}-{self.room_type} - call")

        if self.files_currently_stored:
            return True

        try:
            result = nas_partner.upload_files_to_folder(self.project_id, self.files)
        except MultipleIdsException as err:
            logger_partner.logger.critical(DRIVE_PARTNER_MULTIPLE_IDS, err)
            return False
        except ExecutionException as err:
            logger_partner.logger.error(DRIVE_PARTNER_ERROR, err)
            return False
        except DriveCoreException as err:
            logger_partner.logger.error(MONGO_PARTNER_EXCEPTION, err)
            return False

        if not result:
            logger_partner.logger.error(f"{self.project_id}-{self.room_type} - Project upload to storage failed")
            return False

        try:
            result = await db_partner.update_one(COLLECTION_PROJECTS, *MongoQueries.updateProtoPagesForId(self.project_id, self.pages))
        except WriteException as err:
            logger_partner.logger.error(MONGO_PARTNER_WRITE_ERROR, err)
            return False
        except WTimeoutError as err:
            logger_partner.logger.critical(MONGO_PARTNER_TIMEOUT, err)
            return False
        except MongoCoreException as err:
            logger_partner.logger.error(MONGO_PARTNER_EXCEPTION, err)
            return False

        if not result:
            logger_partner.logger.error(f"{self.project_id}-{self.room_type} - Project pages update in db failed")
            return False

        self.files_currently_stored = True
        return True
