"""Candidate isolated renderer for root review. Run only in the approved draft folder.

Renders eight inert standalone SVG pose drafts into one local contact sheet.
The helper validates XML before handing content to a headless browser. It is not
an OS sandbox and does not itself restrict the calling model's tools or network.
"""
from pathlib import Path
import base64
import html
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
NAMES = [f'{family}-{n}.svg' for family in ('bounce', 'crowd') for n in range(4)]
ALLOWED_TAGS = {'svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon'}
ALLOWED_ATTRS = {'viewBox','width','height','d','fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','opacity','fill-opacity','stroke-opacity','transform','cx','cy','r','rx','ry','x','y','x1','x2','y1','y2','points'}
EDGE = Path('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')

def validate(path):
    raw = path.read_bytes()
    if len(raw) > 100_000 or b'<!' in raw or b'<?' in raw:
        raise ValueError(f'Invalid or oversized SVG: {path.name}')
    root = ET.fromstring(raw)
    if root.tag != '{http://www.w3.org/2000/svg}svg' or root.get('viewBox') != '0 0 256 256':
        raise ValueError(f'Expected SVG root and 256 viewBox: {path.name}')
    for node in root.iter():
        if node.tag.rsplit('}',1)[-1] not in ALLOWED_TAGS or not node.tag.startswith('{http://www.w3.org/2000/svg}'):
            raise ValueError(f'Unexpected element in {path.name}')
        for key, value in node.attrib.items():
            if key not in ALLOWED_ATTRS or any(x in value.lower() for x in ('url(', 'http:', 'https:', 'file:', 'data:', 'javascript:')):
                raise ValueError(f'Unsafe attribute in {path.name}')
    return raw.decode('utf-8')

history = ROOT / 'render-history'
history.mkdir(exist_ok=True)
existing = sorted(p for p in history.iterdir() if p.is_dir() and p.name.startswith('iteration-'))
if len(existing) >= 6:
    raise RuntimeError('Six-render limit reached')
iteration = history / f'iteration-{len(existing)+1:02d}'
iteration.mkdir(exist_ok=False)
frames = [(name, validate(ROOT / name)) for name in NAMES]
for name, svg in frames:
    (iteration / name).write_text(svg, encoding='utf-8')
ref = base64.b64encode((ROOT / 'pair.png').read_bytes()).decode('ascii')
cards = ''.join(f'<section><h2>{html.escape(name)}</h2><div class="poses"><div class="large">{svg}</div><div class="race84">{svg}</div><div class="race40">{svg}</div></div><small>enlarged · 84px · 40px</small></section>' for name, svg in frames)
page = '<!doctype html><meta charset="utf-8"><style>body{font:16px sans-serif;background:#e8efe6;margin:0;padding:12px}main{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}section{background:#7ca89c;border:1px solid #334;padding:4px;min-height:310px}h2{font-size:14px;margin:4px}.poses{display:flex;align-items:end;gap:4px}.large{width:160px}.race84{width:84px}.race40{width:40px}.poses svg{width:100%;height:auto;display:block}img{height:90px}</style><img alt="synthetic reference" src="data:image/png;base64,' + ref + '"><main>' + cards + '</main>'

(ROOT / 'rendered-sheet.html').write_text(page, encoding='utf-8')
if not EDGE.is_file():
    raise FileNotFoundError('Expected local Edge executable unavailable')
shot = iteration / 'sheet.png'
if shot.exists():
    raise RuntimeError('Fresh iteration screenshot already exists')
args = [str(EDGE), '--headless', '--disable-gpu', '--disable-background-networking', '--no-first-run', '--disable-extensions', '--user-data-dir=' + str(ROOT / 'render-profile'), '--window-size=1300,1000', '--screenshot=' + str(shot), (ROOT / 'rendered-sheet.html').as_uri()]
result = subprocess.run(args, cwd=ROOT, timeout=45, capture_output=True, check=False)
if result.returncode or not shot.is_file() or shot.stat().st_size == 0:
    raise RuntimeError(f'Render failed, browser exit {result.returncode}')
(ROOT / 'rendered-sheet.png').write_bytes(shot.read_bytes())
print(f'Rendered validated local SVG pose sheet: rendered-sheet.png ({iteration.name})')
