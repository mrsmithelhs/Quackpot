"""Verify the isolated interpreter without importing ML packages."""
import json
import struct
import sys

if sys.implementation.name != "cpython" or sys.version_info[:3] != (3, 12, 13) or sys.platform != "win32" or struct.calcsize("P") != 8:
    raise SystemExit("Expected CPython 3.12.13 on 64-bit Windows")
print(json.dumps({"version": ".".join(map(str, sys.version_info[:3])), "platform": sys.platform, "pointer_bits": struct.calcsize("P") * 8}))
