'use strict';
/* =========================================================
   Distribuidor Independiente Fraiche · tienda
   Datos: productos.js (perfumes y rellenos por tamaño, window.PRODUCTOS)
   y catalogo.js (productos del Catálogo 2026 con fotos y variantes, window.CATALOGO).
   Aquí: filtros, favoritos, carrito y el pedido por WhatsApp.
   ========================================================= */

// ---- ajustes de la tienda ----
// Número de WhatsApp con lada de país y sin espacios: 52 (México) + los 10 dígitos.
const WHATSAPP = '525574348740';

const CATS = [
  { id: 'todo', nombre: 'Todo', h: 20, ilus: 'set', titulo: 'Todo el catálogo' },
  { id: 'aromas', nombre: 'Aromas', h: 330, ilus: 'frasco-chico', titulo: 'Aromas de la genealogía', nota: 'Busca tu perfume favorito por nombre, género o nota y pídelo en el tamaño que quieras.' },
  { id: 'nuevo', nombre: 'Perfumes', h: 345, ilus: 'frasco', titulo: 'Perfumes por tamaño', nota: 'Frasco nuevo con el aroma que elijas, en esencia de línea, neeche o árabe.' },
  { id: 'relleno', nombre: 'Rellenos', h: 150, ilus: 'relleno', titulo: 'Rellenos', nota: 'Traes tu frasco y lo llenamos. Cuesta menos que uno nuevo.' },
  { id: 'envases', nombre: 'Envases', h: 300, ilus: 'frasco-grande', titulo: 'Envases de perfume', nota: 'Elige el diseño y el aroma. El precio depende del tamaño y la esencia.' },
  { id: 'regalos', nombre: 'Regalos', h: 0, ilus: 'kit', titulo: 'Kits y regalos' },
  { id: 'bodys', nombre: 'Bodys', h: 95, ilus: 'body', titulo: 'Lociones corporales y bodys' },
  { id: 'cremas', nombre: 'Piel', h: 265, ilus: 'crema', titulo: 'Cremas y cuidado de la piel' },
  { id: 'desodorantes', nombre: 'Desodorantes', h: 30, ilus: 'desodorante', titulo: 'Desodorantes' },
  { id: 'cabello', nombre: 'Cabello', h: 190, ilus: 'spray', titulo: 'Cuidado del cabello' },
  { id: 'maquillaje', nombre: 'Maquillaje', h: 320, ilus: 'body-glitter', titulo: 'Maquillaje y uñas' },
  { id: 'colonias', nombre: 'Colonias', h: 205, ilus: 'botella', titulo: 'Aguas de colonia' },
  { id: 'ninos', nombre: 'Niños', h: 48, ilus: 'ninos', titulo: 'Para niños' },
  { id: 'velas', nombre: 'Velas', h: 25, ilus: 'vela', titulo: 'Velas aromáticas' },
  { id: 'casa', nombre: 'Casa y auto', h: 10, ilus: 'difusor', titulo: 'Casa y auto' },
  { id: 'accesorios', nombre: 'Accesorios', h: 280, ilus: 'kit', titulo: 'Cosmetiqueras, bolsas y más' },
];
const TAGS = [
  { id: 'todo', nombre: 'Todo' },
  { id: 'oferta', nombre: 'Precio especial' },
  { id: 'popular', nombre: 'Más pedidos' },
  { id: 'regalo', nombre: 'Para regalo' },
  { id: 'pura', nombre: 'Pura esencia' },
  { id: 'barato', nombre: 'Menos de $100' },
];
const ESENCIAS = [
  { id: 'linea', nombre: 'Esencia de línea', det: 'Las fragancias del catálogo' },
  { id: 'neeche', nombre: 'Esencia neeche', det: 'De nicho, más intensa' },
  { id: 'arabe', nombre: 'Esencia árabe', det: 'Cálida, dulce y amaderada' },
];
const $ = s => document.querySelector(s);
const money = n => '$' + n.toLocaleString('es-MX');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ILUS = { envases: 'frasco', regalos: 'kit', bodys: 'body', cremas: 'crema', desodorantes: 'desodorante', cabello: 'spray',
  maquillaje: 'body-glitter', colonias: 'botella', ninos: 'ninos', velas: 'vela', casa: 'difusor', accesorios: 'kit' };

// Un solo formato para todo: los productos del catálogo se adaptan al de productos.js.
// Los de productos.js que ya vienen del catálogo con nombre y foto (kits, figuras) se quitan.
const REPETIDOS = ['kit-for-you', 'set-destilados', 'capibara-pulpos'];
const P = [
  ...(window.CATALOGO || []).map(p => ({
    ...p,
    detalle: [p.tipo, p.cont].filter(Boolean).join(' · '),
    ilus: ILUS[p.cat] || 'frasco',
    tags: [...(p.esp ? ['oferta'] : []), ...(p.cat === 'regalos' ? ['regalo'] : [])],
  })),
  ...(window.PRODUCTOS || []).filter(p => (p.cat === 'nuevo' || p.cat === 'relleno') && !REPETIDOS.includes(p.id)),
];
const byId = Object.fromEntries(P.map(p => [p.id, p]));
const catOf = id => CATS.find(c => c.id === id) || CATS[0];
// precios de una variante (o del producto si no tiene variante o la variante no cambia el precio)
const preciosDe = (p, v) => {
  const x = p.var && p.var[v];
  if (x && x.precios) return x.precios;
  if (x && x.precio != null) return { linea: x.precio };
  return p.precios || null;
};
const minPrice = p => {
  const all = [p.precios, ...(p.var || []).map((_, i) => preciosDe(p, i))].filter(Boolean).flatMap(o => Object.values(o));
  return all.length ? Math.min(...all) : null;
};
const varias = p => !!p.var && p.var.some((_, i) => JSON.stringify(preciosDe(p, i)) !== JSON.stringify(preciosDe(p, 0)));
const pideAroma = p => p.cat === 'nuevo' || p.cat === 'relleno' || !!p.aroma;

/* ---------- dibujos (sin fotos todavía) ---------- */
const soft = 'fill="currentColor" fill-opacity=".14"';
const label = (x, y, t, s = 13) => t ? `<text x="${x}" y="${y}" text-anchor="middle" font-size="${s}" font-weight="800" fill="currentColor" stroke="none">${t}</text>` : '';
function bottle(cx, top, w, h, ml, opt = {}) {
  const neckW = w * .34, neckH = h * .16, capW = w * .58, capH = h * .3, bodyY = top + capH + neckH;
  return `<rect x="${cx - capW / 2}" y="${top}" width="${capW}" height="${capH}" rx="${capW * .16}" fill="currentColor" stroke="none"/>
    <rect x="${cx - neckW / 2}" y="${top + capH}" width="${neckW}" height="${neckH}" ${soft}/>
    <rect x="${cx - w / 2}" y="${bodyY}" width="${w}" height="${h}" rx="${w * .2}" ${soft}/>
    <path d="M${cx - w / 2 + 8} ${bodyY + 10}v${h * .45}" stroke-width="3" opacity=".5"/>
    ${opt.star ? `<path d="M${cx} ${bodyY + h * .3}l3.4 7 7.6 1.1-5.5 5.4 1.3 7.6L${cx} ${bodyY + h * .3 + 17.5}l-6.8 3.6 1.3-7.6-5.5-5.4 7.6-1.1z" fill="currentColor" stroke="none"/>`
      : label(cx, bodyY + h * .62, ml ? ml + ' ml' : '', Math.max(10, w * .2))}`;
}
const svg = body => `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const DROP = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 0C0 0-12 15-12 23a12 12 0 0024 0C12 15 0 0 0 0z" fill="currentColor" stroke="none"/>`;
const ART = {
  'frasco-grande': ml => svg(bottle(60, 10, 70, 74, ml)),
  'frasco': ml => svg(bottle(60, 16, 62, 64, ml)),
  'frasco-chico': ml => svg(bottle(60, 26, 50, 56, ml)),
  'roll-on': ml => svg(`<rect x="47" y="12" width="26" height="30" rx="9" fill="currentColor" stroke="none"/><rect x="44" y="40" width="32" height="68" rx="14" ${soft}/>${label(60, 80, ml ? ml + ' ml' : '', 11)}`),
  'relleno': ml => svg(`${bottle(70, 30, 50, 54, ml)}${DROP(28, 18, 1.1)}<path d="M40 70c-10 0-14-8-12-16" stroke-width="3"/><path d="M24 58l4-5 5 4" stroke-width="3"/>`),
  'kit': () => svg(`<rect x="22" y="54" width="76" height="52" rx="8" ${soft}/><rect x="16" y="40" width="88" height="16" rx="5" fill="currentColor" stroke="none"/><path d="M60 40v66"/><path d="M60 40c-10-16-30-14-24-4 4 6 24 4 24 4zM60 40c10-16 30-14 24-4-4 6-24 4-24 4z" ${soft}/>`),
  'set': () => svg(`${bottle(32, 40, 30, 40, '')}${bottle(60, 22, 38, 56, '')}${bottle(88, 40, 30, 40, '')}`),
  'figura': () => svg(`<circle cx="60" cy="34" r="20" fill="currentColor" stroke="none"/><circle cx="53" cy="32" r="2.6" fill="#fff" stroke="none"/><circle cx="67" cy="32" r="2.6" fill="#fff" stroke="none"/><path d="M55 41c3 2.5 7 2.5 10 0" stroke="#fff" stroke-width="2.5"/><circle cx="44" cy="18" r="6" fill="currentColor" stroke="none"/><circle cx="76" cy="18" r="6" fill="currentColor" stroke="none"/><rect x="34" y="56" width="52" height="52" rx="14" ${soft}/>`),
  'crema': () => svg(`<rect x="22" y="40" width="76" height="20" rx="6" fill="currentColor" stroke="none"/><rect x="26" y="58" width="68" height="44" rx="12" ${soft}/><path d="M38 76h44" opacity=".5"/>`),
  'crema-chica': () => svg(`<rect x="32" y="48" width="56" height="16" rx="5" fill="currentColor" stroke="none"/><rect x="35" y="62" width="50" height="36" rx="10" ${soft}/>`),
  'botella': () => svg(`<path d="M50 14h22M60 14v14M66 22h10" stroke-width="4"/><rect x="52" y="26" width="16" height="10" fill="currentColor" stroke="none"/><rect x="38" y="36" width="44" height="72" rx="14" ${soft}/><path d="M48 60h24M48 70h16" opacity=".55"/>`),
  'desodorante': () => svg(`<rect x="42" y="12" width="36" height="28" rx="12" fill="currentColor" stroke="none"/><rect x="40" y="38" width="40" height="70" rx="14" ${soft}/><path d="M50 56v32" opacity=".5"/>`),
  'spray': () => svg(`<path d="M50 20h18l8 8h10M78 28l-6 8" stroke-width="4"/><rect x="48" y="18" width="20" height="18" rx="4" fill="currentColor" stroke="none"/><rect x="40" y="36" width="36" height="72" rx="14" ${soft}/><path d="M90 24h4M92 32h6M90 40h4" stroke-width="2.5"/>`),
  'ninos': () => svg(bottle(60, 22, 56, 60, '', { star: true })),
  'difusor': () => svg(`<path d="M60 64L60 10M60 64L42 14M60 64L78 14M60 64L32 26M60 64L88 26" stroke-width="2.5"/><rect x="50" y="58" width="20" height="10" fill="currentColor" stroke="none"/><rect x="34" y="66" width="52" height="42" rx="14" ${soft}/>`),
  'auto': () => svg(`<path d="M60 12v20" stroke-width="2.5"/><circle cx="60" cy="12" r="4"/><rect x="52" y="30" width="16" height="12" rx="3" fill="currentColor" stroke="none"/><rect x="36" y="42" width="48" height="58" rx="22" ${soft}/><path d="M50 62c6 6 14 6 20 0" opacity=".5"/>`),
  'body': () => svg(`<rect x="50" y="12" width="20" height="22" rx="5" fill="currentColor" stroke="none"/><rect x="40" y="34" width="40" height="74" rx="16" ${soft}/><path d="M80 18h3M86 12h3M86 24h3M92 18h3" stroke-width="3"/>`),
  'body-glitter': () => svg(`<rect x="50" y="12" width="20" height="22" rx="5" fill="currentColor" stroke="none"/><rect x="40" y="34" width="40" height="74" rx="16" ${soft}/><path d="M90 20l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM28 54l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill="currentColor" stroke="none"/>`),
  'vela': () => svg(`<path d="M60 18c-7 9-7 17 0 22 7-5 7-13 0-22z" fill="currentColor" stroke="none"/><path d="M60 40v10" stroke-width="2.5"/><rect x="30" y="50" width="60" height="56" rx="12" ${soft}/><path d="M30 64h60" opacity=".5"/>`),
};
const imgTag = (src, alt) => `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
const art = (p, v) => {
  const x = p.var && p.var[v];
  if (x && x.img) return imgTag(x.img, `${p.nombre} ${x.n}`);
  if (p.img) return imgTag(p.img, p.nombre);
  if (p.foto) return imgTag('fotos/' + p.foto, p.nombre);
  return (ART[p.ilus] || ART.frasco)(p.ml || '');
};

/* ---------- estado ---------- */
const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};
let cat = 'todo', tag = 'todo', q = '', soloFavs = false;
const favs = new Set(store.get('fr_favs', []).filter(id => byId[id]));
// [{id, v, esencia, aroma, cant}]  v = índice de variante (-1 sin variante)
let cart = store.get('fr_cart', []).map(it => ({ v: -1, ...it }))
  .filter(it => byId[it.id] && (it.v < 0 || (byId[it.id].var && byId[it.id].var[it.v])) && (!preciosDe(byId[it.id], it.v) || preciosDe(byId[it.id], it.v)[it.esencia] != null));

/* ---------- carrusel ---------- */
const SLIDES = [
  { glow: '#e0435c', glowBtn: '#e0435c', glowInk: '#ff9aa9', t: 'Tu aroma,<br><em>tu tamaño</em>', p: 'Perfumes de 4 a 120 ml en esencia de línea, neeche o árabe.', cta: 'Ver perfumes', cat: 'nuevo', img: 'img/nicola-porcella-1.webp', ilus: 'frasco', ml: '60' },
  { glow: '#1f9a62', glowBtn: '#1b8a58', glowInk: '#7fe0b2', t: 'Rellena<br><em>y ahorra</em>', p: () => `Trae tu frasco: 60 ml desde ${money(minPrice(byId['relleno-60']))}.`, cta: 'Ver rellenos', cat: 'relleno', ilus: 'relleno', ml: '60' },
  { glow: '#7a4cd9', glowBtn: '#6a3fc6', glowInk: '#c9b2ff', t: 'Envases<br><em>de colección</em>', p: 'Más de 30 diseños para dama y caballero.', cta: 'Ver envases', cat: 'envases', img: 'img/linea-miss-3.webp', ilus: 'frasco-grande' },
  { glow: '#d9772b', glowBtn: '#c8661c', glowInk: '#ffc58f', t: 'Tu casa<br><em>huele a ti</em>', p: 'Velas, difusores y aromas para el auto.', cta: 'Ver velas', cat: 'velas', img: 'img/velas-aromaticas-2.webp', ilus: 'vela' },
];
function renderHero() {
  $('#slides').innerHTML = SLIDES.map((s, i) => `
    <article class="slide" id="slide${i}" style="--glow:${s.glow};--glow-btn:${s.glowBtn};--glow-ink:${s.glowInk}" aria-roledescription="destacado" aria-label="${i + 1} de ${SLIDES.length}">
      <div class="slide-txt"><h2>${s.t}</h2><p>${typeof s.p === 'function' ? s.p() : s.p}</p>
        <button class="cta" data-cat="${s.cat}">${s.cta} <span aria-hidden="true">→</span></button></div>
      <div class="slide-art${s.img ? ' foto' : ''}">${s.img ? `<img src="${s.img}" alt="" decoding="async">` : ART[s.ilus](s.ml || '')}</div>
    </article>`).join('');
  $('#dots').innerHTML = SLIDES.map((_, i) => `<button role="tab" aria-label="Destacado ${i + 1}" aria-selected="${i === 0}" data-i="${i}"></button>`).join('');
}
const slidesEl = () => $('#slides');
function slideIndex() { const s = slidesEl(); return Math.round(s.scrollLeft / s.clientWidth); }
function goSlide(i) { const s = slidesEl(); s.scrollTo({ left: i * (s.clientWidth + 12), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
let autoplay;
function startAutoplay() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  clearInterval(autoplay);
  autoplay = setInterval(() => { if (!document.hidden) goSlide((slideIndex() + 1) % SLIDES.length); }, 5500);
}

/* ---------- categorías y filtros ---------- */
function renderCats() {
  $('#cats').innerHTML = CATS.map(c => `<button class="cat" style="--h:${c.h}" data-cat="${c.id}" aria-pressed="${c.id === cat && !soloFavs}">
    <span class="ring">${ART[c.ilus]('')}</span>${c.nombre}</button>`).join('');
  $('#pills').innerHTML = TAGS.map(t => `<button class="pill" data-tag="${t.id}" aria-pressed="${t.id === tag}">${t.nombre}</button>`).join('');
}
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const texto = p => norm([p.nombre, p.detalle, p.linea, p.genero, p.notas, p.desc, catOf(p.cat).nombre, p.ml ? p.ml + 'ml' : '',
  ...(p.var || []).flatMap(v => [v.n, v.notas])].filter(Boolean).join(' '));
function visibles() {
  const words = norm(q).split(/\s+/).filter(Boolean);
  return P.filter(p => {
    if (soloFavs && !favs.has(p.id)) return false;
    if (!soloFavs && cat !== 'todo' && p.cat !== cat) return false;
    const m = minPrice(p);
    if (tag === 'barato' ? !(m != null && m < 100) : tag !== 'todo' && !p.tags.includes(tag)) return false;
    if (words.length) { const t = texto(p); return words.every(w => t.includes(w) || t.replace(/\s/g, '').includes(w)); }
    return true;
  });
}
function badgeOf(p) {
  if (p.prox) return '<span class="badge dark">Próximamente</span>';
  if (p.tags.includes('pura')) return '<span class="badge dark">Pura esencia</span>';
  if (p.tags.includes('oferta')) return '<span class="badge oferta">Precio especial</span>';
  if (p.tags.includes('popular')) return '<span class="badge">Más pedido</span>';
  if (p.tags.includes('regalo')) return '<span class="badge">Para regalo</span>';
  return '';
}
function card(p, i = 0) {
  const c = catOf(p.cat), m = minPrice(p);
  const desde = (p.precios && Object.keys(p.precios).length > 1) || varias(p);
  const sub = p.var && p.var.length > 1 ? `${p.detalle ? p.detalle + ' · ' : ''}${p.var.length} opciones` : p.detalle;
  return `<article class="card${p.img || p.foto ? ' con-foto' : ''}" style="--h:${c.h};--i:${i % PAGINA}">
    <button class="media" data-open="${p.id}" aria-label="Ver ${esc(p.nombre)}">${art(p, -1)}</button>
    ${badgeOf(p)}
    <button class="fav" data-fav="${p.id}" aria-pressed="${favs.has(p.id)}" aria-label="Guardar ${esc(p.nombre)} en favoritos"><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/></svg></button>
    <div class="txt">
      <h3>${esc(p.nombre)}</h3>
      <span class="det">${esc(sub || '')}</span>
      <div class="row">
        <span class="price">${m == null ? '<small>&nbsp;</small><b class="consulta">Pregunta</b>' : `${desde ? '<small>desde</small>' : '<small>&nbsp;</small>'}<b>${money(m)}</b>`}</span>
        <button class="add" data-open="${p.id}" aria-label="Agregar ${esc(p.nombre)}"><svg viewBox="0 0 24 24"><path d="M3 4h2l2.4 11.2a2 2 0 002 1.6h7.7a2 2 0 002-1.5L21 8H6.2"/><path d="M13 3v6M10 6h6"/></svg></button>
      </div>
    </div>
  </article>`;
}
const PAGINA = 48;
let mostrados = PAGINA;
function renderGrid(reset = true) {
  if (reset) mostrados = PAGINA;
  if (cat === 'aromas' && !soloFavs) { renderCats(); return renderAromaGrid(); }
  renderAromaRes();
  const list = visibles(), c = catOf(cat);
  $('#titulo').textContent = soloFavs ? 'Tus favoritos' : q ? `Resultados para “${q}”` : c.titulo;
  $('#conteo').textContent = `${list.length} ${list.length === 1 ? 'producto' : 'productos'}`;
  const nota = !soloFavs && !q && c.nota;
  $('#nota').hidden = !nota; $('#nota').textContent = nota || '';
  $('#grid').innerHTML = list.slice(0, mostrados).map((p, i) => card(p, i)).join('');
  $('#mas').hidden = list.length <= mostrados;
  $('#mas').textContent = `Ver más (${list.length - mostrados})`;
  // si la búsqueda solo encontró aromas, no se muestra el aviso de "sin productos"
  const soloAromas = !list.length && !$('#aromasRes').hidden;
  document.querySelector('#productos > .list-head').hidden = soloAromas;
  $('#vacio').hidden = list.length > 0 || soloAromas;
  $('#vacio').textContent = soloFavs ? 'Aún no guardas favoritos. Toca el corazón de un producto para guardarlo aquí.'
    : 'No encontramos productos con esa búsqueda. Prueba con otra palabra, por ejemplo “60 ml”, “vela” o “coco”.';
}
function setCat(id, scroll) {
  cat = id; soloFavs = false; renderCats(); renderGrid(); setNav('categorias');
  if (scroll) $('#productos').scrollIntoView({ behavior: 'smooth' });
}

/* ---------- producto ---------- */
let actual = null, cant = 1, vSel = -1;
function openProduct(id, op = {}) {
  const p = byId[id], c = catOf(p.cat); actual = p; cant = 1; vSel = p.var ? 0 : -1;
  aromaSel = null; if (op.aroma) aromaGen = 'todos';
  const dlg = $('#dlgProducto');
  dlg.style.setProperty('--h', c.h);
  $('#pNombre').textContent = p.nombre;
  $('#pDetalle').textContent = p.cat === 'relleno' ? `${p.detalle}. Trae tu frasco de ${p.ml} ml.` : (p.detalle || '');
  const info = [p.notas && `<p><b>Notas:</b> ${esc(p.notas)}</p>`, p.desc && `<p>${esc(p.desc)}</p>`,
    p.incluye && `<p><b>Incluye:</b></p><ul>${p.incluye.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`].filter(Boolean).join('');
  $('#pInfo').innerHTML = info; $('#pInfo').hidden = !info;
  $('#pVar').hidden = !p.var;
  $('#pVar').innerHTML = p.var ? `<legend>${p.var.length > 1 ? 'Elige una opción' : 'Opción'}</legend><div class="vars">` + p.var.map((v, i) => `
    <label class="var${v.img ? ' con-foto' : ''}"><input type="radio" name="variante" value="${i}" ${i === 0 ? 'checked' : ''}>
      ${v.img ? `<span class="vimg">${imgTag(v.img, v.n)}</span>` : ''}<span class="vn">${esc(v.n)}</span></label>`).join('') + '</div>' : '';
  $('#pAroma').value = '';
  $('#aromaBox').hidden = !pideAroma(p);
  $('#pOpciones').innerHTML = '';
  renderVariante();
  if (op.esencia) { const r = $(`#pOpciones input[value="${op.esencia}"]`); if (r) { r.checked = true; updateBuy(); } }
  if (op.aroma) { aromaSel = op.aroma; renderAromas(); }
  dlg.showModal();
  $('#formProducto').scrollTop = 0;
}
function renderVariante() {
  const p = actual, x = p.var && p.var[vSel];
  $('#pMedia').innerHTML = art(p, vSel);
  $('#pMedia').classList.toggle('con-foto', !!((x && x.img) || p.img || p.foto));
  $('#pVarNotas').textContent = x && x.notas ? `Notas: ${x.notas}` : '';
  $('#pVarNotas').hidden = !(x && x.notas);
  const pr = preciosDe(p, vSel), keys = pr ? ESENCIAS.filter(e => pr[e.id] != null) : [];
  const prev = $('#pOpciones input:checked'), sel = prev && keys.some(k => k.id === prev.value) ? prev.value : keys[0] && keys[0].id;   // conserva la esencia al cambiar de opción
  $('#pOpciones').hidden = keys.length < 2;
  $('#pOpciones').innerHTML = '<legend>Esencia</legend>' + keys.map(e => `
    <label class="opt"><input type="radio" name="esencia" value="${e.id}" ${e.id === sel ? 'checked' : ''}>
      <span><b>${e.nombre}</b><small>${e.det}</small></span><b>${money(pr[e.id])}</b></label>`).join('');
  updateBuy();
}
function esencia() { const r = $('#pOpciones input:checked'); return r ? r.value : (actual && preciosDe(actual, vSel) ? Object.keys(preciosDe(actual, vSel))[0] : 'linea'); }
function updateBuy() {
  $('#pCant').textContent = cant;
  const pr = preciosDe(actual, vSel), u = pr ? pr[esencia()] : null;
  $('#pAgregar').textContent = u == null ? 'Agregar · precio por confirmar' : `Agregar · ${money(u * cant)}`;
  renderAromas();
}

/* ---------- aromas (Guía de Tendencias / Genealogía 2026) ---------- */
const AROMAS = (window.AROMAS || []).map((a, i) => ({ ...a, i }));
const TIPO_AROMA = { linea: 'Esencia de línea', neeche: 'Esencia neeche', arabe: 'Esencia árabe', ambiental: 'Esencia ambiental' };
const slug = s => norm(s).replace(/[^a-z]+/g, '-');
AROMAS.forEach(a => { a.t = norm(`${a.n} ${a.g} ${a.nota} ${a.fam} ${TIPO_AROMA[a.e]}`); });
let aromaSel = null, aromaGen = 'todos', aGen = 'todos', aTipo = 'todos';
// difusores y productos de casa usan esencias ambientales; lo demás, la esencia elegida
const tipoAroma = () => actual.cat === 'casa' ? 'ambiental' : (TIPO_AROMA[esencia()] && esencia() !== 'ambiental' ? esencia() : 'linea');
function buscaAromas(txt, tipo, gen) {
  const w = norm(txt).split(/\s+/).filter(Boolean);
  return AROMAS.filter(a => (tipo === 'todos' || a.e === tipo) && (gen === 'todos' || a.g === gen)
    && w.every(x => a.t.includes(x) || a.t.replace(/\s/g, '').includes(x)));
}
const fichaAroma = a => `<div class="ficha"><span class="fam f-${slug(a.fam)}">${esc(a.fam)}</span><small class="insp">Inspirado olfativamente en</small>
  <b>${esc(a.n)}</b><small>${esc(a.g)} · ${TIPO_AROMA[a.e]}</small>
  <p>Nota principal: <b>${esc(a.nota)}</b>. Huele ${esc(a.desc)}.</p></div>`;
function renderAromas() {
  if (!actual || !pideAroma(actual)) return;
  const tipo = tipoAroma(), txt = $('#pAroma').value.trim();
  if (aromaSel && aromaSel.e !== tipo) aromaSel = null;   // cambió la esencia: el aroma ya no aplica
  const list = buscaAromas(txt, tipo, aromaGen);
  $('#pAromaTipo').textContent = `${AROMAS.filter(a => a.e === tipo).length} aromas en ${TIPO_AROMA[tipo].toLowerCase()}`;
  $('#pAromas').innerHTML = list.slice(0, 40).map(a => `<button type="button" class="aroma" data-aroma="${a.i}"><span class="dot f-${slug(a.fam)}"></span>
    <span><b>${esc(a.n)}</b><small>${esc(a.g)} · ${esc(a.nota)}</small></span></button>`).join('')
    + (list.length > 40 ? `<p class="small">y ${list.length - 40} más: escribe para afinar la búsqueda.</p>` : '')
    + (!list.length && txt ? `<p class="small">No está en la lista: se enviará “${esc(txt)}” como aroma.</p>` : '');
  $('#pBuscaAroma').hidden = $('#pAromas').hidden = !!aromaSel;
  $('#pAromaSel').hidden = !aromaSel;
  $('#pAromaSel').innerHTML = aromaSel ? fichaAroma(aromaSel) + '<button type="button" class="link" id="cambiarAroma">Cambiar aroma</button>' : '';
  document.querySelectorAll('#pGen button').forEach(b => b.setAttribute('aria-pressed', b.dataset.gen === aromaGen));
}
const aromaTexto = () => aromaSel ? `${aromaSel.n} (${aromaSel.g})` : $('#pAroma').value.trim();
const pedirAroma = a => a.e === 'ambiental' ? openProduct('difusor-80', { aroma: a }) : openProduct('nuevo-60', { esencia: a.e, aroma: a });
const aromaCard = (a, i) => `<article class="acard" style="--i:${i % PAGINA}">
  <span class="fam f-${slug(a.fam)}">${esc(a.fam)}</span><small class="insp">Inspirado olfativamente en</small>
  <h3>${esc(a.n)}</h3><span class="det">${esc(a.g)} · ${TIPO_AROMA[a.e]}</span>
  <p>Nota principal: <b>${esc(a.nota)}</b>. Huele ${esc(a.desc)}.</p>
  <button class="pedir" data-pedir="${a.i}">Pedir este aroma</button></article>`;
const GENEROS = ['todos', 'Dama', 'Caballero', 'Unisex'];
function renderAromaGrid() {
  const list = buscaAromas(q, aTipo, aGen);
  $('#aromasRes').hidden = true;
  document.querySelector('#productos > .list-head').hidden = false;
  $('#titulo').textContent = q ? `Aromas para “${q}”` : 'Aromas de la genealogía';
  $('#conteo').textContent = `${list.length} ${list.length === 1 ? 'aroma' : 'aromas'}`;
  $('#nota').hidden = false; $('#nota').textContent = catOf('aromas').nota;
  $('#pills').innerHTML = GENEROS.map(g => `<button class="pill" data-agen="${g}" aria-pressed="${g === aGen}">${g === 'todos' ? 'Todos' : g}</button>`).join('')
    + '<span class="pill-sep" aria-hidden="true"></span>'
    + ['todos', 'linea', 'neeche', 'arabe', 'ambiental'].map(t => `<button class="pill" data-atipo="${t}" aria-pressed="${t === aTipo}">${t === 'todos' ? 'Todas las esencias' : TIPO_AROMA[t].replace('Esencia ', '')}</button>`).join('');
  $('#grid').innerHTML = list.slice(0, mostrados).map(aromaCard).join('');
  $('#mas').hidden = list.length <= mostrados;
  $('#mas').textContent = `Ver más (${list.length - mostrados})`;
  $('#vacio').hidden = list.length > 0;
  $('#vacio').textContent = 'No encontramos ese aroma. Prueba con otra palabra, por ejemplo “vainilla” o “212”.';
}
// en la búsqueda general, los aromas que coinciden salen arriba de los productos
function renderAromaRes() {
  const box = $('#aromasRes');
  const list = q && !soloFavs ? buscaAromas(q, 'todos', 'todos') : [];
  box.hidden = !list.length;
  if (!list.length) return;
  box.innerHTML = `<div class="list-head"><h2>Aromas</h2><span>${list.length} ${list.length === 1 ? 'aroma' : 'aromas'}</span></div>
    <div class="arow">${list.slice(0, 8).map(aromaCard).join('')}</div>
    ${list.length > 8 ? `<button class="mas" data-cat="aromas">Ver los ${list.length} aromas</button>` : ''}`;
}

/* ---------- carrito ---------- */
const unitario = it => { const pr = preciosDe(byId[it.id], it.v); return pr ? pr[it.esencia] ?? null : null; };
const lineTotal = it => { const u = unitario(it); return u == null ? null : u * it.cant; };
const esName = id => ESENCIAS.find(e => e.id === id).nombre;
const varName = it => it.v >= 0 ? byId[it.id].var[it.v].n : '';
const muchasEsencias = it => { const pr = preciosDe(byId[it.id], it.v); return !!pr && Object.keys(pr).length > 1; };
const total = () => cart.reduce((a, it) => a + (lineTotal(it) || 0), 0);
const porConfirmar = () => cart.some(it => unitario(it) == null);
function saveCart() { store.set('fr_cart', cart); renderCount(); }
function renderCount() {
  const n = cart.reduce((a, it) => a + it.cant, 0);
  for (const el of [$('#cuenta'), $('#cuenta2')]) { el.hidden = !n; el.textContent = n; }
}
function addToCart(id, v, es, aroma, n) {
  const same = cart.find(it => it.id === id && it.v === v && it.esencia === es && it.aroma === aroma);
  if (same) same.cant += n; else cart.push({ id, v, esencia: es, aroma, cant: n });
  saveCart();
}
function renderCart() {
  $('#items').innerHTML = cart.map((it, i) => {
    const p = byId[it.id], c = catOf(p.cat), u = unitario(it), lt = lineTotal(it);
    const sub = [varName(it), muchasEsencias(it) ? esName(it.esencia) : '', it.aroma].filter(Boolean).join(' · ') || p.detalle;
    return `<li class="item" style="--h:${c.h}"><span class="mini">${art(p, it.v)}</span>
      <div><b>${esc(p.nombre)}</b><small>${esc(sub || '')}</small>
        <small>${u == null ? 'Precio por confirmar' : money(u) + ' c/u'}</small></div>
      <div class="r"><b>${lt == null ? '—' : money(lt)}</b>
        <div class="step"><button type="button" data-dec="${i}" aria-label="${it.cant === 1 ? 'Quitar' : 'Uno menos'}">${it.cant === 1 ? '×' : '−'}</button><output>${it.cant}</output><button type="button" data-inc="${i}" aria-label="Uno más">+</button></div></div></li>`;
  }).join('');
  $('#carritoVacio').hidden = cart.length > 0;
  $('#checkout').hidden = cart.length === 0;
  $('#total').textContent = money(total()) + (porConfirmar() ? ' + por confirmar' : '');
  $('#enviar').disabled = !WHATSAPP;
  $('#waNota').textContent = WHATSAPP ? 'Se abre WhatsApp con tu pedido escrito. Te confirmo existencias, pago y entrega.'
    : 'Pronto podrás mandar tu pedido por WhatsApp desde aquí.';
}
const fechaBonita = f => f ? new Date(f + 'T12:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
function entregaDatos() {
  const envio = document.querySelector('input[name=entrega]:checked').value === 'Envío';
  return { envio, lugar: $('#cDir').value.trim(), fecha: $('#cFecha').value, hora: $('#cHora').value };
}
let folio = '';
const nuevoFolio = () => { const d = new Date(), z = n => String(n).padStart(2, '0');
  return `F-${z(d.getDate())}${z(d.getMonth() + 1)}${String(d.getFullYear()).slice(2)}-${z(d.getHours())}${z(d.getMinutes())}`; };
function mensaje() {
  const ent = entregaDatos();
  const nombre = $('#cNombre').value.trim(), notas = $('#cNotas').value.trim();
  const lineas = cart.map((it, i) => {
    const p = byId[it.id], u = unitario(it);
    const det = [varName(it), muchasEsencias(it) ? esName(it.esencia) : '', it.aroma ? 'Aroma: ' + it.aroma : ''].filter(Boolean).join(' · ');
    return `${i + 1}. ${p.nombre}${det ? ' · ' + det : ''}\n   ${it.cant} × ${u == null ? 'precio por confirmar' : `${money(u)} = ${money(u * it.cant)}`}`;
  });
  const cuando = [fechaBonita(ent.fecha), ent.hora ? ent.hora + ' h' : ''].filter(Boolean).join(', ');
  return [`¡Hola! Quiero hacer este pedido${folio ? ' (' + folio + ')' : ''}:`, '', ...lineas, '', `*Total: ${money(total())}${porConfirmar() ? ' + productos por confirmar' : ''}*`, '',
    nombre ? `Nombre: ${nombre}` : null, `Entrega: ${ent.envio ? 'Envío a domicilio' : 'Paso a recoger'}`,
    ent.envio && ent.lugar ? `Lugar de entrega: ${ent.lugar}` : null,
    ent.envio && cuando ? `Fecha y hora que prefiero: ${cuando}` : null,
    notas ? `Notas: ${notas}` : null].filter(x => x !== null).join('\n');
}

/* ---------- navegación de abajo ---------- */
function setNav(id) { document.querySelectorAll('.bottom [data-go]').forEach(b => b.classList.toggle('on', b.dataset.go === id)); }
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2200); }

/* ---------- eventos ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('button, a'); if (!t) return;
  if (t.dataset.aroma) { aromaSel = AROMAS[+t.dataset.aroma]; renderAromas(); vibra(8); return; }
  if (t.id === 'cambiarAroma') { aromaSel = null; $('#pAroma').value = ''; renderAromas(); $('#pAroma').focus(); return; }
  if (t.dataset.gen) { aromaGen = t.dataset.gen; renderAromas(); return; }
  if (t.dataset.pedir) { pedirAroma(AROMAS[+t.dataset.pedir]); return; }
  if (t.dataset.agen) { aGen = t.dataset.agen; renderGrid(); return; }
  if (t.dataset.atipo) { aTipo = t.dataset.atipo; renderGrid(); return; }
  if (t.dataset.cat) { e.preventDefault(); setCat(t.dataset.cat, !t.classList.contains('cat')); return; }
  if (t.dataset.tag) { tag = t.dataset.tag; renderCats(); renderGrid(); return; }
  if (t.dataset.open) { openProduct(t.dataset.open); return; }
  if (t.dataset.fav) {
    const id = t.dataset.fav, on = !favs.has(id); on ? favs.add(id) : favs.delete(id); store.set('fr_favs', [...favs]);
    t.setAttribute('aria-pressed', on); toast(on ? 'Guardado en favoritos' : 'Quitado de favoritos');
    if (soloFavs) renderGrid(); return;
  }
  if (t.dataset.i) { goSlide(+t.dataset.i); startAutoplay(); return; }
  if (t.dataset.inc || t.dataset.dec) {
    const i = +(t.dataset.inc || t.dataset.dec);
    cart[i].cant += t.dataset.inc ? 1 : -1; if (cart[i].cant < 1) cart.splice(i, 1);
    saveCart(); renderCart(); return;
  }
  if (t.id === 'mas') { mostrados += PAGINA; renderGrid(false); return; }
  const go = t.dataset.go;
  if (go === 'carrito') { renderCart(); $('#dlgCarrito').showModal(); return; }
  if (go === 'favoritos') { soloFavs = true; setNav('favoritos'); renderCats(); renderGrid(); $('#productos').scrollIntoView({ behavior: 'smooth' }); return; }
  if (go === 'contacto') {
    if (WHATSAPP) window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('¡Hola! Tengo una pregunta sobre los productos Fraiche.')}`, '_blank', 'noopener');
    else toast('Pronto podrás escribirnos por WhatsApp desde aquí');
    return;
  }
  if (go === 'inicio' || go === 'categorias') setNav(go);
});
$('#btnCarrito').addEventListener('click', () => { renderCart(); $('#dlgCarrito').showModal(); });
$('#btnBuscar').addEventListener('click', () => {
  const box = $('#buscador'), open = box.hidden; box.hidden = !open; $('#btnBuscar').setAttribute('aria-expanded', open);
  if (open) $('#q').focus(); else if (q) { q = ''; $('#q').value = ''; renderGrid(); }
});
$('#q').addEventListener('input', e => {
  q = e.target.value.trim(); if (q) { cat = 'todo'; soloFavs = false; renderCats(); } renderGrid();
});
$('#q').addEventListener('keydown', e => { if (e.key === 'Enter') $('#productos').scrollIntoView({ behavior: 'smooth' }); });
$('#pVar').addEventListener('change', e => { if (e.target.name === 'variante') { vSel = +e.target.value; renderVariante(); } });
$('#pOpciones').addEventListener('change', updateBuy);
$('#pAroma').addEventListener('input', renderAromas);
$('#pMenos').addEventListener('click', () => { cant = Math.max(1, cant - 1); updateBuy(); });
$('#pMas').addEventListener('click', () => { cant = Math.min(99, cant + 1); updateBuy(); });
$('#formProducto').addEventListener('submit', e => {
  if (e.submitter && e.submitter.value === 'add') {
    addToCart(actual.id, vSel, esencia(), pideAroma(actual) ? aromaTexto() : '', cant);
    vuelaAlCarrito($('#pMedia'));
    toast(`${actual.nombre} agregado al carrito`);
  }
});
document.querySelectorAll('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));   // tocar fuera cierra
document.querySelectorAll('input[name=entrega]').forEach(r => r.addEventListener('change', () => { $('#dirBox').hidden = r.value !== 'Envío' || !r.checked; }));
let ultimoMensaje = '';
const abrirWhats = m => window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(m)}`, '_blank', 'noopener');
$('#enviar').addEventListener('click', () => {
  if (!WHATSAPP || !cart.length) return;
  const ent = entregaDatos();
  if (ent.envio && !ent.lugar) { toast('Escribe el lugar de entrega'); $('#cDir').focus(); return; }
  folio = nuevoFolio();
  ultimoMensaje = mensaje();
  abrirWhats(ultimoMensaje);
  pedidoRealizado(ent);
});
// ventana de confirmación: folio, resumen y cómo se acuerda la entrega
function pedidoRealizado(ent) {
  const n = cart.reduce((a, it) => a + it.cant, 0);
  $('#okFolio').textContent = `Folio ${folio}`;
  $('#okResumen').innerHTML = `<span>${n} ${n === 1 ? 'producto' : 'productos'}</span><b>${money(total())}${porConfirmar() ? ' + por confirmar' : ''}</b>`;
  const cuando = [fechaBonita(ent.fecha), ent.hora ? ent.hora + ' h' : ''].filter(Boolean).join(' a las ');
  $('#okEntrega').innerHTML = ent.envio
    ? `<b>Envío a domicilio</b><p>${esc(ent.lugar)}${cuando ? `<br>${esc(cuando)}` : ''}</p><p class="small">Por WhatsApp acordamos contigo el lugar, la fecha y la hora exactos de la entrega.</p>`
    : `<b>Pasas a recoger</b><p class="small">Por WhatsApp te avisamos cuándo está listo tu pedido y dónde recogerlo.</p>`;
  $('#dlgCarrito').close();
  cart = []; saveCart();
  $('#dlgOk').showModal();
  vibra([12, 40, 18]);
}
$('#okWa').addEventListener('click', () => { if (ultimoMensaje) abrirWhats(ultimoMensaje); });
$('#okCerrar').addEventListener('click', () => $('#dlgOk').close());
const hoyISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
$('#cFecha').min = hoyISO();
$('#slides').addEventListener('scroll', () => {
  const i = slideIndex(); document.querySelectorAll('#dots button').forEach((b, j) => b.setAttribute('aria-selected', i === j));
}, { passive: true });
$('#slides').addEventListener('pointerdown', startAutoplay);

/* ---------- interacciones táctiles ---------- */
const calma = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const vibra = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
// onda de luz desde el punto donde se toca
document.addEventListener('pointerdown', e => {
  const t = e.target.closest('button, .cta, .top-links a, .bottom a, label.opt, label.var, .seg span');
  if (!t || calma()) return;
  const r = t.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2;
  if (getComputedStyle(t).position === 'static') t.style.position = 'relative';
  t.classList.add('rip-host');
  const w = document.createElement('span');
  w.className = 'rip';
  w.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  t.append(w);
  w.addEventListener('animationend', () => w.remove());
}, { passive: true });
// la foto del producto vuela hasta el carrito y el contador rebota
function vuelaAlCarrito(desde) {
  vibra(14);
  const metas = [$('#btnCarrito'), document.querySelector('.bottom [data-go="carrito"]')].filter(el => el && el.offsetParent);
  const meta = metas.find(el => el.getBoundingClientRect().top > 0 && getComputedStyle(el).display !== 'none') || metas[0];
  const bump = () => document.querySelectorAll('.count').forEach(c => { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); });
  if (!desde || !meta || calma()) return bump();
  const a = desde.getBoundingClientRect(), b = meta.getBoundingClientRect();
  const f = desde.cloneNode(true);
  f.className = 'vuela'; f.removeAttribute('id');
  const s = Math.min(a.width, a.height, 160);
  f.style.cssText = `left:${a.left + a.width / 2 - s / 2}px;top:${a.top + a.height / 2 - s / 2}px;width:${s}px;height:${s}px`;
  document.body.append(f);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  f.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 },
             { transform: `translate(${dx * .55}px,${dy * .35 - 80}px) scale(.55)`, opacity: .95, offset: .55 },
             { transform: `translate(${dx}px,${dy}px) scale(.12)`, opacity: .4 }],
    { duration: 720, easing: 'cubic-bezier(.5,0,.25,1)' }).onfinish = () => { f.remove(); bump(); };
}

/* ---------- arranque ---------- */
renderHero(); renderCats(); renderGrid(); renderCount(); startAutoplay();
window.tienda = { mensaje, P, AROMAS, get cart() { return cart; } };   // usado por las pruebas
