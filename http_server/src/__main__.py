import os
import asyncio
from app import create_app, close_app

from config import DevelopmentConfig

try:
    create_app(config=DevelopmentConfig).run(
        host=os.environ.get("HOST", '0.0.0.0'), # nosec
        port=int(os.environ.get("PORT", default=5000)))
except KeyboardInterrupt:
    print("Intercept keyboard interrupt - Kill server")
finally:
    print("server closing - close connexion")
    asyncio.run(close_app())
    print("server closed")
