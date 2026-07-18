from flask import Flask, jsonify
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    @app.get('/api/health')
    def health():
        return jsonify(status='ok', service='kmrl-orbit-api')

    return app

app = create_app()
