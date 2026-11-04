// Única puerta de acceso a los datos. Hoy apunta a la base falsa (demo).
// Fase 2: cambiar la fuente a Supabase (ver supabase.js y docs/04-Guia-para-el-ingeniero.md)
// sin tocar las páginas: todas hablan solo con estas funciones.
import { baseFalsa } from './demo/base-falsa.js';

const fuente = baseFalsa;

export const api = {
  listar: (tabla, filtro) => fuente.listar(tabla, filtro),
  obtener: (tabla, id) => fuente.obtener(tabla, id),
  insertar: (tabla, fila) => fuente.insertar(tabla, fila),
  actualizar: (tabla, id, cambios) => fuente.actualizar(tabla, id, cambios),
  eliminar: (tabla, id) => fuente.eliminar(tabla, id),
  reiniciar: () => fuente.reiniciar(),
};

// Ayudas de dominio que usan varias páginas
export function nombreServicio(id) {
  const s = api.obtener('servicios', id);
  return s ? s.nombre : 'Servicio';
}

export const ESTADOS = {
  solicitado: { texto: 'Solicitado', clase: 'aviso' },
  en_proceso: { texto: 'En proceso', clase: '' },
  activo: { texto: 'Activo', clase: '' },
  completado: { texto: 'Completado', clase: 'ok' },
  pendiente: { texto: 'Pendiente', clase: 'aviso' },
  completada: { texto: 'Completada', clase: 'ok' },
  nuevo: { texto: 'Nuevo', clase: 'aviso' },
  pausado: { texto: 'Pausado', clase: 'gris' },
  cerrado: { texto: 'Cerrado', clase: 'gris' },
  publicado: { texto: 'Publicado', clase: 'ok' },
  borrador: { texto: 'Borrador', clase: 'gris' },
  'en curso': { texto: 'En curso', clase: '' },
  'por iniciar': { texto: 'Por iniciar', clase: 'aviso' },
};

export function etiquetaEstado(estado) {
  const e = ESTADOS[estado] || { texto: estado, clase: 'gris' };
  return `<span class="etiqueta ${e.clase}">${e.texto}</span>`;
}

export function fechaBonita(iso) {
  if (!iso) return '';
  const [a, m, d] = iso.split('-').map(Number);
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d} ${meses[m - 1]} ${a}`;
}

export function hoyISO() { return new Date().toISOString().slice(0, 10); }

// Registra un movimiento en la vista de actividad general de la organización
export function registrarActividad(organizacion_id, texto) {
  if (!organizacion_id) return;
  api.insertar('actividad_general', { organizacion_id, fecha: hoyISO(), texto });
}

// Avance de un menor en el programa (0-12 semanas completadas)
export function avanceMenor(menor_id) {
  const hechas = api.listar('avance_semanal', { menor_id }).filter((a) => a.completada).map((a) => a.semana);
  const total = api.listar('programa_semanas').length || 12;
  const completadas = hechas.length;
  const semanaActiva = Math.min(total, completadas + 1);
  return { completadas, total, semanaActiva, porcentaje: Math.round((completadas / total) * 100), hechas };
}
