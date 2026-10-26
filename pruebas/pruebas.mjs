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
  const n = await page.locator('.card').count(), total = await page.evaluate(() => window.PRODUCTOS.length);
  await ctx.close();
  assert.equal(n, total); assert.deepEqual(errors, []);
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
});

await prueba('buscar "vela" encuentra las 3 velas', async () => {
  const { ctx, page } = await abrir();
  await page.click('#btnBuscar'); await page.fill('#q', 'vela');
  const n = await page.locator('.card').count();
  await ctx.close();
  assert.equal(n, 3);
});

await prueba('agregar 2 perfumes de 60 ml en esencia árabe y armar el mensaje de WhatsApp', async () => {
  const { ctx, page, errors } = await abrir();
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
  assert.ok(msg.includes('Perfume 60 ml · Esencia árabe · Aroma: Aroma de prueba'), msg);
  assert.ok(msg.includes('2 × $242 = $484') && msg.includes('*Total: $484*') && msg.includes('Nombre: Ana') && msg.includes('Entrega: Paso a recoger'), msg);
  assert.deepEqual(errors, []);
});

await prueba('favoritos se guardan y se ven en su sección', async () => {
  const { ctx, page } = await abrir({ width: 390 });
  await page.click('.fav[data-fav="vela-250"]');
  await page.reload();
  await page.click('.bottom [data-go="favoritos"]');
  const nombres = await page.locator('.card h3').allTextContents();
  await ctx.close();
  assert.deepEqual(nombres, ['Vela 250 g']);
});

await browser.close(); server.close();
console.log(fails ? `\n${fails} prueba(s) fallaron` : '\nTodo en orden ✔');
process.exit(fails ? 1 : 0);
