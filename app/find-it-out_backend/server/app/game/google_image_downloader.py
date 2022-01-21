import logging
import os
import time
import urllib
from collections.abc import Iterable
from urllib.parse import quote

import eventlet
import progressbar
import requests

from server.app.base.util import is_image_and_ready, sanitize_link


class GoogleImageDownloader:
    def __init__(self):
        pass

    def urls(self, keywords, limit: int, extensions={'.jpg', '.png', '.ico', '.gif', '.jpeg'}):
        """"
        Get URLs of images by provided keywords
        Arguments:
        -----------
        keywords : str or [str]
            String of keywords separated by column or list of strings (keywords)
        limit : int
            Number of images to download for each keyword
        extensions: set(str)
            Allowed extensions of images to download
        main_directory : str
            directory to store subdirectories for each keyword
        :returns list of URL's
        """

        return self.search(keywords, limit, extensions, should_download_images=False)

    def download(
            self,
            keywords,
            limit: int,
            extensions={'.jpg', '.png', '.ico', '.gif', '.jpeg'},
            main_directory='images/'
    ):
        """
        Downloads 'limit' images to subdirectory of 'main_directory' named same like keyword

        Arguments:
        -----------
        keywords : str or [str]
            String of keywords separated by column or list of strings (keywords)
        limit : int
            Number of images to download for each keyword
        extensions: set(str)
            Allowed extensions of images to download
        main_directory : str
            directory to store subdirectories for each keyword
        """

        return self.search(keywords, limit, extensions, should_download_images=True, main_directory=main_directory)

    @staticmethod
    def search(
            keywords,
            limit,
            extensions={'.jpg', '.png', '.ico', '.gif', '.jpeg'},
            should_download_images=False,
            main_directory=None
    ):
        if should_download_images:
            GoogleImageDownloader._preprocess_output_dir(main_directory)

        keywords_to_search = GoogleImageDownloader._preprocess_keywords(keywords)

        bar = GoogleImageDownloader._init_bar(num_ticks=len(keywords_to_search) * limit)
        bar.start()

        urls_to_return = dict()
        for keyword_index in range(len(keywords_to_search)):
            keyword = keywords_to_search[keyword_index]
            logging.debug("Searching images for " + keyword)
            urls = GoogleImageDownloader._process_keyword(
                keyword=keyword,
                limit=limit,
                extensions=extensions,
                should_download_images=should_download_images,
                main_directory=main_directory
            )
            urls_to_return[keyword] = urls

            bar.update(keyword_index + 1)
            eventlet.sleep()
        bar.finish()

        return urls_to_return

    @staticmethod
    def _process_keyword(keyword, limit, extensions, should_download_images, main_directory):
        if should_download_images:
            GoogleImageDownloader._create_keyword_directory(main_directory, keyword)

        raw_html = GoogleImageDownloader._download_google_images_page_html_by_keyword(keyword)
        urls = GoogleImageDownloader._extract_image_urls_from_html(
            keyword=keyword,
            raw_html=raw_html,
            extensions=extensions,
            limit=limit,
            should_download_images=should_download_images,
            main_directory=main_directory
        )

        return urls

    @staticmethod
    def _preprocess_output_dir(output_dir):
        if output_dir is None:
            raise ValueError(f'Provide a directory to store results')
        else:
            os.makedirs(output_dir, exist_ok=True)
            # if len(os.listdir(output_dir)) != 0:
            #     raise ValueError(f'Directory is not empty: {output_dir}')

    @staticmethod
    def _init_bar(num_ticks):
        return progressbar.ProgressBar(
            maxval=num_ticks,
            widgets=[progressbar.Bar('=', '[', ']'), ' ', progressbar.Percentage()]
        )

    @staticmethod
    def _extract_image_urls_from_html(keyword, raw_html, extensions, limit, should_download_images, main_directory):
        logging.debug("Extracting images for " + keyword)
        end_object = -1
        num_images_found = 0
        image_urls = []
        extension = list(extensions)[0]
        while num_images_found < limit:
            while True:
                try:
                    # TODO support multiple extensions as well
                    extension_index = raw_html.find(extension, end_object + 1)
                    new_line = raw_html.rfind('https://', 0, extension_index)
                    # if the link is an http link
                    # end_object = raw_html.find(raw_html[new_line - 1], extension_index)
                    end_object = min(raw_html.find("'", extension_index), raw_html.find('"', extension_index))
                    if raw_html.rfind('http://', 0, extension_index) > new_line:
                        continue

                    # new_line = raw_html.find('"https://', end_object + 1)
                    # end_object = raw_html.find('"', new_line + 1)

                    buffer = raw_html.find('\\', new_line, end_object)
                    object_raw = raw_html[new_line:buffer] if buffer != -1 else raw_html[new_line:end_object]

                    # ignores google logos and doodles... :) "/logos/doodles/"
                    if 'google' in object_raw:
                        continue

                    if any(extension in object_raw for extension in extensions):
                        break

                except Exception:
                    break

                eventlet.sleep()

            url = sanitize_link(object_raw, extension)
            try:
                r = requests.get(url, allow_redirects=True, timeout=1)
                if 'html' not in str(r.content) and is_image_and_ready(url, extensions):
                    image_urls.append({'image_url': url, 'image_path': None})
                    num_images_found += 1
            except Exception:
                pass

            # try:
            #     r = requests.get(object_raw, allow_redirects=True, timeout=1)
            #     if 'html' not in str(r.content):
            #         mime = magic.Magic(mime=True)
            #         file_type = mime.from_buffer(r.content)
            #         file_extension = f'.{file_type.split("/")[1]}'
            #         if file_extension not in extensions:
            #             raise ValueError()
            #
            #         if should_download_images:
            #             path = main_directory + keyword.replace(" ", "_")
            #             file_name = str(keyword) + "_" + str(num_images_found + 1) + file_extension
            #             file_path = os.path.join(path, file_name)
            #             with open(file_path, 'wb') as file:
            #                 file.write(r.content)
            #             image_urls.append({'image_url': object_raw, 'image_path': file_path})
            #         else:
            #             image_urls.append({'image_url': object_raw, 'image_path': None})
            #     else:
            #         num_images_found -= 1
            # except Exception:
            #     num_images_found -= 1
            # num_images_found += 1

            eventlet.sleep()

        return image_urls

    @staticmethod
    def _preprocess_keywords(keywords):
        if isinstance(keywords, str):
            keywords_to_search = [str(item).strip() for item in keywords.split(',')]
        elif isinstance(keywords, Iterable):
            all_elements_are_strings = all(isinstance(item, str) for item in keywords)
            if not all_elements_are_strings:
                raise ValueError('Provided list should consist of strings')
            keywords_to_search = keywords
        else:
            raise ValueError('keywords argument should be a list of strings or string, separated by commas')

        return keywords_to_search

    @staticmethod
    def _create_keyword_directory(main_directory, name):
        name = name.replace(" ", "_")
        try:
            if not os.path.exists(main_directory):
                os.makedirs(main_directory)
                time.sleep(0.2)
                path = name
                sub_directory = os.path.join(main_directory, path)
                if not os.path.exists(sub_directory):
                    os.makedirs(sub_directory)
            else:
                path = name
                sub_directory = os.path.join(main_directory, path)
                if not os.path.exists(sub_directory):
                    os.makedirs(sub_directory)

        except OSError as e:
            if e.errno != 17:
                raise
            pass
        return

    @staticmethod
    def _download_page(url):

        try:
            headers = {
                'User-Agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
            }
            req = urllib.request.Request(url, headers=headers)
            resp = urllib.request.urlopen(req)
            resp_data = str(resp.read())
            return resp_data

        except Exception as e:
            print(e)
            exit(0)

    @staticmethod
    def _download_google_images_page_html_by_keyword(keyword):
        url = 'https://www.google.com/search?q=' + quote(
            keyword.replace('_', ' ').encode(
                'utf-8')) + '&biw=1536&bih=674&tbm=isch&tbs=ic:trans%2Cift:png&sxsrf=ACYBGNSXXpS6YmAKUiLKKBs6xWb4uUY5gA:1581168823770&source=lnms&sa=X&ved=0ahUKEwioj8jwiMLnAhW9AhAIHbXTBMMQ_AUI3QUoAQ'
        raw_html = GoogleImageDownloader._download_page(url)

        return raw_html
