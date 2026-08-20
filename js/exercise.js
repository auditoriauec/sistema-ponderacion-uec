/* =========================================================
   11. MÓDULO: NUEVO EJERCICIO
   La captura usa la misma metodología administrada en Catálogo.
   ========================================================= */
function exerciseEscapeHtml(value=''){
  return String(value)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function exerciseEscapeAttr(value=''){
  return exerciseEscapeHtml(value);
}

function exerciseFormatPoints(value){
  const number=Number(value)||0;
  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(2).replace(/0+$/,'').replace(/\.$/,'');
}

function exerciseChildrenPoints(item){
  return (item.children||[])
    .reduce((sum,child)=>sum+(Number(child.points)||0),0);
}

function newExercise(){
  if(typeof getMethodologyConfig!=='function'||typeof calc!=='function'||typeof blankExercise!=='function'){
    $('#app').innerHTML=layout(
      '<div class="empty">No fue posible cargar el modelo de ponderación. Revisa que <b>js/model.js</b> esté actualizado.</div>',
      'Nuevo ejercicio de ponderación',
      'No se pudo inicializar el formulario.'
    );
    bindNav();
    return;
  }

  const cats=store.get('catalogs',{});
  const ents=cats[state.year]||[];
  if(!state.current||state.current.year!==state.year) state.current=blankExercise();
  const x=state.current;
  const c=calc(x);
  const methodology=getMethodologyConfig();
  const risk=methodology.components.find(component=>component.key==='risk');
  const control=methodology.components.find(component=>component.key==='control');
  const accountability=methodology.components.find(component=>component.key==='accountability');
  const steps=[
    'Criterios mayores',
    risk?.name||'Variables de Riesgo',
    'Solventación',
    control?.name||'Variables de Control y Transparencia',
    accountability?.name||'Variable de Rendición de Cuentas',
    'Resultado'
  ];

  const content=`
    <div class="wizard">
      ${steps.map((label,index)=>`<div class="step ${state.step===index+1?'active':''}" data-n="${index+1}">${exerciseEscapeHtml(label)}</div>`).join('')}
    </div>
    <div class="card" style="margin-bottom:14px">
      <div class="fields">
        <div class="field">
          <label>Ejercicio fiscal</label>
          <select id="newYear">${years().map(year=>`<option ${year===state.year?'selected':''}>${year}</option>`).join('')}</select>
        </div>
        <div class="field">
          <label>Ente fiscalizado</label>
          <select id="entity">
            <option value="">Seleccionar ente…</option>
            ${ents.map(entity=>`<option ${entity.name===x.entity?'selected':''}>${exerciseEscapeHtml(entity.name)}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>
    ${!ents.length
      ?`<div class="empty">Primero carga el catálogo de entes para ${state.year} desde el módulo Catálogo.</div>`
      :`<div class="formgrid">
          <div class="form-main">${stepHtml(x,methodology)}</div>
          <aside class="card resultcard">
            <div class="section-title">Resultado actual</div>
            <div class="bigscore">${c.score.toFixed(2)}</div>
            <div>/ 100</div>
            <hr style="border:0;border-top:1px solid var(--border);margin:18px 0">
            <small>Base aplicable</small>
            <h3>${exerciseFormatPoints(c.base)} pts</h3>
            <p class="${c.majorOk?'status-ok':'status-bad'}">${c.result}</p>
            <div class="progress"><div style="width:${Math.min(100,c.score)}%"></div></div>
          </aside>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:14px">
          <button class="btn" id="prev">Anterior</button>
          <div>
            <button class="btn" id="draft">Guardar borrador</button>
            <button class="btn primary" id="next">${state.step===6?'Finalizar ejercicio':'Siguiente →'}</button>
          </div>
        </div>`}`;

  $('#app').innerHTML=layout(content,'Nuevo ejercicio de ponderación','Capture las variables para calcular la ponderación.');
  bindNav();
  bindNew(ents);
}

function chk(id,label,value,field=''){
  return `<label><input type="checkbox" id="${id}" ${field?`data-method-field="${exerciseEscapeAttr(field)}"`:''} ${value?'checked':''}> ${exerciseEscapeHtml(label)}</label>`;
}

function methodFieldId(path){
  return 'mf_'+String(path).replace(/[^a-z0-9]+/gi,'_');
}

function exerciseMethodItem(item,x){
  if(Array.isArray(item.children)){
    return `<div class="exercise-method-parent">
      <div class="exercise-method-parent-title">
        <b>${exerciseEscapeHtml(item.label)}</b>
        <span>${exerciseFormatPoints(exerciseChildrenPoints(item))} pts</span>
      </div>
      <div class="fields">
        ${item.children.map(child=>exerciseMethodItem(child,x)).join('')}
      </div>
    </div>`;
  }
  if(item.type!=='checkbox'||!item.field) return '';
  return `<div class="toggle">${chk(methodFieldId(item.field),`${item.label} · ${exerciseFormatPoints(item.points)} pts`,Boolean(pathValue(x,item.field)),item.field)}</div>`;
}

function exerciseMethodGroup(group,x){
  if(group.requiresWork&&!x.work){
    return `<div class="exercise-method-group disabled-method-group">
      <div class="section-title">${exerciseEscapeHtml(group.name)} · ${exerciseFormatPoints(methodologyGroupPoints(group))} pts</div>
      <p class="subtitle">No aplica para el ente seleccionado.</p>
    </div>`;
  }
  return `<div class="exercise-method-group">
    <div class="section-title">${exerciseEscapeHtml(group.name)} · ${exerciseFormatPoints(methodologyGroupPoints(group))} pts</div>
    ${group.note?`<p class="subtitle">${exerciseEscapeHtml(group.note)}</p>`:''}
    <div class="fields">${(group.items||[]).map(item=>exerciseMethodItem(item,x)).join('')}</div>
  </div>`;
}

function stepHtml(x,methodology=getMethodologyConfig()){
  const risk=methodology.components.find(component=>component.key==='risk');
  const control=methodology.components.find(component=>component.key==='control');
  const accountability=methodology.components.find(component=>component.key==='accountability');

  if(state.step===1){
    return `<div class="card">
      <div class="section-title">Paso 1 de 6 · Criterios mayores</div>
      <div class="fields">
        ${(methodology.majors||[]).map(major=>`<div class="toggle">
          <h4>${exerciseEscapeHtml(major.label)}</h4>
          ${chk(major.key,'Sí, cumple',Boolean(pathValue(x,major.key)),major.key)}
        </div>`).join('')}
      </div>
    </div>`;
  }

  if(state.step===2){
    const groups=(risk?.groups||[]).filter(group=>!methodologyItems(group).some(item=>item.type==='ratio'));
    return `<div class="card">
      <div class="section-title">Paso 2 de 6 · ${exerciseEscapeHtml(risk?.name||'Variables de Riesgo')}</div>
      ${groups.map(group=>exerciseMethodGroup(group,x)).join('')}
    </div>`;
  }

  if(state.step===3){
    const ratioGroups=(risk?.groups||[]).filter(group=>methodologyItems(group).some(item=>item.type==='ratio'));
    return `<div class="card">
      <div class="section-title">Paso 3 de 6 · Solventación</div>
      ${ratioGroups.map(group=>`<div class="exercise-method-group">
        <div class="section-title">${exerciseEscapeHtml(group.name)} · ${exerciseFormatPoints(methodologyGroupPoints(group))} pts</div>
        ${(group.items||[]).map(item=>`<p><b>${exerciseEscapeHtml(item.label)}</b> · ${exerciseFormatPoints(item.points)} pts</p>`).join('')}
      </div>`).join('')}
      <div class="fields">
        ${numfield('countF','Observaciones fincadas',x.solv.countF)}
        ${numfield('countS','Observaciones solventadas',x.solv.countS)}
        ${numfield('inF','Importe fincado · Ingreso',x.solv.inF)}
        ${numfield('inS','Importe solventado · Ingreso',x.solv.inS)}
        ${numfield('outF','Importe fincado · Egreso',x.solv.outF)}
        ${numfield('outS','Importe solventado · Egreso',x.solv.outS)}
      </div>
    </div>`;
  }

  if(state.step===4){
    return `<div class="card">
      <div class="section-title">Paso 4 de 6 · ${exerciseEscapeHtml(control?.name||'Variables de Control y Transparencia')}</div>
      ${(control?.groups||[]).map(group=>exerciseMethodGroup(group,x)).join('')}
    </div>`;
  }

  if(state.step===5){
    return `<div class="card">
      <div class="section-title">Paso 5 de 6 · ${exerciseEscapeHtml(accountability?.name||'Variable de Rendición de Cuentas')}</div>
      ${(accountability?.groups||[]).map(group=>exerciseMethodGroup(group,x)).join('')}
    </div>`;
  }

  const c=calc(x);
  return `<div class="card">
    <div class="section-title">Paso 6 de 6 · Resultado</div>
    <div class="grid2">
      <div>
        <p><b>Ente:</b> ${exerciseEscapeHtml(x.entity||'—')}</p>
        <p><b>Base aplicable:</b> ${exerciseFormatPoints(c.base)} puntos</p>
        <p><b>Puntaje bruto:</b> ${c.raw.toFixed(2)}</p>
        <p><b>Puntaje final:</b> ${c.score.toFixed(2)} / 100</p>
      </div>
      <div>
        <div class="bigscore">${c.score.toFixed(2)}</div>
        <div class="${c.result==='APROBADA'?'status-ok':'status-bad'}">${c.result}</div>
      </div>
    </div>
  </div>`;
}

function numfield(id,label,value){
  return `<div class="field"><label>${label}</label><input type="number" min="0" step="0.01" id="${id}" value="${value||0}"></div>`;
}

function setPathValue(object,path,value){
  const keys=String(path).split('.');
  let target=object;
  for(let i=0;i<keys.length-1;i++) target=target[keys[i]];
  target[keys[keys.length-1]]=value;
}

function bindNew(ents){
  const x=state.current;
  $('#newYear').onchange=event=>{
    state.year=+event.target.value;
    state.current=blankExercise();
    render();
  };
  $('#entity').onchange=event=>{
    x.entity=event.target.value;
    const ent=ents.find(item=>item.name===x.entity);
    if(ent&&ent.work!==null) x.work=ent.work;
    newExercise();
  };
  if(!ents.length) return;

  $$('[data-method-field]').forEach(input=>{
    input.onchange=()=>{
      setPathValue(x,input.dataset.methodField,input.checked);
      newExercise();
    };
  });

  Object.keys(x.solv).forEach(key=>{
    const input=$('#'+key);
    if(input) input.oninput=()=>{x.solv[key]=+input.value||0;};
  });

  $('#prev').onclick=()=>{state.step=Math.max(1,state.step-1);newExercise();};
  $('#draft').onclick=()=>saveExercise(false);
  $('#next').onclick=()=>{
    Object.keys(x.solv).forEach(key=>{
      const input=$('#'+key);
      if(input) x.solv[key]=+input.value||0;
    });
    if(state.step<6){state.step++;newExercise();}
    else saveExercise(true);
  };
}

/* =========================================================
   12. GUARDADO DE BORRADORES Y EJERCICIOS FINALIZADOS
   ========================================================= */
async function saveExercise(final){
  const x=state.current;
  if(!x.entity) return alert('Selecciona un ente del catálogo.');
  const all=clone(store.get('exercises',[]));
  const idx=all.findIndex(item=>item.year===x.year&&item.entity===x.entity);
  const c=calc(x);
  const saved={...clone(x),...c,status:final?'Finalizado':'Borrador',updatedAt:new Date().toISOString()};
  if(idx>=0) all[idx]=saved; else all.push(saved);
  try{
    await store.set('exercises',all);
    if(final){
      alert('Ejercicio finalizado y guardado en Cloudflare D1.');
      state.page='results';state.current=null;state.step=1;render();
    }else alert('Borrador guardado en Cloudflare D1.');
  }catch(error){
    alert('No se pudo guardar en D1: '+error.message);
  }
}

