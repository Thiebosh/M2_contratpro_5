import pytest
from quart import Quart, Response
from flask_api import status
from ..mocks.mongo_partner import ID, FIND_LIST

@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_project_create_ok(app: Quart) -> None:
    client = app.test_client()

    # mocker ici l'objet db...

    form = {
        "name": "some",
        "users_id": [ID, ID]
    }
    response:Response = await client.post("/project/create", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["result"] == "already exist"
    # assert (await response.get_json())["success"] is True


@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_project_add_user_ok(app: Quart) -> None:
    client = app.test_client()

    # mocker ici l'objet db...

    form = {
        "id": ID,
        "user_id": ID
    }
    response:Response = await client.post("/project/add_user", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["updated"] is True


@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_project_remove_user_ok(app: Quart) -> None:
    client = app.test_client()

    # mocker ici l'objet db...

    form = {
        "id": ID,
        "user_id": ID
    }
    response:Response = await client.post("/project/remove_user", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["updated"] is True


@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_project_search_by_user_ok(app: Quart) -> None:
    client = app.test_client()

    # mocker ici l'objet db...

    form = {
        "id": ID
    }
    response:Response = await client.post("/project/search_by_user", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["result"] == FIND_LIST


@pytest.mark.asyncio
@pytest.mark.usefixtures("app")
async def test_project_delete_ok(app: Quart) -> None:
    client = app.test_client()

    # mocker ici l'objet db...

    form = {
        "id": ID
    }
    response:Response = await client.post("/project/delete", form=form)

    assert response.status_code == status.HTTP_200_OK
    assert response.mimetype == "application/json"
    assert (await response.get_json())["deleted"] is True
