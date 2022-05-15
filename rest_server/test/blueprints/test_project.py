import pytest
from quart import Quart, Response, json
from flask_api import status
from ..mocks.mongo_partner import MongoPartnerMock, DOC_LIST

ID = "61e131ce9c11b699edc38a1e"
ID_LIST = [ID, ID]

@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_project_create_ok(app: Quart) -> None:
    class db_mock(MongoPartnerMock):
        async def find_one(self, *_):
            return False

    app.config["partners"]["db"] = db_mock()

    form = {
        "name": "some",
        "users_id": json.dumps(ID_LIST)
    }
    response:Response = await app.test_client().post("/project/create", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["success"] is True

@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_project_create_not_ok(app: Quart) -> None:
    class db_mock(MongoPartnerMock):
        async def find_one(self, *_):
            return False

        async def insert_one(self, *_):
            return False

    app.config["partners"]["db"] = db_mock()

    form = {
        "name": "some",
        "users_id": json.dumps(ID_LIST)
    }
    response:Response = await app.test_client().post("/project/create", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["success"] is False

@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_project_create_exist(app: Quart) -> None:
    form = {
        "name": "some",
        "users_id": json.dumps(ID_LIST)
    }
    response:Response = await app.test_client().post("/project/create", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["success"] == "already exist"


@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_project_search_for_user_ok(app: Quart) -> None:
    form = {
        "id": ID
    }
    response:Response = await app.test_client().post("/project/search_for_user", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["result"] == DOC_LIST


@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_project_add_user_ok(app: Quart) -> None:
    form = {
        "id": ID,
        "user_id": ID
    }
    response:Response = await app.test_client().post("/project/add_user", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["success"] is True

@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_project_add_user_not_ok(app: Quart) -> None:
    class db_mock(MongoPartnerMock):
        async def update_one(self, *_):
            return False

    app.config["partners"]["db"] = db_mock()

    form = {
        "id": ID,
        "user_id": ID
    }
    response:Response = await app.test_client().post("/project/add_user", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["success"] is False


@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_project_remove_user_ok(app: Quart) -> None:
    form = {
        "id": ID,
        "user_id": ID
    }
    response:Response = await app.test_client().post("/project/remove_user", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["success"] is True


@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_project_remove_user_not_ok(app: Quart) -> None:
    class db_mock(MongoPartnerMock):
        async def update_one(self, *_):
            return False

    app.config["partners"]["db"] = db_mock()

    form = {
        "id": ID,
        "user_id": ID
    }
    response:Response = await app.test_client().post("/project/remove_user", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["success"] is False


@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_project_delete_ok(app: Quart) -> None:
    form = {
        "id": ID
    }
    response:Response = await app.test_client().post("/project/delete", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["success"] is True

@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_project_delete_not_ok(app: Quart) -> None:
    class db_mock(MongoPartnerMock):
        async def delete_one(self, *_):
            return False

    app.config["partners"]["db"] = db_mock()

    form = {
        "id": ID
    }
    response:Response = await app.test_client().post("/project/delete", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["success"] is False
