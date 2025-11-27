from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.commune import router as api_router
from app.errors import register_exception_handlers

def create_app() -> FastAPI:
    app = FastAPI(title="Backend Simulateur de parité sociale")

    # CORS
    origins = [
        "http://localhost:5173",
        "http://57.131.25.249",
        "https://simulateurparitesociale.duckdns.org"
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)
    
    app.include_router(api_router, prefix="/api")

    return app
