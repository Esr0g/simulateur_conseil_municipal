from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    from app.errors import bp as errors_bp
    app.register_blueprint(errors_bp)

    from app.api import bp as api_bp
    app.register_blueprint(api_bp, url_prefix='/api')


    CORS(app, resources={
        r"/api/*": {"origins": ["http://localhost:5173", "http://host.docker.internal:5173", "http://192.168.1.41:5173"]}
    })

    return app

