# Genera aromas.js desde la Genealogía 2026: nombre de referencia, género, tipo de esencia y nota principal.
import json, re, sys
d = json.load(open('raw.json'))
ACR = {'VIP','CK','CH','DG','D&G','EDP','EDT','LV','TF','DKNY','YSL','H2O','JPG','AAA','BS','II','III','IV','PR','GDT','NO','OUD','XS','L.12.12','L1212','KW','TM','CR7','DKN','SL','MK','PH','NY','ILNY','BFF','EAU','GA','JLO','DNA','UB','BT','XR','NB'}
ART = {'de','la','le','les','du','des','el','y','en','of','the','pour','for','a','by','di','da'}
def bonito(s):
    s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r'\s+NICH(O)?$', '', s)
    out = []
    for i, w in enumerate(s.split(' ')):
        lw = w.lower()
        if w.upper() in ACR or re.search(r'\d', w): out.append(w.upper())
        elif i and lw in ART: out.append(lw)
        else: out.append(w[:1].upper() + w[1:].lower())
    return ' '.join(out)
def nota(s):
    s = s.strip().rstrip('.').replace('. ', ', ')
    fix = {'PACHULLI': 'PACHULI', 'FLOR DE AZHAR': 'FLOR DE AZAHAR', 'CAFE': 'CAFÉ', 'SANDIA': 'SANDÍA', 'MARACUYA': 'MARACUYÁ', 'VETIVIER': 'VETIVER',
           'ALGODÓN DE AZUCAR': 'ALGODÓN DE AZÚCAR', 'NOTAS ACUATICAS': 'NOTAS ACUÁTICAS', 'PEONIA': 'PEONÍA', 'ORQUIDEA': 'ORQUÍDEA', 'MUGET': 'MUGUET',
           'RAIZ DE LIRIO': 'RAÍZ DE LIRIO', 'FRANGIPIANI': 'FRANGIPANI', 'CIRUELA OBSCURA': 'CIRUELA OSCURA'}
    s = re.sub(r'\s+', ' ', s.upper()); s = fix.get(s, s)
    return s[:1] + s[1:].lower()
# familia olfativa según la nota principal (palabras clave)
FAM = [
 ('Cítrica', 'fresca, luminosa y energizante', 'cítric limón toronja mandarina bergamota naranja neroli pomelo lima azahar del limonero yuzu'),
 ('Gourmand', 'dulce, cálida y antojable', 'vainilla caramelo chocolate cacao malvavisco praliné algodón café almendra goma dulces galletas pay crema pan avellana castaña trufa leche refresco tonka'),
 ('Frutal', 'jugosa, dulce y alegre', 'cereza frambuesa pera manzana durazno mango piña coco fresa sandía frut lichi ciruela chabacano grosella casis kiwi pitahaya maracuy mora zarzamora granada uva melocotón nectarina higo bayas'),
 ('Floral', 'femenina, delicada y romántica', 'rosa jazmín gardenia peon violeta magnolia flor lirio muguet ylang fresia iris narciso nardo orquídea mimosa osmanto geranio clavel heliótropo frangipani loto noche buena'),
 ('Acuática', 'fresca, limpia y ligera', 'acuos acuátic marin ozono solar'),
 ('Aromática', 'verde, limpia y refrescante', 'lavanda salvia menta romero verde manzanilla albahaca artemisa hinojo cilantro galbano absenta ajenjo té'),
 ('Especiada', 'cálida, intensa y seductora', 'pimienta cardamomo azafrán canela nuez jengibre especia clavo elemí'),
 ('Amaderada', 'elegante, seca y con carácter', 'madera sándalo cedro vetiver pachuli oud roble ébano amberwood musgo cachemira'),
 ('Oriental', 'envolvente, sensual y profunda', 'ámbar incienso mirra almizcle ládano bálsamo aldehído atalcad'),
 ('Licor y cuero', 'intensa, oscura y sofisticada', 'cuero tabaco ron whisky brandy cognac coñac bourbon vino champaña olivano'),
]
def familia(n):
    l = n.lower()
    for f, desc, keys in FAM:
        if any(k in l for k in keys.split()): return f, desc
    return 'Fragancia', 'con personalidad propia'
TIPO = [('AMBIENTALES', 'ambiental'), ('TRADICIONAL', 'linea'), ('NICHO', 'neeche'), ('ÁRABES', 'arabe')]
G = {'D': 'Dama', 'C': 'Caballero', 'U': 'Unisex', 'E': 'Ambiental'}
seen, out = set(), []
for o in d:
    name, nt = o['cells']; sec = o['sec']
    e = next((v for k, v in TIPO if k in sec), 'linea')
    pre = name[:1]
    g = G.get(pre, 'Unisex')
    n = bonito(name[1:] if pre in G else name)
    k = (n.lower(), e)
    if k in seen: continue
    seen.add(k)
    nn = nota(nt); f, desc = familia(nn)
    a = {'n': n, 'g': g, 'e': e, 'nota': nn, 'fam': f, 'desc': desc}
    if 'NIÑO' in sec or (sec == 'TRADICIONAL'): a['kids'] = True
    out.append(a)
out.sort(key=lambda a: (a['e'], a['n'].lower()))
lines = ',\n'.join('  ' + json.dumps(a, ensure_ascii=False, separators=(',', ':')) for a in out)
open(sys.argv[1], 'w', encoding='utf-8').write(
  '// Aromas de la Guía de Tendencias (Genealogía) Fraiche 2026: nombre de referencia ("inspirado olfativamente en"),\n'
  '// género, tipo de esencia (linea = tradicional, neeche = nicho, arabe = árabes, ambiental) y nota principal.\n'
  '// fam y desc se deducen de la nota principal para describir a qué huele.\n'
  'window.AROMAS = [\n' + lines + '\n];\n')
import collections
print(len(out), collections.Counter(a['e'] for a in out), collections.Counter(a['g'] for a in out), collections.Counter(a['fam'] for a in out).most_common())
print([a for a in out if 'vip black' in a['n'].lower()])
print([a['n'] for a in out[::60]])
