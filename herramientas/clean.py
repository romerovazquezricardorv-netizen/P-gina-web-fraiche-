# Quita recortes que no son producto: sombras (casi negras y delgadas) y sellos/textos muy anchos y bajos.
import sys, os
from PIL import Image, ImageStat
D = sys.argv[1]; bad = []
for f in os.listdir(D):
    im = Image.open(os.path.join(D, f)).convert('RGBA'); w, h = im.size
    rgb = Image.new('RGB', im.size, (255, 255, 255)); rgb.paste(im, mask=im.split()[3])
    a = ImageStat.Stat(im.split()[3]).mean[0] / 255
    px = [p for p in im.getdata() if p[3] > 128]
    dark = sum(1 for p in px if p[0] + p[1] + p[2] < 90) / max(1, len(px))
    if dark > .9 or w / h > 3.2 or (w < 70 and h > 250): bad.append(f)
os.makedirs(os.path.join(os.path.dirname(D), 'descartes'), exist_ok=True)
for f in bad: os.replace(os.path.join(D, f), os.path.join(os.path.dirname(D), 'descartes', f))
print(len(bad), 'descartados', len(os.listdir(D)), 'quedan')
