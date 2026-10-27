# Distribuidor Independiente Fraiche · tienda

Página web donde tus clientes ven los productos (perfumes nuevos y rellenos, cremas, bodys, desodorantes, cuidado capilar, niños, difusores y velas), eligen esencia y aroma, arman su carrito y te mandan el pedido por WhatsApp.

No necesita servidor ni base de datos: son archivos que GitHub Pages publica gratis.

## Catálogo 2026

`catalogo.js` tiene los 210 productos del Catálogo Fraiche 2026 (págs. 4 a 270) con su nombre, sus variantes (aromas, colores, diseños, tamaños), notas olfativas y foto. Las 526 fotos están en `img/`, recortadas del PDF. Se suman los 28 perfumes y rellenos por tamaño de `productos.js`: 238 en total.

Precios: precio público del catálogo con la misma rebaja (−$3 desde $100, −$2 de $30 a $99, −$1 abajo de $30). Los envases de perfume se cobran según su tamaño y esencia, igual que "Perfume X ml".

`herramientas/` guarda cómo se generó: `datos/*.py` (productos de cada sección y qué foto lleva cada uno) y `genera.py` (crea `catalogo.js` e `img/`). Para el catálogo siguiente se repite el proceso con el PDF nuevo.

## Aromas (Genealogía 2026)

`aromas.js` tiene los 934 aromas de la Guía de Tendencias Fraiche 2026: nombre de referencia, género (Dama, Caballero, Unisex), tipo de esencia (línea = tradicional, neeche = nicho, árabe, ambiental) y nota principal. La familia (cítrica, floral, gourmand…) y la frase de a qué huele se deducen de la nota principal.

- Al pedir un perfume, relleno o envase, el cliente busca y elige su aroma; la lista se ajusta a la esencia elegida y se filtra por género.
- La sección **Aromas** y el buscador encuentran aromas por nombre, nota o género (por ejemplo “212 VIP Black”).
- `herramientas/genealogia/` guarda cómo se sacaron del PDF (`parse.py` y `aromas.py`).

## Pedido

El cliente arma su carrito y toca *Enviar pedido por WhatsApp*: se abre WhatsApp con el pedido y un folio, y en la página aparece la ventana de **Pedido realizado**. Con envío a domicilio se pide el lugar de entrega y, si quiere, fecha y hora; se le avisa que por WhatsApp se acuerdan lugar, fecha y hora exactos.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La página |
| `estilos.css` | El diseño (claro y oscuro según el celular) |
| `tienda.js` | Dibujos, filtros, favoritos, carrito y pedido por WhatsApp. **Arriba está tu número de WhatsApp.** |
| `productos.js` | Perfumes y rellenos por tamaño. **Aquí cambias esos precios.** |
| `catalogo.js` | Productos del Catálogo 2026 con variantes y fotos (precios ya rebajados; se pueden editar aquí) |
| `img/` | Fotos del catálogo |
| `aromas.js` | Aromas de la genealogía con género y nota principal |
| `fotos/` | Aquí van las fotos de los productos |

## Cambiar el número de WhatsApp

En `tienda.js`, línea `const WHATSAPP = '525574348740';`: 52 (México) seguido de los 10 dígitos, sin espacios.

## Cambiar precios

En `productos.js` cada producto tiene `precios: {linea: 212, neeche: 262, arabe: 242}`. Cambia el número y guarda.

Los precios salieron de la lista F099 Cuautitlán (precio público) con esta rebaja: −$3 desde $100, −$2 de $30 a $99, −$1 abajo de $30, sin centavos. Fijos: 60 ml nuevo $212 / relleno $144, 30 ml nuevo $127 / relleno $71, 16 ml nuevo $73 / relleno $36 (esencia de línea).

## Poner fotos

1. Sube la foto a la carpeta `fotos/` (de preferencia cuadrada, JPG, de menos de 300 KB).
2. En `productos.js`, al producto agrégale `foto:'nombre-del-archivo.jpg'`. Ejemplo: `{id:'nuevo-60', ..., foto:'perfume-60.jpg'}`.

Sin foto se ve el dibujo del producto.

## Publicar en GitHub Pages

*Settings > Pages* > rama `main`, carpeta `/ (root)` > *Save*. La tienda queda en `https://TU-USUARIO.github.io/tienda-fraiche/`.

## Pruebas (opcional)

```bash
npm install
npx playwright install chromium
npm test
```

Comprueban que cargue sin errores, que no se desborde en celulares ni en computadora (claro y oscuro), los precios fijos, los filtros, la búsqueda, el carrito con el mensaje de WhatsApp y los favoritos. En GitHub corren solas en cada cambio.
