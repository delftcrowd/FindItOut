import random
from copy import deepcopy
from datetime import datetime
from threading import Lock
from typing import List

from server.app.base.models import Match, User
from server.app.game.card import Card
from server.app.game.difficulty import Difficulties, Relations
from server.app.game.game_state import GameState
from server.app.game.turn import Turn
from server.app.game.utils import Roles


class FindItOut(GameState):
    def __init__(self, game_id: str, difficulty: Difficulties):
        super().__init__()
        self.game_id = game_id
        self.origin = ''
        self.is_loaded = False
        self.objects = None
        self.difficulty = difficulty
        self.player_1 = None
        self.player_2 = None
        self.p1_card = self.p2_card = None
        self.p1_role = Roles.ASKER
        self.p2_role = Roles.REPLIER
        self.p1_board: List[Card] = None
        self.p2_board: List[Card] = None
        self.p1_board_history: List[Turn] = []
        self.p2_board_history: List[Turn] = []
        self.start_time: datetime = None
        self.end_time: datetime = None
        self.started = False
        self.winner = None
        self.last_guess = None
        self.temp_question: Turn = None
        self.bonus = None
        self.forfeited = False
        self.p1_online = True
        self.p2_online = True

        self.thread = None
        self.thread_lock = Lock()

    def on_ask(self, question_type, target):
        self.temp_question = Turn(Relations.get_by_key(question_type), target.lower())
        print('Asker asked!')

    def on_reply(self, reply):
        self.temp_question.set_reply(reply)
        print('Replier replied!')

    def on_retry(self):
        self.temp_question.set_reply('UNCLEAR')
        self.save_board(None)

    def on_end_turn(self, board):
        self.save_board(board)
        self.swap_roles()
        print('Next Round!')

    def on_guess(self, guess):
        if self.is_endgame:
            return self.winner

        self.last_guess = guess['guess_card']

        # if the board is sent as well, then save the board
        if len(guess['board']) != 0:
            self.save_board(guess['board'])

        if self.p1_role == Roles.ASKER:
            asker = self.player_1
            replier = self.player_2
            ground_truth = self.p2_card
        else:
            asker = self.player_2
            replier = self.player_1
            ground_truth = self.p1_card
        result = (ground_truth['id'] == guess['guess_card'])
        self.winner = asker if result else replier
        print('Player guessed!')
        return self.winner

    def on_enter_replier_bonus(self):
        # if the asker did not win, then the game ends directly, otherwise the replier can make an extra guess
        if self.get_role(self.winner) != Roles.ASKER:
            self.end_game()

    def on_enter_endgame(self):
        # if not self.p1_online and not self.p2_online:
        #     self.save_game()
        pass

    def on_forfeit_game(self, player):
        self.winner = self.get_opponent(player) if self.winner is None else self.winner
        self.forfeited = True
        print(f'Game forfeited by {player}')
        return self.winner

    def on_kill_game(self):
        # setting both players to offline will automatically save the game when entering endgame
        # self.set_player_online(self.player_1, False)
        # self.set_player_online(self.player_2, False)
        print(f'Game killed')
        pass

    def on_enter_dead(self):
        self.end_time = datetime.utcnow()
        self.persist()

        from server.app.game import game_queue
        game_queue.end_game(self.game_id)

    def set_objects(self, objects: List[Card]):
        self.objects = list(map(lambda o: o.as_short_dict(), objects))
        self.p1_board = deepcopy(objects)
        self.p2_board = deepcopy(objects)
        self.p1_card, self.p2_card = random.sample(list(self.objects), 2)
        self.is_loaded = True

    def add_player(self, player) -> int:
        if self.player_1 is None or self.player_1 == player:
            self.player_1 = player
            return 1
        if self.player_2 is None or self.player_2 == player:
            self.player_2 = player
            return 2
        raise ValueError('Too many players added to a game session')

    def remove_player(self, player):
        print(f'removing player {player}')
        if self.player_1 == player:
            print(f"Removing P1 {player} from game")
            self.player_1 = None
            return 1
        if self.player_2 == player:  # should not happen...
            print(f"Removing P2 {player} from game")
            self.player_2 = None
            return 2
        raise ValueError('Player not in this game')

    def set_player_online(self, player, online: bool):
        if self.get_player_num(player) == 1:
            self.p1_online = online
        else:
            self.p2_online = online

        # if both players offline, then can save the game, then the game should be deleted
        if not self.p1_online and not self.p2_online:
            if self.is_endgame:
                self.save_game()
            else:
                # TODO delete game?
                print("Both players left the game...")
                pass

    def save_board(self, board):
        self.temp_question.set_board(board)
        if self.p1_role == Roles.ASKER:
            self.update_board(self.p1_board, board)
            self.p1_board_history.append(self.temp_question)
        else:
            self.update_board(self.p2_board, board)
            self.p2_board_history.append(self.temp_question)

    def update_board(self, player_board: List[Card], new_board):
        if new_board is None:
            return
        for idx, card in enumerate(new_board):
            if player_board[idx].word == card['id']:
                player_board[idx].is_flipped = card['is_flipped']
            else:
                raise ValueError('The returned card id did not match')

    def report_questions(self, player, questions):
        history = self.p1_board_history if self.get_player_num(player) == 1 else self.p2_board_history
        for question in questions:
            history[question].reported = True

    def get_player_num(self, player):
        return 1 if player == self.player_1 else 2

    def get_opponent(self, player):
        return self.player_1 if self.player_2 == player else self.player_2

    def is_my_turn(self, player):
        return (self.get_role(player) == Roles.ASKER) == self.is_asker_turn()

    def get_role(self, player):
        player_num = self.get_player_num(player)  # 0 for p1, 1 for p2
        return self.p1_role if player_num == 1 else self.p2_role

    def get_card(self, player):
        return self.p1_card if self.get_player_num(player) == 1 else self.p2_card

    def get_relations(self, amount=0):
        if amount == 0:
            return self.difficulty.relations
        return random.sample(self.difficulty.relations, amount)

    def get_question(self):
        return self.temp_question.get_question_string()

    def get_reply(self):
        return self.temp_question.reply

    def get_p1_role(self):
        return self.p1_role

    def get_p2_role(self):
        return self.p2_role

    def get_p1_board(self):
        return list(map(lambda card: dict(card), self.p1_board))

    def get_p1_question_history(self):
        return list(
            map(lambda turn: {'question': turn.get_question_string(), 'reply': turn.reply},
                [q for q in self.p1_board_history if q.reply != 'UNCLEAR']))

    def get_p2_question_history(self):
        return list(
            map(lambda turn: {'question': turn.get_question_string(), 'reply': turn.reply},
                [q for q in self.p2_board_history if q.reply != 'UNCLEAR']))

    def get_p2_board(self):
        return list(map(lambda card: dict(card), self.p2_board))

    def swap_roles(self):
        self.p1_role = self.p1_role.opponent
        self.p2_role = self.p2_role.opponent

    def start(self):
        self.started = True
        self.start_time = datetime.utcnow()

    def persist(self):
        from app import app
        with app.app_context():
            player_1 = User.lookup(self.player_1)
            player_2 = User.lookup(self.player_2)
            p1_itcard = self.p1_card
            p2_itcard = self.p2_card
            p1_itcard.pop('definitions', None)
            p2_itcard.pop('definitions', None)
            winner = None if self.winner is None else player_1.id if player_1.username == self.winner else player_2.id,

            match = Match(difficulty=self.difficulty.name, origin=self.origin,
                          player1=player_1.id, player2=player_2.id,
                          startTime=self.start_time, endTime=self.end_time,
                          player1Card=p1_itcard, player2Card=p2_itcard,
                          player1Actions=Turn.convert_to_objs(self.p1_board_history),
                          player2Actions=Turn.convert_to_objs(self.p2_board_history),
                          objects=self.objects, guessCard=self.last_guess, winner=winner,
                          forfeited=self.forfeited, bonus=self.bonus)

            from server.app import db
            db.session.add(match)
            db.session.commit()

    def serialize(self, player):
        return {
            'player1': self.player_1.to_dict() if self.player_1 is not None else None,
            'player2': self.player_2.to_dict() if self.player_2 is not None else None,
            'objects': self.objects,
            'myTurn': self.current_player == self.get_player_num(player),
            'myCard': self.p1_card if self.get_player_num(player) == 1 else self.p2_card
        }
