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
          Distribución de los
          85 puntos que concentran
          la mayor ponderación
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


    <div
      class="
        methodology-distribution
        risk-distribution
      "
    >
      ${
        methodologyRiskRow(
          35,
          '% Importe de observaciones '
            + 'solventadas'
        )
      }

      ${
        methodologyRiskRow(
          15,
          '% Cantidad de observaciones '
            + 'solventadas'
        )
      }

      ${
        methodologyRiskRow(
          10,
          'Reincidencia'
        )
      }

      ${
        methodologyRiskRow(
          7,
          'Sistema Contable – SEvAC'
        )
      }

      ${
        methodologyRiskRow(
          6,
          'Cuenta Pública conforme '
            + 'a LFyRC'
        )
      }

      ${
        methodologyRiskRow(
          6,
          'Obra Pública'
        )
      }

      ${
        methodologyRiskRow(
          5,
          'Ley de Adquisiciones '
            + 'y Servicios'
        )
      }

      ${
        methodologyRiskRow(
          1,
          'Informe de Avance '
            + 'de Gestión Financiera'
        )
      }

    </div>
  `;
}

function methodologyRiskRow(
  points,
  label
) {
  const percentage =
    (
      points
      / 85
    )
    * 100;

  return `
    <div
      class="
        distribution-row
      "
    >

      <div
        class="
          distribution-points
        "
      >
        ${points}
      </div>


      <div
        class="
          distribution-info
        "
      >

        <b>
          ${label}
        </b>

        <span>
          ${points}
          ${
            points === 1
              ? 'punto'
              : 'puntos'
          }
        </span>

      </div>


      <div
        class="
          distribution-bar
        "
      >

        <div
          style="
            width:
            ${percentage.toFixed(2)}%;
          "
        ></div>

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
