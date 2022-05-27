from app import create_app
from config import DevelopmentConfig
from defines import *

create_app(config=DevelopmentConfig).run(host=OS_HOST, port=OS_PORT)
