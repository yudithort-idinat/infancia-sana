// Espacio del usuario adulto: inicio, perfil, servicios y seguimiento.
import { api, etiquetaEstado, fechaBonita, hoyISO, registrarActividad } from './api.js';
import { requerir } from './auth.js';
import { $, $$, escapar, montarEncabezado, montarPie, aviso, ventana, ultimaVentana, validar, datosFormulario, estadoVacio, activarPestanas } from './ui.js';

const sesion = requerir('usuario');
if (sesion) {
  montarEncabezado('espacio');
  montarPie();
  let perfil = sesion.perfil;
  const objetivos = api.listar('objetivos');
  const servicios = api.listar('servicios');
  const nombreObjetivo = (id) => (objetivos.find((o) => o.id === id) || {}).nombre || 'Sin definir';

  const mostrar = activarPestanas(document, 'inicio');

  // ---------- Inicio ----------
  function pintarInicio() {
    const actividades = api.listar('actividades', { perfil_id: perfil.id });
    const pendientes = actividades.filter((a) => a.estado === 'pendiente').sort((a, b) => a.fecha.localeCompare(b.fecha));
    const docs = api.listar('documentos', { perfil_id: perfil.id });
    const solicitudes = api.listar('solicitudes', { perfil_id: perfil.id });
    const hora = new Date().getHours();
    const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';
    $('#inicio').innerHTML = `
      <h1>${saludo}, ${escapar(perfil.nombre.split(' ')[0])}</h1>
      <p class="suave">Tu objetivo principal: <strong>${escapar(nombreObjetivo(perfil.objetivo_principal))}</strong> · <a href="#perfil" data-ir="perfil">cambiar</a></p>
      <div class="cifras" style="margin:18px 0 24px">
        <div class="cifra"><strong>${pendientes.length}</strong><span>actividades pendientes</span></div>
        <div class="cifra"><strong>${actividades.filter((a) => a.estado === 'completada').length}</strong><span>completadas</span></div>
        <div class="cifra"><strong>${solicitudes.length}</strong><span>servicios en tu historial</span></div>
        <div class="cifra"><strong>${docs.length}</strong><span>documentos</span></div>
      </div>
      <div class="rejilla dos">
        <div class="tarjeta">
          <div class="fila entre"><h3>Próximos pasos</h3><a href="#seguimiento" data-ir="seguimiento" class="chico">Ver todo</a></div>
          ${pendientes.length ? `<ul class="lista">${pendientes.slice(0, 3).map((a) => `<li><span class="punto pendiente"></span><div class="cuerpo"><strong>${escapar(a.titulo)}</strong><br><span class="chico suave">${a.tipo === 'cita' ? 'Cita' : 'Tarea'} · ${fechaBonita(a.fecha)}</span></div></li>`).join('')}</ul>` : estadoVacio('🎉', 'No tienes pendientes por ahora.')}
        </div>
        <div class="tarjeta">
          <div class="fila entre"><h3>Mis documentos</h3></div>
          ${docs.length ? `<ul class="lista">${docs.map((d) => `<li><span class="punto"></span><div class="cuerpo"><strong>${escapar(d.nombre)}</strong><br><span class="chico suave">${escapar(d.tipo)} · ${fechaBonita(d.fecha)}</span></div><button class="boton chico secundario" data-doc="${d.id}" type="button">Abrir</button></li>`).join('')}</ul>` : estadoVacio('📄', 'Aún no tienes documentos. Aparecerán aquí cuando el equipo te comparta resultados o planes.')}
        </div>
      </div>`;
  }

  // ---------- Perfil ----------
  function pintarPerfil() {
    const historial = api.listar('solicitudes', { perfil_id: perfil.id }).sort((a, b) => b.fecha.localeCompare(a.fecha));
    $('#perfil').innerHTML = `
      <h2>Mi perfil</h2>
      <div class="rejilla dos">
        <form class="tarjeta" id="form-perfil" novalidate>
          <h3>Datos generales</h3>
          <div class="campo"><label for="p-nombre">Nombre completo</label><input id="p-nombre" name="nombre" required value="${escapar(perfil.nombre)}"></div>
          <div class="dos-columnas">
            <div class="campo"><label for="p-correo">Correo</label><input id="p-correo" name="correo" type="email" required value="${escapar(perfil.correo)}"></div>
            <div class="campo"><label for="p-tel">Teléfono</label><input id="p-tel" name="telefono" value="${escapar(perfil.telefono || '')}"></div>
          </div>
          <div class="dos-columnas">
            <div class="campo"><label for="p-nac">Fecha de nacimiento</label><input id="p-nac" name="fecha_nacimiento" type="date" value="${escapar(perfil.fecha_nacimiento || '')}"></div>
            <div class="campo"><label for="p-ciudad">Ciudad</label><input id="p-ciudad" name="ciudad" value="${escapar(perfil.ciudad || '')}"></div>
          </div>
          <div class="campo"><label for="p-obj">Objetivo principal</label>
            <select id="p-obj" name="objetivo_principal">${objetivos.map((o) => `<option value="${o.id}" ${o.id === perfil.objetivo_principal ? 'selected' : ''}>${escapar(o.nombre)}</option>`).join('')}</select></div>
          <div class="acciones"><button class="boton primario" type="submit">Guardar cambios</button></div>
        </form>
        <div>
          <div class="tarjeta" style="margin-bottom:16px">
            <div class="fila entre"><h3>Mis objetivos</h3><button class="boton chico secundario" id="btn-objetivo" type="button">+ Agregar</button></div>
            ${perfil.objetivos.length ? `<ul class="lista" id="lista-objetivos">${perfil.objetivos.map((o, i) => `<li><span class="punto"></span><div class="cuerpo">${escapar(o)}</div><button class="boton chico fantasma" data-quitar="${i}" type="button" title="Quitar">✕</button></li>`).join('')}</ul>` : estadoVacio('🎯', 'Todavía no has escrito objetivos. Agrega el primero.')}
          </div>
          <div class="tarjeta">
            <h3>Historial de servicios</h3>
            ${historial.length ? `<ul class="lista">${historial.map((s) => `<li><span class="punto ${s.estado === 'completado' ? '' : 'pendiente'}"></span><div class="cuerpo"><strong>${escapar((servicios.find((x) => x.id === s.servicio_id) || {}).nombre || '')}</strong><br><span class="chico suave">${fechaBonita(s.fecha)}</span></div>${etiquetaEstado(s.estado)}</li>`).join('')}</ul>` : estadoVacio('🗂️', 'Sin servicios todavía.')}
          </div>
        </div>
      </div>`;
    $('#form-perfil').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validar(e.target)) { aviso('Revisa los campos marcados', 'error'); return; }
      perfil = api.actualizar('perfiles', perfil.id, datosFormulario(e.target));
      aviso('Perfil guardado', 'ok');
      pintarInicio();
    });
    $('#btn-objetivo').addEventListener('click', async () => {
      const v = await ventana({ titulo: 'Nuevo objetivo', html: `<div class="campo"><label for="nuevo-obj">¿Qué te gustaría lograr?</label><input id="nuevo-obj" placeholder="Por ejemplo: cenar antes de las 8"></div>`, botones: [{ texto: 'Cancelar', clase: 'secundario', valor: null }, { texto: 'Agregar', clase: 'primario', valor: 'ok' }] });
      const texto = (ultimaVentana.campos['nuevo-obj'] || '').trim();
      if (v === 'ok') {
        if (!texto) { aviso('Escribe el objetivo', 'error'); return; }
        perfil = api.actualizar('perfiles', perfil.id, { objetivos: [...perfil.objetivos, texto] });
        aviso('Objetivo agregado', 'ok'); pintarPerfil();
      }
    });
    $$('[data-quitar]').forEach((b) => b.addEventListener('click', () => {
      perfil = api.actualizar('perfiles', perfil.id, { objetivos: perfil.objetivos.filter((_, i) => i !== Number(b.dataset.quitar)) });
      pintarPerfil();
    }));
  }

  // ---------- Servicios ----------
  function pintarServicios() {
    const solicitudes = api.listar('solicitudes', { perfil_id: perfil.id });
    const idsSolicitados = new Set(solicitudes.map((s) => s.servicio_id));
    const disponibles = servicios.filter((s) => s.disponible && !idsSolicitados.has(s.id));
    $('#servicios').innerHTML = `
      <h2>Servicios</h2>
      <h3 style="margin-top:16px">Solicitados</h3>
      ${solicitudes.length ? `<div class="rejilla">${solicitudes.map((s) => { const serv = servicios.find((x) => x.id === s.servicio_id) || {}; return `
        <div class="tarjeta"><div class="fila entre"><strong>${escapar(serv.nombre || '')}</strong>${etiquetaEstado(s.estado)}</div><p class="chico suave" style="margin:8px 0">${escapar(serv.descripcion || '')}</p><span class="chico suave">Solicitado el ${fechaBonita(s.fecha)}</span></div>`; }).join('')}</div>` : estadoVacio('🗂️', 'Aún no has solicitado servicios.')}
      <h3 style="margin-top:28px">Disponibles</h3>
      ${disponibles.length ? `<div class="rejilla">${disponibles.map((s) => `
        <div class="tarjeta"><strong>${escapar(s.nombre)}</strong><p class="chico suave" style="margin:8px 0">${escapar(s.descripcion)}</p><p class="chico"><strong>Para quién:</strong> ${escapar(s.para_quien)}</p><button class="boton chico primario" data-solicitar="${s.id}" type="button">Solicitar</button></div>`).join('')}</div>` : estadoVacio('✅', 'Ya solicitaste todos los servicios disponibles.')}`;
    $$('[data-solicitar]').forEach((b) => b.addEventListener('click', async () => {
      const serv = servicios.find((x) => x.id === b.dataset.solicitar);
      const ok = await ventana({ titulo: 'Solicitar servicio', html: `<p>Vas a solicitar <strong>${escapar(serv.nombre)}</strong>. El equipo de MYO Genetics se pondrá en contacto contigo para confirmar.</p>`, botones: [{ texto: 'Cancelar', clase: 'secundario', valor: false }, { texto: 'Confirmar solicitud', clase: 'primario', valor: true }] });
      if (!ok) return;
      api.insertar('solicitudes', { perfil_id: perfil.id, servicio_id: serv.id, estado: 'solicitado', fecha: hoyISO() });
      registrarActividad(perfil.organizacion_id, `${perfil.nombre} solicitó ${serv.nombre}.`);
      aviso('Solicitud enviada', 'ok');
      pintarServicios(); pintarInicio(); pintarPerfil();
    }));
  }

  // ---------- Seguimiento ----------
  function pintarSeguimiento() {
    const actividades = api.listar('actividades', { perfil_id: perfil.id }).sort((a, b) => a.fecha.localeCompare(b.fecha));
    const recordatorios = api.listar('recordatorios', { perfil_id: perfil.id });
    const hechas = actividades.filter((a) => a.estado === 'completada').length;
    const pct = actividades.length ? Math.round((hechas / actividades.length) * 100) : 0;
    $('#seguimiento').innerHTML = `
      <h2>Seguimiento</h2>
      <div class="tarjeta" style="margin-bottom:16px">
        <div class="fila entre"><h3>Línea de progreso</h3><span class="etiqueta">${hechas} de ${actividades.length} actividades</span></div>
        <div class="progreso"><span style="width:${pct}%"></span></div>
        <p class="chico suave" style="margin:8px 0 0">${pct}% de tus actividades completadas.</p>
      </div>
      <div class="rejilla dos">
        <div>
          <h3>Actividades</h3>
          ${actividades.length ? actividades.map((a) => `
            <div class="tarjeta" style="padding:14px;margin-bottom:10px">
              <div class="fila entre"><strong>${escapar(a.titulo)}</strong>${etiquetaEstado(a.estado)}</div>
              <div class="fila entre" style="margin-top:6px"><span class="chico suave">${a.tipo === 'cita' ? '📅 Cita' : '✅ Tarea'} · ${fechaBonita(a.fecha)}</span>
              ${a.estado === 'pendiente' ? `<button class="boton chico primario" data-completar="${a.id}" type="button">Marcar completada</button>` : `<button class="boton chico fantasma" data-reabrir="${a.id}" type="button">Reabrir</button>`}</div>
            </div>`).join('') : estadoVacio('📋', 'No hay actividades registradas.')}
          <button class="boton secundario" id="btn-actividad" type="button" style="margin-top:6px">+ Agregar actividad</button>
        </div>
        <div>
          <div class="tarjeta" style="margin-bottom:16px">
            <h3>Calendario</h3>
            ${pintarCalendario(actividades)}
          </div>
          <div class="tarjeta">
            <h3>Recordatorios</h3>
            ${recordatorios.length ? `<ul class="lista">${recordatorios.map((r) => `<li><span class="punto"></span><div class="cuerpo"><strong>${escapar(r.texto)}</strong><br><span class="chico suave">${escapar(r.cuando)}</span></div></li>`).join('')}</ul>` : estadoVacio('🔔', 'Sin recordatorios.')}
          </div>
        </div>
      </div>`;
    $$('[data-completar]').forEach((b) => b.addEventListener('click', () => { api.actualizar('actividades', b.dataset.completar, { estado: 'completada' }); aviso('¡Actividad completada!', 'ok'); pintarSeguimiento(); pintarInicio(); }));
    $$('[data-reabrir]').forEach((b) => b.addEventListener('click', () => { api.actualizar('actividades', b.dataset.reabrir, { estado: 'pendiente' }); pintarSeguimiento(); pintarInicio(); }));
    $('#btn-actividad').addEventListener('click', async () => {
      const v = await ventana({ titulo: 'Nueva actividad', html: `
        <div class="campo"><label for="na-titulo">¿Qué vas a hacer?</label><input id="na-titulo" placeholder="Por ejemplo: preparar lonchera el domingo"></div>
        <div class="campo"><label for="na-fecha">¿Cuándo?</label><input id="na-fecha" type="date" value="${hoyISO()}"></div>`, botones: [{ texto: 'Cancelar', clase: 'secundario', valor: null }, { texto: 'Agregar', clase: 'primario', valor: 'ok' }] });
      const titulo = (ultimaVentana.campos['na-titulo'] || '').trim(); const fecha = ultimaVentana.campos['na-fecha'] || hoyISO();
      if (v === 'ok') { if (!titulo) { aviso('Escribe la actividad', 'error'); return; } api.insertar('actividades', { perfil_id: perfil.id, titulo, fecha, estado: 'pendiente', tipo: 'tarea' }); aviso('Actividad agregada', 'ok'); pintarSeguimiento(); pintarInicio(); }
    });
  }

  function pintarCalendario(actividades) {
    const ahora = new Date(); const a = ahora.getFullYear(); const m = ahora.getMonth();
    const primero = new Date(a, m, 1).getDay(); const dias = new Date(a, m + 1, 0).getDate();
    const porDia = {};
    actividades.forEach((x) => { const [ya, ym, yd] = x.fecha.split('-').map(Number); if (ya === a && ym === m + 1) (porDia[yd] = porDia[yd] || []).push(x); });
    const nombreMes = ahora.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    let celdas = '';
    for (let i = 0; i < primero; i++) celdas += '<div></div>';
    for (let d = 1; d <= dias; d++) {
      const hoy = d === ahora.getDate();
      const lista = porDia[d] || [];
      celdas += `<div title="${lista.map((x) => x.titulo).join(', ')}" style="aspect-ratio:1;display:grid;place-items:center;border-radius:8px;font-size:.82rem;${hoy ? 'background:var(--primario);color:#fff;font-weight:700' : lista.length ? (lista.some((x) => x.estado === 'pendiente') ? 'background:#FDEBD8;font-weight:700' : 'background:#E6F4EC;font-weight:700') : ''}">${d}</div>`;
    }
    return `<p class="chico suave" style="text-transform:capitalize">${nombreMes}</p>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;font-size:.75rem;color:var(--tinta-suave);text-align:center">${['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((x) => `<div>${x}</div>`).join('')}</div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:4px">${celdas}</div>
      <p class="chico suave" style="margin:10px 0 0"><span style="display:inline-block;width:10px;height:10px;background:#FDEBD8;border-radius:3px"></span> pendiente · <span style="display:inline-block;width:10px;height:10px;background:#E6F4EC;border-radius:3px"></span> completada</p>`;
  }

  // Documentos de ejemplo
  document.addEventListener('click', (e) => {
    const d = e.target.closest('[data-doc]');
    if (d) { const doc = api.obtener('documentos', d.dataset.doc); ventana({ titulo: doc.nombre, html: `<p class="suave">Vista previa de ejemplo. En la versión real aquí se abrirá el archivo PDF compartido por el equipo.</p><div class="vacio"><div class="icono">📄</div>${escapar(doc.tipo)} · ${fechaBonita(doc.fecha)}</div>` }); }
    const ir = e.target.closest('[data-ir]');
    if (ir) { e.preventDefault(); mostrar(ir.dataset.ir); }
  });

  pintarInicio(); pintarPerfil(); pintarServicios(); pintarSeguimiento();
}
