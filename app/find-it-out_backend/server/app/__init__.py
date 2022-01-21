# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from importlib import import_module

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
# from flask_login import LoginManager
from flask_session import Session
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
# login_manager = LoginManager()
sio = SocketIO()
sess = Session()
cors = CORS()
jwt = JWTManager()
CORS_origins = ["https://finditout.vercel.app", "https://find-it-out.netlify.app", "https://finditout.herokuapp.com/",
                "http://localhost:3000", "http://127.0.0.1", "http://192.168.2.133:3000"]


def register_extensions(app):
    jwt.init_app(app)
    db.init_app(app)
    app.config['SESSION_SQLALCHEMY'] = db
    # login_manager.init_app(app)
    sess.init_app(app)
    cors.init_app(app=app, supports_credentials=True, origins=CORS_origins, resources=r"/api/*")
    sio.init_app(app,
                 # logger=True, engineio_logger=True,
                 cors_allowed_origins=CORS_origins,
                 manage_session=False, cookie='finditout_session')


def register_blueprints(app):
    for module_name in ['base']:
        module = import_module('server.app.{}.routes'.format(module_name))
        app.register_blueprint(module.blueprint)


def configure_database(app):
    @app.before_first_request
    def initialize_database():
        db.create_all()

    @app.teardown_request
    def shutdown_session(exception=None):
        db.session.remove()


def create_app(config):
    app = Flask(__name__)
    app.config.from_object(config)
    register_blueprints(app)
    register_extensions(app)
    configure_database(app)

    from server.app.base.models import configure_jwt
    configure_jwt(jwt)

    return app
