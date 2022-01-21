import json
from datetime import datetime

from server.app.game.difficulty import Relations
from server.app.game.utils import json_serial


class Turn:
    def __init__(self, relation, target):
        self.relation: Relations = relation
        self.target = target
        self.reply = ''
        self.board = None
        self.time = None
        self.reported = False

    def set_reply(self, reply):
        self.reply = reply

    def set_board(self, board):
        self.board = board
        self.time = datetime.now()

    def get_question_string(self):
        return self.relation.question + ' ' + self.target + '?'

    def __repr__(self):
        return json.dumps(self.to_obj(), default=json_serial)

    def to_obj(self):
        return {'relation': self.relation.name,
                'target': self.target,
                'reply': self.reply,
                'reported': self.reported,
                'time': self.time.isoformat(),
                'board': self.board}

    @staticmethod
    def convert_to_objs(objs):
        return list(map(lambda obj: obj.to_obj(), objs))

# [{"id": "arthroscopy", "image_url": "https://www.orthonow.com/3d-images/Knee-arthroscopy.png", "is_flipped": False}, {"id": "achilles", "image_url": "https://www.hellenic-art.com/images/thumbnails/978/750/detailed/4/achilles41P-1.png", "is_flipped": False},  {"id": "hamstring", "image_url": "https://acewebcontent.azureedge.net/February2018/Hamstrings.png",   "is_flipped": False},  {"id": "femur", "image_url": "https://www.getbodysmart.com/wp-content/uploads/2017/07/Shaft-Femur-bone-619x550.png",   "is_flipped": False},  {"id": "rotator_cuff", "image_url": "https://www.windsorupperlimb.com/data/images/cuff%20diagram%20post.png",   "is_flipped": False},  {"id": "fetlock", "image_url": "https://www.atlantaequine.com/images/pd_versus_fetlockswelling.png",   "is_flipped": False}, {"id": "tendinitis",                          "image_url": "https://i2.wp.com/www.kintec.net/wp-content/uploads/2016/11/Achilles-Pain.png?resize",                          "is_flipped": False}, {"id": "cubitus",                                                 "image_url": "https://appstickers-cdn.appadvice.com/1156052765/818962083/bacab23c1ff5ef801e5c1db03b31144b-2.png",                                                 "is_flipped": False},  {"id": "toe", "image_url": "https://i2.wp.com/transfiguredhearts.com/wp-content/uploads/2016/07/pinky_toe.png?resize",   "is_flipped": False}, {"id": "elbow",                          "image_url": "https://res.cloudinary.com/im2015/image/upload/v1583831908/Blog/v2/Elbow_Injuries_v2-10.png",                          "is_flipped": False}, {"id": "tibia",                                                 "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Knee_diagram.svg/220px-Knee_diagram.svg.png",                                                 "is_flipped": False},  {"id": "achilles_tendon", "image_url": "https://www.fitasaphysio.com/uploads/4/3/3/4/43345381/1097328.png?218",   "is_flipped": False}, {"id": "knuckle",                          "image_url": "https://www.tattooland.com/media/catalog/product/cache/1/image/650x650/9df78eab33525d08d6e5fb8d27136e95/a/f/afb2228_5.png",                          "is_flipped": False},  {"id": "leg", "image_url": "https://upload.wikimedia.org/wikipedia/commons/0/09/Gray1240.png", "is_flipped": False},  {"id": "sesamoid_bone",   "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Larynx_external_en.svg/220px-Larynx_external_en.svg.png",   "is_flipped": False}, {"id": "calf", "image_url": "https://calfstar.com/wp-content/uploads/2020/09/AdobeStock_59276946_Preview-1-768x549.png", "is_flipped": False}]
