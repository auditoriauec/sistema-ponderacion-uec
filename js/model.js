/* =========================================================
   10. MODELO DE DATOS Y CÁLCULO DE PONDERACIÓN
   - Catálogo = máximos y estructura metodológica.
   - Ejercicio = puntaje realmente obtenido + aplicabilidad.
   - Los ejercicios guardan una fotografía de su metodología.
   ========================================================= */

const DEFAULT_METHODOLOGY = {
  majors: [
    {key:'major1',label:'Entrega de Cuenta Pública en tiempo',description:'Criterio obligatorio para la aprobación.'},
    {key:'major2',label:'Sistema Contable Armonizado',description:'Criterio obligatorio para la aprobación.'}
  ],
  components: [
    {
      key:'risk',name:'Variables de Riesgo',description:'Variables asociadas al riesgo de la Cuenta Pública.',groups:[
        {key:'publicAccount',name:'Cuenta Pública conforme a LFyRC',items:[
          {key:'doc',field:'risk.doc',type:'score',label:'La documentación presentada cumple con los requisitos de transparencia y veracidad exigidos por la LFyRC y LGCG.',points:1},
          {key:'elements',field:'risk.elements',type:'score',label:'La cuenta pública incluye todos los elementos requeridos por la ley, como estados financieros, presupuestales y programáticos como lo indica la normativa vigente.',points:1},
          {key:'integrity',label:'La cuenta pública está libre de omisiones significativas o irregularidades que puedan afectar su integridad y fiabilidad.',children:[
            {key:'inventory',field:'risk.inventory',type:'score',label:'Conciliación de inventarios',points:0.2},
            {key:'budget',field:'risk.budget',type:'score',label:'Modificaciones presupuestales',points:0.4},
            {key:'manual',field:'risk.manual',type:'score',label:'Manual de administración de remuneraciones, vigente y autorizado',points:1.6},
            {key:'banks',field:'risk.banks',type:'score',label:'Conciliaciones bancarias',points:1.6},
            {key:'suppliers',field:'risk.suppliers',type:'score',label:'Relación de proveedores',points:0.2}
          ]}
        ]},
        {key:'financialReport',name:'Informe de Avance de Gestión Financiera Art.12 LFRCBCS',note:'A más tardar el 31 de agosto',items:[
          {key:'report',field:'risk.report',type:'score',label:'Informe de Avance de Gestión Financiera Art.12 LFRCBCS',points:1}
        ]},
        {key:'sevacGroup',name:'Sistema de Contabilidad Completo (SEvAC) (Anual)',items:[
          {key:'sevac',field:'risk.sevac',type:'sevac',label:'Sistema de Contabilidad Completo (SEvAC)',points:7}
        ]},
        {key:'purchases',name:'Ley de Adquisiciones y Servicios',items:[
          {key:'proc',field:'risk.proc',type:'score',label:'Procedimiento de Adquisición con evidencias / Expediente Técnico',points:1},
          {key:'annual',field:'risk.annual',type:'score',label:'Programa Anual de adquisiciones',points:4}
        ]},
        {key:'works',name:'Obra Pública',requiresWork:true,items:[
          {key:'worksprogram',field:'risk.worksprogram',type:'score',label:'Programa Anual de Obras Públicas aprobado',points:2.5},
          {key:'worksfiles',field:'risk.worksfiles',type:'score',label:'Expedientes unitarios debidamente integrado',points:1},
          {key:'paidnot',field:'risk.paidnot',type:'score',label:'Obras pagadas NO ejecutadas',points:2.5}
        ]},
        {key:'recurrence',name:'Reincidencia en:',items:[
          {key:'reinc0',field:'risk.reinc.0',type:'score',label:'Sistema contable armonizado',points:1},
          {key:'reinc1',field:'risk.reinc.1',type:'score',label:'Programa anual de adquisiciones, arrendamiento y servicios',points:2},
          {key:'reinc2',field:'risk.reinc.2',type:'score',label:'Manual de remuneraciones y tabulador de sueldos',points:3},
          {key:'reinc3',field:'risk.reinc.3',type:'score',label:'Procedimientos de contratacion justificando la excepcion a licitación pública',points:1},
          {key:'reinc4',field:'risk.reinc.4',type:'score',label:'Levantamiento fisico del inventario de bienes muebles e inmuebles',points:3}
        ]},
        {key:'countSolvency',name:'% de Cantidad Observaciones Solventadas',items:[
          {key:'countRatio',type:'ratio',ratioKind:'count',label:'Porcentaje que resulte de dividir la cantidad de observaciones solventadas entre el total de observaciones fincadas. (proporción)',points:15,numerator:'solv.countS',denominator:'solv.countF'}
        ]},
        {key:'amountSolvency',name:'% de Importe de Observaciones Solventadas',items:[
          {key:'incomeRatio',type:'ratio',ratioKind:'income',label:'Ingreso',points:5,numerator:'solv.inS',denominator:'solv.inF'},
          {key:'expenseRatio',type:'ratio',ratioKind:'expense',label:'Egreso',points:30,numerator:'solv.outS',denominator:'solv.outF'}
        ]}
      ]
    },
    {
      key:'control',name:'Variables de Control y Transparencia',groups:[
        {key:'ldf',name:'Ley de Disciplina Financiera',items:[
          {key:'ldf0',field:'ctrl.ldf.0',type:'score',label:'La información financiera esta presentada de acuerdo a los criterios de disciplina finaciera, de manera completa en su portal de internet. 1er Trimestre',points:0.75},
          {key:'ldf1',field:'ctrl.ldf.1',type:'score',label:'2do Trimestre',points:0.75},
          {key:'ldf2',field:'ctrl.ldf.2',type:'score',label:'3er Trimestre',points:0.75},
          {key:'ldf3',field:'ctrl.ldf.3',type:'score',label:'4to Trimestre',points:0.75}
        ]},
        {key:'portal',name:'Información de Cuenta Pública en Portales de internet',items:[
          {key:'portal0',field:'ctrl.portal.0',type:'score',label:'1er Trimestre',points:0.75},
          {key:'portal1',field:'ctrl.portal.1',type:'score',label:'2do Trimestre',points:0.75},
          {key:'portal2',field:'ctrl.portal.2',type:'score',label:'3er Trimestre',points:0.75},
          {key:'portal3',field:'ctrl.portal.3',type:'score',label:'4to Trimestre',points:0.75}
        ]}
      ]
    },
    {
      key:'accountability',name:'Variable de Rendición de Cuentas',groups:[
        {key:'monthlyReports',name:'Presentación de Informes Mensuales en tiempo',items:[
          ...['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
            .map((month,index)=>({key:'month'+index,field:'months.'+index,type:'score',label:month,points:0.75}))
        ]}
      ]
    }
  ]
};

function getMethodologyConfig(){
  const saved=store.get('methodology',null);
  return saved&&Array.isArray(saved.components)&&saved.components.length?saved:clone(DEFAULT_METHODOLOGY);
}

function methodologyItems(group){
  return (group.items||[]).flatMap(item=>Array.isArray(item.children)?item.children:[item]);
}

function methodologyChildrenPoints(item){
  return (item.children||[]).reduce((sum,child)=>sum+(Number(child.points)||0),0);
}

function methodologyGroupPoints(group){
  return (group.items||[]).reduce((sum,item)=>sum+(Array.isArray(item.children)?methodologyChildrenPoints(item):(Number(item.points)||0)),0);
}

function methodologyComponentPoints(component){
  return (component.groups||[]).reduce((sum,group)=>sum+methodologyGroupPoints(group),0);
}

function formatMethodPoints(value){
  return (Number(value)||0).toLocaleString('es-MX',{minimumFractionDigits:0,maximumFractionDigits:2});
}

function methodologyTotal(config=getMethodologyConfig()){
  return (config.components||[]).reduce((sum,component)=>sum+methodologyComponentPoints(component),0);
}

function pathValue(object,path){
  return String(path||'').split('.').reduce((value,key)=>value==null?undefined:value[key],object);
}

function exerciseMethodology(x){
  return x?.methodologySnapshot?.components?.length?x.methodologySnapshot:getMethodologyConfig();
}

function makeAssessmentEntry(){
  return {points:0,applicable:true,note:'',value:null};
}

function blankExercise(){
  return {
    year:state.year,
    entity:'',
    type:'',
    work:true,
    major1:true,
    major2:true,
    assessment:{},
    solv:{
      countF:0,
      countS:0,
      inF:0,
      inS:0,
      outF:0,
      outS:0,
      expenseBreakdown:{
        complianceF:0,
        complianceS:0,
        budgetF:0,
        budgetS:0,
        expenseF:0,
        expenseS:0,
        publicWorksF:0,
        publicWorksS:0
      }
    },
    methodologySnapshot:clone(getMethodologyConfig()),
    status:'Borrador'
  };
}

function assessmentEntry(x,item){
  if(!x.assessment) x.assessment={};
  if(!x.assessment[item.key]){
    const entry=makeAssessmentEntry();
    const old=item.field?pathValue(x,item.field):undefined;
    if(typeof old==='boolean') entry.points=old?(Number(item.points)||0):0;
    x.assessment[item.key]=entry;
  }
  return x.assessment[item.key];
}

function roundPoints(value){
  return Math.round(
    (Number(value) + Number.EPSILON) * 100
  ) / 100;
}

function ratioValues(
  x,
  item
){
  const denominator = Math.max(
    0,
    Number(
      pathValue(
        x,
        item.denominator
      )
    ) || 0
  );

  const numerator = Math.max(
    0,
    Number(
      pathValue(
        x,
        item.numerator
      )
    ) || 0
  );

  const ratio =
    denominator > 0
      ? Math.min(
          1,
          numerator / denominator
        )
      : 0;

  const points = roundPoints(
    ratio *
    (
      Number(item.points) || 0
    )
  );

  return {
    denominator,
    numerator,
    ratio,
    points
  };
}

function itemCalculation(
  x,
  item,
  group
){
  const max =
    Number(item.points) || 0;

  const entry =
    assessmentEntry(
      x,
      item
    );

  const groupApplies =
    !(
      group?.requiresWork &&
      !x.work
    );

  const applicable =
    groupApplies &&
    entry.applicable !== false;

  if (!applicable) {
    return {
      max,
      applicable:false,
      points:0,
      base:0,
      entry
    };
  }

  if (item.type === 'ratio') {
    const ratio =
      ratioValues(
        x,
        item
      );

    return {
      ...ratio,
      max,
      applicable:true,
      base:max,
      entry
    };
  }

  if (item.type === 'sevac') {
    const percentage =
      Math.max(
        0,
        Math.min(
          100,
          Number(entry.value) || 0
        )
      );

    const points =
      roundPoints(
        max *
        (
          percentage / 100
        )
      );

    return {
      max,
      applicable:true,
      base:max,
      points,
      percentage,
      entry
    };
  }

  const points =
    roundPoints(
      Math.max(
        0,
        Math.min(
          max,
          Number(entry.points) || 0
        )
      )
    );

  return {
    max,
    applicable:true,
    base:max,
    points,
    entry
  };
}

function componentCalculation(x,component){
  let raw=0,base=0;
  (component.groups||[]).forEach(group=>{
    methodologyItems(group).forEach(item=>{
      const c=itemCalculation(x,item,group);
      raw+=c.points;base+=c.base;
    });
  });
  return {raw,base};
}

function calc(x){
  const methodology=exerciseMethodology(x);
  let raw=0,base=0;
  const components={};

  (methodology.components||[]).forEach(component=>{
    const c=componentCalculation(x,component);
    components[component.key]=c;
    raw+=c.raw;base+=c.base;
  });

  const majorOk=(methodology.majors||[]).every(major=>pathValue(x,major.key)!==false);
  const score=base>0?raw*100/base:0;
  const result=!majorOk?'NO APROBADA · Criterio mayor':score>=70?'APROBADA':'NO APROBADA · Por puntaje';
  return {raw,base,score,majorOk,result,components};
}
