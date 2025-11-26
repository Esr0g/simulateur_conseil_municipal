from werkzeug.exceptions import HTTPException
from app.errors import bp
from flask import current_app
from app.api.responses import error_response

def bad_request(error):
    msg = getattr(error, "description", None)
    return error_response(404, msg)


@bp.app_errorhandler(404)
def not_found_error(error):
   return error_response(404, error.description)


@bp.app_errorhandler(500)
def internal_error(error):
    return error_response(500)

@bp.errorhandler(HTTPException)
def handle_exception(e):
    current_app.logger.warning(e)
    return error_response(e.code, getattr(e, "description", None))