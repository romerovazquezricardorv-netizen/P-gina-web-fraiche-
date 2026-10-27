# Quita lo que se ve a través del vidrio: el interior toma el color propio de la botella
# (mediana por renglón, que respeta degradados), y se conservan bordes, brillos y relieves.
import os, numpy as np
from PIL import Image
from scipy import ndimage as nd
for f in sorted(os.listdir('out')):
    if not f[:2].isdigit(): continue
    im = Image.open('out/' + f).convert('RGBA'); a = np.asarray(im).astype(float)
    rgb, al = a[..., :3], a[..., 3]
    if int(f[:2]) >= 11:            # 120 ml y 16 ml ya son fotos de estudio
        Image.fromarray(a.astype('uint8')).save('out2/' + f); continue
    m = al > 128
    dist = nd.distance_transform_edt(m)
    w = m.shape[1]
    # color propio por renglón: mediana de los píxeles interiores
    clean = np.zeros_like(rgb)
    inner = dist > w * .04
    for y in range(m.shape[0]):
        row = inner[y]
        src = row if row.sum() > 8 else m[y]
        if src.sum(): clean[y] = np.median(rgb[y][src], axis=0)
    clean = nd.uniform_filter1d(clean, size=41, axis=0)          # degradado suave de arriba a abajo
    # detalle fino (relieve, letras, filo del vidrio): diferencia con un desenfoque pequeño
    fino = rgb - nd.gaussian_filter(rgb, sigma=(2.5, 2.5, 0))
    lum = rgb.mean(2); clum = clean.mean(2)
    brillo = np.clip((lum - clum - 25) / 60, 0, 1)                # reflejos blancos se quedan
    borde = np.clip(1 - (dist - w * .015) / (w * .05), 0, 1)       # orillas se quedan como en la foto
    k = np.maximum(brillo, borde)[..., None]
    out = clean + fino * .9
    out = out * (1 - k) + rgb * k
    out = np.clip(out, 0, 255)
    res = np.dstack([out, al]).astype('uint8')
    Image.fromarray(res).save('out2/' + f); print(f)
