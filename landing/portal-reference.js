const specialties={automotriz:{title:'Mecánica Automotriz',position:'0%',description:'Forma técnicos capaces de diagnosticar, mantener y reparar sistemas mecánicos, eléctricos y electrónicos de vehículos, aplicando procedimientos seguros y documentación técnica.',branches:['Mantenimiento de motores y sistemas auxiliares','Diagnóstico eléctrico y electrónico','Sistemas de frenos, dirección y suspensión']},electricidad:{title:'Electricidad',position:'25%',photoClass:'photo-electricidad',description:'Prepara para instalar, mantener y verificar sistemas eléctricos domiciliarios e industriales, utilizando instrumentos, planos y normativa de seguridad vigente.',branches:['Instalaciones eléctricas domiciliarias','Instalaciones y control industrial','Normativa SEC y prevención de riesgos']},enfermeria:{title:'Atención de Enfermería',position:'25%',photoClass:'photo-enfermeria',description:'Desarrolla cuidados básicos, signos vitales, bioseguridad y registro clínico en contextos de salud, con menciones en Enfermería y Adulto Mayor.',branches:['Cuidados básicos y signos vitales','Bioseguridad y registro clínico','Menciones: Enfermería · Adulto Mayor']},climatizacion:{title:'Refrigeración y Climatización',position:'50%',photoClass:'photo-climatizacion',description:'Forma para el montaje, puesta en marcha, diagnóstico y mantención de sistemas térmicos con procedimientos seguros y documentación técnica.',branches:['Montaje y puesta en marcha','Diagnóstico y mantención','Sistemas térmicos y eficiencia']},construccion:{title:'Construcción',position:'50%',description:'Desarrolla competencias para ejecutar, supervisar y controlar procesos constructivos, interpretar planos y verificar calidad y seguridad en obra.',branches:['Edificación','Terminaciones de la Construcción','Obras Viales e Infraestructura']},electronica:{title:'Electrónica',position:'75%',description:'Forma técnicos para montar, programar, diagnosticar y mantener circuitos, equipos electrónicos y sistemas de automatización.',branches:['Circuitos y equipos electrónicos','Control y automatización industrial','Diagnóstico y mantenimiento electrónico']},gastronomia:{title:'Gastronomía',position:'100%',description:'Desarrolla capacidades para planificar y ejecutar preparaciones gastronómicas con estándares de higiene, calidad, servicio y organización productiva.',branches:['Cocina','Pastelería y Repostería','Producción, higiene y servicio gastronómico']}};

const campusUrl='https://aulatpchile.cl/portal/cursos/';
const teacherPortalUrl='https://aulatpchile.cl/portal-docente';
const liveCourseTitles=new Set(['Electricidad','Atención de Enfermería','Refrigeración y Climatización']);
function nativeCta(href,label,className){
  const a=document.createElement('a');
  a.className=className;
  a.href=href;
  a.innerHTML=`${label} <i data-lucide="arrow-right"></i>`;
  return a;
}
document.querySelectorAll('.campus-link').forEach(link=>{const specialty=link.dataset.detailLink;link.href=specialty?`${campusUrl}?q=${encodeURIComponent(specialty)}`:campusUrl});
const specialtyCatalogLink=document.querySelector('#especialidades .section-heading .campus-link');
if(specialtyCatalogLink)specialtyCatalogLink.href=campusUrl;
document.querySelectorAll('.portal-link').forEach(link=>{link.href=teacherPortalUrl});
document.querySelectorAll('.capabilities a').forEach(card=>{card.removeAttribute('href');card.removeAttribute('target');card.classList.remove('campus-link','portal-link');card.classList.add('capability-card');card.tabIndex=-1});
const menu=document.querySelector('[data-menu]'),nav=document.querySelector('#nav');menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));nav?.classList.toggle('open',!open)});nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menu?.setAttribute('aria-expanded','false');nav.classList.remove('open')}));
const navLinks=[...(nav?.querySelectorAll('a')||[])];navLinks.forEach(link=>link.addEventListener('click',()=>{navLinks.forEach(item=>item.classList.toggle('active',item===link))}));

const dialog=document.querySelector('[data-specialty-dialog]');let lastTrigger=null;document.querySelectorAll('[data-specialty]').forEach(button=>button.addEventListener('click',()=>{const item=specialties[button.dataset.specialty];if(!item)return;lastTrigger=button;const photo=dialog.querySelector('[data-detail-photo]');photo.classList.remove('photo-electricidad','photo-enfermeria','photo-climatizacion');photo.style.backgroundImage='';photo.style.backgroundSize='';photo.style.backgroundPosition='';if(item.photoClass){photo.classList.add(item.photoClass);}else if(item.photo){photo.style.backgroundImage=`url('${item.photo}')`;photo.style.backgroundSize='cover';photo.style.backgroundPosition='center';}else{photo.style.backgroundSize='500% auto';photo.style.backgroundPosition=`${item.position} center`;}dialog.querySelector('[data-detail-title]').textContent=item.title;dialog.querySelector('[data-detail-description]').textContent=item.description;dialog.querySelector('[data-detail-branches]').replaceChildren(...item.branches.map(branch=>{const li=document.createElement('li');li.textContent=branch;return li}));const detailLink=dialog.querySelector('[data-detail-link]');const live=liveCourseTitles.has(item.title);const nivel=dialog.querySelector('.detail-meta dd');if(nivel)nivel.textContent=live?'3° medio · piloto con evidencia':'Especialidad en preparación · 4° medio en hoja de ruta';if(live){detailLink.classList.add('campus-link');detailLink.dataset.detailLink=item.title;detailLink.href=`${campusUrl}?q=${encodeURIComponent(item.title)}`;detailLink.textContent='Ver cursos disponibles →';}else{detailLink.classList.remove('campus-link');delete detailLink.dataset.detailLink;detailLink.href='#preguntas';detailLink.textContent='Solicitar ruta →';}dialog.showModal()}));
document.querySelector('[data-close]')?.addEventListener('click',()=>dialog?.close());dialog?.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});dialog?.addEventListener('close',()=>lastTrigger?.focus());

document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{const filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(item=>item.classList.toggle('active',item===button));document.querySelectorAll('[data-sector]').forEach(card=>{if(filter==='disponible')card.hidden=card.dataset.status!=='disponible';else card.hidden=filter!=='all'&&card.dataset.sector!==filter})}));
const additionalSpecialties=[
  ['Administración de Empresas','Administración','Gestión de personas, logística, operaciones y atención de clientes.','Menciones: Logística · Recursos Humanos'],
  ['Contabilidad','Administración','Registro de operaciones, documentos tributarios e información económica.',''],
  ['Elaboración Industrial de Alimentos','Alimentación','Procesos productivos, inocuidad y control de calidad alimentaria.',''],
  ['Agropecuaria','Agropecuario','Producción vegetal y animal con prácticas sustentables.','Menciones: Agricultura · Pecuaria · Vitivinícola'],
  ['Vestuario y Confección Textil','Confección','Patronaje, corte, costura, terminaciones y control de calidad.',''],
  ['Refrigeración y Climatización','Construcción','Montaje, puesta en marcha, diagnóstico y mantención de sistemas térmicos.',''],
  ['Instalaciones Sanitarias','Construcción','Redes de agua potable y evacuación, trazado, uniones y pruebas.',''],
  ['Montaje Industrial','Construcción','Montaje de estructuras y equipos con planos, alineación e izaje seguro.',''],
  ['Dibujo Técnico','Gráfico','Representación gráfica, acotado y comunicación técnica de proyectos.',''],
  ['Gráfica','Gráfico','Diseño y producción impresa y digital, preprensa y control de color.',''],
  ['Servicios de Hotelería','Hotelería y Turismo','Recepción, habitaciones y calidad de servicio en establecimientos turísticos.',''],
  ['Servicios de Turismo','Hotelería y Turismo','Atención al visitante, información territorial y diseño de experiencias.',''],
  ['Forestal','Maderero','Silvicultura, cosecha y seguridad en el manejo del recurso bosque.',''],
  ['Muebles y Terminaciones en Madera','Maderero','Trazado, maquinado, ensamble y acabado de productos en madera.',''],
  ['Construcciones Metálicas','Metalmecánica','Trazado, corte, soldadura y montaje de estructuras metálicas.',''],
  ['Mecánica Industrial','Metalmecánica','Diagnóstico, ajuste y mantenimiento seguro de maquinaria.','Menciones: Mantenimiento Electromecánico · Máquinas-Herramientas · Matricería'],
  ['Mecánica de Mantenimiento de Aeronaves','Metalmecánica','Inspección, documentación técnica y seguridad aeronáutica.',''],
  ['Asistencia en Geología','Minero','Muestreo, registro de terreno y apoyo a campañas geológicas.',''],
  ['Explotación Minera','Minero','Operación, seguridad y etapas del ciclo productivo minero.',''],
  ['Metalurgia Extractiva','Minero','Chancado, molienda, flotación y control de procesos metalúrgicos.',''],
  ['Acuicultura','Marítimo','Cultivo, calidad de agua y bioseguridad en centros acuícolas.',''],
  ['Operaciones Portuarias','Marítimo','Transferencia de carga, señalización y seguridad portuaria.',''],
  ['Pesquería','Marítimo','Faena pesquera, conservación de capturas y seguridad a bordo.',''],
  ['Tripulación de Naves Mercantes y Especiales','Marítimo','Guardias, faenas de cubierta y procedimientos de emergencia.',''],
  ['Química Industrial','Química e Industria','Muestreo, procesos, control de calidad y seguridad química.','Menciones: Laboratorio Químico · Planta Química'],
  ['Atención de Enfermería','Salud y Educación','Cuidados básicos, signos vitales, bioseguridad y registro clínico.','Menciones: Enfermería · Adulto Mayor'],
  ['Atención de Párvulos','Salud y Educación','Bienestar, juego, cuidado y educación inicial.',''],
  ['Conectividad y Redes','Tecnología y Comunicaciones','Cableado, redes, verificación de enlaces y documentación técnica.',''],
  ['Programación','Tecnología y Comunicaciones','Lógica, desarrollo de soluciones y pruebas de software.',''],
  ['Telecomunicaciones','Tecnología y Comunicaciones','Instalación, medición y puesta en servicio de sistemas de comunicación.','']
];
const otherCard=document.querySelector('.all-card');
if(otherCard){
  const actions=document.createElement('div');actions.className='all-card other-specialties-card';
  const heading=document.createElement('div');heading.className='other-card-heading';heading.innerHTML='<span class="catalog-icon"><i data-lucide="layout-grid"></i></span><div><b>Otras especialidades</b><small>Revisa las especialidades restantes y sus menciones.</small></div>';
  const expand=document.createElement('button');expand.type='button';expand.className='button button-outline';expand.setAttribute('aria-expanded','false');expand.setAttribute('aria-controls','additional-specialties');expand.innerHTML='Ver otras especialidades <i data-lucide="chevron-down"></i>';
  const catalog=nativeCta(campusUrl,'Entrar a cursos','button button-primary campus-link');
  const buttonRow=document.createElement('div');buttonRow.className='other-card-actions';buttonRow.append(expand,catalog);actions.append(heading,buttonRow);otherCard.replaceWith(actions);
  const panel=document.createElement('section');panel.id='additional-specialties';panel.className='additional-specialties';panel.hidden=true;panel.setAttribute('aria-label','Otras especialidades técnico-profesionales');
  const intro=document.createElement('div');intro.className='additional-heading';intro.innerHTML='<div><p class="eyebrow">Catálogo ampliado</p><h3>Selecciona una especialidad para conocer su resumen</h3></div>';
  const searchLabel=document.createElement('label');searchLabel.className='specialty-search';searchLabel.innerHTML='<i data-lucide="search" aria-hidden="true"></i><span class="sr-only">Buscar una especialidad</span><input type="search" placeholder="Buscar especialidad" autocomplete="off">';intro.append(searchLabel);
  const grid=document.createElement('div');grid.className='additional-grid';
  const sectorPhotoIndex={'Administración':0,'Alimentación':1,'Agropecuario':2,'Confección':3,'Construcción':4,'Gráfico':5,'Hotelería y Turismo':6,'Maderero':7,'Metalmecánica':8,'Minero':9,'Marítimo':10,'Química e Industria':11,'Salud y Educación':12,'Tecnología y Comunicaciones':13};
  additionalSpecialties.forEach(([title,sector,summary,mentions])=>{const article=document.createElement('article');article.className='additional-card';const image=document.createElement('div');image.className='additional-card-photo';image.setAttribute('role','img');image.setAttribute('aria-label',`Estudiantes de enseñanza media técnico-profesional en el área de ${title}`);const photoIndex=sectorPhotoIndex[sector]??13;const column=photoIndex%7;const row=Math.floor(photoIndex/7);image.style.backgroundPosition=`${column*(100/6)}% ${row*100}%`;const liveCoursePhoto={'Electricidad':'photo-electricidad','Atención de Enfermería':'photo-enfermeria','Refrigeración y Climatización':'photo-climatizacion'}[title];if(liveCoursePhoto){image.classList.add(liveCoursePhoto);image.style.backgroundImage='';image.style.backgroundSize='';image.style.backgroundPosition='';}const content=document.createElement('div');content.className='additional-card-content';const live=liveCourseTitles.has(title);const badge=document.createElement('span');badge.className=live?'status-badge':'status-badge is-soon';badge.textContent=live?'Disponible':'En preparación';const sectorLabel=document.createElement('span');sectorLabel.className='sector-label';sectorLabel.textContent=sector;const name=document.createElement('h4');name.textContent=title;const text=document.createElement('p');text.textContent=summary;content.append(badge,sectorLabel,name,text);if(mentions){const note=document.createElement('small');note.textContent=mentions;content.append(note)}const action=document.createElement('a');action.className=live?'additional-card-cta campus-link':'additional-card-cta';action.href=live?`${campusUrl}?q=${encodeURIComponent(title)}`:'#preguntas';action.textContent=live?'Entrar a cursos →':'Solicitar ruta →';content.append(action);article.append(image,content);grid.append(article)});
  const searchInput=searchLabel.querySelector('input');searchInput.addEventListener('input',()=>{const query=searchInput.value.trim().toLocaleLowerCase('es');grid.querySelectorAll('.additional-card').forEach(card=>{card.hidden=query!==''&&!card.textContent.toLocaleLowerCase('es').includes(query)})});
  const catalogCta=document.createElement('div');catalogCta.className='additional-catalog-cta';catalogCta.innerHTML='<div><i data-lucide="library-big" aria-hidden="true"></i><span><b>¿Quieres revisar todos los cursos disponibles?</b><small>Ingresa con tus credenciales y explora el catálogo completo de Aula TP Chile.</small></span></div>';
  const catalogButton=nativeCta(campusUrl,'Entrar a cursos','button button-primary campus-link catalog-entry-button');catalogCta.append(catalogButton);
  panel.append(intro,grid,catalogCta);document.querySelector('#especialidades').append(panel);
  expand.addEventListener('click',()=>{const opening=panel.hidden;panel.hidden=!opening;expand.setAttribute('aria-expanded',String(opening));expand.innerHTML=opening?'Ocultar especialidades <i data-lucide="chevron-up"></i>':'Ver otras especialidades <i data-lucide="chevron-down"></i>';window.lucide?.createIcons({attrs:{'aria-hidden':'true'}});if(opening)panel.scrollIntoView({behavior:'smooth',block:'start'})});
}
document.querySelector('#specialty-description')?.setAttribute('data-detail-description','');
const specialtiesSection=document.querySelector('#especialidades');
if(specialtiesSection&&!document.querySelector('.curriculum-foundation')){
  const curriculum=document.createElement('section');
  curriculum.className='curriculum-foundation';
  curriculum.setAttribute('aria-label','Los programas de estudio son la base curricular de Aula TP Chile');
  curriculum.innerHTML='<div class="curriculum-strip"><p class="eyebrow">Alineado a MINEDUC</p><b>Programas de estudio: nuestra base curricular</b><span>Complementa el taller, no lo reemplaza. Simulador activo en 3° medio.</span></div><img class="curriculum-banner" src="/images/programas-estudio/base-curricular-banner.png" alt="Programas de estudio MINEDUC: Construcciones Metálicas, Forestal, Programación y Gráfica" width="1716" height="416">';
  document.querySelector('#producto')?.after(curriculum);
}
const faqItems=[...document.querySelectorAll('.faq-list > details')];faqItems.forEach(item=>item.addEventListener('toggle',()=>{if(!item.open)return;faqItems.forEach(other=>{if(other!==item)other.open=false})}));
const faqLong=[
  'Aula TP Chile está dirigida a estudiantes de Educación Media Técnico-Profesional, docentes de especialidad, coordinadores TP y equipos directivos. El simulador está activo en 3° medio para Electricidad, Atención de Enfermería y Refrigeración y Climatización, como piloto con evidencia. El 4° medio forma parte de la hoja de ruta. Cada perfil accede a recursos acordes con su función.',
  'No es una propuesta 100 % digital. Las simulaciones complementan la práctica de taller: ayudan a preparar al estudiante antes de trabajar con equipos, materiales o situaciones reales. Permiten anticipar riesgos, repetir procedimientos, probar decisiones y aprender del error en un entorno seguro. La experiencia se completa en el aula-taller con actividades prácticas guiadas por el docente.',
  'El establecimiento habilita las cuentas institucionales de estudiantes y docentes. Luego, cada usuario ingresa al campus con su nombre de usuario y contraseña, selecciona su especialidad y accede a los cursos asignados. Quienes todavía no cuentan con acceso pueden solicitar una demostración para conocer la plataforma y definir una propuesta de implementación.',
  'Se necesita un laboratorio de computación o un set de computadores/tabletas con navegador actualizado y conexión estable a internet, de modo que un curso pueda trabajar de forma simultánea. Además, el establecimiento define los cursos, usuarios responsables y tiempos de uso dentro de la planificación pedagógica. El equipo de Aula TP Chile acompaña la configuración inicial, la capacitación y la puesta en marcha.',
  'El acompañamiento comienza con una orientación inicial y capacitación para utilizar los cursos, simulaciones y recursos de evaluación. Los docentes reciben apoyo para planificar actividades, implementar experiencias en el aula-taller y revisar evidencias de aprendizaje. También se realiza seguimiento para resolver dudas y ajustar la implementación según la realidad del establecimiento.',
  'El aprendizaje se evalúa mediante actividades contextualizadas, decisiones técnicas, resultados de simulación y desempeños observables. La plataforma reúne evidencias vinculadas con aprendizajes esperados y criterios de evaluación. Con esta información, el docente entrega retroalimentación, identifica avances y define oportunidades de mejora.',
  'No publicamos una tarifa única: el valor depende de las especialidades que se habiliten, el número de usuarios y el tipo de acompañamiento docente. Tras el diagnóstico enviamos una propuesta con tiempos, alcances y condiciones. La implementación típica incluye configuración de usuarios, una capacitación inicial y las primeras clases en 3° medio. En el laboratorio se requiere espacio para un curso, navegador actualizado y un docente o coordinador TP presente. No se reemplaza el taller: el simulador se agenda como preparación previa a la práctica real.'
];
faqItems.forEach((item,index)=>{const long=item.querySelector('[data-faq-long]');if(long&&faqLong[index])long.textContent=faqLong[index]});
const faqActions=[
  null,
  {label:'Conocer cómo funciona',href:'#como'},
  {label:'Ingresar a los cursos',href:campusUrl},
  {label:'Ir al formulario de demo',href:'#lead-form'},
  {label:'Ingresar al portal docente',href:teacherPortalUrl},
  {label:'Explorar los cursos',href:campusUrl},
  {label:'Solicitar demo',href:'#lead-form'}
];
faqItems.forEach((item,index)=>{const action=faqActions[index];if(!action)return;const link=document.createElement('a');link.className='faq-answer-link';link.href=action.href;link.innerHTML=`${action.label} <i data-lucide="arrow-right"></i>`;item.append(link)});
document.querySelectorAll('main img').forEach(image=>{if(!image.closest('.hero'))image.loading='lazy'});
window.lucide?.createIcons({attrs:{'aria-hidden':'true'}});
document.querySelectorAll('a[href^="mailto:aulatpchile@gmail.com"]').forEach(link=>{link.href=link.href.replace('aulatpchile@gmail.com','contacto@aulatpchile.cl')});
const whatsappMessage=encodeURIComponent('Hola, quisiera recibir información sobre Aula TP Chile.');
[['tel:+56940616339','56940616339'],['tel:+56921619205','56921619205']].forEach(([selector,phone])=>{const link=document.querySelector(`a[href="${selector}"]`);if(!link)return;link.href=`https://wa.me/${phone}?text=${whatsappMessage}`;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',`Contactar por WhatsApp al +${phone}`);const label=link.querySelector('small');if(label)label.textContent='WhatsApp';const icon=link.querySelector('svg,i');if(icon)icon.outerHTML='<i data-lucide="message-circle"></i>'});
const leadForm=document.querySelector('#lead-form');
leadForm?.addEventListener('submit',event=>{
  event.preventDefault();
  const data=new FormData(leadForm);
  const establecimiento=String(data.get('establecimiento')||'').trim();
  const cargo=String(data.get('cargo')||'').trim();
  const especialidad=String(data.get('especialidad')||'').trim();
  const subject=encodeURIComponent('Solicitud de demostración Aula TP Chile');
  const body=encodeURIComponent(`Establecimiento: ${establecimiento}\nCargo: ${cargo}\nEspecialidad de interés: ${especialidad}\n\nSolicito una demostración para el establecimiento.`);
  window.location.href=`mailto:contacto@aulatpchile.cl?subject=${subject}&body=${body}`;
});
document.querySelectorAll('a[href="#preguntas"],a[href="#lead-form"]').forEach(link=>{
  link.addEventListener('click',()=>{
    const dialogOpen=document.querySelector('[data-specialty-dialog]');
    if(dialogOpen?.open)dialogOpen.close();
  });
});
window.lucide?.createIcons({attrs:{'aria-hidden':'true'}});
