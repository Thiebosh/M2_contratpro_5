from typing import Any
from .files_manager import FilesManager
from defines import *

from partners.drive_partner import DrivePartner, MultipleIdsException, ExecutionException, DriveCoreException
from partners.php_partner import PhpPartner
from partners.logger_partner import LoggerPartner

class FilesManagerProto(FilesManager):
    def __init__(self, partners:"dict[str,Any]", project_id:str, room_type:str):
        super().__init__(partners, project_id, room_type)

        # 1) ACCESS TO PARTNERS AND APPLY TYPE
        nas_partner:DrivePartner = self.partners[NAS]
        renderer_partner:PhpPartner = self.partners[RENDERER]
        logger_partner:LoggerPartner = self.partners[LOGGER]

        try:
            self.files = nas_partner.download_files_from_folder(self.project_id)
        except MultipleIdsException as err:
            logger_partner.logger.critical(DRIVE_PARTNER_MULTIPLE_IDS, err)
        except ExecutionException as err:
            logger_partner.logger.error(DRIVE_PARTNER_ERROR, err)
        except DriveCoreException as err:
            logger_partner.logger.error(MONGO_PARTNER_EXCEPTION, err)

        if not renderer_partner.set_project_folder(self.project_id):
            raise Exception(f"{self.project_id}-{self.room_type} - PHP - folder not created")

        # security
        if not renderer_partner.unset_project_files(self.project_id):
            raise Exception(f"{self.project_id}-{self.room_type} - PHP - folder emptiness pb")

        if not renderer_partner.set_project_files(self.project_id, self.files):
            raise Exception(f"{self.project_id}-{self.room_type} - PHP - files not uploaded")


    def close(self) -> None:
        # 1) ACCESS TO PARTNERS AND APPLY TYPE
        renderer_partner:PhpPartner = self.partners[RENDERER]
        logger_partner:LoggerPartner = self.partners[LOGGER]

        result = renderer_partner.unset_project_files(self.project_id)
        logger_partner.logger.debug(f"{self.project_id}-{self.room_type} - PHP - Project files {'well' if result else 'not'} removed")
        if result is False:
            return # error ?
        result = renderer_partner.unset_project_folder(self.project_id)
        logger_partner.logger.debug(f"{self.project_id}-{self.room_type} - PHP - Project directory {'well' if result else 'not'} removed")

    
    def reload_files(self) -> bool:
        # 1) ACCESS TO PARTNERS AND APPLY TYPE
        nas_partner:DrivePartner = self.partners[NAS]
        renderer_partner:PhpPartner = self.partners[RENDERER]
        logger_partner:LoggerPartner = self.partners[LOGGER]

        result = renderer_partner.unset_project_files(self.project_id)
        logger_partner.logger.debug(f"{self.project_id}-{self.room_type} - PHP - Project files {'well' if result else 'not'} removed")
        if result is False:
            return False

        try:
            self.files = nas_partner.download_files_from_folder(self.project_id)
        except MultipleIdsException as err:
            logger_partner.logger.critical(DRIVE_PARTNER_MULTIPLE_IDS, err)
            return False
        except ExecutionException as err:
            logger_partner.logger.error(DRIVE_PARTNER_ERROR, err)
            return False
        except DriveCoreException as err:
            logger_partner.logger.error(MONGO_PARTNER_EXCEPTION, err)
            return False

        if not renderer_partner.set_project_files(self.project_id, self.files):
            return False

        logger_partner.logger.debug(f"{self.project_id}-{self.room_type} - PHP - Project files {'well' if result else 'not'} updated")
        return True
