from dataclasses import dataclass
from defines import *

@dataclass
class Config:
    DEBUG = False
    TESTING = False
    CSRF_ENABLED = True

    BCRYPT_LOG_ROUNDS = 6
    BCRYPT_HASH_IDENT = "2b"
    BCRYPT_HANDLE_LONG_PASSWORDS = False

@dataclass
class DevelopmentConfig(Config):
    ENV = "development"
    DEVELOPMENT = True
