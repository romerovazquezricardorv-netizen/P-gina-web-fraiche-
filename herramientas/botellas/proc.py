import sys, os, numpy as np
from rembg import new_session, remove
from PIL import Image, ImageFilter, ImageEnhance
s = new_session('isnet-general-use')
def comps(mask):
    # componentes conectados (4-vecinos) de una máscara booleana pequeña
    h, w = mask.shape; lab = np.zeros((h, w), int); n = 0; sizes = {}
    for y in range(h):
        for x in range(w):
            if mask[y, x] and not lab[y, x]:
                n += 1; st = [(y, x)]; lab[y, x] = n; c = 0
                while st:
                    a, b = st.pop(); c += 1
                    for da, db in ((1,0),(-1,0),(0,1),(0,-1)):
                        p, q = a+da, b+db
                        if 0 <= p < h and 0 <= q < w and mask[p, q] and not lab[p, q]: lab[p, q] = n; st.append((p, q))
                sizes[n] = c
    return lab, sizes
for f in sorted(os.listdir('in')):
    im = Image.open('in/' + f).convert('RGB'); im.thumbnail((1400, 1400))
    cut = remove(im, session=s)
    a = np.array(cut.split()[3])
    # quitar el texto ("60ML") y manchas: se queda con los componentes grandes
    small = Image.fromarray(a).resize((a.shape[1] // 8, a.shape[0] // 8))
    m = np.array(small) > 40
    lab, sizes = comps(m)
    big = max(sizes.values()) if sizes else 0
    keep = np.isin(lab, [k for k, v in sizes.items() if v > big * .25])
    keep = Image.fromarray((keep * 255).astype('uint8')).resize(cut.size).filter(ImageFilter.MaxFilter(9))
    a2 = np.minimum(a, np.array(keep))
    cut.putalpha(Image.fromarray(a2))
    cut = cut.crop(cut.getbbox())
    # que reluzca: un poco más de contraste y brillo
    rgb = ImageEnhance.Contrast(cut.convert('RGB')).enhance(1.08); rgb = ImageEnhance.Brightness(rgb).enhance(1.04)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.3); rgb.putalpha(cut.split()[3]); cut = rgb
    cut.save('out/' + f.rsplit('.', 1)[0] + '.png'); print(f, cut.size)
