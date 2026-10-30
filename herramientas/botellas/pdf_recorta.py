import sys, os
sys.path.insert(0, '/home/user/p-gina-web-fraiche-/herramientas/botellas')
from uniforma import recorta, normaliza, lienzo
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
for f in sorted(os.listdir(src)):
    im = Image.open(os.path.join(src, f)).convert('RGB')
    im.thumbnail((1600, 1600))
    cut = recorta(im)
    cut.save(os.path.join(dst, f[:-4] + '-cut.png'))
    lienzo([normaliza(cut)], S=700).save(os.path.join(dst, f[:-4] + '.webp'), 'WEBP', quality=86, method=6)
    print(f, cut.size, flush=True)
