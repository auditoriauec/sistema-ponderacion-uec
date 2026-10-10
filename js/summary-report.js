/* Reporte ejecutivo imprimible del módulo Resumen. No modifica los datos. */
function bindSummaryReportButton() {
  const topbar = document.querySelector('.summary-sticky-header .topbar') || document.querySelector('.main > .topbar');
  if (!topbar || topbar.querySelector('#summaryReportPdf')) return;
  const button = document.createElement('button');
  button.id = 'summaryReportPdf';
  button.type = 'button';
  button.className = 'btn';
  button.textContent = '↓ Descargar reporte PDF';
  button.style.cssText = 'white-space:nowrap;margin-left:auto;';
  button.addEventListener('click', summaryReportPreview);
  topbar.appendChild(button);
}

function summaryReportPreview() {
  // Abrir la pestaña durante el clic para no activar bloqueadores de ventanas.
  const win = window.open('', '_blank');
  if (!win) return alert('Permite ventanas emergentes para ver el reporte.');

  const catalog = summaryFilteredCatalogRecords();
  const exercises = summaryFilteredExercises();
  const approved = exercises.filter(x => summaryResult(x) === 'APROBADA');
  const rejected = exercises.filter(x => summaryResult(x) !== 'APROBADA');
  const total = exercises.length;
  const years = summaryEvaluatedYears(exercises);
  const entities = summaryUniqueCatalogEntities(catalog).length;
  const solv = summarySolvencyTotals(exercises);
  const pct = (a, b) => summaryPercent(a, b) + '%';
  const esc = value => summaryEscape(String(value ?? ''));
  const num = value => Number(value || 0).toLocaleString('es-MX');
  const yearText = summaryFilters.year === 'all' ? 'Todos los ejercicios fiscales' : `Ejercicio Fiscal ${esc(summaryFilters.year)}`;
  const entityText = summaryFilters.entity === 'all' ? 'Todas las entidades fiscalizadas' : esc(summaryFilters.entity);
  const issueDate = new Date().toLocaleDateString('es-MX', {year:'numeric',month:'long',day:'numeric'});
  const logo = new URL('assets/logo-uec.png', window.location.href).href;
  const card = (label,value,detail,kind='') => `<div class="metric ${kind}"><div class="metric-label">${label}</div><div class="metric-value">${value}</div><div class="metric-detail">${detail}</div></div>`;
  const table = (title,items) => {
    const rows = [...items].sort((a,b) => summaryScore(b)-summaryScore(a)).map((item,index) => `
      <tr><td class="center">${index+1}</td><td>${esc(item.entity || '—')}</td><td class="center">${esc(item.year)}</td><td class="right">${summaryScore(item).toFixed(2)}</td></tr>`).join('');
    return `<section class="table-section"><h2>${title} <span class="count">${items.length}</span></h2><table><thead><tr><th class="small">No.</th><th>Ente fiscalizado</th><th class="small">Ejercicio</th><th class="small">Ponderación</th></tr></thead><tbody>${rows || '<tr><td colspan="4">Sin cuentas para mostrar.</td></tr>'}</tbody></table></section>`;
  };
  const expected = entities;
  const evaluated = expected ? new Set(exercises.map(x => String(x.entity||'').trim()).filter(name => catalog.some(row => row.name === name))).size : 0;
  const progress = expected ? Math.min(100, evaluated / expected * 100) : 0;
  const approvedAngle = total ? approved.length / total * 360 : 0;


  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Resumen de Cuenta Pública - ${esc(summaryFilters.year)}</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#e9eeec;color:#162923;font:12px/1.45 Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.report{max-width:1100px;margin:24px auto;padding:32px 38px;background:white;box-shadow:0 6px 28px #0002}
.header{display:flex;align-items:center;justify-content:space-between;gap:25px;border-bottom:2px solid #0b5142;padding-bottom:18px}.logo{width:165px;max-height:95px;object-fit:contain;object-position:left}.meta{text-align:right;color:#60716b;font-size:11px}
h1{font-size:29px;line-height:1.1;color:#122d25;margin:24px 0 5px}h2{font-size:16px;margin:23px 0 12px;color:#16372e}.subtitle{font-size:19px;color:#52615d;margin:0}.description{color:#6b7873;margin:7px 0 21px}
.metrics{display:grid;gap:10px}.metrics.four{grid-template-columns:repeat(4,minmax(0,1fr))}.metrics.five{grid-template-columns:repeat(5,minmax(0,1fr))}.metric{border:1px solid #dce5e1;border-radius:8px;padding:14px 12px;min-width:0;min-height:103px;display:flex;flex-direction:column;justify-content:space-between;gap:9px}.metric.ok{border-top:3px solid #0c563d}.metric.bad{border-top:3px solid #cf3b35}.metric-label{color:#62716d;font-weight:700;font-size:10px}.metric-value{font-weight:800;font-size:24px;line-height:1.12;overflow-wrap:anywhere}.five .metric-value{font-size:clamp(12px,1.5vw,18px)}.metric-detail{font-size:10px;color:#6c7975}
.charts{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px}.panel{border:1px solid #dce5e1;border-radius:8px;padding:17px}.panel h2{margin:0 0 14px}.donut-layout{display:flex;align-items:center;gap:25px;justify-content:center}.donut{width:150px;height:150px;border-radius:50%;display:grid;place-items:center;flex:none;background:conic-gradient(#073b13 0deg ${approvedAngle}deg,#d33c35 ${approvedAngle}deg 360deg)}.donut-inner{width:100px;height:100px;background:#fff;border-radius:50%;display:flex;flex-direction:column;justify-content:center;align-items:center}.donut-inner strong{font-size:30px}.legend{font-size:12px}.legend div{margin:12px 0}.dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:7px}.green{background:#073b13}.red{background:#d33c35}.progress{text-align:center;padding:15px 4px}.progress strong{font-size:38px}.track{height:11px;background:#e7eeea;border-radius:10px;overflow:hidden;margin:20px 0 9px}.fill{height:100%;background:#073b13}.muted{color:#63736c}
.table-section{margin-top:24px;break-before:page}.table-section h2{border-bottom:1px solid #d8e2dd;padding-bottom:9px}.count{font-size:12px;background:#edf3ef;padding:5px 10px;border-radius:20px;margin-left:6px}table{width:100%;border-collapse:collapse;table-layout:fixed}thead{display:table-header-group}tr{break-inside:avoid;page-break-inside:avoid}th{background:#0b5142;color:white;text-align:left;font-size:10px;padding:9px 10px;border:1px solid #0b5142}td{padding:8px 10px;border:1px solid #d9e2dd;overflow-wrap:anywhere}tbody tr:nth-child(even){background:#f7faf8}.small{width:13%}.center{text-align:center}.right{text-align:right}.footer{margin-top:28px;padding-top:12px;border-top:1px solid #d5dfda;color:#60716b;font-size:10px;display:flex;justify-content:space-between}.actions{text-align:center;margin:15px}.print-btn{border:0;background:#075244;color:#fff;border-radius:7px;padding:12px 18px;cursor:pointer;font-weight:700}
@page{size:A4 landscape;margin:12mm}@media print{body{background:white}.report{max-width:none;margin:0;padding:0;box-shadow:none}.actions{display:none}.table-section{break-before:page}.five .metric-value{font-size:15px}.footer{break-inside:avoid}}
</style></head><body><div class="actions"><button class="print-btn" onclick="window.print()">Imprimir / Guardar como PDF</button></div><main class="report">
<header class="header"><img class="logo" src="${logo}" alt="Logo institucional UEC"><div class="meta"><b>UNIDAD DE EVALUACIÓN Y CONTROL</b><br>Fecha de emisión: ${esc(issueDate)}<br>${entityText}</div></header>
<h1>Resumen de Cuenta Pública</h1><p class="subtitle">${yearText}</p><p class="description">Panorama ejecutivo de las cuentas públicas evaluadas.</p>
<div class="metrics four">${card('Entidades Fiscalizadas',num(entities),'Entes únicos del catálogo')}${card('Ejercicios Fiscales Evaluados',num(years.length),years.map(esc).join(', ') || 'Sin ejercicios')}${card('Cuentas Aprobadas',num(approved.length),pct(approved.length,total)+' del total','ok')}${card('Cuentas No Aprobadas',num(rejected.length),pct(rejected.length,total)+' del total','bad')}</div>
<h2>Indicadores de Fiscalización</h2><p class="muted">Observaciones registradas en el apartado de Solventación.</p>
<div class="metrics five">${card('Observaciones Fincadas',num(solv.countF),'100% del total fincado')}${card('Observaciones No Solventadas',num(solv.countNotSolved),pct(solv.countNotSolved,solv.countF)+' del total fincado')}${card('Monto de Observaciones Fincadas',summaryMoney(solv.amountF),'100% del monto fincado')}${card('Monto de Observaciones Solventadas',summaryMoney(solv.amountS),pct(solv.amountS,solv.amountF)+' del monto fincado')}${card('Monto de Observaciones No Solventadas',summaryMoney(solv.amountNotSolved),pct(solv.amountNotSolved,solv.amountF)+' del monto fincado')}</div>
<div class="charts"><section class="panel"><h2>Clasificación de Cuentas Públicas</h2><div class="donut-layout"><div class="donut"><div class="donut-inner"><strong>${num(total)}</strong><small>evaluadas</small></div></div><div class="legend"><div><i class="dot green"></i><b>Aprobadas</b><br>${approved.length} · ${pct(approved.length,total)}</div><div><i class="dot red"></i><b>No aprobadas</b><br>${rejected.length} · ${pct(rejected.length,total)}</div></div></div></section>
<section class="panel"><h2>${summaryFilters.year === 'all' ? 'Ejercicios Evaluados' : 'Avance de Evaluación'}</h2>${summaryFilters.year === 'all' ? `<div class="progress"><strong>${years.map(esc).join(' · ') || '—'}</strong><p class="muted">Ejercicios fiscales con cuentas evaluadas</p></div>` : `<div class="progress"><strong>${progress.toFixed(1)}%</strong><p>${evaluated} de ${expected} cuentas</p><div class="track"><div class="fill" style="width:${progress.toFixed(1)}%"></div></div><small class="muted">${evaluated} evaluadas · ${progress.toFixed(1)}% del catálogo</small></div>`}</section></div>
${table('Cuentas Aprobadas',approved)}${table('Cuentas No Aprobadas',rejected)}
<footer class="footer"><span>Unidad de Evaluación y Control · Reporte ejecutivo</span><span>${yearText} · ${entityText}</span></footer>
</main><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),600));<\/script></body></html>`;
  win.document.open();
  win.document.write(html);
  win.document.close();
}
