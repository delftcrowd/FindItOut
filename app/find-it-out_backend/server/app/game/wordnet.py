from typing import List

from nltk import WordNetLemmatizer
from nltk.corpus import wordnet as wn

from server.app.game.card import Card


# print(syns[0].name())
# print(syns[0].lemmas()[0].name())
# print(syns[0].definition())
# print(syns[0].examples())


class WordNet:
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()

    def get_definitions(self, objects: List[Card]):
        for obj in objects:
            senses = self._get_senses(obj.word)
            for sense in senses:
                obj.definitions.append({'name': sense.name(), 'definition': sense.definition()})

    def _get_senses(self, word):
        word = self.lemmatizer.lemmatize(word)
        syns = wn.synsets(word, pos=wn.NOUN)
        return syns
        # return [syn for syn in syns if syn.name().startswith(f"{word}.")]
        # print(f"{syn.name()}: {syn.definition()}. {syn.lemmas()}")
