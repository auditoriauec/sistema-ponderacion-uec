/* =========================================================
   9. MÓDULO: RESULTADOS
   Se alimenta automáticamente de ejercicios finalizados.
   ========================================================= */
function results(){let a=finalized();
let c=a.length?`<div class="toolbar">
<input id="searchRes" placeholder="Buscar ente…" style="padding:10px;border:1px solid var(--border);border-radius:7px">
<button class="btn" id="exportCsv">⇩ Exportar CSV</button>
</div>
<div class="tablewrap">
<table class="table">
<thead>
<tr>
<th>Ente fiscalizado</th>
<th>Tipo de ente</th>
<th>Obra pública</th>
<th>Base aplicable</th>
<th>Puntaje</th>
<th>Criterios mayores</th>
<th>Resultado</th>
</tr>
</thead>
<tbody id="resBody">${resultRows(a)}</tbody>
</table>
</div>`:`<div class="empty">No existen ejercicios finalizados para ${state.year}.</div>`;
$('#app').innerHTML=layout(c,'Resultados de Ponderación','Consulta y compara los resultados de los ejercicios finalizados.');
bindNav();
let s=$('#searchRes');
if(s)s.oninput=()=>{$('#resBody').innerHTML=resultRows(a.filter(x=>x.entity.toLowerCase().includes(s.value.toLowerCase())))};
let ex=$('#exportCsv');
if(ex)ex.onclick=()=>{let rows=[['Ente','Año','Puntaje','Resultado'],...a.map(x=>[x.entity,x.year,x.score.toFixed(2),x.result])];
let blob=new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'}),u=URL.createObjectURL(blob),a1=document.createElement('a');
a1.href=u;
a1.download=`resultados_${state.year}.csv`;
a1.click();
URL.revokeObjectURL(u)}}
function resultRows(a){return a.map(x=>`<tr>
<td>${x.entity}</td>
<td>${x.type||'—'}</td>
<td>${x.work?'Sí':'No'}</td>
<td>${x.base}</td>
<td>
<b>${x.score.toFixed(2)}</b>
</td>
<td>${x.majorOk?'<span class="status-ok">Cumple</span>':'<span class="status-bad">Incumple</span>'}</td>
<td class="${x.result==='APROBADA'?'status-ok':'status-bad'}">${x.result}</td>
</tr>`).join('')}

