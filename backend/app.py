from app import create_app

app = create_app()

# from backend.app.database import db_init

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)