"""Approximate offline SVG rasteriser for duck-view self-checks (NOT a browser).
Usage: python render_svg.py in.svg out.png [scale]
       python render_svg.py --sheet out.png a.svg b.svg ...   (contact sheet, side by side)
Supports: <svg viewBox>, <defs><clipPath>, <g>, <path d> (M L H V Q C Z, absolute+relative),
<ellipse>, <circle>, <rect>, <line>, class styles (the duck-* classes below), fill/stroke/
stroke-width/opacity/fill-opacity attributes, transform="translate(x y)" only, clip-path url(#id).
No gradients/masks/filters/<use>/text. Real appearance must still be checked in a browser."""
import re, sys, math
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw

CSS = {
 'duck-fill': dict(fill='#f4bc32', stroke='#4b241b', sw=8), 'duck-body': {},
 'duck-belly-shadow': dict(fill='#dfa52f', opacity=.68),
 'duck-outline': dict(fill='none', stroke='#4b241b', sw=8),
 'duck-neck-line': dict(fill='none', stroke='#4b241b', sw=5),
 'duck-highlight': dict(fill='none', stroke='#ffe27c', sw=9),
 'wing': dict(fill='#e6a924', stroke='#4b241b', sw=6),
 'wing-groove': dict(fill='none', stroke='#9c681e', sw=3),
 'far-wing': dict(fill='#dba02a', stroke='#4b241b', sw=5),
 'beak': dict(fill='#f36e2c', stroke='#4b241b', sw=7),
 'beak-lower': dict(fill='#e85e28', stroke='#4b241b', sw=5),
 'beak-seam': dict(fill='none', stroke='#9b401f', sw=4),
 'tail-seam': dict(fill='none', stroke='#4b241b', sw=4),
 'eye': dict(fill='#45251f', stroke='#4b241b', sw=5),
 'eye-glint': dict(fill='#fff4d8'),
}

def hexcol(s):
    s = s.strip()
    if s.startswith('#'):
        if len(s) == 4: s = '#' + ''.join(c*2 for c in s[1:])
        return tuple(int(s[i:i+2], 16) for i in (1, 3, 5))
    m = re.match(r'rgb\((\d+)[ ,]+(\d+)[ ,]+(\d+)', s)
    return tuple(int(x) for x in m.groups()) if m else (0, 0, 0)

def tokens(d):
    return re.findall(r'[MmLlHhVvQqCcZzAa]|-?\d*\.?\d+(?:e-?\d+)?', d)

def flatten(d):
    t, i, subs, cur, pos, start, cmd = tokens(d), 0, [], [], (0, 0), (0, 0), None
    def num():
        nonlocal i; v = float(t[i]); i += 1; return v
    while i < len(t):
        if re.match(r'[A-Za-z]', t[i]): cmd = t[i]; i += 1
        if cmd in 'Zz':
            if cur: cur.append(start); subs.append((cur, True)); cur = []
            pos = start; continue
        rel = cmd.islower(); c = cmd.upper(); ox, oy = pos if rel else (0, 0)
        if c == 'M':
            if cur: subs.append((cur, False))
            pos = (num()+ox, num()+oy); start = pos; cur = [pos]; cmd = 'l' if rel else 'L'
        elif c == 'L': pos = (num()+ox, num()+oy); cur.append(pos)
        elif c == 'H': pos = (num()+ox, pos[1]); cur.append(pos)
        elif c == 'V': pos = (pos[0], num()+oy); cur.append(pos)
        elif c == 'Q':
            c1 = (num()+ox, num()+oy); p = (num()+ox, num()+oy)
            for k in range(1, 13):
                u = k/12; cur.append(((1-u)**2*pos[0]+2*(1-u)*u*c1[0]+u*u*p[0], (1-u)**2*pos[1]+2*(1-u)*u*c1[1]+u*u*p[1]))
            pos = p
        elif c == 'C':
            c1 = (num()+ox, num()+oy); c2 = (num()+ox, num()+oy); p = (num()+ox, num()+oy)
            for k in range(1, 17):
                u = k/16; a, b, cc, dd = (1-u)**3, 3*(1-u)**2*u, 3*(1-u)*u*u, u**3
                cur.append((a*pos[0]+b*c1[0]+cc*c2[0]+dd*p[0], a*pos[1]+b*c1[1]+cc*c2[1]+dd*p[1]))
            pos = p
        else: raise ValueError('unsupported path command ' + cmd)
    if cur: subs.append((cur, False))
    return subs

def ellipse_pts(cx, cy, rx, ry):
    return [(cx+rx*math.cos(2*math.pi*k/48), cy+ry*math.sin(2*math.pi*k/48)) for k in range(48)]

def render(path_in, S=3):
    tree = ET.parse(path_in); root = tree.getroot()
    strip = lambda tag: tag.split('}')[-1]
    vb = [float(x) for x in root.get('viewBox', '0 0 360 270').replace(',', ' ').split()]
    W, H = int(vb[2]*S), int(vb[3]*S)
    img = Image.new('RGBA', (W, H), (246, 243, 238, 255))
    clips = {}
    for el in root.iter():
        if strip(el.tag) == 'clipPath': clips[el.get('id')] = el
    def style_of(el, inh):
        st = dict(inh)
        for cl in (el.get('class') or '').split():
            st.update(CSS.get(cl, {}))
        for k, a in (('fill', 'fill'), ('stroke', 'stroke'), ('sw', 'stroke-width'), ('opacity', 'opacity'), ('fo', 'fill-opacity')):
            if el.get(a) is not None: st[k] = el.get(a) if k in ('fill', 'stroke') else float(el.get(a))
        if el.get('style'):
            for kv in el.get('style').split(';'):
                if ':' in kv:
                    k, v = [x.strip() for x in kv.split(':', 1)]
                    m = {'fill': 'fill', 'stroke': 'stroke', 'stroke-width': 'sw', 'opacity': 'opacity', 'fill-opacity': 'fo'}.get(k)
                    if m: st[m] = v if m in ('fill', 'stroke') else float(v)
        return st
    def shape_polys(el, tr):
        tg = strip(el.tag); P = []
        if tg == 'path': P = flatten(el.get('d'))
        elif tg == 'ellipse': P = [(ellipse_pts(float(el.get('cx', 0)), float(el.get('cy', 0)), float(el.get('rx')), float(el.get('ry'))), True)]
        elif tg == 'circle': r = float(el.get('r')); P = [(ellipse_pts(float(el.get('cx', 0)), float(el.get('cy', 0)), r, r), True)]
        elif tg == 'rect':
            x, y, w, h = [float(el.get(k, 0)) for k in 'x y width height'.split()]; P = [([(x, y), (x+w, y), (x+w, y+h), (x, y+h)], True)]
        elif tg == 'line': P = [([(float(el.get('x1')), float(el.get('y1'))), (float(el.get('x2')), float(el.get('y2')))], False)]
        else: return None
        m = re.search(r'translate\(\s*(-?[\d.]+)[ ,]+(-?[\d.]+)', el.get('transform') or '')
        t2 = (tr[0] + (float(m.group(1)) if m else 0), tr[1] + (float(m.group(2)) if m else 0))
        return [([((x+t2[0]-vb[0])*S, (y+t2[1]-vb[1])*S) for x, y in pts], closed) for pts, closed in P], t2
    def mask_of(polys, fill, sw):
        m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
        for pts, closed in polys:
            if fill and closed and len(pts) > 2: d.polygon(pts, fill=255)
            if sw:
                w = max(1, int(sw*S))
                seq = pts if closed else pts
                for a, b in zip(seq, seq[1:]): d.line([a, b], fill=255, width=w)
                for p in seq[::2]: d.ellipse([p[0]-w/2, p[1]-w/2, p[0]+w/2, p[1]+w/2], fill=255)
        return m
    def clip_mask(cid, tr):
        cp = clips[cid]; m = Image.new('L', (W, H), 0)
        for ch in cp:
            r = shape_polys(ch, tr)
            if r: m = Image.composite(Image.new('L', (W, H), 255), m, mask_of(r[0], True, 0))
        return m
    def draw(el, st, tr, clip):
        nonlocal img
        tg = strip(el.tag)
        if tg in ('defs', 'clipPath', 'style', 'title', 'desc'): return
        st = style_of(el, st)
        cp = el.get('clip-path'); cm = clip
        if cp:
            mm = re.search(r'#([^)]+)\)', cp); nm = clip_mask(mm.group(1), tr)
            from PIL import ImageChops
            cm = nm if clip is None else ImageChops.multiply(nm, clip)
        if tg in ('svg', 'g'):
            m = re.search(r'translate\(\s*(-?[\d.]+)[ ,]+(-?[\d.]+)', el.get('transform') or '')
            t2 = (tr[0] + (float(m.group(1)) if m else 0), tr[1] + (float(m.group(2)) if m else 0))
            for ch in el: draw(ch, st, t2, cm)
            return
        r = shape_polys(el, tr)
        if r is None: return
        polys, _ = r
        fill = st.get('fill', 'black'); stroke = st.get('stroke', 'none'); sw = st.get('sw', 1.0)
        op = st.get('opacity', 1.0)
        from PIL import ImageChops
        for kind in ('fill', 'stroke'):
            col = fill if kind == 'fill' else stroke
            if col in ('none', None): continue
            m = mask_of(polys, kind == 'fill', 0 if kind == 'fill' else sw)
            a = op * (st.get('fo', 1.0) if kind == 'fill' else 1.0)
            if a < 1: m = m.point(lambda v: int(v*a))
            if cm is not None: m = ImageChops.multiply(m, cm)
            img.paste(Image.new('RGBA', (W, H), hexcol(col) + (255,)), (0, 0), m)
    draw(root, {}, (0, 0), None)
    return img.convert('RGB')

if __name__ == '__main__':
    a = sys.argv[1:]
    if a[0] == '--sheet':
        out, ins = a[1], a[2:]; ims = [render(p, 2) for p in ins]
        w, h = ims[0].size; sheet = Image.new('RGB', (w*len(ims), h), (255, 255, 255))
        for i, im in enumerate(ims): sheet.paste(im, (i*w, 0))
        sheet.save(out)
    else:
        render(a[0], int(a[2]) if len(a) > 2 else 3).save(a[1])
