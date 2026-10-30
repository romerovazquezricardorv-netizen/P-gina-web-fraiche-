import sys, numpy as np
sys.path.insert(0, '/home/user/p-gina-web-fraiche-/herramientas/botellas')
from uniforma import normaliza, lienzo
from PIL import Image
O = sys.argv[1] + '/'; R = '/home/user/p-gina-web-fraiche-/img/botellas/'
def L(n):
    c = Image.open(O + n + '-cut.png').convert('RGBA'); a = np.asarray(c.split()[3]); ys, xs = np.nonzero(a > 60)
    return normaliza(c.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)), blanco='liliana-rosa' not in n)
for nom, bs, al in [('120', ['120-caballero-torso-man-teal', '120-dama-ice-rosa', '120-dama-torso-woman-rojo'], [1, 1, .95]),
                    ('60', ['60-caballero-perseo-turquesa', '60-dama-liliana-transcendent-pink'], [.8, 1]),
                    ('30', ['30-caballero-for-men-turquesa', '30-dama-liliana-melon'], [.75, 1]),
                    ('32', ['32-unisex-4you-peace'], [1])]:
    lienzo([L(b) for b in bs], S=700, alturas=al).save(R + nom + '.webp', 'WEBP', quality=86, method=6); print(nom)
