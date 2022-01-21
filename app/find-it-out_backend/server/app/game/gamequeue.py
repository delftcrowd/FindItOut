from functools import reduce
from typing import Tuple

import shortuuid

from server.app.game.FindItOut import FindItOut
from server.app.game.difficulty import Difficulties


class GameQueue:
    def __init__(self):
        # player -> {game_id, is_started}
        self.players_matches = {}
        # game_id -> game (not started games)
        self.games = {}
        # game_id -> game (started games)
        self.running_games = {}
        # difficulty -> [game_ids]
        self.open_rooms = {
            Difficulties.EASY: [],
            Difficulties.MEDIUM: [],
            Difficulties.HARD: [],
            # Difficulties.EXTREME: []
        }

    def join_game(self, player, difficulty=Difficulties.MEDIUM) -> Tuple[str, FindItOut]:
        if difficulty == Difficulties.ANY:
            not_empty = [game for game in self.games.values() if game.player_1 is not None or game.player_2 is not None]
            if len(not_empty) == 0:  # if there are no open rooms, means choose a random difficulty
                difficulty = Difficulties.get_random_difficulty()
            else:
                # pick the first game with a player waiting
                difficulty = next(iter(not_empty)).difficulty

        if len(self.open_rooms[difficulty]) == 0:
            from server.app.game import game_factory
            new_game_id = shortuuid.uuid()
            while new_game_id in self.games:  # create new id if conflict, very improbable, but doesn't hurt adding this
                new_game_id = shortuuid.uuid()
            new_game: FindItOut = game_factory.create_new_game(new_game_id, difficulty=difficulty)

            self.open_rooms[difficulty].append(new_game_id)
            self.games[new_game_id] = new_game

        game_id = next(iter(self.open_rooms[difficulty]))
        self.players_matches[player] = {'game_id': game_id, 'is_started': False}
        return game_id, self.games[game_id]

    def start_game(self, game_id):
        if game_id not in self.games:
            raise ValueError(f"Room id {game_id} non existent")

        game: FindItOut = self.games[game_id]
        if game.player_1 is not None and game.player_2 is not None:
            self.players_matches[game.player_1]['is_started'] = True
            self.players_matches[game.player_2]['is_started'] = True
            self.running_games[game_id] = self.games.pop(game_id)
            self.open_rooms[game.difficulty].remove(game_id)
            return True
        else:
            return False

    def disconnect(self, game_id, player):
        # remove the player from the game if the game has not started yet. This frees the game.
        # TODO when the game ends, is_started is set to false and the player is removed. This is not desired.
        if not self.players_matches[player]['is_started']:
            self.games[game_id].remove_player(player)
        self.players_matches.pop(player)

    def terminate_game(self, game_id=None, player=None):
        if game_id is None and player is not None and len(player) != 0:
            game_id = self.get_game_id(player)
        if game_id:
            return self.end_game(game_id)
        return False, []

    def is_in_game(self, player):
        return player in self.players_matches

    def is_in_active_game(self, player):
        game: FindItOut = self.get_game(player)
        return game is not None and game.started

    def get_game_id(self, player):
        if player in self.players_matches:
            return self.players_matches[player]['game_id']
        else:
            return None
        # return self.players_matches[player] if player in self.players_matches else None

    def get_game_by_id(self, game_id) -> FindItOut:
        if game_id in self.running_games:
            return self.running_games[game_id]
        if game_id in self.games:
            return self.games[game_id]

    def get_game(self, player):
        if player in self.players_matches:
            game_ses = self.players_matches[player]
            return self.running_games[game_ses['game_id']] if game_ses['is_started'] \
                else self.games[game_ses['game_id']]
        else:
            return None

    def num_open_rooms(self):
        return sum([len(self.open_rooms[diff]) for diff in Difficulties.get_difficulties()])

    def num_waiting(self):
        def reduce_waiting(result, difficulty):
            result[difficulty] += 1
            return result

        return list(reduce(reduce_waiting,
                           [self.get_game_by_id(game['game_id']).difficulty for game in self.players_matches.values() if
                            not game['is_started']],
                           {diff: 0 for diff in Difficulties.get_difficulties()}).values())

    def end_game(self, game_id):
        found = False

        if game_id in self.running_games:
            found = True
            game: FindItOut = self.running_games.pop(game_id)

        elif game_id in self.games:
            found = True
            game: FindItOut = self.games.pop(game_id)
            self.open_rooms[game.difficulty].remove(game_id)

        if found:
            to_delete = [player for player, g in self.players_matches.items() if g['game_id'] == game_id]
            for player_id in to_delete:
                self.players_matches.pop(player_id)
            # if game.player_1 in self.players_matches and self.players_matches[game.player_1]['game_id'] == game_id:
            #     self.players_matches.pop(game.player_1)
            # if game.player_2 in self.players_matches and self.players_matches[game.player_2]['game_id'] == game_id:
            #     self.players_matches.pop(game.player_2)
            print(f"Terminating game {game_id}")
            return True, to_delete
        return False, []
