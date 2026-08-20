/* =========================================================
   6. MÓDULO: PROYECTO DE PONDERACIÓN
   Contenido informativo/metodológico del proyecto.
   ========================================================= */
function project() {
  const detail =
    methodologyDetailHtml(
      methodologyComponent
    );

  const content = `
    <div class="methodology-page">

      <section
        class="card methodology-intro"
      >
        <div class="section-title">
          ¿Qué es el proyecto?
        </div>

        <p
          class="methodology-description"
        >
          El modelo traduce el cumplimiento
          normativo de cada ente fiscalizado
          en una calificación única, objetiva
          y trazable.

          Sirve como base técnica para
          determinar la aprobación de la
          Cuenta Pública.
        </p>

        <div class="methodology-values">

          <div class="methodology-value">
            <div
              class="methodology-value-icon"
            >
              ◎
            </div>

            <div>
              <b>
                Objetividad
              </b>

              <span>
                Reglas explícitas
                de puntuación.
              </span>
            </div>
          </div>

          <div class="methodology-value">
            <div
              class="methodology-value-icon"
            >
              ≋
            </div>

            <div>
              <b>
                Comparabilidad
              </b>

              <span>
                Escala común
                de 100 puntos.
              </span>
            </div>
          </div>

          <div class="methodology-value">
            <div
              class="methodology-value-icon"
            >
              ⌘
            </div>

            <div>
              <b>
                Trazabilidad
              </b>

              <span>
                Cada resultado se vincula
                con evidencia.
              </span>
            </div>
          </div>

          <div class="methodology-value">
            <div
              class="methodology-value-icon"
            >
              △
            </div>

            <div>
              <b>
                Alerta temprana
              </b>

              <span>
                Criterios mayores
                independientes del puntaje.
              </span>
            </div>
          </div>

        </div>
      </section>


      <div class="methodology-rules-grid">

        <section
          class="card methodology-rule-card"
        >
          <div class="section-title">
            Criterios mayores
          </div>

          <div class="major-rule">

            <div class="major-rule-number">
              01
            </div>

            <div>
              <b>
                Entrega de Cuenta Pública
                en tiempo
              </b>

              <span>
                Verificación independiente
                del puntaje obtenido.
              </span>
            </div>

          </div>

          <div class="major-rule">

            <div class="major-rule-number">
              02
            </div>

            <div>
              <b>
                Sistema Contable
                Armonizado
              </b>

              <span>
                Criterio obligatorio
                para la aprobación.
              </span>
            </div>

          </div>

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


        <section
          class="card methodology-adjust-card"
        >
          <div class="section-title">
            Metodología de ajuste
          </div>

          <div class="adjust-row">

            <div class="adjust-number">
              100
            </div>

            <div>
              <b>
                Ente con obra pública
              </b>

              <span>
                Base aplicable
                de 100 puntos.
              </span>
            </div>

          </div>

          <div class="adjust-row">

            <div class="adjust-number">
              94
            </div>

            <div>
              <b>
                Ente sin obra pública
              </b>

              <span>
                Base aplicable
                de 94 puntos.
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

      </div>


      <section
        class="
          card
          methodology-architecture-card
        "
      >

        <div
          class="
            methodology-architecture-head
          "
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
              100
            </strong>

            <span>
              puntos
            </span>
          </div>

        </div>


        <div class="methodology-components">

          <button
            class="
              methodology-component
              ${
                methodologyComponent ===
                'risk'
                  ? 'active'
                  : ''
              }
            "
            data-methodology="risk"
            type="button"
          >
            <span class="component-label">
              Variables de Riesgo
            </span>

            <strong>
              85
            </strong>

            <small>
              puntos
            </small>
          </button>


          <button
            class="
              methodology-component
              ${
                methodologyComponent ===
                'control'
                  ? 'active'
                  : ''
              }
            "
            data-methodology="control"
            type="button"
          >
            <span class="component-label">
              Control y Transparencia
            </span>

            <strong>
              6
            </strong>

            <small>
              puntos
            </small>
          </button>


          <button
            class="
              methodology-component
              ${
                methodologyComponent ===
                'accountability'
                  ? 'active'
                  : ''
              }
            "
            data-methodology="accountability"
            type="button"
          >
            <span class="component-label">
              Rendición de Cuentas
            </span>

            <strong>
              9
            </strong>

            <small>
              puntos
            </small>
          </button>

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

  $('#app').innerHTML =
    layout(
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

function methodologyDetailHtml(
  component
) {
  if (
    component === 'control'
  ) {
    return `
      <div
        class="
          methodology-detail-head
        "
      >
        <div>

          <small>
            COMPONENTE SELECCIONADO
          </small>

          <h3>
            Control y Transparencia
          </h3>

          <p>
            Distribución de los
            6 puntos asignados
            a este componente.
          </p>

        </div>

        <div class="detail-total">
          6

          <span>
            pts
          </span>
        </div>
      </div>


      <div
        class="
          methodology-distribution
        "
      >

        <div class="distribution-row">

          <div
            class="
              distribution-points
            "
          >
            3
          </div>

          <div
            class="
              distribution-info
            "
          >
            <b>
              Ley de Disciplina
              Financiera
            </b>

            <span>
              Evaluación del
              cumplimiento trimestral.
            </span>
          </div>

          <div
            class="
              distribution-bar
            "
          >
            <div
              style="
                width:50%;
              "
            ></div>
          </div>

        </div>


        <div class="distribution-row">

          <div
            class="
              distribution-points
            "
          >
            3
          </div>

          <div
            class="
              distribution-info
            "
          >
            <b>
              Cuenta Pública
              en portales
            </b>

            <span>
              Publicación y
              disponibilidad
              de información.
            </span>
          </div>

          <div
            class="
              distribution-bar
            "
          >
            <div
              style="
                width:50%;
              "
            ></div>
          </div>

        </div>

      </div>
    `;
  }


  if (
    component === 'accountability'
  ) {
    return `
      <div
        class="
          methodology-detail-head
        "
      >
        <div>

          <small>
            COMPONENTE SELECCIONADO
          </small>

          <h3>
            Rendición de Cuentas
          </h3>

          <p>
            Distribución de los
            9 puntos correspondientes
            a la publicación mensual.
          </p>

        </div>

        <div class="detail-total">
          9

          <span>
            pts
          </span>
        </div>
      </div>


      <div
        class="
          accountability-summary
        "
      >

        <div
          class="
            accountability-number
          "
        >
          12
        </div>

        <div
          class="
            accountability-text
          "
        >
          <b>
            Meses evaluados
          </b>

          <span>
            Cada mes representa
            0.75 puntos.
          </span>
        </div>

        <div
          class="
            accountability-formula
          "
        >
          12 × 0.75 = 9 pts
        </div>

      </div>


      <div
        class="
          months-methodology
        "
      >
        ${
          [
            'Ene',
            'Feb',
            'Mar',
            'Abr',
            'May',
            'Jun',
            'Jul',
            'Ago',
            'Sep',
            'Oct',
            'Nov',
            'Dic'
          ]
            .map(
              (
                month
              ) => `
                <div>
                  <b>
                    ${month}
                  </b>

                  <span>
                    0.75
                  </span>
                </div>
              `
            )
            .join('')
        }
      </div>
    `;
  }


  return `
    <div
      class="
        methodology-detail-head
      "
    >
      <div>

        <small>
          COMPONENTE SELECCIONADO
        </small>

        <h3>
          Variables de Riesgo
        </h3>

        <p>
          Estructura jerárquica de los
          85 puntos de mayor ponderación
          del modelo.
        </p>

      </div>

      <div class="detail-total">
        85

        <span>
          pts
        </span>
      </div>
    </div>


    <div class="risk-architecture">

      ${methodologyRiskGroup(
        6,
        'Cuenta Pública conforme a LFyRC',
        `
          ${methodologyRiskCriterion(
            1,
            'La documentación presentada cumple con los requisitos de transparencia y veracidad exigidos por la LFyRC y LGCG.'
          )}

          ${methodologyRiskCriterion(
            1,
            'La cuenta pública incluye todos los elementos requeridos por la ley, como estados financieros, presupuestales y programáticos como lo indica la normativa vigente.'
          )}

          ${methodologyRiskCriterion(
            4,
            'La cuenta pública está libre de omisiones significativas o irregularidades que puedan afectar su integridad y fiabilidad.',
            [
              ['0.2', 'Conciliación de inventarios'],
              ['0.4', 'Modificaciones presupuestales'],
              ['1.6', 'Manual de administración de remuneraciones, vigente y autorizado'],
              ['1.6', 'Conciliaciones bancarias'],
              ['0.2', 'Relación de proveedores']
            ]
          )}
        `
      )}

      ${methodologyRiskGroup(
        1,
        'Informe de Avance de Gestión Financiera Art.12 LFRCBCS',
        `
          <div class="risk-group-note">
            A más tardar el 31 de agosto.
          </div>
        `
      )}

      ${methodologyRiskGroup(
        7,
        'Sistema de Contabilidad Completo (SEvAC) (Anual)',
        `
          ${methodologyRiskCriterion(
            7,
            'Sistema de Contabilidad Completo (SEvAC)'
          )}
        `
      )}

      ${methodologyRiskGroup(
        5,
        'Ley de Adquisiciones y Servicios',
        `
          ${methodologyRiskCriterion(
            1,
            'Procedimiento de Adquisición con evidencias / Expediente Técnico'
          )}

          ${methodologyRiskCriterion(
            4,
            'Programa Anual de adquisiciones'
          )}
        `
      )}

      ${methodologyRiskGroup(
        6,
        'Obra Pública',
        `
          ${methodologyRiskCriterion(
            2.5,
            'Programa Anual de Obras Públicas aprobado'
          )}

          ${methodologyRiskCriterion(
            1,
            'Expedientes unitarios debidamente integrado'
          )}

          ${methodologyRiskCriterion(
            2.5,
            'Obras pagadas NO ejecutadas'
          )}
        `
      )}

      ${methodologyRiskGroup(
        10,
        'Reincidencia en:',
        `
          ${methodologyRiskCriterion(
            1,
            'Sistema contable armonizado'
          )}

          ${methodologyRiskCriterion(
            2,
            'Programa anual de adquisiciones, arrendamiento y servicios'
          )}

          ${methodologyRiskCriterion(
            3,
            'Manual de remuneraciones y tabulador de sueldos'
          )}

          ${methodologyRiskCriterion(
            1,
            'Procedimientos de contratacion justificando la excepcion a licitación pública'
          )}

          ${methodologyRiskCriterion(
            3,
            'Levantamiento fisico del inventario de bienes muebles e inmuebles'
          )}
        `
      )}

      ${methodologyRiskGroup(
        15,
        '% de Cantidad Observaciones Solventadas',
        `
          ${methodologyRiskCriterion(
            15,
            'Porcentaje que resulte de dividir la cantidad de observaciones solventadas entre el total de observaciones fincadas. (proporción)'
          )}
        `
      )}

      ${methodologyRiskGroup(
        35,
        '% de Importe de Observaciones Solventadas',
        `
          ${methodologyRiskCriterion(
            5,
            'Ingreso'
          )}

          ${methodologyRiskCriterion(
            30,
            'Egreso'
          )}
        `
      )}

    </div>
  `;
}

function methodologyRiskGroup(
  points,
  title,
  content = ''
) {
  return `
    <section class="risk-group">

      <div class="risk-group-head">
        <div class="risk-group-points">
          ${points}

          <span>
            ${points === 1 ? 'punto' : 'puntos'}
          </span>
        </div>

        <div class="risk-group-title">
          ${title}
        </div>
      </div>

      ${
        content
          ? `<div class="risk-group-body">${content}</div>`
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
  return `
    <div class="risk-criterion">

      <div class="risk-criterion-points">
        ${points}
      </div>

      <div class="risk-criterion-content">
        <div class="risk-criterion-label">
          ${label}
        </div>

        ${
          subitems.length
            ? `
              <div class="risk-subitems">
                ${
                  subitems
                    .map(
                      ([subPoints, subLabel]) => `
                        <div class="risk-subitem">
                          <span class="risk-subitem-points">
                            ${subPoints}
                          </span>

                          <span class="risk-subitem-label">
                            ${subLabel}
                          </span>
                        </div>
                      `
                    )
                    .join('')
                }
              </div>
            `
            : ''
        }
      </div>

    </div>
  `;
}

function bindMethodology() {
  const buttons =
    $$(
      '.methodology-component'
    );

  buttons.forEach(
    (
      button
    ) => {

      button.onclick =
        () => {

          methodologyComponent =
            button.dataset.methodology;

          project();
        };
    }
  );
}
