"""Offline package check; does not import or start the preview server."""
import ast, hashlib, json, pathlib
base = pathlib.Path(__file__).resolve().parent
ast.parse((base / 'preview-server.py').read_text(encoding='utf-8'))
root = (base / 'local' / 'preview-package').resolve(strict=True)
raw = (root / 'manifest.json').read_bytes()
manifest = json.loads(raw)
assert manifest['production'] == '3dbb0c584717b3ffd24f13880bc1225330637049'
assert manifest['reference'] == 'b739fb33'
for route, entry in manifest['files'].items():
    path = root.joinpath(*pathlib.PurePosixPath(entry['file']).parts)
    assert route.startswith('/') and '..' not in pathlib.PurePosixPath(route).parts
    assert not path.is_symlink() and path.resolve().is_relative_to(root)
    assert hashlib.sha256(path.read_bytes()).hexdigest() == entry['sha256']
assert manifest['files']['/starts/saved']['sha256'] == '5d2fdeed376bcff93e1fde0ad8fb7c84b4341963b31ab54c99ee0e0059634e27'
assert manifest['files']['/starts/terminal']['sha256'] == '223a8b71adb1e63afb4ecf77a0b32199d430e17dd573672bc5d8f06ba04ee558'
assert not any(route.lower().endswith(('.wav', '.mp3', '.ogg')) for route in manifest['files'])
print('manifest_sha256', hashlib.sha256(raw).hexdigest(), 'routes', len(manifest['files']))
print('reference', '/reference/reports/development/plan-62-welcome-screen-creative-study/index.html')
