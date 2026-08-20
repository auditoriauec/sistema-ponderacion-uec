# Estructura del Sistema de Ponderación UEC

La aplicación conserva JavaScript puro y su funcionamiento original, pero el código se separó por responsabilidad.

## JavaScript (`/js`)
- `core.js`: utilidades, almacenamiento, estado, menú y navegación.
- `login.js`: pantalla de inicio.
- `project.js`: Proyecto de Ponderación / metodología.
- `summary.js`: Resumen Ejecutivo.
- `catalog.js`: Catálogo de Entes, importación PDF y OCR.
- `results.js`: Resultados.
- `model.js`: modelo de datos y cálculo de ponderación.
- `exercise.js`: Nuevo Ejercicio y guardado.
- `bootstrap.js`: cierre de sesión, render e inicialización.

## CSS (`/css`)
- `base.css`: paleta y estilos globales.
- `login.css`: pantalla de inicio y su responsive.
- `sidebar.css`: menú lateral.
- `layout.css`: encabezado y área principal.
- `dashboard.css`: tarjetas, KPIs y gráficas.
- `project.css`: Proyecto de Ponderación y Metodología.
- `catalog-tables.css`: botones, tablas y catálogo general.
- `exercise.css`: formularios y wizard.
- `modals.css`: modales y estados vacíos.
- `responsive.css`: responsive general.
- `catalog-pdf.css`: carga PDF, edición, auditorías y OCR.

`styles.css` funciona ahora como índice y carga automáticamente los archivos de `/css`.
