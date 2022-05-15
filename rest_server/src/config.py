from dataclasses import dataclass
import os
import pathlib

@dataclass
class Config:
    DEBUG = False
    TESTING = False
    CSRF_ENABLED = True

    BCRYPT_LOG_ROUNDS = 6
    BCRYPT_HASH_IDENT = "2b"
    BCRYPT_HANDLE_LONG_PASSWORDS = False

    MONGO_URL = f"mongodb+srv://{os.environ.get('MONGO_USERNAME')}:{os.environ.get('MONGO_PASSWORD')}@{os.environ.get('MONGO_URL')}"
    DRIVE_PATH = f"{pathlib.Path(__file__).parent.absolute()}/../credentials/service_account.json"
    DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive']

@dataclass
class ProductionConfig(Config):
    pass

@dataclass
class DevelopmentConfig(Config):
    ENV = "development"
    DEVELOPMENT = True
