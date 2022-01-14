from dataclasses import dataclass
import os

@dataclass
class Config:
    DEBUG = False
    TESTING = False
    CSRF_ENABLED = True

    SECRET_KEY = os.environ.get('SECRET_KEY')

    BCRYPT_LOG_ROUNDS = 6
    BCRYPT_HASH_IDENT = "2b"
    BCRYPT_HANDLE_LONG_PASSWORDS = False

@dataclass
class ProductionConfig(Config):
    DEBUG = False

@dataclass
class DevelopmentConfig(Config):
    ENV = "development"
    DEVELOPMENT = True
    DEBUG = True
