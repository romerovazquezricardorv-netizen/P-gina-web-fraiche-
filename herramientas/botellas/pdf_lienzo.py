import sys, os, numpy as np
sys.path.insert(0, '/home/user/p-gina-web-fraiche-/herramientas/botellas')
from uniforma import normaliza, lienzo
from PIL import Image
d = sys.argv[1]
for f in sorted(os.listdir(d)):
    if not f.endswith('-cut.png'): continue
    cut = Image.open(os.path.join(d, f)).convert('RGBA')
    a = np.asarray(cut.split()[3]); ys, xs = np.nonzero(a > 60)
    cut = cut.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    lienzo([normaliza(cut, blanco='rosa' not in f or 'ice' in f)], S=700).save(os.path.join(d, f[:-8] + '.webp'), 'WEBP', quality=86, method=6)
