# Distribuidor Independiente Fraiche · tienda

Página web donde tus clientes ven los productos (perfumes nuevos y rellenos, cremas, bodys, desodorantes, cuidado capilar, niños, difusores y velas), eligen esencia y aroma, arman su carrito y te mandan el pedido por WhatsApp.

No necesita servidor ni base de datos: son archivos que GitHub Pages publica gratis.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La página |
| `estilos.css` | El diseño (claro y oscuro según el celular) |
| `tienda.js` | Dibujos, filtros, favoritos, carrito y pedido por WhatsApp. **Arriba está tu número de WhatsApp.** |
| `productos.js` | El catálogo: nombres y precios. **Aquí cambias precios.** |
| `fotos/` | Aquí van las fotos de los productos |

## Cambiar el número de WhatsApp

En `tienda.js`, línea `const WHATSAPP = '';` pon tu número con 52 y el 1 de celular, sin espacios: `const WHATSAPP = '5215512345678';`

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
