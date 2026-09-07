# app/errors/handlers.py

import logging

from fastapi import Request, HTTPException
from fastapi.exceptions import RequestValidationError

from app.utils.responses import error_response

logger = logging.getLogger(__name__)


def register_exception_handlers(app):

    # Handler générique pour les erreurs HTTP
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return error_response(exc.status_code, message=exc.detail)

    # Paramètre de requête absent ou invalide : renvoyé dans l'enveloppe
    # {success, error, message, data} comme le reste de l'API, au lieu du
    # format brut {"detail": [...]} de FastAPI que le client ne sait pas lire.
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return error_response(422, message="Paramètres de requête invalides")

    # 404 Not Found (FastAPI ne passe pas par HTTPException pour ça)
    @app.exception_handler(404)
    async def not_found_handler(request: Request, exc):
        return error_response(404, message="Ressource introuvable")

    # 500 Internal Server Error
    @app.exception_handler(Exception)
    async def internal_error_handler(request: Request, exc: Exception):
        # Sans cette trace, toute erreur serveur est renvoyée en 500 muet
        # et n'apparaît nulle part dans les logs du conteneur.
        logger.exception("Erreur non gérée sur %s %s", request.method, request.url.path)
        return error_response(500, message="Une erreur interne est survenue")
