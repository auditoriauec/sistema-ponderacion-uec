/* =========================================================
   11. MÓDULO: NUEVO EJERCICIO
   Wizard de captura en 6 pasos.
   ========================================================= */
function newExercise(){let cats=store.get('catalogs',{}), ents=cats[state.year]||[];
if(!state.current||state.current.year!==state.year)state.current=blankExercise();
let x=state.current,c=calc(x);
let content=`<div class="wizard">${['Criterios mayores','Variables de Riesgo','Solventación','Control y Transparencia','Rendición de Cuentas','Resultado'].map((s,i)=>`<div class="step ${state.step===i+1?'active':''}" data-n="${i+1}">${s}</div>`).join('')}</div>
<div class="card" style="margin-bottom:14px">
<div class="fields">
<div class="field">
<label>Ejercicio fiscal</label>
<select id="newYear">${years().map(y=>`<option ${y===state.year?'selected':''}>${y}</option>`).join('')}</select>
</div>
<div class="field">
<label>Ente fiscalizado</label>
<select id="entity">
<option value="">Seleccionar ente…</option>${ents.map(e=>`<option ${e.name===x.entity?'selected':''}>${e.name}</option>`).join('')}</select>
</div>
</div>
</div>${!ents.length?`<div class="empty">Primero carga el catálogo de entes para ${state.year} desde el módulo Catálogo.</div>`:`<div class="formgrid"><div class="form-main">${stepHtml(x)}</div><aside class="card resultcard"><div class="section-title">Resultado actual</div><div class="bigscore">${c.score.toFixed(2)}</div><div>/ 100</div><hr style="border:0;border-top:1px solid var(--border);margin:18px 0"><small>Base aplicable</small><h3>${c.base} pts</h3><p class="${c.majorOk?'status-ok':'status-bad'}">${c.result}</p><div class="progress"><div style="width:${Math.min(100,c.score)}%"></div></div></aside></div><div style="display:flex;justify-content:space-between;margin-top:14px"><button class="btn" id="prev">Anterior</button><div><button class="btn" id="draft">Guardar borrador</button> <button class="btn primary" id="next">${state.step===6?'Finalizar ejercicio':'Siguiente →'}</button></div></div>`}`;
$('#app').innerHTML=layout(content,'Nuevo ejercicio de ponderación','Capture las variables para calcular la ponderación.');
bindNav();
bindNew(ents)}
function chk(id,label,v){return `<label>
<input type="checkbox" id="${id}" ${v?'checked':''}> ${label}</label>`}
function stepHtml(x){if(state.step===1)return `<div class="card">
<div class="section-title">Paso 1 de 6 · Criterios mayores</div>
<div class="fields">
<div class="toggle">
<h4>Entrega de Cuenta Pública en tiempo</h4>${chk('major1','Sí, cumple',x.major1)}</div>
<div class="toggle">
<h4>Sistema Contable Armonizado</h4>${chk('major2','Sí, cumple',x.major2)}</div>
</div>
</div>`;
if(state.step===2)return `<div class="card">
<div class="section-title">Paso 2 de 6 · Variables de Riesgo</div>
<div class="fields">${[['doc','Documentación cumple transparencia y veracidad · 1 pt'],['elements','Incluye todos los elementos requeridos · 1 pt'],['inventory','Conciliación de inventarios · 0.2 pts'],['budget','Modificaciones presupuestales · 0.4 pts'],['manual','Manual de remuneraciones · 1.6 pts'],['banks','Conciliaciones bancarias · 1.6 pts'],['suppliers','Relación de proveedores · 0.2 pts'],['report','Informe de Avance de Gestión Financiera · 1 pt'],['sevac','SEvAC anual · 7 pts'],['proc','Procedimiento de adquisición con evidencias · 1 pt'],['annual','Programa anual de adquisiciones · 4 pts'],['worksprogram','Programa Anual de Obras Públicas · 2.5 pts'],['worksfiles','Expedientes unitarios de obra · 1 pt'],['paidnot','Obras pagadas NO ejecutadas · 2.5 pts']].map(([k,l])=>`<div class="toggle">${chk('r_'+k,l,x.risk[k])}</div>`).join('')}</div>
<div class="section-title" style="margin-top:18px">Reincidencia · 10 pts</div>
<div class="fields">${['Sistema contable armonizado · 1 pt','Programa anual de adquisiciones · 2 pts','Manual de remuneraciones y tabulador · 3 pts','Excepción a licitación pública · 1 pt','Inventario de bienes muebles e inmuebles · 3 pts'].map((l,i)=>`<div class="toggle">${chk('re_'+i,l,x.risk.reinc[i])}</div>`).join('')}</div>
</div>`;
if(state.step===3)return `<div class="card">
<div class="section-title">Paso 3 de 6 · Solventación</div>
<div class="fields">${numfield('countF','Observaciones fincadas',x.solv.countF)}${numfield('countS','Observaciones solventadas',x.solv.countS)}${numfield('inF','Importe fincado · Ingreso',x.solv.inF)}${numfield('inS','Importe solventado · Ingreso',x.solv.inS)}${numfield('outF','Importe fincado · Egreso',x.solv.outF)}${numfield('outS','Importe solventado · Egreso',x.solv.outS)}</div>
</div>`;
if(state.step===4)return `<div class="card">
<div class="section-title">Paso 4 de 6 · Control y Transparencia</div>
<p>
<b>Ley de Disciplina Financiera · 3 pts</b>
</p>
<div class="choice">${x.ctrl.ldf.map((v,i)=>chk('ldf_'+i,`T${i+1}`,v)).join('')}</div>
<p>
<b>Cuenta Pública en portales · 3 pts</b>
</p>
<div class="choice">${x.ctrl.portal.map((v,i)=>chk('po_'+i,`T${i+1}`,v)).join('')}</div>
</div>`;
if(state.step===5)return `<div class="card">
<div class="section-title">Paso 5 de 6 · Rendición de Cuentas</div>
<div class="fields">${['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((m,i)=>`<div class="toggle">${chk('mo_'+i,`${m} · 0.75 pts`,x.months[i])}</div>`).join('')}</div>
</div>`;
let c=calc(x);
return `<div class="card">
<div class="section-title">Paso 6 de 6 · Resultado</div>
<div class="grid2">
<div>
<p>
<b>Ente:</b> ${x.entity||'—'}</p>
<p>
<b>Base aplicable:</b> ${c.base} puntos</p>
<p>
<b>Puntaje bruto:</b> ${c.raw.toFixed(2)}</p>
<p>
<b>Puntaje final:</b> ${c.score.toFixed(2)} / 100</p>
</div>
<div>
<div class="bigscore">${c.score.toFixed(2)}</div>
<div class="${c.result==='APROBADA'?'status-ok':'status-bad'}">${c.result}</div>
</div>
</div>
</div>`}
function numfield(id,label,v){return `<div class="field">
<label>${label}</label>
<input type="number" min="0" step="0.01" id="${id}" value="${v||0}">
</div>`}
function bindNew(ents){let x=state.current;
$('#newYear').onchange=e=>{state.year=+e.target.value;
state.current=blankExercise();
render()};
$('#entity').onchange=e=>{x.entity=e.target.value;
let ent=ents.find(z=>z.name===x.entity);
if(ent&&ent.work!==null)x.work=ent.work;
newExercise()};
if(!ents.length)return;
['major1','major2'].forEach(k=>{let el=$('#'+k);
if(el)el.onchange=()=>{x[k]=el.checked;
newExercise()}});
Object.keys(x.risk).filter(k=>k!=='reinc').forEach(k=>{let el=$('#r_'+k);
if(el)el.onchange=()=>{x.risk[k]=el.checked;
newExercise()}});
x.risk.reinc.forEach((_,i)=>{let el=$('#re_'+i);
if(el)el.onchange=()=>{x.risk.reinc[i]=el.checked;
newExercise()}});
Object.keys(x.solv).forEach(k=>{let el=$('#'+k);
if(el)el.oninput=()=>{x.solv[k]=+el.value||0}});
x.ctrl.ldf.forEach((_,i)=>{let el=$('#ldf_'+i);
if(el)el.onchange=()=>{x.ctrl.ldf[i]=el.checked;
newExercise()}});
x.ctrl.portal.forEach((_,i)=>{let el=$('#po_'+i);
if(el)el.onchange=()=>{x.ctrl.portal[i]=el.checked;
newExercise()}});
x.months.forEach((_,i)=>{let el=$('#mo_'+i);
if(el)el.onchange=()=>{x.months[i]=el.checked;
newExercise()}});
$('#prev').onclick=()=>{state.step=Math.max(1,state.step-1);
newExercise()};
$('#draft').onclick=()=>saveExercise(false);
$('#next').onclick=()=>{Object.keys(x.solv).forEach(k=>{let el=$('#'+k);
if(el)x.solv[k]=+el.value||0});
if(state.step<6){state.step++;
newExercise()}else saveExercise(true)}}

/* =========================================================
   12. GUARDADO DE BORRADORES Y EJERCICIOS FINALIZADOS
   ========================================================= */
async function saveExercise(final){let x=state.current;
if(!x.entity)return alert('Selecciona un ente del catálogo.');
let all=clone(store.get('exercises',[])),idx=all.findIndex(z=>z.year===x.year&&z.entity===x.entity),c=calc(x),saved={...clone(x),...c,status:final?'Finalizado':'Borrador',updatedAt:new Date().toISOString()};
if(idx>=0)all[idx]=saved;
else all.push(saved);
try{await store.set('exercises',all);
if(final){alert('Ejercicio finalizado y guardado en Cloudflare D1.');
state.page='results';
state.current=null;
state.step=1;
render()}else alert('Borrador guardado en Cloudflare D1.')}catch(e){alert('No se pudo guardar en D1: '+e.message)}}

