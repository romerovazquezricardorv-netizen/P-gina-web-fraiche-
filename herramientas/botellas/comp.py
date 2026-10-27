import os, numpy as np
from PIL import Image, ImageDraw, ImageFilter
O = 'out2/'; R = '/home/user/p-gina-web-fraiche-/img/botellas/'; os.makedirs(R, exist_ok=True)
import sys; sys.path.insert(0, '/tmp/claude-0/bot')
from uniforma import normaliza
def L(n): return normaliza(Image.open(O + [f for f in os.listdir(O) if f.startswith(n + '-')][0]).convert('RGBA'))
def split(im):  # separa dos botellas por la columna vacía central
    a = np.array(im.split()[3]) > 30; col = a.sum(0); w = len(col)
    mid = range(int(w * .3), int(w * .7)); x = min(mid, key=lambda i: col[i])
    l, r = im.crop((0, 0, x, im.height)), im.crop((x, 0, w, im.height))
    return l.crop(l.getbbox()), r.crop(r.getbbox())
def lienzo(bots, alturas=None, S=900):
    c = Image.new('RGBA', (S, S), (255, 255, 255, 255))
    alturas = alturas or [1] * len(bots)
    H = int(S * .8); base = int(S * .9)
    escal = [b.resize((max(1, int(b.width * H * h / b.height)), int(H * h)), Image.LANCZOS) for b, h in zip(bots, alturas)]
    gap = int(S * .05); tot = sum(e.width for e in escal) + gap * (len(escal) - 1)
    if tot > S * .9:  # que quepan
        k = S * .9 / tot; escal = [e.resize((int(e.width * k), int(e.height * k)), Image.LANCZOS) for e in escal]; gap = int(gap * k); tot = int(S * .9)
    x = (S - tot) // 2
    sh = Image.new('L', (S, S), 0); d = ImageDraw.Draw(sh)
    for e in escal:
        d.ellipse((x + e.width * .08, base - 14, x + e.width * .92, base + 14), fill=70); x += e.width + gap
    c.alpha_composite(Image.merge('RGBA', [Image.new('L', (S, S), 40)] * 3 + [sh.filter(ImageFilter.GaussianBlur(14))]))
    x = (S - tot) // 2
    for e in escal:
        c.alpha_composite(e, (x, base - e.height)); x += e.width + gap
    return c.convert('RGB')
def guarda(im, n): im.save(R + n + '.webp', 'WEBP', quality=86, method=6); print(n)
b = {k: L(k) for k in ['01','02','03','04','06','07','08','09','11','12','13']}
nude30, _ = split(L('10'))
for n, k in [('60-caballero-negra','01'),('60-caballero-turquesa','02'),('60-dama-nude','06'),('60-dama-rosa','07'),('60-dama-morada','08'),
             ('30-caballero-turquesa','03'),('30-caballero-verde','04'),('30-dama-naranja','09'),('120-caballero-negro','11'),('120-dama-rojo','12'),('16-unisex','13')]:
    guarda(lienzo([b[k]]), n)
guarda(lienzo([nude30]), '30-dama-nude')
guarda(lienzo([b['01'], b['07']]), '60')
guarda(lienzo([b['03'], b['09']]), '30')
guarda(lienzo([b['11'], b['12']]), '120')
c30, c60 = split(L('05')); guarda(lienzo([c30, c60], [.62, 1]), 'comparar-caballero')
d30, d60 = split(L('10')); guarda(lienzo([d30, d60], [.78, 1]), 'comparar-dama')
