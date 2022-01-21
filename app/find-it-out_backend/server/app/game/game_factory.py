import json
import logging
import random
from threading import Thread

import eventlet

from server.app.game.FindItOut import FindItOut
from server.app.game.card import Card
from server.app.game.cn_api import ConceptNet
from server.app.game.difficulty import Difficulties
from server.app.game.image_tools import ImageTools
from server.app.game.wordnet import WordNet


class GameFactory:
    ONLINE = True

    def __init__(self):
        self._cn = ConceptNet()
        self._it = ImageTools()
        self._wn = WordNet()
        self._seed_words: list = GameFactory._load_seed_words()
        self.thread: Thread = None
        # import os
        # self.total = {Difficulties.EASY: len(next(os.walk('server/app/game/resources/EASY'))[2]),
        #               Difficulties.MEDIUM: len(next(os.walk('server/app/game/resources/MEDIUM'))[2])}
        self.available = {
            Difficulties.EASY: [9, 38, 59, 64, 67, 105, 113, 114],
            Difficulties.MEDIUM: [69]}
        self.total = {Difficulties.EASY: len(self.available[Difficulties.EASY]),
                      Difficulties.MEDIUM: len(self.available[Difficulties.MEDIUM])}
        # self.count = {Difficulties.EASY: random.randint(0, self.total[Difficulties.EASY] - 1),
        #               Difficulties.MEDIUM: random.randint(0, self.total[Difficulties.MEDIUM] - 1)}
        self.count = {Difficulties.EASY: 0,
                      Difficulties.MEDIUM: 0}

    @staticmethod
    def _load_seed_words():
        with open('server/app/game/resources/seed_words.csv') as file:
            return file.read().splitlines()

    def _generate_seed_word(self):
        return random.choice(self._seed_words).lower()

    def _load_pregenerated_game(self, game: FindItOut, difficulty: Difficulties):
        game_index = self.available[difficulty][self.count[difficulty]]
        with open(
                f'server/app/game/resources/{difficulty.name}/{difficulty.name}-{game_index}.json') as file:
            game_data = json.load(file)
            game.origin = f'{difficulty.name}-{game_index}.json'
            objects = []
            for card in game_data['objects']:
                new_card = Card({'@id': card['id'], 'weight': 1})
                new_card.image_url = random.choice(card['image_urls'])
                for idx, defin in enumerate(card['definitions']):
                    new_card.definitions.append({'name': f'{card["id"]}.{idx}', 'definition': defin})
                objects.append(new_card)

            self.count[difficulty] += 1
            self.count[difficulty] %= self.total[difficulty]
            return objects

    @staticmethod
    def create_new_game(game_id, difficulty: Difficulties) -> FindItOut:
        game = FindItOut(game_id, difficulty)
        # asynchronous game generation
        with game.thread_lock:
            if game.thread is None:
                from server.app import sio
                from server.app.game import game_factory
                game.thread = sio.start_background_task(game_factory.generate_game,
                                                        game=game, game_id=game_id, difficulty=difficulty)
        return game

    def generate_game(self, game: FindItOut, game_id, difficulty: Difficulties):
        logging.info('Generating new game!')

        if GameFactory.ONLINE:

            objects = self._load_pregenerated_game(game, difficulty)

            # Generate from single seed of picturable words
            # if random() < 0.5:
            # if False:
            #     seed_word = self._generate_seed_word()
            #     game.origin = seed_word
            #     objects = self._cn.generate_game(seed_word, difficulty)
            # else:  # generate from DA seeds
            #     word1, word2, feature = self._generate_da_seeds()
            #     game.origin = f"{word1},{word2},{feature}"
            #     objects = self._cn.generate_da_game(word1, word2, difficulty)
            #
            eventlet.sleep()
            #
            # self._it.fetch_images(objects)
            #
            # eventlet.sleep()
            #
            # self._wn.get_definitions(objects)
        else:  # OFFLINE mode for testing
            with open('server/app/game/resources/match_example.json') as game_data:
                game_data = json.load(game_data)
                game.origin = 'test'
                objects = []
                for card in game_data['objects']:
                    new_card = Card({'@id': card['id'], 'weight': 1})
                    new_card.image_url = card['image_url']
                    for idx, defin in enumerate(card['definitions']):
                        new_card.definitions.append({'name': f'{card["id"]}.{idx}', 'definition': defin})
                    objects.append(new_card)

        game.set_objects(objects)

        logging.info("Game successfully generated!")

        while game.player_2 is None:
            eventlet.sleep(1)
        logging.info(f"Starting game {game_id}")

        # randomly flip players
        if random.random() < 0.5:
            temp = game.player_1
            game.player_1 = game.player_2
            game.player_2 = temp

        # from server.app.game import game_queue
        # game_queue.start_game(game_id)

        from server.app.base.sockets import start_game
        start_game(game_id=game_id, game=game)

        game.start()
