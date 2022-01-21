from datetime import datetime, date
from enum import Enum


def clip(x, low, up):
    return low if x < low else up if x > up else x


class Roles(Enum):
    ASKER = 0
    REPLIER = 1

    def __str__(self):
        return self.name

    @property
    def opponent(self):
        return Roles(not self.value)


def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError("Type %s not serializable" % type(obj))


def removesuffix(self: str, suffix: str, /) -> str:
    # suffix='' should not call self[:-0].
    if suffix and self.endswith(suffix):
        return self[:-len(suffix)]
    else:
        return self[:]
