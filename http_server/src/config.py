from dataclasses import dataclass
import os

@dataclass
class Config:
    DEBUG = False
    TESTING = False
    CSRF_ENABLED = True
    SECRET_KEY = os.environ.get('SECRET_KEY')

@dataclass
class ProductionConfig(Config):
    DEBUG = False

@dataclass
class DevelopmentConfig(Config):
    ENV = "development"
    DEVELOPMENT = True
    DEBUG = True
