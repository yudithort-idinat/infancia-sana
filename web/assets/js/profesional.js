// Vista profesional: casos asignados, ficha de seguimiento, notas, estado y próxima actividad.
import { api, etiquetaEstado, fechaBonita, hoyISO, registrarActividad, avanceMenor } from './api.js';
import { requerir } from './auth.js';
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
    $('#lista-casos').innerHTML = casos.length ? casos.map((c) => `<a href="#" data-caso="${c.id}" class="${casoActual === c.id ? 'activo' : ''}"><span class="chico">${escapar(c.titulo)}</span><br>${etiquetaEstado(c.estado)}</a>`).join('') : '<p class="chico suave">Sin casos asignados.</p>';
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
    const solicitudes = api.listar('solicitudes', { perfil_id: c.perfil_id });
    const servicios = api.listar('servicios');
    const actividades = api.listar('actividades', { perfil_id: c.perfil_id }).filter((a) => a.estado === 'pendiente');
    const av = menor ? avanceMenor(menor.id) : null;
    const registros = menor ? api.listar('registros_habitos', { menor_id: menor.id }).sort((a, b) => b.semana - a.semana) : [];
    $('#ficha-caso').innerHTML = `
      <div class="fila entre"><div><span class="etiqueta">Ficha de seguimiento</span><h1 style="margin-top:8px;font-size:1.5rem">${escapar(c.titulo)}</h1></div>${etiquetaEstado(c.estado)}</div>
      <div class="rejilla dos" style="margin-top:14px">
        <div class="tarjeta">
          <h3>Persona</h3>
          <p><strong>${escapar(persona.nombre || '')}</strong><br><span class="chico suave">${escapar(persona.correo || '')} · ${escapar(persona.telefono || '')}</span></p>
          ${menor ? `<p><strong>Menor:</strong> ${escapar(menor.nombre)}, ${menor.edad} años (${escapar(menor.etapa)})<br><span class="chico suave">Programa Infancia Sana: ${av.completadas} de ${av.total} semanas</span></p><div class="progreso acento"><span style="width:${av.porcentaje}%"></span></div>` : ''}
          <h4 style="margin-top:14px">Servicios</h4>
          ${solicitudes.length ? `<ul class="lista">${solicitudes.map((s) => `<li><span class="punto"></span><div class="cuerpo">${escapar((servicios.find((x) => x.id === s.servicio_id) || {}).nombre || '')}</div>${etiquetaEstado(s.estado)}</li>`).join('')}</ul>` : '<p class="chico suave">Sin servicios.</p>'}
        </div>
        <form class="tarjeta" id="form-caso" novalidate>
          <h3>Estado y próxima actividad</h3>
          <div class="campo"><label for="c-estado">Estado del caso</label>
            <select id="c-estado" name="estado">${['nuevo', 'activo', 'pausado', 'cerrado'].map((e) => `<option value="${e}" ${c.estado === e ? 'selected' : ''}>${e[0].toUpperCase() + e.slice(1)}</option>`).join('')}</select></div>
          <div class="campo"><label for="c-prox">Próxima actividad</label><input id="c-prox" name="proxima_actividad" required value="${escapar(c.proxima_actividad || '')}"></div>
          <div class="campo"><label for="c-fecha">Fecha</label><input id="c-fecha" name="proxima_fecha" type="date" required value="${escapar(c.proxima_fecha || '')}"></div>
          <div class="acciones"><button class="boton primario" type="submit">Guardar</button></div>
          ${actividades.length ? `<h4 style="margin-top:14px">Pendientes de la persona</h4><ul class="lista">${actividades.map((a) => `<li><span class="punto pendiente"></span><div class="cuerpo chico">${escapar(a.titulo)}<br><span class="suave">${fechaBonita(a.fecha)}</span></div></li>`).join('')}</ul>` : ''}
        </form>
      </div>
      ${menor ? `<div class="tarjeta" style="margin-top:16px"><h3>Últimos registros de hábitos de ${escapar(menor.nombre)}</h3>${registros.length ? `<div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Semana</th><th>Sueño (h)</th><th>Frutas y verduras</th><th>Juego activo (min)</th><th>Pantallas (h)</th><th>Agua</th><th>Fecha</th></tr></thead><tbody>${registros.slice(0, 4).map((r) => `<tr><td>${r.semana}</td><td>${r.sueno}</td><td>${r.frutas_verduras}</td><td>${r.juego_activo}</td><td>${r.pantallas}</td><td>${r.agua}</td><td>${fechaBonita(r.fecha)}</td></tr>`).join('')}</tbody></table></div>` : estadoVacio('📈', 'La familia aún no guarda registros.')}</div>` : ''}
      <div class="tarjeta" style="margin-top:16px">
        <div class="fila entre"><h3>Notas de seguimiento</h3><button class="boton chico primario" id="btn-nota" type="button">+ Nueva nota</button></div>
        ${notas.length ? `<ul class="lista">${notas.map((n) => `<li><span class="punto"></span><div class="cuerpo"><span class="chico suave">${fechaBonita(n.fecha)}</span><br>${escapar(n.texto)}</div></li>`).join('')}</ul>` : estadoVacio('📝', 'Todavía no hay notas en este caso. Escribe la primera.')}
      </div>`;
    $('#form-caso').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validar(e.target)) { aviso('Completa la próxima actividad y su fecha', 'error'); return; }
      api.actualizar('casos', id, datosFormulario(e.target));
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
  }

  pintarLista();
  const h = location.hash.match(/caso=([^&]+)/);
  const casos = casosMios();
  if (h && casos.some((c) => c.id === h[1])) pintarFicha(h[1]);
  else if (casos.length) pintarFicha(casos[0].id);
  else $('#ficha-caso').innerHTML = estadoVacio('🗂️', 'No tienes casos asignados todavía.');
}
