// Vista de administración (escuela, A.C. o gobierno): usuarios, catálogo, contenidos/programas y actividad general.
// Cada organización ve solo lo suyo (organizacion_id).
import { api, etiquetaEstado, fechaBonita, hoyISO, registrarActividad, avanceMenor } from './api.js';
import { requerir } from './auth.js';
import { $, $$, escapar, montarEncabezado, montarPie, aviso, ventana, ultimaVentana, estadoVacio, activarPestanas, iniciales } from './ui.js';

const sesion = requerir('admin');
if (sesion) {
  montarEncabezado('espacio');
  montarPie();
  const perfil = sesion.perfil;
  const org = api.obtener('organizaciones', perfil.organizacion_id) || { nombre: 'Organización', tipo: '' };
  const TIPO = { escuela: 'Escuela', ac: 'Asociación civil', gobierno: 'Gobierno' };
  const ROL = { usuario: 'Usuario adulto', familia: 'Familia', profesional: 'Profesional', admin: 'Administración' };
  $('#admin-titulo').innerHTML = `<span class="etiqueta">${TIPO[org.tipo] || 'Organización'}</span><h1 style="margin-top:8px">${escapar(org.nombre)}</h1><p class="suave">Administración · ${escapar(perfil.nombre)}. <span class="etiqueta ejemplo">Datos de ejemplo</span></p>`;
  activarPestanas(document, 'resumen');

  const usuariosOrg = () => api.listar('perfiles', { organizacion_id: org.id }).filter((p) => p.rol !== 'admin');

  function pintarResumen() {
    const us = usuariosOrg();
    const familias = us.filter((p) => p.rol === 'familia');
    const menores = familias.flatMap((f) => api.listar('menores', { responsable_id: f.id }));
    const progreso = menores.length ? Math.round(menores.reduce((n, m) => n + avanceMenor(m.id).porcentaje, 0) / menores.length) : 0;
    const programas = api.listar('programas', { organizacion_id: org.id });
    const actividad = api.listar('actividad_general', { organizacion_id: org.id }).sort((a, b) => b.fecha.localeCompare(a.fecha));
    $('#resumen').innerHTML = `
      <div class="cifras">
        <div class="cifra"><strong>${us.length}</strong><span>usuarios de prueba</span></div>
        <div class="cifra"><strong>${familias.length}</strong><span>familias</span></div>
        <div class="cifra"><strong>${menores.length}</strong><span>menores en el programa</span></div>
        <div class="cifra"><strong>${progreso}%</strong><span>avance promedio</span></div>
        <div class="cifra"><strong>${programas.length}</strong><span>programas</span></div>
      </div>
      <div class="rejilla dos" style="margin-top:20px">
        <div class="tarjeta"><h3>Programas</h3>${programas.length ? `<ul class="lista">${programas.map((p) => `<li><span class="punto"></span><div class="cuerpo"><strong>${escapar(p.nombre)}</strong><br><span class="chico suave">${p.semanas} semanas · ${p.familias} familia(s)</span></div>${etiquetaEstado(p.estado)}</li>`).join('')}</ul>` : estadoVacio('📚', 'Esta organización aún no tiene programas. Se crean desde «Contenidos y programas».')}</div>
        <div class="tarjeta"><h3>Última actividad</h3>${actividad.length ? `<ul class="lista">${actividad.slice(0, 5).map((a) => `<li><span class="punto"></span><div class="cuerpo chico">${escapar(a.texto)}<br><span class="suave">${fechaBonita(a.fecha)}</span></div></li>`).join('')}</ul>` : estadoVacio('🕊️', 'Todavía no hay actividad registrada.')}</div>
      </div>`;
  }

  function pintarUsuarios() {
    const us = usuariosOrg();
    $('#usuarios').innerHTML = `
      <div class="fila entre"><h2>Usuarios de prueba</h2><button class="boton chico primario" id="btn-usuario" type="button">+ Invitar usuario</button></div>
      ${us.length ? `<div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Nombre</th><th>Tipo</th><th>Correo</th><th>Detalle</th></tr></thead><tbody>${us.map((p) => { const det = p.rol === 'familia' ? `${api.listar('menores', { responsable_id: p.id }).length} menor(es)` : p.rol === 'profesional' ? `${api.listar('casos', { profesional_id: p.id }).length} caso(s)` : `${api.listar('solicitudes', { perfil_id: p.id }).length} servicio(s)`; return `<tr><td><span class="fila"><span class="avatar" style="width:28px;height:28px;font-size:.7rem">${iniciales(p.nombre)}</span>${escapar(p.nombre)}</span></td><td>${ROL[p.rol] || p.rol}</td><td>${escapar(p.correo)}</td><td>${det}</td></tr>`; }).join('')}</tbody></table></div>` : estadoVacio('👥', 'Esta organización no tiene usuarios todavía. Invita al primero.')}`;
    $('#btn-usuario').addEventListener('click', async () => {
      const v = await ventana({ titulo: 'Invitar usuario', html: `
        <div class="campo"><label for="iu-nombre">Nombre</label><input id="iu-nombre" name="nombre"></div>
        <div class="campo"><label for="iu-correo">Correo</label><input id="iu-correo" name="correo" type="email"></div>
        <div class="campo"><label for="iu-rol">Tipo</label><select id="iu-rol" name="rol"><option value="usuario">Usuario adulto</option><option value="familia">Familia</option><option value="profesional">Profesional</option></select></div>
        <p class="chico suave">En la versión real se enviará un correo de invitación. En la demo el usuario se agrega directamente.</p>`, botones: [{ texto: 'Cancelar', clase: 'secundario', valor: null }, { texto: 'Invitar', clase: 'primario', valor: 'ok' }] });
      if (v !== 'ok') return;
      const d = ultimaVentana.campos;
      if (!d.nombre || !d.correo) { aviso('Faltan el nombre o el correo', 'error'); return; }
      api.insertar('perfiles', { rol: d.rol, nombre: d.nombre, correo: d.correo, organizacion_id: org.id, objetivos: [], objetivo_principal: null });
      registrarActividad(org.id, `Se invitó a ${d.nombre} (${ROL[d.rol]}).`);
      aviso('Usuario agregado', 'ok'); pintarUsuarios(); pintarResumen(); pintarActividad();
    });
  }

  function pintarCatalogo() {
    const servicios = api.listar('servicios');
    $('#catalogo').innerHTML = `
      <h2>Catálogo de servicios</h2>
      <p class="suave chico">Catálogo de muestra. Activa o desactiva lo que esta organización ofrece a sus usuarios.</p>
      <div class="rejilla">${servicios.map((s) => `
        <div class="tarjeta"><div class="fila entre"><strong>${escapar(s.nombre)}</strong>${s.disponible ? '<span class="etiqueta ok">Disponible</span>' : '<span class="etiqueta gris">Inactivo</span>'}</div>
        <p class="chico suave" style="margin:8px 0">${escapar(s.descripcion)}</p><p class="chico"><strong>Para quién:</strong> ${escapar(s.para_quien)}</p>
        <button class="boton chico secundario" data-toggle="${s.id}" type="button">${s.disponible ? 'Desactivar' : 'Activar'}</button></div>`).join('')}</div>`;
    $$('[data-toggle]').forEach((b) => b.addEventListener('click', () => { const s = api.obtener('servicios', b.dataset.toggle); api.actualizar('servicios', s.id, { disponible: !s.disponible }); aviso(s.disponible ? 'Servicio desactivado' : 'Servicio activado', 'ok'); pintarCatalogo(); }));
  }

  function pintarContenidos() {
    const contenidos = api.listar('contenidos', { organizacion_id: org.id });
    const programas = api.listar('programas', { organizacion_id: org.id });
    const semanas = api.listar('programa_semanas').sort((a, b) => a.numero - b.numero);
    $('#contenidos').innerHTML = `
      <div class="rejilla dos">
        <div>
          <div class="fila entre"><h2>Contenidos</h2><button class="boton chico primario" id="btn-contenido" type="button">+ Nuevo</button></div>
          ${contenidos.length ? `<ul class="lista">${contenidos.map((c) => `<li><span class="punto"></span><div class="cuerpo"><strong>${escapar(c.titulo)}</strong><br><span class="chico suave">${escapar(c.tipo)}</span></div>${etiquetaEstado(c.estado)}<button class="boton chico fantasma" data-publicar="${c.id}" type="button">${c.estado === 'publicado' ? 'Pasar a borrador' : 'Publicar'}</button></li>`).join('')}</ul>` : estadoVacio('📂', 'Sin contenidos. Crea el primero.')}
        </div>
        <div>
          <div class="fila entre"><h2>Programas</h2><button class="boton chico primario" id="btn-programa" type="button">+ Nuevo</button></div>
          ${programas.length ? `<ul class="lista">${programas.map((p) => `<li><span class="punto"></span><div class="cuerpo"><strong>${escapar(p.nombre)}</strong><br><span class="chico suave">${p.semanas} semanas · ${p.familias} familia(s)</span></div>${etiquetaEstado(p.estado)}</li>`).join('')}</ul>` : estadoVacio('📚', 'Sin programas todavía.')}
        </div>
      </div>
      <div class="tarjeta" style="margin-top:20px">
        <div class="fila entre"><h3>Programa Infancia Sana · plan de 12 semanas</h3><span class="etiqueta ejemplo">Contenido de ejemplo</span></div>
        <div class="tabla-envoltura"><table class="tabla"><thead><tr><th>#</th><th>Tema</th><th>Actividad</th></tr></thead><tbody>${semanas.map((s) => `<tr><td>${s.numero}</td><td><strong>${escapar(s.titulo)}</strong><br><span class="chico suave">${escapar(s.contenido)}</span></td><td class="chico">${escapar(s.actividad)}</td></tr>`).join('')}</tbody></table></div>
      </div>`;
    $$('[data-publicar]').forEach((b) => b.addEventListener('click', () => { const c = api.obtener('contenidos', b.dataset.publicar); api.actualizar('contenidos', c.id, { estado: c.estado === 'publicado' ? 'borrador' : 'publicado' }); registrarActividad(org.id, `${c.estado === 'publicado' ? 'Se retiró' : 'Se publicó'} «${c.titulo}».`); pintarContenidos(); pintarActividad(); }));
    $('#btn-contenido').addEventListener('click', async () => {
      const v = await ventana({ titulo: 'Nuevo contenido', html: `<div class="campo"><label for="nc-titulo">Título</label><input id="nc-titulo" name="titulo"></div><div class="campo"><label for="nc-tipo">Tipo</label><select id="nc-tipo" name="tipo"><option>Guía PDF</option><option>Video</option><option>Material imprimible</option><option>Taller</option></select></div>`, botones: [{ texto: 'Cancelar', clase: 'secundario', valor: null }, { texto: 'Crear', clase: 'primario', valor: 'ok' }] });
      if (v !== 'ok') return; const d = ultimaVentana.campos;
      if (!d.titulo) { aviso('Escribe el título', 'error'); return; }
      api.insertar('contenidos', { organizacion_id: org.id, titulo: d.titulo, tipo: d.tipo, estado: 'borrador', ejemplo: true });
      aviso('Contenido creado como borrador', 'ok'); pintarContenidos();
    });
    $('#btn-programa').addEventListener('click', async () => {
      const v = await ventana({ titulo: 'Nuevo programa', html: `<div class="campo"><label for="np-nombre">Nombre del grupo o programa</label><input id="np-nombre" name="nombre" placeholder="Infancia Sana — Grupo 3°B"></div>`, botones: [{ texto: 'Cancelar', clase: 'secundario', valor: null }, { texto: 'Crear', clase: 'primario', valor: 'ok' }] });
      if (v !== 'ok') return; const d = ultimaVentana.campos;
      if (!d.nombre) { aviso('Escribe el nombre', 'error'); return; }
      api.insertar('programas', { organizacion_id: org.id, nombre: d.nombre, semanas: 12, familias: 0, estado: 'por iniciar', ejemplo: true });
      registrarActividad(org.id, `Se creó el programa «${d.nombre}».`);
      aviso('Programa creado', 'ok'); pintarContenidos(); pintarResumen(); pintarActividad();
    });
  }

  function pintarActividad() {
    const actividad = api.listar('actividad_general', { organizacion_id: org.id }).sort((a, b) => b.fecha.localeCompare(a.fecha));
    const recorridos = api.listar('recorridos');
    const mensajes = api.listar('mensajes_contacto');
    $('#actividad').innerHTML = `
      <h2>Actividad general</h2>
      <div class="rejilla dos">
        <div class="tarjeta"><h3>Movimientos de la organización</h3>${actividad.length ? `<ul class="lista">${actividad.map((a) => `<li><span class="punto"></span><div class="cuerpo chico">${escapar(a.texto)}<br><span class="suave">${fechaBonita(a.fecha)}</span></div></li>`).join('')}</ul>` : estadoVacio('🕊️', 'Todavía no hay actividad registrada para esta organización.')}</div>
        <div>
          <div class="tarjeta" style="margin-bottom:16px"><h3>Recorridos «Descubre tu ruta»</h3><p class="chico suave">Recorridos completados por visitantes (anónimos) en esta demostración.</p>${recorridos.length ? `<ul class="lista">${recorridos.slice(-5).reverse().map((r) => `<li><span class="punto"></span><div class="cuerpo chico">Objetivo: <strong>${escapar((api.obtener('objetivos', r.objetivo_id) || {}).nombre || r.objetivo_id)}</strong><br><span class="suave">${fechaBonita(r.fecha)}</span></div></li>`).join('')}</ul>` : estadoVacio('🧭', 'Aún nadie ha hecho el recorrido.')}</div>
          <div class="tarjeta"><h3>Mensajes de contacto</h3>${mensajes.length ? `<ul class="lista">${mensajes.slice(-5).reverse().map((m) => `<li><span class="punto pendiente"></span><div class="cuerpo chico"><strong>${escapar(m.nombre)}</strong> · ${escapar(m.correo)}<br>${escapar(m.mensaje)}<br><span class="suave">${fechaBonita(m.fecha)}</span></div></li>`).join('')}</ul>` : estadoVacio('✉️', 'No hay mensajes nuevos.')}</div>
        </div>
      </div>`;
  }

  pintarResumen(); pintarUsuarios(); pintarCatalogo(); pintarContenidos(); pintarActividad();
}
