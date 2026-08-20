/* =========================================================
   9. MÓDULO: RESULTADOS
   Consulta, verifica, reabre, elimina y exporta ejercicios.
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
    'Consulta, verifica, edita o elimina ejercicios guardados.'
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
