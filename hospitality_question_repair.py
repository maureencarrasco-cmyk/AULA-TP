"""Differentiate repeated evidence tasks without moving assessment keys."""
import json


def signature(question):
    return json.dumps([question.get(k) for k in
                       ('question', 'context', 'options', 'image', 'table', 'stimulus')],
                      ensure_ascii=False, sort_keys=True)


def repair_repeated_questions(content):
    seen, changed = set(), []
    for index, question in enumerate(content.get('questions', [])):
        key = signature(question)
        if key not in seen:
            seen.add(key)
            continue
        criterion = question['criterion']
        variants = [
            ('El registro cita el criterio, pero no identifica la fuente del dato utilizado. '
             'Otra persona debe poder comprobar la decision. ¿Que informacion agregas?',
             'La fuente, su version y el dato utilizado, vinculados con el criterio evaluado.',
             ['Solo el nombre de quien entrega el trabajo.',
              'Una afirmacion de cumplimiento sin identificar el dato.',
              'Una fuente diferente sin comprobar que contiene el dato utilizado.']),
            ('Dos versiones del registro muestran decisiones diferentes y no explican el cambio. '
             '¿Que accion permite reconstruir la decision?',
             'Comparar ambas versiones y registrar el dato y la razon que sustentan el cambio.',
             ['Eliminar la version anterior sin conservar antecedentes.',
              'Elegir la version mas reciente solo por su fecha.',
              'Copiar la decision de otra tarea sin contrastar los antecedentes.']),
            ('El registro marca cumplimiento, pero el respaldo adjunto no permite comprobarlo. '
             '¿Como informas el resultado de la revision?',
             'Identificar el respaldo que falta y dejar la comprobacion pendiente hasta obtenerlo.',
             ['Confirmar cumplimiento porque la casilla esta marcada.',
              'Crear un respaldo con datos supuestos para cerrar la revision.',
              'Ocultar la falta de respaldo en el informe final.']),
        ]
        prompt, correct, wrong = variants[index % len(variants)]
        answer = question['answer']
        options = list(wrong)
        options.insert(answer, correct)
        explanation = ('La trazabilidad exige distinguir lo comprobado de lo pendiente y '
                       'conservar los antecedentes que permiten revisar la decision. '
                       f'Criterio evaluado: {criterion}')
        question.update(question=prompt, stimulus=f'Caso documental simulado de {content.get("title", "este modulo")}. {prompt}',
                        options=options, explanation=explanation)
        question['table'] = []
        question['formula'] = ''
        if isinstance(question.get('instruction'), dict):
            question['instruction'].update(object=prompt, original=prompt)
        question['option_feedback'] = [explanation if i == answer else
                                      'Esta opcion no permite comprobar el dato ni conservar su trazabilidad.'
                                      for i in range(4)]
        seen.add(signature(question))
        changed.append(index)
    return changed
