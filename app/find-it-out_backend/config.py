# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

import os
from datetime import timedelta

import redis


class Config(object):
    basedir = os.path.abspath(os.path.dirname(__file__))

    # Set up the App SECRET_KEY
    SECRET_KEY = os.environ.get('SECRET_KEY', 'REDACTED')

    # Redis session
    REDIS_URI = os.environ.get('REDIS_URL', 'REDACTED')

    # SESSION_TYPE = 'redis'
    # SESSION_TYPE = 'sqlalchemy'
    # SESSION_PERMANENT = False
    # SESSION_KEY_PREFIX = 'session:'
    # SESSION_USE_SIGNER = True
    # SESSION_COOKIE_NAME = "finditout_session"
    # SESSION_REFRESH_EACH_REQUEST = False
    # SESSION_REDIS = redis.from_url(REDIS_URI)
    JWT_ACCESS_LIFESPAN = timedelta(days=20)
    JWT_REFRESH_LIFESPAN = timedelta(days=30)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=16)

    # This will create a file in <app> FOLDER
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'db.sqlite3')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False


class ProductionConfig(Config):
    DEBUG = False

    # CACHE_TYPE = 'redis'

    # Security
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = 'None'
    REMEMBER_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_SECURE = True
    REMEMBER_COOKIE_DURATION = 3600

    JWT_COOKIE_SECURE = True

    # PostgreSQL database
    SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL'].replace("postgres://", "postgresql://", 1) \
        if 'DATABASE_URL' in os.environ \
        else 'REDACTED'
    # else '{}://{}:{}@{}:{}/{}'.format(
    # config('DB_ENGINE', default='postgresql'),
    # config('DB_USERNAME', default='find-it-out-master'),
    # config('DB_PASS', default='imthemaster'),
    # config('DB_HOST', default='localhost'),
    # config('DB_PORT', default=5432),
    # config('DB_NAME', default='finditout'))


class DebugConfig(Config):
    DEBUG = True
    SESSION_TYPE = 'filesystem'


# Load all possible configurations
config_dict = {
    'Production': ProductionConfig,
    'Debug': DebugConfig
}
