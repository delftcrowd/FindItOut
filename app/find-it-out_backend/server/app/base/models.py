# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""
from datetime import datetime

from flask_login import UserMixin
from sqlalchemy import func

from server.app import db
from server.app.base.base_model import BaseModel
from server.app.base.util import hash_pass


# flask db init
# flask db migrate -m "Adding column x."
# flask db upgrade


# import app
# from server.app import db
# with app.app.app_context():
#     db.create_all()


class Match(BaseModel):
    __tablename__ = 'Match'

    id = db.Column(db.Integer, primary_key=True)
    origin = db.Column(db.Text)
    difficulty = db.Column(db.String(length=8), nullable=False)
    player1 = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)
    player2 = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)
    startTime = db.Column(db.DateTime, default=datetime.utcnow())
    endTime = db.Column(db.DateTime)
    player1Actions = db.Column(db.JSON)
    player2Actions = db.Column(db.JSON)
    player1Card = db.Column(db.JSON)
    player2Card = db.Column(db.JSON)
    objects = db.Column(db.JSON)
    guessCard = db.Column(db.JSON)
    winner = db.Column(db.Integer, db.ForeignKey('User.id'))
    bonus = db.Column(db.Boolean, nullable=True)
    forfeited = db.Column(db.Boolean, default=False, server_default='false')

    _default_fields = [
        'id',
        'difficulty'
        'player1',
        'player2',
        'objects',
        'player1Actions',
        'player2Actions',
        'startTime',
        'endTime',
        'winner'
    ]

    # _hidden_fields = [
    #     'player1Actions',
    #     'player2Actions',
    # ]
    # _readonly_fields = [
    #     'startTime',
    #     'endTime',
    #     'duration',
    # ]

    # TODO Optimize with caching?
    @classmethod
    def get_match_count(cls, user):
        from server.app.game.difficulty import Difficulties

        player_id = user.id
        matches = cls.query.filter((cls.player1 == player_id) | (cls.player2 == player_id)).all()
        results = {diff.name: 0 for diff in Difficulties.get_difficulties()}
        for match in matches:
            if match.forfeited:
                continue
            results[match.difficulty] += 1
        return results

    # difference = later_time - first_time
    # seconds_in_day = 24 * 60 * 60
    # divmod(difference.days * seconds_in_day + difference.seconds, 60)


class ConceptImage(BaseModel):
    __tablename__ = 'ConceptImage'

    id = db.Column(db.Integer, primary_key=True)
    concept = db.Column(db.Text, nullable=False)
    url = db.Column(db.Text, nullable=False)


class UserInfo(BaseModel):
    __tablename__ = 'UserInfo'

    id = db.Column(db.Integer, primary_key=True)
    user = db.Column(db.Integer, db.ForeignKey('User.id'), unique=True, nullable=False)
    exit_questionnaire = db.Column(db.JSON)

    @classmethod
    def lookup(cls, user_id):
        return cls.query.filter_by(user=user_id).one_or_none()


class User(BaseModel, UserMixin):
    __tablename__ = 'User'

    id = db.Column(db.Integer, primary_key=True)
    prolificId = db.Column(db.String(length=24))
    username = db.Column(db.String(length=32), unique=True, nullable=False)
    password = db.Column(db.LargeBinary, nullable=False)
    dateAdded = db.Column(db.DateTime, default=datetime.utcnow, server_default=func.now(), nullable=False)

    _default_fields = [
        "id",
        "username"
    ]
    _hidden_fields = [
        "password"
    ]

    @classmethod
    def lookup(cls, username):
        return cls.query.filter_by(username=username).one_or_none()

    @classmethod
    def lookup_pid(cls, pid):
        return cls.query.filter_by(prolificId=pid).one_or_none()

    @classmethod
    def identify(cls, id):
        return cls.query.get(id)

    @property
    def identity(self):
        return self.id

    def __init__(self, **kwargs):
        for property, value in kwargs.items():
            # depending on whether value is an iterable or not, we must
            # unpack it's value (when **kwargs is request.form, some values
            # will be a 1-element list)
            if hasattr(value, '__iter__') and not isinstance(value, str):
                # the ,= unpack of a singleton fails PEP8 (travis flake8 test)
                value = value[0]

            if property == 'password':
                value = hash_pass(value)  # we need bytes here (not plain str)

            setattr(self, property, value)

    def __repr__(self):
        return str(self.username)


# This could be expanded to fit the needs of your application. For example,
# it could track who revoked a JWT, when a token expires, notes for why a
# JWT was revoked, an endpoint to un-revoked a JWT, etc.
class TokenBlocklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)


def configure_jwt(jwt):
    # Register a callback function that takes whatever object is passed in as the
    # identity when creating JWTs and converts it to a JSON serializable format.
    @jwt.user_identity_loader
    def user_identity_lookup(user):
        return user.id

    # Register a callback function that loades a user from your database whenever
    # a protected route is accessed. This should return any python object on a
    # successful lookup, or None if the lookup failed for any reason (for example
    # if the user has been deleted from the database).
    @jwt.user_lookup_loader
    def user_lookup_callback(jwt_header, jwt_payload):
        identity = jwt_payload["sub"]
        return User.identify(identity)

    # Callback function to check if a JWT exists in the database blocklist
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        token = db.session.query(TokenBlocklist.id).filter_by(jti=jti).scalar()
        return token is not None

#
# @login_manager.user_loader
# def user_loader(id):
#     return User.query.get(int(id))
#
#
# @login_manager.request_loader
# def request_loader(request):
#     # first, try to login using the api_key url arg
#     api_key = request.args.get('api_key')
#     if api_key:
#         user = User.query.filter_by(api_key=api_key).first()
#         if user:
#             return user
#
#     # next, try to login using Basic Auth
#     api_key = request.headers.get('Authorization')
#     if api_key:
#         api_key = api_key.replace('Basic ', '', 1)
#         try:
#             api_key = base64.b64decode(api_key)
#         except TypeError:
#             pass
#         user = User.query.filter_by(api_key=api_key).first()
#         if user:
#             return user

# finally, return None if both methods did not login the user
# return None

# username = request.form.get('username')
# if username is None:
#     return None
# user = User.query.filter(User.username.ilike(username)).first()
# return user if user else None
