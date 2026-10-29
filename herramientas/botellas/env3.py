import sys, pickle, shutil, os; sys.path.insert(0, '/tmp/claude-0/bot')
from uniforma import lienzo
from PIL import Image
B = {k: Image.frombytes(*v) for k, v in pickle.load(open('env2/b.pkl', 'rb')).items()}
R = '/home/user/p-gina-web-fraiche-/img/botellas/'
N = {'120-caballero-torso-man-negro':'torso-man-negro','120-caballero-torso-man-teal':'torso-man-teal','120-dama-torso-woman-rojo':'torso-woman-rojo','120-dama-torso-woman-turquesa':'torso-woman-turquesa',
 '60-caballero-perseo-turquesa':'perseo-turquesa','60-caballero-perseo-indigo':'perseo-indigo','60-caballero-perseo-azul-212':'perseo-azul-212','60-caballero-perseo-verde-oscuro':'perseo-verde-oscuro',
 '60-dama-liliana-melon':'liliana60-melon','60-dama-liliana-rosa':'liliana60-pink','60-dama-liliana-lila':'liliana60-lila','60-dama-liliana-transcendent-pink':'liliana60-rosa',
 '30-caballero-for-men-turquesa':'formen-1036','30-caballero-for-men-humo-azul':'formen-1038','30-caballero-for-men-esmeralda':'formen-1040',
 '30-dama-liliana-melon':'liliana30-melon','30-dama-liliana-rosa':'liliana30-pink','30-dama-liliana-transcendent-pink':'liliana30-rosa'}
for dst, src in N.items(): shutil.copy(f'env2/{src}.webp', R + dst + '.webp')
for n, ks in [('120', ['torso-man-negro', 'torso-woman-rojo']), ('60', ['perseo-turquesa', 'liliana60-rosa']), ('30', ['formen-1036', 'liliana30-melon'])]:
    lienzo([B[k] for k in ks], S=900).save(R + n + '.webp', 'WEBP', quality=86)
for f in os.listdir(R):
    if f.startswith(('120-caballero-negro', '120-dama-rojo', '60-caballero-negra', '60-caballero-turquesa', '60-dama-nude', '60-dama-rosa.', '60-dama-morada', '30-caballero-turquesa', '30-caballero-verde', '30-dama-naranja', '30-dama-nude', 'comparar')):
        os.remove(R + f)
print(sorted(os.listdir(R)))
