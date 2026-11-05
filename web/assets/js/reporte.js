// Reporte exportable (ejemplo, sin datos reales):
//   reporte.html?menor=ID  → progreso familiar de un menor (lo abre la familia dueña o el profesional asignado)
//   reporte.html?org=ID    → indicadores agregados del programa (lo abre la coordinación de esa organización)
import { api, fechaBonita, hoyISO } from './api.js';
import { sesionActual } from './auth.js';
import { etapaDe, edadTexto, avanceMenor, puntaje, cumplimiento, checkinsDe, logrosMenor, metricasDe } from './programa.js';
import { $, escapar, montarEncabezado, montarPie, estadoVacio, barras } from './ui.js';

montarEncabezado('espacio');
montarPie();
const s = sesionActual();
const q = new URLSearchParams(location.search);
const caja = $('#reporte');
const TIPO = { escuela: 'Escuela / centro infantil', ac: 'Asociación civil', gobierno: 'Gobierno' };

$('#btn-imprimir').addEventListener('click', () => window.print());
$('#volver').addEventListener('click', (e) => { e.preventDefault(); history.length > 1 ? history.back() : (location.href = 'index.html'); });

function cabecera(titulo, sub) {
  return `<div class="cabecera"><div><span class="marca-agua">REPORTE DE EJEMPLO · SIN INFORMACIÓN REAL</span><h1 style="font-size:1.5rem;margin-top:10px">${escapar(titulo)}</h1><p class="suave" style="margin:0">${escapar(sub)}</p></div><div style="text-align:right"><strong>Infancia Sana</strong><br><span class="chico suave">Un programa de MYO Genetics<br>Generado el ${fechaBonita(hoyISO())}</span></div></div>`;
}

if (!s) {
  caja.innerHTML = estadoVacio('🔒', 'Entra con un perfil para ver un reporte.', '<a class="boton primario" href="acceso.html">Entrar</a>');
} else if (q.get('menor')) {
  const m = api.obtener('menores', q.get('menor'));
  const permitido = m && ((s.rol === 'familia' && m.responsable_id === s.perfil.id) || (s.rol === 'profesional' && api.listar('casos', { profesional_id: s.perfil.id, menor_id: m.id }).length));
  if (!permitido) caja.innerHTML = estadoVacio('🔒', 'Este reporte no corresponde a tu perfil.');
  else {
    const resp = api.obtener('perfiles', m.responsable_id) || {};
    const av = avanceMenor(m.id); const e = av.etapa;
    const ck = checkinsDe(m.id);
    const logros = logrosMenor(m.id).filter((l) => l.ganada);
    const recos = api.listar('recomendaciones', { menor_id: m.id, estado: 'validada' });
    const med = api.listar('mediciones', { menor_id: m.id }).sort((a, b) => a.fecha.localeCompare(b.fecha));
    const ultimo = ck[ck.length - 1];
    caja.innerHTML = `
      ${cabecera(`Progreso familiar · ${m.nombre}`, `Familia ${resp.nombre || ''} · ${edadTexto(m)} · etapa ${e.nombre}`)}
      <div class="cifras"><div class="cifra"><strong>${av.completadas}/${av.total}</strong><span>semanas completadas</span></div><div class="cifra"><strong>${av.porcentaje}%</strong><span>avance</span></div><div class="cifra"><strong>${av.lineaBase ? puntaje(e, av.lineaBase.valores) : '—'}</strong><span>puntaje inicial</span></div><div class="cifra"><strong>${av.cierre ? puntaje(e, av.cierre.valores) : ultimo ? puntaje(e, ultimo.valores) : '—'}</strong><span>${av.cierre ? 'puntaje de cierre' : 'último puntaje'}</span></div><div class="cifra"><strong>${logros.length}</strong><span>logros</span></div></div>
      <h2>Objetivos de la familia</h2>
      ${m.objetivos.length ? `<ul>${m.objetivos.map((o) => `<li>${escapar(o)}</li>`).join('')}</ul>` : '<p class="suave">Sin objetivos escritos.</p>'}
      <h2>Indicadores de la etapa ${escapar(e.corto)}: inicio${av.cierre ? ' y cierre' : ultimo ? ' y último check-in' : ''}</h2>
      ${av.lineaBase ? `<div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Indicador</th><th>Meta</th><th>Línea base</th><th>${av.cierre ? 'Cierre' : 'Último check-in'}</th><th>Cambio</th></tr></thead><tbody>${e.indicadores.map((ind) => { const a = av.lineaBase.valores[ind.clave]; const b = (av.cierre || ultimo || {}).valores?.[ind.clave]; const mejora = b === undefined ? null : ind.meta.tipo === 'min' ? b - a : a - b; return `<tr><td>${escapar(ind.etiqueta)}</td><td>${ind.meta.tipo === 'min' ? '≥' : '≤'} ${ind.meta.valor} ${escapar(ind.unidad)}</td><td>${a}</td><td>${b ?? '—'}</td><td>${mejora === null ? '—' : mejora > 0 ? `✅ mejora (${ind.meta.tipo === 'min' ? '+' : '−'}${Math.abs(mejora)})` : mejora < 0 ? `⚠️ retrocede (${Math.abs(mejora)})` : 'igual'}</td></tr>`; }).join('')}</tbody></table></div>` : '<p class="suave">Sin línea base registrada.</p>'}
      <h2>Puntaje por semana</h2>
      ${ck.length ? barras(ck.map((c) => ({ etiqueta: `Semana ${c.semana}`, valor: puntaje(e, c.valores), texto: `${puntaje(e, c.valores)} / 100` }))) : '<p class="suave">Sin check-ins todavía.</p>'}
      <h2>Mediciones</h2>
      ${med.length ? `<div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Fecha</th><th>Tipo</th><th>Valor</th><th>Origen</th></tr></thead><tbody>${med.map((x) => `<tr><td>${fechaBonita(x.fecha)}</td><td>${escapar(x.tipo)}</td><td>${x.valor} ${escapar(x.unidad)}</td><td>${x.origen === 'profesional' ? 'Verificada por profesional' : 'Reportada por la familia'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="suave">Sin mediciones.</p>'}
      <h2>Recomendaciones validadas</h2>
      ${recos.length ? `<ul>${recos.map((r) => `<li>${escapar(r.texto)} <span class="chico suave">(${fechaBonita(r.fecha)})</span></li>`).join('')}</ul>` : '<p class="suave">Ninguna por ahora.</p>'}
      <h2>Logros</h2>
      <p>${logros.length ? logros.map((l) => `${l.icono} ${escapar(l.nombre)}`).join(' · ') : 'Todavía sin logros.'}</p>
      <p class="chico suave" style="margin-top:24px">Los datos de check-in y línea base son reportados por la familia; las mediciones verificadas las registra una persona profesional. Fórmulas de puntaje de ejemplo, por validar con MYO Genetics. Este documento no sustituye una valoración médica.</p>`;
  }
} else if (q.get('org')) {
  const org = api.obtener('organizaciones', q.get('org'));
  const permitido = org && s.rol === 'admin' && s.perfil.organizacion_id === org.id;
  if (!permitido) caja.innerHTML = estadoVacio('🔒', 'Este reporte no corresponde a tu organización.');
  else {
    const agregado = org.alcance === 'agregado';
    const familias = agregado ? api.listar('perfiles', { rol: 'familia' }).filter((p) => p.organizacion_id) : api.listar('perfiles', { organizacion_id: org.id, rol: 'familia' });
    const menores = familias.flatMap((f) => api.listar('menores', { responsable_id: f.id }));
    const met = metricasDe(menores);
    const orgs = agregado ? api.listar('organizaciones').filter((o) => o.alcance !== 'agregado') : [org];
    caja.innerHTML = `
      ${cabecera(`Indicadores agregados del programa`, `${org.nombre} · ${TIPO[org.tipo]}${agregado ? ' · todas las organizaciones participantes, sin nombres' : ''}`)}
      <div class="cifras"><div class="cifra"><strong>${familias.length}</strong><span>familias</span></div><div class="cifra"><strong>${met.inscritos}</strong><span>menores inscritos</span></div><div class="cifra"><strong>${met.iniciados}</strong><span>iniciaron</span></div><div class="cifra"><strong>${met.participando}</strong><span>participando (14 días)</span></div><div class="cifra"><strong>${met.avancePromedio}%</strong><span>avance promedio</span></div><div class="cifra"><strong>${met.concluidos}</strong><span>concluyeron</span></div></div>
      <h2>Por etapa</h2>
      <div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Etapa</th><th>Inscritos</th><th>Avance promedio</th><th>Concluyeron</th></tr></thead><tbody>${met.porEtapa.map((x) => `<tr><td>${x.etapa.icono} ${escapar(x.etapa.nombre)}</td><td>${x.inscritos}</td><td>${x.avance}%</td><td>${x.concluidos}</td></tr>`).join('')}</tbody></table></div>
      <h2>Menores que completaron cada semana</h2>
      ${barras(met.porSemana.map((n, i) => ({ etiqueta: `Semana ${i + 1}`, valor: n, max: Math.max(1, met.inscritos), texto: `${n} de ${met.inscritos}` })))}
      <h2>Cambio antes / después</h2>
      <p>${met.conCierre ? `${met.conCierre} menor(es) con evaluación inicial y de cierre. Cambio promedio de puntaje: <strong>${met.mejora >= 0 ? '+' : ''}${met.mejora}</strong> puntos (escala 0–100).` : 'Todavía no hay menores con evaluación de cierre.'}</p>
      ${agregado ? `<h2>Por organización</h2><div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Organización</th><th>Tipo</th><th>Inscritos</th><th>Participando</th><th>Avance</th><th>Concluyeron</th></tr></thead><tbody>${orgs.map((o) => { const ms = api.listar('perfiles', { organizacion_id: o.id, rol: 'familia' }).flatMap((f) => api.listar('menores', { responsable_id: f.id })); const mm = metricasDe(ms); return `<tr><td>${escapar(o.nombre)}</td><td>${TIPO[o.tipo]}</td><td>${mm.inscritos}</td><td>${mm.participando}</td><td>${mm.avancePromedio}%</td><td>${mm.concluidos}</td></tr>`; }).join('')}</tbody></table></div>` : ''}
      <p class="chico suave" style="margin-top:24px">Cifras agregadas; no contiene nombres ni datos individuales de familias o menores. Definiciones: participación = check-in en los últimos 14 días; avance = semanas completadas sobre 12; conclusión = 12 semanas completadas. Reglas de ejemplo.</p>`;
  }
} else {
  caja.innerHTML = estadoVacio('📄', 'Falta indicar qué reporte abrir (menor u organización).');
}
