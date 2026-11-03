/* =========================================================
   REPORTE EJECUTIVO DE CUENTA PÚBLICA
   Vista previa e impresión del módulo Resumen.
   Mantiene intactos los cálculos y datos del Dashboard.
   ========================================================= */
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
  // Tabla por ente con datos de solventación del ejercicio de cada cuenta.
  // Con un ejercicio seleccionado no se muestra la columna de ejercicio (el título ya lo indica).
  // Con "Todos los ejercicios" se genera una tabla por cada ejercicio fiscal.
  const table = (title, items, grand = null) => {
    const byYear = summaryFilters.year === 'all';
    const sorted = [...items].sort((a, b) => summaryScore(b) - summaryScore(a));
    const groups = byYear
      ? [...new Set(sorted.map(x => String(x.year)))].sort().map(y => ({ label: y, rows: sorted.filter(x => String(x.year) === y) }))
      : [{ label: null, rows: sorted }];

    // Densidad adaptable para que las tablas quepan en una sola hoja.
    const units = sorted.length + (byYear ? groups.length * 2.5 : 0) + (grand ? 2 : 1);
    const density = units <= 24 ? '' : (units <= 34 ? 'compact' : 'tight');

    const head = `
      <thead>
        <tr>
          <th>No.</th>
          <th>Ente Fiscalizado</th>
          <th>Número Fincado</th>
          <th>Número Solventado</th>
          <th>Número No Solventado</th>
          <th>Monto Fincado</th>
          <th>Monto Solventado</th>
          <th>Monto No Solventado</th>
        </tr>
      </thead>`;
    const cols = '<colgroup><col style="width:4.5%"><col style="width:20%"><col style="width:7.5%"><col style="width:7.5%"><col style="width:7.5%"><col style="width:17.67%"><col style="width:17.67%"><col style="width:17.67%"></colgroup>';

    const rowsHtml = rows => rows.map((item, index) => {
      const s = summarySolvencyTotals([item]);
      return `
        <tr>
          <td class="center">${index + 1}</td>
          <td class="ente">${esc(item.entity || '—')}</td>
          <td class="center">${num(s.countF)}</td>
          <td class="center">${num(s.countS)}</td>
          <td class="center">${num(s.countNotSolved)}</td>
          <td class="money">${summaryMoney(s.amountF)}</td>
          <td class="money">${summaryMoney(s.amountS)}</td>
          <td class="money">${summaryMoney(s.amountNotSolved)}</td>
        </tr>`;
    }).join('');

    // Fila de totales: suma de cada columna de las filas indicadas.
    const totalRow = (label, rows, kind = '') => {
      const t = summarySolvencyTotals(rows);
      return `
        <tr class="total ${kind}">
          <td colspan="2" class="total-label">${label}</td>
          <td class="center">${num(t.countF)}</td>
          <td class="center">${num(t.countS)}</td>
          <td class="center">${num(t.countNotSolved)}</td>
          <td class="money">${summaryMoney(t.amountF)}</td>
          <td class="money">${summaryMoney(t.amountS)}</td>
          <td class="money">${summaryMoney(t.amountNotSolved)}</td>
        </tr>`;
    };
    const totalTable = (label, rows, kind = '') => `<table class="solv ${density} ${kind === 'grand' ? 'grand-gap' : 'extra-total'}">${cols}<tbody>${totalRow(label, rows, kind)}</tbody></table>`;

    const tables = items.length
      ? groups.map(g => `
        <div class="year-group">${g.label ? `<h3 class="year-title">Ejercicio Fiscal ${esc(g.label)} <span class="count">${g.rows.length}</span></h3>` : ''}
        <table class="solv ${density}">${cols}${head}<tbody>${rowsHtml(g.rows)}${totalRow(g.label ? `Total ${esc(g.label)}` : 'Total', g.rows)}</tbody></table></div>`).join('')
        + (groups.length > 1 ? totalTable(`Total ${title}`, sorted) : '')
        + (grand ? totalTable(grand.label, grand.rows, 'grand') : '')
      : `<table class="solv">${cols}${head}<tbody><tr><td colspan="8" class="center">Sin cuentas para mostrar.</td></tr></tbody></table>`;

    return `
      <section class="table-section">
        <h2>${title} <span class="count">${items.length}</span></h2>
        ${tables}
      </section>
    `;
  };

  const expected = entities;
  const evaluated = expected ? new Set(exercises.map(x => String(x.entity||'').trim()).filter(name => catalog.some(row => row.name === name))).size : 0;
  const progress = expected ? Math.min(100, evaluated / expected * 100) : 0;
  const approvedPart = total ? approved.length / total * 100 : 0;
  const donutSvg = `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="44" fill="none" stroke="${total ? '#c43e39' : '#dfe7e3'}" stroke-width="22"/>${total ? `<circle cx="60" cy="60" r="44" fill="none" stroke="#075244" stroke-width="22" pathLength="100" stroke-dasharray="${approvedPart.toFixed(3)} ${(100 - approvedPart).toFixed(3)}" transform="rotate(-90 60 60)"/>` : ''}</svg>`;


  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Resumen de Cuenta Pública - ${esc(summaryFilters.year)}</title>
<style>
/* Reporte institucional: tres páginas A4 verticales. */
@page { size: A4 portrait; margin: 12mm; }
* { box-sizing: border-box; }
body { margin: 0; background: #edf1ef; color: #17342b; font: 12px/1.4 Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.actions { text-align: center; padding: 12px; }
.print-btn { border: 0; border-radius: 6px; background: #075244; color: white; padding: 11px 18px; font-weight: 700; cursor: pointer; }
.report { width: 210mm; margin: 12px auto; background: white; padding: 12mm; box-shadow: 0 4px 18px #0002; }
.report-page { min-width: 0; }
.first-page { display: flex; flex-direction: column; min-height: 255mm; }
.page-body { flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 6mm; }
.section-head h2 { margin: 0 0 4px; }
.section-head .muted { margin: 0; }
.report-page + .report-page { margin-top: 18mm; }
.header { display: flex; align-items: center; gap: 15px; padding-bottom: 13px; border-bottom: 2px solid #075244; margin-bottom: 17px; }
.logo { width: 92px; max-height: 76px; object-fit: contain; flex: none; }
.header-title { flex: 1; min-width: 0; }
h1 { margin: 0 0 4px; font-size: 23px; line-height: 1.1; }
.subtitle { margin: 0; color: #33463f; font-size: 15px; }
.description { margin: 4px 0 0; color: #46574f; font-size: 10px; }
.meta { text-align: right; font-size: 9px; color: #33463f; max-width: 132px; }
h2 { font-size: 15px; margin: 22px 0 10px; color: #153c30; }
.muted { color: #3f504a; margin: 0 0 10px; }
.metrics { display: grid; gap: 10px; }
.metrics.four { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.metrics.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.metric { min-width: 0; border: 1px solid #aebfb8; border-radius: 7px; padding: 14px 12px; min-height: 100px; display: flex; flex-direction: column; gap: 7px; justify-content: space-between; }
.metric.ok { border-top: 3px solid #075244; }
.metric.bad { border-top: 3px solid #ba3a38; }
.metric-label { font-size: 10.5px; color: #1f332c; font-weight: 700; }
.metric-value { font-size: 27px; color: #0d2a21; font-weight: 800; line-height: 1.15; overflow-wrap: anywhere; }
.metrics.three .metric-value { font-size: 17px; }
.metrics.three .metric { min-height: 96px; }
.metric-detail { font-size: 9.5px; color: #3a4c45; }
.charts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 0; flex: 1; }
.panel { min-width: 0; border: 1px solid #aebfb8; border-radius: 7px; padding: 14px; display: flex; flex-direction: column; }
.panel .donut-layout, .panel .progress { flex: 1; }
.panel h2 { font-size: 12px; margin: 0 0 12px; }
.donut-layout { display: flex; align-items: center; justify-content: center; gap: 12px; }
.donut { position: relative; width: 150px; height: 150px; flex: none; }
.donut svg { width: 100%; height: 100%; display: block; }
.donut-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.donut-inner strong { font-size: 30px; }
.legend { font-size: 11px; }
.legend div { margin: 9px 0; }
.dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 6px; }
.green { background: #075244; }
.red { background: #c43e39; }
.progress { text-align: center; padding: 8px 0; display: flex; flex-direction: column; justify-content: center; }
.progress strong { font-size: 38px; }
.track { height: 9px; background: #e5eee9; border-radius: 9px; overflow: hidden; margin: 15px 0 8px; }
.fill { height: 100%; background: #075244; }
.tables-grid { display: block; }
.table-page { min-height: 255mm; display: flex; flex-direction: column; }
.table-page .table-section { flex: 1; }
.table-page .footer { margin-top: auto; }
.table-page.approved-page .table-section h2 { border-left: 3px solid #075244; padding-left: 10px; }
.table-page.rejected-page .table-section h2 { border-left: 3px solid #b83232; padding-left: 10px; }
.table-page.rejected-page th { background: #a8242b; border-color: #a8242b; }
.table-page.rejected-page .count { color: #98252a; background: #fce9e9; }
.table-section { margin-bottom: 22px; }
.table-section h2 { border-bottom: 1px solid #d9e4df; padding-bottom: 8px; }
.count { font-size: 11px; padding: 4px 8px; background: #edf4f0; border-radius: 12px; }
table { width: 100%; border-collapse: collapse; table-layout: fixed; }
thead { display: table-header-group; }
tr { break-inside: avoid; page-break-inside: avoid; }
th { background: #075244; color: white; font-size: 10.5px; padding: 10px 8px; border: 1px solid #075244; text-align: center; }
td { font-size: 10.5px; padding: 9px 8px; border: 1px solid #9fb2aa; color: #000; overflow-wrap: anywhere; }
tbody tr:nth-child(even) { background: #eef3f0; }
.table-page td:nth-child(2) { overflow-wrap: normal; word-break: normal; }
.center { text-align: center; }
table.solv th { font-size: 9.5px; font-weight: 700; line-height: 1.2; padding: 8px 4px; }
table.solv td { font-size: 10px; color: #000; padding: 7px 4px; vertical-align: middle; }
table.solv td.ente { text-align: left; overflow-wrap: break-word; }
table.solv td.money { text-align: right; white-space: nowrap; }
table.solv.compact th { font-size: 9px; padding: 5px 3px; }
table.solv.compact td { font-size: 9px; padding: 4px 4px; }
table.solv.tight th { font-size: 8px; padding: 4px 3px; }
table.solv.tight td { font-size: 8px; padding: 2.5px 3px; }
/* Filas de totales */
table.solv tbody tr.total td { font-weight: 700; color: #000; background: #d3e6de; border-top: 2px solid #075244; }
.rejected-page table.solv tbody tr.total td { background: #f4d6d7; border-top-color: #a8242b; }
table.solv tbody tr.total.grand td { background: #e2e2e2; border: 1px solid #000; border-top: 2px solid #000; }
table.solv td.total-label { text-align: left; padding-left: 8px; }
table.solv.extra-total { margin-top: -1px; }
table.solv.grand-gap { margin-top: 10px; }
.year-group { break-inside: avoid; page-break-inside: avoid; }
.year-title { font-size: 12px; margin: 14px 0 6px; color: #0d2a21; }
.year-title:first-of-type { margin-top: 4px; }
.table-page.rejected-page .year-title { color: #98252a; }
.table-page table.solv + .year-title { margin-top: 16px; }
.footer { display: flex; justify-content: space-between; gap: 10px; margin-top: 24px; padding-top: 10px; border-top: 1px solid #aebfb8; color: #33463f; font-size: 9px; }
@media print {
  body { background: white; }
  .actions { display: none; }
  .report { width: auto; padding: 0; margin: 0; box-shadow: none; }
  .report-page + .report-page { margin-top: 0; break-before: page; page-break-before: always; }
  .table-page, .first-page { min-height: 0; height: 273mm; }
  .table-page .footer { margin-top: auto; }
  .header, .metric, .panel { break-inside: avoid; }
}
</style></head><body><div class="actions"><button class="print-btn" onclick="window.print()">Imprimir / Guardar como PDF</button></div><main class="report">
<section class="report-page first-page">
<header class="header"><img class="logo" src="${logo}" alt="Logo institucional UEC"><div class="header-title"><h1>Resumen de Cuenta Pública</h1><p class="subtitle">${yearText}</p><p class="description">Panorama ejecutivo de las cuentas públicas evaluadas.</p></div><div class="meta"><b>UNIDAD DE EVALUACIÓN Y CONTROL</b><br>Fecha de emisión: ${esc(issueDate)}<br>${entityText}</div></header>
<div class="page-body">
<div class="metrics four">${card('Entidades Fiscalizadas',num(entities),'Entes únicos del catálogo')}${card('Ejercicios Fiscales Evaluados',num(years.length),years.map(esc).join(', ') || 'Sin ejercicios')}${card('Cuentas Aprobadas',num(approved.length),pct(approved.length,total)+' del total','ok')}${card('Cuentas No Aprobadas',num(rejected.length),pct(rejected.length,total)+' del total','bad')}</div>
<div class="section-head"><h2>Indicadores de Fiscalización</h2><p class="muted">Observaciones registradas en el apartado de Solventación.</p></div>
<div class="metrics three">${card('Observaciones Fincadas',num(solv.countF),'100% del total fincado')}${card('Observaciones Solventadas',num(solv.countS),pct(solv.countS,solv.countF)+' del total fincado')}${card('Observaciones No Solventadas',num(solv.countNotSolved),pct(solv.countNotSolved,solv.countF)+' del total fincado')}${card('Monto de Observaciones Fincadas',summaryMoney(solv.amountF),'100% del monto fincado')}${card('Monto de Observaciones Solventadas',summaryMoney(solv.amountS),pct(solv.amountS,solv.amountF)+' del monto fincado')}${card('Monto de Observaciones No Solventadas',summaryMoney(solv.amountNotSolved),pct(solv.amountNotSolved,solv.amountF)+' del monto fincado')}</div>
<div class="charts"><section class="panel"><h2>Clasificación de Cuentas Públicas</h2><div class="donut-layout"><div class="donut">${donutSvg}<div class="donut-inner"><strong>${num(total)}</strong><small>evaluadas</small></div></div><div class="legend"><div><i class="dot green"></i><b>Aprobadas</b><br>${approved.length} · ${pct(approved.length,total)}</div><div><i class="dot red"></i><b>No aprobadas</b><br>${rejected.length} · ${pct(rejected.length,total)}</div></div></div></section>
<section class="panel"><h2>${summaryFilters.year === 'all' ? 'Ejercicios Evaluados' : 'Avance de Evaluación'}</h2>${summaryFilters.year === 'all' ? `<div class="progress"><strong>${years.map(esc).join(' · ') || '—'}</strong><p class="muted">Ejercicios fiscales con cuentas evaluadas</p></div>` : `<div class="progress"><strong>${progress.toFixed(1)}%</strong><p>${evaluated} de ${expected} cuentas</p><div class="track"><div class="fill" style="width:${progress.toFixed(1)}%"></div></div><small class="muted">${evaluated} evaluadas · ${progress.toFixed(1)}% del catálogo</small></div>`}</section></div>
</div>
<footer class="footer"><span>Unidad de Evaluación y Control · Reporte ejecutivo</span><span>${yearText} · Página 1 de 3</span></footer>
</section>
<section class="report-page table-page approved-page">
<header class="header"><img class="logo" src="${logo}" alt="Logo institucional UEC"><div class="header-title"><h1>Resumen de Cuenta Pública</h1><p class="subtitle">${yearText}</p><p class="description">Detalle por ente fiscalizado</p></div><div class="meta"><b>UNIDAD DE EVALUACIÓN Y CONTROL</b><br>Fecha de emisión: ${esc(issueDate)}<br>${entityText}</div></header>
${table('Cuentas Aprobadas', approved)}
<footer class="footer"><span>Unidad de Evaluación y Control · Reporte ejecutivo</span><span>${yearText} · Página 2 de 3</span></footer>
</section>
<section class="report-page table-page rejected-page">
<header class="header"><img class="logo" src="${logo}" alt="Logo institucional UEC"><div class="header-title"><h1>Resumen de Cuenta Pública</h1><p class="subtitle">${yearText}</p><p class="description">Detalle por ente fiscalizado</p></div><div class="meta"><b>UNIDAD DE EVALUACIÓN Y CONTROL</b><br>Fecha de emisión: ${esc(issueDate)}<br>${entityText}</div></header>
${table('Cuentas No Aprobadas', rejected, { label: 'Total general · Aprobadas + No aprobadas', rows: exercises })}
<footer class="footer"><span>Unidad de Evaluación y Control · Reporte ejecutivo</span><span>${yearText} · Página 3 de 3</span></footer>
</section>
</main><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),600));<\/script></body></html>`;
  win.document.open();
  win.document.write(html);
  win.document.close();
}
