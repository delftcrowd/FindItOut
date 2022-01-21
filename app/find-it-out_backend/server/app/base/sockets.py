from flask import request
from flask_jwt_extended import jwt_required, get_current_user
from flask_socketio import join_room, leave_room
from statemachine.exceptions import TransitionNotAllowed

from server.app import sio
from server.app.game import game_queue
from server.app.game.FindItOut import FindItOut
from server.app.game.difficulty import Difficulties
from server.app.game.utils import Roles

users = dict()


def emit(event, data, game: FindItOut, player_num=0, player=None):
    if player is not None:
        player_num = game.get_player_num(player)
    online = game.p1_online if player_num == 1 else game.p2_online
    if not online:
        return
    p = player if player is not None else game.player_1 if player_num == 1 else game.player_2
    sio.emit(event=event, data=data, to=users[p])


def get_player():
    return get_current_user().username


def start_game(game_id, game):
    emit('opponent', game.player_2, game, 1)
    emit('opponent', game.player_1, game, 2)
    emit('cards', game.get_p1_board(), game, 1)
    emit('cards', game.get_p2_board(), game, 2)
    emit('itCard', game.p1_card, game, 1)
    emit('itCard', game.p2_card, game, 2)
    emit('start', None, game, 1)
    emit('start', None, game, 2)
    update_roles(game_id, game)
    # emit('start', room=game_id)


def update_roles(game_id, game: FindItOut):
    emit('role', game.p1_role.name, game, 1)
    emit('role', game.p2_role.name, game, 2)
    emit('turn', game.is_my_turn(game.player_1), game, 1)
    emit('turn', game.is_my_turn(game.player_2), game, 2)
    if game.current_state == game.replier_reply:
        emit('question', game.get_question(), game, 1)
        emit('question', game.get_question(), game, 2)
    elif game.current_state == game.asker_flip:
        emit('question', game.get_question(), game, 1)
        emit('question', game.get_question(), game, 2)
        emit('answer', game.get_reply(), game, 1)
        emit('answer', game.get_reply(), game, 2)
    elif game.current_state == game.replier_bonus:
        emit('questionHistory', game.get_p1_question_history() if game.get_player_num(
            game.winner) == 1 else game.get_p2_question_history(), game, player=game.winner)
        emit('gameover', True, game, player=game.winner)
        emit('opponentItCard', game.p2_card if game.player_1 == game.winner else game.p1_card, game, player=game.winner)
        emit('won', True, game, player=game.winner)
        emit('bonus', None, game, player=game.get_opponent(game.winner))
    elif game.current_state == game.endgame:
        emit('won', True, game, player=game.winner)
        if game.bonus is not None:
            emit('won', game.bonus, game, player=game.get_opponent(game.winner))
        else:
            emit('won', False, game, player=game.get_opponent(game.winner))
        emit('questionHistory', game.get_p1_question_history(), game, 1)
        emit('questionHistory', game.get_p2_question_history(), game, 2)
        emit('opponentItCard', game.p2_card, game, 1)
        emit('opponentItCard', game.p1_card, game, 2)
        emit('gameover', game.forfeited, game, 1)
        emit('gameover', game.forfeited, game, 2)

    emit('stage', game.current_state.name, game, 1)
    emit('stage', game.current_state.name, game, 2)


def end_game(game, game_id, winner, forfeited=False):
    emit('opponentItCard', game.p2_card, game, 1)
    emit('opponentItCard', game.p1_card, game, 2)
    emit('won', True, game, player=winner)
    emit('won', False, game, player=game.get_opponent(winner))
    emit('gameover', forfeited, game, player=game.player_1)
    emit('gameover', forfeited, game, player=game.player_2)
    # emit('gameover', forfeited, to=game_id)
    # game_queue.end_game(game_id)


@sio.on('connect')
@jwt_required()
def on_connect():
    player = get_player()
    users[player] = request.sid
    if game_queue.is_in_game(player):
        game_id = game_queue.get_game_id(player)
        game = game_queue.get_game_by_id(game_id)
        game.set_player_online(player, True)
        join_room(room=game_id)
        sio.emit('join', data=player, room=game_id, include_self=False)
    print(f"{request.sid} : {get_player()} connected!")


@sio.on('disconnect')
@jwt_required()
def on_disconnect():
    player = get_player()
    # users.pop(player)
    game_id = game_queue.get_game_id(player)
    if game_id:
        game = game_queue.get_game_by_id(game_id)
        if game.started:
            sio.emit('leave', data=player, room=game_id)
            # game.set_player_online(player, False)
        else:
            # game_queue.disconnect(game_id, player)
            pass
        # game_queue.end_game(game_id)
        # leave_room(room=game_id)
    print(f"{request.sid} : {player} disconnected!")


@sio.on('leave')
@jwt_required()
def on_leave():
    # sent only leaving from lobby or at the end screen
    player = get_player()
    # users.pop(player)
    game_id = game_queue.get_game_id(player)
    if game_id:
        game = game_queue.get_game_by_id(game_id)
        if game.started:
            # sio.emit('leave', data=player, room=game_id)
            game_queue.players_matches.pop(player)
            game.set_player_online(player, False)
        else:
            game_queue.disconnect(game_id, player)
        leave_room(room=game_id)
    print(f"{request.sid} : {player} left!")


@sio.on('join')
@jwt_required()
def on_join(difficulty):
    player = get_player()
    difficulty = difficulty['difficulty']
    print(f"{player} joining new game with difficulty {difficulty}!")
    # tell the client his own username
    sio.emit(event='me', data=player, to=request.sid)

    # signals that the player is in an active game
    if game_queue.is_in_active_game(player):
        game = game_queue.get_game(player)
        game.set_player_online(player, True)
        return True

    # signals that game has not yet started, but still loading
    if game_queue.is_in_game(player):
        game_id = game_queue.get_game_id(player)
        game: FindItOut = game_queue.get_game_by_id(game_id)
        if game.started:
            start_game(game_id, game)
        if game.player_2 is not None:
            emit('opponent', game.player_2, game, 1)
            emit('opponent', game.player_1, game, 2)
        sio.emit(event='session', data=game_id, to=request.sid)
        return False

    difficulty = Difficulties.parse_difficulty(difficulty)

    game_id, game = game_queue.join_game(player, difficulty)

    sio.emit(event='session', data=game_id, to=request.sid)
    # tell the player the game id

    join_room(room=game_id)
    player_num = game.add_player(player)

    if player_num == 2:
        # tell each other's opponent name
        # emit('opponent', game.player_2, to=users[game.player_1])
        # emit('opponent', game.player_1, to=users[game.player_2])
        if game_queue.start_game(game_id):
            # start_game(game_id, game)
            print("Both players joined.")
        else:
            print("Somehow failed to start game...??")


@sio.on('in_active_game')
@jwt_required()
def is_in_active_game():
    return game_queue.is_in_active_game(get_player())


@sio.on('get_whole_game')
@jwt_required()
def get_whole_game():
    player = get_player()
    game_id = game_queue.get_game_id(player)
    game: FindItOut = game_queue.get_game_by_id(game_id)
    player_num = game.get_player_num(player)
    other_player = game.get_opponent(player)
    sio.emit('me', data=player, to=request.sid)
    sio.emit('relations', data=game.get_relations(), to=request.sid)

    sio.emit('opponent', data=other_player, to=request.sid)
    sio.emit('cards', data=game.get_p1_board() if player_num == 1 else game.get_p2_board(), to=request.sid)
    sio.emit('itCard', data=game.p1_card if player_num == 1 else game.p2_card, to=request.sid)
    sio.emit('questionHistory',
             data=game.get_p1_question_history() if player_num == 1 else game.get_p2_question_history(), to=request.sid)

    update_roles(game_id, game)
    # check if we actually need to send a start message
    # sio.emit('start', to=request.sid)
    return True


@sio.on('send_question')
@jwt_required()
def ask_question(question):
    player = get_player()
    game_id = game_queue.get_game_id(player)
    game: FindItOut = game_queue.get_game(player)

    question_type = question['question_type']
    target = question['target']

    try:
        if game.get_role(player) == Roles.ASKER:
            game.ask(question_type, target)
            update_roles(game_id=game_id, game=game)
        else:
            return {'ack': False, 'msg': 'Not your turn yet.'}
    except TransitionNotAllowed:
        return {'ack': False, 'msg': 'Wrong action.'}

    return {'ack': True, 'msg': 'Question sent!'}


@sio.on('reply_question')
@jwt_required()
def reply_question(reply):
    player = get_player()
    game_id = game_queue.get_game_id(player)
    game: FindItOut = game_queue.get_game(player)

    try:
        if game.get_role(player) == Roles.REPLIER:
            if reply == 'UNCLEAR':
                game.retry()
                sio.emit('retry', to=users[game.get_opponent(player)])
                update_roles(game_id=game_id, game=game)
                return {'ack': True, 'msg': 'The asker will ask a new question.'}
            else:
                game.reply(reply)
                update_roles(game_id=game_id, game=game)
                return {'ack': True, 'msg': 'Answer sent!'}
        else:
            return {'ack': False, 'msg': 'Not your turn yet.'}
    except TransitionNotAllowed:
        return {'ack': False, 'msg': 'Wrong action.'}


@sio.on('end_turn')
@jwt_required()
def end_turn(board):
    player = get_player()
    game_id = game_queue.get_game_id(player)
    game: FindItOut = game_queue.get_game(player)

    try:
        if game.get_role(player) == Roles.ASKER:
            game.end_turn(board)
            sio.emit('questionHistory',
                     data=game.get_p1_question_history() if game.get_player_num(
                         player) == 1 else game.get_p2_question_history(), to=request.sid)
            update_roles(game_id=game_id, game=game)
        else:
            return {'ack': False, 'msg': 'Not your turn yet.'}
    except TransitionNotAllowed:
        return {'ack': False, 'msg': 'Wrong action.'}

    return {'ack': True, 'msg': 'Started new round!'}


@sio.on('make_guess')
@jwt_required()
def make_guess(guess):
    player = get_player()
    game_id = game_queue.get_game_id(player)
    game: FindItOut = game_queue.get_game_by_id(game_id)

    try:
        if game.get_role(player) == Roles.ASKER:
            game.guess(guess)
            update_roles(game_id=game_id, game=game)
            # if game.winner == player:
            #     # exit the player from the game
            #     game_queue.disconnect(game_id=game_id, player=player)
            # else:
            #     game_queue.end_game(game_id)
        elif game.is_replier_bonus:
            game.bonus = guess['guess_card'] == game.get_card(game.winner)['id']
            game.end_game()
            update_roles(game_id=game_id, game=game)
            # game_queue.end_game(game_id)
            # end_game(game, game_id, game.winner)
        else:
            return {'ack': False, 'msg': 'Not your turn yet.'}
    except TransitionNotAllowed:
        return {'ack': False, 'msg': 'Wrong action.'}


@sio.on('report')
@jwt_required()
def report(checked):
    if len(checked) == 0:
        return True
    player = get_player()
    game_id = game_queue.get_game_id(player)
    game: FindItOut = game_queue.get_game_by_id(game_id)

    # TODO AttributeError: 'NoneType' object has no attribute 'report_questions'
    game.report_questions(player, checked)
    print(f"Received report of {checked}")
    return True


@sio.on('forfeit_game')
@jwt_required()
def forfeit_game():
    player = get_player()
    game_id = game_queue.get_game_id(player)
    game: FindItOut = game_queue.get_game_by_id(game_id)
    winner = game.forfeit_game(player)
    sio.emit('forfeit', to=users[winner])
    end_game(game, game_id, winner, forfeited=True)
