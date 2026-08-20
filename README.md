# Sistema de Ponderación de Cuentas Públicas · UEC

Versión preparada para **GitHub + Cloudflare Pages + Cloudflare D1**.

El código está separado, comentado y espaciado por bloques para facilitar cambios posteriores aunque no seas programadora.

## Archivos principales

- `index.html` → estructura mínima de la página, título y favicon.
- `styles.css` → todo el diseño visual. Está dividido por bloques numerados.
- `app.js` → módulos, cálculos, captura y navegación. También está dividido por bloques numerados.
- `functions/api/state.js` → conexión entre la app y Cloudflare D1.
- `schema.sql` → referencia de la tabla utilizada en D1.
- `assets/logo-uec.png` → logo institucional.
- `assets/favicon.svg` → favicon con logo UEC + distintivo de ponderación.
- `assets/icon-192.png` y `assets/icon-512.png` → iconos para instalar la web como app.
- `manifest.webmanifest` → nombre, colores e iconos de la PWA.
- `sw.js` → service worker.

## Cloudflare Pages

Configuración recomendada:

- Framework preset: `None`
- Build command: `exit 0`
- Build output directory: `.`
- Root directory: vacío

## Cloudflare D1

La aplicación espera un binding con estos datos:

- Variable name: `DB`
- D1 database: `ponderacion-uec-db`

La función `/functions/api/state.js` crea la tabla `app_state` automáticamente si todavía no existe.

## Si necesitas hacer cambios visuales

Abre `styles.css`. Al inicio encontrarás la paleta institucional dentro de `:root`.

## Si necesitas cambiar los años disponibles

Abre `app.js` y busca la función `years()`.

## Si necesitas cambiar el orden o nombre del menú

Abre `app.js` y busca la constante `menu`.

## Si cambia la metodología o los puntajes

Abre `app.js` y busca el bloque:

`10. MODELO DE DATOS Y CÁLCULO DE PONDERACIÓN`

Ahí se encuentran la estructura del ejercicio y la función `calc()`.

## Importante

No borres la carpeta `functions` si deseas seguir utilizando Cloudflare D1.
