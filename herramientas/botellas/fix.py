import sys; sys.path.insert(0, '/tmp/claude-0/bot')
from uniforma import recorta, normaliza, lienzo
from PIL import Image
D = '/tmp/claude-0/-home-user-p-gina-web-fraiche-/5363f9e1-b5bf-55ca-a891-f4d6b6b8027f/scratchpad/catalogo/'
C = lambda k: ('c', k); P = lambda p, *b: ('p', p, b)
M = {
 'ice-120-2': C('273-0889'), 'ice-120-3': C('273-0881'), 'ice-120-4': C('273-0891'),
 'ice-60': C('273-0865'), 'ice-60-2': C('273-0867'), 'liliana-2': C('273-0847'),
 'miss-mexico-4': C('274-0938'), 'desire-legend-2': C('274-0916'), 'desire-legend-3': C('274-0940'),
 'perfumeros-4you-3': C('275-0949'), 'perfumeros-4you-vibes-1': C('275-0963'), 'perfumeros-4you-vibes-3': C('275-0959'),
 'marine-abril-2': C('276-1005'), 'marine-abril-4': C('276-0997'), 'marine-abril-6': C('276-0989'), 'axel-2': C('276-1015'),
 'axel-1': P(199, 0, .27, .38, .92), 'axel-3': P(199, .62, .27, .98, .92),
 'torsos-futbol-3': P(10, .8, .22, 1, .9), 'torsos-futbol-4': P(11, .05, .17, .4, .9),
 'linea-aaa-perfumes-1': P(40, .05, .15, .62, .78),
}
for n, s in M.items():
    if s[0] == 'c': cut = Image.open(D + 'cut/' + s[1] + '.png').convert('RGBA'); cut = cut.crop(cut.getbbox())
    else:
        pg = Image.open(D + f'pag/{s[1]:03d}.png').convert('RGB'); W, H = pg.size; x0, y0, x1, y1 = s[2]
        cut = recorta(pg.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H))))
    lienzo([normaliza(cut)], S=700).save(f'todo/img/{n}.webp', 'WEBP', quality=86, method=6); print(n)
