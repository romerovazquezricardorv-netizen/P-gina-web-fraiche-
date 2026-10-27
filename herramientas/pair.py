# Junta cada imagen con su máscara (smask) en un PNG con transparencia y guarda solo los recortes de producto.
import sys, os
from PIL import Image
D = sys.argv[1]; OFF = {1: 0, 2: 104, 3: 215}
out = os.path.join(D, 'cut'); n = 0
for part in (1, 2, 3):
    rows = [l.split() for l in open(os.path.join(D, f'list{part}.txt')).read().splitlines()[2:]]
    for i, r in enumerate(rows):
        page, num, typ, w, h = int(r[0]), int(r[1]), r[2], int(r[3]), int(r[4])
        if typ != 'image' or i + 1 >= len(rows) or rows[i + 1][2] != 'smask': continue
        if max(w, h) < 120 or r[5] == 'gray': continue
        img = Image.open(os.path.join(D, 'raw', str(part), f'x-{num:03d}.png')).convert('RGB')
        m = Image.open(os.path.join(D, 'raw', str(part), f'x-{int(rows[i+1][1]):03d}.png')).convert('L').resize(img.size)
        # descarta fondos casi sin transparencia (fotos de ambiente) y máscaras vacías
        hist = m.histogram(); total = sum(hist); clear = sum(hist[:16]) / total; solid = sum(hist[240:]) / total
        if clear < .08 or solid < .08: continue
        img.putalpha(m); bb = img.getbbox()
        if not bb: continue
        img = img.crop(bb)
        if max(img.size) < 110: continue
        img.save(os.path.join(out, f'{OFF[part] + page:03d}-{num:04d}.png')); n += 1
print(n, 'recortes')
