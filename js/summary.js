/* =========================================================
   MÓDULO: RESUMEN DE CUENTAS PÚBLICAS
   Dashboard ejecutivo multiejercicio.
   ========================================================= */


/* =========================================================
   1. ESTADO INTERNO DEL DASHBOARD
   ========================================================= */

let summaryFilters = {
  year: 'all',
  entity: 'all'
};


/* =========================================================
   2. UTILIDADES GENERALES
   ========================================================= */

function summaryEscape(value) {
  return exerciseEscapeHtml(
    String(value ?? '')
  );
}


function summaryNumber(value) {
  return Number(value) || 0;
}


function summaryPercent(
  numerator,
  denominator
) {

  if (!denominator) {
    return '0.0';
  }

  return (
    numerator /
    denominator *
    100
  ).toFixed(1);
}


function summaryMoney(value) {

  return new Intl.NumberFormat(
    'es-MX',
    {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  ).format(
    summaryNumber(value)
  );
}


function summaryScore(item) {

  try {
    return calc(item).score;
  } catch (error) {
    return summaryNumber(
      item.score
    );
  }

}


function summaryResult(item) {

  try {
    return calc(item).result;
  } catch (error) {
    return item.result || '';
  }

}


/* =========================================================
   3. EJERCICIOS FINALIZADOS
   ========================================================= */

function summaryFinalizedExercises() {

  return store
    .get(
      'exercises',
      []
    )
    .filter(
      item =>
        item.status === 'Finalizado'
    );

}


/* =========================================================
   4. CATÁLOGOS
   ========================================================= */

function summaryCatalogs() {

  return store.get(
    'catalogs',
    {}
  );

}


function summaryCatalogYears() {

  const catalogs =
    summaryCatalogs();

  return Object
    .keys(catalogs)
    .map(Number)
    .filter(
      year =>
        Array.isArray(
          catalogs[year]
        ) &&
        catalogs[year].length
    )
    .sort(
      (a, b) => a - b
    );

}


/* =========================================================
   5. AÑOS DISPONIBLES
   ========================================================= */

function summaryAvailableYears() {

  const catalogYears =
    summaryCatalogYears();

  const exerciseYears =
    summaryFinalizedExercises()
      .map(
        item =>
          Number(item.year)
      );

  return [
    ...new Set([
      ...years(),
      ...catalogYears,
      ...exerciseYears
    ])
  ]
    .filter(Boolean)
    .sort(
      (a, b) => a - b
    );

}


/* =========================================================
   6. ENTES DEL CATÁLOGO
   ========================================================= */

function summaryEntityNames() {

  const catalogs =
    summaryCatalogs();

  const selectedYear =
    summaryFilters.year;

  const names = [];


  Object
    .entries(catalogs)
    .forEach(
      ([year, records]) => {

        if (
          selectedYear !== 'all' &&
          Number(year) !==
            Number(selectedYear)
        ) {
          return;
        }


        if (
          !Array.isArray(records)
        ) {
          return;
        }


        records.forEach(
          record => {

            const name =
              String(
                record?.name || ''
              ).trim();

            if (name) {
              names.push(name);
            }

          }
        );

      }
    );


  return [
    ...new Set(names)
  ].sort(
    (a, b) =>
      a.localeCompare(
        b,
        'es'
      )
  );

}


/* =========================================================
   7. CATÁLOGO FILTRADO
   ========================================================= */

function summaryFilteredCatalogRecords() {

  const catalogs =
    summaryCatalogs();

  const result = [];


  Object
    .entries(catalogs)
    .forEach(
      ([year, records]) => {

        const numericYear =
          Number(year);


        if (
          summaryFilters.year !== 'all' &&
          numericYear !==
            Number(
              summaryFilters.year
            )
        ) {
          return;
        }


        if (
          !Array.isArray(records)
        ) {
          return;
        }


        records.forEach(
          record => {

            const name =
              String(
                record?.name || ''
              ).trim();


            if (!name) {
              return;
            }


            if (
              summaryFilters.entity !== 'all' &&
              name !==
                summaryFilters.entity
            ) {
              return;
            }


            result.push({
              year:
                numericYear,

              name:
                name,

              type:
                record?.type || ''
            });

          }
        );

      }
    );


  return result;

}


/* =========================================================
   8. EJERCICIOS FILTRADOS
   ========================================================= */

function summaryFilteredExercises() {

  return summaryFinalizedExercises()
    .filter(
      item => {

        if (
          summaryFilters.year !== 'all' &&
          Number(item.year) !==
            Number(
              summaryFilters.year
            )
        ) {
          return false;
        }


        if (
          summaryFilters.entity !== 'all' &&
          String(
            item.entity || ''
          ).trim() !==
            summaryFilters.entity
        ) {
          return false;
        }


        return true;

      }
    );

}


/* =========================================================
   9. ENTES ÚNICOS DEL CATÁLOGO
   ========================================================= */

function summaryUniqueCatalogEntities(
  records
) {

  return [
    ...new Set(
      records.map(
        item => item.name
      )
    )
  ];

}


/* =========================================================
   10. EJERCICIOS FISCALES EVALUADOS
   ========================================================= */

function summaryEvaluatedYears(
  exercises
) {

  return [
    ...new Set(
      exercises.map(
        item =>
          Number(item.year)
      )
    )
  ]
    .filter(Boolean)
    .sort(
      (a, b) => a - b
    );

}


/* =========================================================
   11. DATOS DE SOLVENTACIÓN
   ========================================================= */

function summarySolvencyTotals(
  exercises
) {

  return exercises.reduce(
    (totals, item) => {

      const solv =
        item.solv || {};


      const countF =
        Math.max(
          0,
          summaryNumber(
            solv.countF
          )
        );


      const countS =
        Math.max(
          0,
          summaryNumber(
            solv.countS
          )
        );


      const countNotSolved =
        Math.max(
          0,
          countF - countS
        );


      /*
       * El monto total integra:
       *
       * Ingreso +
       * Egreso
       */
      const amountF =
        Math.max(
          0,
          summaryNumber(
            solv.inF
          )
        ) +
        Math.max(
          0,
          summaryNumber(
            solv.outF
          )
        );


      const amountS =
        Math.max(
          0,
          summaryNumber(
            solv.inS
          )
        ) +
        Math.max(
          0,
          summaryNumber(
            solv.outS
          )
        );


      const amountNotSolved =
        Math.max(
          0,
          amountF - amountS
        );


      totals.countF +=
        countF;

      totals.countS +=
        countS;

      totals.countNotSolved +=
        countNotSolved;

      totals.amountF +=
        amountF;

      totals.amountS +=
        amountS;

      totals.amountNotSolved +=
        amountNotSolved;


      return totals;

    },
    {
      countF: 0,
      countS: 0,
      countNotSolved: 0,
      amountF: 0,
      amountS: 0,
      amountNotSolved: 0
    }
  );

}


/* =========================================================
   12. OPCIONES DE FILTROS
   ========================================================= */

function summaryYearOptions() {

  const options =
    summaryAvailableYears()
      .map(
        year => {

          const selected =
            Number(
              summaryFilters.year
            ) === year
              ? 'selected'
              : '';

          return `
            <option
              value="${year}"
              ${selected}
            >
              ${year}
            </option>
          `;

        }
      )
      .join('');


  return `
    <option
      value="all"
      ${
        summaryFilters.year === 'all'
          ? 'selected'
          : ''
      }
    >
      Todos
    </option>

    ${options}
  `;

}


function summaryEntityOptions() {

  const entities =
    summaryEntityNames();


  const options =
    entities
      .map(
        entity => {

          const selected =
            summaryFilters.entity === entity
              ? 'selected'
              : '';

          return `
            <option
              value="${summaryEscape(entity)}"
              ${selected}
            >
              ${summaryEscape(entity)}
            </option>
          `;

        }
      )
      .join('');


  return `
    <option
      value="all"
      ${
        summaryFilters.entity === 'all'
          ? 'selected'
          : ''
      }
    >
      Todos
    </option>

    ${options}
  `;

}


/* =========================================================
   13. FILTROS
   ========================================================= */

function summaryFiltersHtml() {

  return `
    <div class="summary-filterbar">

      <div class="summary-filter">

        <label>
          Ejercicio Fiscal
        </label>

        <select id="summaryYear">
          ${summaryYearOptions()}
        </select>

      </div>


      <div class="summary-filter summary-filter-entity">

        <label>
          Entidad Fiscalizada
        </label>

        <select id="summaryEntity">
          ${summaryEntityOptions()}
        </select>

      </div>


      <button
        class="btn summary-clear"
        id="summaryClear"
        type="button"
      >
        Limpiar filtros
      </button>

    </div>
  `;

}


/* =========================================================
   14. KPI
   ========================================================= */

function summaryKpiHtml({
  label,
  value,
  detail = '',
  className = ''
}) {

  return `
    <div
      class="
        card
        summary-kpi
        ${className}
      "
    >

      <div class="summary-kpi-label">
        ${label}
      </div>

      <div class="summary-kpi-value">
        ${value}
      </div>

      ${
        detail
          ? `
            <div class="summary-kpi-detail">
              ${detail}
            </div>
          `
          : ''
      }

    </div>
  `;

}


/* =========================================================
   15. CHIPS DE AÑOS
   ========================================================= */

function summaryYearChips(
  evaluatedYears
) {

  if (!evaluatedYears.length) {
    return 'Sin ejercicios evaluados';
  }


  return evaluatedYears
    .map(
      year => `
        <span class="summary-year-chip">
          ${year} ✓
        </span>
      `
    )
    .join('');

}


/* =========================================================
   16. GRÁFICA DONUT
   ========================================================= */

function summaryClassificationChart(
  approved,
  notApproved
) {

  const total =
    approved + notApproved;


  if (!total) {

    return `
      <div class="summary-chart-empty">
        Sin evaluaciones para mostrar.
      </div>
    `;

  }


  const approvedPct =
    Number(
      summaryPercent(
        approved,
        total
      )
    );


  const notApprovedPct =
    Number(
      summaryPercent(
        notApproved,
        total
      )
    );


  const circumference =
    100;


  return `
    <div class="summary-donut-wrap">

      <div class="summary-donut">

        <svg
          viewBox="0 0 42 42"
          class="summary-donut-svg"
        >

          <circle
            cx="21"
            cy="21"
            r="15.9155"
            fill="transparent"
            stroke="#edf1ef"
            stroke-width="6"
          ></circle>


          <circle
            cx="21"
            cy="21"
            r="15.9155"
            fill="transparent"
            stroke="var(--green)"
            stroke-width="6"
            stroke-dasharray="
              ${approvedPct}
              ${
                circumference -
                approvedPct
              }
            "
            stroke-dashoffset="25"
          ></circle>


          <circle
            cx="21"
            cy="21"
            r="15.9155"
            fill="transparent"
            stroke="var(--red)"
            stroke-width="6"
            stroke-dasharray="
              ${notApprovedPct}
              ${
                circumference -
                notApprovedPct
              }
            "
            stroke-dashoffset="
              ${
                25 -
                approvedPct
              }
            "
          ></circle>

        </svg>


        <div class="summary-donut-center">

          <strong>
            ${total}
          </strong>

          <span>
            evaluadas
          </span>

        </div>

      </div>


      <div class="summary-chart-labels">

        <div class="summary-chart-label">

          <span
            class="
              summary-dot
              summary-dot-ok
            "
          ></span>

          <div>
            <b>Aprobadas</b>

            <span>
              ${approved}
              ·
              ${approvedPct.toFixed(1)}%
            </span>
          </div>

        </div>


        <div class="summary-chart-label">

          <span
            class="
              summary-dot
              summary-dot-bad
            "
          ></span>

          <div>
            <b>No aprobadas</b>

            <span>
              ${notApproved}
              ·
              ${notApprovedPct.toFixed(1)}%
            </span>
          </div>

        </div>

      </div>

    </div>
  `;

}


/* =========================================================
   17. AVANCE DE EVALUACIÓN
   Solo aparece al seleccionar un año específico.
   ========================================================= */

function summaryProgressHtml(
  catalogRecords,
  exercises
) {

  if (
    summaryFilters.year === 'all'
  ) {
    return '';
  }


  const expected =
    summaryUniqueCatalogEntities(
      catalogRecords
    ).length;


  const evaluatedNames =
    new Set(
      exercises.map(
        item =>
          String(
            item.entity || ''
          ).trim()
      )
    );


  const evaluated =
    expected
      ? [...evaluatedNames]
          .filter(
            name =>
              catalogRecords.some(
                item =>
                  item.name === name
              )
          )
          .length
      : 0;


  const percentage =
    expected
      ? Math.min(
          100,
          evaluated /
          expected *
          100
        )
      : 0;


  return `
    <div class="card">

      <div class="section-title">
        Avance de Evaluación
      </div>


      <div class="summary-progress">

        <div class="summary-progress-value">
          ${percentage.toFixed(1)}%
        </div>

        <div class="summary-progress-detail">
          ${evaluated}
          de
          ${expected}
          cuentas
        </div>


        <div class="summary-progress-track">

          <div
            class="summary-progress-fill"
            style="
              width:
              ${percentage.toFixed(1)}%;
            "
          ></div>

        </div>


        <div class="summary-progress-label">
          <b>${evaluated}</b>
          evaluadas
          ·
          <b>${percentage.toFixed(1)}%</b>
          del catálogo
        </div>

      </div>

    </div>
  `;

}


/* =========================================================
   18. EVOLUCIÓN HISTÓRICA
   ========================================================= */

function summaryEvolutionData(
  exercises
) {

  const byYear = {};


  exercises.forEach(
    item => {

      const year =
        Number(item.year);


      if (!byYear[year]) {

        byYear[year] = {
          year,
          total: 0,
          count: 0
        };

      }


      byYear[year].total +=
        summaryScore(item);

      byYear[year].count += 1;

    }
  );


  return Object
    .values(byYear)
    .map(
      item => ({
        year:
          item.year,

        average:
          item.count
            ? item.total /
              item.count
            : 0,

        count:
          item.count
      })
    )
    .sort(
      (a, b) =>
        a.year - b.year
    );

}


/* =========================================================
   19. GRÁFICA DE EVOLUCIÓN
   ========================================================= */

function summaryEvolutionChart(
  data
) {

  if (!data.length) {

    return `
      <div class="summary-chart-empty">
        Sin información histórica para mostrar.
      </div>
    `;

  }


  const width = 720;
  const height = 260;

  const padLeft = 48;
  const padRight = 28;
  const padTop = 46;
  const padBottom = 42;

  const chartWidth =
    width -
    padLeft -
    padRight;

  const chartHeight =
    height -
    padTop -
    padBottom;


  const xFor = index => {

    if (data.length === 1) {
      return (
        padLeft +
        chartWidth / 2
      );
    }

    return (
      padLeft +
      index /
      (data.length - 1) *
      chartWidth
    );

  };


  const yFor = value => {

    const safe =
      Math.max(
        0,
        Math.min(
          100,
          value
        )
      );

    return (
      padTop +
      chartHeight -
      safe /
      100 *
      chartHeight
    );

  };


  const points =
    data
      .map(
        (item, index) =>
          `${xFor(index)},${yFor(
            item.average
          )}`
      )
      .join(' ');


  const gridLines =
    [0, 25, 50, 75, 100]
      .map(
        value => {

          const y =
            yFor(value);

          return `
            <line
              x1="${padLeft}"
              y1="${y}"
              x2="${
                width -
                padRight
              }"
              y2="${y}"
              class="summary-svg-grid"
            ></line>

            <text
              x="${
                padLeft - 10
              }"
              y="${
                y + 4
              }"
              text-anchor="end"
              class="summary-svg-axis"
            >
              ${value}
            </text>
          `;

        }
      )
      .join('');


  const pointsHtml =
    data
      .map(
        (item, index) => {

          const x =
            xFor(index);

          const y =
            yFor(
              item.average
            );

          const value =
            item.average.toFixed(2);

          const pct =
            item.average.toFixed(1);


          return `
            <circle
              cx="${x}"
              cy="${y}"
              r="5"
              class="summary-svg-point"
            ></circle>


            <text
              x="${x}"
              y="${y - 15}"
              text-anchor="middle"
              class="summary-svg-label"
            >
              ${value} · ${pct}%
            </text>


            <text
              x="${x}"
              y="${
                height - 15
              }"
              text-anchor="middle"
              class="summary-svg-year"
            >
              ${item.year}
            </text>
          `;

        }
      )
      .join('');


  return `
    <div class="summary-evolution-scroll">

      <svg
        class="summary-evolution-svg"
        viewBox="
          0 0
          ${width}
          ${height}
        "
        role="img"
        aria-label="Evolución histórica de la ponderación"
      >

        ${gridLines}


        ${
          data.length > 1
            ? `
              <polyline
                points="${points}"
                class="summary-svg-line"
              ></polyline>
            `
            : ''
        }


        ${pointsHtml}

      </svg>

    </div>
  `;

}


/* =========================================================
   20. FILAS DE CUENTAS
   ========================================================= */

function summaryAccountRows(
  exercises
) {

  if (!exercises.length) {

    return `
      <tr>
        <td
          colspan="3"
          class="summary-table-empty"
        >
          Sin cuentas para mostrar.
        </td>
      </tr>
    `;

  }


  return [...exercises]
  .sort(
    (a, b) => {

      return (
        summaryScore(b) -
        summaryScore(a)
      );

    }
  )
    .map(
      item => {

        const score =
          summaryScore(item);


        return `
          <tr
            class="summary-account-row"
            data-year="${item.year}"
            data-entity="${
              summaryEscape(
                item.entity || ''
              )
            }"
            title="Abrir detalle"
          >

            <td>

              <b>
                ${
                  summaryEscape(
                    item.entity || '—'
                  )
                }
              </b>

            </td>


            <td>
              ${item.year}
            </td>


            <td>
              <b>
                ${score.toFixed(2)}
              </b>
            </td>

          </tr>
        `;

      }
    )
    .join('');

}


/* =========================================================
   21. TABLA APROBADAS / NO APROBADAS
   ========================================================= */

function summaryAccountTable(
  title,
  exercises,
  className
) {

  return `
    <div
      class="
        card
        summary-account-card
        ${className}
      "
    >

      <div class="summary-account-head">

        <div>
          <div class="section-title">
            ${title}
          </div>

          <small>
            Clic sobre un ente para abrir su detalle.
          </small>
        </div>


        <div class="summary-account-count">
          ${exercises.length}
        </div>

      </div>


      <div class="summary-account-scroll">

        <table class="table summary-account-table">

          <thead>

            <tr>
              <th>Ente</th>
              <th>Ejercicio</th>
              <th>Ponderación</th>
            </tr>

          </thead>


          <tbody>
            ${
              summaryAccountRows(
                exercises
              )
            }
          </tbody>

        </table>

      </div>

    </div>
  `;

}


/* =========================================================
   22. RENDER PRINCIPAL
   ========================================================= */

function summary() {

  const catalogRecords =
    summaryFilteredCatalogRecords();


  const exercises =
    summaryFilteredExercises();


  /*
   * Si cambió el ejercicio y el ente seleccionado
   * ya no existe en ese catálogo, regresar a Todos.
   */
  if (
    summaryFilters.entity !== 'all' &&
    !summaryEntityNames().includes(
      summaryFilters.entity
    )
  ) {

    summaryFilters.entity =
      'all';

    return summary();

  }


  const uniqueEntities =
    summaryUniqueCatalogEntities(
      catalogRecords
    );


  const evaluatedYears =
    summaryEvaluatedYears(
      exercises
    );


  const approved =
    exercises.filter(
      item =>
        summaryResult(item) ===
        'APROBADA'
    );


  const notApproved =
    exercises.filter(
      item =>
        summaryResult(item) !==
        'APROBADA'
    );


  const totalEvaluated =
    exercises.length;


  const approvedPct =
    summaryPercent(
      approved.length,
      totalEvaluated
    );


  const notApprovedPct =
    summaryPercent(
      notApproved.length,
      totalEvaluated
    );


  const solvency =
    summarySolvencyTotals(
      exercises
    );


  const notSolvedCountPct =
    summaryPercent(
      solvency.countNotSolved,
      solvency.countF
    );


  const notSolvedAmountPct =
    summaryPercent(
      solvency.amountNotSolved,
      solvency.amountF
    );


  const evolution =
    summaryEvolutionData(
      exercises
    );


  const content = `

    ${summaryFiltersHtml()}


    <!-- ==========================================
         KPIs PRINCIPALES
         ========================================== -->

    <div class="summary-kpi-grid">

      ${summaryKpiHtml({
        label:
          'Entidades Fiscalizadas',

        value:
          uniqueEntities.length,

        detail:
          uniqueEntities.length === 1
            ? 'Ente del catálogo'
            : 'Entes únicos del catálogo'
      })}


      ${summaryKpiHtml({
        label:
          'Ejercicios Fiscales Evaluados',

        value:
          evaluatedYears.length,

        detail:
          summaryYearChips(
            evaluatedYears
          )
      })}


      ${summaryKpiHtml({
        label:
          'Cuentas Aprobadas',

        value:
          approved.length,

        detail:
          `${approvedPct}% del total`,

        className:
          'summary-kpi-ok'
      })}


      ${summaryKpiHtml({
        label:
          'Cuentas No Aprobadas',

        value:
          notApproved.length,

        detail:
          `${notApprovedPct}% del total`,

        className:
          'summary-kpi-bad'
      })}

    </div>


    <!-- ==========================================
         FISCALIZACIÓN
         ========================================== -->

    <div class="summary-section-heading">

      <div>
        <h2>
          Indicadores de Fiscalización
        </h2>

        <p>
          Observaciones registradas en el apartado
          de Solventación.
        </p>
      </div>

    </div>


    <div class="summary-kpi-grid">

      ${summaryKpiHtml({
        label:
          'Observaciones Fincadas',

        value:
          solvency.countF.toLocaleString(
            'es-MX'
          ),

        detail:
          solvency.countF
            ? '100% del total fincado'
            : 'Sin observaciones registradas'
      })}


      ${summaryKpiHtml({
        label:
          'Observaciones No Solventadas',

        value:
          solvency.countNotSolved
            .toLocaleString(
              'es-MX'
            ),

        detail:
          `${notSolvedCountPct}% del total fincado`
      })}


      ${summaryKpiHtml({
        label:
          'Monto de Observaciones Fincadas',

        value:
          summaryMoney(
            solvency.amountF
          ),

        detail:
          solvency.amountF
            ? '100% del monto fincado'
            : 'Sin monto registrado'
      })}


      ${summaryKpiHtml({
        label:
          'Monto de Observaciones No Solventadas',

        value:
          summaryMoney(
            solvency.amountNotSolved
          ),

        detail:
          `${notSolvedAmountPct}% del monto fincado`
      })}

    </div>


    <!-- ==========================================
         GRÁFICAS
         ========================================== -->

    <div class="summary-chart-grid">

      <div class="card">

        <div class="section-title">
          Clasificación de Cuentas Públicas
        </div>

        ${
          summaryClassificationChart(
            approved.length,
            notApproved.length
          )
        }

      </div>


      ${
        summaryFilters.year !== 'all'
          ? summaryProgressHtml(
              catalogRecords,
              exercises
            )
          : `
            <div class="card">

              <div class="section-title">
                Ejercicios Evaluados
              </div>

              <div class="summary-years-panel">

                ${
                  evaluatedYears.length
                    ? evaluatedYears
                        .map(
                          year => `
                            <span
                              class="
                                summary-year-chip
                                summary-year-chip-large
                              "
                            >
                              ${year} ✓
                            </span>
                          `
                        )
                        .join('')
                    : `
                      <div class="summary-chart-empty">
                        Sin ejercicios evaluados.
                      </div>
                    `
                }

              </div>

            </div>
          `
      }

    </div>


    <!-- ==========================================
         EVOLUCIÓN
         ========================================== -->

    <div class="card summary-evolution-card">

      <div class="summary-evolution-head">

        <div>

          <div class="section-title">
            Evolución Histórica de la Ponderación
          </div>

          <p>
            ${
              summaryFilters.entity !== 'all'
                ? `
                  Evolución de
                  <b>
                    ${
                      summaryEscape(
                        summaryFilters.entity
                      )
                    }
                  </b>
                  por ejercicio fiscal.
                `
                : `
                  Ponderación promedio de las
                  cuentas evaluadas por ejercicio fiscal.
                `
            }
          </p>

        </div>

      </div>


      ${
        summaryEvolutionChart(
          evolution
        )
      }

    </div>


    <!-- ==========================================
         CUENTAS APROBADAS / NO APROBADAS
         ========================================== -->

    <div class="summary-account-grid">

      ${
        summaryAccountTable(
          'Cuentas Aprobadas',
          approved,
          'summary-approved-card'
        )
      }


      ${
        summaryAccountTable(
          'Cuentas No Aprobadas',
          notApproved,
          'summary-not-approved-card'
        )
      }

    </div>

  `;


  $('#app').innerHTML =
    layout(
      content,
      'Resumen de Cuentas Públicas',
      'Panorama ejecutivo de las cuentas públicas evaluadas.',
      false
    );


  bindNav();

  bindSummaryFilters();

  bindSummaryAccountRows();

}


/* =========================================================
   23. EVENTOS DE FILTROS
   ========================================================= */

function bindSummaryFilters() {

  const yearSelect =
    $('#summaryYear');


  const entitySelect =
    $('#summaryEntity');


  const clearButton =
    $('#summaryClear');


  if (yearSelect) {

    yearSelect.onchange =
      event => {

        summaryFilters.year =
          event.target.value === 'all'
            ? 'all'
            : Number(
                event.target.value
              );


        /*
         * Mantener el ente únicamente
         * si existe en el nuevo año.
         */
        if (
          summaryFilters.entity !== 'all' &&
          !summaryEntityNames().includes(
            summaryFilters.entity
          )
        ) {

          summaryFilters.entity =
            'all';

        }


        summary();

      };

  }


  if (entitySelect) {

    entitySelect.onchange =
      event => {

        summaryFilters.entity =
          event.target.value;

        summary();

      };

  }


  if (clearButton) {

    clearButton.onclick =
      () => {

        summaryFilters = {
          year: 'all',
          entity: 'all'
        };

        summary();

      };

  }

}


/* =========================================================
   24. ABRIR DETALLE DESDE LAS TABLAS
   ========================================================= */

function bindSummaryAccountRows() {

  $$('.summary-account-row')
    .forEach(
      row => {

        row.onclick = () => {

          const year =
            Number(
              row.dataset.year
            );


          const entity =
            row.dataset.entity;


          const item =
            summaryFinalizedExercises()
              .find(
                exercise =>
                  Number(
                    exercise.year
                  ) === year &&
                  String(
                    exercise.entity || ''
                  ) === entity
              );


          if (!item) {
            return;
          }


          /*
           * Abrir el mismo detalle que utiliza
           * Resultados → Ver / editar.
           */
          state.year =
            year;


          /*
           * Mantener también la selección
           * utilizada por el resto de la app.
           */
          try {

            sessionStorage.setItem(
              'selectedFiscalYear',
              year
            );

          } catch (error) {
            // Sin acción.
          }


          state.current =
            clone(item);


          if (
            !state.current
              .methodologySnapshot
          ) {

            state.current
              .methodologySnapshot =
                clone(
                  getMethodologyConfig(
                    year
                  )
                );

          }


          state.page =
            'new';

          state.step =
            1;


          render();

        };

      }
    );

}
