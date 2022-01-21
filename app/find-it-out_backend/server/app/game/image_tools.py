import random
from typing import List

import PIL
import eventlet
import numpy as np
from PIL import Image
from matplotlib import pyplot as plt
from resizeimage import resizeimage

from server.app import db
from server.app.base.models import ConceptImage
from server.app.game.card import Card
from server.app.game.google_image_downloader import GoogleImageDownloader


class ImageTools:
    _sid: GoogleImageDownloader = None

    def fetch_images(self, objs: List[Card]):
        if ImageTools._sid is None:
            self._sid = GoogleImageDownloader()

        images = dict()
        for item in objs:
            word = item.word
            from app import app
            with app.app_context():
                images[word] = ConceptImage.query.filter_by(concept=word).all()
            eventlet.sleep()

        new_images = [item for item, images in images.items() if images is None or len(images) == 0]
        # new_imgs = self._sid.download(keywords=new_images, limit=5, extensions={'.png'},
        #                               main_directory='server/app/game/images/')
        new_imgs = self._sid.search(keywords=new_images, limit=3, extensions={'.png'},
                                    main_directory='server/app/game/images/', should_download_images=False)

        from app import app
        with app.app_context():
            for word, imgs in new_imgs.items():
                for img in imgs:
                    new_img = ConceptImage(concept=word, url=img['image_url'])
                    db.session.add(new_img)
                db.session.commit()
                images[word] = ConceptImage.query.filter_by(concept=word).all()
                eventlet.sleep()

            # assign an image to the objects
            for item in objs:
                sel_img = random.choice(images[item.word])
                item.image_url = sel_img.url
                # if sel_img.path is not None:
                #     item.image_path = sel_img.path

    # @staticmethod
    # def generate_image_grid(self, objs: List[Card]):
    #     size = [512, 512]
    #
    #     comb_img_row = []
    #     for i in range(4):
    #         image_row = []
    #         for j in range(4):
    #             image_row.append(objs[i * 4 + j]['image_path'])
    #
    #         imgs = [resizeimage.resize_contain(PIL.Image.open(x), size) for x in image_row]
    #
    #         # pick the image which is the smallest, and resize the others to match it
    #         min_shape = sorted([(np.sum(i.size), i.size) for i in imgs])[0][1]
    #         imgs_comb = np.hstack((np.asarray(i.resize(min_shape)) for i in imgs))
    #         comb_img_row.append(PIL.Image.fromarray(imgs_comb))
    #
    #     min_shape = sorted([(np.sum(i.size), i.size) for i in comb_img_row])[0][1]
    #     comb_img = np.vstack((np.asarray(i.resize(min_shape)) for i in comb_img_row))
    #     comb_img = PIL.Image.fromarray(comb_img)
    #
    #     imgplot = plt.imshow(comb_img)
    #     plt.show()
        # comb_img.save('images/game.jpg')
