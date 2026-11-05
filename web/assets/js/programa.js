// Reglas del programa Infancia Sana que usan varias páginas: etapa por edad, avance,
// puntaje del check-in por etapa, logros, pendientes y alertas.
// Todo pasa por api.js (una sola puerta a los datos). Las fórmulas son de EJEMPLO.
import { api, hoyISO } from './api.js';

// ---------- Etapas y edad ----------
export function etapasTodas() { return api.listar('etapas').sort((a, b) => a.orden - b.orden); }
export function etapa(id) { return api.obtener('etapas', id); }

// Meses cumplidos entre una fecha ISO y hoy
export function mesesDesde(iso) {
  if (!iso) return null;
  const [a, m, d] = iso.split('-').map(Number);
  const h = new Date();
  let meses = (h.getFullYear() - a) * 12 + (h.getMonth() + 1 - m);
  if (h.getDate() < d) meses -= 1;
  return Math.max(0, meses);
}

// Etapa que corresponde a un menor según su fecha de nacimiento (o fecha probable de parto)
export function etapaDe(menor) {
  if (!menor) return null;
  if (!menor.fecha_nacimiento) return etapa('embarazo');
  const meses = mesesDesde(menor.fecha_nacimiento);
  if (meses < 6) return etapa('0-6m');
  if (meses < 12) return etapa('6-12m');
  if (meses < 36) return etapa('1-3a');
  return etapa('3-6a');
}

// «4 meses», «2 años 8 meses», «nace en ~10 semanas»
export function edadTexto(menor) {
  if (!menor.fecha_nacimiento) {
    if (!menor.fecha_probable_parto) return 'En camino';
    const dias = Math.round((new Date(menor.fecha_probable_parto) - new Date()) / 86400000);
    return dias > 0 ? `nace en ~${Math.max(1, Math.round(dias / 7))} semanas` : 'fecha probable de parto pasada';
  }
  const meses = mesesDesde(menor.fecha_nacimiento);
  if (meses < 24) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  const a = Math.floor(meses / 12); const m = meses % 12;
  return `${a} años${m ? ` ${m} ${m === 1 ? 'mes' : 'meses'}` : ''}`;
}

export function fueraDeRango(menor) {
  if (!menor.fecha_nacimiento) return false;
  return mesesDesde(menor.fecha_nacimiento) >= 72;
}

// ---------- Programa y avance ----------
export function semanasDe(etapa_id) {
  return api.listar('programa_semanas', { etapa_id }).sort((a, b) => a.numero - b.numero);
}

export function lineaBase(menor_id) { return api.listar('evaluaciones', { menor_id, tipo: 'inicial' })[0] || null; }
export function cierre(menor_id) { return api.listar('evaluaciones', { menor_id, tipo: 'cierre' })[0] || null; }

// Avance de un menor: semanas completadas, activa, siguiente y porcentaje
export function avanceMenor(menor_id) {
  const menor = api.obtener('menores', menor_id);
  const et = etapaDe(menor);
  const programa = et ? semanasDe(et.id) : [];
  const total = programa.length || 12;
  const hechas = api.listar('avance_semanal', { menor_id }).filter((a) => a.completada).map((a) => a.semana).sort((a, b) => a - b);
  const completadas = hechas.length;
  const terminado = completadas >= total;
  const semanaActiva = terminado ? total : Math.min(total, completadas + 1);
  const siguiente = terminado ? null : Math.min(total, semanaActiva + 1);
  return { etapa: et, programa, total, hechas, completadas, terminado, semanaActiva, siguiente, porcentaje: Math.round((completadas / total) * 100), lineaBase: lineaBase(menor_id), cierre: cierre(menor_id) };
}

// ---------- Puntaje del check-in (0 a 100), distinto por etapa ----------
// Cada indicador tiene una meta (mínimo a alcanzar o máximo a no rebasar) y un peso. Fórmula de ejemplo.
export function cumplimiento(ind, valor) {
  if (valor === undefined || valor === null || valor === '') return 0;
  const v = Number(valor); const meta = ind.meta.valor;
  if (ind.meta.tipo === 'min') return meta === 0 ? 1 : Math.min(1, v / meta);
  // máximo: por debajo de la meta = 100 %; por encima, baja gradualmente
  if (v <= meta) return 1;
  const tolerancia = meta || 60;
  return Math.max(0, 1 - (v - meta) / tolerancia);
}
export function puntaje(et, valores) {
  if (!et || !valores) return 0;
  return Math.round(et.indicadores.reduce((n, ind) => n + ind.peso * cumplimiento(ind, valores[ind.clave]), 0));
}

export function checkinsDe(menor_id) { return api.listar('registros_habitos', { menor_id }).sort((a, b) => a.semana - b.semana); }

// ---------- Logros e insignias (de ejemplo) ----------
export const INSIGNIAS = [
  { id: 'base', icono: '📍', nombre: 'Punto de partida', texto: 'Completaron la línea base.' },
  { id: 'primera', icono: '🌱', nombre: 'Primera semana', texto: 'Terminaron la semana 1.' },
  { id: 'racha3', icono: '🔥', nombre: 'Tres seguidas', texto: 'Tres semanas completadas.' },
  { id: 'mitad', icono: '⛰️', nombre: 'Mitad del camino', texto: 'Seis de doce semanas.' },
  { id: 'constancia', icono: '📅', nombre: 'Constancia', texto: 'Check-in registrado en todas las semanas completadas.' },
  { id: 'completo', icono: '🏅', nombre: 'Programa completo', texto: 'Las doce semanas de la etapa.' },
  { id: 'cierre', icono: '📊', nombre: 'Antes y después', texto: 'Evaluación de cierre registrada.' },
];
export function logrosMenor(menor_id) {
  const av = avanceMenor(menor_id);
  const ck = checkinsDe(menor_id);
  const ganadas = new Set();
  if (av.lineaBase) ganadas.add('base');
  if (av.completadas >= 1) ganadas.add('primera');
  if (av.completadas >= 3) ganadas.add('racha3');
  if (av.completadas >= 6) ganadas.add('mitad');
  if (av.completadas >= 1 && av.hechas.every((s) => ck.some((c) => c.semana === s))) ganadas.add('constancia');
  if (av.terminado) ganadas.add('completo');
  if (av.cierre) ganadas.add('cierre');
  return INSIGNIAS.map((i) => ({ ...i, ganada: ganadas.has(i.id) }));
}

// ---------- Pendientes del menor (qué hacer primero) ----------
export function pendientesMenor(menor_id) {
  const m = api.obtener('menores', menor_id);
  const av = avanceMenor(menor_id);
  const lista = [];
  if (!av.lineaBase) lista.push({ tipo: 'base', texto: `Completar la línea base de ${m.nombre}`, menor_id });
  else if (!av.terminado) {
    const sem = av.programa[av.semanaActiva - 1];
    lista.push({ tipo: 'semana', texto: `Semana ${av.semanaActiva} de ${m.nombre}: ${sem ? sem.actividad : ''}`, menor_id, semana: av.semanaActiva });
  } else if (!av.cierre) lista.push({ tipo: 'cierre', texto: `Registrar la evaluación de cierre de ${m.nombre}`, menor_id });
  const recos = api.listar('recomendaciones', { menor_id, estado: 'validada' });
  if (recos.length) lista.push({ tipo: 'reco', texto: `${recos.length} recomendación(es) validada(s) para ${m.nombre}`, menor_id });
  return lista;
}

// ---------- Alertas para la persona profesional (reglas de ejemplo) ----------
export function alertasMenor(menor_id) {
  const m = api.obtener('menores', menor_id);
  const av = avanceMenor(menor_id);
  const ck = checkinsDe(menor_id);
  const alertas = [];
  if (!av.lineaBase) alertas.push({ nivel: 'aviso', texto: 'Sin línea base: no se puede medir el cambio.' });
  const ultimo = ck[ck.length - 1];
  if (ultimo) {
    const dias = Math.round((new Date() - new Date(ultimo.fecha)) / 86400000);
    if (dias > 14 && !av.terminado) alertas.push({ nivel: 'error', texto: `Sin check-in desde hace ${dias} días (riesgo de abandono).` });
  } else if (av.lineaBase) alertas.push({ nivel: 'aviso', texto: 'Todavía no hay check-ins semanales.' });
  if (av.etapa && ck.length >= 2) {
    const ult2 = ck.slice(-2);
    av.etapa.indicadores.forEach((ind) => {
      const bajo = ult2.every((c) => cumplimiento(ind, (c.valores || {})[ind.clave]) < 0.6);
      if (bajo) alertas.push({ nivel: 'aviso', texto: `«${ind.etiqueta}» lejos de la meta en los últimos dos check-ins.` });
    });
  }
  if (fueraDeRango(m)) alertas.push({ nivel: 'aviso', texto: 'El menor ya rebasó los 6 años: fuera del rango del programa.' });
  return alertas;
}

// ---------- Métricas colectivas (para coordinación / instituciones) ----------
export function metricasDe(menores) {
  const hoy = new Date();
  const avs = menores.map((m) => ({ m, av: avanceMenor(m.id), ck: checkinsDe(m.id) }));
  const inscritos = menores.length;
  const iniciados = avs.filter((x) => x.av.lineaBase || x.av.completadas > 0).length;
  const participando = avs.filter((x) => { const u = x.ck[x.ck.length - 1]; return u && (hoy - new Date(u.fecha)) / 86400000 <= 14 && !x.av.terminado; }).length;
  const concluidos = avs.filter((x) => x.av.terminado).length;
  const avancePromedio = inscritos ? Math.round(avs.reduce((n, x) => n + x.av.porcentaje, 0) / inscritos) : 0;
  const porSemana = Array.from({ length: 12 }, (_, i) => avs.filter((x) => x.av.hechas.includes(i + 1)).length);
  const porEtapa = etapasTodas().map((e) => { const grupo = avs.filter((x) => x.av.etapa && x.av.etapa.id === e.id); return { etapa: e, inscritos: grupo.length, avance: grupo.length ? Math.round(grupo.reduce((n, x) => n + x.av.porcentaje, 0) / grupo.length) : 0, concluidos: grupo.filter((x) => x.av.terminado).length }; });
  // Cambio promedio antes/después entre quienes tienen inicial y cierre
  const conCierre = avs.filter((x) => x.av.lineaBase && x.av.cierre);
  const mejora = conCierre.length ? Math.round(conCierre.reduce((n, x) => n + (puntaje(x.av.etapa, x.av.cierre.valores) - puntaje(x.av.etapa, x.av.lineaBase.valores)), 0) / conCierre.length) : null;
  return { inscritos, iniciados, participando, concluidos, avancePromedio, porSemana, porEtapa, mejora, conCierre: conCierre.length };
}

// Fecha de hoy para registros
export { hoyISO };

// Nombre corto de un indicador (para encabezados de tablas angostas)
const CORTAS = { sueno: 'Sueño', sueno_total: 'Sueño', frutas_verduras: 'Frutas y verd.', agua: 'Agua', movimiento: 'Movimiento', descanso: 'Descanso', tomas: 'Tomas', boca_abajo: 'Boca abajo', contacto: 'Contacto', pantallas: 'Pantallas', alimentos_nuevos: 'Alim. nuevos', juego_piso: 'Juego en piso', juego_activo: 'Juego activo' };
export function cortaInd(ind) { return CORTAS[ind.clave] || ind.etiqueta.split(' ')[0]; }
