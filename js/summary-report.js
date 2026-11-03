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

/* Paginación del reporte (se ejecuta dentro de la ventana del reporte).
   Reparte cada tabla en hojas A4: si no cabe, continúa en la siguiente hoja con
   encabezado, título "(continuación)", encabezado de columnas, pie y numeración.
   Los totales nunca quedan solos: viajan junto con la última fila de datos. */
function summaryReportPaginate() {
  var report = document.querySelector('main.report');
  var tpl = document.getElementById('page-tpl');
  var content, sec, tbody;

  function fits() { return content.scrollHeight <= content.clientHeight + 1; }

  function openPage(kind, title, count, contd) {
    var page = tpl.content.firstElementChild.cloneNode(true);
    page.classList.add(kind);
    report.appendChild(page);
    content = page.querySelector('.page-content');
    sec = document.createElement('section');
    sec.className = 'table-section';
    sec.innerHTML = '<h2>' + title + ' <span class="count">' + count + '</span>' +
      (contd ? ' <span class="contd">(continuación)</span>' : '') + '</h2>';
    content.appendChild(sec);
  }

  function openTable(group, contd) {
    var label = group.getAttribute('data-label');
    var proto = group.querySelector('table');
    var h3 = null;
    if (label) {
      h3 = document.createElement('h3');
      h3.className = 'year-title';
      h3.innerHTML = 'Ejercicio Fiscal ' + label + ' <span class="count">' + group.getAttribute('data-count') + '</span>' +
        (contd ? ' <span class="contd">(continuación)</span>' : '');
      sec.appendChild(h3);
    }
    var t = document.createElement('table');
    t.className = proto.className;
    t.innerHTML = proto.querySelector('colgroup').outerHTML + proto.querySelector('thead').outerHTML;
    var tb = document.createElement('tbody');
    t.appendChild(tb);
    sec.appendChild(t);
    return { tbody: tb, table: t, title: h3 };
  }

  Array.prototype.forEach.call(document.querySelectorAll('.src-section'), function (src) {
    var kind = src.getAttribute('data-kind');
    var title = src.getAttribute('data-title');
    var count = src.getAttribute('data-count');
    openPage(kind, title, count, false);

    Array.prototype.forEach.call(src.querySelectorAll('.src-group'), function (group) {
      var rows = Array.prototype.slice.call(group.querySelectorAll('tbody > tr'));
      var current = openTable(group, false);
      tbody = current.tbody;

      // Si ni el título del ejercicio con su encabezado caben, pasar a la hoja siguiente.
      if (!fits() && sec.querySelectorAll('table').length > 1) {
        if (current.title) sec.removeChild(current.title);
        sec.removeChild(current.table);
        openPage(kind, title, count, true);
        current = openTable(group, false);
        tbody = current.tbody;
      }

      rows.forEach(function (row) {
        tbody.appendChild(row);
        if (fits()) return;
        var move = [row];
        tbody.removeChild(row);
        if (row.classList.contains('total')) {
          var prev = tbody.lastElementChild;
          while (prev && prev.classList.contains('total')) {
            move.unshift(prev); tbody.removeChild(prev); prev = tbody.lastElementChild;
          }
          if (prev && tbody.children.length > 1) { move.unshift(prev); tbody.removeChild(prev); }
        }
        openPage(kind, title, count, true);
        current = openTable(group, true);
        tbody = current.tbody;
        move.forEach(function (m) { tbody.appendChild(m); });
      });
    });
  });

  var pages = document.querySelectorAll('.report-page');
  Array.prototype.forEach.call(pages, function (page, i) {
    Array.prototype.forEach.call(page.querySelectorAll('.pg'), function (el) {
      el.textContent = 'Página ' + (i + 1) + ' de ' + pages.length;
    });
  });
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
  // Devuelve el contenido "fuente": summaryReportPaginate() lo reparte en hojas con encabezado,
  // pie y numeración, continuando la tabla en otra hoja cuando no cabe.
  const table = (title, items, kind, grand = null) => {
    const byYear = summaryFilters.year === 'all';
    const sorted = [...items].sort((a, b) => summaryScore(b) - summaryScore(a));
    const groups = byYear
      ? [...new Set(sorted.map(x => String(x.year)))].sort().map(y => ({ label: y, rows: sorted.filter(x => String(x.year) === y) }))
      : [{ label: null, rows: sorted }];

    // Densidad: normal si es poca información; compacta (nunca menor a 9px) si hay muchas filas.
    const units = sorted.length + (byYear ? groups.length * 2.5 : 0) + 1 + (groups.length > 1 ? 1 : 0) + (grand ? 1 : 0);
    const density = units <= 24 ? '' : 'compact';

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
    const totalRow = (label, rows, cls = '') => {
      const t = summarySolvencyTotals(rows);
      return `
        <tr class="total ${cls}">
          <td colspan="2" class="total-label">${label}</td>
          <td class="center">${num(t.countF)}</td>
          <td class="center">${num(t.countS)}</td>
          <td class="center">${num(t.countNotSolved)}</td>
          <td class="money">${summaryMoney(t.amountF)}</td>
          <td class="money">${summaryMoney(t.amountS)}</td>
          <td class="money">${summaryMoney(t.amountNotSolved)}</td>
        </tr>`;
    };

    const lastIndex = groups.length - 1;
    const groupsHtml = items.length
      ? groups.map((g, gi) => {
          let body = rowsHtml(g.rows) + totalRow(g.label ? `Total ${esc(g.label)}` : 'Total', g.rows);
          if (gi === lastIndex) {
            if (groups.length > 1) body += totalRow(`Total ${esc(title)}`, sorted, 'section');
            if (grand) body += totalRow(grand.label, grand.rows, 'grand');
          }
          return `<div class="src-group" data-label="${esc(g.label || '')}" data-count="${g.rows.length}"><table class="solv ${density}">${cols}${head}<tbody>${body}</tbody></table></div>`;
        }).join('')
      : `<div class="src-group" data-label="" data-count="0"><table class="solv">${cols}${head}<tbody><tr><td colspan="8" class="center">Sin cuentas para mostrar.</td></tr></tbody></table></div>`;

    return `<div class="src-section" data-kind="${kind}" data-title="${esc(title)}" data-count="${items.length}">${groupsHtml}</div>`;
  };

  const pageHeader = description => `<header class="header"><img class="logo" src="${logo}" alt="Logo institucional UEC"><div class="header-title"><h1>Resumen de Cuenta Pública</h1><p class="subtitle">${yearText}</p><p class="description">${description}</p></div><div class="meta"><b>UNIDAD DE EVALUACIÓN Y CONTROL</b><br>Fecha de emisión: ${esc(issueDate)}<br>${entityText}</div></header>`;
  const pageFooter = `<footer class="footer"><span>Unidad de Evaluación y Control · Reporte ejecutivo</span><span>${yearText} · <span class="pg"></span></span></footer>`;

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
.logo { width: 92px; height: 76px; object-fit: contain; flex: none; }
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
.table-page { height: 273mm; min-height: 0; display: flex; flex-direction: column; }
.page-content { flex: 1; min-height: 0; overflow: hidden; }
.table-page .footer { margin-top: 8px; }
.src-root { display: none; }
.contd { font-size: 11px; font-weight: 400; color: #46574f; }
.table-page.approved-page .table-section h2 { border-left: 3px solid #075244; padding-left: 10px; }
.table-page.rejected-page .table-section h2 { border-left: 3px solid #b83232; padding-left: 10px; }
.table-page.rejected-page th { background: #a8242b; border-color: #a8242b; }
.table-page.rejected-page .count { color: #98252a; background: #fce9e9; }
.table-section { margin-bottom: 0; }
.table-section h2 { margin-top: 4px; }
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
table.solv tbody tr.total.section td { background: #b7d6c8; }
.rejected-page table.solv tbody tr.total.section td { background: #ecb9bb; }
table.solv tbody tr.total.grand td { border-top: 2px solid #000; }
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
${pageHeader('Panorama ejecutivo de las cuentas públicas evaluadas.')}
<div class="page-body">
<div class="metrics four">${card('Entidades Fiscalizadas',num(entities),'Entes únicos del catálogo')}${card('Ejercicios Fiscales Evaluados',num(years.length),years.map(esc).join(', ') || 'Sin ejercicios')}${card('Cuentas Aprobadas',num(approved.length),pct(approved.length,total)+' del total','ok')}${card('Cuentas No Aprobadas',num(rejected.length),pct(rejected.length,total)+' del total','bad')}</div>
<div class="section-head"><h2>Indicadores de Fiscalización</h2><p class="muted">Observaciones registradas en el apartado de Solventación.</p></div>
<div class="metrics three">${card('Observaciones Fincadas',num(solv.countF),'100% del total fincado')}${card('Observaciones Solventadas',num(solv.countS),pct(solv.countS,solv.countF)+' del total fincado')}${card('Observaciones No Solventadas',num(solv.countNotSolved),pct(solv.countNotSolved,solv.countF)+' del total fincado')}${card('Monto de Observaciones Fincadas',summaryMoney(solv.amountF),'100% del monto fincado')}${card('Monto de Observaciones Solventadas',summaryMoney(solv.amountS),pct(solv.amountS,solv.amountF)+' del monto fincado')}${card('Monto de Observaciones No Solventadas',summaryMoney(solv.amountNotSolved),pct(solv.amountNotSolved,solv.amountF)+' del monto fincado')}</div>
<div class="charts"><section class="panel"><h2>Clasificación de Cuentas Públicas</h2><div class="donut-layout"><div class="donut">${donutSvg}<div class="donut-inner"><strong>${num(total)}</strong><small>evaluadas</small></div></div><div class="legend"><div><i class="dot green"></i><b>Aprobadas</b><br>${approved.length} · ${pct(approved.length,total)}</div><div><i class="dot red"></i><b>No aprobadas</b><br>${rejected.length} · ${pct(rejected.length,total)}</div></div></div></section>
<section class="panel"><h2>${summaryFilters.year === 'all' ? 'Ejercicios Evaluados' : 'Avance de Evaluación'}</h2>${summaryFilters.year === 'all' ? `<div class="progress"><strong>${years.map(esc).join(' · ') || '—'}</strong><p class="muted">Ejercicios fiscales con cuentas evaluadas</p></div>` : `<div class="progress"><strong>${progress.toFixed(1)}%</strong><p>${evaluated} de ${expected} cuentas</p><div class="track"><div class="fill" style="width:${progress.toFixed(1)}%"></div></div><small class="muted">${evaluated} evaluadas · ${progress.toFixed(1)}% del catálogo</small></div>`}</section></div>
</div>
${pageFooter}
</section>
</main>
<div class="src-root">${table('Cuentas Aprobadas', approved, 'approved-page')}${table('Cuentas No Aprobadas', rejected, 'rejected-page', { label: 'Total general · Aprobadas + No aprobadas', rows: exercises })}</div>
<template id="page-tpl"><section class="report-page table-page">${pageHeader('Detalle por ente fiscalizado')}<div class="page-content"></div>${pageFooter}</section></template>
<script>window.addEventListener('load',()=>{(${summaryReportPaginate.toString()})();setTimeout(()=>window.print(),600)});<\/script></body></html>`;
  win.document.open();
  win.document.write(html);
  win.document.close();
}
