# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""
import re
from datetime import datetime

from flask import request, jsonify
from flask_jwt_extended import create_access_token, get_jwt, jwt_required, get_jwt_identity, create_refresh_token, \
    verify_jwt_in_request, get_current_user

from server.app import db, jwt
from server.app.base import blueprint
from server.app.base.models import User, TokenBlocklist, Match, UserInfo
from server.app.base.util import verify_pass


def generate_response(user):
    access_token = create_access_token(identity=user)
    refresh_token = create_refresh_token(identity=user)
    return jsonify(access_token=access_token, refresh_token=refresh_token), 200


def get_player():
    return get_current_user().username


# ----------------- DEFAULT ENDPOINTS

@blueprint.route('/')
def route_default():
    return "Hello from server :)"


# ----------------- AUTH ENDPOINTS

@blueprint.route("/login", methods=["POST"])
def login():
    json_payload = request.get_json()

    username = json_payload['username']
    password = json_payload['password']

    if username is None or len(username) == 0 or password is None or len(password) == 0:
        return jsonify(authorization=False), '403 Username or password cannot be empty'

    # User.query.filter(User.username.ilike(username)).first()
    user = User.lookup(username=username)

    if user:
        if verify_pass(password, user.password):
            print(f"User {username} logged in!")
            return generate_response(user)
        else:
            return jsonify(authorization=False), '403 Incorrect password'
    return jsonify(authorization=False), '403 Username does not exist'


@blueprint.route("/register", methods=["POST"])
def register():
    json_payload = request.get_json()

    username = json_payload['username']
    password = json_payload['password']
    pid = json_payload['pid'] if 'pid' in json_payload else None

    if username is None or len(username) == 0 or password is None or len(password) == 0:
        return jsonify(authorization=False), '403 Username or password cannot be empty'

    # Check username exists
    # user = User.query.filter(User.username.ilike(username)).first()
    user = User.lookup(username=username)
    if user:
        return '', '400 Username already registered'

    # Check username and password styles are valid
    if len(username) < 1:
        return '', '400 Username cannot be empty'

    if len(username) > 32:
        return '', '400 Username cannot be longer than 32 characters'

    if len(password) < 1:
        return '', '400 Password cannot be empty'

    if not re.fullmatch(r'[A-Za-z0-9_]{1,}', username):
        return '', '400 Username cannot contain special characters or spaces'

    if not re.fullmatch(r'[A-Za-z0-9@#$%^&+=_*!]{8,}', password):
        return '', '400 Passwords needs to be at least 8 digits long and consist of alphanumerical characters ' \
                   'or @#$%^&!+=_*'

    # else we can create the user
    user = User(username=username, password=password, prolificId=pid)
    db.session.add(user)
    db.session.commit()

    print(f"User {username} registered{f' with PID: {pid}' if pid is not None else ''}!")
    return generate_response(user)


@blueprint.route("/is_registered", methods=["GET"])
def is_registered():
    pid = request.args.get('pid', default=None, type=str)
    user = None if pid is None else User.lookup_pid(pid)

    if user is not None:
        return jsonify(is_registered=True, username=user.username)
    else:
        return jsonify(is_registered=False)


@blueprint.route("/progress", methods=["GET"])
@jwt_required()
def progress():
    user = get_current_user()
    userinfo = UserInfo.lookup(user.id) is not None
    if user is None or user.prolificId is None:
        return jsonify(progress=None, completed=userinfo)
    result = Match.get_match_count(user)
    return jsonify(progress=result, completed=userinfo)


@blueprint.route('/exit_questionnaire', methods=['POST'])
@jwt_required()
def exit_questionnaire():
    json_payload = request.get_json()
    results = json_payload['results']

    if results is None:
        return {'success': False}, '400 Empty form'

    results['timestamp'] = datetime.utcnow().isoformat()
    user = get_current_user()
    userinfo = UserInfo.lookup(user.id)
    if userinfo:
        userinfo.exit_questionnaire = results
    else:
        new_results = UserInfo(user=user.id, exit_questionnaire=results)
        db.session.add(new_results)
    db.session.commit()
    return {'success': True}


@blueprint.route("/logout", methods=["GET"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    username = get_current_user().username
    print(f"User {username} logged out!")
    from server.app.game import game_queue
    game_queue.terminate_game(player=username)
    db.session.add(TokenBlocklist(jti=jti, created_at=datetime.utcnow()))
    db.session.commit()
    return jsonify(message="Token revoked"), 200


# We are using the `refresh=True` options in jwt_required to only allow
# refresh tokens to access this route.
@blueprint.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify(access_token=access_token), 200


@blueprint.route("/me", methods=["GET"])
@jwt_required()
def me():
    from flask_jwt_extended.exceptions import RevokedTokenError
    from flask_jwt_extended.exceptions import NoAuthorizationError
    from jwt import ExpiredSignatureError
    from bidict import ValueDuplicationError
    try:
        verify_jwt_in_request()
    except RevokedTokenError:
        return jsonify(error="REVOKED TOKEN"), "401 REVOKED TOKEN"
    except NoAuthorizationError:
        return jsonify(error="NOT AUTHORIZED"), "401 NOT AUTHORIZED"
    except ExpiredSignatureError:
        return jsonify(error="EXPIRED SIGNATURE"), "401 EXPIRED SIGNATURE"
    except ValueDuplicationError:
        return jsonify(error="VALUE DUPLICATE"), "401 VALUE DUPLICATE"
    user = get_current_user()
    return jsonify(username=user.username), 200


@blueprint.route('/game_list', methods=['POST'])
@jwt_required()
def game_list():
    json_payload = request.get_json()
    if 'master_key' in json_payload and json_payload['master_key'] == 'finditout_master!':
        from server.app.game import game_queue

        result = {}
        for player, game in game_queue.players_matches.items():
            if game['game_id'] not in result:
                result[game['game_id']] = {
                    'is_started': game['is_started'],
                    'difficulty': game_queue.get_game_by_id(game['game_id']).difficulty.name,
                    'players': []
                }
            result[game['game_id']]['players'].append(player)

        return jsonify(player_matches=result), 200
    return jsonify(error="NOT ALLOWED"), 403


@blueprint.route('/end_game', methods=['POST'])
@jwt_required()
def end_game():
    json_payload = request.get_json()
    if 'master_key' in json_payload and json_payload['master_key'] == 'finditout_master!':
        from server.app.game import game_queue
        if 'game_id' in json_payload:  # terminate specific game
            result, players_ids = game_queue.terminate_game(game_id=json_payload['game_id'])
            # TODO send message to all players and redirect them to home.
            if result:
                return jsonify(message='Game successfully ended'), 200
            else:
                return jsonify(message='Failed to terminate game'), 200
        else:  # terminate all games
            game_ids = list(game_queue.running_games.keys())
            for game_id in game_ids:
                game_queue.terminate_game(game_id=game_id)
            return jsonify(message='Terminated all games'), 200
    return jsonify(error="NOT ALLOWED"), 403


@blueprint.route('/force_save', methods=['POST'])
@jwt_required()
def force_save():
    json_payload = request.get_json()
    if 'master_key' in json_payload and json_payload['master_key'] == 'finditout_master!':
        from server.app.game import game_queue
        if 'game_id' in json_payload:  # terminate specific game
            game = game_queue.get_game_by_id(json_payload['game_id'])
            game.kill_game()
            return jsonify(message='Game successfully ended'), 200
        else:
            return jsonify(message='Failed to kill and save game'), 200
    return jsonify(error="NOT ALLOWED"), 403


@blueprint.route('/players_online', methods=['GET'])
def players_online():
    from server.app.game import game_queue
    waiting = game_queue.num_waiting()
    playing = len(game_queue.running_games) * 2
    return jsonify(playing=playing, waiting=waiting), 200


@blueprint.route('/in_game', methods=['GET'])
@jwt_required()
def in_game():
    from server.app.game import game_queue
    return jsonify(in_game=game_queue.is_in_active_game(get_player()))


@jwt.expired_token_loader
def my_expired_token_callback(jwt_header, jwt_payload):
    return jsonify(error="I can't let you do that"), "401 Token expired"


@jwt.revoked_token_loader
def my_revoked_token_callback(jwt_header, jwt_payload):
    return jsonify(error="I can't let you do that"), "401 Token revoked"


@jwt.invalid_token_loader
def my_invalid_token_callback(jwt_header, jwt_payload):
    return jsonify(error="I can't let you do that"), "401 Token invalid"


@jwt.token_in_blocklist_loader
def my_blocklist_token_callback(jwt_header, jwt_payload):
    return jsonify(error="I can't let you do that"), "401 Token blocked"


@jwt.unauthorized_loader
def my_blocklist_token_callback(jwt_header, jwt_payload):
    return jsonify(error="I can't let you do that"), "401 Token unauthorized"


@jwt.token_verification_failed_loader
def my_verification_failed_token_callback(jwt_header, jwt_payload):
    return jsonify(error="I can't let you do that"), "401 Verification failed"


@jwt.user_lookup_error_loader
def my_lookup_error_token_callback(jwt_header, jwt_payload):
    return jsonify(error="I can't let you do that"), "401 Lookup failed"

# @blueprint.after_request
# def cookies(response):
#     cookie = request.cookies.get('finditout_session')
#     if cookie is not None:
#         response.set_cookie(key="finditout_session", value=cookie, samesite="None", secure=True)
#     return response


## Errors

# @jwt.unauthorized_handler
# def unauthorized_handler():
#     return render_template('page-403.html'), 403

#
# @blueprint.errorhandler(403)
# def access_forbidden(error):
#     return render_template('page-403.html'), 403
#
#
# @blueprint.errorhandler(404)
# def not_found_error(error):
#     return render_template('page-404.html'), 404
#
#
# @blueprint.errorhandler(500)
# def internal_error(error):
#     return render_template('page-500.html'), 500
