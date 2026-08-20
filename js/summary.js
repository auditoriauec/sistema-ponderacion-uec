/* =========================================================
   7. MÓDULO: RESUMEN EJECUTIVO
   Solo usa ejercicios con estado "Finalizado".
   ========================================================= */

function finalized() {
  return store
    .get('exercises', [])
    .filter(
      (item) =>
        item.year === state.year &&
        item.status === 'Finalizado'
    );
}

function summary() {
  const exercises = finalized();

  const approved = exercises.filter(
    (item) => item.result === 'APROBADA'
  );

  const notApproved =
    exercises.length - approved.length;

  const average = exercises.length
    ? exercises.reduce(
        (sum, item) => sum + item.score,
        0
      ) / exercises.length
    : 0;

  const approvedPct = exercises.length
    ? (
        approved.length /
        exercises.length *
        100
      ).toFixed(1)
    : '0.0';

  const notApprovedPct = exercises.length
    ? (
        notApproved /
        exercises.length *
        100
      ).toFixed(1)
    : '0.0';

  let content = `
    <div class="grid4">
      <div class="card kpi">
        <div class="ico">👥</div>
        <div>
          <b>Entes evaluados</b>
          <div class="num">
            ${exercises.length}
          </div>
          <small>Total del ejercicio</small>
        </div>
      </div>

      <div class="card kpi">
        <div class="ico">✓</div>
        <div>
          <b>Aprobados</b>
          <div class="num">
            ${approved.length}
          </div>
          <small>
            ${approvedPct}% del total
          </small>
        </div>
      </div>

      <div class="card kpi">
        <div
          class="ico"
          style="color:var(--red)"
        >
          ×
        </div>
        <div>
          <b>No aprobados</b>
          <div class="num">
            ${notApproved}
          </div>
          <small>
            ${notApprovedPct}% del total
          </small>
        </div>
      </div>

      <div class="card kpi">
        <div class="ico">★</div>
        <div>
          <b>Promedio general</b>
          <div class="num">
            ${
              exercises.length
                ? average.toFixed(1)
                : '—'
            } / 100
          </div>
          <small>Puntaje promedio</small>
        </div>
      </div>
    </div>
  `;

  if (exercises.length) {
    const approvedDegrees = (
      approved.length /
      exercises.length *
      360
    ).toFixed(1);

    content += `
      <div class="grid2">
        <div class="card">
          <div class="section-title">
            Clasificación de cuentas públicas
          </div>

          <div
            style="
              display:flex;
              gap:28px;
              align-items:center;
              justify-content:center;
              padding:30px;
              flex-wrap:wrap;
            "
          >
            <div
              style="
                position:relative;
                width:220px;
                height:220px;
                display:flex;
                align-items:center;
                justify-content:center;
              "
            >
              <div
                style="
                  width:180px;
                  height:180px;
                  border-radius:50%;
                  background:
                    conic-gradient(
                      var(--ok) 0 ${approvedDegrees}deg,
                      var(--red) ${approvedDegrees}deg 360deg
                    );
                  position:relative;
                "
              >
                <div
                  style="
                    position:absolute;
                    inset:45px;
                    background:white;
                    border-radius:50%;
                  "
                ></div>
              </div>

              <div
                style="
                  position:absolute;
                  top:4px;
                  right:0;
                  padding:6px 9px;
                  border-radius:8px;
                  background:white;
                  border:1px solid rgba(0,0,0,.08);
                  box-shadow:0 3px 10px rgba(0,0,0,.08);
                  font-size:12px;
                  font-weight:800;
                  color:var(--ok);
                  white-space:nowrap;
                "
              >
                ${approved.length} · ${approvedPct}%
              </div>

              <div
                style="
                  position:absolute;
                  bottom:4px;
                  left:0;
                  padding:6px 9px;
                  border-radius:8px;
                  background:white;
                  border:1px solid rgba(0,0,0,.08);
                  box-shadow:0 3px 10px rgba(0,0,0,.08);
                  font-size:12px;
                  font-weight:800;
                  color:var(--red);
                  white-space:nowrap;
                "
              >
                ${notApproved} · ${notApprovedPct}%
              </div>
            </div>

            <div>
              <p>
                <span class="status-ok">■</span>
                Aprobadas:
                <b>${approved.length}</b>
                · ${approvedPct}%
              </p>

              <p>
                <span class="status-bad">■</span>
                No aprobadas:
                <b>${notApproved}</b>
                · ${notApprovedPct}%
              </p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="section-title">
            Promedio por componente
          </div>

          <div class="bars">
            <div class="barrow">
              <b>Variables de Riesgo</b>
              <div class="track">
                <div
                  class="fill"
                  style="
                    width:${Math.min(100, average)}%
                  "
                ></div>
              </div>
              <b>
                ${(average * 0.85).toFixed(1)} / 85
              </b>
            </div>

            <div class="barrow">
              <b>
                Variables de Control y Transparencia
              </b>
              <div class="track">
                <div
                  class="fill"
                  style="
                    width:${Math.min(100, average)}%
                  "
                ></div>
              </div>
              <b>
                ${(average * 0.06).toFixed(1)} / 6
              </b>
            </div>

            <div class="barrow">
              <b>Variable de Rendición de Cuentas</b>
              <div class="track">
                <div
                  class="fill"
                  style="
                    width:${Math.min(100, average)}%
                  "
                ></div>
              </div>
              <b>
                ${(average * 0.09).toFixed(1)} / 9
              </b>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    content += `
      <div
        class="empty"
        style="margin-top:14px"
      >
        <b>
          Aún no existen ejercicios de ponderación
          finalizados para ${state.year}.
        </b>
        <br><br>
        Los indicadores aparecerán automáticamente
        conforme se guarden ejercicios.
      </div>
    `;
  }

  $('#app').innerHTML = layout(
    content,
    'Resumen Ejecutivo',
    'Panorama general del ejercicio seleccionado'
  );

  bindNav();
}
