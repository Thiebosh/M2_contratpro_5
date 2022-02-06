from google.oauth2.service_account import Credentials as Creds
from googleapiclient.discovery import Resource, build
from googleapiclient.errors import HttpError


class DrivePartner:
    def __init__(self, creds_relative_path, scopes):
        self.service:Resource = build('drive', 'v3', credentials=Creds.from_service_account_file(creds_relative_path, scopes=scopes))


    def remove_folder(self, name):
        id_folder = self._get_folder_id(name)
        return True if not id_folder else self.service.files().delete(fileId=id_folder).execute()


    def _get_folder_id(self, name):
        query = "trashed=false" +\
                f" and name='{name}'" +\
                " and 'root' in parents"

        try:
            results = self.service.files().list(fields="nextPageToken, files(id, name)", q=query).execute()
        except HttpError as error:
            raise Exception("DrivePartner - _get_folder_id: execution error") from error
        items = results.get('files', [])

        if len(items) > 1:
            raise Exception("DrivePartner - _get_folder_id: More than one id")

        if not items:
            return False

        return items[0]["id"]
