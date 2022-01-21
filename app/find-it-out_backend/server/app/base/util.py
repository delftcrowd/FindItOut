# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

import binascii
import hashlib
import mimetypes
import os

# Inspiration -> https://www.vitoshacademy.com/hashing-passwords-in-python/
from urllib.request import Request, urlopen


def hash_pass(password):
    """Hash a password for storing."""
    salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('ascii')
    pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'),
                                  salt, 100000)
    pwdhash = binascii.hexlify(pwdhash)
    return (salt + pwdhash)  # return bytes


def verify_pass(provided_password, stored_password):
    """Verify a stored password against one provided by user"""
    stored_password = stored_password.decode('ascii')
    salt = stored_password[:64]
    stored_password = stored_password[64:]
    pwdhash = hashlib.pbkdf2_hmac('sha512',
                                  provided_password.encode('utf-8'),
                                  salt.encode('ascii'),
                                  100000)
    pwdhash = binascii.hexlify(pwdhash).decode('ascii')
    return pwdhash == stored_password


# def is_url_image(url):
#     mimetype, encoding = mimetypes.guess_type(url)
#     return mimetype and mimetype.startswith('image')

def is_url_image_extensions(url, extensions):
    mimetype, encoding = mimetypes.guess_type(url)
    return mimetype and mimetype.startswith('image') and f'.{mimetype.split("/")[1]}' in extensions


def file_exists(url):
    request = Request(url)
    request.get_method = lambda: 'HEAD'
    try:
        urlopen(request, timeout=1)
        return True
    except Exception:
        return False


def sanitize_link(url: str, extension: str):
    return url[0:(url.index(extension) + len(extension))]


def is_image_and_ready(url, extensions):
    return is_url_image_extensions(url, extensions) and file_exists(url)
