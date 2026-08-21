/* =========================================================
   5. PANTALLA DE INICIO
   Acceso institucional con contraseña.
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

          <div class="login-password-wrap">

            <input
              class="login-password"
              id="loginPassword"
              type="password"
              placeholder="Contraseña"
              autocomplete="current-password"
            >

          </div>

          <div
            class="login-error"
            id="loginError"
          >
          </div>

          <button
            class="enter"
            id="enter"
            type="button"
          >
            <span class="enter-arrow">
              →
            </span>

            <span>
              INGRESAR
            </span>
          </button>

          <p class="login-access">
            Acceso institucional
          </p>

        </div>

      </main>

    </div>
  `;

  const passwordInput =
    document.querySelector(
      '#loginPassword'
    );

  const errorBox =
    document.querySelector(
      '#loginError'
    );

  const enterButton =
    document.querySelector(
      '#enter'
    );

  async function submitPassword() {
    const password =
      passwordInput.value.trim();

    errorBox.textContent = '';

    if (!password) {
      errorBox.textContent =
        'Ingresa la contraseña.';

      passwordInput.focus();

      return;
    }

    enterButton.disabled = true;

    enterButton.textContent =
      'VALIDANDO...';

    try {
      const response = await fetch(
        '/api/state',
        {
          method: 'POST',

          headers: {
            'content-type':
              'application/json'
          },

          body: JSON.stringify({
            action: 'login',
            password
          })
        }
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.error ||
          'Contraseña incorrecta.'
        );
      }

      sessionStorage.setItem(
        'in',
        '1'
      );

      render();

    } catch (error) {
      errorBox.textContent =
        error.message ||
        'Contraseña incorrecta.';

      passwordInput.select();

    } finally {
      enterButton.disabled = false;

      enterButton.innerHTML = `
        <span class="enter-arrow">
          →
        </span>

        <span>
          INGRESAR
        </span>
      `;
    }
  }

  enterButton.onclick =
    submitPassword;

  passwordInput.onkeydown =
    event => {
      if (event.key === 'Enter') {
        submitPassword();
      }
    };

  passwordInput.focus();
}
