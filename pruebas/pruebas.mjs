// Pruebas de la tienda con Playwright:  npm install && npx playwright install chromium && npm test
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(ok => server.listen(0, '127.0.0.1', ok));
const url = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await chromium.launch();
const SHOTS = process.argv.includes('--capturas');
let fails = 0;
async function prueba(nombre, fn) {
  try { await fn(); console.log('  ✓', nombre); } catch (e) { fails++; console.log('  ✗', nombre, '\n     ', e.message.split('\n')[0]); }
}
async function abrir({ width = 390, height = 844, scheme = 'light' } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, colorScheme: scheme, reducedMotion: 'reduce' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());          // sin internet en las pruebas
  const page = await ctx.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|fonts/.test(m.text())) errors.push(m.text()); });
  await page.goto(url);
  return { ctx, page, errors };
}
console.log('Tienda · pruebas');

await prueba('carga sin errores y muestra todo el catálogo', async () => {
  const { ctx, page, errors } = await abrir();
  const total = await page.evaluate(() => window.tienda.P.length);
  const n = await page.locator('.card').count();
  const conteo = await page.textContent('#conteo');
  await page.click('#mas');
  const n2 = await page.locator('.card').count();
  await ctx.close();
  assert.ok(total >= 220, `solo ${total} productos`);
  assert.equal(n, 48); assert.equal(n2, 96);
  assert.equal(conteo, `${total} productos`);
  assert.deepEqual(errors, []);
});

await prueba('sin scroll horizontal en 360, 390, 768 y 1280 px, claro y oscuro', async () => {
  for (const scheme of ['light', 'dark']) for (const width of [360, 390, 768, 1280]) {
    const { ctx, page } = await abrir({ width, scheme });
    const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (SHOTS && (width === 390 || width === 1280)) await page.screenshot({ path: path.join(ROOT, 'pruebas', `inicio-${width}-${scheme}.png`), fullPage: width === 1280 });
    await ctx.close();
    assert.ok(sobra <= 0, `se desborda ${sobra}px a ${width}px (${scheme})`);
  }
});

await prueba('los precios fijos están bien (60, 30 y 16 ml, nuevo y relleno)', async () => {
  const { ctx, page } = await abrir();
  const p = await page.evaluate(() => Object.fromEntries(window.PRODUCTOS.map(p => [p.id, p.precios.linea])));
  await ctx.close();
  assert.deepEqual([p['nuevo-60'], p['relleno-60'], p['nuevo-30'], p['relleno-30'], p['nuevo-16'], p['relleno-16']], [212, 144, 127, 71, 73, 36]);
});

await prueba('categoría Rellenos filtra y el título cambia', async () => {
  const { ctx, page } = await abrir();
  await page.click('.cat[data-cat="relleno"]');
  const titulo = await page.textContent('#titulo'), n = await page.locator('.card').count();
  await ctx.close();
  assert.equal(titulo, 'Rellenos'); assert.equal(n, 14);
  for (const c of ['envases', 'velas', 'maquillaje', 'ninos', 'casa']) {
    const { ctx: x, page: pg } = await abrir();
    await pg.click(`.cat[data-cat="${c}"]`);
    const k = await pg.locator('.card').count();
    await x.close();
    assert.ok(k > 0, `la categoría ${c} está vacía`);
  }
});

await prueba('buscar "Mermaid" encuentra la línea Fantasy (busca también en variantes)', async () => {
  const { ctx, page } = await abrir();
  await page.click('#btnBuscar'); await page.fill('#q', 'mermaid');
  const nombres = await page.locator('.card h3').allTextContents();
  await ctx.close();
  assert.ok(nombres.length >= 5, nombres.join(', '));
  assert.ok(nombres.includes('Shampoo 2 en 1 Fantasy'), nombres.join(', '));
});

await prueba('todas las fotos del catálogo existen', async () => {
  const { ctx, page } = await abrir();
  const rutas = await page.evaluate(() => [...new Set(window.CATALOGO.flatMap(p => [p.img, ...(p.var || []).map(v => v.img)]).filter(Boolean))]);
  await ctx.close();
  const faltan = rutas.filter(r => !fs.existsSync(path.join(ROOT, r)));
  assert.ok(rutas.length > 300, `solo ${rutas.length} fotos`);
  assert.deepEqual(faltan, []);
});

await prueba('envase con variantes: cambia la foto y el precio por tamaño (Liliana 60 → 30 ml)', async () => {
  const { ctx, page, errors } = await abrir();
  await page.click('#btnBuscar'); await page.fill('#q', 'liliana');
  await page.click('.card .add[data-open="liliana"]');
  const foto1 = await page.getAttribute('#pMedia img', 'src');
  const b1 = await page.textContent('#pAgregar');
  await page.click('#pVar .var:has-text("Melón 30 ml")');
  const foto2 = await page.getAttribute('#pMedia img', 'src');
  const b2 = await page.textContent('#pAgregar');
  await page.check('#pOpciones input[value="neeche"]');
  await page.fill('#pAroma', 'Aroma de prueba');
  await page.click('#pAgregar');
  const msg = await page.evaluate(() => window.tienda.mensaje());
  await ctx.close();
  assert.notEqual(foto1, foto2);
  assert.equal(b1, 'Agregar · $212'); assert.equal(b2, 'Agregar · $127');
  assert.ok(msg.includes('Liliana · Melón 30 ml · Esencia neeche · Aroma: Aroma de prueba'), msg);
  assert.deepEqual(errors, []);
});

await prueba('producto con aroma fijo: no pide aroma y respeta el precio especial', async () => {
  const { ctx, page } = await abrir();
  await page.click('.pill[data-tag="oferta"]');
  const n = await page.locator('.card').count();
  await page.click('#btnBuscar'); await page.fill('#q', 'nuestra cancion');
  await page.click('.card .add[data-open="vela-nuestra-cancion"]');
  const aroma = await page.isVisible('#pAroma');
  const boton = await page.textContent('#pAgregar');
  await ctx.close();
  assert.ok(n >= 20, `solo ${n} con precio especial`);
  assert.equal(aroma, false); assert.equal(boton, 'Agregar · $77');
});

await prueba('agregar 2 perfumes de 60 ml en esencia árabe y armar el mensaje de WhatsApp', async () => {
  const { ctx, page, errors } = await abrir();
  await page.click('.cat[data-cat="nuevo"]');
  await page.click('.card .add[data-open="nuevo-60"]');
  await page.check('#pOpciones input[value="arabe"]');
  await page.fill('#pAroma', 'Aroma de prueba');
  await page.click('#pMas');
  const boton = await page.textContent('#pAgregar');
  if (SHOTS) await page.screenshot({ path: path.join(ROOT, 'pruebas', 'producto.png') });
  await page.click('#pAgregar');
  const cuenta = await page.textContent('#cuenta');
  await page.click('#btnCarrito');
  await page.fill('#cNombre', 'Ana');
  if (SHOTS) await page.screenshot({ path: path.join(ROOT, 'pruebas', 'carrito.png') });
  const msg = await page.evaluate(() => window.tienda.mensaje());
  await ctx.close();
  assert.equal(boton, 'Agregar · $484');
  assert.equal(cuenta, '2');
  assert.ok(msg.includes('Perfume 60 ml · Caballero · negro · Esencia árabe · Aroma: Aroma de prueba'), msg);
  assert.ok(msg.includes('2 × $242 = $484') && msg.includes('*Total: $484*') && msg.includes('Nombre: Ana') && msg.includes('Entrega: Paso a recoger'), msg);
  assert.deepEqual(errors, []);
});

await prueba('favoritos se guardan y se ven en su sección', async () => {
  const { ctx, page } = await abrir({ width: 390 });
  await page.click('.cat[data-cat="nuevo"]');
  await page.click('.fav[data-fav="nuevo-60"]');
  await page.reload();
  await page.click('.bottom [data-go="favoritos"]');
  const nombres = await page.locator('.card h3').allTextContents();
  await ctx.close();
  assert.deepEqual(nombres, ['Perfume 60 ml']);
});

await prueba('buscar "212 VIP Black" abre la ventana de tamaños con frascos de caballero', async () => {
  const { ctx, page, errors } = await abrir();
  await page.click('#btnBuscar'); await page.fill('#q', '212 VIP Black');
  const nombres = await page.locator('#aromasRes .acard h3').allTextContents();
  await page.click('#aromasRes .acard:has(h3:text-is("212 VIP Black")) .pedir');
  await page.waitForSelector('#dlgTam[open]');
  const tamanos = await page.locator('#tSizes .tsize b').allTextContents();
  const colores = await page.locator('#tColores .vn').allTextContents();
  await page.click('#tSizes [data-tml="120"]');
  const boton = await page.textContent('#tAgregar');
  await page.click('#tAgregar');
  const it = await page.evaluate(() => window.tienda.cart[0]);
  await page.click('#aromasRes .acard:has(h3:text-is("212 VIP Black")) .pedir');
  await page.click('#tModo [data-tmodo="relleno"]');
  const rellenos = await page.locator('#tSizes .tsize').count();
  await ctx.close();
  assert.ok(nombres.includes('212 VIP Black'), nombres.join(', '));
  assert.deepEqual(tamanos, ['16 ml', '30 ml', '60 ml', '120 ml']);
  assert.ok(colores.length > 10 && colores[0].startsWith('Caballero'), colores.join(', '));
  assert.ok(colores.some(c => c.startsWith('Captiver')), 'deben salir envases de caballero del catálogo');
  assert.ok(!colores.some(c => /^(Dama|Liliana|Línea Miss|Fascinación)/.test(c)), 'no deben salir frascos de dama: ' + colores.join(', '));
  assert.ok(boton.startsWith('Agregar · $'), boton);
  assert.deepEqual([it.id, it.v, it.esencia, it.aroma], ['nuevo-120', 0, 'linea', '212 VIP Black (Caballero)']);
  assert.ok(rellenos > 4, `solo ${rellenos} tamaños de relleno`);
  assert.deepEqual(errors, []);
});

await prueba('perfumes nuevos: solo 16, 30, 60 y 120 ml; elegir un aroma de dama cambia al frasco de dama', async () => {
  const { ctx, page } = await abrir();
  await page.click('.cat[data-cat="nuevo"]');
  const nombres = await page.locator('.card h3').allTextContents();
  await page.click('.card .add[data-open="nuevo-60"]');
  await page.click('#pGen button[data-gen="Dama"]');
  await page.fill('#pAroma', 'vainilla');
  await page.click('#pAromas .aroma >> nth=0');
  const v = await page.inputValue('#pVar input:checked');
  const nombreV = await page.evaluate(i => window.tienda.P.find(p => p.id === 'nuevo-60').var[i].n, +v);
  const ph = await page.getAttribute('#q', 'placeholder');
  await ctx.close();
  assert.deepEqual(nombres, ['Perfume 120 ml', 'Perfume 60 ml', 'Perfume 30 ml', 'Perfume 16 ml']);
  assert.ok(nombreV.startsWith('Dama'), nombreV);
  assert.equal(ph, 'Buscar aroma o producto');
});

await prueba('al elegir esencia neeche, el buscador de aromas muestra solo aromas neeche', async () => {
  const { ctx, page } = await abrir();
  await page.click('.cat[data-cat="nuevo"]');
  await page.click('.card .add[data-open="nuevo-30"]');
  await page.check('#pOpciones input[value="neeche"]');
  const tipo = await page.textContent('#pAromaTipo');
  await page.click('#pGen button[data-gen="Dama"]');
  await page.fill('#pAroma', 'vainilla');
  const n = await page.locator('#pAromas .aroma').count();
  await page.click('#pAromas .aroma >> nth=0');
  const elegido = await page.isVisible('#pAromaSel .ficha');
  const todos = await page.evaluate(() => [...document.querySelectorAll('#pAromas .aroma')].map(b => window.tienda.AROMAS[+b.dataset.aroma]));
  await ctx.close();
  assert.ok(/aromas en esencia neeche/.test(tipo), tipo);
  assert.ok(n > 0, 'sin resultados');
  assert.ok(elegido, 'tocar un aroma de la lista debe elegirlo');
  assert.ok(todos.every(a => a.e === 'neeche' && a.g === 'Dama' && /vainilla/i.test(a.n + a.nota)), JSON.stringify(todos.slice(0, 3)));
});

await prueba('sección Aromas: filtra por género (Caballero) y esencia (árabe)', async () => {
  const { ctx, page } = await abrir();
  await page.click('.cat[data-cat="aromas"]');
  const total = await page.textContent('#conteo');
  await page.click('.pill[data-agen="Caballero"]');
  await page.click('.pill[data-atipo="arabe"]');
  const det = await page.locator('.acard .det').allTextContents();
  await ctx.close();
  assert.ok(parseInt(total) > 900, total);
  assert.ok(det.length > 10 && det.every(d => d === 'Caballero · Esencia árabe'), det.slice(0, 3).join(' | '));
});

await prueba('pedido con envío: pide lugar, manda fecha y hora, y muestra "Pedido realizado"', async () => {
  const { ctx, page, errors } = await abrir();
  await page.evaluate(() => { window.__abiertos = []; window.open = (u) => { window.__abiertos.push(u); return null; }; });
  await page.click('.cat[data-cat="nuevo"]');
  await page.click('.card .add[data-open="nuevo-16"]');
  await page.click('#pAgregar');
  await page.click('#btnCarrito');
  await page.check('input[name=entrega][value="Envío"]', { force: true });
  await page.click('#enviar');
  const sinLugar = await page.evaluate(() => window.__abiertos.length);
  await page.fill('#cDir', 'Av. Juárez 10, Centro');
  await page.fill('#cFecha', '2030-05-17');
  await page.fill('#cHora', '17:30');
  await page.click('#enviar');
  await page.waitForSelector('#dlgOk[open]');
  const url = await page.evaluate(() => window.__abiertos[0]);
  const ok = await page.textContent('#dlgOk');
  const carrito = await page.evaluate(() => window.tienda.cart.length);
  await ctx.close();
  const msg = decodeURIComponent(url.split('text=')[1]);
  assert.equal(sinLugar, 0, 'no debe enviar sin lugar de entrega');
  assert.ok(url.startsWith('https://wa.me/525574348740?text='), url);
  assert.ok(msg.includes('Lugar de entrega: Av. Juárez 10, Centro') && /viernes, 17 de mayo, 17:30 h/.test(msg) && /\(F-\d{6}-\d{4}\)/.test(msg), msg);
  assert.ok(ok.includes('¡Pedido realizado!') && ok.includes('Av. Juárez 10') && ok.includes('acordamos contigo el lugar, la fecha y la hora'), ok);
  assert.equal(carrito, 0);
  assert.deepEqual(errors, []);
});

await browser.close(); server.close();
console.log(fails ? `\n${fails} prueba(s) fallaron` : '\nTodo en orden ✔');
process.exit(fails ? 1 : 0);
