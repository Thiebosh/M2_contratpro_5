import os
import io
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import Resource, build
from googleapiclient.http import MediaIoBaseUpload, MediaIoBaseDownload, BatchHttpRequest
from googleapiclient.errors import HttpError, BatchError


# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/drive']

MIMETYPE_FOLDER = "application/vnd.google-apps.folder"
MIMETYPE_TEXTFILE = "text/plain"

ENCODING = "utf-8"


class DrivePartner:
    def __init__(self):
        self.service:Resource = build('drive', 'v3', credentials=self._get_creds('credentials.json', 'token.json', SCOPES))


    def download_files_from_folder(self, name):
        return [{
                    "name": file["name"],
                    "content": self._get_file_content(file["id"])
                }
                for file in self._get_files_ids(self._get_folder_id(name))]


    def upload_files_to_folder(self, files, parent=None):
        parent_id = self._get_parent_id(parent)

        self._reset_folder(parent_id)

        results = [self._create_file(file["name"], file["content"], parent_id) for file in files]

        return not None in results


    def _get_creds(self, cred_file, token_file, scopes):
        creds = None

        if os.path.exists(token_file):
            creds = Credentials.from_authorized_user_file(token_file, scopes)

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(cred_file, scopes)
                creds = flow.run_local_server(port=0)

            with open(token_file, 'w') as token:
                token.write(creds.to_json())

        return creds


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
