/* =========================================================
   10. MODELO DE DATOS Y CÁLCULO DE PONDERACIÓN
   La metodología se administra desde Catálogo y se guarda
   en D1 bajo la clave "methodology".
   ========================================================= */

const DEFAULT_METHODOLOGY = {
  majors: [
    {
      key: 'major1',
      label: 'Entrega de Cuenta Pública en tiempo',
      description: 'Verificación independiente del puntaje obtenido.'
    },
    {
      key: 'major2',
      label: 'Sistema Contable Armonizado',
      description: 'Criterio obligatorio para la aprobación.'
    }
  ],
  components: [
    {
      key: 'risk',
      name: 'Variables de Riesgo',
      description: 'Estructura jerárquica de los criterios de mayor ponderación del modelo.',
      groups: [
        {
          key: 'publicAccount',
          name: 'Cuenta Pública conforme a LFyRC',
          items: [
            {
              key: 'doc',
              field: 'risk.doc',
              type: 'checkbox',
              label: 'La documentación presentada cumple con los requisitos de transparencia y veracidad exigidos por la LFyRC y LGCG.',
              points: 1
            },
            {
              key: 'elements',
              field: 'risk.elements',
              type: 'checkbox',
              label: 'La cuenta pública incluye todos los elementos requeridos por la ley, como estados financieros, presupuestales y programáticos como lo indica la normativa vigente.',
              points: 1
            },
            {
              key: 'integrity',
              label: 'La cuenta pública está libre de omisiones significativas o irregularidades que puedan afectar su integridad y fiabilidad.',
              points: 4,
              children: [
                {key:'inventory',field:'risk.inventory',type:'checkbox',label:'Conciliación de inventarios',points:0.2},
                {key:'budget',field:'risk.budget',type:'checkbox',label:'Modificaciones presupuestales',points:0.4},
                {key:'manual',field:'risk.manual',type:'checkbox',label:'Manual de administración de remuneraciones, vigente y autorizado',points:1.6},
                {key:'banks',field:'risk.banks',type:'checkbox',label:'Conciliaciones bancarias',points:1.6},
                {key:'suppliers',field:'risk.suppliers',type:'checkbox',label:'Relación de proveedores',points:0.2}
              ]
            }
          ]
        },
        {
          key:'financialProgress',
          name:'Informe de Avance de Gestión Financiera Art.12 LFRCBCS',
          note:'A más tardar el 31 de agosto.',
          items:[
            {key:'report',field:'risk.report',type:'checkbox',label:'Informe de Avance de Gestión Financiera Art.12 LFRCBCS',points:1}
          ]
        },
        {
          key:'sevac',
          name:'Sistema de Contabilidad Completo (SEvAC) (Anual)',
          items:[
            {key:'sevac',field:'risk.sevac',type:'checkbox',label:'Sistema de Contabilidad Completo (SEvAC)',points:7}
          ]
        },
        {
          key:'acquisitions',
          name:'Ley de Adquisiciones y Servicios',
          items:[
            {key:'proc',field:'risk.proc',type:'checkbox',label:'Procedimiento de Adquisición con evidencias / Expediente Técnico',points:1},
            {key:'annual',field:'risk.annual',type:'checkbox',label:'Programa Anual de adquisiciones',points:4}
          ]
        },
        {
          key:'works',
          name:'Obra Pública',
          requiresWork:true,
          items:[
            {key:'worksprogram',field:'risk.worksprogram',type:'checkbox',label:'Programa Anual de Obras Públicas aprobado',points:2.5},
            {key:'worksfiles',field:'risk.worksfiles',type:'checkbox',label:'Expedientes unitarios debidamente integrado',points:1},
            {key:'paidnot',field:'risk.paidnot',type:'checkbox',label:'Obras pagadas NO ejecutadas',points:2.5}
          ]
        },
        {
          key:'reincidence',
          name:'Reincidencia en:',
          items:[
            {key:'reinc0',field:'risk.reinc.0',type:'checkbox',label:'Sistema contable armonizado',points:1},
            {key:'reinc1',field:'risk.reinc.1',type:'checkbox',label:'Programa anual de adquisiciones, arrendamiento y servicios',points:2},
            {key:'reinc2',field:'risk.reinc.2',type:'checkbox',label:'Manual de remuneraciones y tabulador de sueldos',points:3},
            {key:'reinc3',field:'risk.reinc.3',type:'checkbox',label:'Procedimientos de contratacion justificando la excepcion a licitación pública',points:1},
            {key:'reinc4',field:'risk.reinc.4',type:'checkbox',label:'Levantamiento fisico del inventario de bienes muebles e inmuebles',points:3}
          ]
        },
        {
          key:'countSolvency',
          name:'% de Cantidad Observaciones Solventadas',
          items:[
            {key:'countRatio',type:'ratio',label:'Porcentaje que resulte de dividir la cantidad de observaciones solventadas entre el total de observaciones fincadas. (proporción)',points:15,numerator:'solv.countS',denominator:'solv.countF'}
          ]
        },
        {
          key:'amountSolvency',
          name:'% de Importe de Observaciones Solventadas',
          items:[
            {key:'incomeRatio',type:'ratio',label:'Ingreso',points:5,numerator:'solv.inS',denominator:'solv.inF'},
            {key:'expenseRatio',type:'ratio',label:'Egreso',points:30,numerator:'solv.outS',denominator:'solv.outF'}
          ]
        }
      ]
    },
    {
      key:'control',
      name:'Variables de Control y Transparencia',
      description:'Estructura jerárquica de los criterios de control y transparencia.',
      groups:[
        {
          key:'ldf',
          name:'Ley de Disciplina Financiera',
          items:[
            {key:'ldf0',field:'ctrl.ldf.0',type:'checkbox',label:'La información financiera esta presentada de acuerdo a los criterios de disciplina finaciera, de manera completa en su portal de internet. 1er Trimestre',points:0.75},
            {key:'ldf1',field:'ctrl.ldf.1',type:'checkbox',label:'2do Trimestre',points:0.75},
            {key:'ldf2',field:'ctrl.ldf.2',type:'checkbox',label:'3er Trimestre',points:0.75},
            {key:'ldf3',field:'ctrl.ldf.3',type:'checkbox',label:'4to Trimestre',points:0.75}
          ]
        },
        {
          key:'portal',
          name:'Información de Cuenta Pública en Portales de internet',
          items:[
            {key:'portal0',field:'ctrl.portal.0',type:'checkbox',label:'1er Trimestre',points:0.75},
            {key:'portal1',field:'ctrl.portal.1',type:'checkbox',label:'2do Trimestre',points:0.75},
            {key:'portal2',field:'ctrl.portal.2',type:'checkbox',label:'3er Trimestre',points:0.75},
            {key:'portal3',field:'ctrl.portal.3',type:'checkbox',label:'4to Trimestre',points:0.75}
          ]
        }
      ]
    },
    {
      key:'accountability',
      name:'Variable de Rendición de Cuentas',
      description:'Estructura correspondiente a la presentación de informes mensuales en tiempo.',
      groups:[
        {
          key:'monthlyReports',
          name:'Presentación de Informes Mensuales en tiempo',
          items:[
            'Enero','Febrero','Marzo','Abril','Mayo','Junio',
            'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
          ].map((month,index)=>({
            key:'month'+index,
            field:'months.'+index,
            type:'checkbox',
            label:month,
            points:0.75
          }))
        }
      ]
    }
  ]
};

function getMethodologyConfig(){
  const saved=store.get('methodology',null);
  return saved && Array.isArray(saved.components) ? clone(saved) : clone(DEFAULT_METHODOLOGY);
}

function methodologyItems(group){
  const items=[];
  (group.items||[]).forEach(item=>{
    if(Array.isArray(item.children)) items.push(...item.children);
    else items.push(item);
  });
  return items;
}

function methodologyGroupPoints(group){
  return methodologyItems(group).reduce((sum,item)=>sum+(Number(item.points)||0),0);
}

function methodologyComponentPoints(component){
  return (component.groups||[]).reduce((sum,group)=>sum+methodologyGroupPoints(group),0);
}

function methodologyChildrenPoints(item){
  if(!item || !Array.isArray(item.children)){
    return Number(item && item.points)||0;
  }

  return item.children.reduce(
    (sum,child)=>sum+(Number(child.points)||0),
    0
  );
}

function formatMethodPoints(value){
  const number=Number(value)||0;

  return number.toLocaleString('es-MX',{
    minimumFractionDigits:0,
    maximumFractionDigits:2
  });
}

function methodologyTotal(config=getMethodologyConfig()){
  return (config.components||[]).reduce((sum,component)=>sum+methodologyComponentPoints(component),0);
}

function pathValue(object,path){
  return String(path||'').split('.').reduce((value,key)=>value==null?undefined:value[key],object);
}

function blankExercise(){
  return {
    year:state.year,entity:'',type:'',work:true,major1:true,major2:true,
    risk:{doc:false,elements:false,inventory:false,budget:false,manual:false,banks:false,suppliers:false,report:false,sevac:false,proc:false,annual:false,worksprogram:false,worksfiles:false,paidnot:false,reinc:[false,false,false,false,false]},
    solv:{countF:0,countS:0,inF:0,inS:0,outF:0,outS:0},
    ctrl:{ldf:[false,false,false,false],portal:[false,false,false,false]},
    months:Array(12).fill(false),status:'Borrador'
  };
}

function calc(x){
  const methodology=getMethodologyConfig();
  let raw=0;

  methodology.components.forEach(component=>{
    (component.groups||[]).forEach(group=>{
      if(group.requiresWork && !x.work) return;
      methodologyItems(group).forEach(item=>{
        const points=Number(item.points)||0;
        if(item.type==='ratio'){
          const denominator=Number(pathValue(x,item.denominator))||0;
          const numerator=Number(pathValue(x,item.numerator))||0;
          if(denominator>0) raw+=points*Math.min(1,numerator/denominator);
        }else if(item.field && pathValue(x,item.field)){
          raw+=points;
        }
      });
    });
  });

  const total=methodologyTotal(methodology);
  const workDeduction=methodology.components
    .flatMap(component=>component.groups||[])
    .filter(group=>group.requiresWork)
    .reduce((sum,group)=>sum+methodologyGroupPoints(group),0);

  const base=x.work?total:total-workDeduction;
  const score=base>0?raw*100/base:0;
  const majorOk=(methodology.majors||[]).every(major=>pathValue(x,major.key)!==false);
  const result=!majorOk
    ?'NO APROBADA · Criterio mayor'
    :score>=70?'APROBADA':'NO APROBADA · Por puntaje';

  return {raw,base,score,majorOk,result};
}
