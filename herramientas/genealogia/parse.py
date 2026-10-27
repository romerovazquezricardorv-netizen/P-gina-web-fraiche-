import re, json, html
x = open('gx.xml', encoding='utf-8').read()
CL = re.compile(r'^(?:0\d|S)/\d{4,5}[A-Z]?$')
out = []
for n, body in re.findall(r'<page number="(\d+)"[^>]*>(.*?)</page>', x, re.S):
    n = int(n)
    T = []
    for top, left, w, h, f, s in re.findall(r'<text top="(\d+)" left="(\d+)" width="(\d+)" height="(\d+)" font="(\d+)">(.*?)</text>', body):
        s = html.unescape(re.sub('<.*?>', '', s)).strip()
        if s and 0 <= int(left) < 1080: T.append((int(top), int(left), int(w), s))
    page_head = ' '.join(s for t, l, w, s in T if t < 60)
    heads = [(t, l, s) for t, l, w, s in T if re.match(r'^(TRADICIONAL|AMBIENTALES|NICHO|ÁRABES)', s) and t > 60]
    for t, l, w, s in T:
        s2 = s.split()[0] if s.split() else ''
        if not CL.match(s2): continue
        rest = s[len(s2):].strip()
        row = sorted([(l2, s3) for t2, l2, w2, s3 in T if abs(t2 - t) <= 5 and l < l2 < l + 470 and not CL.match(s3.split()[0])])
        cells = ([rest] if rest else []) + [c for _, c in row]
        sec = page_head
        for ht, hl, hs in heads:
            if ht < t and abs(hl - l) < 300: sec = hs
        out.append(dict(p=n, clave=s2, cells=cells, sec=sec, top=t, left=l))
json.dump(out, open('raw.json', 'w'), ensure_ascii=False, indent=0)
print(len(out))
import collections
print(collections.Counter(o['sec'][:60] for o in out))
print(collections.Counter(len(o['cells']) for o in out))
for o in out:
    if len(o['cells']) != 2: print(o['p'], o['clave'], o['cells'])
