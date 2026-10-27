# Genera la tienda a partir del catálogo: catalogo.js (productos) + img/*.webp (fotos).
# Uso: python3 -I genera.py <scratchpad> <repo>
import sys, os, json, math, importlib.util
from PIL import Image
S, REPO = sys.argv[1], sys.argv[2]
D = os.path.join(S, 'catalogo')
def load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(S, 'datos', name + '.py'))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
s1, s2, s3, s4, fotos = load('s1_regalos'), load('s2_colors_cuidado'), load('s3_envases'), load('s4_kids_hogar'), load('fotos')

# misma rebaja que la lista de precios: -$3 desde $100, -$2 de $30 a $99, -$1 abajo de $30, sin centavos
baja = lambda p: math.floor(p - (3 if p >= 100 else 2 if p >= 30 else 1))

# precio de perfume por tamaño y esencia (ya rebajado), de productos.js
import re
txt = open(os.path.join(REPO, 'productos.js'), encoding='utf-8').read()
PERF = {}
for m in re.finditer(r"\{id:'nuevo-(\d+)'.*?precios:\{([^}]*)\}", txt):
    PERF[int(m.group(1))] = {k: int(v) for k, v in re.findall(r"(\w+):(\d+)", m.group(2))}

CAT = {  # sección del catálogo -> categoría de la tienda
}
def categoria(p, sec):
    t = (p.get('tipo') or '').lower()
    if sec == 'kids': return 'ninos'
    if sec == 'envases' or p.get('envase'): return 'envases'
    if 'kit' in t or p['id'] in ('mixed-elixir',): return 'regalos'
    if sec == 'colors' or 'esmalte' in t or 'maquillaje' in t: return 'maquillaje'
    if 'vela' in t: return 'velas'
    if any(w in t for w in ('difusor', 'aromatizante', 'textil', 'antisép', 'desinfect', 'envase', 'jabón líquido')): return 'casa'
    if any(w in t for w in ('cosmetiquera', 'bolsa', 'vaso', 'termo')): return 'accesorios'
    if any(w in t for w in ('capilar', 'shampoo', 'gel fijador')): return 'cabello'
    if 'desodorante' in t or 'antitranspirante' in t: return 'desodorantes'
    if 'agua de colonia' in t: return 'colonias'
    if 'loción' in t or 'spray corporal' in t: return 'bodys'
    return 'cremas'

os.makedirs(os.path.join(REPO, 'img'), exist_ok=True)
hechas = set()
CACHE = os.path.join(S, 'fotos-hechas.json')
HECHO = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
NUEVO = {}
def foto(spec, nombre):
    """spec: 'c:PPP-NNNN' recorte transparente, o 'r:PPP:x0,y0,x1,y1' recorte de la página (fracciones)."""
    if not spec: return None
    out = os.path.join(REPO, 'img', nombre + '.webp')
    if HECHO.get(nombre) == spec and os.path.exists(out):
        hechas.add(nombre + '.webp'); NUEVO[nombre] = spec; return 'img/' + nombre + '.webp'
    if spec.startswith('c:'):
        im = Image.open(os.path.join(D, 'cut', spec[2:] + '.png')).convert('RGBA')
    else:
        _, pg, box = spec.split(':'); x0, y0, x1, y1 = map(float, box.split(','))
        pim = Image.open(os.path.join(D, 'pag', f'{int(pg):03d}.png')).convert('RGB')
        W, H = pim.size; im = pim.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)))
    im.thumbnail((520, 520))
    im.save(out, 'WEBP', quality=82, method=6)
    NUEVO[nombre] = spec
    hechas.add(nombre + '.webp')
    return 'img/' + nombre + '.webp'

productos = []
def agrega(lista, sec):
    for p in lista:
        f = fotos.F.get(p['id'], {})
        o = {'id': p['id'], 'cat': categoria(p, sec), 'nombre': p['nombre'], 'pag': p['pag']}
        for k in ('tipo', 'cont', 'notas', 'desc', 'linea', 'genero', 'incluye'):
            if p.get(k): o[k] = p[k]
        if sec == 'envases': o['tipo'] = 'Envase de perfume'
        if p.get('esp'): o['esp'] = True
        if p.get('prox'): o['prox'] = True
        if p.get('pers') or p.get('envase'): o['aroma'] = True
        img = foto(f.get('img'), p['id'])
        if img: o['img'] = img
        vs = []
        for i, v in enumerate(p.get('var', [])):
            vo = {'n': v[0]}
            if v[1]: vo['notas'] = v[1]
            if len(v) > 2:
                if p.get('envase'): vo['ml'] = v[2]
                else: vo['precio'] = baja(v[2])
            vimg = foto((f.get('var') or {}).get(i), f"{p['id']}-{i + 1}")
            if vimg: vo['img'] = vimg
            vs.append(vo)
        if vs: o['var'] = vs
        if p.get('envase'):
            o['envase'] = p['envase']; o['precios'] = PERF[p['envase']]
            if any('ml' in v for v in vs):
                for v in vs:
                    if 'ml' in v: v['precios'] = PERF[v['ml']]
        elif p.get('precio') is not None:
            o['precios'] = {'linea': baja(p['precio'])}
        elif vs and all('precio' in v for v in vs):
            o['precios'] = {'linea': min(v['precio'] for v in vs)}
        else:
            o['consultar'] = True
        if not o.get('img') and vs and vs[0].get('img'): o['img'] = vs[0]['img']
        productos.append(o)
agrega(s1.P, 'regalos'); agrega(s2.COLORS, 'colors'); agrega(s2.CUIDADO, 'cuidado')
agrega(s3.NEECHE, 'neeche'); agrega(s3.ENVASES, 'envases'); agrega(s4.KIDS, 'kids'); agrega(s4.HOGAR, 'hogar')

# fotos viejas que ya no se usan
for f in os.listdir(os.path.join(REPO, 'img')):
    if f not in hechas: os.remove(os.path.join(REPO, 'img', f))

json.dump(NUEVO, open(CACHE, 'w'))
lines = ',\n'.join('  ' + json.dumps(p, ensure_ascii=False) for p in productos)
open(os.path.join(REPO, 'catalogo.js'), 'w', encoding='utf-8').write(
    '// Productos del Catálogo Fraiche 2026 (generado desde el PDF). Precios ya con la rebaja:\n'
    '// -$3 desde $100, -$2 de $30 a $99, -$1 abajo de $30, sin centavos. Los envases de perfume se cobran por esencia\n'
    '// según su tamaño (mismos precios que "Perfume X ml" en productos.js).\n'
    '// pag = página del catálogo; img = foto en img/; var = variantes (aromas, colores, diseños).\n'
    'window.CATALOGO = [\n' + lines + '\n];\n')
sin = [p['id'] for p in productos if not p.get('img')]
print(len(productos), 'productos,', sum(len(p.get('var', [])) for p in productos), 'variantes,', len(hechas), 'fotos; sin foto:', len(sin), sin[:40])
