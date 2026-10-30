# Deja todas las fotos de envases con el mismo estilo: sin fondo, sobre blanco, misma sombra,
# misma exposición (niveles) y sin dominante de color (punto blanco en los brillos).
import sys, os, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd
from rembg import new_session, remove
S = None
def recorta(im):
    global S
    S = S or new_session('isnet-general-use')
    cut = remove(im.convert('RGB'), session=S)
    a = np.asarray(cut.split()[3])
    lab, n = nd.label(a > 60)
    if n > 1:
        sz = nd.sum(np.ones_like(a), lab, range(1, n + 1)); keep = [i + 1 for i, v in enumerate(sz) if v > sz.max() * .2]
        m = nd.binary_dilation(np.isin(lab, keep), iterations=3)
        cut.putalpha(Image.fromarray(np.minimum(a, m * 255).astype('uint8')))
    return cut.crop(cut.getbbox())
def normaliza(im, blanco=True):
    a = np.asarray(im.convert('RGBA')).astype(float); rgb, al = a[..., :3], a[..., 3]
    m = al > 200
    if m.sum() < 50: return im
    px = rgb[m]; lum = px @ [.299, .587, .114]
    # 1) punto blanco: los brillos más fuertes deben ser blancos neutros (quita tonos rosas, azules, amarillos)
    top = px[lum >= np.percentile(lum, 98.5)].mean(0)
    gain = np.clip(top.mean() / np.maximum(top, 1), .85, 1.18) if blanco else 1   # frascos esmerilados: sin corregir tono
    rgb = rgb * gain
    # 2) niveles: sombra profunda a 6 y brillo a 250, igual en todas
    lum = (rgb[m] @ [.299, .587, .114])
    lo, hi = np.percentile(lum, .8), np.percentile(lum, 99.4)
    lo = min(lo, 40)                                    # no oscurecer frascos claros o pastel
    k = min(244 / max(hi - lo, 1), 1.3)                 # sin estirar de más el contraste
    rgb = (rgb - lo) * k + 6 + (250 - (hi - lo) * k - 6) * .5   # sube el brillo hacia el mismo punto
    # 3) misma saturación base (sin exagerar)
    g = rgb.mean(2, keepdims=True); rgb = g + (rgb - g) * 1.06
    out = np.dstack([np.clip(rgb, 0, 255), al]).astype('uint8')
    return Image.fromarray(out)
def lienzo(bots, S=800, alturas=None):
    c = Image.new('RGBA', (S, S), (255, 255, 255, 255)); alturas = alturas or [1] * len(bots)
    H = int(S * .8); base = int(S * .9)
    es = [b.resize((max(1, int(b.width * H * h / b.height)), max(1, int(H * h))), Image.LANCZOS) for b, h in zip(bots, alturas)]
    gap = int(S * .05); tot = sum(e.width for e in es) + gap * (len(es) - 1)
    if tot > S * .9:
        k = S * .9 / tot; es = [e.resize((max(1, int(e.width * k)), max(1, int(e.height * k))), Image.LANCZOS) for e in es]; gap = int(gap * k); tot = sum(e.width for e in es) + gap * (len(es) - 1)
    sh = Image.new('L', (S, S), 0); d = ImageDraw.Draw(sh); x = (S - tot) // 2
    for e in es: d.ellipse((x + e.width * .08, base - 14, x + e.width * .92, base + 14), fill=70); x += e.width + gap
    c.alpha_composite(Image.merge('RGBA', [Image.new('L', (S, S), 40)] * 3 + [sh.filter(ImageFilter.GaussianBlur(14))]))
    x = (S - tot) // 2
    for e in es: c.alpha_composite(e, (x, base - e.height)); x += e.width + gap
    return c.convert('RGB')
if __name__ == '__main__':
    src, dst, lista = sys.argv[1], sys.argv[2], sys.argv[3]
    for f in open(lista).read().split():
        im = Image.open(os.path.join(src, f)).convert('RGBA')
        if im.getextrema()[3][0] == 0:            # ya era recorte transparente
            cut = im.crop(im.getbbox())
        else:
            cut = recorta(im)
        lienzo([normaliza(cut)], S=700).save(os.path.join(dst, f), 'WEBP', quality=86, method=6)
        print(f, flush=True)
