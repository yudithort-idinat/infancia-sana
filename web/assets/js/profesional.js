// Vista profesional: familias asignadas, ficha de seguimiento, alertas, recomendaciones por validar,
// mediciones verificadas, notas, estado y próxima actividad.
import { api, etiquetaEstado, fechaBonita, hoyISO, registrarActividad } from './api.js';
import { requerir } from './auth.js';
import { etapaDe, edadTexto, avanceMenor, puntaje, checkinsDe, alertasMenor, cortaInd } from './programa.js';
import { $, $$, escapar, montarEncabezado, montarPie, aviso, ventana, ultimaVentana, validar, datosFormulario, estadoVacio } from './ui.js';

const sesion = requerir('profesional');
if (sesion) {
  montarEncabezado('espacio');
  montarPie();
  const perfil = sesion.perfil;
  $('#prof-nombre').textContent = perfil.nombre;
  $('#prof-especialidad').textContent = perfil.especialidad || 'Profesional';
  let casoActual = null;

  function casosMios() { return api.listar('casos', { profesional_id: perfil.id }).sort((a, b) => (a.proxima_fecha || '').localeCompare(b.proxima_fecha || '')); }

  function pintarLista() {
    const casos = casosMios();
    const pendientesTotal = casos.filter((c) => c.menor_id).reduce((n, c) => n + api.listar('recomendaciones', { menor_id: c.menor_id, estado: 'pendiente' }).length, 0);
    const alertasTotal = casos.filter((c) => c.menor_id).reduce((n, c) => n + alertasMenor(c.menor_id).length, 0);
    $('#prof-resumen').innerHTML = `<div class="cifras" style="grid-template-columns:1fr 1fr;margin:10px 0"><div class="cifra" style="padding:10px"><strong style="font-size:1.3rem">${alertasTotal}</strong><span>alertas</span></div><div class="cifra" style="padding:10px"><strong style="font-size:1.3rem">${pendientesTotal}</strong><span>por validar</span></div></div>`;
    $('#lista-casos').innerHTML = casos.length ? casos.map((c) => { const al = c.menor_id ? alertasMenor(c.menor_id).length : 0; return `<a href="#" data-caso="${c.id}" class="${casoActual === c.id ? 'activo' : ''}"><span class="chico">${escapar(c.titulo)}</span><br>${etiquetaEstado(c.estado)} ${al ? `<span class="etiqueta error">${al} alerta${al > 1 ? 's' : ''}</span>` : ''}</a>`; }).join('') : '<p class="chico suave">Sin familias asignadas.</p>';
    $$('[data-caso]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); pintarFicha(a.dataset.caso); }));
  }

  function pintarFicha(id) {
    const c = api.obtener('casos', id);
    if (!c || c.profesional_id !== perfil.id) { $('#ficha-caso').innerHTML = estadoVacio('🔒', 'Ese caso no está asignado a ti.'); return; }
    casoActual = id; pintarLista();
    history.replaceState(null, '', `profesional.html#caso=${id}`);
    const persona = api.obtener('perfiles', c.perfil_id) || {};
    const menor = c.menor_id ? api.obtener('menores', c.menor_id) : null;
    const notas = api.listar('notas_caso', { caso_id: id }).sort((a, b) => b.fecha.localeCompare(a.fecha));
    const av = menor ? avanceMenor(menor.id) : null;
    const e = menor ? av.etapa : null;
    const registros = menor ? checkinsDe(menor.id).slice(-4).reverse() : [];
    const alertas = menor ? alertasMenor(menor.id) : [];
    const recos = menor ? api.listar('recomendaciones', { menor_id: menor.id }).sort((a, b) => b.fecha.localeCompare(a.fecha)) : [];
    const mediciones = menor ? api.listar('mediciones', { menor_id: menor.id }).sort((a, b) => b.fecha.localeCompare(a.fecha)) : [];
    const otrosMenores = menor ? api.listar('menores', { responsable_id: persona.id }).filter((x) => x.id !== menor.id) : [];
    const actividades = !menor ? api.listar('actividades', { perfil_id: c.perfil_id }).filter((a) => a.estado === 'pendiente') : [];
    const nombreProf = (pid) => (api.obtener('perfiles', pid) || {}).nombre || '—';

    $('#ficha-caso').innerHTML = `
      <div class="fila entre"><div><span class="etiqueta">Ficha de seguimiento</span><h1 style="margin-top:8px;font-size:1.5rem">${escapar(c.titulo)}</h1></div>${etiquetaEstado(c.estado)}</div>
      ${alertas.length ? `<div style="margin-top:12px">${alertas.map((a) => `<div class="alerta ${a.nivel}">⚠️ <span>${escapar(a.texto)}</span></div>`).join('')}</div>` : (menor ? '<div class="alerta ok" style="margin-top:12px">✅ <span>Sin alertas: la familia va al corriente.</span></div>' : '')}
      <div class="rejilla dos" style="margin-top:14px">
        <div class="tarjeta">
          <h3>Familia</h3>
          <p><strong>${escapar(persona.nombre || '')}</strong><br><span class="chico suave">${escapar(persona.correo || '')} · ${escapar(persona.telefono || '')}</span></p>
          ${menor ? `<p><strong>${escapar(menor.nombre)}</strong> · ${escapar(edadTexto(menor))} · ${e.icono} ${escapar(e.nombre)}<br><span class="chico suave">Programa: ${av.completadas} de ${av.total} semanas · ${av.lineaBase ? `línea base ${puntaje(e, av.lineaBase.valores)}/100` : 'sin línea base'}${av.cierre ? ` · cierre ${puntaje(e, av.cierre.valores)}/100` : ''}</span></p><div class="progreso acento"><span style="width:${av.porcentaje}%"></span></div>
          ${otrosMenores.length ? `<p class="chico suave" style="margin-top:8px">Otros menores de la familia: ${otrosMenores.map((x) => escapar(x.nombre)).join(', ')}.</p>` : ''}
          <p class="chico"><strong>Objetivos de la familia:</strong> ${menor.objetivos.length ? escapar(menor.objetivos.join(' · ')) : 'sin escribir'}</p>` : ''}
        </div>
        <form class="tarjeta" id="form-caso" novalidate>
          <h3>Estado y próxima actividad</h3>
          <div class="campo"><label for="c-estado">Estado del caso</label>
            <select id="c-estado" name="estado">${['nuevo', 'activo', 'pausado', 'cerrado'].map((x) => `<option value="${x}" ${c.estado === x ? 'selected' : ''}>${x[0].toUpperCase() + x.slice(1)}</option>`).join('')}</select></div>
          <div class="campo"><label for="c-prox">Próxima actividad</label><input id="c-prox" name="proxima_actividad" required value="${escapar(c.proxima_actividad || '')}"></div>
          <div class="campo"><label for="c-fecha">Fecha</label><input id="c-fecha" name="proxima_fecha" type="date" required value="${escapar(c.proxima_fecha || '')}"></div>
          <div class="acciones"><button class="boton primario" type="submit">Guardar</button></div>
          ${actividades.length ? `<h4>Pendientes de la persona</h4><ul class="lista compacta">${actividades.map((a) => `<li><span class="punto pendiente"></span><div class="cuerpo chico">${escapar(a.titulo)}<br><span class="suave">${fechaBonita(a.fecha)}</span></div></li>`).join('')}</ul>` : ''}
        </form>
      </div>

      ${menor ? `
      <div class="tarjeta" style="margin-top:16px">
        <div class="fila entre"><h3>Recomendaciones</h3><button class="boton chico primario" id="btn-reco" type="button">+ Nueva recomendación</button></div>
        <p class="chico suave">El sistema sugiere recomendaciones a partir de los check-ins; <strong>la familia solo ve las que tú validas</strong>.</p>
        ${recos.length ? `<ul class="lista">${recos.map((r) => `<li><span class="punto ${r.estado === 'pendiente' ? 'pendiente' : r.estado === 'validada' ? '' : 'gris'}"></span><div class="cuerpo"><strong>${escapar(r.texto)}</strong><br><span class="chico suave">${escapar(r.motivo)} · origen: ${r.origen === 'sistema' ? 'sistema' : 'profesional'} · ${fechaBonita(r.fecha)}${r.validada_por ? ` · validada por ${escapar(nombreProf(r.validada_por))}` : ''}</span></div>${etiquetaEstado(r.estado)}${r.estado === 'pendiente' ? `<span class="acciones"><button class="boton chico primario" data-validar="${r.id}" type="button">Validar</button><button class="boton chico fantasma" data-descartar="${r.id}" type="button">Descartar</button></span>` : ''}</li>`).join('')}</ul>` : estadoVacio('💬', 'Sin recomendaciones para este menor.')}
      </div>

      <div class="rejilla dos" style="margin-top:16px">
        <div class="tarjeta">
          <div class="fila entre"><h3>Mediciones</h3><button class="boton chico secundario" id="btn-medicion" type="button">+ Registrar verificada</button></div>
          ${mediciones.length ? `<div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Fecha</th><th>Tipo</th><th>Valor</th><th>Origen</th></tr></thead><tbody>${mediciones.map((x) => `<tr><td>${fechaBonita(x.fecha)}</td><td>${escapar(x.tipo)}</td><td>${x.valor} ${escapar(x.unidad)}</td><td>${x.origen === 'profesional' ? `<span class="etiqueta verificado">Verificada</span>` : '<span class="etiqueta reportado">Reportada</span>'}</td></tr>`).join('')}</tbody></table></div>` : estadoVacio('📏', 'Sin mediciones.')}
        </div>
        <div class="tarjeta">
          <h3>Últimos check-ins de ${escapar(menor.nombre)}</h3>
          <p class="chico suave">Reportados por la familia · etapa ${escapar(e.corto)}.</p>
          ${registros.length ? `<div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Sem.</th>${e.indicadores.map((i) => `<th title="${escapar(i.etiqueta)}">${escapar(cortaInd(i))} (${escapar(i.unidad)})</th>`).join('')}<th>Puntaje</th></tr></thead><tbody>${registros.map((r) => `<tr><td>${r.semana}</td>${e.indicadores.map((i) => `<td>${r.valores[i.clave] ?? '—'}</td>`).join('')}<td><strong>${puntaje(e, r.valores)}</strong></td></tr>`).join('')}</tbody></table></div>` : estadoVacio('📈', 'La familia aún no guarda check-ins.')}
        </div>
      </div>` : ''}

      <div class="tarjeta" style="margin-top:16px">
        <div class="fila entre"><h3>Notas de seguimiento</h3><button class="boton chico primario" id="btn-nota" type="button">+ Nueva nota</button></div>
        <p class="chico suave">Las notas solo las ve la persona profesional asignada; no se muestran a la familia ni a la organización.</p>
        ${notas.length ? `<ul class="lista">${notas.map((n) => `<li><span class="punto"></span><div class="cuerpo"><span class="chico suave">${fechaBonita(n.fecha)}</span><br>${escapar(n.texto)}</div></li>`).join('')}</ul>` : estadoVacio('📝', 'Todavía no hay notas en este caso. Escribe la primera.')}
      </div>`;

    $('#form-caso').addEventListener('submit', (ev) => {
      ev.preventDefault();
      if (!validar(ev.target)) { aviso('Completa la próxima actividad y su fecha', 'error'); return; }
      api.actualizar('casos', id, datosFormulario(ev.target));
      aviso('Caso actualizado', 'ok'); pintarFicha(id);
    });
    $('#btn-nota').addEventListener('click', async () => {
      const v = await ventana({ titulo: 'Nueva nota', html: `<div class="campo"><label for="nota-texto">Nota</label><textarea id="nota-texto" rows="4" placeholder="Qué se observó, qué se acordó, qué sigue"></textarea></div>`, botones: [{ texto: 'Cancelar', clase: 'secundario', valor: null }, { texto: 'Guardar nota', clase: 'primario', valor: 'ok' }] });
      const texto = (ultimaVentana.campos['nota-texto'] || '').trim();
      if (v === 'ok') {
        if (!texto) { aviso('La nota está vacía', 'error'); return; }
        api.insertar('notas_caso', { caso_id: id, fecha: hoyISO(), texto });
        registrarActividad(perfil.organizacion_id, `${perfil.nombre} agregó una nota al caso «${c.titulo}».`);
        aviso('Nota guardada', 'ok'); pintarFicha(id);
      }
    });
    $$('[data-validar]').forEach((b) => b.addEventListener('click', () => {
      const r = api.actualizar('recomendaciones', b.dataset.validar, { estado: 'validada', validada_por: perfil.id });
      registrarActividad(perfil.organizacion_id, `${perfil.nombre} validó una recomendación para ${menor.nombre}.`);
      aviso('Recomendación validada: la familia ya la ve', 'ok'); pintarFicha(id);
    }));
    $$('[data-descartar]').forEach((b) => b.addEventListener('click', () => { api.actualizar('recomendaciones', b.dataset.descartar, { estado: 'descartada', validada_por: perfil.id }); aviso('Recomendación descartada'); pintarFicha(id); }));
    $('#btn-reco')?.addEventListener('click', async () => {
      const v = await ventana({ titulo: `Recomendación para ${menor.nombre}`, html: `<div class="campo"><label for="re-texto">Recomendación</label><input id="re-texto" placeholder="Qué sugieres a la familia"></div><div class="campo"><label for="re-motivo">Motivo (lo verá la familia)</label><input id="re-motivo" placeholder="Por qué"></div><p class="chico suave">Al guardarla queda validada por ti y visible para la familia.</p>`, botones: [{ texto: 'Cancelar', clase: 'secundario', valor: null }, { texto: 'Guardar y validar', clase: 'primario', valor: 'ok' }] });
      if (v !== 'ok') return; const d = ultimaVentana.campos;
      if (!d['re-texto']) { aviso('Escribe la recomendación', 'error'); return; }
      api.insertar('recomendaciones', { menor_id: menor.id, texto: d['re-texto'], motivo: d['re-motivo'] || 'Indicación profesional', origen: 'profesional', estado: 'validada', fecha: hoyISO(), validada_por: perfil.id });
      aviso('Recomendación guardada', 'ok'); pintarFicha(id);
    });
    $('#btn-medicion')?.addEventListener('click', async () => {
      const v = await ventana({ titulo: 'Medición verificada', html: `<p class="chico suave">Quedará marcada como <strong>verificada por ${escapar(perfil.nombre)}</strong>.</p><div class="dos-columnas"><div class="campo"><label for="me-tipo">Medición</label><select id="me-tipo" name="tipo"><option>Peso</option><option>Talla</option><option>Perímetro cefálico</option></select></div><div class="campo"><label for="me-valor">Valor</label><input id="me-valor" name="valor" type="number" step="0.1" min="0"></div></div><div class="campo"><label for="me-fecha">Fecha</label><input id="me-fecha" name="fecha" type="date" value="${hoyISO()}"></div>`, botones: [{ texto: 'Cancelar', clase: 'secundario', valor: null }, { texto: 'Registrar', clase: 'primario', valor: 'ok' }] });
      if (v !== 'ok') return; const d = ultimaVentana.campos;
      if (!d.valor) { aviso('Escribe el valor', 'error'); return; }
      api.insertar('mediciones', { menor_id: menor.id, tipo: d.tipo, valor: Number(d.valor), unidad: d.tipo === 'Peso' ? 'kg' : 'cm', fecha: d.fecha || hoyISO(), origen: 'profesional', verificado_por: perfil.id });
      aviso('Medición verificada registrada', 'ok'); pintarFicha(id);
    });
  }

  pintarLista();
  const h = location.hash.match(/caso=([^&]+)/);
  const casos = casosMios();
  if (h && casos.some((c) => c.id === h[1])) pintarFicha(h[1]);
  else if (casos.length) pintarFicha(casos[0].id);
  else $('#ficha-caso').innerHTML = estadoVacio('🗂️', 'No tienes familias asignadas todavía.');
}
