/* =========================================================
   9. MÓDULO: RESULTADOS
   Consulta, verifica, reabre, elimina y exporta ejercicios.
   ========================================================= */

function sortResultsByScore(items) {
  return [...items].sort((a, b) => {
    const scoreA = calc(a).score;
    const scoreB = calc(b).score;

    return scoreB - scoreA;
  });
}

function results() {
  const all = sortResultsByScore(
    store
      .get('exercises', [])
      .filter(item => {
        return item.year === state.year;
      })
  );

  const content = all.length
    ? resultsTableHtml(all)
    : `
      <div class="empty">
        No existen ejercicios guardados para
        ${state.year}.
      </div>
    `;

  $('#app').innerHTML = layout(
    content,
    'Resultados de Ponderación',
    'Consulta, verifica, edita o elimina ejercicios guardados.'
  );

  bindNav();

  bindResultActions(all);

  bindResultsSearch(all);

  bindResultsExport(all);

  bindResultsPdf(all);
}

function resultsTableHtml(items) {
  return `
    <div class="toolbar">

      <input
        id="searchRes"
        placeholder="Buscar ente…"
        style="
          padding:10px;
          border:1px solid var(--border);
          border-radius:7px;
        "
      >

      <div
        style="
          display:flex;
          align-items:center;
          gap:10px;
        "
      >

        <button
          class="btn"
          id="exportCsv"
        >
          ⇩ Exportar CSV
        </button>

        <button
          class="btn"
          id="exportResultsPdf"
        >
          PDF
        </button>

      </div>

    </div>

    <div class="tablewrap results-table-scroll">

  <table class="table results-main-table">

        <thead>
          <tr>
            <th>Ente fiscalizado</th>
            <th>Estado</th>
            <th>Base</th>
            <th>Ponderación</th>
            <th>Resultado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody id="resBody">
          ${resultRows(items)}
        </tbody>

      </table>

    </div>
  `;
}

function resultRows(items) {
  const orderedItems =
    sortResultsByScore(items);

  return orderedItems
    .map(item => {
      const calculation = calc(item);

      const resultClass =
        calculation.result === 'APROBADA'
          ? 'status-ok'
          : 'status-bad';

      return `
        <tr>

          <td>
            <b>
              ${exerciseEscapeHtml(
                item.entity || '—'
              )}
            </b>

            <br>

            <small>
              ${exerciseEscapeHtml(
                item.type || ''
              )}
            </small>
          </td>

          <td>
            ${exerciseEscapeHtml(
              item.status || 'Borrador'
            )}
          </td>

          <td>
            ${exerciseFormat(
              calculation.base
            )}
          </td>

          <td>
            <b>
              ${calculation.score.toFixed(2)}
            </b>
            / 100
          </td>

          <td class="${resultClass}">
            ${exerciseEscapeHtml(
              calculation.result
            )}
          </td>

          <td>

            <div class="result-actions">

              <button
                class="btn result-edit"
                data-entity="${exerciseEscapeHtml(
                  item.entity || ''
                )}"
              >
                Ver / editar
              </button>

              <button
                class="btn result-pdf"
                data-entity="${exerciseEscapeHtml(
                  item.entity || ''
                )}"
              >
                PDF
              </button>

              <button
                class="btn result-delete"
                data-entity="${exerciseEscapeHtml(
                  item.entity || ''
                )}"
              >
                Eliminar
              </button>

            </div>

          </td>

        </tr>
      `;
    })
    .join('');
}

function bindResultsSearch(all) {
  const search = $('#searchRes');

  if (!search) {
    return;
  }

  search.oninput = () => {
    const term = search.value
      .toLowerCase();

    const filtered = all.filter(item => {
      return String(item.entity || '')
        .toLowerCase()
        .includes(term);
    });

    $('#resBody').innerHTML =
      resultRows(filtered);

    bindResultActions(all);
  };
}

function bindResultsExport(all) {
  const button = $('#exportCsv');

  if (!button) {
    return;
  }

  button.onclick = () => {
    const ordered =
      sortResultsByScore(all);

    const rows = [
      [
        'Ejercicio Fiscal',
        'Ente',
        'Base',
        'Ponderación',
        'Resultado',
        'Estado'
      ],

      ...ordered.map(item => {
        const calculation =
          calc(item);

        return [
          item.year,
          item.entity,
          exerciseFormat(
            calculation.base
          ),
          calculation.score.toFixed(2),
          calculation.result,
          item.status || 'Borrador'
        ];
      })
    ];

    const csv = rows
      .map(row => {
        return row
          .map(value => {
            const clean =
              String(value)
                .replaceAll(
                  '"',
                  '""'
                );

            return `"${clean}"`;
          })
          .join(',');
      })
      .join('\n');

    const blob = new Blob(
      [csv],
      {
        type:
          'text/csv;charset=utf-8'
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;

    link.download =
      `resultados_ponderacion_${state.year}.csv`;

    link.click();

    URL.revokeObjectURL(url);
  };
}

function bindResultsPdf(all) {
  const button =
    $('#exportResultsPdf');

  if (!button) {
    return;
  }

  button.onclick = () => {
    resultsPdfPreview(all);
  };
}

function resultsPdfPreview(items) {
  const ordered =
    sortResultsByScore(items);

  const approved =
    ordered.filter(item => {
      return (
        calc(item).result ===
        'APROBADA'
      );
    }).length;

  const notApproved =
    ordered.filter(item => {
      return (
        calc(item).result !==
        'APROBADA'
      );
    }).length;

   const totalAccounts =
  ordered.length;

const approvedPercent =
  totalAccounts
    ? (
        approved /
        totalAccounts *
        100
      ).toFixed(1)
    : '0.0';

const notApprovedPercent =
  totalAccounts
    ? (
        notApproved /
        totalAccounts *
        100
      ).toFixed(1)
    : '0.0';

  const rows = ordered
    .map((item, index) => {
      const calculation =
        calc(item);

      const resultClass =
        calculation.result ===
        'APROBADA'
          ? 'approved-text'
          : 'not-approved-text';

      return `
        <tr>

          <td class="number-cell">
  ${index + 1}
</td>

          <td class="entity-cell">
            ${exerciseEscapeHtml(
              item.entity || '—'
            )}
          </td>

          <td class="number-cell">
            ${exerciseFormat(
              calculation.base
            )}
          </td>

          <td class="score-cell">
            ${calculation.score.toFixed(2)}
          </td>

          <td class="${resultClass}">
            ${exerciseEscapeHtml(
              calculation.result
            )}
          </td>

          <td>
            ${exerciseEscapeHtml(
              item.status || 'Borrador'
            )}
          </td>

        </tr>
      `;
    })
    .join('');

  const win = window.open(
    '',
    '_blank'
  );

  if (!win) {
    return alert(
      'Permite ventanas emergentes para generar el PDF.'
    );
  }

  const logoUrl = new URL(
    'assets/logo-uec.png',
    window.location.href
  ).href;

  const printStyles = `
    * {
      box-sizing: border-box;
    }

    @page {
      size: A4 portrait;

      margin:
        12mm
        10mm
        14mm
        10mm;
    }

    html,
    body {
      margin: 0;
      padding: 0;
    }

    body {
      font-family:
        Arial,
        Helvetica,
        sans-serif;

      background: #eef1f0;

      color: #17352f;

      font-size: 10px;

      line-height: 1.4;

      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .report {
      width: 210mm;
      min-height: 297mm;

      margin: 24px auto;

      padding:
        12mm
        10mm
        14mm
        10mm;

      background: #ffffff;

      box-shadow:
        0 4px 24px
        rgba(0, 0, 0, 0.12);
    }

    .header {
      display: grid;

      grid-template-columns:
        95px
        minmax(0, 1fr);

      gap: 18px;

      align-items: center;

      margin-bottom: 20px;

      padding-bottom: 16px;

      border-bottom:
        2px solid #b48a3a;
    }

    .logo {
      width: 90px;
      height: 90px;

      object-fit: contain;
    }

    .title {
      margin: 0;

      color: #064c3f;

      font-size: 26px;

      line-height: 1.05;

      font-weight: 800;

      text-transform: uppercase;
    }

    .subtitle {
      margin-top: 7px;

      color: #b48a3a;

      font-size: 17px;

      font-weight: 700;
    }

    .summary {
      display: grid;

      grid-template-columns:
        1fr
        1fr;

      gap: 12px;

      margin-bottom: 18px;
    }

    .summary-card {
      padding:
        13px
        16px;

      border:
        1px solid #d5dfdb;

      border-radius: 8px;

      background: #f8faf9;
    }

    .summary-label {
      display: block;

      margin-bottom: 5px;

      color: #64716d;

      font-size: 9px;

      font-weight: 700;

      text-transform: uppercase;
    }

    .summary-value {
      display: block;

      color: #064c3f;

      font-size: 23px;

      line-height: 1;

      font-weight: 800;
    }
    
.summary-percent {
  display: block;

  margin-top: 6px;

  color: #64716d;

  font-size: 9px;

  font-weight: 700;
}

    .summary-card.bad
      .summary-value {
      color: #8f2f32;
    }

    .section-title {
      margin:
        3px
        0
        9px;

      color: #17352f;

      font-size: 14px;

      font-weight: 800;

      text-transform: uppercase;
    }

    table {
      width: 100%;

      border-collapse: collapse;

      table-layout: fixed;
    }

    thead {
      display:
        table-header-group;
    }

    th {
      padding:
        8px
        6px;

      border:
        1px solid #becbc6;

      background: #075244;

      color: #ffffff;

      font-size: 8px;

      line-height: 1.2;

      text-align: center;

      text-transform: uppercase;
    }

    td {
      padding:
        7px
        6px;

      border:
        1px solid #c7d2ce;

      color: #253731;

      vertical-align: middle;

      font-size: 9.5px;

      overflow-wrap: break-word;
    }

    tbody tr:nth-child(even)
      td {
      background: #fafcfb;
    }

    tr,
    td,
    th {
      page-break-inside:
        avoid;

      break-inside:
        avoid;
    }

    .entity-cell {
      font-weight: 700;
    }

    .number-cell {
      text-align: center;
    }

    .score-cell {
      text-align: center;

      color: #064c3f;

      font-weight: 800;
    }

    .approved-text {
      color: #08754f;

      font-weight: 800;

      text-align: center;
    }

    .not-approved-text {
      color: #8f2f32;

      font-weight: 800;

      text-align: center;
    }

    .print-button {
      display: block;

      margin:
        20px
        auto
        0;

      padding:
        10px
        18px;

      border: 0;

      border-radius: 6px;

      background: #075244;

      color: #ffffff;

      font-weight: 700;

      cursor: pointer;
    }

    @media print {

      body {
        background: #ffffff;
      }

      .report {
        width: 100%;

        min-height: auto;

        margin: 0;

        padding: 0;

        box-shadow: none;
      }

      .print-button {
        display: none !important;
      }
    }
  `;

  const printHtml = `
    <!doctype html>

    <html lang="es">

      <head>

        <meta charset="utf-8">

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        >

        <title>
          Resultados de Ponderación
          ${state.year}
        </title>

        <style>
          ${printStyles}
        </style>

      </head>

      <body>

        <div class="report">

          <header class="header">

            <img
              class="logo"
              src="${logoUrl}"
              alt="UEC ASE"
            >

            <div>

              <h1 class="title">
                Resultados de Ponderación
              </h1>

              <div class="subtitle">
                Ejercicio Fiscal
                ${exerciseEscapeHtml(
                  state.year
                )}
              </div>

            </div>

          </header>

          <section class="summary">

            <div class="summary-card">

  <span class="summary-label">
    Aprobadas
  </span>

  <span class="summary-value">
    ${approved}
  </span>

  <span class="summary-percent">
    ${approvedPercent}% del total
  </span>

</div>

            <div class="summary-card bad">

  <span class="summary-label">
    No aprobadas
  </span>

  <span class="summary-value">
    ${notApproved}
  </span>

  <span class="summary-percent">
    ${notApprovedPercent}% del total
  </span>

</div>

          </section>

          <div class="section-title">
            Resultados por ente fiscalizado
          </div>

          <table>

            <thead>

              <tr>

                <th>
                  No.
                </th>

                <th>
                  Ente
                </th>

                <th>
                  Base
                </th>

                <th>
                  Ponderación
                </th>

                <th>
                  Resultado
                </th>

                <th>
                  Estado
                </th>

              </tr>

            </thead>

            <tbody>
              ${rows}
            </tbody>

          </table>

          <button
            class="print-button"
            onclick="window.print()"
          >
            Imprimir / Guardar como PDF
          </button>

        </div>

        <script>

          window.addEventListener(
            'load',
            () => {

              setTimeout(
                () => window.print(),
                500
              );

            }
          );

        <\/script>

      </body>

    </html>
  `;

  win.document.write(
    printHtml
  );

  win.document.close();
}
function bindResultsSearch(all) {
  const search = $('#searchRes');

  if (!search) {
    return;
  }

  search.oninput = () => {
    const term = search.value
      .toLowerCase();

    const filtered = all.filter(item => {
      return String(item.entity || '')
        .toLowerCase()
        .includes(term);
    });

    $('#resBody').innerHTML = resultRows(
      filtered
    );

    bindResultActions(all);
  };
}

function bindResultsExport(all) {
  const button = $('#exportCsv');

  if (!button) {
    return;
  }

  button.onclick = () => {
    const rows = [
      [
        'Ente',
        'Año',
        'Estado',
        'Base',
        'Puntaje obtenido',
        'Ponderación',
        'Resultado'
      ],
      ...all.map(item => [
        item.entity,
        item.year,
        item.status,
        item.base ?? '',
        item.raw ?? '',
        Number(item.score || 0).toFixed(2),
        item.result || ''
      ])
    ];

    const csv = rows
      .map(row => {
        return row
          .map(value => {
            const clean = String(value)
              .replaceAll('"', '""');

            return `"${clean}"`;
          })
          .join(',');
      })
      .join('\n');

    const blob = new Blob(
      [csv],
      {
        type: 'text/csv;charset=utf-8'
      }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `resultados_${state.year}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };
}

function bindResultActions(all) {
  $$('.result-edit').forEach(button => {
    button.onclick = () => {
      const item = findResultExercise(
        all,
        button.dataset.entity
      );

      if (!item) {
        return;
      }

      state.current = clone(item);

      if (!state.current.methodologySnapshot) {
        state.current.methodologySnapshot = clone(
          getMethodologyConfig()
        );
      }

      state.page = 'new';
      state.step = 1;
      render();
    };
  });

  $$('.result-pdf').forEach(button => {
    button.onclick = () => {
      const item = findResultExercise(
        all,
        button.dataset.entity
      );

      if (!item) {
        return;
      }

      exercisePrintPreview(
        clone(item)
      );
    };
  });

  $$('.result-delete').forEach(button => {
    button.onclick = async () => {
      const item = findResultExercise(
        all,
        button.dataset.entity
      );

      if (!item) {
        return;
      }

      await deleteExercise(item);
    };
  });
}

function findResultExercise(
  items,
  entity
) {
  return items.find(item => {
    return (
      item.entity === entity &&
      item.year === state.year
    );
  });
}

async function deleteExercise(exercise) {
  const message =
    '¿Seguro que deseas eliminar el ejercicio de ' +
    `"${exercise.entity}" del ejercicio fiscal ` +
    `${exercise.year}?\n\n` +
    'Esta acción eliminará el ejercicio guardado.';

  const confirmed = confirm(message);

  if (!confirmed) {
    return;
  }

  const all = clone(
    store.get('exercises', [])
  );

  const remaining = all.filter(item => {
    return !(
      item.year === exercise.year &&
      item.entity === exercise.entity
    );
  });

  try {
    await store.set(
      'exercises',
      remaining
    );

    if (
      state.current &&
      state.current.year === exercise.year &&
      state.current.entity === exercise.entity
    ) {
      state.current = null;
    }

    alert(
      'Ejercicio eliminado correctamente.'
    );

    results();
  } catch (error) {
    alert(
      'No se pudo eliminar el ejercicio: ' +
      error.message
    );
  }
}
