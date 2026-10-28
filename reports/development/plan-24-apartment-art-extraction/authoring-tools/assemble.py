import sys, re, json
sys.path.insert(0, '<SCRATCH>')
from render_svg import render
import numpy as np
R = '<REPO>/reports/development/plan-10-metagame-duck-cinematography/haiku-experiments/'
pick = {'front': 'front-scratch', 'side': 'side-improve', 'rear': 'rear-scratch', 'high': 'high-improve', 'low': 'low-improve'}
labels = {'front': 'Front three-quarter static rubber duck', 'side': 'Side profile static rubber duck facing left', 'rear': 'Rear three-quarter static rubber duck seen from behind', 'high': 'High angle static rubber duck seen from above', 'low': 'Low angle static rubber duck seen from below'}
out = {}
for v, folder in pick.items():
    src = open(R + folder + '/duck.svg', encoding='utf8').read()
    inner = re.sub(r'^\s*<svg[^>]*>', '', src, count=1).rsplit('</svg>', 1)[0].strip()
    inner = re.sub(r'<!--.*?-->', '', inner, flags=re.S)
    inner = re.sub(r'\s*\n\s*', '', inner)
    im = np.array(render(R + folder + '/duck.svg', 2)).astype(int)
    mask = (np.abs(im - np.array([246, 243, 238])).sum(axis=2) > 30)
    ys, xs = np.where(mask)
    x0, x1, y0, y1 = xs.min()/2, xs.max()/2, ys.min()/2, ys.max()/2
    dx, dy = round(180 - (x0 + x1)/2, 1), round(249 - y1, 1)
    out[v] = dict(src=folder, bbox=[x0, x1, y0, y1], shift=[dx, dy],
                  svg=f'<svg viewBox="0 0 360 270" preserveAspectRatio="xMidYMax meet" role="img" aria-label="{labels[v]}"><g transform="translate({dx} {dy})">{inner}</g></svg>')
    print(v, folder, [round(t) for t in (x0, x1, y0, y1)], 'shift', dx, dy, 'top after', round(y0 + dy))
json.dump(out, open('<SCRATCH>/out/selected.json', 'w'))
