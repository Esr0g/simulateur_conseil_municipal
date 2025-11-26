from fastapi import APIRouter

# Router principal pour tout le module API
router = APIRouter()

# Importer ici toutes les sous-routes
from .commune import router as commune_router

# Ajouter chaque sous-router au router principal
router.include_router(commune_router)
