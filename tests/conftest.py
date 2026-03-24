import pytest
from httpx import ASGITransport, AsyncClient

from klose.main import app
from klose.database import init_db
from klose.seed import seed_database


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture(scope="session")
async def client():
    await init_db()
    await seed_database()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", follow_redirects=True) as ac:
        yield ac
