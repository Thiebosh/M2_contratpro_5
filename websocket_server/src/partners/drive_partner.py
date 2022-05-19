import io
from google.oauth2.service_account import Credentials as Creds
from googleapiclient.discovery import Resource, build
from googleapiclient.http import MediaIoBaseUpload, MediaIoBaseDownload, BatchHttpRequest
from googleapiclient.errors import Error, HttpError, BatchError

class DriveCoreException(Exception):
    """Base class for all MongoCore exceptions"""

class ExecutionException(DriveCoreException):
    pass

class MultipleIdsException(DriveCoreException):
    pass


MIMETYPE_FOLDER = "application/vnd.google-apps.folder"
MIMETYPE_TEXTFILE = "text/plain"

ENCODING = "utf-8"

class DrivePartner:
    def __init__(self, creds_path:str, scopes:"list[str]"):
        self.creds_path = creds_path
        self.scopes = scopes
        self.service:Resource = build('drive', 'v3', credentials=Creds.from_service_account_file(creds_path, scopes=scopes), cache_discovery=False)


    def copy_partner(self):
        return DrivePartner(self.creds_path, self.scopes)


    def download_files_from_folder(self, name:str) -> "list[dict[str, str]]":
        return [{
                    "name": file["name"],
                    "content": self._get_file_content(file["id"])
                }
                for file in self._get_files_ids(self._get_folder_id(name))]


    def upload_files_to_folder(self, name:str, files:"list[dict[str,str]]") -> bool:
        folder_id = self._get_parent_id(name)

        self._reset_folder(folder_id)

        results = [self._create_file(file["name"], file["content"], folder_id) for file in files]

        return not None in results


    def _create_folder(self, name:str, parent_id:str=None) -> str:
        metadata = {
            "name": name,
            "mimeType": MIMETYPE_FOLDER,
            "parents": [parent_id or "root"]
        }

        try:
            results = self.service.files().create(body=metadata).execute()
        except HttpError as err:
            raise ExecutionException() from err
        except Error as err:
            raise DriveCoreException("_create_folder global error") from err

        return results["id"]


    def _get_parent_id(self, parent:str) -> "str|None":
        return self._get_folder_id(parent) if parent else None


    def _get_folder_id(self, name:str, parent:str=None) -> str:
        parent_id = self._get_parent_id(parent)

        query = "trashed=false" +\
                f" and name='{name}'" +\
                f" and '{parent_id or 'root'}' in parents"

        try:
            results = self.service.files().list(fields="nextPageToken, files(id, name)", q=query).execute()
        except HttpError as err:
            raise ExecutionException() from err
        except Error as err:
            raise DriveCoreException("_get_folder_id global error") from err

        items = results.get('files', [])

        if len(items) > 1:
            raise MultipleIdsException(name)

        if not items:
            return self._create_folder(name, parent_id)

        return items[0]["id"]


    def _get_files_ids(self, parent_id:str=None) -> "list[str]":
        query = "trashed=false" +\
                f" and mimeType!='{MIMETYPE_FOLDER}'" +\
                f" and '{parent_id or 'root'}' in parents"

        try:
            results = self.service.files().list(fields="nextPageToken, files(id, name)", q=query).execute()
        except HttpError as err:
            raise ExecutionException() from err
        except Error as err:
            raise DriveCoreException("_get_files_ids global error") from err

        items = results.get('files', [])

        return items


    def _get_file_content(self, id:str) -> str:
        content_buffer = io.BytesIO()
        downloader = MediaIoBaseDownload(content_buffer, self.service.files().get_media(fileId=id))

        try:
            while downloader.next_chunk()[1] is False:
                continue
        except HttpError as err:
            raise ExecutionException() from err
        except Error as err:
            raise DriveCoreException("_get_file_content global error") from err

        content_buffer.seek(0)
        return content_buffer.read().decode(ENCODING)


    def _create_file(self, name:str, content:str, parent_id:str=None) -> str:
        metadata = {
            "name": name,
            "mimetype": MIMETYPE_TEXTFILE,
            "parents": [parent_id or "root"]
        }
        media = MediaIoBaseUpload(io.BytesIO(content.encode(ENCODING)), mimetype=MIMETYPE_TEXTFILE, resumable=True)

        try:
            results = self.service.files().create(body=metadata, media_body=media).execute()
        except HttpError as err:
            raise ExecutionException() from err
        except Error as err:
            raise DriveCoreException("_create_file global error") from err

        return results["id"]


    def _reset_folder(self, parent_id:str=None) -> None:
        batch:BatchHttpRequest = self.service.new_batch_http_request()

        for file in self._get_files_ids(parent_id):
            batch.add(self.service.files().delete(fileId=file["id"]))

        try:
            batch.execute()
        except BatchError as err:
            raise ExecutionException() from err
        except HttpError as err:
            raise ExecutionException() from err
        except Error as err:
            raise DriveCoreException("_reset_folder global error") from err
