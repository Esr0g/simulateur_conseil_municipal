from fastapi.responses import JSONResponse
from fastapi import status

# On conserve la même structure pour garder la compatibilité
def set_response_payload(success, error=None, message=None, data=None):
    return {
        "success": success,
        "error": error,
        "message": message,
        "data": data,
    }


def error_response(status_code: int, message: str = None):
    default_messages = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        500: "Internal Server Error",
    }

    default_message = default_messages.get(status_code, "Unknown error")

    payload = set_response_payload(
        success=False,
        error=default_message,
        message=message or default_message,
        data=None
    )

    return JSONResponse(content=payload, status_code=status_code)


def success_response(data=None, message: str = None, status_code: int = 200):
    payload = set_response_payload(
        success=True,
        error=None,
        message=message,
        data=data,
    )

    return JSONResponse(content=payload, status_code=status_code)
