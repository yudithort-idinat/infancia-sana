// Vista de coordinación (escuela, A.C. o gobierno): resumen, avance colectivo, familias, permisos,
// contenidos y programas, catálogo y actividad general. Cada organización ve solo lo suyo;
// gobierno ve cifras agregadas de todas, sin nombres.
import { api, etiquetaEstado, fechaBonita, registrarActividad } from './api.js';
import { requerir } from './auth.js';
import { etapaDe, edadTexto, etapasTodas, avanceMenor, metricasDe, semanasDe } from './programa.js';
import { $, $$, escapar, montarEncabezado, montarPie, aviso, ventana, ultimaVentana, estadoVacio, activarPestanas, iniciales, barras } from './ui.js';

const sesion = requerir('admin');
if (sesion) {
  montarEncabezado('espacio');
  montarPie();
  const perfil = sesion.perfil;
  const org = api.obtener('organizaciones', perfil.organizacion_id) || { nombre: 'Organización', tipo: '', permisos: [], restricciones: [], alcance: 'propia' };
  const agregado = org.alcance === 'agregado';
  const TIPO = { escuela: 'Escuela / centro infantil', ac: 'Asociación civil', gobierno: 'Gobierno' };
  const ROL = { usuario: 'Usuario adulto', familia: 'Familia', profesional: 'Profesional', admin: 'Coordinación' };
  $('#admin-titulo').innerHTML = `<span class="etiqueta">${TIPO[org.tipo] || 'Organización'}</span><h1 style="margin-top:8px">${escapar(org.nombre)}</h1><p class="suave">Coordinación · ${escapar(perfil.nombre)} · ${agregado ? 've cifras agregadas de todas las organizaciones, sin nombres' : 've únicamente su organización'}. <span class="etiqueta ejemplo">Datos de ejemplo</span></p>`;
  activarPestanas(document, 'resumen');

  // Universo de la organización: sus familias y menores (gobierno: todos, pero solo en cifras)
  const familiasDe = (oid) => api.listar('perfiles', { organizacion_id: oid, rol: 'familia' });
  const familias = agregado ? api.listar('perfiles', { rol: 'familia' }).filter((p) => p.organizacion_id) : familiasDe(org.id);
  const menores = familias.flatMap((f) => api.listar('menores', { responsable_id: f.id }));
  const usuariosOrg = () => api.listar('perfiles', { organizacion_id: org.id }).filter((p) => p.rol !== 'admin');

  function pintarResumen() {
    const met = metricasDe(menores);
    const programas = agregado ? api.listar('programas') : api.listar('programas', { organizacion_id: org.id });
    const actividad = (agregado ? api.listar('actividad_general') : api.listar('actividad_general', { organizacion_id: org.id })).sort((a, b) => b.fecha.localeCompare(a.fecha));
    $('#resumen').innerHTML = `
      <div class="cifras">
        <div class="cifra"><strong>${familias.length}</strong><span>familias inscritas</span></div>
        <div class="cifra"><strong>${met.inscritos}</strong><span>menores en el programa</span></div>
        <div class="cifra"><strong>${met.participando}</strong><span>participando (check-in en 14 días)</span></div>
        <div class="cifra"><strong>${met.avancePromedio}%</strong><span>avance promedio</span></div>
        <div class="cifra"><strong>${met.concluidos}</strong><span>concluyeron</span></div>
      </div>
      <div class="rejilla dos" style="margin-top:20px">
        <div class="tarjeta"><h3>Programas${agregado ? ' (todas las organizaciones)' : ''}</h3>${programas.length ? `<ul class="lista">${programas.map((p) => { const e = api.obtener('etapas', p.etapa_id) || {}; return `<li><span class="punto-etapa" style="--color-etapa:${e.color || '#999'};margin-top:8px"></span><div class="cuerpo"><strong>${escapar(agregado ? `${e.nombre || 'Programa'} · ${TIPO[(api.obtener('organizaciones', p.organizacion_id) || {}).tipo] || ''}` : p.nombre)}</strong><br><span class="chico suave">${e.icono || ''} ${escapar(e.corto || '')} · ${p.semanas} semanas · ${p.familias} familia(s)</span></div>${etiquetaEstado(p.estado)}</li>`; }).join('')}</ul>` : estadoVacio('📚', 'Sin programas todavía.')}</div>
        <div class="tarjeta"><h3>Última actividad</h3>${actividad.length ? `<ul class="lista">${actividad.slice(0, 6).map((a) => `<li><span class="punto"></span><div class="cuerpo chico">${escapar(agregado ? anonimizar(a.texto) : a.texto)}<br><span class="suave">${fechaBonita(a.fecha)}</span></div></li>`).join('')}</ul>` : estadoVacio('🕊️', 'Todavía no hay actividad registrada.')}</div>
      </div>`;
  }
  // Gobierno no ve nombres: se sustituyen por «una familia»
  function anonimizar(t) { let s = t; api.listar('perfiles').forEach((p) => { s = s.split(p.nombre).join(p.rol === 'profesional' ? 'una persona profesional' : 'una familia'); }); api.listar('menores').forEach((m) => { s = s.split(m.nombre).join('un menor'); }); return s.charAt(0).toUpperCase() + s.slice(1); }

  function pintarColectivo() {
    const met = metricasDe(menores);
    const porOrg = agregado ? api.listar('organizaciones').filter((o) => o.alcance !== 'agregado').map((o) => { const ms = familiasDe(o.id).flatMap((f) => api.listar('menores', { responsable_id: f.id })); return { o, met: metricasDe(ms) }; }) : [];
    $('#colectivo').innerHTML = `
      <div class="fila entre"><div><h2>Avance colectivo</h2><p class="suave" style="margin:0">Métricas de coordinación: inscripción, participación, avance y conclusión. <span class="etiqueta ejemplo">Cifras de ejemplo</span></p></div><a class="boton secundario chico" href="reporte.html?org=${org.id}">Exportar reporte agregado</a></div>
      <div class="cifras" style="margin:16px 0">
        <div class="cifra"><strong>${met.inscritos}</strong><span>inscritos</span></div>
        <div class="cifra"><strong>${met.iniciados}</strong><span>iniciaron (línea base o semana 1)</span></div>
        <div class="cifra"><strong>${met.participando}</strong><span>participando esta quincena</span></div>
        <div class="cifra"><strong>${met.avancePromedio}%</strong><span>avance promedio</span></div>
        <div class="cifra"><strong>${met.concluidos}</strong><span>concluyeron las 12 semanas</span></div>
        <div class="cifra"><strong>${met.mejora === null ? '—' : (met.mejora >= 0 ? '+' : '') + met.mejora}</strong><span>cambio promedio antes/después (${met.conCierre} con cierre)</span></div>
      </div>
      <div class="rejilla dos">
        <div class="tarjeta"><h3>Menores que completaron cada semana</h3><div class="columnas">${met.porSemana.map((n, i) => `<div class="col"><b>${n}</b><span style="height:${met.inscritos ? Math.round((n / met.inscritos) * 100) : 0}%"></span>${i + 1}</div>`).join('')}</div><p class="chico suave" style="margin:8px 0 0">Semana 1 a 12 · de ${met.inscritos} menores inscritos.</p></div>
        <div class="tarjeta"><h3>Por etapa</h3>${barras(met.porEtapa.map((x) => ({ etiqueta: `${x.etapa.icono} ${x.etapa.corto}`, valor: x.avance, texto: `${x.inscritos} insc. · ${x.avance}% · ${x.concluidos} concl.` })))}</div>
      </div>
      ${agregado ? `<div class="tarjeta" style="margin-top:16px"><h3>Por organización participante (sin nombres de familias)</h3><div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Organización</th><th>Tipo</th><th>Inscritos</th><th>Participando</th><th>Avance</th><th>Concluyeron</th></tr></thead><tbody>${porOrg.map(({ o, met: m }) => `<tr><td>${escapar(o.nombre)}</td><td>${TIPO[o.tipo]}</td><td>${m.inscritos}</td><td>${m.participando}</td><td>${m.avancePromedio}%</td><td>${m.concluidos}</td></tr>`).join('')}</tbody></table></div></div>` : ''}
      <div class="tarjeta" style="margin-top:16px"><h3>Cómo se calculan</h3><ul class="lista compacta chico"><li><span class="punto"></span><div class="cuerpo"><strong>Inscripción:</strong> menores registrados por familias de la organización.</div></li><li><span class="punto"></span><div class="cuerpo"><strong>Participación:</strong> menores con un check-in en los últimos 14 días (y programa no concluido).</div></li><li><span class="punto"></span><div class="cuerpo"><strong>Avance:</strong> promedio de semanas completadas sobre 12.</div></li><li><span class="punto"></span><div class="cuerpo"><strong>Conclusión:</strong> menores con las 12 semanas completadas.</div></li><li><span class="punto"></span><div class="cuerpo"><strong>Cambio antes/después:</strong> diferencia promedio de puntaje entre la evaluación inicial y la de cierre. Reglas de ejemplo, por validar con MYO Genetics.</div></li></ul></div>`;
  }

  function pintarFamilias() {
    if (agregado) {
      $('#familias').innerHTML = `<h2>Familias</h2>${estadoVacio('🔒', 'Este perfil de gobierno solo ve cifras agregadas: no tiene acceso a nombres ni datos de familias o menores. Consulta «Avance colectivo».')}`;
      return;
    }
    const us = usuariosOrg();
    $('#familias').innerHTML = `
      <div class="fila entre"><h2>Familias y menores</h2><button class="boton chico primario" id="btn-usuario" type="button">+ Invitar familia o profesional</button></div>
      ${familias.length ? `<div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Familia</th><th>Menores (etapa)</th><th>Avance</th><th>Profesional asignado</th></tr></thead><tbody>${familias.map((f) => { const ms = api.listar('menores', { responsable_id: f.id }); const casos = api.listar('casos', { perfil_id: f.id }); const profs = [...new Set(casos.map((c) => (api.obtener('perfiles', c.profesional_id) || {}).nombre).filter(Boolean))]; return `<tr><td><span class="fila"><span class="avatar" style="width:28px;height:28px;font-size:.7rem">${iniciales(f.nombre)}</span>${escapar(f.nombre)}</span><br><span class="chico suave">${escapar(f.correo)}</span></td><td>${ms.map((m) => { const e = etapaDe(m); return `<span class="punto-etapa" style="--color-etapa:${e.color}"></span>${escapar(m.nombre)} <span class="chico suave">(${escapar(edadTexto(m))}, ${escapar(e.corto)})</span>`; }).join('<br>') || '<span class="chico suave">sin menores</span>'}</td><td>${ms.map((m) => { const av = avanceMenor(m.id); return `<div class="progreso" style="width:120px;margin:4px 0"><span style="width:${av.porcentaje}%"></span></div><span class="chico suave">${av.completadas}/${av.total}${av.terminado ? ' ✅' : ''}</span>`; }).join('')}</td><td class="chico">${profs.join('<br>') || '<span class="suave">sin asignar</span>'}</td></tr>`; }).join('')}</tbody></table></div>` : estadoVacio('👥', 'Esta organización no tiene familias todavía. Invita a la primera.')}
      <h3 style="margin-top:24px">Profesionales y otros usuarios</h3>
      ${us.filter((p) => p.rol !== 'familia').length ? `<div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Nombre</th><th>Tipo</th><th>Correo</th><th>Detalle</th></tr></thead><tbody>${us.filter((p) => p.rol !== 'familia').map((p) => `<tr><td>${escapar(p.nombre)}</td><td>${ROL[p.rol]}</td><td>${escapar(p.correo)}</td><td class="chico">${p.rol === 'profesional' ? `${api.listar('casos', { profesional_id: p.id }).length} caso(s)` : `${api.listar('solicitudes', { perfil_id: p.id }).length} servicio(s)`}</td></tr>`).join('')}</tbody></table></div>` : '<p class="chico suave">Sin profesionales registrados.</p>'}
      <p class="chico suave" style="margin-top:12px">La coordinación ve inscripción y avance; <strong>no</strong> ve notas clínicas ni mediciones individuales (solo el profesional asignado).</p>`;
    $('#btn-usuario').addEventListener('click', async () => {
      const v = await ventana({ titulo: 'Invitar', html: `
        <div class="campo"><label for="iu-nombre">Nombre</label><input id="iu-nombre" name="nombre"></div>
        <div class="campo"><label for="iu-correo">Correo</label><input id="iu-correo" name="correo" type="email"></div>
        <div class="campo"><label for="iu-rol">Tipo</label><select id="iu-rol" name="rol"><option value="familia">Familia (madre, padre o cuidador)</option><option value="profesional">Profesional</option></select></div>
        <p class="chico suave">En la versión real se enviará un correo de invitación y la familia aceptará el aviso de privacidad al entrar. En la demo se agrega directamente.</p>`, botones: [{ texto: 'Cancelar', clase: 'secundario', valor: null }, { texto: 'Invitar', clase: 'primario', valor: 'ok' }] });
      if (v !== 'ok') return;
      const d = ultimaVentana.campos;
      if (!d.nombre || !d.correo) { aviso('Faltan el nombre o el correo', 'error'); return; }
      api.insertar('perfiles', { rol: d.rol, nombre: d.nombre, correo: d.correo, organizacion_id: org.id, objetivos: [] });
      registrarActividad(org.id, `Se invitó a ${d.nombre} (${ROL[d.rol]}).`);
      aviso('Invitación registrada', 'ok'); location.reload();
    });
  }

  function pintarPermisos() {
    const todas = api.listar('organizaciones');
    $('#permisos').innerHTML = `
      <h2>Qué puede hacer cada tipo de organización</h2>
      <p class="suave">Permisos propuestos para la demostración. La persona que coordina ve esto para saber qué alcance tiene su acceso. <span class="etiqueta ejemplo">Por validar con MYO Genetics</span></p>
      <div class="permisos">${todas.map((o) => `<div class="tarjeta ${o.id === org.id ? 'elegida' : ''}"><div class="fila entre"><strong>${TIPO[o.tipo]}</strong>${o.id === org.id ? '<span class="etiqueta ok">Tu acceso</span>' : ''}</div><p class="chico suave" style="margin:4px 0 0">${escapar(o.nombre)} · alcance: ${o.alcance === 'agregado' ? 'solo cifras agregadas' : 'su organización, con nombres'}</p><h4>Puede</h4><ul class="chico">${o.permisos.map((p) => `<li>✅ ${escapar(p)}</li>`).join('')}</ul><h4>No puede</h4><ul class="chico">${o.restricciones.map((p) => `<li>🚫 ${escapar(p)}</li>`).join('')}</ul></div>`).join('')}</div>
      <div class="tarjeta" style="margin-top:16px"><h3>Y los demás roles</h3><ul class="lista compacta chico"><li><span class="punto"></span><div class="cuerpo"><strong>Familia:</strong> solo sus menores; registra línea base, check-ins y mediciones reportadas; ve recomendaciones validadas. No ve notas clínicas.</div></li><li><span class="punto"></span><div class="cuerpo"><strong>Profesional:</strong> solo las familias asignadas; ve check-ins y alertas, valida recomendaciones, registra mediciones verificadas y notas privadas.</div></li><li><span class="punto"></span><div class="cuerpo"><strong>MYO Genetics (administración global, pendiente):</strong> define el contenido del programa, las etapas, los indicadores y las reglas de alertas.</div></li></ul><p class="chico suave" style="margin:8px 0 0">En la base real estos permisos se refuerzan con políticas de seguridad a nivel de fila (RLS) en Supabase.</p></div>`;
  }

  function pintarContenidos() {
    const contenidos = agregado ? [] : api.listar('contenidos', { organizacion_id: org.id });
    const programas = agregado ? [] : api.listar('programas', { organizacion_id: org.id });
    const etapas = etapasTodas();
    const etapaSel = sessionStorage.getItem('infancia_admin_etapa') || '1-3a';
    const semanas = semanasDe(etapaSel);
    const e = etapas.find((x) => x.id === etapaSel);
    $('#contenidos').innerHTML = `
      ${agregado ? '<p class="chico suave">Este acceso no publica contenidos ni crea grupos; solo consulta el plan del programa.</p>' : `
      <div class="rejilla dos">
        <div>
          <div class="fila entre"><h2>Contenidos</h2><button class="boton chico primario" id="btn-contenido" type="button">+ Nuevo</button></div>
          ${contenidos.length ? `<ul class="lista">${contenidos.map((c) => `<li><span class="punto"></span><div class="cuerpo"><strong>${escapar(c.titulo)}</strong><br><span class="chico suave">${escapar(c.tipo)}</span></div>${etiquetaEstado(c.estado)}<button class="boton chico fantasma" data-publicar="${c.id}" type="button">${c.estado === 'publicado' ? 'Pasar a borrador' : 'Publicar'}</button></li>`).join('')}</ul>` : estadoVacio('📂', 'Sin contenidos. Crea el primero.')}
        </div>
        <div>
          <div class="fila entre"><h2>Grupos y programas</h2><button class="boton chico primario" id="btn-programa" type="button">+ Nuevo grupo</button></div>
          ${programas.length ? `<ul class="lista">${programas.map((p) => { const et = api.obtener('etapas', p.etapa_id) || {}; return `<li><span class="punto-etapa" style="--color-etapa:${et.color || '#999'};margin-top:8px"></span><div class="cuerpo"><strong>${escapar(p.nombre)}</strong><br><span class="chico suave">${et.icono || ''} ${escapar(et.corto || '')} · ${p.semanas} semanas · ${p.familias} familia(s)</span></div>${etiquetaEstado(p.estado)}</li>`; }).join('')}</ul>` : estadoVacio('📚', 'Sin grupos todavía.')}
        </div>
      </div>`}
      <div class="tarjeta" style="margin-top:20px">
        <div class="fila entre"><h3>Plan del programa por etapa</h3><span class="etiqueta ejemplo">Contenido de ejemplo · lo define MYO Genetics</span></div>
        <div class="segmentos" id="seg-etapa" style="margin:10px 0 14px">${etapas.map((x) => `<label class="${x.id === etapaSel ? 'elegida' : ''}"><input type="radio" name="etapa" value="${x.id}" ${x.id === etapaSel ? 'checked' : ''}> ${x.icono} ${escapar(x.corto)}</label>`).join('')}</div>
        <p class="chico suave">Indicadores del check-in en ${escapar(e.nombre)}: ${e.indicadores.map((i) => `${escapar(i.etiqueta.split(' (')[0].toLowerCase())} (${i.meta.tipo === 'min' ? '≥' : '≤'} ${i.meta.valor} ${escapar(i.unidad)})`).join(' · ')}.</p>
        <div class="tabla-envoltura"><table class="tabla"><thead><tr><th>#</th><th>Tema y objetivo</th><th>Microcontenido</th><th>Actividad en casa</th><th>Materiales</th><th>Pregunta del check-in</th></tr></thead><tbody>${semanas.map((s) => `<tr><td>${s.numero}</td><td><strong>${escapar(s.titulo)}</strong><br><span class="chico suave">${escapar(s.objetivo)}</span></td><td class="chico">${escapar(s.contenido)}</td><td class="chico">${escapar(s.actividad)}</td><td class="chico">${escapar(s.materiales)}</td><td class="chico">${escapar(s.checkin)}</td></tr>`).join('')}</tbody></table></div>
      </div>`;
    $('#seg-etapa').addEventListener('change', (ev) => { sessionStorage.setItem('infancia_admin_etapa', ev.target.value); pintarContenidos(); });
    $$('[data-publicar]').forEach((b) => b.addEventListener('click', () => { const c = api.obtener('contenidos', b.dataset.publicar); api.actualizar('contenidos', c.id, { estado: c.estado === 'publicado' ? 'borrador' : 'publicado' }); registrarActividad(org.id, `${c.estado === 'publicado' ? 'Se retiró' : 'Se publicó'} «${c.titulo}».`); pintarContenidos(); pintarActividad(); }));
    $('#btn-contenido')?.addEventListener('click', async () => {
      const v = await ventana({ titulo: 'Nuevo contenido', html: `<div class="campo"><label for="nc-titulo">Título</label><input id="nc-titulo" name="titulo"></div><div class="campo"><label for="nc-tipo">Tipo</label><select id="nc-tipo" name="tipo"><option>Guía PDF</option><option>Video</option><option>Material imprimible</option><option>Taller</option></select></div>`, botones: [{ texto: 'Cancelar', clase: 'secundario', valor: null }, { texto: 'Crear', clase: 'primario', valor: 'ok' }] });
      if (v !== 'ok') return; const d = ultimaVentana.campos;
      if (!d.titulo) { aviso('Escribe el título', 'error'); return; }
      api.insertar('contenidos', { organizacion_id: org.id, titulo: d.titulo, tipo: d.tipo, estado: 'borrador', ejemplo: true });
      aviso('Contenido creado como borrador', 'ok'); pintarContenidos();
    });
    $('#btn-programa')?.addEventListener('click', async () => {
      const v = await ventana({ titulo: 'Nuevo grupo del programa', html: `<div class="campo"><label for="np-nombre">Nombre del grupo</label><input id="np-nombre" name="nombre" placeholder="Infancia Sana — Grupo Lactantes B"></div><div class="campo"><label for="np-etapa">Etapa</label><select id="np-etapa" name="etapa_id">${etapas.map((x) => `<option value="${x.id}">${x.icono} ${escapar(x.nombre)}</option>`).join('')}</select></div>`, botones: [{ texto: 'Cancelar', clase: 'secundario', valor: null }, { texto: 'Crear', clase: 'primario', valor: 'ok' }] });
      if (v !== 'ok') return; const d = ultimaVentana.campos;
      if (!d.nombre) { aviso('Escribe el nombre', 'error'); return; }
      api.insertar('programas', { organizacion_id: org.id, nombre: d.nombre, etapa_id: d.etapa_id, semanas: 12, familias: 0, estado: 'por iniciar', ejemplo: true });
      registrarActividad(org.id, `Se creó el grupo «${d.nombre}».`);
      aviso('Grupo creado', 'ok'); pintarContenidos(); pintarResumen(); pintarActividad();
    });
  }

  function pintarCatalogo() {
    const servicios = api.listar('servicios');
    $('#catalogo').innerHTML = `
      <h2>Catálogo de servicios</h2>
      <p class="suave chico">Catálogo de muestra. ${agregado ? 'Solo consulta.' : 'Activa o desactiva lo que esta organización ofrece a sus familias.'}</p>
      <div class="rejilla">${servicios.map((s) => `
        <div class="tarjeta"><div class="fila entre"><strong>${escapar(s.nombre)}</strong>${s.disponible ? '<span class="etiqueta ok">Disponible</span>' : '<span class="etiqueta gris">Inactivo</span>'}</div>
        <p class="chico suave" style="margin:8px 0">${escapar(s.descripcion)}</p><p class="chico"><strong>Para quién:</strong> ${escapar(s.para_quien)}</p>
        ${agregado ? '' : `<button class="boton chico secundario" data-toggle="${s.id}" type="button">${s.disponible ? 'Desactivar' : 'Activar'}</button>`}</div>`).join('')}</div>`;
    $$('[data-toggle]').forEach((b) => b.addEventListener('click', () => { const s = api.obtener('servicios', b.dataset.toggle); api.actualizar('servicios', s.id, { disponible: !s.disponible }); aviso(s.disponible ? 'Servicio desactivado' : 'Servicio activado', 'ok'); pintarCatalogo(); }));
  }

  function pintarActividad() {
    const actividad = (agregado ? api.listar('actividad_general') : api.listar('actividad_general', { organizacion_id: org.id })).sort((a, b) => b.fecha.localeCompare(a.fecha));
    const recorridos = api.listar('recorridos');
    const mensajes = api.listar('mensajes_contacto');
    $('#actividad').innerHTML = `
      <h2>Actividad general</h2>
      <div class="rejilla dos">
        <div class="tarjeta"><h3>Movimientos${agregado ? ' (anonimizados)' : ' de la organización'}</h3>${actividad.length ? `<ul class="lista">${actividad.map((a) => `<li><span class="punto"></span><div class="cuerpo chico">${escapar(agregado ? anonimizar(a.texto) : a.texto)}<br><span class="suave">${fechaBonita(a.fecha)}</span></div></li>`).join('')}</ul>` : estadoVacio('🕊️', 'Todavía no hay actividad registrada.')}</div>
        <div>
          <div class="tarjeta" style="margin-bottom:16px"><h3>Recorridos «Descubre tu ruta»</h3><p class="chico suave">Recorridos completados por visitantes (anónimos) en esta demostración.</p>${recorridos.length ? `<ul class="lista">${recorridos.slice(-5).reverse().map((r) => { const e = api.obtener('etapas', r.etapa_id) || {}; return `<li><span class="punto"></span><div class="cuerpo chico">Etapa: <strong>${escapar(e.nombre || r.etapa_id)}</strong><br><span class="suave">${fechaBonita(r.fecha)}</span></div></li>`; }).join('')}</ul>` : estadoVacio('🧭', 'Aún nadie ha hecho el recorrido.')}</div>
          <div class="tarjeta"><h3>Mensajes de contacto</h3>${mensajes.length ? `<ul class="lista">${mensajes.slice(-5).reverse().map((m) => `<li><span class="punto pendiente"></span><div class="cuerpo chico"><strong>${escapar(agregado ? 'Una persona' : m.nombre)}</strong>${agregado ? '' : ` · ${escapar(m.correo)}`}<br>${escapar(m.mensaje)}<br><span class="suave">${fechaBonita(m.fecha)}</span></div></li>`).join('')}</ul>` : estadoVacio('✉️', 'No hay mensajes nuevos.')}</div>
        </div>
      </div>`;
  }

  pintarResumen(); pintarColectivo(); pintarFamilias(); pintarPermisos(); pintarContenidos(); pintarCatalogo(); pintarActividad();
}
