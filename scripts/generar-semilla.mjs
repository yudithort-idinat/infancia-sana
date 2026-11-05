// Genera supabase/seed/semilla_v2.sql a partir de la semilla de la demo (etapas y programa por etapa).
// Uso:  node scripts/generar-semilla.mjs
import { writeFileSync } from 'node:fs';
import { semilla } from '../web/assets/js/demo/base-falsa.js';

const db = semilla();
const q = (v) => (v === null || v === undefined ? 'null' : typeof v === 'boolean' || typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const j = (v) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;

let sql = '-- Semilla v2 (CONTENIDO DE EJEMPLO): etapas y programa de 12 semanas por etapa.\n';
sql += '-- Generada con scripts/generar-semilla.mjs desde web/assets/js/demo/base-falsa.js. Se aplica después de la migración 0002.\n\nbegin;\n\n';
sql += db.etapas.map((e) => `insert into etapas (id, orden, nombre, corto, icono, color, rango, complementaria, descripcion, indicadores, preguntas) values (${q(e.id)}, ${e.orden}, ${q(e.nombre)}, ${q(e.corto)}, ${q(e.icono)}, ${q(e.color)}, ${q(e.rango)}, ${e.complementaria}, ${q(e.descripcion)}, ${j(e.indicadores)}, ${j(e.preguntas)})\n  on conflict (id) do update set orden = excluded.orden, nombre = excluded.nombre, corto = excluded.corto, icono = excluded.icono, color = excluded.color, rango = excluded.rango, complementaria = excluded.complementaria, descripcion = excluded.descripcion, indicadores = excluded.indicadores, preguntas = excluded.preguntas;`).join('\n');
sql += '\n\ndelete from programa_semanas;\n';
sql += db.programa_semanas.map((s) => `insert into programa_semanas (etapa_id, numero, titulo, objetivo, contenido, actividad, materiales, checkin) values (${q(s.etapa_id)}, ${s.numero}, ${q(s.titulo)}, ${q(s.objetivo)}, ${q(s.contenido)}, ${q(s.actividad)}, ${q(s.materiales)}, ${q(s.checkin)});`).join('\n');
sql += '\n\ncommit;\n';
writeFileSync(new URL('../supabase/seed/semilla_v2.sql', import.meta.url), sql);
console.log(`semilla_v2.sql: ${db.etapas.length} etapas, ${db.programa_semanas.length} semanas`);
