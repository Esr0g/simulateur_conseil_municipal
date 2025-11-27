# app/errors/handlers.py

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from app.utils.responses import error_response


def register_exception_handlers(app):

    # Handler générique pour les erreurs HTTP
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return error_response(exc.status_code, message=exc.detail)

    # 404 Not Found (FastAPI ne passe pas par HTTPException pour ça)
    @app.exception_handler(404)
    async def not_found_handler(request: Request, exc):
        return error_response(404, message="Ressource introuvable")

    # 500 Internal Server Error
    @app.exception_handler(Exception)
    async def internal_error_handler(request: Request, exc: Exception):
        # Log interne si besoin :
        # print(exc)
        return error_response(500, message="Une erreur interne est survenue")
