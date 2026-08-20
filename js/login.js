/* =========================================================
   5. PANTALLA DE INICIO
   Sin contraseña. Conserva el diseño institucional aprobado.
   ========================================================= */
function login() {
  document.querySelector('#app').innerHTML = `
    <div class="login">
      <div class="login-overlay">
</div>

      <main class="login-content">
        <div class="login-panel">

          <img
            class="login-logo"
            src="assets/logo-uec.png"
            alt="Unidad de Evaluación y Control"
          >

          <div class="login-title">
            <div class="login-title-small">
              SISTEMA DE
            </div>

            <div class="login-title-main">
              PONDERACIÓN
            </div>

            <div class="login-title-small">
              DE CUENTAS PÚBLICAS
            </div>
          </div>

          <p class="login-subtitle">
            Unidad de Evaluación y Control
            <br>
            de la Comisión de Vigilancia de la ASEBCS
          </p>

          <button
            class="enter"
            id="enter"
            type="button"
          >
            <span class="enter-arrow">→</span>
            <span>INGRESAR</span>
          </button>

          <p class="login-access">
            Acceso institucional · Sin contraseña
          </p>

        </div>
      </main>
    </div>
  `;

  $('#enter').onclick = () => {
    sessionStorage.setItem('in', '1');
    render();
  };
}
