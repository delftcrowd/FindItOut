# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from flask import Blueprint

# from server.app import CORS_origins, cors

blueprint = Blueprint(
    'base_blueprint',
    __name__,
    url_prefix='/api',
    template_folder='templates',
    static_folder='static'
)

from . import routes, sockets  # noqa

# cors.init_app(app=blueprint, support_credentials=True, origins=CORS_origins)
