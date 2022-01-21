import functools
from collections import namedtuple
from enum import Enum
from random import randint

Relation = namedtuple('Relation', ['key', 'name', 'question'])
Difficulty = namedtuple('Difficulty', ['key', 'center', 'num_cards', 'relations'])


class Relations(Enum):
    ISA = Relation(1, 'IsA', 'Is your card a')
    HASA = Relation(2, 'HasA', 'Does your card have (a)')
    HASPROPERTY = Relation(3, 'HasProperty', 'Is your card')
    USEDFOR = Relation(4, 'UsedFor', 'Can your card be used for')
    CAPABLEOF = Relation(5, 'CapableOf', 'Can your card')
    MADEOF = Relation(6, 'MadeOf', 'Is your card made of')
    PARTOF = Relation(7, 'PartOf', 'Is your card part of (a)')
    ATLOCATION = Relation(8, 'AtLocation', 'Can your card be found')

    @property
    def name(self):
        return self.value.name

    @property
    def question(self):
        return self.value.question

    def to_object(self):
        return {'name': self.name, 'question': self.question}

    @staticmethod
    @functools.lru_cache(8)
    def get_by_key(key):
        for rel in Relations:
            if rel.name == key:
                return rel

    def __repr__(self):
        return self.name


class Difficulties(Enum):
    # TODO remove list of relations. Should be connected to user level
    EASY = Difficulty(1, 0, 8, list(Relations))  # [Relations.ISA, Relations.HASA, Relations.HASPROPERTY])
    MEDIUM = Difficulty(2, 0.2, 16, list(Relations))
    # [Relations.ISA, Relations.HASA, Relations.HASPROPERTY, Relations.USEDFOR, Relations.MADEOF])
    HARD = Difficulty(3, 0.6, 16, list(Relations))
    # EXTREME = Difficulty(4, 1, 24, list(Relations))
    ANY = Difficulty(4, 0, 0, [])

    @property
    def center(self):
        return self.value.center

    @property
    @functools.lru_cache(4)
    def relations(self):
        result = [rel.to_object() for rel in self.value.relations]
        return result

    @property
    def num_cards(self):
        return self.value.num_cards

    @staticmethod
    def parse_difficulty(diff: str):
        return Difficulties[diff.upper()]

    @staticmethod
    @functools.lru_cache(1)
    def get_difficulties():
        return list(Difficulties)[0:2]

    @staticmethod
    def get_random_difficulty():
        # randint is start & end inclusive
        return Difficulties.get_difficulties()[randint(0, 1)]

    def __repr__(self):
        return self.name
