/* =========================================================
   1. UTILIDADES GENERALES
   Atajos para seleccionar elementos y clonar objetos.
   ========================================================= */
const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => [...document.querySelectorAll(selector)];

const dbCache = { catalogs: {}, programs: [], exercises: [] };

const clone = (value) => JSON.parse(JSON.stringify(value));


/* =========================================================
   2. ALMACENAMIENTO EN CLOUDFLARE D1
   La app mantiene una copia temporal en memoria y sincroniza
   los cambios con /api/state (Pages Function + D1).
   ========================================================= */
const store={
  get:(k,d)=>dbCache[k]===undefined?clone(d):dbCache[k],
  set:async(k,v)=>{
    dbCache[k]=clone(v);

    const r=await fetch('/api/state',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({key:k,value:v})});

    const data=await r.json().catch(()=>({}));

    if(!r.ok||!data.ok)throw new Error(data.error||'No se pudo guardar en D1.');

    return data;

  }
};


/* =========================================================
   3. ESTADO GENERAL Y MENÚ
   Aquí puedes cambiar el módulo inicial, años disponibles
   y nombres que aparecen en el menú lateral.
   ========================================================= */
let state = { page: 'project', year: 2024, step: 1, current: null };
let methodologyComponent = 'risk';

const menu = [
  ['project', '', 'Metodología'],
  ['summary', '', 'Resumen'],
  ['results', '', 'Resultados'],
  ['new', '＋', 'Nuevo ejercicio'],
  ['catalog', '', 'Catálogo']
];

function years() {
  return [2024,2025,2026,2027,2028,2029]}

/* =========================================================
   4. ESTRUCTURA VISUAL / NAVEGACIÓN
   ========================================================= */
function layout(
  content,
  title,
  sub,
  showYear = true
) {
  const navButtons = menu
    .map((item) => {
      const activeClass =
        state.page === item[0]
          ? 'active'
          : '';

      return `
        <button
          data-page="${item[0]}"
          class="${activeClass}"
          type="button"
        >
          ${item[1]}
          <span>${item[2]}</span>
        </button>
      `;
    })
    .join('');

  const yearOptions = years()
    .map((year) => {
      const selected =
        year === state.year
          ? 'selected'
          : '';

      return `
        <option ${selected}>
          ${year}
        </option>
      `;
    })
    .join('');

  const yearBox = showYear
    ? `
      <div class="yearbox">
        Ejercicio fiscal:
        <select id="yearSel">
          ${yearOptions}
        </select>
      </div>
    `
    : '';

  return `
    <div class="shell">

      <aside class="sidebar">

        <div class="brand">
          <img
            src="assets/logo-uec.png"
            alt="UEC"
          >
        </div>

        <div class="nav">
          ${navButtons}
        </div>

        <div class="sidebar-bottom">

          <button
            class="logout-btn"
            id="logoutBtn"
            type="button"
            title="Cerrar y volver al inicio"
          >
            <span class="logout-icon">↪</span>
            <span>Cerrar</span>
          </button>

          <div class="sidefoot">
            Unidad de Evaluación y Control
            <br>
            CVASEBCS
          </div>

        </div>

      </aside>

      <main class="main">

        <div class="topbar">

          <div class="title">
            <h1>${title}</h1>

            <div class="subtitle">
              ${sub}
            </div>
          </div>

          ${yearBox}

        </div>

        ${content}

      </main>

    </div>
  `;
}

function bindNav() {
  $$('.nav button').forEach((button) => {
    button.onclick = () => {
      state.page = button.dataset.page;
      state.step = 1;
      render();
    };
  });

  const yearSelect = $('#yearSel');

  if (yearSelect) {
    yearSelect.onchange = (event) => {
      state.year = +event.target.value;
      render();
    };
  }

  const logoutButton = $('#logoutBtn');

  if (logoutButton) {
    logoutButton.onclick = () => {
      sessionStorage.removeItem('in');

      state.page = 'project';
      state.step = 1;
      state.current = null;

      render();
    };
  }
}

