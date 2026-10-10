"""Mode-specific work products and progressive, ungraded practice requirements."""
from copy import deepcopy

VERSION = 2
LEVEL_LABELS = ('Inicial', 'Intermedio', 'Avanzado', 'Experto')

MODE_TASKS = {
    'explore': {
        'title': 'Explorar',
        'summaries': [
            'observarás un dato, reconocerás su significado y explicarás lo descubierto con apoyo paso a paso.',
            'anticiparás qué cambia en el caso y comprobarás tu interpretación con orientación disponible.',
            'explorarás una variable, contrastarás dos antecedentes y diseñarás cómo comprobar tu predicción.',
            'diseñarás una exploración controlada, contrastarás tres antecedentes y revisarás explicaciones y límites sin inventar resultados.',
        ],
        'observation': '¿Qué observas en el caso y en qué fuente aparece?',
        'rationale': '¿Qué relación o concepto descubriste? Explícalo usando el antecedente y el criterio.',
        'written': 'Explica qué observas y qué significa. Distingue tu predicción de un resultado comprobado y describe cómo explorarías esa relación.',
        'example': 'Ejemplo de registro: «En [fuente] observo [dato]. Esto puede significar [interpretación], que comprobaría mediante [verificación]». Completa solo con datos del caso.',
        'hints': [
            'Localiza un dato en el contexto, documento o tabla y escribe de dónde lo obtuviste.',
            'Elige una sola variable para explorar. Separa lo que podría cambiar de lo que realmente has observado.',
            'Describe cómo compararías antes y después manteniendo las otras condiciones; no presentes una predicción como una medición.',
        ],
        'rubric': ['Identifiqué un dato y su fuente.', 'Expliqué su significado sin confundir observación y supuesto.', 'Relacioné lo descubierto con el criterio del caso.', 'Describí cómo comprobar mi interpretación.'],
        'extra': {
            'prediction': ('¿Qué pasaría si cambia una condición? Escribe tu predicción, no un resultado inventado.', 0),
            'variable': ('¿Qué variable explorarías y qué otras condiciones mantendrías constantes?', 0),
            'alternatives': ('¿Qué otra interpretación explica lo observado y cómo distinguirías ambas?', 2),
            'reflection': ('¿Qué descubriste y qué cambiarías en una próxima exploración?', 3),
        },
    },
    'challenge': {
        'title': 'Desafiar',
        'summaries': [
            'identificarás el problema, elegirás una acción y explicarás un primer paso con apoyo permanente.',
            'definirás una meta, aplicarás un procedimiento y comprobarás su resultado con orientación disponible.',
            'resolverás un problema con dos antecedentes, restricciones y alternativas, y justificarás tu procedimiento.',
            'diseñarás un plan profesional con tres antecedentes, evaluarás alternativas y establecerás riesgos y criterios de aceptación.',
        ],
        'observation': '¿Qué problema debes resolver y qué dato del caso lo demuestra?',
        'rationale': '¿Qué pasos seguirías para resolver el problema y por qué? Justifica el procedimiento con evidencia.',
        'written': 'Propón una solución al problema del caso. Explica el procedimiento, la evidencia que respalda tu decisión y cómo comprobarías el resultado.',
        'example': 'Ejemplo de plan: «El problema es [dato del caso]. Primero haría [acción], porque [evidencia]; comprobaría [resultado esperado] antes de continuar».',
        'hints': [
            'Identifica el problema antes de elegir una acción. Revisa qué recurso del caso permite comprobarlo.',
            'Ordena las acciones: qué harías primero, qué necesitas y cómo sabrías que puedes continuar.',
            'Compara una alternativa con tu plan: qué resuelve, qué riesgo deja y cuál es el criterio para aceptar el resultado.',
        ],
        'rubric': ['Identifiqué el problema con evidencia.', 'Propuse una acción compatible con el criterio.', 'Justifiqué el orden del procedimiento.', 'Definí cómo comprobar el resultado antes de continuar.'],
        'extra': {
            'goal': ('¿Qué resultado necesitas lograr en este caso?', 0),
            'constraints': ('¿Qué restricciones, recursos o variables condicionan tu procedimiento?', 0),
            'alternatives': ('Compara dos posibles acciones: ventajas, consecuencias y motivo para priorizar una.', 2),
            'reflection': ('¿Qué ajustarías en el procedimiento si no se alcanza el resultado esperado?', 3),
        },
    },
    'investigate': {
        'title': 'Investigar',
        'summaries': [
            'separarás un hecho de una suposición y formularás una hipótesis sencilla con apoyo paso a paso.',
            'formularás una hipótesis, contrastarás dos antecedentes y construirás una conclusión provisional.',
            'analizarás dos antecedentes, buscarás evidencia que contradiga tu hipótesis y fundamentarás una conclusión.',
            'investigarás con tres antecedentes, evaluarás hipótesis alternativas y la fiabilidad de las fuentes y delimitarás tus conclusiones.',
        ],
        'observation': '¿Qué hecho está documentado y cuál es su fuente? Distingue el hecho de tu interpretación.',
        'rationale': '¿Qué conclusión respalda la evidencia? Explica si apoya o cuestiona tu hipótesis.',
        'written': 'Formula una hipótesis sobre el caso, contrástala con la evidencia disponible y escribe una conclusión provisional. Declara qué falta confirmar.',
        'example': 'Ejemplo de hipótesis: «Podría ocurrir [explicación] porque [dato observado]. Para confirmarlo o descartarlo buscaría [evidencia]». No la presentes como una certeza.',
        'hints': [
            'Escribe primero un hecho que puedas localizar en la fuente; después una posible explicación, sin afirmar que ya está demostrada.',
            'Compara las fuentes: qué aporta cada una y qué dato apoya o cuestiona tu hipótesis. Una fuente diferente no es automáticamente una confirmación.',
            'Busca qué podría contradecir tu explicación y revisa la fiabilidad de la fuente antes de redactar una conclusión limitada por la evidencia.',
        ],
        'rubric': ['Separé un hecho documentado de una hipótesis.', 'Relacioné mi explicación con la evidencia y el criterio.', 'Expliqué qué permite concluir y qué no.', 'Indiqué qué evidencia confirmaría o refutaría mi hipótesis.'],
        'extra': {
            'hypothesis': ('¿Cuál es tu hipótesis? Escribe una posible explicación que puedas contrastar.', 0),
            'counterevidence': ('¿Qué evidencia podría refutar tu hipótesis? ¿Está disponible o falta obtenerla?', 2),
            'alternatives': ('Formula una hipótesis alternativa y evalúa qué fuentes permitirían distinguirlas y por qué son fiables.', 2),
            'reflection': ('¿Qué cambiaría tu conclusión y qué nueva pregunta investigarías?', 3),
        },
    },
}


def profile(mode, level):
    task = MODE_TASKS[mode]
    def field(name, label, step, minimum):
        return dict(name=name, label=label, step=step, minimum=minimum,
                    maximum=2000 if name in ('observation', 'comparison', 'limits') else 3000,
                    rows=2 if step == 0 else 3)

    fields = [field('observation', task['observation'], 0, (10, 20, 30, 50)[level-1]),
              field('rationale', task['rationale'], 2, (15, 40, 70, 120)[level-1])]
    extras = {
        'explore': ([], ['prediction'], ['prediction', 'variable'], ['prediction', 'variable', 'alternatives']),
        'challenge': ([], ['goal'], ['goal', 'constraints', 'alternatives'], ['goal', 'constraints', 'alternatives']),
        'investigate': (['hypothesis'], ['hypothesis'], ['hypothesis', 'counterevidence'], ['hypothesis', 'counterevidence', 'alternatives']),
    }[mode][level-1]
    for name in extras:
        label, step = task['extra'][name]
        fields.append(field(name, label, step, (10, 20, 40, 60)[level-1]))
    evidence_count = 3 if level == 4 else 2 if level == 3 or (mode == 'investigate' and level == 2) else 1
    if evidence_count >= 2:
        fields.append(field('comparison', 'Contrasta el caso principal y el antecedente de referencia: ¿qué coincide, qué cambia y qué criterio aplica a cada uno?', 0, (10, 20, 40, 60)[level-1]))
    if evidence_count == 3:
        fields.append(field('additional_contrast', '¿Qué aporta el tercer antecedente? Evalúa si respalda, limita o contradice tu interpretación, plan o hipótesis.', 0, 50))
    if level >= 2:
        fields.append(field('verification', {
            'explore': '¿Cómo comprobarías tu predicción sin cambiar varias condiciones a la vez?',
            'challenge': '¿Cómo comprobarías que tu solución cumple la meta y el criterio de aceptación?',
            'investigate': '¿Qué comprobación permitiría confirmar o refutar la hipótesis?',
        }[mode], 2, (0, 20, 30, 50)[level-1]))
    if level == 4:
        fields.append(field('limits', 'Declara riesgos, límites de la evidencia y cuándo necesitas detenerte o consultar a un profesional.', 2, 60))
    if level >= 3:
        label, step = task['extra']['reflection']
        fields.append(field('reflection', label, step, 30 if level == 3 else 50))
    rubric = deepcopy(task['rubric'])
    if level >= 3:
        rubric[1] += ' Contrasté los antecedentes sin asumir que pertenecen a una misma medición.'
    if level == 4:
        rubric[3] += ' Evalué alternativas, fiabilidad, riesgos y límites.'
    return dict(version=VERSION, mode=mode, level=level, summary=task['summaries'][level-1],
                activity=task['written'], example=task['example'], fields=fields, review_criteria=rubric,
                hints=deepcopy(task['hints'] if level <= 2 else task['hints'][1:] if level == 3 else task['hints'][2:]),
                support=('Paso a paso', 'Orientación a demanda', 'Apoyo reducido', 'Trabajo autónomo')[level-1],
                automatic_support=level == 1, evidence_count=evidence_count,
                written_minimum=(20, 40, 80, 160)[level-1],
                response_type='choice' if level == 1 else 'mixed' if level == 2 else 'written')
