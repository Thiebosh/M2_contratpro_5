import pytest
from quart import Quart, Response
from flask_api import status


@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_404_http_ok(app: Quart) -> None:
    client = app.test_client()

    response:Response = await client.get("/some_url")
    assert response.status_code == status.HTTP_404_NOT_FOUND
