from google.oauth2.service_account import Credentials as Creds
from googleapiclient.discovery import Resource, build
from googleapiclient.errors import Error, HttpError


class DriveCoreException(Exception):
    """Base class for all MongoCore exceptions"""

class ExecutionException(DriveCoreException):
    pass

class MultipleIdsException(DriveCoreException):
    pass


class DriveCore:
    def __init__(self, creds_relative_path:str, scopes:"list[str]"):
        self.service:Resource = build('drive', 'v3', credentials=Creds.from_service_account_file(creds_relative_path, scopes=scopes))


    def remove_folder(self, name:str) -> bool:
        id_folder = self._get_folder_id(name)
        if not id_folder:
            return True

        try:
            result = self.service.files().delete(fileId=id_folder).execute()
        except HttpError as err:
            raise ExecutionException() from err
        except Error as err:
            raise DriveCoreException("remove_folder global error") from err

        return result


    def _get_folder_id(self, name:str) -> "str|bool":
        query = "trashed=false" +\
                f" and name='{name}'" +\
                " and 'root' in parents"

        try:
            result = self.service.files().list(fields="nextPageToken, files(id, name)", q=query).execute()
            items = result.get('files', [])
        except HttpError as err:
            raise ExecutionException() from err
        except Error as err:
            raise DriveCoreException("_get_folder_id global error") from err

        if len(items) > 1:
            raise MultipleIdsException(name)

        return False if not items else items[0]["id"]
