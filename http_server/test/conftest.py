from typing import AsyncGenerator

from test.mocks.mongo_partner import MongoPartnerMock
from test.mocks.drive_partner import DrivePartnerMock

import pytest
from quart import Quart

from src.config import DevelopmentConfig
from src.app import create_app


@pytest.fixture(scope="function")
async def app() -> AsyncGenerator[Quart, None]:
    _app:Quart = create_app(config=DevelopmentConfig, db=MongoPartnerMock(), nas=DrivePartnerMock())
    async with _app.test_app():
        yield _app
