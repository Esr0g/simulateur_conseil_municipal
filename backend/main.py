import os
from app import create_app
import uvicorn

app = create_app()

if __name__ == "__main__":
    # ENV est defini en production (voir le docker run du workflow de deploiement) :
    # le rechargement automatique ne doit s'activer qu'en developpement.
    RELOAD = os.getenv("ENV") is None
    PORT = int(os.getenv("PORT", "5000"))

    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=RELOAD)
