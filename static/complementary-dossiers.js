'use strict';
(function () {
  const cases = [
    {id:'orders', courses:['Programación'], module:'Programación y bases de datos', title:'Pedidos y prueba de escritorio',
      context:'Datos ficticios: un pedido sin elementos devuelve VACÍO; un pedido con elementos devuelve REVISAR. No se procesa una compra real.',
      tables:[{title:'Pedidos simulados', rows:[['Pedido','Elementos'],['P-001','0'],['P-002','2']]}],
      orders:[{id:'P-001',items:[]},{id:'P-002',items:['ART-A','ART-B']}],
      question:'Contrasta el requerimiento, el diagrama y ambos pedidos. Anota qué caso debe incluir tu prueba de escritorio.'},
    {id:'accounts', courses:['Contabilidad'], module:'Contabilización de operaciones comerciales', title:'Contraste de documentos contables',
      context:'Datos ficticios de comparación documental. Los códigos y unidades no representan un plan contable normativo, impuestos ni una operación real.',
      tables:[{title:'Plan simulado',rows:[['Código','Categoría ficticia'],['A10','Categoría A'],['B20','Categoría B']]},
        {title:'Documento F-001 y registro',rows:[['Fuente','Referencia','Código','Unidades simuladas'],['Documento','F-001','A10','100'],['Registro','F-001','B20','100']]}],
      invoice:{reference:'F-001',account:'A10',amount:100}, entry:{reference:'F-001',account:'B20',amount:100},
      question:'Compara referencia, código y unidades. Identifica la diferencia documental sin inferir el tratamiento contable de una operación real.'},
    {id:'hygiene', courses:['Gastronomía, mención Cocina','Gastronomía, mención Pastelería y Repostería'], module:'Higiene para la elaboración de alimentos', title:'Trazabilidad de una planilla de higiene',
      context:'Datos ficticios de revisión de registros. No describen una técnica de limpieza ni acreditan condiciones sanitarias reales.',
      tables:[{title:'Elementos previstos para preparación',rows:[['Elemento','Referencia'],['U-01','PREP-A'],['U-02','PREP-A']]},
        {title:'Planilla simulada de constancias',rows:[['Elemento','Constancia'],['U-01','Sin registro'],['U-02','REG-002']]}],
      records:[{id:'U-01',record:null},{id:'U-02',record:'REG-002'}],
      question:'Identifica qué elemento carece de constancia. Distingue la ausencia de registro de una conclusión sobre su estado sanitario real.'}
  ];
  const fold = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const safe = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const catalog = new Map((window.AulaComplementaryCatalog?.entries || []).map(item => [JSON.stringify([fold(item.course), fold(item.module)]), item]));
  function documentary(source) {
    const prefix = `SIM-${source.id.toUpperCase()}`;
    const records = [
      {id:`${prefix}-01`, expected:'Versión A', received:'Versión A'},
      {id:`${prefix}-02`, expected:'Versión A', received:null},
      {id:`${prefix}-03`, expected:'Versión B', received:'Versión A'}
    ];
    return {id:'documentary', title:`Revisión documental · ${source.module}`, course:source.course, module:source.module, aes:source.aes,
      context:`Práctica nueva y ficticia de trazabilidad documental para ${source.course}, módulo ${source.position}: ${source.module}. Las versiones y referencias simuladas no son planos, mediciones, normas ni instrucciones técnicas de ejecución.`,
      tables:[{title:'Documentación prevista · Datos ficticios',rows:[['Referencia simulada','Versión requerida'],...records.map(row=>[row.id,row.expected])]},
        {title:'Registro recibido · Datos ficticios',rows:[['Referencia simulada','Versión recibida'],...records.map(row=>[row.id,row.received||'Sin documento recibido'])]}],
      records, question:'Compara ambas planillas. Identifica la referencia coincidente, el documento ausente y la diferencia de versión. Anota qué información original necesitarías revisar antes de realizar una actividad del módulo. La coincidencia documental no acredita una competencia técnica.'};
  }
  function find(course, module) {
    const specific=cases.find(item=>item.courses.some(title=>fold(title)===fold(course?.title)) && fold(item.module)===fold(module?.title));
    if(specific)return specific;
    const source=catalog.get(JSON.stringify([fold(course?.title),fold(module?.title)]));
    return source?documentary(source):null;
  }
  function active() {
    if(typeof current==='undefined'||typeof courses==='undefined')return null;
    return find(courses.find(course=>Number(course.id)===Number(current?.course_id)),current);
  }
  function launcher() {
    return active()?`<button type="button" class="outline complementary-launch" data-complementary-open>${typeof workIco==='function'?workIco('file'):''}Dossier complementario · Sin calificación</button>`:'';
  }
  function programResult(order) {
    if(!order || !Array.isArray(order.items))return 'Pedido no disponible.';
    return order.items.length===0?'VACÍO':'REVISAR';
  }
  function contrast(item) {
    if(item.id==='orders')return item.orders.map(order=>`${order.id}: ${programResult(order)}`).join('\n');
    if(item.id==='accounts')return ['reference','account','amount'].map((key,i)=>`${['Referencia','Código','Unidades simuladas'][i]}: ${item.invoice[key]===item.entry[key]?'coinciden':`${item.invoice[key]} / ${item.entry[key]} · diferencia documental`}`).join('\n');
    if(item.id==='hygiene')return item.records.map(row=>`${row.id}: ${row.record||'sin constancia en esta planilla ficticia'}`).join('\n');
    if(item.id==='documentary')return item.records.map(row=>`${row.id}: ${row.received===null?'documento ausente':row.received===row.expected?'referencia y versión coinciden':`diferencia de versión · requerida ${row.expected}, recibida ${row.received}`}`).join('\n');
    return '';
  }
  function markup(item) {
    const diagram=item.id==='orders'?`<section><h3>Diagrama del requerimiento ficticio</h3><div class="complementary-flow"><span>Inicio</span><span aria-hidden="true">↓</span><span>¿El pedido tiene cero elementos?</span><div class="complementary-branches"><span>Sí → VACÍO</span><span>No → REVISAR</span></div></div><pre>si elementos.length === 0: devolver "VACÍO"\nsi no: devolver "REVISAR"</pre></section>`:'';
    const reference=item.aes?`<section><h3>Referencia del módulo · AE originales</h3><p class="small muted">Estos enunciados contextualizan el módulo; esta práctica documental no acredita su cumplimiento.</p><ul>${item.aes.map(ae=>`<li><strong>${safe(ae.code)}</strong>: ${safe(ae.title)}</li>`).join('')}</ul></section>`:'';
    return `<div class="complementary-dossier"><h2>${safe(item.title)}</h2><p class="badge">Práctica complementaria · Datos ficticios · Sin calificación</p><p>${safe(item.context)}</p>${item.tables.map(table=>`<section><h3>${safe(table.title)}</h3><div class="mcq-table-wrap"><table class="mcq-table">${table.rows.map((row,i)=>`<tr>${row.map(cell=>i?`<td>${safe(cell)}</td>`:`<th scope="col">${safe(cell)}</th>`).join('')}</tr>`).join('')}</table></div></section>`).join('')}${diagram}<section><h3>Revisión documental</h3><p>${safe(item.question)}</p><label for="complementary-notes">Tus anotaciones temporales<textarea id="complementary-notes" rows="4" maxlength="3000"></textarea></label><button type="button" class="outline" data-complementary-contrast>Contrastar los datos</button><pre data-complementary-result role="status" hidden></pre></section>${reference}<p class="small muted">Este dossier es nuevo y ficticio. No pertenece a la evaluación original, no guarda respuestas ni modifica notas, avance o evidencias.</p></div>`;
  }
  function open() {
    const item=active(), dialog=document.getElementById('tool'), root=document.getElementById('tool-content');
    if(!item||!dialog||!root)return;
    root.innerHTML=markup(item);
    root.querySelector('[data-complementary-contrast]').addEventListener('click',()=>{
      const output=root.querySelector('[data-complementary-result]');
      output.textContent=contrast(item);output.hidden=false;
    });
    if(!dialog.open)dialog.showModal();
  }
  document.addEventListener('click',event=>{if(event.target.closest('[data-complementary-open]'))open();});
  window.AulaComplementary={find,launcher,open,markup,contrast,programResult};
})();
