from flask import jsonify
from werkzeug.http import HTTP_STATUS_CODES

def set_response_payload(success, error=None, message=None, data=None):
    return {
        "success": success,
        "error": error,
        "message": message,
        "data": data,
    }

def error_response(status_code, message=None):
    # Message générique basé sur le statut HTTP
    default_message = HTTP_STATUS_CODES.get(status_code, "Unknown error")
    
    payload = set_response_payload(success=False, error=default_message, message=message or default_message)

    return jsonify(payload), status_code

def success_response(data=None, message=None, status_code=200):
    payload = set_response_payload(success=True, message=message, data=data)
    
    return jsonify(payload), status_code