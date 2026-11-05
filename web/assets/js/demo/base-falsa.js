// Base de datos FALSA para la demostración (versión 2).
// Vive en el navegador (localStorage). Todo lo que hay aquí es contenido de EJEMPLO:
// MYO Genetics aún no define servicios, preguntas ni el contenido real del programa.
// Cuando se conecte Supabase, este archivo deja de usarse: api.js cambia de fuente.
// Si cambias la semilla, sube VER para que los navegadores recarguen los datos.

export const VER = 'infancia_demo_v3';

const hoy = new Date();
const dia = (n) => { const d = new Date(hoy); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
// Fecha de nacimiento de alguien que hoy tiene `meses` meses (aprox.)
const nacido = (meses) => { const d = new Date(hoy); d.setMonth(d.getMonth() - meses); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10); };

// ---------- Etapas del programa (0 a 6 años + embarazo como ruta complementaria) ----------
// Cada etapa trae sus INDICADORES del check-in semanal (unidades y metas distintas por edad)
// y sus PREGUNTAS del recorrido «Descubre tu ruta». Todo es contenido de ejemplo.
function etapas() {
  return [
    {
      id: 'embarazo', orden: 0, nombre: 'Embarazo y preparación familiar', corto: 'Embarazo', icono: '🤰', color: '#9B4DE0',
      rango: 'Antes del nacimiento', complementaria: true,
      descripcion: 'Ruta educativa complementaria: hábitos de la madre gestante, descanso, red de apoyo y lo que viene en los primeros meses.',
      indicadores: [
        { clave: 'sueno', etiqueta: 'Horas de sueño por noche', unidad: 'h', min: 0, max: 14, paso: 0.5, meta: { tipo: 'min', valor: 7 }, peso: 25 },
        { clave: 'frutas_verduras', etiqueta: 'Porciones de frutas y verduras al día', unidad: 'porciones', min: 0, max: 10, paso: 1, meta: { tipo: 'min', valor: 3 }, peso: 25 },
        { clave: 'agua', etiqueta: 'Vasos de agua al día', unidad: 'vasos', min: 0, max: 15, paso: 1, meta: { tipo: 'min', valor: 8 }, peso: 20 },
        { clave: 'movimiento', etiqueta: 'Minutos de caminata o actividad suave al día', unidad: 'min', min: 0, max: 180, paso: 5, meta: { tipo: 'min', valor: 20 }, peso: 20 },
        { clave: 'descanso', etiqueta: 'Días de la semana con un momento de descanso', unidad: 'días', min: 0, max: 7, paso: 1, meta: { tipo: 'min', valor: 4 }, peso: 10 },
      ],
      preguntas: [
        { id: 'q1', texto: '¿En qué momento del embarazo están?', opciones: [{ t: 'Primer trimestre' }, { t: 'Segundo trimestre' }, { t: 'Tercer trimestre', nota: 'En el tercer trimestre conviene adelantar el plan para las primeras semanas en casa (semana 11 de la ruta).' }] },
        { id: 'q2', texto: '¿Cómo va el descanso por las noches?', opciones: [{ t: 'Duermo bien' }, { t: 'Me despierto varias veces', nota: 'El descanso es uno de los temas que la ruta trabaja desde la semana 3.' }, { t: 'Duermo muy poco', nota: 'El descanso es uno de los temas que la ruta trabaja desde la semana 3.' }] },
        { id: 'q3', texto: '¿Quién acompaña en casa durante el embarazo?', opciones: [{ t: 'Pareja o familia cercana' }, { t: 'Red pequeña', nota: 'La semana 6 ayuda a organizar la red de apoyo para después del nacimiento.' }, { t: 'Estoy sola', nota: 'La semana 6 ayuda a organizar la red de apoyo; conviene pedir orientación personalizada.' }] },
        { id: 'q4', texto: '¿Qué tipo de acompañamiento te gustaría?', opciones: [{ t: 'Información clara cada semana' }, { t: 'Alguien que revise mi avance', nota: 'El seguimiento profesional permite que una persona valide tus registros y recomendaciones.' }, { t: 'Las dos cosas', nota: 'El seguimiento profesional permite que una persona valide tus registros y recomendaciones.' }] },
      ],
    },
    {
      id: '0-6m', orden: 1, nombre: '0 a 6 meses', corto: '0–6 meses', icono: '👶', color: '#2EC4D6',
      rango: 'Desde el nacimiento hasta los 6 meses', complementaria: false,
      descripcion: 'Lactancia o fórmula a demanda, sueño seguro, contacto y movimiento libre. Sin pantallas.',
      indicadores: [
        { clave: 'tomas', etiqueta: 'Tomas de leche al día (pecho o fórmula)', unidad: 'tomas', min: 0, max: 15, paso: 1, meta: { tipo: 'min', valor: 8 }, peso: 30 },
        { clave: 'sueno_total', etiqueta: 'Horas de sueño en 24 horas (incluye siestas)', unidad: 'h', min: 0, max: 24, paso: 0.5, meta: { tipo: 'min', valor: 14 }, peso: 25 },
        { clave: 'boca_abajo', etiqueta: 'Minutos de tiempo boca abajo al día (despierto y vigilado)', unidad: 'min', min: 0, max: 120, paso: 5, meta: { tipo: 'min', valor: 10 }, peso: 20 },
        { clave: 'contacto', etiqueta: 'Momentos de contacto, voz y mirada al día', unidad: 'momentos', min: 0, max: 20, paso: 1, meta: { tipo: 'min', valor: 5 }, peso: 15 },
        { clave: 'pantallas', etiqueta: 'Minutos de exposición a pantallas al día', unidad: 'min', min: 0, max: 300, paso: 5, meta: { tipo: 'max', valor: 0 }, peso: 10 },
      ],
      preguntas: [
        { id: 'q1', texto: '¿Cómo se alimenta el bebé hoy?', opciones: [{ t: 'Solo pecho' }, { t: 'Pecho y fórmula' }, { t: 'Solo fórmula' }, { t: 'Tengo dudas sobre las tomas', nota: 'Las semanas 2 y 8 trabajan las tomas a demanda y las señales de hambre y saciedad.' }] },
        { id: 'q2', texto: '¿Cómo duerme el bebé?', opciones: [{ t: 'Duerme y despierta con un ritmo parecido cada día' }, { t: 'Todavía no hay ritmo', nota: 'La semana 6 propone rutinas suaves de día y noche.' }, { t: 'Nos preocupa dónde o cómo duerme', nota: 'La semana 3 (sueño seguro) es prioritaria para su familia.' }] },
        { id: 'q3', texto: '¿Cuánto tiempo pasa el bebé boca abajo, despierto y vigilado?', opciones: [{ t: 'Varias veces al día' }, { t: 'A veces' }, { t: 'Casi nunca', nota: 'La semana 4 explica el tiempo boca abajo y el movimiento libre.' }] },
        { id: 'q4', texto: '¿Qué necesitan más en casa?', opciones: [{ t: 'Información sencilla cada semana' }, { t: 'Descanso para quien cuida', nota: 'La semana 9 está dedicada a cuidar a quien cuida.' }, { t: 'Que alguien revise cómo vamos', nota: 'El seguimiento profesional permite validar registros y recomendaciones.' }] },
      ],
    },
    {
      id: '6-12m', orden: 2, nombre: '6 a 12 meses', corto: '6–12 meses', icono: '🍼', color: '#E7A14A',
      rango: 'De los 6 a los 12 meses', complementaria: false,
      descripcion: 'Primeros alimentos uno a la vez, texturas, agua en vasito, juego en el piso y sueño con siestas.',
      indicadores: [
        { clave: 'sueno_total', etiqueta: 'Horas de sueño en 24 horas (incluye siestas)', unidad: 'h', min: 0, max: 24, paso: 0.5, meta: { tipo: 'min', valor: 13 }, peso: 25 },
        { clave: 'alimentos_nuevos', etiqueta: 'Alimentos nuevos probados en la semana', unidad: 'alimentos', min: 0, max: 15, paso: 1, meta: { tipo: 'min', valor: 2 }, peso: 25 },
        { clave: 'tomas', etiqueta: 'Tomas de leche al día', unidad: 'tomas', min: 0, max: 12, paso: 1, meta: { tipo: 'min', valor: 4 }, peso: 15 },
        { clave: 'juego_piso', etiqueta: 'Minutos de juego en el piso al día', unidad: 'min', min: 0, max: 240, paso: 5, meta: { tipo: 'min', valor: 30 }, peso: 25 },
        { clave: 'pantallas', etiqueta: 'Minutos de exposición a pantallas al día', unidad: 'min', min: 0, max: 300, paso: 5, meta: { tipo: 'max', valor: 0 }, peso: 10 },
      ],
      preguntas: [
        { id: 'q1', texto: '¿Ya empezaron con alimentos distintos a la leche?', opciones: [{ t: 'Sí, varios' }, { t: 'Apenas empezamos' }, { t: 'Todavía no', nota: 'Las semanas 2 y 3 acompañan los primeros alimentos y las texturas.' }] },
        { id: 'q2', texto: '¿Cómo van las siestas y la noche?', opciones: [{ t: 'Bien, con rutina' }, { t: 'Siestas irregulares', nota: 'La semana 7 ordena siestas y noche.' }, { t: 'Se despierta mucho', nota: 'La semana 7 ordena siestas y noche.' }] },
        { id: 'q3', texto: '¿Cuánto tiempo juega en el piso al día?', opciones: [{ t: 'Más de 30 minutos' }, { t: 'Entre 10 y 30 minutos' }, { t: 'Menos de 10 minutos', nota: 'La semana 6 propone juego en el piso y gateo con objetos de casa.' }] },
        { id: 'q4', texto: '¿Hay pantallas encendidas cerca del bebé?', opciones: [{ t: 'No' }, { t: 'A veces', nota: 'A esta edad se recomienda cero pantallas; la semana 8 lo trabaja sin culpas.' }, { t: 'Casi siempre', nota: 'A esta edad se recomienda cero pantallas; la semana 8 lo trabaja sin culpas.' }] },
      ],
    },
    {
      id: '1-3a', orden: 3, nombre: '1 a 3 años', corto: '1–3 años', icono: '🧸', color: '#E8637A',
      rango: 'De 1 a 3 años', complementaria: false,
      descripcion: 'Agua, frutas y verduras, juego activo, rutina de sueño, berrinches y pantallas con medida.',
      indicadores: [
        { clave: 'sueno', etiqueta: 'Horas de sueño en 24 horas (incluye siesta)', unidad: 'h', min: 0, max: 20, paso: 0.5, meta: { tipo: 'min', valor: 11 }, peso: 25 },
        { clave: 'frutas_verduras', etiqueta: 'Porciones de frutas y verduras al día', unidad: 'porciones', min: 0, max: 10, paso: 1, meta: { tipo: 'min', valor: 3 }, peso: 25 },
        { clave: 'agua', etiqueta: 'Vasos de agua al día', unidad: 'vasos', min: 0, max: 12, paso: 1, meta: { tipo: 'min', valor: 4 }, peso: 15 },
        { clave: 'juego_activo', etiqueta: 'Minutos de juego activo al día', unidad: 'min', min: 0, max: 300, paso: 5, meta: { tipo: 'min', valor: 60 }, peso: 20 },
        { clave: 'pantallas', etiqueta: 'Minutos de pantallas al día', unidad: 'min', min: 0, max: 600, paso: 5, meta: { tipo: 'max', valor: 60 }, peso: 15 },
      ],
      preguntas: [
        { id: 'q1', texto: '¿Qué toma cuando tiene sed?', opciones: [{ t: 'Agua' }, { t: 'Agua y jugos' }, { t: 'Jugos o refrescos', nota: 'La semana 3 («Agua primero») ayuda a cambiar bebidas azucaradas sin pleitos.' }] },
        { id: 'q2', texto: '¿Cuántas porciones de frutas y verduras come al día?', opciones: [{ t: '3 o más' }, { t: '1 o 2', nota: 'La semana 4 propone el juego de colores para probar frutas y verduras.' }, { t: 'Casi ninguna', nota: 'La semana 4 propone el juego de colores para probar frutas y verduras.' }] },
        { id: 'q3', texto: '¿Cuánto tiempo de pantallas tiene al día?', opciones: [{ t: 'Nada o menos de media hora' }, { t: 'Alrededor de una hora' }, { t: 'Más de una hora', nota: 'La semana 7 ayuda a poner medida a las pantallas con acuerdos sencillos.' }] },
        { id: 'q4', texto: '¿Cuál es el mayor reto en casa hoy?', opciones: [{ t: 'Que coma variado' }, { t: 'Dormir', nota: 'La semana 6 trabaja la rutina de noche.' }, { t: 'Los berrinches', nota: 'La semana 8 distingue hambre, cansancio y emociones.' }, { t: 'Que se mueva más', nota: 'La semana 5 propone moverse jugando.' }] },
      ],
    },
    {
      id: '3-6a', orden: 4, nombre: '3 a 6 años', corto: '3–6 años', icono: '🧒', color: '#5B6FE6',
      rango: 'De 3 a 6 años', complementaria: false,
      descripcion: 'Plato de colores, 60 minutos de juego activo, hora fija para dormir, acuerdos de pantallas y refrigerio escolar.',
      indicadores: [
        { clave: 'sueno', etiqueta: 'Horas de sueño por noche', unidad: 'h', min: 0, max: 16, paso: 0.5, meta: { tipo: 'min', valor: 10 }, peso: 25 },
        { clave: 'frutas_verduras', etiqueta: 'Porciones de frutas y verduras al día', unidad: 'porciones', min: 0, max: 10, paso: 1, meta: { tipo: 'min', valor: 3 }, peso: 25 },
        { clave: 'agua', etiqueta: 'Vasos de agua al día', unidad: 'vasos', min: 0, max: 12, paso: 1, meta: { tipo: 'min', valor: 5 }, peso: 15 },
        { clave: 'juego_activo', etiqueta: 'Minutos de juego activo al día', unidad: 'min', min: 0, max: 300, paso: 5, meta: { tipo: 'min', valor: 60 }, peso: 20 },
        { clave: 'pantallas', etiqueta: 'Minutos de pantallas al día', unidad: 'min', min: 0, max: 600, paso: 5, meta: { tipo: 'max', valor: 60 }, peso: 15 },
      ],
      preguntas: [
        { id: 'q1', texto: '¿Desayuna antes de salir de casa?', opciones: [{ t: 'Todos los días' }, { t: 'Algunos días', nota: 'La semana 2 propone desayunos sencillos y rápidos.' }, { t: 'Casi nunca', nota: 'La semana 2 propone desayunos sencillos y rápidos.' }] },
        { id: 'q2', texto: '¿Cuánto juego activo tiene al día?', opciones: [{ t: 'Una hora o más' }, { t: 'Media hora', nota: 'La semana 5 ayuda a llegar a 60 minutos de juego activo.' }, { t: 'Casi nada', nota: 'La semana 5 ayuda a llegar a 60 minutos de juego activo.' }] },
        { id: 'q3', texto: '¿A qué hora se duerme entre semana?', opciones: [{ t: 'Antes de las 9' }, { t: 'Entre 9 y 10', nota: 'La semana 6 fija una hora de dormir y una rutina corta.' }, { t: 'Después de las 10', nota: 'La semana 6 fija una hora de dormir y una rutina corta.' }] },
        { id: 'q4', texto: '¿Cómo son las pantallas en casa?', opciones: [{ t: 'Con horario y acompañadas' }, { t: 'Sin horario fijo', nota: 'La semana 7 construye acuerdos de pantallas en familia.' }, { t: 'Es un tema de conflicto', nota: 'La semana 7 construye acuerdos de pantallas en familia.' }] },
      ],
    },
  ];
}

// ---------- Programa de 12 semanas POR ETAPA (contenido de EJEMPLO) ----------
// Cada semana: objetivo, microcontenido, una actividad sencilla en casa, materiales opcionales y
// una pregunta extra para el check-in (además de los indicadores de la etapa).
const S = (etapa_id, numero, titulo, objetivo, contenido, actividad, materiales, checkin) => ({ id: `${etapa_id}-${numero}`, etapa_id, numero, titulo, objetivo, contenido, actividad, materiales, checkin });
function programa() {
  const P = [];
  // Embarazo (ruta complementaria)
  P.push(S('embarazo', 1, 'Punto de partida', 'Conocer los hábitos actuales sin cambiar nada todavía.', 'Antes de proponer cambios conviene observar: cómo duermes, qué comes, cuánto te mueves y cómo te sientes. Es el punto de comparación de toda la ruta.', 'Anotar durante tres días qué comiste, cuánto dormiste y cómo te sentiste.', 'Libreta o notas del celular.', 'La libreta de tres días, ¿quedó?'));
  P.push(S('embarazo', 2, 'Comer para dos no es comer el doble', 'Entender qué cambia en la alimentación durante el embarazo.', 'El cuerpo necesita más calidad, no el doble de cantidad: verduras, frutas, proteína y granos enteros; menos azúcar añadida.', 'Agregar una verdura o fruta a dos comidas del día durante la semana.', 'Ninguno.', '¿Lograste agregar fruta o verdura a dos comidas?'));
  P.push(S('embarazo', 3, 'Agua y descanso', 'Tomar suficiente agua y proteger el descanso.', 'La hidratación y el descanso ayudan con el cansancio, la circulación y el ánimo. Pequeños cambios de rutina hacen diferencia.', 'Tener una botella de agua a la mano y apartar 15 minutos de descanso al día.', 'Botella de agua.', '¿Cuántos días apartaste el descanso?'));
  P.push(S('embarazo', 4, 'Moverse con calma', 'Incorporar movimiento suave y seguro.', 'Caminar y estirarse, con la autorización de tu control prenatal, ayuda a dormir mejor y a prepararse para el parto.', 'Caminar 20 minutos al menos tres días de la semana.', 'Calzado cómodo.', '¿Cuántos días caminaste?'));
  P.push(S('embarazo', 5, 'Dormir mejor', 'Encontrar posturas y rutinas para descansar.', 'Dormir de lado con una almohada entre las rodillas, cenar ligero y bajar las pantallas antes de dormir mejora el descanso.', 'Probar la rutina de noche (cena ligera, sin pantallas, almohada) durante cinco noches.', 'Almohada adicional.', '¿Notaste cambios en el descanso?'));
  P.push(S('embarazo', 6, 'Red de apoyo', 'Definir quién acompañará en las primeras semanas.', 'Las primeras semanas en casa son más fáciles con apoyos claros: quién ayuda con la comida, el aseo, los hermanos, los traslados.', 'Hacer una lista de personas y tareas en las que pueden apoyar, y hablarlo con ellas.', 'Hoja de papel.', '¿Ya tienen la lista de apoyos?'));
  P.push(S('embarazo', 7, 'El espacio del bebé', 'Preparar un espacio seguro y sencillo para dormir.', 'El bebé necesita una superficie firme, sin almohadas ni cobijas sueltas, en la misma habitación que los adultos los primeros meses.', 'Revisar y preparar el espacio donde dormirá el bebé.', 'Cuna o moisés con colchón firme.', '¿El espacio para dormir ya está listo?'));
  P.push(S('embarazo', 8, 'Lactancia: lo que conviene saber antes', 'Conocer lo básico de la lactancia antes del nacimiento.', 'Saber cómo se acomoda el bebé, qué es normal los primeros días y dónde pedir ayuda evita abandonar la lactancia por dudas.', 'Ver el material de lactancia y anotar dos dudas para el control prenatal.', 'Guía de lactancia (ejemplo).', '¿Anotaste tus dudas para el control?'));
  P.push(S('embarazo', 9, 'Señales de alerta y control prenatal', 'Saber qué señales requieren atención médica.', 'Sangrado, dolor intenso, dolor de cabeza fuerte, hinchazón repentina o menos movimientos del bebé requieren revisión inmediata.', 'Guardar el teléfono de emergencia y confirmar la fecha del próximo control.', 'Teléfono de la unidad de salud.', '¿Tienes el próximo control agendado?'));
  P.push(S('embarazo', 10, 'Las emociones del embarazo', 'Reconocer y hablar de lo que se siente.', 'Alegría, miedo y cansancio conviven. Nombrar lo que se siente y hablarlo con alguien de confianza protege la salud emocional.', 'Dedicar un momento del día a escribir o contar cómo te sentiste.', 'Libreta.', '¿Cuántos días lo hiciste?'));
  P.push(S('embarazo', 11, 'Plan para las primeras semanas', 'Tener un plan sencillo para la llegada del bebé.', 'Un plan de comidas, turnos de descanso, visitas y traslados reduce el estrés de las primeras semanas.', 'Escribir el plan de las dos primeras semanas en casa con la red de apoyo.', 'Lista de la semana 6.', '¿El plan quedó escrito?'));
  P.push(S('embarazo', 12, 'Lo que ya tienen listo', 'Cerrar la ruta y pasar a la etapa 0–6 meses.', 'Revisamos lo que la familia ya preparó y lo que sigue cuando nazca el bebé: el programa continúa con la etapa 0 a 6 meses.', 'Repasar la lista de la ruta y celebrar lo preparado.', 'Ninguno.', '¿Se sienten preparados para lo que sigue?'));
  // 0 a 6 meses
  P.push(S('0-6m', 1, 'Conocer el ritmo del bebé', 'Observar cómo come, duerme y llora el bebé.', 'Cada bebé tiene su ritmo. Observar sin juzgar durante unos días ayuda a reconocer señales de hambre, sueño y malestar.', 'Anotar durante tres días las tomas, los sueños y los ratos de llanto.', 'Libreta o notas del celular.', '¿Pudiste anotar los tres días?'));
  P.push(S('0-6m', 2, 'Tomas a demanda', 'Alimentar cuando el bebé lo pide.', 'Los recién nacidos comen entre 8 y 12 veces al día. Las señales tempranas de hambre (mover la boca, llevarse las manos) son mejores que esperar el llanto.', 'Responder a las señales tempranas de hambre durante una semana.', 'Ninguno.', '¿Reconociste señales antes del llanto?'));
  P.push(S('0-6m', 3, 'Sueño seguro', 'Dormir al bebé de forma segura.', 'Boca arriba, en superficie firme, sin almohadas ni cobijas sueltas, sin humo y en la habitación de los adultos.', 'Revisar el espacio de sueño con la lista de sueño seguro.', 'Lista de sueño seguro (ejemplo).', '¿El espacio cumple la lista?'));
  P.push(S('0-6m', 4, 'Tiempo boca abajo', 'Fortalecer cuello y espalda con tiempo boca abajo.', 'Despierto y vigilado, unos minutos varias veces al día. Se va aumentando poco a poco.', 'Tres ratos de tiempo boca abajo al día, de 2 a 5 minutos.', 'Tapete o cobija en el piso.', '¿Cuántos ratos lograron al día?'));
  P.push(S('0-6m', 5, 'Contacto, voz y mirada', 'Fortalecer el vínculo con el bebé.', 'Hablarle, cantarle y mirarlo mientras se le atiende construye vínculo y lenguaje. No se necesita nada especial.', 'Hablarle o cantarle en cada cambio de pañal durante la semana.', 'Ninguno.', '¿Lo hicieron en la mayoría de los cambios?'));
  P.push(S('0-6m', 6, 'Rutinas suaves de día y noche', 'Diferenciar el día de la noche.', 'Luz y actividad de día; poca luz, voz baja y menos estímulo de noche. Ayuda al bebé a organizar el sueño.', 'Aplicar la rutina de noche (luz baja, voz suave) durante cinco noches.', 'Lámpara tenue.', '¿Notaron diferencia en las noches?'));
  P.push(S('0-6m', 7, 'Cero pantallas, mucho rostro', 'Evitar pantallas en esta etapa.', 'Antes de los 2 años no se recomiendan pantallas. El rostro y la voz de quien cuida son el mejor estímulo.', 'Apagar las pantallas mientras se alimenta o se juega con el bebé.', 'Ninguno.', '¿Hubo pantallas durante las tomas?'));
  P.push(S('0-6m', 8, 'Señales de hambre y saciedad', 'Respetar cuándo quiere y cuándo ya no.', 'Girar la cara, soltar el pecho o el biberón y relajar las manos son señales de saciedad; respetarlas evita sobrealimentar.', 'Observar y anotar señales de saciedad en tres tomas al día.', 'Libreta.', '¿Identificaron señales de saciedad?'));
  P.push(S('0-6m', 9, 'Cuidar a quien cuida', 'Proteger el descanso y el ánimo de madres y padres.', 'Dormir cuando el bebé duerme, aceptar ayuda y comer bien no es un lujo: es parte del cuidado del bebé.', 'Acordar con la red de apoyo dos ratos de descanso para quien cuida.', 'Lista de apoyos.', '¿Lograron los ratos de descanso?'));
  P.push(S('0-6m', 10, 'Juego sencillo', 'Estimular con objetos de casa.', 'Sonajas, telas de texturas, canciones y espejos. Pocos minutos, varias veces al día.', 'Un rato de juego con texturas o canciones cada día.', 'Telas, sonaja, espejo.', '¿Cuántos días jugaron?'));
  P.push(S('0-6m', 11, 'Lo que viene: primeros alimentos', 'Prepararse para la alimentación complementaria.', 'Alrededor de los 6 meses, cuando se sienta con apoyo y muestra interés, se inician los alimentos. La leche sigue siendo la base.', 'Revisar las señales de que el bebé está listo y anotar dudas para la consulta.', 'Guía de primeros alimentos (ejemplo).', '¿Anotaron sus dudas?'));
  P.push(S('0-6m', 12, 'Cierre de la etapa', 'Celebrar lo logrado y pasar a 6–12 meses.', 'Repasamos los hábitos construidos: sueño seguro, tomas a demanda, tiempo boca abajo y vínculo. El programa continúa en la siguiente etapa.', 'Completar la evaluación de cierre y celebrar en familia.', 'Ninguno.', '¿Qué hábito les costó menos trabajo?'));
  // 6 a 12 meses
  P.push(S('6-12m', 1, 'Punto de partida', 'Observar hábitos de alimentación, sueño y juego.', 'Al iniciar la etapa observamos sin cambiar nada: qué come, cuánto duerme, cuánto juega en el piso.', 'Anotar tres días de tomas, alimentos, siestas y juego.', 'Libreta.', '¿Quedaron los tres días anotados?'));
  P.push(S('6-12m', 2, 'Primeros alimentos, uno a la vez', 'Introducir alimentos nuevos con calma.', 'Un alimento nuevo cada dos o tres días permite ver cómo reacciona el bebé. Sin sal ni azúcar añadida.', 'Ofrecer dos alimentos nuevos esta semana, uno a la vez.', 'Cuchara suave, plato.', '¿Cuántos alimentos nuevos probó?'));
  P.push(S('6-12m', 3, 'Texturas y la cuchara', 'Avanzar de papillas a texturas.', 'Pasar de purés a machacados y trozos suaves ayuda a masticar y hablar. Siempre sentado y vigilado.', 'Ofrecer un alimento machacado o en trozos suaves tres veces en la semana.', 'Tenedor para machacar.', '¿Aceptó las texturas nuevas?'));
  P.push(S('6-12m', 4, 'La leche sigue siendo la base', 'Mantener las tomas mientras se introducen alimentos.', 'Hasta el año, la leche sigue siendo el alimento principal; los sólidos complementan.', 'Ofrecer la leche antes de los alimentos en cada comida esta semana.', 'Ninguno.', '¿Mantuvieron las tomas habituales?'));
  P.push(S('6-12m', 5, 'Agua en vasito', 'Ofrecer agua simple desde los 6 meses.', 'Pequeños sorbos de agua en vaso con las comidas. Nada de jugos ni bebidas azucaradas.', 'Poner un vasito con agua en cada comida.', 'Vaso de entrenamiento.', '¿Tomó agua del vasito?'));
  P.push(S('6-12m', 6, 'Juego en el piso y gateo', 'Favorecer el movimiento libre.', 'El piso es el mejor lugar para moverse, rodar y gatear. Objetos a distancia invitan a desplazarse.', 'Treinta minutos de juego en el piso al día, con objetos para alcanzar.', 'Tapete, juguetes de casa.', '¿Cuántos días llegaron a 30 minutos?'));
  P.push(S('6-12m', 7, 'Siestas y noche', 'Ordenar el sueño de la etapa.', 'Dos o tres siestas de día y una rutina corta de noche (baño, cuento, canción) ayudan a dormir mejor.', 'Repetir la misma rutina de noche cinco días.', 'Cuento o canción.', '¿Se durmió más fácil con la rutina?'));
  P.push(S('6-12m', 8, 'Pantallas: todavía no', 'Mantener cero pantallas.', 'Antes de los 2 años las pantallas no aportan y restan tiempo de juego y contacto. Apagarlas durante comidas y juego.', 'Comidas y juego sin pantallas durante la semana.', 'Ninguno.', '¿Hubo pantallas cerca del bebé?'));
  P.push(S('6-12m', 9, 'Comer en familia a su ritmo', 'Sentar al bebé a la mesa familiar.', 'Comer con la familia, a su ritmo y sin forzar, construye una relación sana con la comida.', 'Tres comidas en familia con el bebé a la mesa.', 'Silla alta o cojín seguro.', '¿Cuántas comidas en familia lograron?'));
  P.push(S('6-12m', 10, 'Señales de alergia y cuándo consultar', 'Saber qué observar al introducir alimentos.', 'Ronchas, vómito, hinchazón o dificultad para respirar tras un alimento nuevo requieren atención. Anotar qué comió ayuda a identificar.', 'Llevar la lista de alimentos probados y cualquier reacción.', 'Libreta.', '¿Hubo alguna reacción que anotar?'));
  P.push(S('6-12m', 11, 'Rutina del día', 'Tener un día con horarios parecidos.', 'Comidas, siestas, juego y paseo a horas parecidas dan seguridad y hacen más fácil el día.', 'Escribir la rutina del día y seguirla cinco días.', 'Hoja para la rutina.', '¿La rutina funcionó la mayoría de los días?'));
  P.push(S('6-12m', 12, 'Cierre de la etapa', 'Celebrar y pasar a 1–3 años.', 'Repasamos lo construido: alimentos variados, agua, juego en el piso y sueño. Sigue la etapa 1 a 3 años.', 'Completar la evaluación de cierre y celebrar en familia.', 'Ninguno.', '¿Qué les gustaría conservar?'));
  // 1 a 3 años
  P.push(S('1-3a', 1, 'Conocemos nuestros hábitos', 'Observar qué come, cuánto duerme y cuánto se mueve.', 'Esta semana observamos sin cambiar nada todavía. La idea es tener un punto de partida honesto.', 'Anotar tres días qué desayunó, comió y cenó, y cuánto durmió.', 'Libreta.', '¿Quedaron los tres días anotados?'));
  P.push(S('1-3a', 2, 'Desayuno sencillo', 'Empezar el día con un desayuno completo.', 'Una fruta, un cereal y una proteína. Sencillo y económico marca el ritmo del día.', 'Preparar juntos un desayuno con fruta, cereal y proteína cuatro días.', 'Ninguno.', '¿Cuántos días desayunó completo?'));
  P.push(S('1-3a', 3, 'Agua primero', 'Cambiar bebidas azucaradas por agua.', 'Es uno de los cambios con más efecto. Un vaso propio y ofrecer agua antes que otra bebida.', 'Tener un vaso de agua personal y ofrecerlo en cada comida.', 'Vaso propio.', '¿Pidió jugo o refresco esta semana?'));
  P.push(S('1-3a', 4, 'Frutas y verduras de colores', 'Probar frutas y verduras nuevas jugando.', 'Mientras más colores en el plato, más variedad de nutrientes. A esta edad probar varias veces es normal.', 'Probar una fruta o verdura nueva y señalar su color.', 'Una fruta o verdura nueva.', '¿Probó algo nuevo?'));
  P.push(S('1-3a', 5, 'Moverse jugando', 'Llegar a 60 minutos de juego activo al día.', 'A esta edad el movimiento es juego: correr, bailar, trepar con seguridad.', 'Tres tardes de juego activo en familia.', 'Pelota, música.', '¿Cuántas tardes jugaron activo?'));
  P.push(S('1-3a', 6, 'Dormir bien', 'Tener una rutina de noche corta y constante.', 'Baño, cuento, cama. A la misma hora. El sueño cambia el apetito y el ánimo.', 'Fijar una hora de dormir y cumplirla cinco noches.', 'Cuento.', '¿Cuántas noches se cumplió la hora?'));
  P.push(S('1-3a', 7, 'Pantallas con medida', 'Limitar pantallas a menos de una hora y acompañadas.', 'A esta edad, si hay pantallas, que sean pocas, de calidad y con un adulto. Nunca en comidas ni antes de dormir.', 'Apagar pantallas en comidas y una hora antes de dormir.', 'Ninguno.', '¿Hubo pantallas en comidas?'));
  P.push(S('1-3a', 8, 'Berrinches, hambre y emociones', 'Distinguir hambre de cansancio o enojo.', 'Muchos berrinches son sueño o hambre. Nombrar la emoción y ofrecer alternativas ayuda.', 'Antes de dar comida por un berrinche, revisar si es sueño o cansancio.', 'Ninguno.', '¿Lograron identificar la causa de un berrinche?'));
  P.push(S('1-3a', 9, 'Comer en familia', 'Compartir la mesa sin pantallas.', 'Las comidas compartidas mejoran lo que se come y la convivencia. El menor come lo mismo que la familia.', 'Tres comidas en familia en la mesa, sin pantallas.', 'Ninguno.', '¿Cuántas comidas en familia lograron?'));
  P.push(S('1-3a', 10, 'Dientes y cepillado', 'Cepillar los dientes dos veces al día.', 'Desde el primer diente, con un poco de pasta con flúor y ayuda de un adulto.', 'Cepillar dientes mañana y noche durante la semana.', 'Cepillo infantil.', '¿Se cepilló dos veces al día?'));
  P.push(S('1-3a', 11, 'Hábitos que se quedan', 'Elegir tres hábitos para conservar.', 'Repasamos qué funcionó y qué no. Elegimos los tres hábitos que la familia quiere conservar.', 'Escribir los tres hábitos elegidos y ponerlos en el refrigerador.', 'Hoja y plumón.', '¿Ya eligieron sus tres hábitos?'));
  P.push(S('1-3a', 12, 'Celebramos y seguimos', 'Cerrar el programa con reconocimiento.', 'Cierre: reconocimiento al menor y plan sencillo para los siguientes tres meses. Sigue la etapa 3 a 6 años.', 'Completar la evaluación de cierre y celebrar en familia.', 'Reconocimiento (ejemplo).', '¿Qué fue lo mejor del programa?'));
  // 3 a 6 años
  P.push(S('3-6a', 1, 'Punto de partida', 'Observar hábitos sin cambiar nada.', 'Qué desayuna, qué toma, cuánto juega, a qué hora duerme y cuánto tiempo de pantallas. Punto de comparación del programa.', 'Anotar tres días los hábitos de comida, sueño, juego y pantallas.', 'Libreta.', '¿Quedaron los tres días anotados?'));
  P.push(S('3-6a', 2, 'Desayuno que da energía', 'Desayunar completo antes de salir.', 'El desayuno marca el ritmo del día. Ejemplos sencillos y económicos de desayunos completos.', 'Preparar juntos un desayuno con fruta, cereal y proteína.', 'Ninguno.', '¿Cuántos días desayunó completo?'));
  P.push(S('3-6a', 3, 'Agua en lugar de bebidas azucaradas', 'Que el agua sea la bebida principal.', 'Cambiar jugos y refrescos por agua es uno de los cambios con más efecto. Botella propia y agua en la mesa.', 'Tener una botella de agua personal y llenarla cada mañana.', 'Botella propia.', '¿Tomó agua en la escuela?'));
  P.push(S('3-6a', 4, 'El plato de colores', 'Comer frutas y verduras variadas.', 'Mientras más colores en el plato, más variedad de nutrientes. Juego de colores para la semana.', 'Probar una fruta o verdura nueva y dibujarla.', 'Hojas y colores.', '¿Probó algo nuevo?'));
  P.push(S('3-6a', 5, '60 minutos de juego activo', 'Moverse al menos una hora al día.', 'El movimiento en la infancia es juego, no ejercicio. Ideas para 60 minutos activos al día.', 'Tres tardes de juego activo en familia (pelota, bailar, escondidas).', 'Pelota.', '¿Cuántas tardes jugaron activo?'));
  P.push(S('3-6a', 6, 'Hora fija para dormir', 'Dormir 10 horas o más con rutina.', 'Rutina corta y hora fija. El sueño cambia el apetito, el ánimo y el aprendizaje.', 'Fijar una hora de dormir y cumplirla cinco noches.', 'Cuento.', '¿Cuántas noches se cumplió la hora?'));
  P.push(S('3-6a', 7, 'Acuerdos de pantallas', 'Tener reglas claras y compartidas sobre pantallas.', 'Acuerdos familiares sobre cuándo sí y cuándo no: nunca en comidas ni antes de dormir, máximo una hora.', 'Hacer un cartel de acuerdos de pantallas y pegarlo en casa.', 'Cartulina y plumones.', '¿Se cumplieron los acuerdos?'));
  P.push(S('3-6a', 8, 'Emociones y comida', 'Distinguir hambre de aburrimiento o enojo.', 'Nombrar la emoción antes de comer y ofrecer alternativas cuando no es hambre.', 'Nombrar la emoción antes de pedir algo de comer, durante una semana.', 'Ninguno.', '¿Lograron nombrar emociones?'));
  P.push(S('3-6a', 9, 'Comer en familia sin pantallas', 'Compartir la mesa.', 'Las comidas compartidas, sin pantallas, mejoran lo que se come y la convivencia.', 'Tres comidas en familia en la mesa, sin pantallas.', 'Ninguno.', '¿Cuántas comidas en familia lograron?'));
  P.push(S('3-6a', 10, 'El refrigerio escolar', 'Preparar un refrigerio sano para el preescolar.', 'Fruta, agua y algo sencillo. Involucrar al menor hace que lo coma.', 'Que el menor arme su refrigerio dos días con una lista de opciones.', 'Lista de opciones.', '¿Armó su refrigerio?'));
  P.push(S('3-6a', 11, 'Hábitos que se quedan', 'Elegir tres hábitos para conservar.', 'Repasamos qué funcionó y qué no. Elegimos los tres hábitos que la familia quiere conservar.', 'Escribir los tres hábitos elegidos y ponerlos en el refrigerador.', 'Hoja y plumón.', '¿Ya eligieron sus tres hábitos?'));
  P.push(S('3-6a', 12, 'Celebración y plan', 'Cerrar el programa con reconocimiento.', 'Cierre: reconocimiento al menor y plan sencillo para los siguientes tres meses.', 'Completar la evaluación de cierre y celebrar en familia.', 'Reconocimiento (ejemplo).', '¿Qué fue lo mejor del programa?'));
  return P;
}

// Genera check-ins de ejemplo con mejora gradual para un menor
function checkins(menor_id, etapaObj, semanas, inicio) {
  const filas = [];
  for (let s = 1; s <= semanas; s++) {
    const valores = {};
    etapaObj.indicadores.forEach((ind) => {
      const base = inicio[ind.clave];
      const meta = ind.meta.valor;
      const avance = Math.min(1, (s - 1) / 8);
      let v = ind.meta.tipo === 'min' ? base + (Math.max(meta, base) - base) * avance : base - (base - Math.min(meta, base)) * avance;
      v = Math.round(v / ind.paso) * ind.paso;
      valores[ind.clave] = Number(v.toFixed(1));
    });
    filas.push({ id: `ck-${menor_id}-${s}`, menor_id, semana: s, valores, actividad: s % 4 === 0 ? 'parcial' : 'si', origen: 'familia', fecha: dia(-7 * (semanas - s + 1)) });
  }
  return filas;
}

export function semilla() {
  const ET = etapas();
  const et = (id) => ET.find((e) => e.id === id);
  const avance = (menor_id, semanas) => Array.from({ length: semanas }, (_, i) => ({ id: `av-${menor_id}-${i + 1}`, menor_id, semana: i + 1, completada: true, fecha: dia(-7 * (semanas - i)) }));

  return {
    // ---------- Organizaciones (vista de administración) ----------
    // `alcance` define qué ven: 'propia' = sus familias con nombre; 'agregado' = solo cifras, sin nombres.
    organizaciones: [
      { id: 'org-escuela', nombre: 'Centro Infantil Ejemplo (preescolar)', tipo: 'escuela', alcance: 'propia',
        permisos: ['Ver las familias y menores inscritos en su centro', 'Ver avance colectivo y por grupo', 'Crear grupos del programa e invitar familias', 'Publicar contenidos y materiales para sus familias', 'Exportar reporte agregado del centro'],
        restricciones: ['No ve notas clínicas ni mediciones individuales', 'No edita el contenido del programa (lo define MYO Genetics)', 'No ve familias de otras organizaciones'] },
      { id: 'org-ac', nombre: 'Fundación Ejemplo, A.C.', tipo: 'ac', alcance: 'propia',
        permisos: ['Ver las familias y menores de sus comunidades', 'Ver avance colectivo por comunidad', 'Crear programas comunitarios e invitar familias', 'Publicar talleres y materiales', 'Asignar profesionales de la A.C. a familias', 'Exportar reporte agregado'],
        restricciones: ['No ve notas clínicas (solo el profesional asignado)', 'No edita el contenido del programa', 'No ve familias de otras organizaciones'] },
      { id: 'org-gobierno', nombre: 'Dirección de Salud Municipal (ejemplo)', tipo: 'gobierno', alcance: 'agregado',
        permisos: ['Ver cifras agregadas de todas las organizaciones participantes', 'Comparar inscripción, participación, avance y conclusión por tipo de organización y etapa', 'Exportar reporte agregado para informes'],
        restricciones: ['No ve nombres ni datos de familias o menores', 'No ve notas clínicas ni mediciones individuales', 'No crea grupos ni invita familias', 'No edita contenidos'] },
    ],

    // ---------- Acceso de la dueña a la demostración ----------
    // Solo para la demo: al entrar con este correo y clave se abre el selector de vistas.
    // No es una cuenta real; las cuentas reales las creará el ingeniero con Supabase Auth.
    accesos_demo: [
      { id: 'duena', correo: 'yudithort@gmail.com', clave: '123456', nombre: 'Yudith' },
    ],

    etapas: ET,

    // ---------- Perfiles de prueba ----------
    perfiles: [
      { id: 'f1', rol: 'familia', nombre: 'Laura Méndez', correo: 'laura@ejemplo.com', telefono: '614 000 0010', ciudad: 'Chihuahua', organizacion_id: 'org-escuela', objetivos: ['Que Sofía tome agua en lugar de jugo', 'Dormir mejor con Mateo'], consentimiento: { fecha: dia(-30), version: 'ejemplo-1' } },
      { id: 'f2', rol: 'familia', nombre: 'Rosa Jiménez', correo: 'rosa@ejemplo.com', telefono: '614 000 0011', ciudad: 'Delicias', organizacion_id: 'org-ac', objetivos: ['Prepararnos para la llegada del bebé'], consentimiento: { fecha: dia(-100), version: 'ejemplo-1' } },
      { id: 'f3', rol: 'familia', nombre: 'Carmen Ortiz', correo: 'carmen@ejemplo.com', telefono: '614 000 0012', ciudad: 'Chihuahua', organizacion_id: 'org-escuela', objetivos: [], consentimiento: { fecha: dia(-40), version: 'ejemplo-1' } },
      { id: 'u1', rol: 'usuario', nombre: 'Ana Torres', correo: 'ana@ejemplo.com', telefono: '614 000 0001', fecha_nacimiento: '1989-05-12', ciudad: 'Chihuahua', objetivo_principal: 'nutricion', organizacion_id: 'org-escuela', objetivos: ['Mejorar mis hábitos de alimentación', 'Dormir mejor entre semana'] },
      { id: 'u2', rol: 'usuario', nombre: 'Carlos Pérez', correo: 'carlos@ejemplo.com', telefono: '614 000 0002', fecha_nacimiento: '1978-11-03', ciudad: 'Chihuahua', objetivo_principal: 'bienestar', organizacion_id: 'org-escuela', objetivos: ['Tener más energía en el día'] },
      { id: 'p1', rol: 'profesional', nombre: 'Dra. Elena Ruiz', correo: 'elena@ejemplo.com', telefono: '614 000 0020', especialidad: 'Pediatría y nutrición infantil (ejemplo)', organizacion_id: 'org-escuela', objetivos: [] },
      { id: 'p2', rol: 'profesional', nombre: 'Lic. Marco Salas', correo: 'marco@ejemplo.com', telefono: '614 000 0021', especialidad: 'Psicología perinatal (ejemplo)', organizacion_id: 'org-ac', objetivos: [] },
      { id: 'a1', rol: 'admin', nombre: 'Coordinación del centro', correo: 'escuela@ejemplo.com', organizacion_id: 'org-escuela', objetivos: [] },
      { id: 'a2', rol: 'admin', nombre: 'Coordinación de la A.C.', correo: 'ac@ejemplo.com', organizacion_id: 'org-ac', objetivos: [] },
      { id: 'a3', rol: 'admin', nombre: 'Enlace de gobierno', correo: 'gobierno@ejemplo.com', organizacion_id: 'org-gobierno', objetivos: [] },
    ],

    // ---------- Áreas de interés del espacio del usuario adulto (ruta complementaria) ----------
    objetivos: [
      { id: 'nutricion', icono: '🥗', nombre: 'Nutrición y hábitos', descripcion: 'Ordenar la alimentación del adulto sin dietas extremas.', servicios: ['s1', 's2'] },
      { id: 'bienestar', icono: '⚡', nombre: 'Bienestar y energía', descripcion: 'Dormir mejor, tener más energía y manejar el estrés.', servicios: ['s1', 's5'] },
      { id: 'familia', icono: '👨‍👩‍👧', nombre: 'Salud familiar', descripcion: 'Un plan compartido para que toda la familia avance junta.', servicios: ['s3', 's4'] },
    ],

    // ---------- Catálogo de servicios (EJEMPLO) ----------
    servicios: [
      { id: 's3', nombre: 'Programa Infancia Sana (12 semanas)', descripcion: 'Programa educativo para familias con menores de 0 a 6 años: una actividad por semana, check-in breve y seguimiento del avance por etapa.', para_quien: 'Madres, padres y cuidadores de menores de 0 a 6 años.', disponible: true, ejemplo: true },
      { id: 's6', nombre: 'Ruta de embarazo y preparación familiar', descripcion: 'Ruta educativa complementaria de 12 semanas para prepararse antes del nacimiento.', para_quien: 'Familias que esperan un bebé.', disponible: true, ejemplo: true },
      { id: 's1', nombre: 'Orientación inicial', descripcion: 'Una primera conversación para entender la situación de la familia y proponer un camino.', para_quien: 'Cualquier familia que quiera empezar.', disponible: true, ejemplo: true },
      { id: 's5', nombre: 'Seguimiento profesional', descripcion: 'Una persona profesional revisa los registros de la familia, valida recomendaciones y registra mediciones.', para_quien: 'Familias dentro del programa.', disponible: true, ejemplo: true },
      { id: 's4', nombre: 'Acompañamiento a instituciones', descripcion: 'Implementación del programa en centros infantiles, asociaciones civiles o programas de gobierno, con avance colectivo.', para_quien: 'Escuelas, A.C. y gobierno.', disponible: true, ejemplo: true },
      { id: 's2', nombre: 'Perfil de hábitos del adulto', descripcion: 'Evaluación de hábitos de alimentación del adulto con un plan de cambios graduales.', para_quien: 'Adultos (ruta complementaria).', disponible: true, ejemplo: true },
    ],

    solicitudes: [
      { id: 'sol1', perfil_id: 'u1', servicio_id: 's1', estado: 'completado', fecha: dia(-30) },
      { id: 'sol2', perfil_id: 'u1', servicio_id: 's2', estado: 'en_proceso', fecha: dia(-14) },
      { id: 'sol3', perfil_id: 'f1', servicio_id: 's3', estado: 'activo', fecha: dia(-25) },
      { id: 'sol4', perfil_id: 'u2', servicio_id: 's1', estado: 'solicitado', fecha: dia(-2) },
      { id: 'sol5', perfil_id: 'f2', servicio_id: 's6', estado: 'activo', fecha: dia(-90) },
    ],

    actividades: [
      { id: 'act1', perfil_id: 'u1', titulo: 'Registrar lo que desayuno durante 5 días', fecha: dia(-10), estado: 'completada', tipo: 'tarea' },
      { id: 'act2', perfil_id: 'u1', titulo: 'Cita de revisión con la Dra. Ruiz', fecha: dia(-3), estado: 'completada', tipo: 'cita' },
      { id: 'act3', perfil_id: 'u1', titulo: 'Agregar una fruta al desayuno', fecha: dia(2), estado: 'pendiente', tipo: 'tarea' },
      { id: 'act4', perfil_id: 'u1', titulo: 'Caminar 20 minutos tres veces esta semana', fecha: dia(5), estado: 'pendiente', tipo: 'tarea' },
      { id: 'act5', perfil_id: 'u1', titulo: 'Segunda cita de seguimiento', fecha: dia(12), estado: 'pendiente', tipo: 'cita' },
      { id: 'act6', perfil_id: 'u2', titulo: 'Llenar cuestionario inicial', fecha: dia(1), estado: 'pendiente', tipo: 'tarea' },
    ],

    documentos: [
      { id: 'doc1', perfil_id: 'u1', nombre: 'Resultado de orientación inicial (ejemplo).pdf', tipo: 'Resultado', fecha: dia(-28) },
      { id: 'doc3', perfil_id: 'f1', nombre: 'Guía para la familia — Infancia Sana (ejemplo).pdf', tipo: 'Guía', fecha: dia(-25) },
      { id: 'doc4', perfil_id: 'f1', nombre: 'Aviso de privacidad aceptado (ejemplo).pdf', tipo: 'Consentimiento', fecha: dia(-30) },
    ],

    recordatorios: [
      { id: 'rec1', perfil_id: 'u1', texto: 'Tomar agua al despertar', cuando: 'Todos los días, 7:00' },
      { id: 'rec3', perfil_id: 'f1', texto: 'Check-in semanal de Sofía y Mateo', cuando: 'Domingos, 18:00' },
    ],

    // ---------- Área familiar ----------
    // Un responsable puede registrar varios menores. La etapa se calcula con la fecha de nacimiento;
    // si todavía no nace, se registra la fecha probable de parto (etapa «embarazo»).
    menores: [
      { id: 'm1', responsable_id: 'f1', nombre: 'Sofía', fecha_nacimiento: nacido(32), fecha_probable_parto: null, objetivos: ['Tomar agua en lugar de jugo', 'Dormir antes de las 9'], consentimiento: { fecha: dia(-30), version: 'ejemplo-1' } },
      { id: 'm2', responsable_id: 'f1', nombre: 'Mateo', fecha_nacimiento: nacido(4), fecha_probable_parto: null, objetivos: ['Más tiempo boca abajo'], consentimiento: { fecha: dia(-30), version: 'ejemplo-1' } },
      { id: 'm3', responsable_id: 'f2', nombre: 'Valentina', fecha_nacimiento: nacido(58), fecha_probable_parto: null, objetivos: ['Menos pantallas por la tarde'], consentimiento: { fecha: dia(-100), version: 'ejemplo-1' } },
      { id: 'm4', responsable_id: 'f2', nombre: 'Bebé en camino', fecha_nacimiento: null, fecha_probable_parto: dia(70), objetivos: ['Preparar el espacio del bebé'], consentimiento: { fecha: dia(-100), version: 'ejemplo-1' } },
      { id: 'm5', responsable_id: 'f3', nombre: 'Iker', fecha_nacimiento: nacido(9), fecha_probable_parto: null, objetivos: ['Probar alimentos nuevos'], consentimiento: { fecha: dia(-40), version: 'ejemplo-1' } },
    ],

    programa_semanas: programa(),

    // Semanas completadas por menor
    avance_semanal: [
      ...avance('m1', 3),   // Sofía (1–3 años): 3 de 12
      ...avance('m3', 12),  // Valentina (3–6 años): programa completo
      ...avance('m4', 6),   // Bebé en camino (embarazo): 6 de 12
      ...avance('m5', 5),   // Iker (6–12 meses): 5 de 12
      // Mateo (0–6 meses): aún sin empezar
    ],

    // Check-ins semanales (reportados por la familia)
    registros_habitos: [
      ...checkins('m1', et('1-3a'), 3, { sueno: 9.5, frutas_verduras: 1, agua: 2, juego_activo: 30, pantallas: 120 }),
      ...checkins('m3', et('3-6a'), 12, { sueno: 8.5, frutas_verduras: 1, agua: 2, juego_activo: 20, pantallas: 180 }),
      ...checkins('m4', et('embarazo'), 6, { sueno: 5.5, frutas_verduras: 2, agua: 4, movimiento: 5, descanso: 1 }),
      ...checkins('m5', et('6-12m'), 5, { sueno_total: 11, alimentos_nuevos: 0, tomas: 6, juego_piso: 10, pantallas: 30 }),
    ],

    // Evaluación inicial (línea base) y de cierre, con los indicadores de la etapa
    evaluaciones: [
      { id: 'ev1', menor_id: 'm1', tipo: 'inicial', fecha: dia(-28), valores: { sueno: 9.5, frutas_verduras: 1, agua: 2, juego_activo: 30, pantallas: 120 }, origen: 'familia' },
      { id: 'ev2', menor_id: 'm3', tipo: 'inicial', fecha: dia(-98), valores: { sueno: 8.5, frutas_verduras: 1, agua: 2, juego_activo: 20, pantallas: 180 }, origen: 'familia' },
      { id: 'ev3', menor_id: 'm3', tipo: 'cierre', fecha: dia(-5), valores: { sueno: 10, frutas_verduras: 3, agua: 5, juego_activo: 60, pantallas: 60 }, origen: 'familia' },
      { id: 'ev4', menor_id: 'm4', tipo: 'inicial', fecha: dia(-49), valores: { sueno: 5.5, frutas_verduras: 2, agua: 4, movimiento: 5, descanso: 1 }, origen: 'familia' },
      { id: 'ev5', menor_id: 'm5', tipo: 'inicial', fecha: dia(-42), valores: { sueno_total: 11, alimentos_nuevos: 0, tomas: 6, juego_piso: 10, pantallas: 30 }, origen: 'familia' },
    ],

    // Mediciones: las VERIFICADAS las registra un profesional; las REPORTADAS las captura la familia.
    mediciones: [
      { id: 'md1', menor_id: 'm1', tipo: 'Peso', valor: 13.2, unidad: 'kg', fecha: dia(-28), origen: 'profesional', verificado_por: 'p1' },
      { id: 'md2', menor_id: 'm1', tipo: 'Talla', valor: 91, unidad: 'cm', fecha: dia(-28), origen: 'profesional', verificado_por: 'p1' },
      { id: 'md3', menor_id: 'm1', tipo: 'Peso', valor: 13.5, unidad: 'kg', fecha: dia(-7), origen: 'familia', verificado_por: null },
      { id: 'md4', menor_id: 'm5', tipo: 'Peso', valor: 8.6, unidad: 'kg', fecha: dia(-42), origen: 'profesional', verificado_por: 'p1' },
      { id: 'md5', menor_id: 'm3', tipo: 'Peso', valor: 18.1, unidad: 'kg', fecha: dia(-98), origen: 'profesional', verificado_por: 'p2' },
      { id: 'md6', menor_id: 'm3', tipo: 'Peso', valor: 18.9, unidad: 'kg', fecha: dia(-5), origen: 'profesional', verificado_por: 'p2' },
    ],

    // Recomendaciones: el sistema las sugiere; una persona profesional las valida antes de que la familia las vea.
    recomendaciones: [
      { id: 'rc1', menor_id: 'm1', texto: 'Adelantar la hora de dormir 20 minutos durante dos semanas.', motivo: 'Sueño por debajo de la meta en los últimos check-ins.', origen: 'sistema', estado: 'pendiente', fecha: dia(-6), validada_por: null },
      { id: 'rc2', menor_id: 'm1', texto: 'Cambiar el jugo de la tarde por agua con fruta.', motivo: 'Objetivo de la familia y bebidas azucaradas en el punto de partida.', origen: 'sistema', estado: 'pendiente', fecha: dia(-6), validada_por: null },
      { id: 'rc3', menor_id: 'm5', texto: 'Ofrecer agua en vasito en cada comida.', motivo: 'Inicio de la alimentación complementaria.', origen: 'profesional', estado: 'validada', fecha: dia(-10), validada_por: 'p1' },
      { id: 'rc4', menor_id: 'm2', texto: 'Completar la línea base para empezar la semana 1.', motivo: 'Aún no hay evaluación inicial.', origen: 'sistema', estado: 'pendiente', fecha: dia(-2), validada_por: null },
    ],

    // ---------- Área profesional ----------
    casos: [
      { id: 'c1', profesional_id: 'p1', perfil_id: 'f1', menor_id: 'm1', titulo: 'Familia Méndez — Sofía', estado: 'activo', proxima_actividad: 'Revisar check-in de la semana 4', proxima_fecha: dia(3) },
      { id: 'c2', profesional_id: 'p1', perfil_id: 'f1', menor_id: 'm2', titulo: 'Familia Méndez — Mateo', estado: 'nuevo', proxima_actividad: 'Confirmar línea base', proxima_fecha: dia(5) },
      { id: 'c3', profesional_id: 'p1', perfil_id: 'f3', menor_id: 'm5', titulo: 'Familia Ortiz — Iker', estado: 'activo', proxima_actividad: 'Revisar alimentos nuevos', proxima_fecha: dia(6) },
      { id: 'c4', profesional_id: 'p1', perfil_id: 'u1', menor_id: null, titulo: 'Ana Torres — Perfil de hábitos (adulto)', estado: 'activo', proxima_actividad: 'Segunda cita de seguimiento', proxima_fecha: dia(12) },
      { id: 'c5', profesional_id: 'p2', perfil_id: 'f2', menor_id: 'm3', titulo: 'Familia Jiménez — Valentina', estado: 'cerrado', proxima_actividad: 'Entrega de reporte de cierre', proxima_fecha: dia(-3) },
      { id: 'c6', profesional_id: 'p2', perfil_id: 'f2', menor_id: 'm4', titulo: 'Familia Jiménez — Embarazo', estado: 'activo', proxima_actividad: 'Revisar plan de red de apoyo', proxima_fecha: dia(4) },
    ],
    notas_caso: [
      { id: 'n1', caso_id: 'c1', fecha: dia(-28), texto: 'Primera entrevista. Sofía toma jugo en la tarde y se duerme después de las 10. Acordamos empezar con agua y rutina de noche.' },
      { id: 'n2', caso_id: 'c1', fecha: dia(-7), texto: 'Semana 3 completada. Ya toma agua en el vaso propio. Mamá reporta menos resistencia. Sueño sigue bajo.' },
      { id: 'n3', caso_id: 'c3', fecha: dia(-10), texto: 'Inicio de alimentación complementaria sin reacciones. Se recomienda agua en vasito.' },
      { id: 'n4', caso_id: 'c5', fecha: dia(-5), texto: 'Cierre del programa. Pantallas pasaron de 3 horas a 1. Sueño de 8.5 a 10 horas. Se entrega reporte.' },
    ],

    // ---------- Administración ----------
    contenidos: [
      { id: 'cont1', organizacion_id: 'org-escuela', titulo: 'Guía para la familia — Infancia Sana', tipo: 'Guía PDF', estado: 'publicado', ejemplo: true },
      { id: 'cont2', organizacion_id: 'org-escuela', titulo: 'Cartel de acuerdos de pantallas', tipo: 'Material imprimible', estado: 'publicado', ejemplo: true },
      { id: 'cont3', organizacion_id: 'org-escuela', titulo: 'Video: desayunos sencillos (ejemplo)', tipo: 'Video', estado: 'borrador', ejemplo: true },
      { id: 'cont4', organizacion_id: 'org-ac', titulo: 'Taller para madres y padres (ejemplo)', tipo: 'Taller', estado: 'publicado', ejemplo: true },
      { id: 'cont5', organizacion_id: 'org-ac', titulo: 'Guía de lactancia (ejemplo)', tipo: 'Guía PDF', estado: 'publicado', ejemplo: true },
    ],
    programas: [
      { id: 'prog1', organizacion_id: 'org-escuela', nombre: 'Infancia Sana — Grupo Maternal A', etapa_id: '1-3a', semanas: 12, familias: 2, estado: 'en curso', ejemplo: true },
      { id: 'prog2', organizacion_id: 'org-ac', nombre: 'Infancia Sana — Comunidad Norte', etapa_id: '3-6a', semanas: 12, familias: 1, estado: 'concluido', ejemplo: true },
      { id: 'prog3', organizacion_id: 'org-ac', nombre: 'Ruta de embarazo — Grupo de otoño', etapa_id: 'embarazo', semanas: 12, familias: 1, estado: 'en curso', ejemplo: true },
    ],
    actividad_general: [
      { id: 'ag1', organizacion_id: 'org-escuela', fecha: dia(-7), texto: 'Laura Méndez completó la semana 3 de Sofía.' },
      { id: 'ag2', organizacion_id: 'org-escuela', fecha: dia(-6), texto: 'El sistema sugirió dos recomendaciones para Sofía (pendientes de validar).' },
      { id: 'ag3', organizacion_id: 'org-escuela', fecha: dia(-3), texto: 'Dra. Elena Ruiz agregó una nota al caso de Sofía.' },
      { id: 'ag4', organizacion_id: 'org-ac', fecha: dia(-5), texto: 'Valentina concluyó el programa de 12 semanas.' },
      { id: 'ag5', organizacion_id: 'org-ac', fecha: dia(-1), texto: 'Se publicó la guía de lactancia.' },
    ],

    // ---------- Público ----------
    mensajes_contacto: [],
    recorridos: [],
  };
}

// ---------- Persistencia sencilla en el navegador ----------
const CLAVE = 'infancia_demo_db';

function cargar() {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (crudo) {
      const guardado = JSON.parse(crudo);
      if (guardado.__ver === VER) return guardado;
    }
  } catch (e) { /* si localStorage falla, se trabaja en memoria */ }
  const nueva = semilla();
  nueva.__ver = VER;
  guardar(nueva);
  return nueva;
}

function guardar(db) {
  try { localStorage.setItem(CLAVE, JSON.stringify(db)); } catch (e) { /* memoria */ }
}

let db = cargar();

export const baseFalsa = {
  listar(tabla, filtro = {}) {
    const filas = db[tabla] || [];
    return filas.filter((f) => Object.entries(filtro).every(([k, v]) => f[k] === v)).map((f) => ({ ...f }));
  },
  obtener(tabla, id) {
    const f = (db[tabla] || []).find((x) => x.id === id);
    return f ? { ...f } : null;
  },
  insertar(tabla, fila) {
    const nueva = { id: fila.id || `${tabla.slice(0, 3)}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, ...fila };
    db[tabla] = db[tabla] || [];
    db[tabla].push(nueva);
    guardar(db);
    return { ...nueva };
  },
  actualizar(tabla, id, cambios) {
    const i = (db[tabla] || []).findIndex((x) => x.id === id);
    if (i < 0) return null;
    db[tabla][i] = { ...db[tabla][i], ...cambios };
    guardar(db);
    return { ...db[tabla][i] };
  },
  eliminar(tabla, id) {
    db[tabla] = (db[tabla] || []).filter((x) => x.id !== id);
    guardar(db);
  },
  reiniciar() {
    db = semilla();
    db.__ver = VER;
    guardar(db);
  },
};
