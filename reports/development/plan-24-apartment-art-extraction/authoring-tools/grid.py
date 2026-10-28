import sys
sys.path.insert(0, '.')
from render_svg import render
from PIL import Image, ImageDraw
H = '<REPO>/reports/development/plan-10-metagame-duck-cinematography/haiku-experiments/'
views = ['front', 'side', 'rear', 'high', 'low']
cols = [('Sonnet (projection-baked)', lambda v: f'out/styled-{v}.svg'), ('Haiku improve', lambda v: f'{H}{v}-improve/duck.svg'), ('Haiku scratch', lambda v: f'{H}{v}-scratch/duck.svg')]
S = 1; cw, ch = 540, 405
sheet = Image.new('RGB', (cw*len(cols) + 90, ch*len(views) + 40), 'white'); d = ImageDraw.Draw(sheet)
for j, (t, f) in enumerate(cols): d.text((90 + j*cw + 10, 12), t, fill='black')
for i, v in enumerate(views):
    d.text((8, 40 + i*ch + ch//2), v, fill='black')
    for j, (t, f) in enumerate(cols):
        im = render(f(v), 2).resize((cw, ch)); sheet.paste(im, (90 + j*cw, 40 + i*ch))
sheet.save('out/grid.png'); print(sheet.size)
