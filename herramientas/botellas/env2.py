import sys; sys.path.insert(0, '/tmp/claude-0/bot')
from uniforma import normaliza, lienzo
from PIL import Image
C = '/tmp/claude-0/-home-user-p-gina-web-fraiche-/5363f9e1-b5bf-55ca-a891-f4d6b6b8027f/scratchpad/catalogo/cut/'
M = {'torso-man-negro':'276-0983','torso-man-teal':'276-1009','torso-woman-rojo':'273-0871','torso-woman-turquesa':'273-0897',
 'perseo-turquesa':'273-0855','perseo-indigo':'273-0883','perseo-azul-212':'276-0985','perseo-verde-oscuro':'276-0987',
 'liliana60-melon':'273-0847','liliana60-rosa':'273-0863','liliana60-lila':'273-0861','liliana60-pink':'273-0849',
 'formen-1036':'277-1036','formen-1038':'277-1038','formen-1040':'277-1040',
 'liliana30-melon':'273-0857','liliana30-rosa':'273-0895','liliana30-pink':'273-0851'}
B = {}
for n, k in M.items():
    im = Image.open(C + k + '.png').convert('RGBA'); B[n] = normaliza(im.crop(im.getbbox()))
    lienzo([B[n]], S=700).save(f'env2/{n}.webp', 'WEBP', quality=88)
import pickle; pickle.dump({k: (v.mode, v.size, v.tobytes()) for k, v in B.items()}, open('env2/b.pkl', 'wb'))
