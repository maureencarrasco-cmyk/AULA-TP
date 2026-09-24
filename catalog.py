"""Módulos de simulación de 3° medio. AE y criterios se transcriben del PDF MINEDUC
depositado en docs/fuentes/. Las consignas, datos y ejemplos de simulación son locales.
"""
from copy import deepcopy
from content import RUBRIC
from pedagogy import FOURTH, enrich, apply_oficio_media

def ae(title,description,concepts,example,steps):
    return dict(title=title,description=description,lesson=concepts,example=example,steps=steps)

def case_bank(rows):
    out=[]
    extra_wrong=['Continuar sin registrar la información faltante.',FOURTH]
    for i,(t,c,good,bad) in enumerate(rows):
        opts=[good,bad]+extra_wrong if i%2==0 else [bad,good]+extra_wrong
        item=dict(title=t,context=c,options=opts,answer=0 if i%2==0 else 1,
                  stimulus=t,question='¿Qué decisión tomarías?')
        apply_oficio_media(item, 1, i, force=True)
        out.append(item)
    return out

def question_bank(rows,extras):
    questions=[]
    for i,(title,context,good,bad) in enumerate(rows):
        options=[good,bad,'No es posible tomar ninguna decisión ni solicitar antecedentes.',FOURTH]
        shift=(i+1)%4;options=options[shift:]+options[:shift]
        questions.append(dict(id=i,question=context+' ¿Cuál es la decisión mejor fundamentada?',options=options,answer=options.index(good),explanation=good+'. Distingue los datos entregados, la condición que debe comprobarse y el alcance de tu conclusión.'))
    for i,(question,good,bad1,bad2,explanation) in enumerate(extras,15):
        options=[good,bad1,bad2,FOURTH];shift=i%4;options=options[shift:]+options[:shift]
        questions.append(dict(id=i,question=question,options=options,answer=options.index(good),explanation=explanation))
    assert len(questions)==25
    return questions

MEASUREMENT_AES=[
 ae('Selecciona instrumentos según la magnitud y el propósito de la medición.',
    'Compara la magnitud, unidad, intervalo y resolución antes de interpretar una lectura simulada.',
    ['La magnitud es la propiedad que quieres medir, como temperatura o longitud. El resultado necesita un valor y una unidad: escribir 23 no informa lo mismo que escribir 23 °C. Identifica además el punto y la condición de la lectura.',
     'El intervalo indica qué valores declara medir un instrumento. La resolución es el menor cambio que muestra; no demuestra por sí sola exactitud. Para elegir un instrumento también necesitas las especificaciones y el estado de verificación.'],
    'Ejemplo: se espera una temperatura de 24 °C. El instrumento A cubre de −10 a 50 °C y muestra décimas; B cubre de 100 a 300 °C. A incluye el valor esperado, pero todavía hay que comprobar que su uso y especificaciones sean adecuados.',
    ['Debes registrar temperatura y longitud en una maqueta. Identifica las dos magnitudes, sus unidades y los datos que pedirías de cada instrumento.',
     'Un visor cambia de 22,3 a 22,4 °C. Explica qué informa sobre resolución y qué no permite concluir sobre exactitud.',
     'Relaciona una regla en milímetros, un termómetro en grados Celsius y un registro con columnas de fecha y punto de medición.',
     'Para una lectura esperada de 18 °C comparas intervalos de −20 a 80 °C y de 50 a 150 °C. Justifica cuál evaluarías primero y qué dato adicional comprobarías.',
     'Diseña tres comprobaciones previas a interpretar una lectura: magnitud, intervalo y condición del instrumento. Explica cada una.',
     'Revisa tu selección. Describe una confusión entre resolución e intervalo y cómo la evitarías.']),
 ae('Interpreta lecturas simuladas y compara condiciones equivalentes.',
    'Distingue variación, unidades y condiciones de observación en un registro de datos.',
    ['Comparar dos resultados exige saber si corresponden a la misma magnitud y unidad. Un registro también debe identificar lugar, momento e instrumento. Una diferencia puede reflejar un cambio del sistema o del procedimiento; no identifica por sí sola una falla.',
     'El promedio resume una serie comparable, pero no elimina la necesidad de revisar los valores originales. Un dato inesperado se conserva, se marca y se investiga. Cambiarlo para que coincida con la expectativa destruye la evidencia.'],
    'Ejemplo: tres lecturas del mismo punto son 20,0; 20,2 y 20,1 °C. Su promedio es 20,1 °C y su amplitud es 0,2 °C. Esto describe la serie; no certifica por sí solo el instrumento.',
    ['Recibes 19,8; 20,0 y 20,2 °C sin ubicación. Describe lo que puedes calcular y lo que aún no puedes interpretar.',
     'Explica por qué comparar una lectura de impulsión con otra de retorno requiere identificar ambos puntos.',
     'Relaciona cada lectura con fecha, hora, punto e instrumento. Propón una fila completa de registro usando datos simulados.',
     'Una lectura de 21 °C cambia a 27 °C después de mover el sensor. ¿Cómo distinguirías un cambio de ubicación de una variación temporal?',
     'Con 18,0; 18,2 y 18,1 °C, calcula promedio y amplitud. Explica cómo revisarías un cuarto dato de 28,1 °C sin borrarlo.',
     'Propón una mejora al registro que permita a otra persona interpretar tus datos sin tener que preguntarte cómo se obtuvieron.']),
 ae('Comunica resultados y sus límites mediante un informe de verificación.',
    'Organiza evidencia, compara con un criterio entregado y reconoce cuándo falta información.',
    ['Una verificación compara una observación con un criterio explícito. En estos ejercicios el criterio se entrega como una condición ficticia; no se extrapola a equipos reales. Escribir “dentro del intervalo del ejercicio” es más preciso que afirmar “todo el sistema funciona”.',
     'Una conclusión técnica debe conservar valor, unidad, condición y referencia de comparación. Si falta una tolerancia o la identidad del instrumento, la limitación se declara. La ausencia de información no se corrige con una suposición presentada como dato.'],
    'Ejemplo: el ejercicio define el intervalo inclusivo de 18 a 22 °C. Una lectura de 21,5 °C está dentro de ese intervalo. Sin otros antecedentes no puede concluirse que la instalación completa cumple sus requisitos.',
    ['Un informe afirma “valor normal: 21”. Identifica la información que falta para interpretar la frase.',
     'Explica la diferencia entre reportar una lectura y declarar conformidad con un criterio de aceptación.',
     'Relaciona un valor de 17,5 °C con un intervalo ficticio inclusivo de 18 a 22 °C. Redacta una observación limitada a esos datos.',
     'El docente no entrega criterio de aceptación. Decide cómo informarías el resultado y qué dato pedirías.',
     'Revisa un informe con fecha, punto, instrumento, resultado y criterio. Añade una limitación que debería declararse.',
     'Escribe una conclusión breve y una acción de mejora para que tu informe pueda ser revisado por otra persona.'])]
MEASUREMENT_CASES=[
 ('Unidad ausente','La planilla registra “24,5” y la columna de unidad está vacía.','Solicitar la unidad antes de interpretar el resultado.','Suponer que se trata de grados Celsius por el contexto.'),
 ('Intervalo inadecuado','Se espera 15 °C y el instrumento declara un intervalo de 50 a 150 °C.','Buscar un instrumento cuyo intervalo incluya el valor esperado.','Usarlo y restar 50 al valor mostrado.'),
 ('Más dígitos','Dos visores muestran 20,1 y 20,100 °C sin más especificaciones.','Consultar especificaciones antes de comparar su exactitud.','Afirmar que el segundo siempre es más exacto.'),
 ('Puntos distintos','Una lectura corresponde a retorno y otra a impulsión; las etiquetas fueron omitidas.','Recuperar la identificación de cada punto antes de comparar.','Promediarlas como si fueran del mismo punto.'),
 ('Dato inesperado','Una serie de lecturas contiene un valor muy diferente al resto.','Conservar el dato y revisar su contexto y procedimiento.','Reemplazarlo por el promedio sin dejar registro.'),
 ('Cambio de unidad','Un registro expresa 0,8 m y otro 80 cm.','Convertir a una misma unidad y reconocer su equivalencia.','Interpretar que el segundo es cien veces mayor.'),
 ('Estado desconocido','El historial de verificación del instrumento no está disponible.','Registrar la limitación y solicitar el antecedente faltante.','Declarar que está verificado porque enciende.'),
 ('Criterio faltante','El resultado tiene valor y unidad, pero no se entregó criterio de aceptación.','Informar la lectura sin declarar conformidad y pedir el criterio.','Inventar un intervalo típico para aprobarlo.'),
 ('Lectura inestable','El visor continúa variando y se pretende registrar un solo valor como definitivo.','Revisar las condiciones indicadas para el registro y describir la variación.','Elegir el valor que más se acerque al esperado.'),
 ('Identificación del instrumento','Dos instrumentos se usaron en el mismo día sin registrar cuál produjo cada dato.','Reconstruir la identificación y marcar los datos sin trazabilidad.','Asignar ambos conjuntos al instrumento más nuevo.'),
 ('Límite inclusivo','El ejercicio admite de 18 a 22 °C, incluidos los extremos; se registra 22 °C.','Informar que coincide con el límite superior del intervalo del ejercicio.','Rechazarlo porque cualquier límite queda fuera.'),
 ('Comparación parcial','Una lectura cumple el criterio del ejercicio y se quiere aprobar toda la instalación.','Limitar la conclusión al parámetro y criterio comprobados.','Certificar todos los componentes con esa lectura.'),
 ('Resolución de registro','El instrumento muestra décimas y el informe agrega tres ceros decimales.','Conservar la resolución informada sin atribuir precisión adicional.','Añadir decimales para mejorar la calidad de la medición.'),
 ('Corrección de transcripción','La libreta dice 18,2 °C y la planilla 81,2 °C.','Contrastar con el original y documentar la corrección.','Modificar la libreta para hacerla coincidir con la planilla.'),
 ('Entrega del informe','El informe contiene datos, pero no identifica fecha ni punto de medición.','Completar la identificación y explicitar cualquier antecedente irrecuperable.','Entregarlo porque los valores numéricos son suficientes.')]
MEASUREMENT_EXTRA=[
 ('Una longitud de 1,25 m equivale a…','125 cm','12,5 cm','1250 cm','Un metro contiene 100 centímetros: 1,25 × 100 = 125 cm.'),
 ('El visor cambia en pasos de 0,1 °C. ¿Qué característica se observa?','Resolución de indicación','Exactitud garantizada','Intervalo de aceptación','El paso de indicación informa resolución, no exactitud ni aceptación.'),
 ('¿Cuál es el promedio de 18,0; 18,2 y 18,1 °C?','18,1 °C','18,3 °C','54,3 °C','La suma es 54,3 °C; dividida por tres da 18,1 °C.'),
 ('¿Cuál es la amplitud de 19,8; 20,0 y 20,2 °C?','0,4 °C','20,0 °C','0,2 °C','Amplitud = máximo − mínimo = 20,2 − 19,8 = 0,4 °C.'),
 ('El criterio ficticio admite entre 18 y 22 °C, inclusive. ¿Qué lectura queda fuera?','22,1 °C','18,0 °C','21,9 °C','22,1 supera el límite superior entregado para este ejercicio.'),
 ('Para medir 25 °C, ¿qué intervalo incluye ese valor?','−10 a 50 °C','30 a 100 °C','−40 a 0 °C','Solo el primer intervalo contiene 25 °C. Aún deben revisarse las demás especificaciones.'),
 ('¿Cuántos milímetros representan 2,4 cm?','24 mm','240 mm','0,24 mm','Cada centímetro equivale a diez milímetros.'),
 ('Una lectura pasa de 18 a 23 °C. ¿Cuál es el cambio indicado?','5 °C','41 °C','−5 °C','Cambio = valor final − inicial = 23 − 18 = 5 °C.'),
 ('¿Qué fila permite interpretar mejor una lectura?','Punto A; 10:30; TERM-01; 21,2 °C','21,2; bien','Temperatura correcta','La primera identifica punto, momento, instrumento, valor y unidad; el informe completo debe agregar fecha y condiciones.'),
 ('El promedio de cuatro lecturas suma 80 °C. ¿Cuál es su valor?','20 °C','80 °C','320 °C','Promedio = suma de valores ÷ cantidad = 80 ÷ 4 = 20 °C.')]

NETWORK_AES=[
 ae('Interpreta el recorrido de una red y sus interferencias.',
    'Relaciona planta, elevación, etiquetas y obstáculos en una maqueta de redes.',
    ['La planta muestra la distribución horizontal; una elevación o sección ayuda a interpretar alturas. Un cruce en una vista no prueba por sí solo contacto físico. La revisión debe relacionar cotas, niveles y referencias de detalle.',
     'El trazado de este curso es una maqueta de estudio. Sus distancias y recorridos sirven para analizar documentos, no para definir diámetros, presiones ni soluciones de instalación. Una interferencia se documenta con ubicación y referencia para resolverla con el responsable.'],
    'Ejemplo: en planta dos recorridos se cruzan. La sección sitúa uno a 2,40 m y otro a 2,70 m: hay una diferencia de nivel de 0,30 m. Aún se necesitan sus dimensiones y separaciones exigidas para concluir si son compatibles.',
    ['Un trazado cruza una viga en la planta y carece de cota de altura. Identifica la información necesaria para comprender el cruce.',
     'Explica por qué una planta y una sección aportan información complementaria al revisar una red.',
     'Relaciona tres tramos A, B y C con las longitudes 2 m, 3 m y 1 m del dossier. Indica qué representa cada etiqueta.',
     'La sección y la planta muestran recorridos distintos. Formula una consulta con las referencias afectadas.',
     'Propón una revisión de etiquetas, niveles y referencias antes de aceptar el recorrido representado.',
     'Describe una suposición que evitaste al contrastar las dos vistas y cómo cambió tu conclusión.']),
 ae('Organiza la cubicación de tramos y accesorios del proyecto simulado.',
    'Separa mediciones, cantidades y unidades en una lista de materiales trazable.',
    ['Una cubicación relaciona cada cantidad con el plano o detalle del que proviene. Se suman longitudes expresadas en una unidad común. Los accesorios se registran por tipo y cantidad; no se convierten automáticamente en metros de tubería.',
     'Una reserva de material solo se añade cuando el ejercicio o proyecto la especifica. Conviene mostrar por separado cantidad neta y reserva. El número de piezas de longitud fija se redondea hacia arriba únicamente bajo los supuestos de aprovechamiento indicados.'],
    'Ejemplo: los tramos son 2,5 m, 1,5 m y 2,0 m. La longitud neta es 6,0 m. Si el enunciado pide una reserva del 10%, se agregan 0,6 m y el total planificado es 6,6 m.',
    ['Un listado mezcla 3 m, 150 cm y 2 codos. Separa las magnitudes y describe cómo organizarías la información.',
     'Explica la diferencia entre longitud neta, reserva especificada y cantidad de accesorios.',
     'Relaciona dos tramos de 2 m y uno de 1,5 m con una lista que permita rastrear cada cantidad.',
     'El ejercicio pide 8 m netos y una reserva explícita del 5%. Calcula ambos valores por separado y justifica el total.',
     'Comprueba una lista con dos codos repetidos en planta y detalle. ¿Cómo evitarías contarlos dos veces?',
     'Redacta una regla de trabajo que te permita actualizar la cubicación cuando cambie una revisión del plano.']),
 ae('Planifica la verificación documental de una red simulada.',
    'Define puntos de control, responsables y evidencias sin sustituir el procedimiento técnico de montaje.',
    ['Una secuencia de revisión puede comprobar documentos, componentes y registros. Cada punto debe indicar qué se observa y con qué referencia se compara. Una marca de completado sin evidencia no permite reconstruir la verificación.',
     'La aceptación de una red real requiere procedimientos y criterios técnicos específicos. En este módulo se revisa únicamente una maqueta documental; no se indican operaciones con refrigerantes, presión ni uniones en caliente. Las discrepancias quedan abiertas hasta contar con una respuesta verificable.'],
    'Ejemplo de registro: tramo B; etiqueta del plano R2; longitud listada 3,0 m; longitud del esquema 2,5 m; estado “por aclarar”; acción “consultar la revisión vigente”.',
    ['Un acta tiene casillas marcadas, pero no identifica qué versión se revisó. Explica por qué eso limita la evidencia.',
     'Distingue una observación, una acción correctiva propuesta y una comprobación de cierre.',
     'Relaciona el plano, el listado de materiales y el acta para seguir el estado de una discrepancia.',
     'Un accesorio del listado no aparece en el detalle. Decide qué información pedirías antes de darlo por instalado.',
     'Diseña una pauta de tres puntos con evidencia observable para verificar la maqueta documental.',
     'Resume cómo dejarías pendientes las diferencias no resueltas y quién debería recibir el informe.'])]
NETWORK_CASES=[
 ('Cruce en planta','Dos recorridos se cruzan en planta y no se muestran sus alturas.','Consultar sección, cotas y dimensiones antes de concluir interferencia.','Afirmar que existe colisión solo por el cruce dibujado.'),
 ('Unidades mezcladas','El listado suma un tramo de 2 m y otro de 150 cm.','Convertir a una misma unidad antes de sumar.','Sumar 2 + 150 y registrar 152 m.'),
 ('Accesorio duplicado','El mismo codo C-01 figura en planta y en un detalle ampliado.','Verificar su identidad para contarlo una sola vez.','Contarlo dos veces porque aparece en dos vistas.'),
 ('Revisión divergente','La cubicación proviene de R1 y el plano autorizado es R2.','Comparar cambios y actualizar las cantidades afectadas.','Conservar todas las cantidades porque el nombre del proyecto coincide.'),
 ('Reserva sin instrucción','El enunciado entrega una longitud neta y no define reserva.','Reportar la longitud neta y pedir el criterio de reserva si se necesita.','Añadir un porcentaje arbitrario sin indicarlo.'),
 ('Diámetro no identificado','Dos líneas del esquema no tienen diámetro ni referencia técnica.','Solicitar las especificaciones faltantes antes de seleccionar material.','Escoger el diámetro del dibujo según su grosor visual.'),
 ('Separación vertical','Los ejes de dos redes difieren en altura, pero faltan dimensiones exteriores.','Solicitar dimensiones y separaciones requeridas para evaluar compatibilidad.','Aprobar el cruce porque los ejes no coinciden.'),
 ('Cambio de recorrido','Un nuevo trazado evita un obstáculo y modifica la longitud de dos tramos.','Revisar las cantidades y referencias afectadas por el cambio.','Actualizar solo el color de la línea.'),
 ('Componente sin etiqueta','Un accesorio aparece en el esquema sin vínculo con el listado.','Asignar o solicitar una identificación coherente según el proyecto.','Eliminarlo del listado para simplificar la comparación.'),
 ('Sustitución de material','Se propone sustituir un material por otro sin documentación de compatibilidad.','Solicitar revisión y aprobación de la sustitución.','Aprobarlo porque sus dimensiones parecen iguales.'),
 ('Trazabilidad de medición','Una longitud del listado no indica de qué tramo o detalle proviene.','Vincular la cantidad con su referencia de origen.','Distribuirla entre todos los tramos por partes iguales.'),
 ('Estado de la observación','Se detectó una discrepancia y todavía no llega la respuesta técnica.','Mantenerla abierta con responsable y antecedente pendiente.','Marcarla resuelta al enviar la consulta.'),
 ('Acceso al componente','El recorrido propuesto obstruye un acceso indicado en la documentación.','Registrar la interferencia y solicitar coordinación del trazado.','Mantenerlo porque cabe geométricamente.'),
 ('Acta sin evidencia','La pauta dice “correcto” pero no identifica documento ni observación.','Completar referencias y evidencia de la comprobación.','Agregar una firma y omitir los antecedentes.'),
 ('Cierre del dossier','Una diferencia de cantidades fue corregida solo en el plano.','Conciliar también listado y registro de revisión.','Cerrar el dossier aunque persistan documentos contradictorios.')]
NETWORK_EXTRA=[
 ('¿Cuánto suman tramos de 2,5 m, 1,5 m y 3 m?','7 m','6 m','7,5 m','2,5 + 1,5 + 3 = 7 m.'),
 ('El ejercicio pide 8 m netos y 10% de reserva. ¿Cuál es el total?','8,8 m','8,1 m','18 m','La reserva explícita es 0,8 m; el total es 8,8 m.'),
 ('Hay 250 cm de tramo A y 1,5 m de tramo B. ¿Cuál es la suma?','4 m','251,5 m','2,65 m','250 cm equivalen a 2,5 m; más 1,5 m son 4 m.'),
 ('Tres tramos usan 2 codos cada uno y el enunciado los define distintos. ¿Cuántos codos se listan?','6 unidades','3 unidades','2 metros','La cantidad de accesorios es 3 × 2 = 6 unidades.'),
 ('Una reserva explícita del 5% sobre 12 m representa…','0,6 m','6 m','12,5 m','12 × 0,05 = 0,6 m de reserva; no se confunde con el total.'),
 ('Un tramo cambia de 3,2 a 4,0 m. ¿Cuánto aumenta su longitud?','0,8 m','7,2 m','1,2 m','4,0 − 3,2 = 0,8 m.'),
 ('Bajo aprovechamiento completo, ¿cuántas piezas de 3 m se necesitan para 8 m?','3 piezas','2 piezas','2,67 piezas','8 ÷ 3 = 2,67; se requieren 3 piezas enteras bajo el supuesto del enunciado.'),
 ('¿Qué cantidad debe registrarse por separado de los metros de tubería?','Número de codos','Longitud del tramo A','Longitud del tramo B','Los codos se cuentan en unidades y las tuberías se miden en longitud.'),
 ('Dos ejes están a 2,40 m y 2,75 m. ¿Cuál es su diferencia de nivel?','0,35 m','5,15 m','0,25 m','2,75 − 2,40 = 0,35 m; esto no determina por sí solo la separación entre superficies.'),
 ('Se entregan 15 m y se planifican 12,5 m. ¿Cuál es la diferencia?','2,5 m','27,5 m','3,5 m','15 − 12,5 = 2,5 m. La interpretación del remanente depende del plan de cortes.')]

EQUIPMENT_AES=[
 ae('Contrasta equipos y condiciones del recinto con el dossier del proyecto.',
    'Identifica modelos, dimensiones y requisitos declarados para preparar una revisión previa.',
    ['La identificación vincula cada equipo con su ficha y ubicación. Dos equipos de apariencia similar pueden tener especificaciones distintas. Se compara el modelo y la revisión documental antes de usar dimensiones o requerimientos.',
     'La revisión previa distingue el tamaño físico del equipo y los espacios adicionales que exige su documentación. Los valores del curso son ficticios y solo se usan para ejercitar esa comparación. Un espacio donde el equipo cabe puede ser insuficiente para acceso o mantenimiento.'],
    'Ejemplo: la ficha ficticia pide 30 cm de acceso lateral y la maqueta muestra 24 cm. Faltan 6 cm frente a ese criterio. La observación se comunica; no se sustituye por una separación inventada.',
    ['Recibes el equipo EQ-02 y una ficha del modelo EQ-01. Identifica la primera comprobación antes de revisar su ubicación.',
     'Explica por qué el tamaño exterior del equipo no representa todo el espacio que puede necesitar.',
     'Relaciona etiqueta, ficha y ubicación en una tabla de tres columnas usando dos equipos ficticios.',
     'El dossier pide 30 cm y la maqueta dispone de 24 cm. Redacta una discrepancia y una consulta concreta.',
     'Diseña tres comprobaciones documentales previas para el recinto y el equipo.',
     'Describe cómo evitarías usar una ficha de otro modelo aunque los equipos se parezcan.']),
 ae('Organiza recursos y secuencia del montaje en un escenario de planificación.',
    'Reconoce dependencias, responsables y evidencias necesarias antes de ejecutar una tarea.',
    ['Un plan vincula actividades con recursos, antecedentes y responsables. Algunas tareas dependen de que se apruebe una condición anterior. La duración total no se obtiene sumando actividades que realmente se desarrollan en paralelo sin revisar sus dependencias.',
     'En esta simulación se planifica y se revisa documentación; no se ejecuta instalación ni energización. Si faltan instrucciones específicas o una condición previa no está resuelta, el plan conserva esa dependencia en vez de declararla terminada.'],
    'Ejemplo: revisar dossier toma 15 min y revisar inventario 10 min. Si el ejercicio exige hacerlas una después de otra, son 25 min. Si declara que pueden hacerse en paralelo con personas distintas, el tiempo de ese bloque es 15 min.',
    ['El plan indica comenzar montaje antes de resolver una discrepancia de ubicación. Identifica la dependencia que falta.',
     'Explica la diferencia entre disponer de un recurso y tener autorizada una tarea.',
     'Relaciona cada actividad ficticia: revisar ficha, comprobar inventario y comunicar diferencias, con un responsable y evidencia.',
     'Dos actividades de 20 y 15 minutos son secuenciales según el enunciado. Calcula el bloque y justifica por qué no usarías el máximo de ambos.',
     'Comprueba un plan que tiene responsables, recursos y plazos, pero no identifica condiciones previas. Propón la mejora.',
     'Redacta un aprendizaje sobre coordinación que aplicarías en tu próximo plan.']),
 ae('Relaciona controles y equipos y prepara el registro de entrega.',
    'Revisa compatibilidad documentada, identificación y pendientes del sistema simulado.',
    ['El control se relaciona con un equipo y una función definida en la documentación. La coincidencia de conectores o el parecido exterior no demuestra compatibilidad. Se identifica la referencia que permite comprobar esa relación.',
     'Un registro de entrega diferencia lo verificado de lo pendiente. Debe permitir que otra persona rastree la etiqueta del componente, el criterio revisado y el estado. Cerrar un módulo de simulación no certifica una instalación ni habilita operaciones de puesta en marcha.'],
    'Ejemplo: el listado incluye CTRL-02, pero el dossier solo declara compatibilidad de EQ-02 con CTRL-01. Se solicita aclaración del control propuesto y se conserva el pendiente en la entrega.',
    ['El control recibido tiene una etiqueta distinta de la del listado. Describe la información que compararías.',
     'Explica por qué un conector que encaja no basta para declarar compatibilidad.',
     'Relaciona EQ-01, su control CTRL-01 y la ficha que declara su vínculo. Indica cómo quedaría registrado.',
     'Se solicita dar por finalizada la entrega, pero falta la confirmación de un control. Redacta un estado de entrega fiel a la evidencia.',
     'Diseña una pauta de identificación, referencia de compatibilidad y observaciones pendientes.',
     'Propón una mejora para que el destinatario entienda qué fue comprobado y qué requiere seguimiento.'])]
EQUIPMENT_CASES=[
 ('Modelo diferente','El equipo recibido es EQ-02 y la ficha adjunta corresponde a EQ-01.','Solicitar o localizar la ficha que corresponde al modelo recibido.','Usar la ficha disponible porque ambos tienen aspecto similar.'),
 ('Acceso insuficiente','La ficha ficticia pide 30 cm de acceso y la maqueta muestra 24 cm.','Registrar la diferencia de 6 cm y solicitar revisión de la ubicación.','Aprobar porque el equipo cabe en el recinto.'),
 ('Obra previa pendiente','El plan depende de una condición previa que aún no tiene conformidad documentada.','Mantener la dependencia pendiente y coordinar su verificación.','Dar la condición por satisfecha al llegar el equipo.'),
 ('Inventario incompleto','El plan necesita cuatro soportes definidos y el inventario contiene tres.','Registrar el faltante y coordinar el recurso antes de ejecutar la tarea dependiente.','Modificar el plan para omitir el cuarto soporte sin revisión.'),
 ('Cambio de ubicación','La ubicación cambia de recinto, pero se conserva el plano anterior.','Actualizar y coordinar la documentación de la nueva ubicación.','Usar el plano anterior porque el equipo es el mismo.'),
 ('Control no declarado','Se propone CTRL-02 y la ficha solo documenta CTRL-01 para ese equipo.','Solicitar comprobación documentada de compatibilidad.','Aprobar CTRL-02 por tener un conector parecido.'),
 ('Etiqueta ilegible','No se puede leer la identificación del componente recibido.','Resolver la identificación antes de asociarlo al dossier.','Asignarle el nombre del componente que falta en la lista.'),
 ('Actividades dependientes','La actividad B requiere terminar A, pero ambas están programadas al mismo tiempo.','Corregir la dependencia antes de estimar el plazo conjunto.','Sumar más personas sin revisar la condición previa.'),
 ('Responsable ausente','Una tarea crítica de revisión no tiene responsable asignado.','Definir quién revisa y qué evidencia dejará.','Considerarla responsabilidad de cualquiera que esté presente.'),
 ('Compatibilidad supuesta','Se afirma que un control es compatible solo porque enciende.','Revisar la referencia técnica que demuestra su compatibilidad.','Usar el encendido como prueba completa de compatibilidad.'),
 ('Entrega con pendientes','El acta se declara completa aunque hay una consulta técnica sin respuesta.','Distinguir lo verificado del pendiente y asignar seguimiento.','Eliminar la consulta del acta para cerrar la entrega.'),
 ('Distancia sin referencia','Se midió un espacio, pero no está definido entre qué superficies.','Precisar los puntos de referencia antes de compararlo con la ficha.','Usar el valor numérico como si toda distancia fuera equivalente.'),
 ('Secuencia de revisión','Se quiere iniciar una actividad sin el procedimiento específico disponible.','Solicitar el procedimiento y mantener la actividad condicionada.','Improvisar la secuencia a partir de otro modelo.'),
 ('Documento actualizado','La ficha vigente modifica un requisito respecto de una copia anterior.','Revisar qué decisiones del plan quedan afectadas por el cambio.','Conservar el requisito de la copia anterior porque ya fue leído.'),
 ('Registro final','El informe lista equipos, pero no identifica sus controles asociados.','Completar las relaciones y documentar cualquier vínculo no confirmado.','Entregarlo porque los equipos principales están identificados.')]
EQUIPMENT_EXTRA=[
 ('El criterio ficticio pide 40 cm y hay 32 cm. ¿Cuánto falta?','8 cm','72 cm','12 cm','40 − 32 = 8 cm respecto del criterio del ejercicio.'),
 ('Se necesitan 6 componentes y hay 4 disponibles. ¿Cuál es el faltante?','2 unidades','10 unidades','4 unidades','6 − 4 = 2 unidades.'),
 ('Dos tareas de 20 y 15 minutos deben ejecutarse en secuencia. ¿Cuánto dura el bloque?','35 min','20 min','5 min','Para estas tareas secuenciales, 20 + 15 = 35 minutos.'),
 ('Dos revisiones de 20 y 15 minutos se hacen en paralelo por personas distintas, según el ejercicio. ¿Cuándo terminan ambas?','A los 20 min','A los 35 min','A los 15 min','Bajo las condiciones declaradas, el bloque termina con la tarea más larga.'),
 ('Una separación de 0,35 m equivale a…','35 cm','3,5 cm','350 cm','0,35 × 100 = 35 cm.'),
 ('Se verificaron 8 de 10 ítems del dossier. ¿Qué porcentaje representa?','80%','8%','125%','8 ÷ 10 × 100 = 80%. El porcentaje no resuelve los dos pendientes.'),
 ('La ficha del ejercicio exige al menos 25 cm. ¿Qué espacio satisface solo ese criterio?','28 cm','24 cm','20 cm','28 es mayor o igual que 25. Deben comprobarse por separado los demás requisitos.'),
 ('¿Qué antecedente es el más pertinente para relacionar un control y un equipo?','Referencia de compatibilidad del modelo','Color de la carcasa','Tamaño del embalaje','La compatibilidad debe apoyarse en la documentación específica del modelo.'),
 ('De cinco observaciones se cierran tres con evidencia. ¿Cuántas siguen abiertas?','2 observaciones','3 observaciones','8 observaciones','5 − 3 = 2 observaciones aún abiertas.'),
 ('¿Qué estado describe una entrega con un control sin confirmar?','Verificación parcial con pendiente identificado','Instalación certificada completa','Sin necesidad de seguimiento','La declaración de estado debe corresponder a la evidencia disponible.')]

SOURCES={
 2:'https://www.curriculumnacional.cl/portal/Educacion-Tecnico-Profesional/Especialidad-Refrigeracion-y-Climatizacion/Plan-3/81873%3AModulo-02-Instrumentos-de-medicion-y-verificacion',
 3:'https://www.curriculumnacional.cl/614/articles-81874_recurso_pdf.pdf',
 4:'https://www.curriculumnacional.cl/614/articles-81875_recurso_pdf.pdf'}

def module(aes,rows,extras,**extra):
    return dict(aes=aes,cases=case_bank(rows),questions=question_bank(rows,extras),rubric=deepcopy(RUBRIC),**extra)

EXTENDED_MODULES={
2:module(MEASUREMENT_AES,MEASUREMENT_CASES,MEASUREMENT_EXTRA,
 context='En el laboratorio del liceo debes revisar un registro de mediciones simuladas de una sala. Hay valores sin unidad, instrumentos con intervalos distintos y un dato que no coincide con los demás. Tu misión es elegir qué información falta, comparar lecturas y redactar una conclusión limitada a la evidencia.',
 case_title='Una lectura necesita contexto',
 application='En la selección de instrumentos y en la interpretación y comunicación de registros de medición.',
 reflection_prompt='¿Qué información debe acompañar una lectura para que otra persona pueda interpretarla?',
 development='El registro ficticio del punto A contiene 19,8; 20,0 y 20,2 °C, obtenidos con TERM-01, cuyo intervalo declarado es de −10 a 50 °C. El criterio del ejercicio admite de 18 a 22 °C, inclusive. Otra fila dice 25 sin unidad, punto ni instrumento. Explica qué puedes concluir de la primera serie, calcula promedio y amplitud, identifica qué falta en la segunda fila y redacta una acción de verificación. No extiendas la conclusión a toda la instalación.',
 practice={'type':'measurement','title':'Laboratorio de lecturas','unit':'°C','values':[19.8,20,20.2],'reference':[18,22]},
 scene={'title':'Mesa virtual de medición','prompt':'Inspecciona el instrumento, la ficha y el registro. Identifica una lectura que necesita aclaración y redacta una conclusión que conserve unidades y límites.',
 'parts':[{'id':'instrumento','label':'TERM-01','value':'20,0 °C','detail':'Instrumento virtual TERM-01: indicación 20,0 °C. Identifica magnitud y unidad.'},{'id':'ficha','label':'FICHA','value':'−10 / 50','detail':'Ficha ficticia: intervalo de −10 a 50 °C; paso de indicación de 0,1 °C. No se declara exactitud en estos datos.'},{'id':'registro','label':'REGISTRO','value':'25 ?','detail':'Registro: una fila indica 25 sin unidad ni punto. Esa fila requiere aclaración antes de interpretarla.'}]}),
3:module(NETWORK_AES,NETWORK_CASES,NETWORK_EXTRA,
 context='El dossier de una red simulada contiene una planta, referencias de altura y una lista de materiales. Un recorrido cruza otra especialidad, las longitudes mezclan metros y centímetros y un accesorio aparece en dos vistas. Debes revisar la coherencia y preparar una cubicación trazable.',
 case_title='Cada tramo debe contar una sola vez',
 application='En la interpretación de trazados, la cubicación y la coordinación documental previa al montaje de redes.',
 reflection_prompt='¿Cómo comprobarías que una cantidad del listado corresponde al tramo correcto del proyecto?',
 development='En la maqueta, el tramo A mide 2,5 m, B mide 150 cm y C mide 3 m. El enunciado pide una reserva del 10% sobre la longitud neta. C-01 aparece tanto en planta como en un detalle y corresponde al mismo accesorio. Además, el tramo B cruza una viga sin que se indiquen alturas. Calcula longitud neta, reserva y total; explica cómo evitarías duplicar C-01 y formula la consulta necesaria para revisar el cruce. Presenta tus supuestos y lo que queda pendiente.',
 practice={'type':'network','title':'Planificador de tramos','values':[2.5,1.5,3],'reserve':10},
 scene={'title':'Maqueta de coordinación de redes','prompt':'Inspecciona los tres registros del trazado. Explica qué puede cubicarse con los datos entregados y qué falta para resolver el cruce.',
 'parts':[{'id':'tramo','label':'TRAMO A','value':'2,5 m','detail':'Tramo A: longitud de 2,5 m identificada en la planta R2. Puede vincularse a su fila de cubicación.'},{'id':'cruce','label':'CRUCE B','value':'Cota ?','detail':'Tramo B: se cruza con una viga, pero falta la cota vertical. No puede concluirse compatibilidad a partir de esta vista.'},{'id':'accesorio','label':'C-01','value':'1 ud','detail':'C-01 aparece en planta y detalle con la misma etiqueta. Es una única unidad representada en dos vistas.'}]}),
4:module(EQUIPMENT_AES,EQUIPMENT_CASES,EQUIPMENT_EXTRA,
 context='Un liceo prepara la revisión documental del montaje de equipos de climatización. El equipo recibido debe relacionarse con su ficha, el recinto y el control previsto. Hay una separación insuficiente según un requisito ficticio y una identificación de control que no coincide. Organiza la revisión y comunica los pendientes.',
 case_title='Preparar, coordinar y verificar',
 application='En la revisión de condiciones previas, la planificación de recursos y la entrega documental de equipos y controles.',
 reflection_prompt='¿Qué comprobarías antes de considerar que un equipo y su control corresponden al proyecto?',
 development='El dossier ficticio identifica EQ-02 y declara CTRL-01 como su control asociado. El inventario contiene EQ-02 y CTRL-02. La ficha pide al menos 30 cm de acceso lateral y la maqueta muestra 24 cm. Dos revisiones de 20 y 15 minutos deben realizarse secuencialmente antes de decidir el siguiente paso. Identifica las discrepancias, calcula la diferencia de espacio y duración del bloque, explica qué consultas harías y redacta un estado de entrega que distinga lo verificado de lo pendiente.',
 practice={'type':'equipment','title':'Comprobador de condiciones','available':24,'required':30},
 scene={'title':'Revisión virtual del equipo y su entorno','prompt':'Inspecciona equipo, acceso y control. Registra dos diferencias con el dossier y decide qué información solicitarías antes de dar por terminada la revisión.',
 'parts':[{'id':'equipo','label':'EQ-02','value':'Recibido','detail':'Equipo recibido EQ-02. El modelo coincide con la etiqueta del dossier de este ejercicio.'},{'id':'acceso','label':'ACCESO','value':'24 cm','detail':'La maqueta dispone de 24 cm; la ficha ficticia exige al menos 30 cm. Registra la diferencia respecto del criterio entregado.'},{'id':'control','label':'CTRL-02','value':'Verificar','detail':'Se recibió CTRL-02, pero el dossier vincula EQ-02 con CTRL-01. Solicita confirmación documentada de la compatibilidad.'}]})}
for n,c in EXTENDED_MODULES.items():
    c['curriculum']={'label':'Referencia de ámbito curricular · Mineduc','url':SOURCES[n],'status':'Adaptación didáctica para revisión docente. Los AE de esta simulación no sustituyen los aprendizajes ni las prácticas del programa oficial.','consulted':'2026-09-12'}
    rubric_names={2:['Identificación de magnitudes y datos','Uso de unidades y criterios','Cálculos e interpretación','Conclusiones y límites','Acciones de verificación'],3:['Identificación de tramos y accesorios','Unidades y cubicación','Detección de interferencias','Consultas y decisiones justificadas','Trazabilidad y pendientes'],4:['Identificación de equipos y controles','Comparación con requisitos','Planificación y cálculos','Consultas y decisiones justificadas','Estado de entrega y seguimiento']}
    c['rubric']=[{'name':name,'max':5} for name in rubric_names[n]]
    c['version']='curso-local-2'
    c['agent_hints']=[f'Identifica los datos del caso del módulo {n} y separa lo observado de lo supuesto.', f'¿Cómo relacionarías esta duda con el aprendizaje: {c["aes"][1]["title"]}?','Explica qué referencia usarías para verificar tu conclusión y qué información sigue pendiente.']
    enrich(c, n)

def upgrade_catalog(con):
    """Importación única de los tres módulos vacíos creados por la versión inicial.
    Nunca sobrescribe ediciones docentes, evidencias ni módulos de otros cursos.
    """
    con.execute('CREATE TABLE IF NOT EXISTS content_updates(version TEXT PRIMARY KEY,applied TEXT DEFAULT CURRENT_TIMESTAMP)')
    _fill_empty_third_medio(con)
    version='curso-local-2'
    if not con.execute('SELECT 1 FROM content_updates WHERE version=?',(version,)).fetchone():
        old_titles={2:'Instrumentos de medición',3:'Montaje de redes',4:'Montaje de equipos'}
        new_titles={2:'Instrumentos de medición y verificación',3:'Instalación y montaje de redes',4:'Instalación y montaje de equipos'}
        import json
        for mid,c in EXTENDED_MODULES.items():
            row=con.execute('SELECT m.title,m.content,c.title AS course_title FROM modules m JOIN courses c ON c.id=m.course_id WHERE m.id=? AND m.course_id=1',(mid,)).fetchone()
            if not row or row['course_title']!='Refrigeración y Climatización' or row['title']!=old_titles[mid]:continue
            if json.loads(row['content']) or con.execute('SELECT 1 FROM progress WHERE module_id=?',(mid,)).fetchone():continue
            con.execute('UPDATE modules SET title=?,content=?,published=1 WHERE id=?',(new_titles[mid],json.dumps(c,ensure_ascii=False),mid))
        con.execute('INSERT INTO content_updates(version) VALUES(?)',(version,))
    _apply_pedagogy(con)
    _apply_rich_cases(con)
    _apply_case_photo_cache(con)
    _apply_mcq_mold(con)
    _apply_oficio_media(con)
    _apply_mineduc_3medio(con)
    from specialty_catalog import install_specialty_courses
    install_specialty_courses(con)
    from hospitality_catalog import install_hospitality_courses
    install_hospitality_courses(con)
    from tp_catalog import install_pending_courses
    install_pending_courses(con)
    from programming_catalog import install_programming_draft
    install_programming_draft(con)
    from accounting_catalog import install_accounting_course
    install_accounting_course(con)
    from tourism_catalog import install_tourism_draft
    install_tourism_draft(con)
    from networks_catalog import install_networks_draft
    install_networks_draft(con)
    from electronics_catalog import install_electronics_course
    install_electronics_course(con)
    from telecom_catalog import install_telecom_draft
    install_telecom_draft(con)
    from drawing_catalog import install_drawing_course
    install_drawing_course(con)
    from graphics_catalog import install_graphics_course
    install_graphics_course(con)
    from sanitary_catalog import install_sanitary_course
    install_sanitary_course(con)
    from assembly_catalog import install_assembly_course
    install_assembly_course(con)
    from metalworks_catalog import install_metalworks_draft
    install_metalworks_draft(con)
    from food_industry_catalog import install_food_industry_course
    install_food_industry_course(con)
    from textile_catalog import install_textile_course
    install_textile_course(con)
    from forestry_catalog import install_forestry_draft
    install_forestry_draft(con)
    from furniture_catalog import install_furniture_draft
    install_furniture_draft(con)
    from port_catalog import install_port_draft
    install_port_draft(con)
    from aquaculture_catalog import install_aquaculture_draft
    install_aquaculture_draft(con)
    from fisheries_catalog import install_fisheries_draft
    install_fisheries_draft(con)
    from merchant_crew_catalog import install_merchant_crew_draft
    install_merchant_crew_draft(con)
    from automotive_catalog import install_automotive_draft
    install_automotive_draft(con)
    from early_childhood_catalog import install_early_childhood_draft
    install_early_childhood_draft(con)
    from geology_catalog import install_geology_draft
    install_geology_draft(con)
    from metallurgy_catalog import install_metallurgy_draft
    install_metallurgy_draft(con)
    from mining_catalog import install_mining_draft
    install_mining_draft(con)
    from administration_catalog import install_administration_drafts
    install_administration_drafts(con)
    from agriculture_catalog import install_agriculture_drafts
    install_agriculture_drafts(con)
    from construction_catalog import install_construction_drafts
    install_construction_drafts(con)
    from chemical_industry_catalog import install_chemical_industry_drafts
    install_chemical_industry_drafts(con)
    from mechanical_industry_catalog import install_mechanical_industry_drafts
    install_mechanical_industry_drafts(con)
    from aircraft_catalog import install_aircraft_draft
    install_aircraft_draft(con)
    from refrigeration_fourth import install_refrigeration_fourth
    install_refrigeration_fourth(con)


def _fill_empty_third_medio(con):
    import json
    from curriculum import MODULE_TITLES
    for mid, src in EXTENDED_MODULES.items():
        row = con.execute(
            'SELECT content FROM modules WHERE id=? AND course_id=1', (mid,)
        ).fetchone()
        if not row:
            continue
        try:
            raw = json.loads(row['content'] or '{}')
        except Exception:
            raw = {}
        if raw:
            continue
        con.execute(
            'UPDATE modules SET title=?,content=?,published=1 WHERE id=?',
            (MODULE_TITLES[mid], json.dumps(src, ensure_ascii=False), mid),
        )

def _apply_oficio_media(con):
    """Sustituye fotos decorativas por recortes de oficio ligados al ítem."""
    version='oficio-media-v1'
    if con.execute('SELECT 1 FROM content_updates WHERE version=?',(version,)).fetchone():return
    import json
    from pedagogy import enrich
    for mid in (1,2,3,4):
        row=con.execute('SELECT m.content,c.title AS course_title,m.position FROM modules m JOIN courses c ON c.id=m.course_id WHERE m.id=? AND m.course_id=1',(mid,)).fetchone()
        if not row or 'Climatiz' not in (row['course_title'] or ''):continue
        try:c=json.loads(row['content'] or '{}')
        except Exception:continue
        if not c.get('aes'):continue
        enrich(c, row['position'] or mid)
        con.execute('UPDATE modules SET content=? WHERE id=?',(json.dumps(c,ensure_ascii=False),mid))
    con.execute('INSERT INTO content_updates(version) VALUES(?)',(version,))

def _apply_rich_cases(con):
    """Actualiza las 15 situaciones del curso demo sin borrar evidencias de progreso."""
    version='situaciones-reales-v1'
    if con.execute('SELECT 1 FROM content_updates WHERE version=?',(version,)).fetchone():return
    import json
    from content import DEFAULT_CONTENT
    from pedagogy import enrich
    sources={1:DEFAULT_CONTENT}
    sources.update(EXTENDED_MODULES)
    for mid,src in sources.items():
        row=con.execute('SELECT m.content,c.title AS course_title,m.position FROM modules m JOIN courses c ON c.id=m.course_id WHERE m.id=? AND m.course_id=1',(mid,)).fetchone()
        if not row or 'Climatiz' not in (row['course_title'] or ''):continue
        try:c=json.loads(row['content'] or '{}')
        except Exception:continue
        if not c.get('aes') or len(c.get('cases') or [])!=15:continue
        c['cases']=src['cases']
        if src.get('questions'):c['questions']=src['questions']
        enrich(c, row['position'] or mid)
        con.execute('UPDATE modules SET content=? WHERE id=?',(json.dumps(c,ensure_ascii=False),mid))
    con.execute('INSERT INTO content_updates(version) VALUES(?)',(version,))

def _apply_case_photo_cache(con):
    """Cache-bust de las 15 fotos de caso sin tocar títulos ni evidencias."""
    version='situaciones-fotos-v2'
    if con.execute('SELECT 1 FROM content_updates WHERE version=?',(version,)).fetchone():return
    import json
    from pedagogy import case_photo
    for mid in (1,2,3,4):
        row=con.execute('SELECT m.content,c.title AS course_title FROM modules m JOIN courses c ON c.id=m.course_id WHERE m.id=? AND m.course_id=1',(mid,)).fetchone()
        if not row or 'Climatiz' not in (row['course_title'] or ''):continue
        try:c=json.loads(row['content'] or '{}')
        except Exception:continue
        cases=c.get('cases') or []
        if len(cases)!=15:continue
        for i,case in enumerate(cases):
            if isinstance(case, dict):
                case['image']=case_photo(i)
        con.execute('UPDATE modules SET content=? WHERE id=?',(json.dumps(c,ensure_ascii=False),mid))
    con.execute('INSERT INTO content_updates(version) VALUES(?)',(version,))

def _apply_mcq_mold(con):
    """Completa el molde A–D (foto, 4 opciones, forma y trazabilidad) sin borrar evidencias."""
    version='mcq-mold-v1'
    if con.execute('SELECT 1 FROM content_updates WHERE version=?',(version,)).fetchone():return
    import json
    from pedagogy import enrich
    for mid in (1,2,3,4):
        row=con.execute('SELECT m.content,c.title AS course_title,m.position FROM modules m JOIN courses c ON c.id=m.course_id WHERE m.id=? AND m.course_id=1',(mid,)).fetchone()
        if not row or 'Climatiz' not in (row['course_title'] or ''):continue
        try:c=json.loads(row['content'] or '{}')
        except Exception:continue
        if not c.get('aes'):continue
        enrich(c, row['position'] or mid)
        con.execute('UPDATE modules SET content=? WHERE id=?',(json.dumps(c,ensure_ascii=False),mid))
    con.execute('INSERT INTO content_updates(version) VALUES(?)',(version,))


def _apply_pedagogy(con):
    version='pedagogia-motor-1'
    if con.execute('SELECT 1 FROM content_updates WHERE version=?',(version,)).fetchone():return
    import json
    from pedagogy import enrich
    for mid in (1,2,3,4):
        row=con.execute('SELECT m.content,c.title AS course_title,m.position FROM modules m JOIN courses c ON c.id=m.course_id WHERE m.id=? AND m.course_id=1',(mid,)).fetchone()
        if not row or row['course_title']!='Refrigeración y Climatización':continue
        try:c=json.loads(row['content'] or '{}')
        except Exception:continue
        if not c.get('aes'):continue
        enrich(c, row['position'] or mid)
        con.execute('UPDATE modules SET content=? WHERE id=?',(json.dumps(c,ensure_ascii=False),mid))
    con.execute('INSERT INTO content_updates(version) VALUES(?)',(version,))


def _apply_mineduc_3medio(con):
    """Transcribe AE/criterios, aplica 30 % horario y agrega medios interactivos."""
    version='mineduc-3medio-x5-3'
    if con.execute('SELECT 1 FROM content_updates WHERE version=?',(version,)).fetchone():
        return
    import json
    from curriculum import MODULE_TITLES
    from pedagogy import enrich
    for mid in (1, 2, 3, 4):
        row = con.execute(
            'SELECT m.content,c.title AS course_title,m.position FROM modules m JOIN courses c ON c.id=m.course_id WHERE m.id=? AND m.course_id=1',
            (mid,),
        ).fetchone()
        if not row or 'Climatiz' not in (row['course_title'] or ''):
            continue
        try:
            c = json.loads(row['content'] or '{}')
        except Exception:
            continue
        if not c.get('aes'):
            continue
        enrich(c, row['position'] or mid)
        title = MODULE_TITLES.get(row['position'] or mid)
        con.execute(
            'UPDATE modules SET title=?,content=? WHERE id=?',
            (title, json.dumps(c, ensure_ascii=False), mid),
        )
    con.execute('INSERT INTO content_updates(version) VALUES(?)', (version,))
