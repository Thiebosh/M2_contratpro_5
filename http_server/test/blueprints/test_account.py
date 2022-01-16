import pytest
from quart import Quart, Response
from flask_api import status
from ..mocks.mongo_partner import MongoPartnerMock, ID, PASSWORD, FIND_LIST, MANY_COUNT

@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_account_create_ok(app: Quart) -> None:
    # # mocker ici l'objet db...
    # class db_mock(MongoPartnerMock):
    #     async def find_one(self, *_):
    #         return False

    # app.config["partners"]["db"] = db_mock()

    client = app.test_client()

    form = {
        "name": "some",
        "password": "some"
    }
    response:Response = await client.post("/account/create", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["success"] == "already exist"
    # assert (await response.get_json())["success"] is True


@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_account_connect_ok(app: Quart) -> None:
    client = app.test_client()

    # mocker ici l'objet db...

    form = {
        "name": "some",
        "password": PASSWORD["text"]
    }
    response:Response = await client.post("/account/connect", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    result = await response.get_json()
    assert result["id"] == ID


@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_account_update_ok(app: Quart) -> None:
    client = app.test_client()

    # mocker ici l'objet db...

    form = {
        "id": ID,
        "name": "new",
        "password": "new"
    }
    response:Response = await client.post("/account/update", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["success"] == "already exist"
    # assert (await response.get_json())["success"] is True


@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_account_search_ok(app: Quart) -> None:
    client = app.test_client()

    # mocker ici l'objet db...

    form = {
        "name": "some"
    }
    response:Response = await client.post("/account/search", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["result"] == FIND_LIST


@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_account_delete_ok(app: Quart) -> None:
    client = app.test_client()

    # mocker ici l'objet db...

    form = {
        "id": ID
    }
    response:Response = await client.post("/account/delete", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    result = await response.get_json()
    assert  result["success"] is True
    assert  result["deleted_projects"] == MANY_COUNT
    assert  result["deleted_from_projects"] == MANY_COUNT
