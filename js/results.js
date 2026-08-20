/* =========================================================
   9. MÓDULO: RESULTADOS
   Consulta, verifica, reabre y exporta ejercicios guardados.
   ========================================================= */

function results() {
  const all = store
    .get('exercises', [])
    .filter(item => {
      return item.year === state.year;
    });

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
    'Consulta, verifica o edita los ejercicios guardados.'
  );

  bindNav();
  bindResultActions(all);
  bindResultsSearch(all);
  bindResultsExport(all);
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

      <button
        class="btn"
        id="exportCsv"
      >
        ⇩ Exportar CSV
      </button>
    </div>

    <div class="tablewrap">
      <table class="table">
        <thead>
          <tr>
            <th>Ente fiscalizado</th>
            <th>Estado</th>
            <th>Base</th>
            <th>Puntaje obtenido</th>
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
  return items
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
              ${exerciseEscapeHtml(item.entity || '—')}
            </b>
            <br>
            <small>
              ${exerciseEscapeHtml(item.type || '')}
            </small>
          </td>

          <td>
            ${exerciseEscapeHtml(
              item.status || 'Borrador'
            )}
          </td>

          <td>
            ${exerciseFormat(calculation.base)}
          </td>

          <td>
            ${exerciseFormat(calculation.raw)}
          </td>

          <td>
            <b>
              ${calculation.score.toFixed(2)}
            </b>
            / 100
          </td>

          <td class="${resultClass}">
            ${exerciseEscapeHtml(calculation.result)}
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
      const item = all.find(result => {
        return (
          result.entity === button.dataset.entity &&
          result.year === state.year
        );
      });

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
      const item = all.find(result => {
        return (
          result.entity === button.dataset.entity &&
          result.year === state.year
        );
      });

      if (item) {
        exercisePrintPreview(
          clone(item)
        );
      }
    };
  });
}

