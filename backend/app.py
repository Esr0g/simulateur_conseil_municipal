from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

CORS(app, resources={
    r"/api/*": {"origins": ["http://localhost:5173", "http://host.docker.internal:5173"]}
})

@app.before_request
def log_origin():
    print("Origin header:", request.headers.get("Origin"))

@app.route('/api/hello')
def hello():
    return jsonify(message="Hello from Flask!")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
