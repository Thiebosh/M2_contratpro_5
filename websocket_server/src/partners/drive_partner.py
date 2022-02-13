import io
from google.oauth2.service_account import Credentials as Creds
from googleapiclient.discovery import Resource, build
from googleapiclient.http import MediaIoBaseUpload, MediaIoBaseDownload, BatchHttpRequest
from googleapiclient.errors import HttpError, BatchError

MIMETYPE_FOLDER = "application/vnd.google-apps.folder"
MIMETYPE_TEXTFILE = "text/plain"

ENCODING = "utf-8"


class DrivePartner:
    def __init__(self, creds_relative_path, scopes):
        self.creds_relative_path = creds_relative_path
        self.scopes = scopes
        self.service:Resource = build('drive', 'v3', credentials=Creds.from_service_account_file(creds_relative_path, scopes=scopes))


    def copy_partner(self):
        return DrivePartner(self.creds_relative_path, self.scopes)


    def download_files_from_folder(self, name):
        return [{
                    "name": file["name"],
                    "content": self._get_file_content(file["id"])
                }
                for file in self._get_files_ids(self._get_folder_id(name))]


    def upload_files_to_folder(self, name, files):
        folder_id = self._get_parent_id(name)

        self._reset_folder(folder_id)

        results = [self._create_file(file["name"], file["content"], folder_id) for file in files]

        return not None in results


    def _create_folder(self, name, parent_id=None):
        metadata = {
            "name": name,
            "mimeType": MIMETYPE_FOLDER,
            "parents": [parent_id or "root"]
        }

        try:
            results = self.service.files().create(body=metadata).execute()
        except HttpError as error:
            raise Exception("DrivePartner - _create_folder: execution error", error)

        return results["id"]


    def _get_parent_id(self, parent):
        return self._get_folder_id(parent) if parent else None


    def _get_folder_id(self, name, parent=None):
        parent_id = self._get_parent_id(parent)

        query = "trashed=false" +\
                f" and name='{name}'" +\
                f" and '{parent_id or 'root'}' in parents"

        try:
            results = self.service.files().list(fields="nextPageToken, files(id, name)", q=query).execute()
        except HttpError as error:
            raise Exception("DrivePartner - _get_folder_id: execution error", error)
        items = results.get('files', [])

        if len(items) > 1:
            raise Exception("DrivePartner - _get_folder_id: More than one id")

        if not items:
            return self._create_folder(name, parent_id)

        return items[0]["id"]


    def _get_files_ids(self, parent_id=None):
        query = "trashed=false" +\
                f" and mimeType!='{MIMETYPE_FOLDER}'" +\
                f" and '{parent_id or 'root'}' in parents"

        try:
            results = self.service.files().list(fields="nextPageToken, files(id, name)", q=query).execute()
        except HttpError as error:
            raise Exception("DrivePartner - _get_files_ids: execution error", error)
        items = results.get('files', [])

        return items


    def _get_file_content(self, id):
        content_buffer = io.BytesIO()
        downloader = MediaIoBaseDownload(content_buffer, self.service.files().get_media(fileId=id))

        try:
            while downloader.next_chunk()[1] is False:
                continue
        except HttpError as error:
            raise Exception("DrivePartner - _get_file_content: execution error", error)

        content_buffer.seek(0)
        return content_buffer.read().decode(ENCODING)


    def _create_file(self, name, content, parent_id=None):
        metadata = {
            "name": name,
            "mimetype": MIMETYPE_TEXTFILE,
            "parents": [parent_id or "root"]
        }
        media = MediaIoBaseUpload(io.BytesIO(content.encode(ENCODING)), mimetype=MIMETYPE_TEXTFILE, resumable=True)

        try:
            results = self.service.files().create(body=metadata, media_body=media).execute()
        except HttpError as error:
            raise Exception("DrivePartner - _create_file: execution error", error)

        return results["id"]


    def _reset_folder(self, parent_id=None):
        batch:BatchHttpRequest = self.service.new_batch_http_request()

        for file in self._get_files_ids(parent_id):
            batch.add(self.service.files().delete(fileId=file["id"]))

        try:
            batch.execute()
        except BatchError as error:
            raise Exception("DrivePartner - _reset_folder: execution error", error)
