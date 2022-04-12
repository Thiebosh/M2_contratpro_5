from dataclasses import dataclass
import os
import pathlib

os.environ.setdefault("MONGO_USERNAME", "thibaut")
os.environ.setdefault("MONGO_PASSWORD", "thibaut")
os.environ.setdefault("MONGO_URL", "cluster0.7geff.mongodb.net/TP1?retryWrites=true&w=majority")

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
    DEBUG = False

@dataclass
class DevelopmentConfig(Config):
    ENV = "development"
    DEVELOPMENT = True
    DEBUG = True
