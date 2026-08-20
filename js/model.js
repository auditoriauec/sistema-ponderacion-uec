/* =========================================================
   10. MODELO DE DATOS Y CÁLCULO DE PONDERACIÓN
   Si cambian los puntajes/metodología, esta es una de las
   secciones principales que se debe revisar.
   ========================================================= */
function blankExercise(){return {year:state.year,entity:'',type:'',work:true,major1:true,major2:true,risk:{doc:false,elements:false,inventory:false,budget:false,manual:false,banks:false,suppliers:false,report:false,sevac:false,proc:false,annual:false,worksprogram:false,worksfiles:false,paidnot:false,reinc:[false,false,false,false,false]},solv:{countF:0,countS:0,inF:0,inS:0,outF:0,outS:0},ctrl:{ldf:[false,false,false,false],portal:[false,false,false,false]},months:Array(12).fill(false),status:'Borrador'}}
function calc(x){let r=0;
r+=(x.risk.doc?1:0)+(x.risk.elements?1:0)+(x.risk.inventory?.2:0)+(x.risk.budget?.4:0)+(x.risk.manual?1.6:0)+(x.risk.banks?1.6:0)+(x.risk.suppliers?.2:0)+(x.risk.report?1:0)+(x.risk.sevac?7:0)+(x.risk.proc?1:0)+(x.risk.annual?4:0);
if(x.work)r+=(x.risk.worksprogram?2.5:0)+(x.risk.worksfiles?1:0)+(x.risk.paidnot?2.5:0);
let rw=[1,2,3,1,3];
r+=x.risk.reinc.reduce((s,v,i)=>s+(v?rw[i]:0),0);
r+=x.solv.countF?15*Math.min(1,x.solv.countS/x.solv.countF):0;
r+=x.solv.inF?5*Math.min(1,x.solv.inS/x.solv.inF):0;
r+=x.solv.outF?30*Math.min(1,x.solv.outS/x.solv.outF):0;
r+=.75*x.ctrl.ldf.filter(Boolean).length+.75*x.ctrl.portal.filter(Boolean).length+.75*x.months.filter(Boolean).length;
let base=x.work?100:94,score=r*100/base,majorOk=x.major1&&x.major2,result=!majorOk?'NO APROBADA · Criterio mayor':score>=70?'APROBADA':'NO APROBADA · Por puntaje';
return {raw:r,base,score,majorOk,result}}

