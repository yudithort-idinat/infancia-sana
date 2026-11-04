// Base de datos FALSA para la demostración (versión 1).
// Vive en el navegador (localStorage). Todo lo que hay aquí es contenido de EJEMPLO:
// MYO Genetics aún no define servicios, áreas ni el contenido real de las 12 semanas.
// Cuando se conecte Supabase, este archivo deja de usarse: api.js cambia de fuente.
// Si cambias la semilla, sube VER para que los navegadores recarguen los datos.

export const VER = 'infancia_demo_v2';

const hoy = new Date();
const dia = (n) => { const d = new Date(hoy); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

export function semilla() {
  return {
    // ---------- Organizaciones (para la vista de administración) ----------
    organizaciones: [
      { id: 'org-escuela', nombre: 'Escuela Primaria Ejemplo', tipo: 'escuela' },
      { id: 'org-ac', nombre: 'Fundación Ejemplo, A.C.', tipo: 'ac' },
      { id: 'org-gobierno', nombre: 'Dirección de Salud Municipal (ejemplo)', tipo: 'gobierno' },
    ],

    // ---------- Acceso de la dueña a la demostración ----------
    // Solo para la demo: al entrar con este correo y clave se abre el selector de vistas.
    // No es una cuenta real; las cuentas reales las creará el ingeniero con Supabase Auth.
    accesos_demo: [
      { id: 'duena', correo: 'yudithort@gmail.com', clave: '123456', nombre: 'Yudith' },
    ],

    // ---------- Perfiles de prueba ----------
    perfiles: [
      { id: 'u1', rol: 'usuario', nombre: 'Ana Torres', correo: 'ana@ejemplo.com', telefono: '614 000 0001', fecha_nacimiento: '1989-05-12', ciudad: 'Chihuahua', objetivo_principal: 'nutricion', organizacion_id: 'org-escuela', objetivos: ['Mejorar mis hábitos de alimentación', 'Dormir mejor entre semana'] },
      { id: 'u2', rol: 'usuario', nombre: 'Carlos Pérez', correo: 'carlos@ejemplo.com', telefono: '614 000 0002', fecha_nacimiento: '1978-11-03', ciudad: 'Chihuahua', objetivo_principal: 'bienestar', organizacion_id: 'org-escuela', objetivos: ['Tener más energía en el día'] },
      { id: 'u3', rol: 'usuario', nombre: 'Marta Lozano', correo: 'marta@ejemplo.com', telefono: '614 000 0003', fecha_nacimiento: '1995-02-20', ciudad: 'Delicias', objetivo_principal: 'familia', organizacion_id: 'org-ac', objetivos: [] },
      { id: 'f1', rol: 'familia', nombre: 'Laura Méndez', correo: 'laura@ejemplo.com', telefono: '614 000 0010', fecha_nacimiento: '1986-08-30', ciudad: 'Chihuahua', objetivo_principal: 'infancia', organizacion_id: 'org-escuela', objetivos: ['Que mis hijos coman más frutas y verduras', 'Menos pantallas por la tarde'] },
      { id: 'p1', rol: 'profesional', nombre: 'Dra. Elena Ruiz', correo: 'elena@ejemplo.com', telefono: '614 000 0020', especialidad: 'Nutrición (ejemplo)', organizacion_id: 'org-escuela', objetivos: [] },
      { id: 'a1', rol: 'admin', nombre: 'Coordinación escolar', correo: 'escuela@ejemplo.com', organizacion_id: 'org-escuela', objetivos: [] },
      { id: 'a2', rol: 'admin', nombre: 'Coordinación de la A.C.', correo: 'ac@ejemplo.com', organizacion_id: 'org-ac', objetivos: [] },
      { id: 'a3', rol: 'admin', nombre: 'Enlace de gobierno', correo: 'gobierno@ejemplo.com', organizacion_id: 'org-gobierno', objetivos: [] },
    ],

    // ---------- Áreas de interés (objetivos) del recorrido ----------
    // Cada área trae sus preguntas ilustrativas y una orientación general de ejemplo.
    objetivos: [
      {
        id: 'nutricion', icono: '🥗', nombre: 'Nutrición y hábitos',
        descripcion: 'Entender cómo comes hoy y qué pequeños cambios te acercan a sentirte mejor.',
        para_quien: 'Adultos que quieren ordenar su alimentación sin dietas extremas.',
        servicios: ['s1', 's2'],
        preguntas: [
          { id: 'q1', texto: '¿Cuántas veces al día sueles comer?', opciones: ['1 o 2', '3', '4 o más'] },
          { id: 'q2', texto: '¿Qué tan seguido incluyes frutas y verduras?', opciones: ['Casi nunca', 'Algunos días', 'Todos los días'] },
          { id: 'q3', texto: '¿Qué te cuesta más trabajo?', opciones: ['Planear mis comidas', 'Los antojos', 'Comer fuera de casa', 'No sé por dónde empezar'] },
        ],
        orientacion: 'Con base en tus respuestas, un buen punto de partida sería una orientación inicial para revisar tus hábitos actuales y definir dos o tres cambios realistas. (Texto de ejemplo: la orientación real la definirá el equipo de MYO Genetics.)',
      },
      {
        id: 'infancia', icono: '🧒', nombre: 'Infancia sana',
        descripcion: 'Acompañar a niñas y niños a formar hábitos de alimentación, sueño y movimiento desde casa.',
        para_quien: 'Madres, padres y personas responsables de menores de 3 a 12 años.',
        servicios: ['s3', 's1'],
        preguntas: [
          { id: 'q1', texto: '¿Qué edad tiene el menor que te interesa acompañar?', opciones: ['3 a 5 años', '6 a 9 años', '10 a 12 años'] },
          { id: 'q2', texto: '¿Cuál es tu mayor reto hoy?', opciones: ['Que coma verduras', 'Las pantallas', 'El sueño', 'Que se mueva más'] },
          { id: 'q3', texto: '¿Quién participa en casa en estos hábitos?', opciones: ['Solo yo', 'Ambos padres o tutores', 'Toda la familia'] },
          { id: 'q4', texto: '¿Cuánto tiempo a la semana podrían dedicarle?', opciones: ['Menos de 1 hora', '1 a 2 horas', 'Más de 2 horas'] },
        ],
        orientacion: 'Tu familia podría beneficiarse del programa Infancia Sana: 12 semanas con una actividad sencilla por semana y un registro de hábitos para ver el avance. (Texto de ejemplo.)',
      },
      {
        id: 'bienestar', icono: '⚡', nombre: 'Bienestar y energía',
        descripcion: 'Dormir mejor, tener más energía y manejar el estrés del día a día.',
        para_quien: 'Personas con jornadas largas que sienten cansancio constante.',
        servicios: ['s1', 's5'],
        preguntas: [
          { id: 'q1', texto: '¿Cuántas horas duermes normalmente?', opciones: ['Menos de 6', '6 a 7', '8 o más'] },
          { id: 'q2', texto: '¿Cómo describes tu energía por las tardes?', opciones: ['Muy baja', 'Regular', 'Buena'] },
          { id: 'q3', texto: '¿Haces alguna actividad física a la semana?', opciones: ['Ninguna', '1 a 2 veces', '3 o más veces'] },
        ],
        orientacion: 'Una orientación inicial ayudaría a identificar qué está pesando más: el sueño, la alimentación o el movimiento, y a elegir un seguimiento adecuado. (Texto de ejemplo.)',
      },
      {
        id: 'familia', icono: '👨‍👩‍👧', nombre: 'Salud familiar',
        descripcion: 'Un plan compartido para que toda la familia avance junta.',
        para_quien: 'Familias que quieren cambiar hábitos en conjunto, no una persona a la vez.',
        servicios: ['s3', 's4'],
        preguntas: [
          { id: 'q1', texto: '¿Cuántas personas viven en casa?', opciones: ['2', '3 a 4', '5 o más'] },
          { id: 'q2', texto: '¿Hay menores en casa?', opciones: ['No', 'Sí, uno', 'Sí, dos o más'] },
          { id: 'q3', texto: '¿Qué les gustaría lograr primero?', opciones: ['Comer mejor', 'Moverse más', 'Dormir mejor', 'Pasar menos tiempo en pantallas'] },
        ],
        orientacion: 'Podrían empezar por el programa Infancia Sana si hay menores, o por una orientación inicial para toda la familia. (Texto de ejemplo.)',
      },
    ],

    // ---------- Catálogo de servicios (EJEMPLO) ----------
    servicios: [
      { id: 's1', nombre: 'Orientación inicial', descripcion: 'Una primera conversación para entender tu situación y proponerte un camino.', para_quien: 'Cualquier persona que quiera empezar.', disponible: true, ejemplo: true },
      { id: 's2', nombre: 'Perfil de hábitos y nutrición', descripcion: 'Evaluación de hábitos de alimentación con un plan de cambios graduales.', para_quien: 'Adultos.', disponible: true, ejemplo: true },
      { id: 's3', nombre: 'Programa Infancia Sana (12 semanas)', descripcion: 'Programa educativo estructurado para familias: una actividad por semana y registro de hábitos.', para_quien: 'Familias con menores de 3 a 12 años.', disponible: true, ejemplo: true },
      { id: 's4', nombre: 'Acompañamiento a escuelas y organizaciones', descripcion: 'Implementación del programa en grupos escolares, asociaciones civiles o programas de gobierno.', para_quien: 'Escuelas, A.C. y gobierno.', disponible: true, ejemplo: true },
      { id: 's5', nombre: 'Seguimiento profesional', descripcion: 'Citas periódicas con un profesional para revisar avances y ajustar el plan.', para_quien: 'Personas que ya tienen un plan en marcha.', disponible: true, ejemplo: true },
    ],

    // ---------- Servicios solicitados por cada usuario ----------
    solicitudes: [
      { id: 'sol1', perfil_id: 'u1', servicio_id: 's1', estado: 'completado', fecha: dia(-30) },
      { id: 'sol2', perfil_id: 'u1', servicio_id: 's2', estado: 'en_proceso', fecha: dia(-14) },
      { id: 'sol3', perfil_id: 'f1', servicio_id: 's3', estado: 'activo', fecha: dia(-25) },
      { id: 'sol4', perfil_id: 'u2', servicio_id: 's1', estado: 'solicitado', fecha: dia(-2) },
    ],

    // ---------- Actividades de seguimiento del usuario adulto ----------
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
      { id: 'doc2', perfil_id: 'u1', nombre: 'Plan de hábitos — primera versión (ejemplo).pdf', tipo: 'Plan', fecha: dia(-12) },
      { id: 'doc3', perfil_id: 'f1', nombre: 'Guía para la familia — Infancia Sana (ejemplo).pdf', tipo: 'Guía', fecha: dia(-25) },
    ],

    recordatorios: [
      { id: 'rec1', perfil_id: 'u1', texto: 'Tomar agua al despertar', cuando: 'Todos los días, 7:00' },
      { id: 'rec2', perfil_id: 'u1', texto: 'Preparar la comida del día siguiente', cuando: 'Lunes a viernes, 21:00' },
      { id: 'rec3', perfil_id: 'f1', texto: 'Registro semanal de hábitos de Sofía y Diego', cuando: 'Domingos, 18:00' },
    ],

    // ---------- Área familiar ----------
    menores: [
      { id: 'm1', responsable_id: 'f1', nombre: 'Sofía', edad: 7, etapa: 'Primaria baja', objetivos: ['Probar una verdura nueva cada semana', 'Dormir antes de las 9'] },
      { id: 'm2', responsable_id: 'f1', nombre: 'Diego', edad: 4, etapa: 'Preescolar', objetivos: ['Jugar activo todos los días'] },
    ],

    // Programa Infancia Sana: 12 semanas (CONTENIDO DE EJEMPLO, por definir con MYO Genetics)
    programa_semanas: [
      { numero: 1, titulo: 'Conocemos nuestros hábitos', contenido: 'Esta semana observamos, sin cambiar nada todavía, qué come, cuánto duerme y cuánto se mueve el menor. La idea es tener un punto de partida honesto.', actividad: 'Anotar en una hoja qué desayunó, comió y cenó durante tres días.' },
      { numero: 2, titulo: 'Un desayuno que dé energía', contenido: 'El desayuno marca el ritmo del día. Vemos ejemplos sencillos y económicos de desayunos completos.', actividad: 'Preparar juntos un desayuno con una fruta, un cereal y una proteína.' },
      { numero: 3, titulo: 'Agua primero', contenido: 'Cambiar bebidas azucaradas por agua es uno de los cambios con más efecto. Hablamos de cómo hacerlo sin pleitos.', actividad: 'Tener una botella de agua personal y llenarla cada mañana.' },
      { numero: 4, titulo: 'Frutas y verduras de colores', contenido: 'Mientras más colores en el plato, más variedad de nutrientes. Juego de colores para la semana.', actividad: 'Probar una fruta o verdura nueva y dibujarla.' },
      { numero: 5, titulo: 'Moverse jugando', contenido: 'El movimiento en la infancia es juego, no ejercicio. Ideas para 30 minutos activos al día.', actividad: 'Tres tardes de juego activo en familia (pelota, bailar, escondidas).' },
      { numero: 6, titulo: 'Dormir bien', contenido: 'Rutina para ir a dormir, horarios y por qué el sueño cambia el apetito y el ánimo.', actividad: 'Fijar una hora de dormir y cumplirla cinco noches.' },
      { numero: 7, titulo: 'Pantallas con medida', contenido: 'Acuerdos familiares sobre cuándo sí y cuándo no usar pantallas.', actividad: 'Hacer un cartel de acuerdos de pantallas y pegarlo en casa.' },
      { numero: 8, titulo: 'Emociones y comida', contenido: 'Distinguir hambre de aburrimiento o enojo. Alternativas cuando no es hambre.', actividad: 'Nombrar la emoción antes de pedir algo de comer, durante una semana.' },
      { numero: 9, titulo: 'Comer en familia', contenido: 'Las comidas compartidas, sin pantallas, mejoran lo que se come y la convivencia.', actividad: 'Tres comidas en familia en la mesa, sin pantallas.' },
      { numero: 10, titulo: 'La lonchera', contenido: 'Qué llevar a la escuela: opciones prácticas y cómo involucrar al menor.', actividad: 'Que el menor arme su lonchera dos días con una lista de opciones.' },
      { numero: 11, titulo: 'Hábitos que se quedan', contenido: 'Repasamos qué funcionó y qué no. Elegimos los tres hábitos que la familia quiere conservar.', actividad: 'Escribir los tres hábitos elegidos y ponerlos en el refrigerador.' },
      { numero: 12, titulo: 'Celebramos y seguimos', contenido: 'Cierre del programa: reconocimiento al menor y plan sencillo para los siguientes tres meses.', actividad: 'Celebración familiar y entrega del reconocimiento.' },
    ],

    // Avance por menor y semana (se completa desde el área familiar)
    avance_semanal: [
      { id: 'av1', menor_id: 'm1', semana: 1, completada: true, fecha: dia(-21) },
      { id: 'av2', menor_id: 'm1', semana: 2, completada: true, fecha: dia(-14) },
      { id: 'av3', menor_id: 'm1', semana: 3, completada: true, fecha: dia(-7) },
      { id: 'av4', menor_id: 'm2', semana: 1, completada: true, fecha: dia(-20) },
    ],

    // Registro semanal de hábitos (formulario breve de demostración)
    registros_habitos: [
      { id: 'rh1', menor_id: 'm1', semana: 1, sueno: 8, frutas_verduras: 1, juego_activo: 20, pantallas: 3, agua: 3, fecha: dia(-21) },
      { id: 'rh2', menor_id: 'm1', semana: 2, sueno: 8.5, frutas_verduras: 2, juego_activo: 30, pantallas: 2.5, agua: 4, fecha: dia(-14) },
      { id: 'rh3', menor_id: 'm1', semana: 3, sueno: 9, frutas_verduras: 2, juego_activo: 35, pantallas: 2, agua: 5, fecha: dia(-7) },
      { id: 'rh4', menor_id: 'm2', semana: 1, sueno: 10, frutas_verduras: 1, juego_activo: 40, pantallas: 1.5, agua: 3, fecha: dia(-20) },
    ],

    // ---------- Área profesional ----------
    casos: [
      { id: 'c1', profesional_id: 'p1', perfil_id: 'u1', menor_id: null, titulo: 'Ana Torres — Perfil de hábitos', estado: 'activo', proxima_actividad: 'Segunda cita de seguimiento', proxima_fecha: dia(12) },
      { id: 'c2', profesional_id: 'p1', perfil_id: 'f1', menor_id: 'm1', titulo: 'Familia Méndez — Sofía, Infancia Sana', estado: 'activo', proxima_actividad: 'Revisar registro de la semana 4', proxima_fecha: dia(3) },
      { id: 'c3', profesional_id: 'p1', perfil_id: 'u2', menor_id: null, titulo: 'Carlos Pérez — Orientación inicial', estado: 'nuevo', proxima_actividad: 'Primera entrevista', proxima_fecha: dia(6) },
    ],
    notas_caso: [
      { id: 'n1', caso_id: 'c1', fecha: dia(-28), texto: 'Primera entrevista. Desayuna poco y cena tarde. Acordamos registrar desayunos cinco días.' },
      { id: 'n2', caso_id: 'c1', fecha: dia(-3), texto: 'Revisión: cumplió el registro. Agregamos fruta al desayuno y caminata tres veces por semana.' },
      { id: 'n3', caso_id: 'c2', fecha: dia(-7), texto: 'Semana 3 completada. Sofía ya toma agua en lugar de jugo en la escuela. Mamá reporta menos resistencia.' },
    ],

    // ---------- Administración ----------
    contenidos: [
      { id: 'cont1', organizacion_id: 'org-escuela', titulo: 'Guía para la familia — Infancia Sana', tipo: 'Guía PDF', estado: 'publicado', ejemplo: true },
      { id: 'cont2', organizacion_id: 'org-escuela', titulo: 'Cartel de acuerdos de pantallas', tipo: 'Material imprimible', estado: 'publicado', ejemplo: true },
      { id: 'cont3', organizacion_id: 'org-escuela', titulo: 'Video: desayunos sencillos (ejemplo)', tipo: 'Video', estado: 'borrador', ejemplo: true },
      { id: 'cont4', organizacion_id: 'org-ac', titulo: 'Taller para madres y padres (ejemplo)', tipo: 'Taller', estado: 'publicado', ejemplo: true },
    ],
    programas: [
      { id: 'prog1', organizacion_id: 'org-escuela', nombre: 'Infancia Sana — Grupo 2°A', semanas: 12, familias: 1, estado: 'en curso', ejemplo: true },
      { id: 'prog2', organizacion_id: 'org-ac', nombre: 'Infancia Sana — Comunidad Norte', semanas: 12, familias: 0, estado: 'por iniciar', ejemplo: true },
    ],
    actividad_general: [
      { id: 'ag1', organizacion_id: 'org-escuela', fecha: dia(-7), texto: 'Laura Méndez completó la semana 3 de Sofía.' },
      { id: 'ag2', organizacion_id: 'org-escuela', fecha: dia(-3), texto: 'Dra. Elena Ruiz agregó una nota al caso de Ana Torres.' },
      { id: 'ag3', organizacion_id: 'org-escuela', fecha: dia(-2), texto: 'Carlos Pérez solicitó Orientación inicial.' },
      { id: 'ag4', organizacion_id: 'org-ac', fecha: dia(-1), texto: 'Se publicó el taller para madres y padres.' },
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
