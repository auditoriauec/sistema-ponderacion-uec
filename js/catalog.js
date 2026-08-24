/* =========================================================
   8. MÓDULO: CATÁLOGO DE ENTES
   - Importa el PAA desde PDF.
   - Si el PDF es una imagen, detecta las páginas tabulares y
     usa OCR en el navegador.
   - Permite revisar, editar y eliminar entes guardados.
   ========================================================= */
let catalogSection = 'entities';
let catalogMethodDraft = null;

const CATALOG_TYPES = [
  'Poder Ejecutivo',
  'Poder Legislativo',
  'Poder Judicial',
  'Municipal',
  'Organismo Operador Municipal',
  'Descentralizado Estatal',
  'Descentralizado Municipal',
  'Desconcentrado',
  'Autónomo',
  'Otro'
];

function makeEntityId(){
  if(globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return 'ent-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
}

function normalizeCatalogRecord(record={}){
  return {
    id: record.id || makeEntityId(),
    name: String(record.name || '').trim(),
    type: String(record.type || '').trim(),
    compliance: record.compliance === true,
    work: record.work === true,
    performance: record.performance === true
  };
}

function typeOptions(selected=''){
  const options = selected && !CATALOG_TYPES.includes(selected)
    ? [selected, ...CATALOG_TYPES]
    : CATALOG_TYPES;

  return '<option value="">Seleccionar…</option>' + options.map(type =>
    `<option value="${escapeHtmlAttr(type)}" ${type===selected?'selected':''}>${escapeHtml(type)}</option>`
  ).join('');
}

function yesNoBadge(value){
  return value === true
    ? '<span class="audit-yes">Sí</span>'
    : '<span class="audit-no">No</span>';
}

function catalog(){
  if(catalogSection==='methodology'){
    methodologyCatalog();
    return;
  }

  const catalogs = store.get('catalogs',{});
  const arr = (catalogs[state.year] || []).map(normalizeCatalogRecord);
  const exercises = store.get('exercises',[]).filter(x=>x.year===state.year);
  const finalizedExercises = exercises.filter(x=>x.status==='Finalizado');

  let c = `
    ${catalogTabsHtml()}
    <div class="toolbar catalog-toolbar">
      <div class="catalog-toolbar-actions">
        <button class="btn primary" id="uploadBtn">＋ Cargar Programa Anual de Auditorías</button>
        <button class="btn" id="manualEntityBtn">＋ Agregar ente manualmente</button>
      </div>
    </div>

    <div class="catalog-kpis">
      <div class="card smallk">
<b>${arr.length}</b>Entes en catálogo</div>
      <div class="card smallk">
<b>${finalizedExercises.length}</b>Ejercicios realizados</div>
      <div class="card smallk">
<b>${Math.max(0,arr.length-finalizedExercises.length)}</b>Pendientes de evaluar</div>
      <div class="card smallk">
<b>${store.get('programs',[]).filter(p=>p.year===state.year).length}</b>Programas cargados</div>
    </div>`;

  if(arr.length){
    const rows = arr.map((entity,index)=>{
      const done = exercises.some(x=>x.entity===entity.name&&x.status==='Finalizado')
        ? '<span class="status-ok">● Realizado</span>'
        : 'Pendiente';

      return `
        <tr>
          <td class="catalog-entity-cell">${escapeHtml(entity.name)}</td>
          <td>${escapeHtml(entity.type || '—')}</td>
          <td>${yesNoBadge(entity.compliance)}</td>
          <td>${yesNoBadge(entity.work)}</td>
          <td>${yesNoBadge(entity.performance)}</td>
          <td>${done}</td>
          <td class="catalog-row-actions">
            <button class="btn mini-btn edit-catalog-entity" data-index="${index}">Editar</button>
            <button class="btn mini-btn danger-btn delete-catalog-entity" data-index="${index}">Eliminar</button>
          </td>
        </tr>`;
    }).join('');

    c += `
      <div class="tablewrap">
        <table class="table catalog-main-table">
          <thead>
            <tr>
              <th>Ente fiscalizado</th>
              <th>Tipo de ente</th>
              <th>Cumplimiento</th>
              <th>Obra pública</th>
              <th>Desempeño</th>
              <th>Ejercicio de ponderación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }else{
    c += `<div class="empty">No hay entes cargados para ${state.year}.<br>
<br>Carga el PDF del Programa Anual de Auditorías o agrega un ente manualmente.</div>`;
  }

  $('#app').innerHTML = layout(
    c,
    'Catálogo de Entes Fiscalizados',
    'Administra los entes incluidos en el Programa Anual de Auditorías de cada ejercicio.'
  );

  bindNav();
  bindCatalogTabs();
  $('#uploadBtn').onclick = uploadModal;
  $('#manualEntityBtn').onclick = () => entityEditorModal();

  $$('.edit-catalog-entity').forEach(btn=>{
    btn.onclick = () => entityEditorModal(+btn.dataset.index);
  });

  $$('.delete-catalog-entity').forEach(btn=>{
    btn.onclick = () => deleteCatalogEntity(+btn.dataset.index);
  });
}

async function deleteCatalogEntity(index){
  const catalogs = clone(store.get('catalogs',{}));
  const arr = (catalogs[state.year] || []).map(normalizeCatalogRecord);
  const entity = arr[index];
  if(!entity) return;

  const linked = store.get('exercises',[]).filter(x=>x.year===state.year && x.entity===entity.name);
  if(linked.length){
    alert(`No se puede eliminar “${entity.name}” porque tiene ${linked.length} ejercicio(s) relacionado(s). Puedes editar el ente sin perder esa información.`);
    return;
  }

  if(!confirm(`¿Eliminar del catálogo a “${entity.name}”?`)) return;

  arr.splice(index,1);
  catalogs[state.year] = arr;

  try{
    await store.set('catalogs',catalogs);
    catalog();
  }catch(error){
    alert('No se pudo eliminar el ente: '+error.message);
  }
}

function entityEditorModal(index=null){
  const catalogs = clone(store.get('catalogs',{}));
  const arr = (catalogs[state.year] || []).map(normalizeCatalogRecord);
  const original = index===null ? null : arr[index];
  const entity = original || normalizeCatalogRecord({});

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modalbox catalog-editor-modal">
      <div class="modal-head">
        <div>
          <div class="section-title">${original?'Editar ente fiscalizado':'Agregar ente fiscalizado'}</div>
          <p class="subtitle">Los cambios se guardan en el catálogo del ejercicio ${state.year}.</p>
        </div>
        <button class="modal-close" id="entityClose" aria-label="Cerrar">×</button>
      </div>

      <div class="entity-editor-grid">
        <div class="field entity-name-field">
          <label>Nombre del ente fiscalizado</label>
          <input id="entityEditName" value="${escapeHtmlAttr(entity.name)}" placeholder="Nombre oficial del ente">
        </div>
        <div class="field">
          <label>Tipo de ente</label>
          <select id="entityEditType">${typeOptions(entity.type)}</select>
        </div>
      </div>

      <div class="audit-flags editor-audit-flags">
        <label>
<input type="checkbox" id="entityCompliance" ${entity.compliance?'checked':''}> Cumplimiento y Gestión Financiera</label>
        <label>
<input type="checkbox" id="entityWork" ${entity.work?'checked':''}> Obra Pública</label>
        <label>
<input type="checkbox" id="entityPerformance" ${entity.performance?'checked':''}> Desempeño</label>
      </div>

      <div id="entityEditorMessage" class="catalog-message info">
        Verifica el nombre oficial y las auditorías aplicables antes de guardar.
      </div>

      <div class="modal-actions">
        <button class="btn" id="entityCancel">Cancelar</button>
        <button class="btn primary" id="entitySave">Guardar cambios</button>
      </div>
    </div>`;

  document.body.appendChild(modal);
  const close = () => modal.remove();
  $('#entityClose').onclick = close;
  $('#entityCancel').onclick = close;

  $('#entitySave').onclick = async ()=>{
    const name = $('#entityEditName').value.trim();
    const message = $('#entityEditorMessage');

    if(!name){
      message.className='catalog-message warning';
      message.textContent='Escribe el nombre del ente fiscalizado.';
      return;
    }

    const key = normalizeEntityKey(name);
    const duplicateIndex = arr.findIndex((item,i)=>i!==index && normalizeEntityKey(item.name)===key);
    if(duplicateIndex>=0){
      message.className='catalog-message warning';
      message.textContent='Ya existe un ente con ese nombre en el catálogo.';
      return;
    }

    const updated = {
      id: entity.id,
      name,
      type: $('#entityEditType').value,
      compliance: $('#entityCompliance').checked,
      work: $('#entityWork').checked,
      performance: $('#entityPerformance').checked
    };

    if(index===null) arr.push(updated);
    else arr[index]=updated;

    catalogs[state.year]=arr;

    const exercises = clone(store.get('exercises',[]));
    if(original && original.name!==updated.name){
      exercises.forEach(ex=>{
        if(ex.year===state.year && ex.entity===original.name) ex.entity=updated.name;
      });
    }

    const btn = $('#entitySave');
    btn.disabled=true;
    btn.textContent='Guardando…';

    try{
      await store.set('catalogs',catalogs);
      if(original && original.name!==updated.name) await store.set('exercises',exercises);
      close();
      catalog();
    }catch(error){
      btn.disabled=false;
      btn.textContent='Guardar cambios';
      message.className='catalog-message error';
      message.textContent='No se pudo guardar en D1: '+error.message;
    }
  };
}

function uploadModal(){
  const modal = document.createElement('div');
  modal.className = 'modal';

  modal.innerHTML = `
    <div class="modalbox catalog-upload-modal">
      <div class="modal-head">
        <div>
          <div class="section-title">Incorporar Programa Anual de Auditorías</div>
          <p class="subtitle">Carga el PDF, revisa la información detectada y confirma únicamente los entes que deban incorporarse.</p>
        </div>
        <button class="modal-close" id="closeM" aria-label="Cerrar">×</button>
      </div>

      <div class="fields catalog-upload-fields">
        <div class="field">
          <label>Ejercicio al que corresponde</label>
          <select id="upYear">
            ${years().map(y=>`<option ${y===state.year?'selected':''}>${y}</option>`).join('')}
          </select>
        </div>

        <div class="field">
          <label>Programa Anual de Auditorías · PDF</label>
          <input type="file" id="pdfFile" accept="application/pdf">
        </div>
      </div>

      <div class="pdf-process-box">
        <div>
          <b>Extracción automática de la tabla</b>
          <p>Primero se intenta leer el texto del PDF. Si la tabla está escaneada, el sistema detecta las páginas tabulares y aplica OCR en tu navegador.</p>
        </div>
        <button class="btn gold" id="extract">Analizar PDF</button>
      </div>

      <div id="pdfStatus" class="catalog-message info">
        Selecciona el Programa Anual de Auditorías y presiona <b>Analizar PDF</b>.
      </div>

      <div id="ocrProgressWrap" class="ocr-progress-wrap" hidden>
        <div class="ocr-progress-track">
<div id="ocrProgressBar">
</div>
</div>
        <small id="ocrProgressText">Preparando análisis…</small>
      </div>

      <section id="previewSection" class="catalog-preview" hidden>
        <div class="catalog-preview-head">
          <div>
            <div class="section-title">Vista previa del catálogo</div>
            <div class="subtitle">
<span id="candidateCount">0</span> entes seleccionados · revisa los datos antes de guardar.</div>
          </div>
          <div class="preview-actions">
            <button class="btn" id="selectAll">Seleccionar todos</button>
            <button class="btn" id="selectNone">Deseleccionar todos</button>
            <button class="btn" id="addEntity">＋ Agregar ente</button>
          </div>
        </div>

        <div class="catalog-preview-table">
          <table class="table">
            <thead>
              <tr>
                <th class="catalog-check-col">Incluir</th>
                <th>Ente fiscalizado</th>
                <th>Tipo de ente</th>
                <th>Cumplimiento</th>
                <th>Obra pública</th>
                <th>Desempeño</th>
                <th class="catalog-action-col">Acción</th>
              </tr>
            </thead>
            <tbody id="candidateBody">
</tbody>
          </table>
        </div>
      </section>

      <div class="modal-actions">
        <button class="btn" id="cancelM">Cancelar</button>
        <button class="btn primary" id="saveCat" disabled>Guardar seleccionados</button>
      </div>
    </div>`;

  document.body.appendChild(modal);

  const status = $('#pdfStatus');
  const preview = $('#previewSection');
  const tbody = $('#candidateBody');
  const saveBtn = $('#saveCat');
  const progressWrap = $('#ocrProgressWrap');
  const progressBar = $('#ocrProgressBar');
  const progressText = $('#ocrProgressText');

  const setMessage = (type, html) => {
    status.className = `catalog-message ${type}`;
    status.innerHTML = html;
  };

  const setProgress = (value,text='')=>{
    progressWrap.hidden=false;
    const pct=Math.max(0,Math.min(100,Math.round(value)));
    progressBar.style.width=pct+'%';
    progressText.textContent=text || `${pct}%`;
  };

  const closeModal = () => modal.remove();
  $('#closeM').onclick = closeModal;
  $('#cancelM').onclick = closeModal;

  function refreshCandidateCount(){
    const rows = [...tbody.querySelectorAll('tr')];
    const selected = rows.filter(row => row.querySelector('.candidate-include')?.checked);
    $('#candidateCount').textContent = selected.length;
    saveBtn.disabled = selected.length === 0;
  }

  function appendCandidate(data={}){
    const candidate = normalizeCatalogRecord(data);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="catalog-check-col">
        <input class="candidate-include" type="checkbox" ${data.include===false?'':'checked'} aria-label="Incluir ente">
      </td>
      <td>
        <input class="candidate-name" type="text" value="${escapeHtmlAttr(candidate.name)}" placeholder="Nombre del ente fiscalizado">
      </td>
      <td>
        <select class="candidate-type">${typeOptions(candidate.type)}</select>
      </td>
      <td class="candidate-flag">
<input class="candidate-compliance" type="checkbox" ${candidate.compliance?'checked':''}>
</td>
      <td class="candidate-flag">
<input class="candidate-work" type="checkbox" ${candidate.work?'checked':''}>
</td>
      <td class="candidate-flag">
<input class="candidate-performance" type="checkbox" ${candidate.performance?'checked':''}>
</td>
      <td class="catalog-action-col">
        <button class="icon-btn danger candidate-delete" title="Eliminar" aria-label="Eliminar">×</button>
      </td>`;

    tbody.appendChild(tr);
    tr.querySelector('.candidate-include').onchange = refreshCandidateCount;
    tr.querySelector('.candidate-name').oninput = refreshCandidateCount;
    tr.querySelector('.candidate-delete').onclick = () => {
      tr.remove();
      refreshCandidateCount();
    };
  }

  function renderCandidates(items){
    tbody.innerHTML = '';
    items.forEach(item => appendCandidate(item));
    preview.hidden = false;
    refreshCandidateCount();
  }

  $('#addEntity').onclick = () => {
    appendCandidate({});
    preview.hidden = false;
    const last = tbody.querySelector('tr:last-child .candidate-name');
    if(last) last.focus();
  };

  $('#selectAll').onclick=()=>{
    $$('#candidateBody .candidate-include').forEach(cb=>cb.checked=true);
    refreshCandidateCount();
  };

  $('#selectNone').onclick=()=>{
    $$('#candidateBody .candidate-include').forEach(cb=>cb.checked=false);
    refreshCandidateCount();
  };

  $('#extract').onclick = async () => {
    const file = $('#pdfFile').files[0];

    if(!file){
      setMessage('warning','Selecciona primero un archivo PDF del Programa Anual de Auditorías.');
      return;
    }

    if(file.type && file.type !== 'application/pdf'){
      setMessage('warning','El archivo seleccionado no parece ser un PDF.');
      return;
    }

    const extractBtn = $('#extract');
    extractBtn.disabled = true;
    extractBtn.textContent = 'Analizando…';
    saveBtn.disabled = true;
    preview.hidden = true;
    progressWrap.hidden=false;
    setProgress(3,'Leyendo PDF…');

    setMessage('loading',`Procesando <b>${escapeHtml(file.name)}</b>… El OCR puede tardar un poco si el documento está escaneado.`);

    try{
      const result = await extractPaaEntities(file,(pct,msg)=>setProgress(pct,msg));
      const candidates = result.entities;

      if(!candidates.length){
        renderCandidates([]);
        setMessage(
          'warning',
          'El PDF se pudo analizar, pero no fue posible identificar entes con suficiente seguridad. Puedes usar <b>＋ Agregar ente</b> y capturarlos manualmente sin volver a cargar el archivo.'
        );
      }else{
        renderCandidates(candidates);
        const method = result.usedOcr ? ' mediante OCR' : '';
        setMessage(
          'success',
          `Se identificaron <b>${candidates.length} entes${method}</b>. Revisa nombres, tipo de ente y auditorías antes de guardar.`
        );
      }
      setProgress(100,'Análisis finalizado');
    }catch(error){
      console.error('Error al analizar PDF:', error);
      renderCandidates([]);
      setMessage(
        'error',
        `No fue posible completar el análisis automático: ${escapeHtml(error.message || 'error desconocido')}. Puedes agregar los entes manualmente.`
      );
      setProgress(100,'El análisis terminó con error');
    }finally{
      extractBtn.disabled = false;
      extractBtn.textContent = 'Analizar PDF';
    }
  };

  saveBtn.onclick = async () => {
    const year = +$('#upYear').value;
    const rows = [...tbody.querySelectorAll('tr')];

    const selected = rows
      .filter(row => row.querySelector('.candidate-include')?.checked)
      .map(row => normalizeCatalogRecord({
        name: row.querySelector('.candidate-name')?.value.trim(),
        type: row.querySelector('.candidate-type')?.value || '',
        compliance: row.querySelector('.candidate-compliance')?.checked,
        work: row.querySelector('.candidate-work')?.checked,
        performance: row.querySelector('.candidate-performance')?.checked
      }))
      .filter(item=>item.name);

    const uniqueMap = new Map();
    selected.forEach(item=>uniqueMap.set(normalizeEntityKey(item.name),item));
    const unique = [...uniqueMap.values()];

    if(!unique.length){
      setMessage('warning','Selecciona o agrega al menos un ente antes de guardar.');
      return;
    }

    const catalogs = clone(store.get('catalogs',{}));
    const existing = (catalogs[year] || []).map(normalizeCatalogRecord);
    const existingByKey = new Map(existing.map((item,index)=>[normalizeEntityKey(item.name),{item,index}]));
    let added=0, updated=0;

    unique.forEach(item=>{
      const key=normalizeEntityKey(item.name);
      const hit=existingByKey.get(key);
      if(hit){
        existing[hit.index]={...hit.item,...item,id:hit.item.id};
        updated++;
      }else{
        existing.push(item);
        existingByKey.set(key,{item,index:existing.length-1});
        added++;
      }
    });

    catalogs[year] = existing;

    const file = $('#pdfFile').files[0];
    const programs = clone(store.get('programs',[]));

    if(file){
      const alreadyExists = programs.some(p => p.year===year && p.name===file.name);
      if(!alreadyExists) programs.push({year, name:file.name, date:new Date().toISOString()});
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Guardando…';
    setMessage('loading',`Guardando catálogo en Cloudflare D1… ${added} nuevos y ${updated} existentes por actualizar.`);

    try{
      await store.set('catalogs', catalogs);
      await store.set('programs', programs);
      state.year = year;
      closeModal();
      catalog();
    }catch(error){
      saveBtn.disabled = false;
      saveBtn.textContent = 'Guardar seleccionados';
      setMessage('error',`No se pudo guardar en D1: ${escapeHtml(error.message)}`);
    }
  };
}

/* =========================================================
   8.1 LECTURA DEL PDF + OCR DE TABLAS
   El PDF real de la ASEBCS puede contener páginas escaneadas.
   Se detectan visualmente las tablas antes de invocar OCR.
   ========================================================= */
async function getPdfDocument(file){
  const pdfjs = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
  return pdfjs.getDocument({data: await file.arrayBuffer()}).promise;
}

async function extractPdfPageLines(page){
  const content = await page.getTextContent();
  const rows = [];

  for(const item of content.items){
    const text = (item.str || '').replace(/\s+/g,' ').trim();
    if(!text) continue;
    const x = item.transform?.[4] ?? 0;
    const y = item.transform?.[5] ?? 0;
    let row = rows.find(r => Math.abs(r.y-y) <= 2.6);
    if(!row){
      row={y,items:[]};
      rows.push(row);
    }
    row.items.push({x,text});
  }

  return rows.sort((a,b)=>b.y-a.y).map(row=>
    row.items.sort((a,b)=>a.x-b.x).map(i=>i.text).join(' ').replace(/\s+/g,' ').trim()
  ).filter(Boolean);
}

async function renderPdfPage(page,scale=1.55){
  const viewport=page.getViewport({scale});
  const canvas=document.createElement('canvas');
  canvas.width=Math.ceil(viewport.width);
  canvas.height=Math.ceil(viewport.height);
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  await page.render({canvasContext:ctx,viewport}).promise;
  return canvas;
}

function detectTableGrid(canvas){
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  const w=canvas.width, h=canvas.height;
  const image=ctx.getImageData(0,0,w,h).data;
  const scanLeft=Math.floor(w*.10), scanRight=Math.floor(w*.90);
  const ys=[];

  const darkAt=(x,y)=>{
    const i=(y*w+x)*4;
    return (image[i]+image[i+1]+image[i+2])/3 < 135;
  };

  for(let y=Math.floor(h*.10); y<Math.floor(h*.94); y++){
    let dark=0, samples=0;
    for(let x=scanLeft; x<scanRight; x+=2){
      samples++;
      if(darkAt(x,y)) dark++;
    }
    if(dark/samples>.34) ys.push(y);
  }

  if(!ys.length) return null;

  const lines=[];
  let group=[ys[0]];
  for(let i=1;i<ys.length;i++){
    if(ys[i]-ys[i-1]<=2) group.push(ys[i]);
    else{
      lines.push(Math.round(group.reduce((a,b)=>a+b,0)/group.length));
      group=[ys[i]];
    }
  }
  lines.push(Math.round(group.reduce((a,b)=>a+b,0)/group.length));

  const clusters=[];
  let cluster=[lines[0]];
  for(let i=1;i<lines.length;i++){
    if(lines[i]-lines[i-1] <= h*.065) cluster.push(lines[i]);
    else{
      clusters.push(cluster);
      cluster=[lines[i]];
    }
  }
  clusters.push(cluster);

  const best=clusters.sort((a,b)=>b.length-a.length)[0];
  if(!best || best.length<9) return null;

  const extents=[];
  for(const y of best){
    let min=null,max=null;
    for(let x=scanLeft;x<scanRight;x++){
      if(darkAt(x,y)){
        if(min===null) min=x;
        max=x;
      }
    }
    if(min!==null && max-min>w*.40) extents.push([min,max]);
  }

  if(extents.length<5) return null;
  const median = values => {
    const a=[...values].sort((x,y)=>x-y);
    return a[Math.floor(a.length/2)];
  };

  const left=median(extents.map(v=>v[0]));
  const right=median(extents.map(v=>v[1]));
  if(right-left<w*.42) return null;

  return {lines:best,left,right,top:best[0],bottom:best[best.length-1]};
}

function loadTesseract(){
  if(globalThis.Tesseract) return Promise.resolve(globalThis.Tesseract);
  return new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-tesseract-loader]');
    if(existing){
      existing.addEventListener('load',()=>resolve(globalThis.Tesseract),{once:true});
      existing.addEventListener('error',()=>reject(new Error('No se pudo cargar el motor OCR.')),{once:true});
      return;
    }
    const script=document.createElement('script');
    script.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
    script.async=true;
    script.dataset.tesseractLoader='1';
    script.onload=()=>resolve(globalThis.Tesseract);
    script.onerror=()=>reject(new Error('No se pudo cargar Tesseract.js. Revisa la conexión a Internet.'));
    document.head.appendChild(script);
  });
}

function flattenOcrWords(data){
  if(Array.isArray(data?.words)) return data.words;
  const words=[];
  const blocks=data?.blocks || [];
  for(const block of blocks){
    for(const paragraph of block.paragraphs || []){
      for(const line of paragraph.lines || []){
        for(const word of line.words || []) words.push(word);
      }
    }
  }
  return words;
}

function mapCategory(text){
  const key=normalizeEntityKey(text);
  if(key.includes('poder ejecutivo')) return 'Poder Ejecutivo';
  if(key.includes('poder legislativo')) return 'Poder Legislativo';
  if(key.includes('poder judicial')) return 'Poder Judicial';
  if(key.includes('organismo operador municipal')) return 'Organismo Operador Municipal';
  if(key.includes('descentralizados estatales') || key.includes('descentralizado estatal')) return 'Descentralizado Estatal';
  if(key.includes('descentralizados municipales') || key.includes('descentralizado municipal')) return 'Descentralizado Municipal';
  if(key.includes('desconcentrado')) return 'Desconcentrado';
  if(key.includes('autonomos') || key.includes('autonomo')) return 'Autónomo';
  if(key.includes('municipales') || key==='municipal') return 'Municipal';
  return '';
}

function cleanOcrEntityName(value){
  return String(value||'')
    .replace(/^[\s|[\]{}()]+/g,'')
    .replace(/[|]+/g,' ')
    .replace(/\s+/g,' ')
    .replace(/^\d+\s+/,'')
    .replace(/[.;,:-]+$/,'')
    .trim();
}

function parseOcrTable(words,grid){
  const width=grid.right-grid.left;
  const xNumberEnd=grid.left+width*.115;
  const xEntityEnd=grid.left+width*.645;
  const xComplianceEnd=grid.left+width*.77;
  const xWorkEnd=grid.left+width*.88;
  const entities=[];
  let currentType='';

  for(let i=0;i<grid.lines.length-1;i++){
    const top=grid.lines[i], bottom=grid.lines[i+1];
    if(bottom-top<7) continue;

    const bandWords=words.filter(word=>{
      const box=word.bbox || word.boundingBox;
      if(!box) return false;
      const cx=(box.x0+box.x1)/2;
      const cy=(box.y0+box.y1)/2;
      return cy>top+1 && cy<bottom-1 && cx>grid.left-8 && cx<grid.right+8;
    });

    if(!bandWords.length) continue;
    bandWords.sort((a,b)=>{
      const ay=(a.bbox?.y0 ?? 0), by=(b.bbox?.y0 ?? 0);
      if(Math.abs(ay-by)>5) return ay-by;
      return (a.bbox?.x0 ?? 0)-(b.bbox?.x0 ?? 0);
    });

    const byColumn={number:[],entity:[],compliance:[],work:[],performance:[]};
    for(const word of bandWords){
      const box=word.bbox;
      if(!box) continue;
      const cx=(box.x0+box.x1)/2;
      const token=String(word.text||'').trim();
      if(!token) continue;
      if(cx<xNumberEnd) byColumn.number.push(word);
      else if(cx<xEntityEnd) byColumn.entity.push(word);
      else if(cx<xComplianceEnd) byColumn.compliance.push(word);
      else if(cx<xWorkEnd) byColumn.work.push(word);
      else byColumn.performance.push(word);
    }

    const join = list => list.map(w=>w.text).join(' ').replace(/\s+/g,' ').trim();
    const entityText=cleanOcrEntityName(join(byColumn.entity));
    const wholeText=cleanOcrEntityName(join(bandWords));
    const category=mapCategory(entityText) || mapCategory(wholeText);

    if(category && !/\d/.test(join(byColumn.number))){
      currentType=category;
      continue;
    }

    const normalized=normalizeEntityKey(entityText);
    if(!entityText || entityText.length<5) continue;
    if(/entidades fiscalizadas|tipo de auditoria|numero de auditoria|totales/.test(normalized)) continue;
    if(mapCategory(entityText)){
      currentType=mapCategory(entityText);
      continue;
    }

    const numberText=join(byColumn.number).replace(/[^0-9]/g,'');
    const looksLikeEntity = /\b(estado|municipio|ayuntamiento|instituto|secretaria|congreso|tribunal|consejo|organismo|sistema|junta|patronato|fideicomiso|servicios|universidad|comision|banco|administracion)\b/.test(normalized);
    if(!numberText && !looksLikeEntity) continue;

    const complianceText=normalizeEntityKey(join(byColumn.compliance));
    const workText=normalizeEntityKey(join(byColumn.work));
    const performanceText=normalizeEntityKey(join(byColumn.performance));
    const allAudit=normalizeEntityKey(join([...byColumn.compliance,...byColumn.work,...byColumn.performance]));

    entities.push({
      id: makeEntityId(),
      name: entityText,
      type: currentType,
      compliance: /cumpli|gestion|financiera/.test(complianceText) || (/cumpli|gestion financiera/.test(allAudit) && !/obra/.test(complianceText)),
      work: /obra|publica/.test(workText),
      performance: /desempe/.test(performanceText)
    });
  }

  return entities;
}

function identifyEntitiesFromText(lines){
  const institutionWords = /\b(ayuntamiento|municipio|congreso|tribunal|instituto|secretar[ií]a|organismo|sistema\s+(?:estatal|municipal)?\s*dif|comisi[oó]n|universidad|fideicomiso|colegio|consejo|junta|centro|procuradur[ií]a|contralor[ií]a|instituci[oó]n|hospital|servicios de salud|patronato|banco|administraci[oó]n portuaria)\b/i;
  const rejectWords = /\b(programa anual|programa de auditor[ií]as|cuenta p[uú]blica|ejercicio fiscal|tipo de auditor[ií]a|n[uú]mero de auditor[ií]a|objetivo|alcance|fundamento|marco legal|p[aá]gina|total de auditor[ií]as|calendario|cronograma)\b/i;
  const result=[];
  let currentType='';

  for(const raw of lines){
    const category=mapCategory(raw);
    if(category && raw.length<80){
      currentType=category;
      continue;
    }

    let line=cleanEntityCandidate(raw);
    if(line.length<5 || line.length>190) continue;
    if(rejectWords.test(line)) continue;
    if(!institutionWords.test(line)) continue;

    const auditPart=normalizeEntityKey(line);
    const compliance=/cumplimiento|gestion financiera/.test(auditPart);
    const work=/obra publica/.test(auditPart);
    const performance=/desempeno/.test(auditPart);

    line=line
      .replace(/\bCUMPLIMIENTO\s+Y\s+GESTI[ÓO]N\s+FINANCIERA\b/ig,' ')
      .replace(/\bOBRA\s+P[ÚU]BLICA\b/ig,' ')
      .replace(/\bDESEMPE[ÑN]O\b/ig,' ')
      .replace(/\s+/g,' ')
      .trim();

    if(!line) continue;
    result.push({id:makeEntityId(),name:line,type:currentType,compliance,work,performance});
  }

  return dedupeCatalogCandidates(result);
}

function dedupeCatalogCandidates(items){
  const map=new Map();
  for(const raw of items){
    const item=normalizeCatalogRecord(raw);
    const key=normalizeEntityKey(item.name);
    if(!key) continue;
    const previous=map.get(key);
    if(previous){
      previous.type=previous.type || item.type;
      previous.compliance=previous.compliance || item.compliance;
      previous.work=previous.work || item.work;
      previous.performance=previous.performance || item.performance;
    }else map.set(key,item);
  }
  return [...map.values()];
}

async function extractPaaEntities(file,onProgress=()=>{}){
  const pdf=await getPdfDocument(file);
  const textLines=[];
  const tablePages=[];
  onProgress(8,`PDF abierto: ${pdf.numPages} páginas. Buscando la tabla…`);

  for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){
    const page=await pdf.getPage(pageNumber);
    const lines=await extractPdfPageLines(page);
    textLines.push(...lines);

    const canvas=await renderPdfPage(page,1.35);
    const grid=detectTableGrid(canvas);
    if(grid) tablePages.push({pageNumber,page,canvas,grid});

    onProgress(8+(pageNumber/pdf.numPages)*28,`Analizando estructura de página ${pageNumber} de ${pdf.numPages}…`);
  }

  const fromText=identifyEntitiesFromText(textLines);
  if(fromText.length>=10){
    return {entities:fromText,usedOcr:false};
  }

  if(!tablePages.length){
    return {entities:fromText,usedOcr:false};
  }

  onProgress(40,`Se detectaron ${tablePages.length} página(s) con tabla. Preparando OCR…`);
  const Tesseract=await loadTesseract();
  let activeOcrProgress=0;
  const worker=await Tesseract.createWorker('spa',1,{
    logger: message=>{
      if(message.status==='recognizing text'){
        activeOcrProgress=message.progress || 0;
      }
    }
  });

  const ocrEntities=[];
  try{
    for(let i=0;i<tablePages.length;i++){
      const item=tablePages[i];
      const base=45+(i/tablePages.length)*50;
      onProgress(base,`Aplicando OCR a la página ${item.pageNumber}…`);

      const result=await worker.recognize(
        item.canvas,
        {preserve_interword_spaces:'1'},
        {text:true,blocks:true}
      );
      const words=flattenOcrWords(result.data);
      const parsed=parseOcrTable(words,item.grid);
      ocrEntities.push(...parsed);
      onProgress(45+((i+1)/tablePages.length)*50,`Página ${item.pageNumber} procesada · ${ocrEntities.length} entes detectados…`);
    }
  }finally{
    await worker.terminate();
  }

  const merged=dedupeCatalogCandidates([...fromText,...ocrEntities]);
  return {entities:merged,usedOcr:true};
}

function cleanEntityCandidate(value){
  return String(value||'')
    .replace(/^\s*(?:no\.?|n[uú]m\.?|n[oº°]\.?|\d+)\s*[:.)-]?\s*/i,'')
    .replace(/\s+/g,' ')
    .replace(/^[•·▪■–—-]+\s*/,'')
    .replace(/\s*[|]+\s*/g,' ')
    .trim()
    .replace(/[.;,:-]+$/,'')
    .trim();
}

function normalizeEntityKey(value){
  return String(value||'')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,' ')
    .trim();
}

function escapeHtml(value=''){
  return String(value)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

function escapeHtmlAttr(value=''){
  return escapeHtml(value);
}


/* =========================================================
   CATÁLOGO · MODELO DE PONDERACIÓN
   Fuente maestra para Metodología y Nuevo ejercicio.
   ========================================================= */
function catalogTabsHtml(){
  return `<div class="catalog-tabs">
    <button class="catalog-tab ${catalogSection==='entities'?'active':''}" data-catalog-section="entities" type="button">Entes fiscalizados</button>
    <button class="catalog-tab ${catalogSection==='methodology'?'active':''}" data-catalog-section="methodology" type="button">Modelo de ponderación</button>
  </div>`;
}

function bindCatalogTabs(){
  $$('[data-catalog-section]').forEach(button=>{
    button.onclick=()=>{
      const nextSection=button.dataset.catalogSection;

      if(nextSection==='methodology'){
        catalogSection='methodology';
        catalogMethodDraft=null;

        try{
          methodologyCatalog();
        }catch(error){
          console.error('No se pudo abrir Modelo de ponderación:',error);
          alert(
            'No se pudo abrir Modelo de ponderación. '
            +'Verifica que js/model.js también esté actualizado. '
            +'Detalle: '+(error?.message||error)
          );
        }
        return;
      }

      catalogSection='entities';
      catalogMethodDraft=null;
      catalog();
    };
  });
}

function makeMethodKey(prefix='item'){
  if(globalThis.crypto?.randomUUID){
    return prefix+'-'+crypto.randomUUID();
  }
  return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);
}

function newMethodMajor(){
  return {
    key:makeMethodKey('major'),
    label:'Nuevo criterio mayor',
    description:'Criterio obligatorio para la aprobación.'
  };
}

function newMethodLeaf(label='Nuevo criterio',points=0){
  return {
    key:makeMethodKey('criterion'),
    type:'score',
    label,
    points:Number(points)||0
  };
}

function newMethodParent(){
  return {
    key:makeMethodKey('criterion'),
    label:'Nuevo criterio con desglose',
    children:[newMethodLeaf('Nuevo subcriterio',0)]
  };
}

function newMethodGroup(){
  return {
    key:makeMethodKey('group'),
    name:'Nuevo rubro',
    items:[newMethodLeaf('Nuevo criterio',0)]
  };
}

function newMethodComponent(){
  return {
    key:makeMethodKey('variable'),
    name:'Nueva variable',
    description:'',
    groups:[newMethodGroup()]
  };
}

function methodologyCatalog(){
  if(!catalogMethodDraft) catalogMethodDraft=getMethodologyConfig();
  const config=catalogMethodDraft;
  const total=methodologyTotal(config);
  const totalClass=Math.abs(total-100)<0.001?'ok':'warning';

  const content=`
    ${catalogTabsHtml()}
    <div class="methodology-catalog-head card">
      <div>
        <div class="section-title">Modelo de ponderación</div>
        <p class="subtitle">Administra aquí nombres, puntajes y orden. Al guardar, los cambios se reflejan automáticamente en Metodología, Nuevo ejercicio y el cálculo.</p>
      </div>
      <div class="methodology-catalog-total ${totalClass}">
        <strong id="methodCatalogTotal">${formatMethodPoints(total)}</strong>
        <span>puntos totales</span>
      </div>
    </div>

    <section class="card methodology-editor-section">
      <div class="methodology-editor-title">
        <div>
          <div class="section-title">Criterios mayores</div>
          <p class="subtitle">No suman puntos, pero determinan la aprobación de la Cuenta Pública.</p>
        </div>
        <button class="btn mini-btn" id="methodAddMajor" type="button">＋ Agregar criterio mayor</button>
      </div>
      <div class="methodology-major-editor">
        ${(config.majors||[]).map((major,index)=>`
          <div class="method-editor-row">
            <span class="method-editor-index">${String(index+1).padStart(2,'0')}</span>
            <div class="field method-editor-grow">
              <label>Nombre del criterio</label>
              <input data-major-label="${index}" value="${escapeHtmlAttr(major.label)}">
            </div>
            <div class="field method-editor-grow">
              <label>Descripción</label>
              <input data-major-description="${index}" value="${escapeHtmlAttr(major.description||'')}">
            </div>
            <button class="btn mini-btn danger-btn" data-delete-major="${index}" type="button">Eliminar</button>
          </div>`).join('')}
      </div>
    </section>

    <div class="methodology-add-variable-row">
      <button class="btn" id="methodAddComponent" type="button">＋ Agregar variable</button>
    </div>

    ${(config.components||[]).map((component,componentIndex)=>methodologyComponentEditor(component,componentIndex)).join('')}

    <div class="methodology-editor-actions">
      <button class="btn" id="methodReset">Restaurar modelo original</button>
      <button class="btn primary" id="methodSave">Guardar modelo de ponderación</button>
    </div>
  `;

  $('#app').innerHTML=layout(
    content,
    'Catálogo',
    'Administra entes fiscalizados y la estructura maestra del modelo de ponderación.'
  );
  bindNav();
  bindCatalogTabs();
  bindMethodologyCatalog();
}

function methodologyComponentEditor(component,componentIndex){
  return `<section class="card methodology-editor-section">
    <div class="methodology-editor-title">
      <div class="field method-component-name">
        <label>Nombre de la variable</label>
        <input data-component-name="${componentIndex}" value="${escapeHtmlAttr(component.name)}">
      </div>
      <div class="methodology-component-total">
        <strong>${formatMethodPoints(methodologyComponentPoints(component))}</strong>
        <span>pts</span>
      </div>
      <div class="catalog-row-actions">
        <button class="btn mini-btn" data-add-group="${componentIndex}" type="button">＋ Rubro</button>
        <button class="btn mini-btn danger-btn" data-delete-component="${componentIndex}" type="button">Eliminar variable</button>
      </div>
    </div>

    <div class="methodology-group-editor-list">
      ${(component.groups||[]).map((group,groupIndex)=>methodologyGroupEditor(group,componentIndex,groupIndex,component.groups.length)).join('')}
    </div>
  </section>`;
}

function methodologyGroupEditor(group,componentIndex,groupIndex,groupCount){
  const path=`${componentIndex}.${groupIndex}`;
  return `<div class="methodology-group-editor">
    <div class="methodology-group-editor-head">
      <div class="methodology-order-buttons">
        <button class="mini-order-btn" data-move-group="${path}" data-direction="-1" ${groupIndex===0?'disabled':''} title="Subir">↑</button>
        <button class="mini-order-btn" data-move-group="${path}" data-direction="1" ${groupIndex===groupCount-1?'disabled':''} title="Bajar">↓</button>
      </div>
      <div class="field method-editor-grow">
        <label>Rubro</label>
        <input data-group-name="${path}" value="${escapeHtmlAttr(group.name)}">
      </div>
      <div class="method-group-total">${formatMethodPoints(methodologyGroupPoints(group))} pts</div>
      <div class="catalog-row-actions">
        <button class="btn mini-btn" data-add-item="${path}" type="button">＋ Criterio</button>
        <button class="btn mini-btn" data-add-parent="${path}" type="button">＋ Criterio con desglose</button>
        <button class="btn mini-btn danger-btn" data-delete-group="${path}" type="button">Eliminar rubro</button>
      </div>
    </div>
    ${group.note!==undefined?`<div class="field method-group-note-field"><label>Nota</label><input data-group-note="${path}" value="${escapeHtmlAttr(group.note||'')}"></div>`:''}
    <div class="methodology-items-editor">
      ${(group.items||[]).map((item,itemIndex)=>methodologyItemEditor(item,componentIndex,groupIndex,itemIndex,group.items.length)).join('')}
    </div>
  </div>`;
}

function methodologyItemEditor(item,componentIndex,groupIndex,itemIndex,itemCount){
  const path=`${componentIndex}.${groupIndex}.${itemIndex}`;
  if(Array.isArray(item.children)){
    return `<div class="methodology-parent-editor">
      <div class="methodology-item-row parent-row">
        <div class="methodology-order-buttons">
          <button class="mini-order-btn" data-move-item="${path}" data-direction="-1" ${itemIndex===0?'disabled':''}>↑</button>
          <button class="mini-order-btn" data-move-item="${path}" data-direction="1" ${itemIndex===itemCount-1?'disabled':''}>↓</button>
        </div>
        <div class="field method-editor-grow"><label>Criterio</label><input data-item-label="${path}" value="${escapeHtmlAttr(item.label)}"></div>
        <div class="method-item-total">${formatMethodPoints(methodologyChildrenPoints(item))} pts</div>
        <div class="catalog-row-actions">
          <button class="btn mini-btn" data-add-child="${path}" type="button">＋ Subcriterio</button>
          <button class="btn mini-btn danger-btn" data-delete-item="${path}" type="button">Eliminar criterio</button>
        </div>
      </div>
      <div class="methodology-child-editor">
        ${item.children.map((child,childIndex)=>methodologyLeafEditor(child,`${path}.${childIndex}`,childIndex,item.children.length,true)).join('')}
      </div>
    </div>`;
  }
  return methodologyLeafEditor(item,path,itemIndex,itemCount,false);
}

function methodologyLeafEditor(item,path,index,count,isChild){
  return `<div class="methodology-item-row ${isChild?'child-row':''}">
    <div class="methodology-order-buttons">
      <button class="mini-order-btn" data-move-${isChild?'child':'item'}="${path}" data-direction="-1" ${index===0?'disabled':''}>↑</button>
      <button class="mini-order-btn" data-move-${isChild?'child':'item'}="${path}" data-direction="1" ${index===count-1?'disabled':''}>↓</button>
    </div>
    <div class="field method-editor-grow">
      <label>${isChild?'Subcriterio':'Criterio'}</label>
      <input data-${isChild?'child':'item'}-label="${path}" value="${escapeHtmlAttr(item.label)}">
    </div>
    <div class="field method-points-field">
      <label>Puntos</label>
      <input type="number" min="0" step="0.05" data-${isChild?'child':'item'}-points="${path}" value="${Number(item.points)||0}">
    </div>
    <button class="btn mini-btn danger-btn" data-delete-${isChild?'child':'item'}="${path}" type="button">Eliminar</button>
  </div>`;
}

function methodPathIndexes(value){
  return String(value).split('.').map(Number);
}

function methodGroupAt(config,path){
  const [componentIndex,groupIndex]=methodPathIndexes(path);
  return config.components[componentIndex].groups[groupIndex];
}

function methodItemAt(config,path){
  const [componentIndex,groupIndex,itemIndex]=methodPathIndexes(path);
  return config.components[componentIndex].groups[groupIndex].items[itemIndex];
}

function bindMethodologyCatalog(){
  const config=catalogMethodDraft;

  $('#methodAddMajor').onclick=()=>{
    config.majors=config.majors||[];
    config.majors.push(newMethodMajor());
    methodologyCatalog();
  };
  $$('[data-delete-major]').forEach(button=>button.onclick=()=>{
    const index=+button.dataset.deleteMajor;
    const major=config.majors?.[index];
    if(!major) return;
    if(!confirm(`¿Eliminar el criterio mayor “${major.label}”?`)) return;
    config.majors.splice(index,1);
    methodologyCatalog();
  });

  $('#methodAddComponent').onclick=()=>{
    config.components=config.components||[];
    config.components.push(newMethodComponent());
    methodologyCatalog();
  };
  $$('[data-delete-component]').forEach(button=>button.onclick=()=>{
    const index=+button.dataset.deleteComponent;
    const component=config.components?.[index];
    if(!component) return;
    if(!confirm(`¿Eliminar la variable “${component.name}” y todo su contenido?`)) return;
    config.components.splice(index,1);
    methodologyCatalog();
  });

  $$('[data-add-group]').forEach(button=>button.onclick=()=>{
    const c=+button.dataset.addGroup;
    config.components[c].groups=config.components[c].groups||[];
    config.components[c].groups.push(newMethodGroup());
    methodologyCatalog();
  });
  $$('[data-delete-group]').forEach(button=>button.onclick=()=>{
    const [c,g]=methodPathIndexes(button.dataset.deleteGroup);
    const group=config.components?.[c]?.groups?.[g];
    if(!group) return;
    if(!confirm(`¿Eliminar el rubro “${group.name}” y todos sus criterios?`)) return;
    config.components[c].groups.splice(g,1);
    methodologyCatalog();
  });

  $$('[data-add-item]').forEach(button=>button.onclick=()=>{
    const group=methodGroupAt(config,button.dataset.addItem);
    group.items=group.items||[];
    group.items.push(newMethodLeaf('Nuevo criterio',0));
    methodologyCatalog();
  });
  $$('[data-add-parent]').forEach(button=>button.onclick=()=>{
    const group=methodGroupAt(config,button.dataset.addParent);
    group.items=group.items||[];
    group.items.push(newMethodParent());
    methodologyCatalog();
  });
  $$('[data-delete-item]').forEach(button=>button.onclick=()=>{
    const [c,g,i]=methodPathIndexes(button.dataset.deleteItem);
    const item=config.components?.[c]?.groups?.[g]?.items?.[i];
    if(!item) return;
    if(!confirm(`¿Eliminar el criterio “${item.label}”?`)) return;
    config.components[c].groups[g].items.splice(i,1);
    methodologyCatalog();
  });

  $$('[data-add-child]').forEach(button=>button.onclick=()=>{
    const item=methodItemAt(config,button.dataset.addChild);
    item.children=item.children||[];
    item.children.push(newMethodLeaf('Nuevo subcriterio',0));
    methodologyCatalog();
  });
  $$('[data-delete-child]').forEach(button=>button.onclick=()=>{
    const [c,g,i,ch]=methodPathIndexes(button.dataset.deleteChild);
    const child=config.components?.[c]?.groups?.[g]?.items?.[i]?.children?.[ch];
    if(!child) return;
    if(!confirm(`¿Eliminar el subcriterio “${child.label}”?`)) return;
    config.components[c].groups[g].items[i].children.splice(ch,1);
    methodologyCatalog();
  });

  $$('[data-major-label]').forEach(input=>input.oninput=()=>{config.majors[+input.dataset.majorLabel].label=input.value;});
  $$('[data-major-description]').forEach(input=>input.oninput=()=>{config.majors[+input.dataset.majorDescription].description=input.value;});
  $$('[data-component-name]').forEach(input=>input.oninput=()=>{config.components[+input.dataset.componentName].name=input.value;});

  $$('[data-group-name]').forEach(input=>input.oninput=()=>{methodGroupAt(config,input.dataset.groupName).name=input.value;});
  $$('[data-group-note]').forEach(input=>input.oninput=()=>{methodGroupAt(config,input.dataset.groupNote).note=input.value;});

  $$('[data-item-label]').forEach(input=>input.oninput=()=>{methodItemAt(config,input.dataset.itemLabel).label=input.value;});
  $$('[data-item-points]').forEach(input=>input.oninput=()=>{methodItemAt(config,input.dataset.itemPoints).points=+input.value||0;refreshMethodologyEditorTotals();});

  $$('[data-child-label]').forEach(input=>input.oninput=()=>{
    const [c,g,i,ch]=methodPathIndexes(input.dataset.childLabel);
    config.components[c].groups[g].items[i].children[ch].label=input.value;
  });
  $$('[data-child-points]').forEach(input=>input.oninput=()=>{
    const [c,g,i,ch]=methodPathIndexes(input.dataset.childPoints);
    config.components[c].groups[g].items[i].children[ch].points=+input.value||0;
    refreshMethodologyEditorTotals();
  });

  $$('[data-move-group]').forEach(button=>button.onclick=()=>{
    const [c,g]=methodPathIndexes(button.dataset.moveGroup);
    moveArrayItem(config.components[c].groups,g,g+(+button.dataset.direction));
    methodologyCatalog();
  });
  $$('[data-move-item]').forEach(button=>button.onclick=()=>{
    const [c,g,i]=methodPathIndexes(button.dataset.moveItem);
    const items=config.components[c].groups[g].items;
    moveArrayItem(items,i,i+(+button.dataset.direction));
    methodologyCatalog();
  });
  $$('[data-move-child]').forEach(button=>button.onclick=()=>{
    const [c,g,i,ch]=methodPathIndexes(button.dataset.moveChild);
    const children=config.components[c].groups[g].items[i].children;
    moveArrayItem(children,ch,ch+(+button.dataset.direction));
    methodologyCatalog();
  });

  $('#methodReset').onclick=()=>{
    if(!confirm('¿Restaurar los nombres, puntajes y orden originales del modelo?')) return;
    catalogMethodDraft=clone(DEFAULT_METHODOLOGY);
    methodologyCatalog();
  };

  $('#methodSave').onclick=async()=>{
    const total=methodologyTotal(config);
    if(Math.abs(total-100)>0.001){
      const proceed=confirm(`El modelo suma ${formatMethodPoints(total)} puntos, no 100. ¿Deseas guardarlo de todos modos?`);
      if(!proceed) return;
    }
    const button=$('#methodSave');
    button.disabled=true;
    button.textContent='Guardando…';
    try {

  // Guardar el nuevo modelo
  await store.set(
    'methodology',
    config
  );


  // Obtener ejercicios guardados
  const exercises = clone(
    store.get(
      'exercises',
      []
    )
  );


  // Actualizar el modelo de cada ejercicio
  const updatedExercises =
    exercises.map(exercise => {

      const updated = {
        ...clone(exercise),

        methodologySnapshot:
          clone(config)
      };


      // Recalcular el ejercicio
      const calculation =
        calc(updated);


      return {
        ...updated,
        ...calculation,

        updatedAt:
          new Date().toISOString()
      };

    });


  // Guardar ejercicios actualizados
  await store.set(
    'exercises',
    updatedExercises
  );


  // Actualizar ejercicio abierto
  if (state.current) {

    state.current.methodologySnapshot =
      clone(config);

    const currentCalculation =
      calc(state.current);

    Object.assign(
      state.current,
      currentCalculation
    );

  }


  // Actualizar catálogo
  catalogMethodDraft =
    clone(config);


  alert(
    'Modelo de ponderación actualizado. ' +
    'Los ejercicios guardados también ' +
    'fueron recalculados.'
  );


  methodologyCatalog();


} catch (error) {

  button.disabled = false;

  button.textContent =
    'Guardar modelo de ponderación';


  alert(
    'No se pudo guardar el modelo en D1: ' +
    error.message
  );

}
}

function moveArrayItem(array,from,to){
  if(to<0||to>=array.length||from===to) return;
  const [item]=array.splice(from,1);
  array.splice(to,0,item);
}

function refreshMethodologyEditorTotals(){
  const total=methodologyTotal(catalogMethodDraft);
  const totalNode=$('#methodCatalogTotal');
  if(totalNode) totalNode.textContent=formatMethodPoints(total);
  const totalBox=document.querySelector('.methodology-catalog-total');
  if(totalBox){
    totalBox.classList.toggle('ok',Math.abs(total-100)<0.001);
    totalBox.classList.toggle('warning',Math.abs(total-100)>=0.001);
  }
  document.querySelectorAll('.methodology-editor-section').forEach((section,index)=>{
    if(index===0) return;
    const component=catalogMethodDraft.components[index-1];
    const node=section.querySelector('.methodology-component-total strong');
    if(node) node.textContent=formatMethodPoints(methodologyComponentPoints(component));
    section.querySelectorAll('.methodology-group-editor').forEach((groupNode,groupIndex)=>{
      const group=component.groups[groupIndex];
      const groupTotal=groupNode.querySelector('.method-group-total');
      if(groupTotal) groupTotal.textContent=`${formatMethodPoints(methodologyGroupPoints(group))} pts`;
      groupNode.querySelectorAll('.methodology-parent-editor').forEach(parentNode=>{
        const itemInput=parentNode.querySelector('[data-item-label]');
        if(!itemInput) return;
        const item=methodItemAt(catalogMethodDraft,itemInput.dataset.itemLabel);
        const itemTotal=parentNode.querySelector('.method-item-total');
        if(itemTotal) itemTotal.textContent=`${formatMethodPoints(methodologyChildrenPoints(item))} pts`;
      });
    });
  });
}
