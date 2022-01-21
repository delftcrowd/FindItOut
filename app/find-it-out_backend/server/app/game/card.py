class Card:
    def __init__(self, word):
        self.word = word['@id']
        self.weight = word['weight']
        self.image_url = ''
        self.definitions = []
        self.is_flipped = False
        pass

    def _get_definitions(self):
        return list(map(lambda sense: sense['definition'], self.definitions))

    def as_dict(self):
        return {'id': self.word, 'weight': self.weight, 'image_url': self.image_url,
                'definitions': self._get_definitions(), 'is_flipped': self.is_flipped}

    def as_short_dict(self):
        return {'id': self.word, 'image_url': self.image_url, 'definitions': self._get_definitions()}

    def __repr__(self):
        return f'Card({self.word}, {self.weight}, {self.is_flipped}, {self._get_definitions()})'

    def __iter__(self):
        yield 'id', self.word
        # yield 'weight', self.weight
        yield 'image_url', self.image_url
        yield 'definitions', self._get_definitions()
        yield 'is_flipped', self.is_flipped

    # def __dict__(self):
    #     pass
