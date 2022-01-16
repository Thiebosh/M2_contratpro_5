import pytest
from quart import Quart, Response
from flask_api import status
from ..mocks.mongo_partner import MongoPartnerMock, DEFAULT_COUNT, DOC_LIST

ID = "61e131ce9c11b699edc38a1e"
PASSWORD = {
    "text": "some",
    "hash": "$2b$06$88TtU0r7BDfsjvwcDH72QeLCbq3CyjK5J8Mbe1HmfDiotl8TaVfq2"
}

@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_account_create_ok(app: Quart) -> None:
    class db_mock(MongoPartnerMock):
        async def find_one(self, *_):
            return False

    app.config["partners"]["db"] = db_mock()

    form = {
        "name": "some",
        "password": "some"
    }
    response:Response = await app.test_client().post("/account/create", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["success"] is True

@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_account_create_not_ok(app: Quart) -> None:
    class db_mock(MongoPartnerMock):
        async def find_one(self, *_):
            return False

        async def insert_one(self, *_):
            return False

    app.config["partners"]["db"] = db_mock()

    form = {
        "name": "some",
        "password": "some"
    }
    response:Response = await app.test_client().post("/account/create", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["success"] is False

@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_account_create_exist(app: Quart) -> None:
    form = {
        "name": "some",
        "password": "some"
    }
    response:Response = await app.test_client().post("/account/create", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["success"] == "already exist"


@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_account_connect_ok(app: Quart) -> None:
    class db_mock(MongoPartnerMock):
        async def find_one(self, *_):
            return {
                "id": ID,
                "password": PASSWORD["hash"]
            }

    app.config["partners"]["db"] = db_mock()

    form = {
        "name": "some",
        "password": PASSWORD["text"]
    }
    response:Response = await app.test_client().post("/account/connect", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    result = await response.get_json()
    assert result["id"] == ID

@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_account_connect_wrong_password(app: Quart) -> None:
    class db_mock(MongoPartnerMock):
        async def find_one(self, *_):
            return {
                "id": ID,
                "password": PASSWORD["hash"]
            }

    app.config["partners"]["db"] = db_mock()

    form = {
        "name": "some",
        "password": "wrong"
    }
    response:Response = await app.test_client().post("/account/connect", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    result = await response.get_json()
    assert result["id"] is False

@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_account_connect_wrong_user(app: Quart) -> None:
    class db_mock(MongoPartnerMock):
        async def find_one(self, *_):
            return False

    app.config["partners"]["db"] = db_mock()

    form = {
        "name": "some",
        "password": "wrong"
    }
    response:Response = await app.test_client().post("/account/connect", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    result = await response.get_json()
    assert result["id"] is False


@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_account_update_ok(app: Quart) -> None:
    class db_mock(MongoPartnerMock):
        async def find_one(self, *_):
            return False

    app.config["partners"]["db"] = db_mock()

    form = {
        "id": ID,
        "name": "new",
        "password": "new"
    }
    response:Response = await app.test_client().post("/account/update", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["success"] is True

@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_account_update_not_ok(app: Quart) -> None:
    class db_mock(MongoPartnerMock):
        async def find_one(self, *_):
            return False

        async def update_one(self, *_):
            return False

    app.config["partners"]["db"] = db_mock()

    form = {
        "id": ID,
        "name": "new",
        "password": "new"
    }
    response:Response = await app.test_client().post("/account/update", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["success"] is False

@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_account_update_exist(app: Quart) -> None:
    form = {
        "id": ID,
        "name": "new",
        "password": "new"
    }
    response:Response = await app.test_client().post("/account/update", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["success"] == "already exist"


@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_account_search_ok(app: Quart) -> None:
    form = {
        "name": "some"
    }
    response:Response = await app.test_client().post("/account/search", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["result"] == DOC_LIST


@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_account_delete_ok(app: Quart) -> None:
    delete_count = 3
    update_count = 5
    class db_mock(MongoPartnerMock):
        async def delete_many(self, *_):
            return delete_count

        async def update_many(self, *_):
            return update_count

    app.config["partners"]["db"] = db_mock()

    form = {
        "id": ID
    }
    response:Response = await app.test_client().post("/account/delete", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    result = await response.get_json()
    assert  result["success"] is True
    assert  result["deleted_projects"] == delete_count
    assert  result["deleted_from_projects"] == update_count

@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_account_delete_not_ok(app: Quart) -> None:
    class db_mock(MongoPartnerMock):
        async def delete_one(self, *_):
            return False

    app.config["partners"]["db"] = db_mock()

    form = {
        "id": ID
    }
    response:Response = await app.test_client().post("/account/delete", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    result = await response.get_json()
    assert  result["success"] is False
    assert  result["deleted_projects"] == DEFAULT_COUNT
    assert  result["deleted_from_projects"] == DEFAULT_COUNT
