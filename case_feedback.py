"""Feedback grounded only in the stated facts of the simulated cases."""

GROUPS = [
    [
        ('Leyenda incompleta en la sala de 3°', 'El trazo no aparece en la leyenda y su color admite dos interpretaciones. La funcion no puede confirmarse por apariencia. Identifica el trazo y solicita que su significado quede documentado.'),
        ('Dos recintos, la misma etiqueta', 'Dos boxes llevan UI-01, pero el listado solo identifica una unidad. La duplicacion no demuestra que compartan equipo. Contrasta recinto, etiqueta y listado y registra la diferencia antes de definir cantidades.'),
        ('Cruce sobre la línea de lácteos', 'El cruce se muestra en planta, sin alturas ni seccion. No permite afirmar ni descartar una interferencia. Solicita las cotas y el detalle necesarios y deja la observacion pendiente hasta comprobarla.'),
        ('Dos revisiones y una inauguración', 'La planta C muestra tres unidades y el listado A solo dos. El peso del archivo no determina su vigencia. Identifica la revision autorizada y concilia ambos documentos antes de usar sus cantidades.'),
        ('El rack no deja pasar', 'El ejercicio indica 8 cm disponibles frente a 30 cm exigidos por su ficha ficticia. Que el equipo quepa no prueba que permita el acceso requerido. Registra la diferencia y contrasta ubicacion, ficha y proyecto.'),
        ('El condensado no tiene destino', 'El plano muestra el origen del drenaje, pero no su recorrido completo ni descarga. Elegir el desague mas cercano agrega una decision no documentada. Solicita recorrido y destino definidos antes de darlo por resuelto.'),
        ('La copia no es el original', 'La impresion fue reducida, aunque el cajetin conserva 1:50. Medir directamente sobre esa copia puede alterar la longitud interpretada. Usa las cotas indicadas y verifica la escala de la copia antes de medir.'),
        ('El soporte no está en el listado', 'El detalle D-02 incluye un soporte que el listado omite. Borrarlo del dibujo no resuelve la discrepancia. Identifica ambas referencias y pide su conciliacion antes de cerrar la compra.'),
        ('El control no sabe en qué muro vivir', 'La planta R-2 y el esquema R-1 ubican el control en muros diferentes y no indican cual prevalece. La comodidad no resuelve esa contradiccion. Registra versiones y solicita una ubicacion coordinada.'),
        ('Falta el detalle D-04', 'La planta remite a D-04, pero ese documento no esta en la carpeta. No hay evidencia para completar sus indicaciones. Solicita el detalle y mantien la revision abierta, sin inventar su contenido.'),
        ('Dos líneas, un solo color', 'Ambas lineas tienen el mismo color y la leyenda las distingue mediante etiquetas. Por eso el color no basta para identificarlas. Contrasta etiquetas, leyenda y especificaciones antes de asignar su funcion.'),
        ('La misma luz, dos medidas', 'El mismo vano figura con 0,80 m y 1,10 m. Promediar genera una medida que ningun documento autoriza. Registra las dos cotas y sus referencias y pide confirmacion de la dimension valida.'),
        ('La bandeja eléctrica se tomó el trazado', 'La bandeja y el retorno comparten un trazado sin consulta registrada. Desviar el ducto por iniciativa propia no demuestra coordinacion. Formula la consulta indicando ubicacion y documentos afectados.'),
        ('Cuatro unidades en planta, tres en la compra', 'La planta identifica UI-01 a UI-04, mientras el listado contiene tres cassettes. Antes de comprar, concilia cada etiqueta con su cantidad y deja documentada la discrepancia; ninguno de los documentos por si solo la resuelve.'),
        ('Tres fallas y la firma de las 18:00', 'Una advertencia general no permite reconstruir la etiqueta duplicada, el drenaje pendiente y el detalle ausente. Registra cada ubicacion, su evidencia y la consulta correspondiente para que otra persona pueda verificarla.'),
    ],
    [
        ('Unidad ausente', 'El numero 24,5 no indica que magnitud o unidad se registro. No asignes una unidad por suposicion. Recupera ese antecedente y completa el registro antes de interpretar el resultado.'),
        ('Intervalo inadecuado', 'El valor esperado de 15 grados queda fuera del intervalo declarado de 50 a 150. Revisa las especificaciones y selecciona un instrumento cuyo intervalo incluya la medicion prevista.'),
        ('Más dígitos', 'Los visores muestran distinta cantidad de decimales, pero no se entregan especificaciones de exactitud. Mas digitos no justifican declarar mejor exactitud. Consulta las especificaciones antes de comparar.'),
        ('Puntos distintos', 'Retorno e impulsion son puntos diferentes y faltan sus etiquetas. Antes de comparar lecturas, recupera el punto de origen de cada una para evitar atribuirles el mismo contexto.'),
        ('Dato inesperado', 'Un valor distinto al resto no demuestra por si solo un error. Conserva el dato original, revisa condiciones y procedimiento y documenta lo que compruebes; no lo reemplaces para que coincida con la serie.'),
        ('Cambio de unidad', '0,8 m equivalen a 80 cm. La diferencia de escritura no implica una longitud distinta. Expresa ambos registros en la misma unidad antes de compararlos.'),
        ('Estado desconocido', 'No disponer del historial de verificacion no permite afirmar el estado del instrumento. Registra esa limitacion y solicita el antecedente; no lo declares verificado sin evidencia.'),
        ('Criterio faltante', 'Valor y unidad describen la lectura, pero falta el criterio que permitiria juzgar conformidad. Informa el resultado y solicita el criterio aplicable, sin inventar un umbral.'),
        ('Lectura inestable', 'El visor sigue variando, por lo que un valor aislado no representa una lectura estable comprobada. Revisa las condiciones de registro indicadas y describe la variacion observada antes de concluir.'),
        ('Identificación del instrumento', 'Se usaron dos instrumentos sin asociarlos a las lecturas. Reconstruye esa relacion a partir de registros disponibles y marca los datos cuyo origen no puedas confirmar.'),
        ('Límite inclusivo', 'El intervalo del ejercicio incluye los extremos de 18 y 22 grados. Una lectura de 22 coincide con el limite superior admitido. Esta conclusion se restringe al intervalo declarado en el ejercicio.'),
        ('Comparación parcial', 'Solo se comprobo una lectura frente a un criterio. Eso no constituye evidencia de conformidad de toda la instalacion. Limita el informe al parametro efectivamente verificado e identifica lo pendiente.'),
        ('Resolución de registro', 'El instrumento muestra decimas. Agregar ceros no aporta mediciones nuevas ni mayor resolucion observada. Conserva la resolucion del dato original y no atribuyas precision adicional.'),
        ('Corrección de transcripción', 'La libreta registra 18,2 y la planilla 81,2. Contrasta con el original y documenta la correccion para conservar trazabilidad; no elijas el valor sin comprobar su origen.'),
        ('Entrega del informe', 'Sin fecha ni punto de medicion no puede situarse cada lectura. Completa esos datos desde antecedentes disponibles y declara expresamente cualquier informacion que no puedas recuperar.'),
    ],
    [
        ('Cruce en planta', 'La planta no muestra las alturas de los recorridos. Solicita seccion, cotas y dimensiones para comprobar una posible interferencia, sin concluir solo por el cruce dibujado.'),
        ('Unidades mezcladas', '2 m y 150 cm deben expresarse en la misma unidad antes de sumarse: 150 cm son 1,5 m y el total es 3,5 m. Conserva las unidades en el calculo para poder revisarlo.'),
        ('Accesorio duplicado', 'C-01 aparece en planta y detalle, que pueden representar el mismo accesorio. Verifica su identidad y cuenta una sola vez cada componente fisico, no cada aparicion en un documento.'),
        ('Revisión divergente', 'La cubicacion usa R1 y el plano autorizado es R2. Compara las revisiones y actualiza las cantidades realmente afectadas; no supongas que el cambio deja todo el listado igual.'),
        ('Reserva sin instrucción', 'Solo se entrega longitud neta; no se define un margen de reserva. Reporta esa longitud y solicita el criterio si hace falta reserva, sin sumar un porcentaje arbitrario.'),
        ('Diámetro no identificado', 'Las lineas carecen de diametro y referencia tecnica. No hay datos suficientes para seleccionar material. Identifica las lineas y solicita las especificaciones faltantes antes de elegir.'),
        ('Separación vertical', 'La diferencia entre alturas de ejes no informa las dimensiones exteriores de las redes. Solicita esas dimensiones y las separaciones requeridas antes de afirmar que son compatibles.'),
        ('Cambio de recorrido', 'El nuevo trazado cambia la longitud de dos tramos. Revisa las cantidades y sus referencias de origen para que el listado corresponda al recorrido actualizado.'),
        ('Componente sin etiqueta', 'El accesorio no tiene un vinculo identificable con el listado. Solicita o asigna segun el proyecto una identificacion coherente y registra la relacion, evitando crear duplicados.'),
        ('Sustitución de material', 'La sustitucion no cuenta con documentacion de compatibilidad. Solicita revision y aprobacion antes de incorporarla; la disponibilidad de otro material no demuestra equivalencia.'),
        ('Trazabilidad de medición', 'La longitud no indica el tramo o detalle del que procede. Vincula la cantidad con su referencia para que pueda verificarse o recalcularse cuando cambie el proyecto.'),
        ('Estado de la observación', 'La discrepancia sigue sin respuesta tecnica. Mantenla abierta e identifica responsable y antecedente pendiente; emitir una consulta no equivale a resolverla.'),
        ('Acceso al componente', 'El recorrido obstruye un acceso indicado en la documentacion. Registra la interferencia y solicita coordinacion del trazado antes de aprobarlo o modificarlo por tu cuenta.'),
        ('Acta sin evidencia', 'La palabra correcto no identifica que se comprobo ni con que documento. Completa referencias y evidencia de la observacion para que la conclusion sea revisable.'),
        ('Cierre del dossier', 'La diferencia se corrigio solo en el plano. Concilia tambien listado y registro de revision para no cerrar con documentos que mantienen cantidades contradictorias.'),
    ],
    [
        ('Modelo diferente', 'EQ-02 y EQ-01 identifican modelos diferentes. La ficha de EQ-01 no acredita los requisitos de EQ-02. Localiza o solicita la ficha del modelo recibido antes de planificar con ella.'),
        ('Acceso insuficiente', 'La ficha ficticia del ejercicio pide 30 cm y la maqueta muestra 24 cm: faltan 6 cm. Registra la diferencia y solicita revisar la ubicacion; no generalices este requisito a otros equipos.'),
        ('Obra previa pendiente', 'La tarea depende de una condicion previa sin conformidad documentada. Conserva esa dependencia pendiente y coordina su verificacion antes de declararla resuelta.'),
        ('Inventario incompleto', 'El plan requiere cuatro soportes y hay tres: falta uno. Registra el faltante y coordina el recurso antes de ejecutar la tarea que depende de disponer de todos los soportes definidos.'),
        ('Cambio de ubicación', 'El equipo cambia de recinto, pero el plano conserva la ubicacion anterior. Actualiza y coordina los documentos afectados para que el plan represente la nueva ubicacion.'),
        ('Control no declarado', 'La ficha solo documenta CTRL-01 y se propone CTRL-02. Esa informacion no confirma compatibilidad del segundo. Solicita una comprobacion documentada antes de aprobarlo.'),
        ('Etiqueta ilegible', 'No se puede confirmar la identidad del componente. Resuelve su identificacion antes de asociarlo al dossier; no lo vincules a un modelo por semejanza visual.'),
        ('Actividades dependientes', 'B requiere terminar A, pero ambas se programaron simultaneamente. Corrige esa dependencia antes de estimar el plazo conjunto; la programacion actual no respeta la secuencia declarada.'),
        ('Responsable ausente', 'La revision critica no tiene responsable. Define quien revisa y que evidencia dejara para que la tarea pueda comprobarse, en lugar de considerarla cubierta sin asignacion.'),
        ('Compatibilidad supuesta', 'Que un control encienda no demuestra todos los requisitos de compatibilidad. Contrasta la referencia tecnica correspondiente y documenta el resultado antes de declararlo compatible.'),
        ('Entrega con pendientes', 'Hay una consulta tecnica sin respuesta, aunque el acta dice completa. Distingue lo verificado de lo pendiente y asigna seguimiento para no presentar una incertidumbre como resuelta.'),
        ('Distancia sin referencia', 'La medicion no especifica entre que superficies se tomo. Define sus puntos de referencia antes de compararla con la ficha, para comprobar que ambas distancias representan lo mismo.'),
        ('Secuencia de revisión', 'No esta disponible el procedimiento especifico de la actividad. Solicitalo y manten el inicio condicionado a su revision; una secuencia supuesta no sustituye ese antecedente.'),
        ('Documento actualizado', 'La ficha vigente modifica un requisito de la copia anterior. Revisa las decisiones del plan afectadas por ese cambio y documenta su actualizacion, sin seguir usando el requisito anterior.'),
        ('Registro final', 'El informe identifica equipos, pero no los relaciona con sus controles. Completa esos vinculos desde antecedentes comprobables y declara cualquier relacion que siga sin confirmar.'),
    ],
]

CASE_FEEDBACK = dict(pair for group in GROUPS for pair in group)
assert len(CASE_FEEDBACK) == 60

def complete_case_feedback(content):
    changed = []
    for index, case in enumerate(content.get('cases') or []):
        explanation = CASE_FEEDBACK.get(case.get('title'))
        if explanation and not str(case.get('explanation') or '').strip():
            case['explanation'] = explanation
            changed.append(index)
    return changed
