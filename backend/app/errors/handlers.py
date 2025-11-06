from werkzeug.http import HTTP_STATUS_CODES
from werkzeug.exceptions import HTTPException
from app.errors import bp
from flask import current_app


def error_response(status_code, message=None):
    payload = {'error': HTTP_STATUS_CODES.get(status_code, message)}
    if message:
        payload['message'] = message
    return payload, status_code

def bad_request(message):
    return error_response(400, message)


@bp.app_errorhandler(404)
def not_found_error(error):
   return error_response(404, error.description)


@bp.app_errorhandler(500)
def internal_error(error):
    return error_response(500)

@bp.errorhandler(HTTPException)
def handle_exception(e):
    current_app.logger.warning(e)
    return error_response(e.code)