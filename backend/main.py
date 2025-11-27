import os
from app import create_app
import uvicorn

app = create_app()

if __name__ == "__main__":
    ENV = False if os.getenv("ENV") else True
    PORT = os.getenv("PORT", 5000)

    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=ENV)
