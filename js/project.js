/* =========================================================
   6. MÓDULO: METODOLOGÍA
   La estructura se obtiene del Catálogo del modelo.
   ========================================================= */

function project() {
  const methodology = getMethodologyConfig();
  const components = methodology.components || [];
  const total = methodologyTotal(methodology);

  ensureMethodologyComponent(
    components
  );

  const detail = methodologyDetailHtml(
    methodologyComponent,
    methodology
  );

  const content = `
    <div class="methodology-page">

      ${methodologyIntroHtml()}

      <div class="methodology-rules-grid">
        ${methodologyMajorsHtml(methodology)}
        ${methodologyAdjustmentHtml(total)}
      </div>

      <section
        class="card methodology-architecture-card"
      >
        <div
          class="methodology-architecture-head"
        >
          <div>
            <div class="section-title">
              Arquitectura del modelo
            </div>

            <p>
              Selecciona un componente
              para consultar cómo se
              distribuye su ponderación.
            </p>
          </div>

          <div class="methodology-total">
            <strong>
              ${formatMethodPoints(total)}
            </strong>

            <span>
              puntos
            </span>
          </div>
        </div>

        <div class="methodology-components">
          ${methodologyComponentsHtml(
            components
          )}
        </div>

        <div
          class="methodology-detail"
          id="methodologyDetail"
        >
          ${detail}
        </div>
      </section>

    </div>
  `;

  $('#app').innerHTML = layout(
    content,
    'Metodología',
    'Estructura, criterios y '
      + 'distribución del modelo '
      + 'de ponderación.',
    false
  );

  bindNav();
  bindMethodology();
}


/* =========================================================
   INTRODUCCIÓN
   ========================================================= */

function methodologyIntroHtml() {
  return `
    <section
      class="card methodology-intro"
    >
      <div class="section-title">
        ¿Qué es el proyecto?
      </div>

      <p class="methodology-description">
        El modelo traduce el cumplimiento
        normativo de cada ente fiscalizado
        en una calificación única, objetiva
        y trazable.

        Sirve como base técnica para
        determinar la aprobación de la
        Cuenta Pública.
      </p>

      <div class="methodology-values">

        ${methodologyValueHtml(
          '◎',
          'Objetividad',
          'Reglas explícitas de puntuación.'
        )}

        ${methodologyValueHtml(
          '≋',
          'Comparabilidad',
          'Escala común del modelo vigente.'
        )}

        ${methodologyValueHtml(
          '⌘',
          'Trazabilidad',
          'Cada resultado se vincula con evidencia.'
        )}

        ${methodologyValueHtml(
          '△',
          'Alerta temprana',
          'Criterios mayores independientes del puntaje.'
        )}

      </div>
    </section>
  `;
}

function methodologyValueHtml(
  icon,
  title,
  text
) {
  return `
    <div class="methodology-value">
      <div class="methodology-value-icon">
        ${icon}
      </div>

      <div>
        <b>
          ${methodologyEscape(title)}
        </b>

        <span>
          ${methodologyEscape(text)}
        </span>
      </div>
    </div>
  `;
}


/* =========================================================
   CRITERIOS MAYORES
   ========================================================= */

function methodologyMajorsHtml(
  methodology
) {
  const majors = methodology.majors || [];

  const rows = majors
    .map(
      (
        major,
        index
      ) => methodologyMajorRowHtml(
        major,
        index
      )
    )
    .join('');

  return `
    <section
      class="card methodology-rule-card"
    >
      <div class="section-title">
        Criterios mayores
      </div>

      ${rows}

      <div class="methodology-alert">
        <b>
          Regla de aprobación
        </b>

        <span>
          Si cualquiera de los criterios
          mayores obtiene "NO", la cuenta
          se clasifica como NO APROBADA,
          independientemente del puntaje.
        </span>
      </div>
    </section>
  `;
}

function methodologyMajorRowHtml(
  major,
  index
) {
  const number = String(
    index + 1
  ).padStart(
    2,
    '0'
  );

  return `
    <div class="major-rule">
      <div class="major-rule-number">
        ${number}
      </div>

      <div>
        <b>
          ${methodologyEscape(
            major.label || ''
          )}
        </b>

        <span>
          ${methodologyEscape(
            major.description
              || 'Criterio obligatorio para la aprobación.'
          )}
        </span>
      </div>
    </div>
  `;
}


/* =========================================================
   METODOLOGÍA DE AJUSTE
   ========================================================= */

function methodologyAdjustmentHtml(
  total
) {
  return `
    <section
      class="card methodology-adjust-card"
    >
      <div class="section-title">
        Metodología de ajuste
      </div>

      <div class="adjust-row">
        <div class="adjust-number">
          ${formatMethodPoints(total)}
        </div>

        <div>
          <b>
            Base metodológica total
          </b>

          <span>
            Suma máxima definida
            en el Catálogo.
          </span>
        </div>
      </div>

      <div class="adjust-row">
        <div class="adjust-number">
          −
        </div>

        <div>
          <b>
            Conceptos no aplicables
          </b>

          <span>
            Sus puntos se retiran
            de la base aplicable.
          </span>
        </div>
      </div>

      <div class="methodology-formula">
        <small>
          PUNTAJE FINAL
        </small>

        <b>
          (Puntos obtenidos × 100)
          ÷ Base aplicable
        </b>
      </div>
    </section>
  `;
}


/* =========================================================
   COMPONENTES
   ========================================================= */

function ensureMethodologyComponent(
  components
) {
  const exists = components.some(
    (
      component
    ) => component.key === methodologyComponent
  );

  if (
    !exists
    && components.length
  ) {
    methodologyComponent =
      components[0].key;
  }
}

function methodologyComponentsHtml(
  components
) {
  return components
    .map(
      (
        component
      ) => methodologyComponentButtonHtml(
        component
      )
    )
    .join('');
}

function methodologyComponentButtonHtml(
  component
) {
  const active =
    methodologyComponent === component.key
      ? 'active'
      : '';

  const points =
    methodologyComponentPoints(
      component
    );

  return `
    <button
      class="methodology-component ${active}"
      data-methodology="${methodologyEscapeAttr(
        component.key
      )}"
      type="button"
    >
      <span class="component-label">
        ${methodologyEscape(
          component.name || ''
        )}
      </span>

      <strong>
        ${formatMethodPoints(points)}
      </strong>

      <small>
        puntos
      </small>
    </button>
  `;
}


/* =========================================================
   DETALLE DEL COMPONENTE
   ========================================================= */

function methodologyDetailHtml(
  componentKey,
  methodology = getMethodologyConfig()
) {
  const component = (
    methodology.components || []
  ).find(
    (
      item
    ) => item.key === componentKey
  );

  if (!component) {
    return `
      <div class="risk-group-note">
        No hay información disponible
        para este componente.
      </div>
    `;
  }

  const points =
    methodologyComponentPoints(
      component
    );

  const groups = (
    component.groups || []
  )
    .map(
      (
        group
      ) => methodologyGroupHtml(
        group
      )
    )
    .join('');

  return `
    <div class="methodology-detail-head">
      <div>
        <small>
          COMPONENTE SELECCIONADO
        </small>

        <h3>
          ${methodologyEscape(
            component.name || ''
          )}
        </h3>

        <p>
          ${methodologyEscape(
            component.description
              || 'Distribución de criterios y puntajes del componente.'
          )}
        </p>
      </div>

      <div class="detail-total">
        ${formatMethodPoints(points)}

        <span>
          pts
        </span>
      </div>
    </div>

    <div class="risk-architecture">
      ${groups}
    </div>
  `;
}


/* =========================================================
   GRUPOS, CRITERIOS Y DESGLOSES
   ========================================================= */

function methodologyGroupHtml(
  group
) {
  const points =
    methodologyGroupPoints(
      group
    );

  const items = (
    group.items || []
  )
    .map(
      (
        item
      ) => methodologyItemHtml(
        item
      )
    )
    .join('');

  const note = group.note
    ? `
        <div class="risk-group-note">
          ${methodologyEscape(group.note)}
        </div>
      `
    : '';

  return methodologyRiskGroup(
    points,
    group.name || '',
    `${items}${note}`
  );
}

function methodologyItemHtml(
  item
) {
  const children =
    Array.isArray(item.children)
      ? item.children
      : [];

  if (children.length) {
    const points =
      methodologyChildrenPoints(
        item
      );

    const subitems = children.map(
      (
        child
      ) => [
        formatMethodPoints(
          child.points
        ),
        child.label || ''
      ]
    );

    return methodologyRiskCriterion(
      points,
      item.label || '',
      subitems
    );
  }

  return methodologyRiskCriterion(
    Number(item.points) || 0,
    item.label || ''
  );
}

function methodologyRiskGroup(
  points,
  title,
  content = ''
) {
  const pointLabel =
    Number(points) === 1
      ? 'punto'
      : 'puntos';

  return `
    <section class="risk-group">
      <div class="risk-group-head">
        <div class="risk-group-points">
          ${formatMethodPoints(points)}

          <span>
            ${pointLabel}
          </span>
        </div>

        <div class="risk-group-title">
          ${methodologyEscape(title)}
        </div>
      </div>

      ${
        content
          ? `
              <div class="risk-group-body">
                ${content}
              </div>
            `
          : ''
      }
    </section>
  `;
}

function methodologyRiskCriterion(
  points,
  label,
  subitems = []
) {
  const children = subitems.length
    ? `
        <div class="risk-subitems">
          ${
            subitems
              .map(
                (
                  [
                    subPoints,
                    subLabel
                  ]
                ) => `
                  <div class="risk-subitem">
                    <span
                      class="risk-subitem-points"
                    >
                      ${methodologyEscape(
                        subPoints
                      )}
                    </span>

                    <span
                      class="risk-subitem-label"
                    >
                      ${methodologyEscape(
                        subLabel
                      )}
                    </span>
                  </div>
                `
              )
              .join('')
          }
        </div>
      `
    : '';

  return `
    <div class="risk-criterion">
      <div class="risk-criterion-points">
        ${formatMethodPoints(points)}
      </div>

      <div class="risk-criterion-content">
        <div class="risk-criterion-label">
          ${methodologyEscape(label)}
        </div>

        ${children}
      </div>
    </div>
  `;
}


/* =========================================================
   NAVEGACIÓN ENTRE COMPONENTES
   ========================================================= */

function bindMethodology() {
  const buttons = $$ (
    '.methodology-component'
  );

  buttons.forEach(
    (
      button
    ) => {
      button.onclick = () => {
        methodologyComponent =
          button.dataset.methodology;

        project();
      };
    }
  );
}


/* =========================================================
   UTILIDADES LOCALES
   ========================================================= */

function methodologyEscape(
  value = ''
) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function methodologyEscapeAttr(
  value = ''
) {
  return methodologyEscape(value);
}
