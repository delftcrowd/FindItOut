# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""
import os
from sys import exit

from decouple import config
from flask_migrate import Migrate

from config import config_dict
from server.app import create_app, db, sio

DEBUG = config('DEBUG', default=True, cast=bool)

get_config_mode = 'Debug' if DEBUG else 'Production'

try:
    app_config = config_dict[get_config_mode.capitalize()]

except KeyError:
    exit('Error: Invalid <config_mode>. Expected values [Debug, Production] ')

app = create_app(app_config)
Migrate(app, db)

import server.app.base.sockets  # noqa

if DEBUG:
    app.logger.info('DEBUG       = ' + str(DEBUG))
    app.logger.info('Environment = ' + get_config_mode)
    app.logger.info('DBMS        = ' + app_config.SQLALCHEMY_DATABASE_URI)

if __name__ == "__main__":
    # web: gunicorn --worker-class eventlet -w 1 -b 0.0.0.0:$PORT app: app
    # web: python ./app.py -p $PORT
    sio.run(app, host='0.0.0.0', port=os.environ.get('PORT', 5000), debug=DEBUG)
    # app.run(host='0.0.0.0', port=os.environ.get('PORT', 5000), debug=True)

# pygount --suffix=py --folders-to-skip=env --format=summary
# gunicorn --worker-class eventlet -w 1 -b 0.0.0.0:5000 app:app
