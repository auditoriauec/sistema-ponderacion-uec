/* =========================================================
   13. CIERRE DE SESIÓN
   El botón Cerrar se enlaza desde bindNav() y elimina
   únicamente la sesión visual del navegador.
   ========================================================= */

/* =========================================================
   14. RENDERIZADO E INICIALIZACIÓN
   ========================================================= */
function render(){if(!sessionStorage.getItem('in'))return login();
if(state.page==='project')project();
if(state.page==='summary')summary();
if(state.page==='catalog')catalog();
if(state.page==='results')results();
if(state.page==='new')newExercise()}
async function init(){
  try{
    const r=await fetch('/api/state',{headers:{'cache-control':'no-cache'}});

    const payload=await r.json().catch(()=>({}));

    if(!r.ok||!payload.ok)throw new Error(payload.error||'No fue posible consultar la base D1.');

    Object.assign(dbCache,payload.data||{});

    render();

  }catch(e){
    document.querySelector('#app').innerHTML=`<div class="login">
<section class="login-card">
<div class="login-panel">
<img src="assets/logo-uec.png">
<h1>SISTEMA DE<br>
<span>PONDERACIÓN</span>
<br>DE CUENTAS PÚBLICAS</h1>
<p>No fue posible conectar con la base institucional.</p>
<div class="insight" style="max-width:430px;margin:22px auto;text-align:left">
<b>Revisa el binding D1:</b> debe llamarse <b>DB</b> y apuntar a <b>ponderacion-uec-db</b>.<br>
<small>${e.message}</small>
</div>
<button class="enter" onclick="location.reload()">REINTENTAR</button>
</div>
</section>
<section class="login-empty">
</section>
</div>`;

  }
}
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
init();
