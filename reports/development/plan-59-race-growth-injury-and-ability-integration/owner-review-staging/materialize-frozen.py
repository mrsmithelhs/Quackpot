"""Materialize the fixed committed game source without checkout or text filters."""
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path, PurePosixPath
import subprocess

COMMIT = '8a4816f0da95af0b17d815f25cfed2e3918ff82a'
BASE = Path('reports/development/plan-59-race-growth-injury-and-ability-integration/owner-review-staging/frozen-8a4816f0-attempt-03')
SOURCE = BASE / 'source'
ROOT_FILES = {'index.html', 'package.json', 'package-lock.json', 'vite.config.mjs'}
assert SOURCE.is_dir() and not any(SOURCE.iterdir()), 'source directory must be empty'
raw = subprocess.run(['git', 'ls-tree', '-r', '-z', '--full-tree', COMMIT, '--', 'src', *sorted(ROOT_FILES)],
                     check=True, stdout=subprocess.PIPE).stdout
entries = []
for record in raw.split(b'\0'):
    if not record:
        continue
    header, path_bytes = record.split(b'\t', 1)
    mode, kind, object_id = header.decode('ascii').split(' ')
    name = path_bytes.decode('utf-8', 'strict')
    relative = PurePosixPath(name)
    if (mode != '100644' or kind != 'blob' or relative.is_absolute() or '..' in relative.parts
            or '\n' in name or '\r' in name or not (name.startswith('src/') or name in ROOT_FILES)):
        raise ValueError('unsupported tree path or mode')
    entries.append((name, object_id))
if not entries or len(entries) > 2000 or len({name for name, _ in entries}) != len(entries):
    raise ValueError('invalid source enumeration')
entries.sort()
batch = subprocess.run(['git', 'cat-file', '--batch'], input=''.join(f'{object_id}\n' for _, object_id in entries).encode('ascii'),
                       check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60)
output = BytesIO(batch.stdout)
manifest = {}
for name, object_id in entries:
    header = output.readline().decode('ascii').strip().split(' ')
    if len(header) != 3 or header[0] != object_id or header[1] != 'blob':
        raise ValueError('unexpected blob header')
    size = int(header[2])
    if size < 0 or size > 20 * 1024 * 1024:
        raise ValueError('unexpected blob size')
    data = output.read(size)
    if len(data) != size or output.read(1) != b'\n':
        raise ValueError('truncated blob')
    target = SOURCE.joinpath(*PurePosixPath(name).parts)
    if not target.resolve().is_relative_to(SOURCE.resolve()):
        raise ValueError('path outside source')
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open('xb') as stream:
        stream.write(data)
    manifest[name] = {'gitBlob': object_id, 'sha256': sha256(data).hexdigest(), 'bytes': size}
if output.read(1):
    raise ValueError('unexpected trailing blob data')
paths = ''.join(SOURCE.joinpath(*PurePosixPath(name).parts).as_posix() + '\n' for name, _ in entries)
checked = subprocess.run(['git', 'hash-object', '--no-filters', '--stdin-paths'], input=paths.encode('utf-8'),
                         check=True, stdout=subprocess.PIPE).stdout.decode('ascii').splitlines()
if checked != [object_id for _, object_id in entries]:
    raise ValueError('unfiltered materialized blob mismatch')
with (BASE / 'prebuild-source-manifest.json').open('x', encoding='utf-8') as stream:
    json.dump({'commit': COMMIT, 'sourceCount': len(entries), 'verifiedWith': 'git hash-object --no-filters --stdin-paths',
               'files': manifest}, stream, indent=2)
print(json.dumps({'commit': COMMIT, 'sourceCount': len(entries), 'allRawBlobsVerified': True}))
