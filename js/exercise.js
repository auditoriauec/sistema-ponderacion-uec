/* =========================================================
   11. MÓDULO: NUEVO EJERCICIO
   Captura puntaje obtenido, aplicabilidad y notas.
   ========================================================= */

function exerciseEscapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function exerciseFormat(value) {
  return (Number(value) || 0).toLocaleString(
    'es-MX',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  );
}

function exerciseMoney(value) {
  return (Number(value) || 0).toLocaleString(
    'es-MX',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );
}

function exerciseItemId(key, suffix) {
  const safeKey = String(key)
    .replace(/[^a-z0-9]/gi, '_');

  return `ass_${safeKey}_${suffix}`;
}

function ensureExerciseCurrent() {
  if (
    !state.current ||
    state.current.year !== state.year
  ) {
    state.current = blankExercise();
  }

  if (!state.current.assessment) {
    state.current.assessment = {};
  }

  if (!state.current.methodologySnapshot) {
    state.current.methodologySnapshot = clone(
      getMethodologyConfig()
    );
  }

  return state.current;
}

/* =========================================================
   RENDER PRINCIPAL
   ========================================================= */

function newExercise() {
  const catalogs = store.get('catalogs', {});
  const entities = catalogs[state.year] || [];
  const exercise = ensureExerciseCurrent();
  const calculation = calc(exercise);
  const methodology = exerciseMethodology(exercise);

  const risk = methodology.components.find(
    component => component.key === 'risk'
  );

  const control = methodology.components.find(
    component => component.key === 'control'
  );

  const accountability = methodology.components.find(
    component => component.key === 'accountability'
  );

  const steps = [
    'Criterios mayores',
    risk?.name || 'Variables de Riesgo',
    'Solventación',
    control?.name || 'Variables de Control y Transparencia',
    accountability?.name || 'Variable de Rendición de Cuentas',
    'Resultado'
  ];

  const wizardHtml = steps
    .map((label, index) => {
      const active = state.step === index + 1
        ? 'active'
        : '';

      return `
        <div
          class="step ${active}"
          data-n="${index + 1}"
          role="button"
          tabindex="0"
          title="Ir a ${exerciseEscapeHtml(label)}"
        >
          ${exerciseEscapeHtml(label)}
        </div>
      `;
    })
    .join('');

  const yearsHtml = years()
    .map(year => {
      const selected = year === state.year
        ? 'selected'
        : '';

      return `
        <option ${selected}>
          ${year}
        </option>
      `;
    })
    .join('');

  const entitiesHtml = entities
    .map(entity => {
      const selected = entity.name === exercise.entity
        ? 'selected'
        : '';

      return `
        <option ${selected}>
          ${exerciseEscapeHtml(entity.name)}
        </option>
      `;
    })
    .join('');

  const emptyHtml = `
    <div class="empty">
      Primero carga el catálogo de entes para
      ${state.year} desde el módulo Catálogo.
    </div>
  `;

  const formHtml = `
    <div class="formgrid">
      <div class="form-main">
        ${stepHtml(exercise, methodology)}
      </div>

      ${exerciseResultCard(calculation)}
    </div>

    <div class="exercise-actions">
      <button
        class="btn"
        id="prev"
      >
        Anterior
      </button>

      <div>
        <button
          class="btn"
          id="draft"
        >
          Guardar borrador
        </button>

        <button
          class="btn primary"
          id="next"
        >
          ${
            state.step === 6
              ? 'Guardar ejercicio'
              : 'Siguiente →'
          }
        </button>
      </div>
    </div>
  `;

  const content = `
    <div class="wizard">
      ${wizardHtml}
    </div>

    <div
      class="card"
      style="margin-bottom:14px"
    >
      <div class="fields">
        <div class="field">
          <label>
            Ejercicio fiscal
          </label>

          <select id="newYear">
            ${yearsHtml}
          </select>
        </div>

        <div class="field">
          <label>
            Ente fiscalizado
          </label>

          <select id="entity">
            <option value="">
              Seleccionar ente…
            </option>

            ${entitiesHtml}
          </select>
        </div>
      </div>
    </div>

    ${
      !entities.length
        ? emptyHtml
        : formHtml
    }
  `;

  const title = exercise.status === 'Finalizado'
    ? 'Consultar / editar ejercicio'
    : 'Nuevo ejercicio de ponderación';

  const subtitle =
    'Puntajes máximos desde Catálogo · ' +
    'Captura del puntaje realmente obtenido.';

  $('#app').innerHTML = layout(
    content,
    title,
    subtitle
  );

  bindNav();
  bindNew(entities);
}

function exerciseResultCard(calculation) {
  const resultClass = calculation.majorOk
    ? 'status-ok'
    : 'status-bad';

  const progress = Math.min(
    100,
    calculation.score
  );

  return `
    <aside class="card resultcard">
      <div class="section-title">
        Resultado actual
      </div>

      <div class="bigscore">
        ${calculation.score.toFixed(2)}
      </div>

      <div>/ 100</div>

      <div class="result-metric">
        <small>
          Puntaje obtenido
        </small>

        <b>
          ${exerciseFormat(calculation.raw)} pts
        </b>
      </div>

      <div class="result-metric">
        <small>
          Base aplicable
        </small>

        <b>
          ${exerciseFormat(calculation.base)} pts
        </b>
      </div>

      <p class="${resultClass}">
        ${calculation.result}
      </p>

      <div class="progress">
        <div style="width:${progress}%"></div>
      </div>
    </aside>
  `;
}

/* =========================================================
   PASOS DEL EJERCICIO
   ========================================================= */

function stepHtml(exercise, methodology) {
  const risk = methodology.components.find(
    component => component.key === 'risk'
  );

  const control = methodology.components.find(
    component => component.key === 'control'
  );

  const accountability = methodology.components.find(
    component => component.key === 'accountability'
  );

  if (state.step === 1) {
    return majorStep(
      exercise,
      methodology
    );
  }

  if (state.step === 2) {
    return componentStep(
      exercise,
      risk,
      false
    );
  }

  if (state.step === 3) {
    return solvencyStep(
      exercise,
      risk
    );
  }

  if (state.step === 4) {
    return componentStep(
      exercise,
      control,
      false
    );
  }

  if (state.step === 5) {
    return componentStep(
      exercise,
      accountability,
      false
    );
  }

  return resultStep(
    exercise,
    methodology
  );
}

function majorStep(exercise, methodology) {
  const majorsHtml = (methodology.majors || [])
    .map(major => {
      const currentValue = exercise[major.key] !== false;
      const yesSelected = currentValue
        ? 'selected'
        : '';
      const noSelected = !currentValue
        ? 'selected'
        : '';
      const note = exercise.majorNotes?.[major.key] || '';

      return `
        <div class="score-item">
          <div class="score-item-head">
            <b>
              ${exerciseEscapeHtml(major.label)}
            </b>

            <span class="max-pill">
              Criterio mayor
            </span>
          </div>

          <select
            class="major-select"
            data-major="${major.key}"
          >
            <option
              value="true"
              ${yesSelected}
            >
              Sí cumple
            </option>

            <option
              value="false"
              ${noSelected}
            >
              No cumple
            </option>
          </select>

          <textarea
            class="note-input"
            data-major-note="${major.key}"
            placeholder="Nota / justificación"
          >${exerciseEscapeHtml(note)}</textarea>
        </div>
      `;
    })
    .join('');

  return `
    <div class="card">
      <div class="section-title">
        Paso 1 de 6 · Criterios mayores
      </div>

      <p class="exercise-help">
        Los criterios mayores no suman puntos.
        Si alguno no cumple, la Cuenta Pública
        queda no aprobada por criterio mayor.
      </p>

      <div class="fields">
        ${majorsHtml}
      </div>
    </div>
  `;
}

function componentStep(
  exercise,
  component,
  ratiosOnly
) {
  if (!component) {
    return `
      <div class="empty">
        Componente no disponible.
      </div>
    `;
  }

  const groups = (component.groups || [])
    .filter(group => {
      const hasRatio = methodologyItems(group)
        .some(item => item.type === 'ratio');

      return ratiosOnly
        ? hasRatio
        : !hasRatio;
    });

  const groupsHtml = groups
    .map(group => exerciseGroup(
      exercise,
      group
    ))
    .join('');

  return `
    <div class="card">
      <div class="section-title">
        ${exerciseEscapeHtml(component.name)}
      </div>

      <p class="exercise-help">
        El puntaje del Catálogo es el máximo.
        Captura el puntaje realmente obtenido.
        “No aplica” retira ese máximo de la base
        de ponderación.
      </p>

      ${groupsHtml}
    </div>
  `;
}

function exerciseGroup(exercise, group) {
  const forcedNotApplicable =
    group.requiresWork &&
    !exercise.work;

  const groupClass = forcedNotApplicable
    ? 'disabled-method-group'
    : '';

  const noteHtml = group.note
    ? `
      <small>
        ${exerciseEscapeHtml(group.note)}
      </small>
    `
    : '';

  const warningHtml = forcedNotApplicable
    ? `
      <div class="na-banner">
        No aplica: el ente no tiene Obra Pública.
        Estos puntos se excluyen de la base.
      </div>
    `
    : '';

  const itemsHtml = (group.items || [])
    .map(item => {
      if (!Array.isArray(item.children)) {
        return exerciseItem(
          exercise,
          item,
          group
        );
      }

      const childrenHtml = item.children
        .map(child => exerciseItem(
          exercise,
          child,
          group
        ))
        .join('');

      return `
        <div class="score-parent">
          <div class="score-parent-head">
            <b>
              ${exerciseEscapeHtml(item.label)}
            </b>

            <span>
              ${exerciseFormat(
                methodologyChildrenPoints(item)
              )} pts
            </span>
          </div>

          ${childrenHtml}
        </div>
      `;
    })
    .join('');

  return `
    <section
      class="exercise-method-group ${groupClass}"
    >
      <div class="exercise-group-head">
        <div>
          <h3>
            ${exerciseEscapeHtml(group.name)}
          </h3>

          ${noteHtml}
        </div>

        <span>
          ${exerciseFormat(
            methodologyGroupPoints(group)
          )} pts máx.
        </span>
      </div>

      ${warningHtml}

      <div class="score-list">
        ${itemsHtml}
      </div>
    </section>
  `;
}


function exerciseIsSevacItem(item) {
  const key = String(
    item?.key || ''
  ).toLowerCase();

  const label = String(
    item?.label ||
    item?.name ||
    item?.title ||
    ''
  ).toLowerCase();

  return (
    item?.type === 'sevac' ||
    key.includes('sevac') ||
    label.includes('sevac') ||
    label.includes(
      'sistema de contabilidad completo'
    )
  );
}

function exerciseNormalizedItem(item) {
  if (!exerciseIsSevacItem(item)) {
    return item;
  }

  return {
    ...item,
    type: 'sevac'
  };
}

function exerciseItem(
  exercise,
  item,
  group
) {
  const entry = assessmentEntry(
    exercise,
    item
  );

  const normalizedItem =
    exerciseNormalizedItem(item);

  const calculation = itemCalculation(
    exercise,
    normalizedItem,
    group
  );

  const forcedNotApplicable =
    group.requiresWork &&
    !exercise.work;

  const applicable = calculation.applicable;

  if (item.type === 'ratio') {
    return ratioItem(
      exercise,
      item,
      group
    );
  }

  let controlHtml = '';

  if (exerciseIsSevacItem(item)) {
    controlHtml = `
      <div class="field compact-field">
        <label>
          Calificación SEvAC
        </label>

        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          data-ass-value="${item.key}"
          value="${entry.value ?? 0}"
          ${!applicable ? 'disabled' : ''}
        >
      </div>

      <div class="field compact-field">
        <label>
          Puntaje SEvAC
        </label>

        <input
          type="text"
          data-sevac-points="${item.key}"
          value="${exerciseFormat(
            calculation.points
          )}"
          readonly
        >
      </div>

      <div
        class="formula-box"
        data-sevac-formula="${item.key}"
      >
        ${exerciseSevacFormulaHtml(
          calculation,
          item
        )}
      </div>
    `;
  } else {
    controlHtml = `
      <div class="field compact-field">
        <label>
          Puntaje obtenido
        </label>

        <input
          type="number"
          min="0"
          max="${Number(item.points) || 0}"
          step="0.01"
          data-ass-points="${item.key}"
          value="${Number(entry.points) || 0}"
          ${!applicable ? 'disabled' : ''}
        >
      </div>
    `;
  }

  const itemClass = !applicable
    ? 'item-not-applicable'
    : '';

  const checked = entry.applicable !== false
    ? 'checked'
    : '';

  const disabled = forcedNotApplicable
    ? 'disabled'
    : '';

  return `
    <div class="score-item ${itemClass}">
      <div class="score-item-head">
        <b>
          ${exerciseEscapeHtml(item.label)}
        </b>

        <span class="max-pill">
          Máx. ${exerciseFormat(item.points)}
        </span>
      </div>

      <div class="score-controls">
        ${controlHtml}

        <label class="apply-control">
          <input
            type="checkbox"
            data-ass-applicable="${item.key}"
            ${checked}
            ${disabled}
          >
          Aplica
        </label>
      </div>

      <textarea
        class="note-input"
        data-ass-note="${item.key}"
        placeholder="Nota / justificación / número de observación"
      >${exerciseEscapeHtml(entry.note || '')}</textarea>
    </div>
  `;
}

/* =========================================================
   CÁLCULOS DE SOLVENTACIÓN
   ========================================================= */

function ratioItem(
  exercise,
  item,
  group
) {
  const entry = assessmentEntry(
    exercise,
    item
  );

  const calculation = itemCalculation(
    exercise,
    item,
    group
  );

  const denominatorKey = String(
    item.denominator || ''
  ).split('.').pop();

  const numeratorKey = String(
    item.numerator || ''
  ).split('.').pop();

  let labels;
  let ids;

  if (
    denominatorKey === 'countF' ||
    item.ratioKind === 'count'
  ) {
    labels = [
      'Importe fincado',
      'Importe solventado'
    ];

    ids = [
      'countF',
      'countS'
    ];
  } else if (
    denominatorKey === 'inF' ||
    item.ratioKind === 'income'
  ) {
    labels = [
      'Importe fincado · Ingreso',
      'Importe solventado · Ingreso'
    ];

    ids = [
      'inF',
      'inS'
    ];
  } else {
    labels = [
      'Importe fincado · Egreso',
      'Importe solventado · Egreso'
    ];

    ids = [
      'outF',
      'outS'
    ];
  }

  if (denominatorKey && numeratorKey) {
    ids = [
      denominatorKey,
      numeratorKey
    ];
  }

  const percentage =
    (calculation.ratio || 0) * 100;

  const itemClass = !calculation.applicable
    ? 'item-not-applicable'
    : '';

  const disabled = !calculation.applicable
    ? 'disabled'
    : '';

  const checked = entry.applicable !== false
    ? 'checked'
    : '';

  return `
    <div class="score-item ${itemClass}">
      <div class="score-item-head">
        <b>
          ${exerciseEscapeHtml(item.label)}
        </b>

        <span class="max-pill">
          Máx. ${exerciseFormat(item.points)}
        </span>
      </div>

      <div class="ratio-grid">
        <div class="field compact-field">
          <label>
            ${labels[0]}
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            id="${ids[0]}"
            value="${pathValue(
              exercise,
              item.denominator
            ) || 0}"
            ${disabled}
          >
        </div>

        <div class="field compact-field">
          <label>
            ${labels[1]}
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            id="${ids[1]}"
            value="${pathValue(
              exercise,
              item.numerator
            ) || 0}"
            ${disabled}
          >
        </div>
      </div>

      <div
        class="formula-box"
        data-ratio-formula="${item.key}"
      >
        ${exerciseRatioFormulaHtml(
          calculation,
          item
        )}
      </div>

      <div class="score-controls">
        <label class="apply-control">
          <input
            type="checkbox"
            data-ass-applicable="${item.key}"
            ${checked}
          >
          Aplica
        </label>
      </div>

      <textarea
        class="note-input"
        data-ass-note="${item.key}"
        placeholder="Nota / justificación"
      >${exerciseEscapeHtml(entry.note || '')}</textarea>
    </div>
  `;
}

function solvencyStep(exercise, risk) {
  const groups = (risk?.groups || [])
    .filter(group => {
      return methodologyItems(group)
        .some(item => item.type === 'ratio');
    });

  const groupsHtml = groups
    .map(group => exerciseGroup(
      exercise,
      group
    ))
    .join('');

  return `
    <div class="card">
      <div class="section-title">
        Paso 3 de 6 · Solventación
      </div>

      <p class="exercise-help">
        Estas variables se calculan automáticamente
        con las mismas fórmulas del Excel.
        Puedes ver la operación completa antes
        de guardar.
      </p>

      ${groupsHtml}
    </div>
  `;
}

/* =========================================================
   RESUMEN FINAL
   ========================================================= */

function resultStep(exercise, methodology) {
  const calculation = calc(exercise);

  const resultClass = calculation.result === 'APROBADA'
    ? 'status-ok'
    : 'status-bad';

const notApplicableItems = [];

(methodology.components || [])
  .forEach(component => {
    (component.groups || [])
      .forEach(group => {
        methodologyItems(group)
          .forEach(item => {
            const itemCalc = itemCalculation(
              exercise,
              item,
              group
            );

            if (!itemCalc.applicable) {
              notApplicableItems.push({
                name: item.label,
                points: Number(item.points) || 0
              });
            }
          });
      });
  });

const notApplicableHtml =
  notApplicableItems.length
    ? `
      <div class="not-applicable-summary">

        <div class="not-applicable-title">
          Variables no aplicables:
        </div>

        <ul>
          ${notApplicableItems
            .map(item => `
              <li>
                <span>
                  ${exerciseEscapeHtml(item.name)}
                </span>

                <b>
                  ${exerciseFormat(item.points)}
                  pts
                </b>
              </li>
            `)
            .join('')}
        </ul>

      </div>
    `
    : '';
   
  const componentsHtml = (methodology.components || [])
    .map(component => {
      const componentResult =
        calculation.components[component.key] || {
          raw: 0,
          base: 0
        };

      return `
        <div>
          <span>
            ${exerciseEscapeHtml(component.name)}
          </span>

          <b>
            ${exerciseFormat(componentResult.raw)}
            /
            ${exerciseFormat(componentResult.base)}
          </b>
        </div>
      `;
    })
    .join('');

  return `
    <div class="card">
      <div class="section-title">
        Paso 6 de 6 · Resumen de la ponderación
      </div>

      <div class="result-summary">
        <div>
          <p>
            <b>Ente:</b>
            ${exerciseEscapeHtml(exercise.entity || '—')}
          </p>

          <p>
            <b>Base metodológica original:</b>
            ${exerciseFormat(
              methodologyTotal(methodology)
            )} pts
          </p>

          <p>
            <b>Base aplicable:</b>
            ${exerciseFormat(calculation.base)} pts
          </p>
          
${notApplicableHtml}

          <p>
            <b>Puntaje obtenido:</b>
            ${exerciseFormat(calculation.raw)} pts
          </p>

          <p>
            <b>Ponderación normalizada:</b>
            ${calculation.score.toFixed(2)} / 100
          </p>
        </div>

        <div>
          <div class="bigscore">
            ${calculation.score.toFixed(2)}
          </div>

          <div class="${resultClass}">
            ${calculation.result}
          </div>
        </div>
      </div>

      <div class="component-summary">
        ${componentsHtml}
      </div>

      <button
        class="btn"
        id="previewPdf"
        type="button"
      >
        Vista previa / PDF
      </button>
    </div>
  `;
}

function exerciseRatioFormulaHtml(
  calculation,
  item
) {
  const percentage =
    (calculation.ratio || 0) * 100;

  return `
    ${exerciseMoney(calculation.numerator)}
    ÷
    ${exerciseMoney(calculation.denominator)}
    =
    <b>${percentage.toFixed(2)}%</b>
    ·
    ${percentage.toFixed(2)}%
    ×
    ${exerciseFormat(item.points)}
    =
    <b>
      ${exerciseFormat(calculation.points)} pts
    </b>
  `;
}

function exerciseSevacFormulaHtml(
  calculation,
  item
) {
  const percentage =
    calculation.percentage || 0;

  return `
    ${exerciseFormat(percentage)}
    ÷ 100
    ×
    ${exerciseFormat(item.points)}
    =
    <b>
      ${exerciseFormat(
        calculation.points
      )} pts
    </b>
  `;
}

function refreshExerciseCalculations() {
  const exercise = state.current;

  if (!exercise) {
    return;
  }

  const methodology = exerciseMethodology(
    exercise
  );

  (methodology.components || [])
    .forEach(component => {
      (component.groups || [])
        .forEach(group => {
          methodologyItems(group)
            .forEach(item => {
              const normalizedItem =
                exerciseNormalizedItem(item);

              const calculation = itemCalculation(
                exercise,
                normalizedItem,
                group
              );

              if (item.type === 'ratio') {
                const formula = document.querySelector(
                  `[data-ratio-formula="${item.key}"]`
                );

                if (formula) {
                  formula.innerHTML =
                    exerciseRatioFormulaHtml(
                      calculation,
                      item
                    );
                }
              }

              if (exerciseIsSevacItem(item)) {
                const formula =
                  document.querySelector(
                    `[data-sevac-formula="${item.key}"]`
                  );

                const pointsField =
                  document.querySelector(
                    `[data-sevac-points="${item.key}"]`
                  );

                if (formula) {
                  formula.innerHTML =
                    exerciseSevacFormulaHtml(
                      calculation,
                      item
                    );
                }

                if (pointsField) {
                  pointsField.value =
                    exerciseFormat(
                      calculation.points
                    );
                }
              }
            });
        });
    });

  refreshCurrentScore();
}

/* =========================================================
   EVENTOS
   ========================================================= */

function bindNew(entities) {
  const exercise = state.current;

  $('#newYear').onchange = event => {
    state.year = +event.target.value;
    state.current = blankExercise();
    state.step = 1;
    render();
  };

  $('#entity').onchange = event => {
    exercise.entity = event.target.value;

    const entity = entities.find(
      item => item.name === exercise.entity
    );

    if (entity) {
      exercise.work = entity.work !== false;
      exercise.type = entity.type || '';
    }

    newExercise();
  };

  $$('.wizard .step').forEach(element => {
    const goToStep = () => {
      const step = Number(
        element.dataset.n
      );

      if (
        !Number.isInteger(step) ||
        step < 1 ||
        step > 6 ||
        step === state.step
      ) {
        return;
      }

      state.step = step;
      newExercise();
    };

    element.onclick = goToStep;

    element.onkeydown = event => {
      if (
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        event.preventDefault();
        goToStep();
      }
    };
  });

  if (!entities.length) {
    return;
  }

  $$('.major-select').forEach(element => {
    element.onchange = () => {
      exercise[element.dataset.major] =
        element.value === 'true';

      newExercise();
    };
  });

  $$('[data-major-note]').forEach(element => {
    element.oninput = () => {
      exercise.majorNotes =
        exercise.majorNotes || {};

      exercise.majorNotes[
        element.dataset.majorNote
      ] = element.value;
    };
  });

  $$('[data-ass-points]').forEach(element => {
    element.oninput = () => {
      const item = findMethodItem(
        exerciseMethodology(exercise),
        element.dataset.assPoints
      );

      if (!item) {
        return;
      }

      const maximum = Number(item.points) || 0;
      const entered = Number(element.value) || 0;

      assessmentEntry(
        exercise,
        item
      ).points = Math.max(
        0,
        Math.min(maximum, entered)
      );

      refreshCurrentScore();
    };
  });

  $$('[data-ass-value]').forEach(element => {
    element.oninput = () => {
      const item = findMethodItem(
        exerciseMethodology(exercise),
        element.dataset.assValue
      );

      if (!item) {
        return;
      }

      const entered = Number(element.value) || 0;

      assessmentEntry(
        exercise,
        item
      ).value = Math.max(
        0,
        Math.min(100, entered)
      );

      refreshExerciseCalculations();
    };
  });

  $$('[data-ass-applicable]').forEach(element => {
    element.onchange = () => {
      const item = findMethodItem(
        exerciseMethodology(exercise),
        element.dataset.assApplicable
      );

      if (!item) {
        return;
      }

      assessmentEntry(
        exercise,
        item
      ).applicable = element.checked;

      newExercise();
    };
  });

  $$('[data-ass-note]').forEach(element => {
    element.oninput = () => {
      const item = findMethodItem(
        exerciseMethodology(exercise),
        element.dataset.assNote
      );

      if (item) {
        assessmentEntry(
          exercise,
          item
        ).note = element.value;
      }
    };
  });

  const solvencyFields = [
    ['countF', 'countF'],
    ['countS', 'countS'],
    ['inF', 'inF'],
    ['inS', 'inS'],
    ['outF', 'outF'],
    ['outS', 'outS']
  ];

  solvencyFields.forEach(([id, key]) => {
    const element = $('#' + id);

    if (!element) {
      return;
    }

    element.oninput = () => {
      exercise.solv[key] = Math.max(
        0,
        Number(element.value) || 0
      );

      refreshExerciseCalculations();
    };
  });

  $('#prev').onclick = () => {
    state.step = Math.max(
      1,
      state.step - 1
    );

    newExercise();
  };

  $('#draft').onclick = () => {
    saveExercise(false);
  };

  $('#next').onclick = () => {
    if (state.step < 6) {
      state.step++;
      newExercise();
      return;
    }

    saveExercise(true);
  };

  const pdfButton = $('#previewPdf');

  if (pdfButton) {
    pdfButton.onclick = () => {
      exercisePrintPreview(exercise);
    };
  }
}

function findMethodItem(methodology, key) {
  for (
    const component of methodology.components || []
  ) {
    for (
      const group of component.groups || []
    ) {
      for (
        const item of methodologyItems(group)
      ) {
        if (item.key === key) {
          return item;
        }
      }
    }
  }

  return null;
}

function refreshCurrentScore() {
  const calculation = calc(state.current);
  const card = document.querySelector(
    '.resultcard'
  );

  if (card) {
    card.outerHTML = exerciseResultCard(
      calculation
    );
  }
}

/* =========================================================
   GUARDADO
   ========================================================= */

async function saveExercise(final) {
  const exercise = state.current;

  if (!exercise.entity) {
    return alert(
      'Selecciona un ente del catálogo.'
    );
  }

  const all = clone(
    store.get('exercises', [])
  );

  const index = all.findIndex(item => {
    return (
      item.year === exercise.year &&
      item.entity === exercise.entity
    );
  });

  const calculation = calc(exercise);

  const saved = {
    ...clone(exercise),
    ...calculation,
    status: final
      ? 'Finalizado'
      : 'Borrador',
    methodologySnapshot: clone(
      exerciseMethodology(exercise)
    ),
    updatedAt: new Date().toISOString()
  };

  if (index >= 0) {
    all[index] = saved;
  } else {
    all.push(saved);
  }

  try {
    await store.set(
      'exercises',
      all
    );

    state.current = clone(saved);

    if (final) {
      alert(
        'Ejercicio guardado. Puedes consultarlo ' +
        'y editarlo desde Resultados.'
      );

      state.page = 'results';
      state.step = 1;
      state.current = null;
      render();
      return;
    }

    alert(
      'Borrador guardado en Cloudflare D1.'
    );
  } catch (error) {
    alert(
      'No se pudo guardar en D1: ' +
      error.message
    );
  }
}

/* =========================================================
   VISTA PREVIA / PDF
   ========================================================= */

function exercisePrintPreview(exercise) {
  const methodology = exerciseMethodology(
    exercise
  );

  const calculation = calc(exercise);

  const rows = [];

  let totalObtained = 0;

  (methodology.components || [])
    .forEach(component => {
      (component.groups || [])
        .forEach(group => {
          methodologyItems(group)
            .forEach(item => {
              const itemCalc = itemCalculation(
                exercise,
                item,
                group
              );

              const entry = assessmentEntry(
                exercise,
                item
              );

              if (
                itemCalc.applicable &&
                Number.isFinite(
                  Number(itemCalc.points)
                )
              ) {
                totalObtained += Number(
                  itemCalc.points
                );
              }

              rows.push(`
                <tr>
                  <td class="variable-cell">
                    ${exerciseEscapeHtml(
                      component.name
                    )}
                  </td>

                  <td class="rubro-cell">
                    ${exerciseEscapeHtml(
                      group.name
                    )}
                  </td>

                  <td class="concepto-cell">
                    ${exerciseEscapeHtml(
                      item.label
                    )}
                  </td>

                  <td class="number-cell">
                    ${exerciseFormat(
                      item.points
                    )}
                  </td>

                  <td class="number-cell obtained-cell">
                    ${
                      itemCalc.applicable
                        ? exerciseFormat(
                            itemCalc.points
                          )
                        : 'N/A'
                    }
                  </td>

                  <td class="note-cell">
                    ${exerciseEscapeHtml(
                      entry.note || ''
                    )}
                  </td>
                </tr>
              `);
            });
        });
    });

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

  const entityName =
    exerciseEscapeHtml(
      exercise.entity
    );

  const exerciseYear =
    exerciseEscapeHtml(
      String(exercise.year)
    );

  const resultClass =
    calculation.result === 'APROBADA'
      ? 'approved'
      : 'not-approved';

  const baseText =
    exerciseFormat(
      calculation.base
    );

  const obtainedText =
    exerciseFormat(
      calculation.raw
    );

  const totalObtainedText =
    exerciseFormat(
      totalObtained
    );

  const scoreText =
    Number(
      calculation.score || 0
    ).toFixed(2);

  const formulaText =
    calculation.base > 0
      ? `
        ${obtainedText}
        ÷
        ${baseText}
        ×
        100
        =
        ${scoreText}
      `
      : 'No disponible';

   const calculationNote =
  Number(calculation.base) === 100
    ? `
      El puntaje obtenido corresponde a la suma
      de los puntos alcanzados en los rubros
      aplicables. La base aplicable del ejercicio
      es de 100 puntos, por lo que el puntaje
      obtenido corresponde directamente a la
      calificación global.
    `
    : `
      El puntaje obtenido corresponde a la suma
      de los puntos alcanzados únicamente en los
      rubros aplicables.

      La calificación global es diferente al
      puntaje obtenido porque se normaliza
      proporcionalmente sobre una escala de 100,
      tomando como referencia la base aplicable
      del ejercicio.

      <span class="calculation-formula">
        ${formulaText}
      </span>.
    `;

  const printStyles = `
    * {
      box-sizing: border-box;
    }

    @page {
      size: A4 portrait;

      margin:
        12mm
        9mm
        14mm
        9mm;
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

      color: #17352f;

      background: #eef1f0;

      font-size: 10px;

      line-height: 1.4;

      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;

      text-rendering: geometricPrecision;
    }

    .report {
      width: 210mm;
      min-height: 297mm;

      margin: 24px auto;

      padding:
        10mm
        9mm
        14mm
        9mm;

      background: #ffffff;

      box-shadow:
        0 4px 24px
        rgba(0, 0, 0, 0.12);
    }

    /* ========================================
       ENCABEZADO PRINCIPAL
       ======================================== */

    .hero {
      display: grid;

      grid-template-columns:
        100px
        minmax(0, 1fr)
        230px;

      gap: 16px;

      align-items: center;

      margin-bottom: 18px;
    }

    .logo-wrap {
      display: flex;

      align-items: center;
      justify-content: center;
    }

    .logo {
      width: 96px;
      height: 96px;

      object-fit: contain;

      display: block;
    }

    .title-area {
      min-width: 0;
    }

    .main-title {
      margin: 0;

      color: #064c3f;

      font-size: 26px;

      line-height: 1;

      font-weight: 800;

      letter-spacing: -0.4px;

      text-transform: uppercase;
    }

    .main-title span {
      display: block;
    }

    .main-title .gold {
      color: #b48a3a;

      margin-top: 4px;
    }

    .entity-data {
      display: flex;

      align-items: stretch;

      margin-top: 18px;
    }

    .data-item {
      padding-right: 16px;

      margin-right: 16px;

      border-right:
        1px solid #d7c9ad;
    }

    .data-item:last-child {
      border-right: none;

      padding-right: 0;

      margin-right: 0;
    }

    .data-label {
      display: block;

      margin-bottom: 4px;

      color: #5b6762;

      font-size: 8px;

      font-weight: 700;

      text-transform: uppercase;

      letter-spacing: 0.5px;
    }

    .data-value {
      display: block;

      color: #152f2a;

      font-size: 12px;

      line-height: 1.2;

      font-weight: 700;
    }

    /* ========================================
       CALIFICACIÓN GLOBAL
       ======================================== */

    .score-card {
      overflow: hidden;

      border:
        1px solid #cbd8d3;

      border-radius: 9px;

      background: #ffffff;

      box-shadow:
        0 2px 7px
        rgba(0, 54, 44, 0.08);
    }

    .score-card-title {
      padding: 8px 10px;

      background: #075244;

      color: #ffffff;

      text-align: center;

      font-size: 10px;

      font-weight: 800;

      text-transform: uppercase;

      letter-spacing: 0.4px;
    }

    .global-score {
      padding: 12px 10px 7px;

      color: #064c3f;

      text-align: center;

      font-size: 36px;

      line-height: 1;

      font-weight: 800;
    }

    .global-score small {
      font-size: 15px;
      font-weight: 600;
    }

    .result {
      margin: 4px 14px 12px;

      padding: 6px 8px;

      border-radius: 6px;

      text-align: center;

      font-size: 14px;

      font-weight: 800;

      text-transform: uppercase;
    }

    .result.approved {
      background: #c39b51;
      color: #ffffff;
    }

    .result.not-approved {
      background: #8f2f32;
      color: #ffffff;
    }

    .score-meta {
      display: grid;

      grid-template-columns:
        1fr
        1fr;

      background: #075244;

      color: #ffffff;
    }

    .score-meta-item {
      padding: 9px 8px;

      text-align: center;
    }

    .score-meta-item:first-child {
      border-right:
        1px solid
        rgba(255, 255, 255, 0.25);
    }

    .score-meta-label {
      display: block;

      margin-bottom: 2px;

      font-size: 7px;

      font-weight: 700;

      text-transform: uppercase;

      opacity: 0.9;
    }

    .score-meta-value {
      display: block;

      font-size: 15px;

      line-height: 1;

      font-weight: 800;
    }

    /* ========================================
       TÍTULO DE SECCIÓN
       ======================================== */

    .section-title {
      display: flex;

      align-items: center;

      gap: 9px;

      margin:
        4px
        0
        9px;

      color: #17352f;
    }

    .section-icon {
      display: flex;

      align-items: center;
      justify-content: center;

      width: 27px;
      height: 27px;

      flex:
        0 0 27px;

      border-radius: 50%;

      background: #075244;

      color: #ffffff;

      font-size: 14px;

      font-weight: 800;
    }

    .section-title h2 {
      margin: 0;

      font-size: 14px;

      line-height: 1;

      font-weight: 800;

      text-transform: uppercase;

      letter-spacing: 0.25px;
    }

    /* ========================================
       TABLA
       ======================================== */

    table {
      width: 100%;

      border-collapse: collapse;

      table-layout: fixed;

      margin: 0;

      color: #253731;
    }

    col.variable {
      width: 16%;
    }

    col.rubro {
      width: 20%;
    }

    col.concepto {
      width: 35%;
    }

    col.maximo {
      width: 8%;
    }

    col.obtenido {
      width: 9%;
    }

    col.nota {
      width: 12%;
    }

    thead {
      display: table-header-group;
    }

    th {
      padding: 7px 5px;

      border:
        1px solid #becbc6;

      background: #075244;

      color: #ffffff;

      font-size: 8.6px;

      line-height: 1.2;

      font-weight: 800;

      text-align: center;

      text-transform: uppercase;

      vertical-align: middle;
    }

    td {
      padding: 6px 6px;

      border:
        1px solid #c4cfcb;

      background: #ffffff;

      color: #1f312b;

      vertical-align: top;

      white-space: normal;

      overflow: visible;

      overflow-wrap: break-word;

      word-break: normal;

      hyphens: none;

      font-size: 9.5px;

      line-height: 1.4;

      font-weight: 500;
    }

    tbody tr:nth-child(even) td {
      background: #fafcfb;
    }

    tbody tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    tbody td {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .number-cell {
      text-align: center;

      font-weight: 600;

      white-space: nowrap;
    }

    .obtained-cell {
      color: #064c3f;

      font-weight: 800;
    }

    .note-cell {
      font-size: 9.5px;

      line-height: 1.4;
    }

    /* ========================================
       ENCABEZADO REPETIDO POR PÁGINA
       ======================================== */

    .page-data-row th {
      padding:
        6px
        9px;

      background: #f7f9f8;

      color: #064c3f;

      border-top:
        2px solid #b48a3a;

      border-bottom:
        1px solid #becbc6;

      font-size: 7.5px;

      line-height: 1.2;

      letter-spacing: 0.2px;

      text-transform: uppercase;
    }

    .page-data-left {
      text-align: left;
    }

    .page-data-right {
      text-align: right;
    }

    .page-data-row strong {
      margin-left: 4px;

      font-size: 8px;

      color: #17352f;
    }

    /*
      En la primera página no necesitamos
      que la franja de ente y ejercicio
      llame demasiado la atención.
    */

    .first-page-data {
      display: none;
    }

    /* ========================================
       TOTAL
       ======================================== */

    tfoot {
      display: table-row-group;
    }

    .total-row td {
      padding-top: 9px;
      padding-bottom: 9px;

      border-top:
        2px solid #075244;

      background: #f1f6f4;

      color: #064c3f;

      font-weight: 800;

      page-break-inside: avoid;
      break-inside: avoid;
    }

    .total-label {
      text-align: right;

      text-transform: uppercase;

      letter-spacing: 0.2px;
    }

    .total-value {
      text-align: center;

      font-size: 11px;

      white-space: nowrap;
    }

    /* ========================================
       NOTA DE NORMALIZACIÓN
       ======================================== */

    .calculation-note {
      margin-top: 10px;

      padding: 10px 12px;

      border-left:
        4px solid #b48a3a;

      background: #f8f7f3;

      color: #394a44;

      font-size: 9px;

      line-height: 1.5;

      page-break-inside: avoid;
      break-inside: avoid;
    }

    .calculation-note strong {
      color: #064c3f;
    }

    .calculation-formula {
      display: inline-block;

      margin-left: 4px;

      color: #064c3f;

      font-weight: 800;
    }

    /* ========================================
       BOTÓN
       ======================================== */

    .print-button {
      display: block;

      margin:
        20px
        auto
        0;

      padding: 10px 18px;

      border: none;

      border-radius: 6px;

      background: #075244;

      color: #ffffff;

      font: inherit;

      font-weight: 700;

      cursor: pointer;
    }

    /* ========================================
       IMPRESIÓN
       ======================================== */

    @media print {

      html,
      body {
        width: 100%;
        height: auto;
      }

      body {
        background: #ffffff;

        font-family:
          Arial,
          Helvetica,
          sans-serif;

        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
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

      .score-card {
        box-shadow: none;
      }

      /*
        El navegador repetirá automáticamente
        el THEAD cuando la tabla pase
        a una nueva hoja.
      */

      thead {
        display: table-header-group;
      }

      /*
        Mantiene las filas completas.
      */

      tr,
      td,
      th {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      /*
        Evita espacios artificiales
        antes de una tabla nueva.
      */

      table {
        page-break-before: auto;
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
          Ponderación ${entityName}
        </title>

        <style>
          ${printStyles}
        </style>
      </head>

      <body>

        <div class="report">

          <section class="hero">

            <div class="logo-wrap">

              <img
                class="logo"
                src="${logoUrl}"
                alt="UEC ASE"
              >

            </div>

            <div class="title-area">

              <h1 class="main-title">

                <span>
                  Resumen de
                </span>

                <span>
                  Ponderación
                </span>

                <span class="gold">
                  de Cuenta Pública
                </span>

              </h1>

              <div class="entity-data">

                <div class="data-item">

                  <span class="data-label">
                    Ente fiscalizado
                  </span>

                  <span class="data-value">
                    ${entityName}
                  </span>

                </div>

                <div class="data-item">

                  <span class="data-label">
                    Ejercicio fiscal
                  </span>

                  <span class="data-value">
                    ${exerciseYear}
                  </span>

                </div>

              </div>

            </div>

            <div class="score-card">

              <div class="score-card-title">
                Calificación global
              </div>

              <div class="global-score">
                ${scoreText}

                <small>
                  / 100
                </small>
              </div>

              <div
                class="result ${resultClass}"
              >
                ${exerciseEscapeHtml(
                  calculation.result
                )}
              </div>

              <div class="score-meta">

                <div class="score-meta-item">

                  <span class="score-meta-label">
                    Base aplicable
                  </span>

                  <span class="score-meta-value">
                    ${baseText}
                  </span>

                </div>

                <div class="score-meta-item">

                  <span class="score-meta-label">
                    Puntaje obtenido
                  </span>

                  <span class="score-meta-value">
                    ${obtainedText}
                  </span>

                </div>

              </div>

            </div>

          </section>

          <div class="section-title">

            <div class="section-icon">
              ≡
            </div>

            <h2>
              Desglose de Puntaje
            </h2>

          </div>

          <table>

            <colgroup>
              <col class="variable">
              <col class="rubro">
              <col class="concepto">
              <col class="maximo">
              <col class="obtenido">
              <col class="nota">
            </colgroup>

            <thead>

              <tr class="page-data-row">

                <th colspan="3">

                  <div class="page-data-left">
                    Ente fiscalizado:
                    <strong>
                      ${entityName}
                    </strong>
                  </div>

                </th>

                <th colspan="3">

                  <div class="page-data-right">
                    Ejercicio fiscal:
                    <strong>
                      ${exerciseYear}
                    </strong>
                  </div>

                </th>

              </tr>

              <tr>

                <th>
                  Variable
                </th>

                <th>
                  Rubro
                </th>

                <th>
                  Concepto
                </th>

                <th>
                  Máximo
                </th>

                <th>
                  Obtenido
                </th>

                <th>
                  Nota
                </th>

              </tr>

            </thead>

            <tbody>
              ${rows.join('')}
            </tbody>

            <tfoot>

              <tr class="total-row">

                <td
                  colspan="4"
                  class="total-label"
                >
                  Total puntaje obtenido
                </td>

                <td class="total-value">
                  ${totalObtainedText}
                </td>

                <td>
                </td>

              </tr>

            </tfoot>

          </table>

          <div class="calculation-note">

  <strong>
    Nota sobre la calificación global:
  </strong>

  ${calculationNote}

</div>

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
