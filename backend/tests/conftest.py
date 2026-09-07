import os
from pathlib import Path

# app/api/commune.py charge les parquets au moment de l'import : DATA_DIR doit
# être positionné avant que l'application soit importée par un test.
DONNEES = Path(__file__).resolve().parents[2] / "data" / "processed"
os.environ.setdefault("DATA_DIR", DONNEES.as_posix())

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app import create_app  # noqa: E402


@pytest.fixture(scope="session")
def client():
    # raise_server_exceptions=False : on veut vérifier la réponse 500 renvoyée
    # au client, pas voir l'exception remonter dans le test.
    return TestClient(create_app(), raise_server_exceptions=False)
