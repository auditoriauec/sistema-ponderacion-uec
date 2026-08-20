/* =========================================================
   7. MÓDULO: RESUMEN EJECUTIVO
   Solo usa ejercicios con estado "Finalizado".
   ========================================================= */
function finalized() {
  return store.get('exercises',[]).filter(x=>x.year===state.year&&x.status==='Finalizado')}
function summary(){
  let a=finalized(), approved=a.filter(x=>x.result==='APROBADA'), bad=a.length-approved.length;

  let avg=a.length?a.reduce((s,x)=>s+x.score,0)/a.length:0;

  let pctOk=a.length?(approved.length/a.length*100).toFixed(1):'0.0';

  let pctBad=a.length?(bad/a.length*100).toFixed(1):'0.0';

  let c='<div class="grid4">'+
    '<div class="card kpi"><div class="ico">👥</div><div><b>Entes evaluados</b><div class="num">'+a.length+'</div><small>Total del ejercicio</small></div></div>'+
    '<div class="card kpi"><div class="ico">✓</div><div><b>Aprobados</b><div class="num">'+approved.length+'</div><small>'+pctOk+'% del total</small></div></div>'+
    '<div class="card kpi"><div class="ico" style="color:var(--red)">×</div><div><b>No aprobados</b><div class="num">'+bad+'</div><small>'+pctBad+'% del total</small></div></div>'+
    '<div class="card kpi"><div class="ico">★</div><div><b>Promedio general</b><div class="num">'+(a.length?avg.toFixed(1):'—')+' / 100</div><small>Puntaje promedio</small></div></div></div>';

  if(a.length){
    let deg=(approved.length/a.length*360).toFixed(1);

    c+='<div class="grid2"><div class="card"><div class="section-title">Clasificación de cuentas públicas</div><div style="display:flex;gap:25px;align-items:center;justify-content:center;padding:30px"><div style="width:180px;height:180px;border-radius:50%;background:conic-gradient(var(--ok) 0 '+deg+'deg,var(--red) '+deg+'deg 360deg);position:relative"><div style="position:absolute;inset:45px;background:white;border-radius:50%"></div></div><div><p><span class="status-ok">■</span> Aprobadas: '+approved.length+'</p><p><span class="status-bad">■</span> No aprobadas: '+bad+'</p></div></div></div>'+
    '<div class="card"><div class="section-title">Promedio por componente</div><div class="bars">'+
    '<div class="barrow"><b>Variables de Riesgo</b><div class="track"><div class="fill" style="width:'+Math.min(100,avg)+'%"></div></div><b>'+(avg*.85).toFixed(1)+' / 85</b></div>'+
    '<div class="barrow"><b>Control y Transparencia</b><div class="track"><div class="fill" style="width:'+Math.min(100,avg)+'%"></div></div><b>'+(avg*.06).toFixed(1)+' / 6</b></div>'+
    '<div class="barrow"><b>Rendición de Cuentas</b><div class="track"><div class="fill" style="width:'+Math.min(100,avg)+'%"></div></div><b>'+(avg*.09).toFixed(1)+' / 9</b></div></div></div></div>';

  }else{
    c+='<div class="empty" style="margin-top:14px"><b>Aún no existen ejercicios de ponderación finalizados para '+state.year+'.</b><br><br>Los indicadores aparecerán automáticamente conforme se guarden ejercicios.</div>';

  }
  $('#app').innerHTML=layout(c,'Resumen Ejecutivo','Panorama general del ejercicio seleccionado');
bindNav();

}

