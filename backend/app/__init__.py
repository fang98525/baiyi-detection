from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config

db = SQLAlchemy()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)

    from app.routes import project, auth
    app.register_blueprint(project.bp)
    app.register_blueprint(auth.bp)

    @app.route('/')
    def index():
        return "白蚁监测平台后端服务运行中..."

    return app

