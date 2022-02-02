import os
import io
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import Resource, build
from googleapiclient.http import MediaIoBaseUpload, MediaIoBaseDownload

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly',
          'https://www.googleapis.com/auth/drive']

MIMETYPE_FOLDER = "application/vnd.google-apps.folder"


class DrivePartner:
    def __init__(self):
        self.service:Resource = build('drive', 'v3', credentials=self._get_creds('credentials.json', 'token.json', SCOPES))


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


    def _create_folder(self, name, parent=None):
        if parent:
            parent_id = self.get_folder_id(parent)
            if not parent_id:
                return None

        metadata = {
            "name": name,
            "mimeType": MIMETYPE_FOLDER,
            "parents": [parent_id if parent else "root"]
        }
        # print("_create_folder : ", metadata)

        results = self.service.files().create(body=metadata).execute()
        # print("_create_folder : ", results["id"])

        return results["id"]


    def _get_folder_id(self, name, parent=None):
        query = "trashed=false" +\
                f" and name='{name}'" +\
                f" and '{self._get_folder_id(parent) if parent else 'root'}' in parents"
        # print("_get_folder_id : ", query)

        results = self.service.files().list(fields="nextPageToken, files(id, name)", q=query).execute()
        items = results.get('files', [])
        # print("_get_folder_id : ", items)

        if len(items) > 1:
            return None # throw error ?

        if not items:
            return self._create_folder(name, parent)

        return items[0]["id"]


    def _get_files_ids(self, parent=None):
        query = "trashed=false" +\
                f" and mimeType!='{MIMETYPE_FOLDER}'" +\
                f" and '{self._get_folder_id(parent) if parent else 'root'}' in parents"
        print("_get_files_ids : ", query)

        results = self.service.files().list(fields="nextPageToken, files(id, name)", q=query).execute()
        items = results.get('files', [])
        print("_get_files_ids : ", items)

        return items


    def _get_file_content(self, id):
        content_buffer = io.BytesIO()
        downloader = MediaIoBaseDownload(content_buffer, self.service.files().get_media(fileId=id))

        while downloader.next_chunk()[1] is False:
            continue

        content_buffer.seek(0)
        return content_buffer.read().decode('UTF-8')


    def download_files_from_folder(self, parent=None):
        return [{
                    "name": file["name"],
                    "content": self._get_file_content(file["id"])
                }
                for file in self._get_files_ids(parent)]


    def _create_file(self, name, content, parent_id=None):
        metadata = {
            'name': name,
            'mimetype': 'application/vnd.google-apps.document',
            "parents": [parent_id if parent_id else "root"]
        }
        media = MediaIoBaseUpload(io.BytesIO(content.encode('utf-8')), mimetype="text/plain", resumable=True)
        print("_create_file : ", metadata)

        results = self.service.files().create(body=metadata, media_body=media).execute()
        print("_create_file : ", results["id"])

        return results["id"]


    def _reset_folder(self, parent_id=None):
        pass
        # https://stackoverflow.com/questions/33692184/how-to-delete-multiple-files-at-once-using-google-drive-api


    def upload_files_to_folder(self, files, parent=None):
        parent_id = None
        if parent:
            parent_id = self._get_folder_id(parent)
            if not parent_id:
                return None

        self._reset_folder(parent_id)

        results = [self._create_file(file["name"], file["content"], parent_id) for file in files]

        return not None in results
