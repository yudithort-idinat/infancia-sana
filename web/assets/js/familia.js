// Área familiar: panel del responsable, perfiles de menores (varios por cuenta), línea base,
// programa de 12 semanas por etapa con check-in, logros, recomendaciones validadas, mediciones y cierre.
import { api, fechaBonita, hoyISO, registrarActividad } from './api.js';
import { requerir } from './auth.js';
import { etapaDe, edadTexto, etapasTodas, avanceMenor, puntaje, cumplimiento, checkinsDe, logrosMenor, pendientesMenor, fueraDeRango } from './programa.js';
import { $, $$, escapar, montarEncabezado, montarPie, aviso, ventana, ultimaVentana, validar, datosFormulario, estadoVacio, guia, barras } from './ui.js';

const sesion = requerir('familia');
if (sesion) {
  montarEncabezado('espacio');
  montarPie();
  const perfil = sesion.perfil;
  const vistaPanel = $('#vista-panel');
  const vistaMenor = $('#vista-menor');
  const nombre = perfil.nombre.split(' ')[0];

  // ---------- Bienvenida personalizada (primera vez) ----------
  async function bienvenida(menores) {
    if (sessionStorage.getItem('infancia_bienvenida') !== perfil.id) return;
    sessionStorage.removeItem('infancia_bienvenida');
    await ventana({ titulo: `Bienvenida, ${nombre}`, html: `
      ${guia('Qué bueno tenerte aquí. Vamos paso a paso: nada de esto toma más de unos minutos.')}
      <div class="primeros-pasos" style="margin-top:14px;grid-template-columns:1fr">
        <div class="paso-inicio"><span class="n">1</span><div><strong>Agrega a tu bebé, niña o niño</strong><span class="chico suave">Con su fecha de nacimiento calculamos la etapa del programa.</span></div></div>
        <div class="paso-inicio"><span class="n">2</span><div><strong>Completa la línea base</strong><span class="chico suave">Cinco datos de cómo van hoy. Es el «antes» para ver el cambio.</span></div></div>
        <div class="paso-inicio"><span class="n">3</span><div><strong>Inicia la semana 1</strong><span class="chico suave">Lee el microcontenido, haz la actividad y registra el check-in de tres minutos.</span></div></div>
        <div class="paso-inicio"><span class="n">4</span><div><strong>Revisa tus pendientes</strong><span class="chico suave">Aquí en tu panel siempre verás qué sigue.</span></div></div>
      </div>`, botones: [{ texto: menores.length ? 'Ir a mi panel' : 'Agregar a mi primer menor', clase: 'primario', valor: 'ok' }] });
    if (!menores.length) nuevoMenor();
  }

  // ---------- Panel del responsable ----------
  function pintarPanel() {
    vistaPanel.classList.remove('oculto'); vistaMenor.classList.add('oculto');
    history.replaceState(null, '', 'familia.html');
    const menores = api.listar('menores', { responsable_id: perfil.id });
    const recordatorios = api.listar('recordatorios', { perfil_id: perfil.id });
    const docs = api.listar('documentos', { perfil_id: perfil.id });
    const resumen = menores.map((m) => ({ m, av: avanceMenor(m.id), logros: logrosMenor(m.id).filter((l) => l.ganada).length, pend: pendientesMenor(m.id) }));
    const pendientes = resumen.flatMap((r) => r.pend);
    const progresoGeneral = resumen.length ? Math.round(resumen.reduce((n, r) => n + r.av.porcentaje, 0) / resumen.length) : 0;
    const logrosTotal = resumen.reduce((n, r) => n + r.logros, 0);
    const pasos = [
      { t: 'Agregar a tu bebé, niña o niño', d: 'Uno o varios perfiles por cuenta.', hecho: menores.length > 0 },
      { t: 'Completar la línea base', d: 'El «antes» de cada menor.', hecho: menores.length > 0 && resumen.every((r) => r.av.lineaBase) },
      { t: 'Iniciar la semana 1', d: 'Actividad en casa + check-in.', hecho: resumen.some((r) => r.av.completadas > 0) },
      { t: 'Revisar pendientes', d: 'Retoma lo que quedó a medias.', hecho: menores.length > 0 && pendientes.length === 0 },
    ];
    const primerPendiente = pendientes[0];
    const mensajeGuia = !menores.length ? 'Empecemos por agregar a tu bebé, niña o niño. Con su fecha de nacimiento sabremos qué etapa del programa le corresponde.'
      : primerPendiente ? `Lo primero de hoy: ${escapar(primerPendiente.texto.replace(/\.$/, ""))}. Te toma pocos minutos.`
      : 'Están al día. Cuando quieran, revisen la gráfica de avance o el reporte de cada menor.';
    // Recordatorios amables (calculados) + los guardados
    const amables = resumen.filter((r) => r.av.lineaBase && !r.av.terminado).map((r) => { const ck = checkinsDe(r.m.id); const u = ck[ck.length - 1]; const dias = u ? Math.round((new Date() - new Date(u.fecha)) / 86400000) : null; return dias === null ? `Aún no hay check-ins de ${r.m.nombre}. El primero es el más importante.` : dias >= 7 ? `Hace ${dias} días del último check-in de ${r.m.nombre}. ¿Retomamos la semana ${r.av.semanaActiva}?` : `Check-in de ${r.m.nombre} registrado ${dias === 0 ? "hoy" : `hace ${dias} día(s)`}. Van bien.`; });

    vistaPanel.innerHTML = `
      <div class="fila entre"><div><h1>Hola, ${escapar(nombre)}</h1><p class="suave" style="margin:0">Tu panel familiar en <strong>Infancia Sana</strong>. <span class="etiqueta ejemplo">Contenido de ejemplo</span></p></div>
        <div class="acciones"><button class="boton secundario chico" id="btn-nuevo-menor" type="button">+ Agregar menor</button><button class="boton fantasma chico" id="btn-editar-cuenta" type="button">Mi cuenta</button></div></div>
      <div style="margin:16px 0">${guia(mensajeGuia)}</div>
      <div class="cifras" style="margin:0 0 20px">
        <div class="cifra"><strong>${menores.length}</strong><span>menores registrados</span></div>
        <div class="cifra"><strong>${pendientes.length}</strong><span>pendientes</span></div>
        <div class="cifra"><strong>${progresoGeneral}%</strong><span>progreso general</span></div>
        <div class="cifra"><strong>${logrosTotal}</strong><span>logros ganados</span></div>
      </div>

      <div class="tarjeta" style="margin-bottom:20px">
        <div class="fila entre"><h3 style="margin:0">Por dónde empezar</h3><span class="chico suave">${pasos.filter((p) => p.hecho).length} de ${pasos.length} listos</span></div>
        <div class="primeros-pasos" style="margin-top:12px">${pasos.map((p, i) => `<div class="paso-inicio ${p.hecho ? 'hecho' : ''}"><span class="n">${p.hecho ? '✓' : i + 1}</span><div><strong>${escapar(p.t)}</strong><span class="chico suave">${escapar(p.d)}</span></div></div>`).join('')}</div>
      </div>

      <div class="rejilla dos" style="margin-bottom:20px">
        <div>
          <h2>Pendientes</h2>
          ${pendientes.length ? pendientes.map((p) => `<div class="pendiente-item"><div class="icono ${p.tipo === 'reco' ? 'calido' : 'sol'}">${p.tipo === 'base' ? '📍' : p.tipo === 'semana' ? '🏠' : p.tipo === 'cierre' ? '📊' : '💬'}</div><div class="cuerpo chico">${escapar(p.texto)}</div><button class="boton chico primario" data-retomar="${p.menor_id}" data-seccion="${p.tipo}" type="button">${p.tipo === 'base' ? 'Completar' : p.tipo === 'semana' ? 'Retomar' : p.tipo === 'cierre' ? 'Registrar' : 'Ver'}</button></div>`).join('') : estadoVacio('🎉', menores.length ? 'No hay pendientes. ¡Van al día!' : 'Agrega a tu primer menor para ver pendientes.')}
        </div>
        <div>
          <h2>Recordatorios</h2>
          <div class="tarjeta">
            ${amables.length || recordatorios.length ? `<ul class="lista compacta">${amables.map((t) => `<li><span class="punto pendiente"></span><div class="cuerpo chico">${escapar(t)}</div></li>`).join('')}${recordatorios.map((r) => `<li><span class="punto"></span><div class="cuerpo chico"><strong>${escapar(r.texto)}</strong><br><span class="suave">${escapar(r.cuando)}</span></div></li>`).join('')}</ul>` : estadoVacio('🔔', 'Los recordatorios aparecen cuando el programa está en marcha.')}
            <p class="chico suave" style="margin:10px 0 0">En la versión real estos recordatorios también llegarían por correo o WhatsApp.</p>
          </div>
        </div>
      </div>

      <div class="fila entre"><h2>Mis hijas e hijos</h2></div>
      ${menores.length ? `<div class="rejilla dos" style="margin-top:12px">${resumen.map(({ m, av, logros }) => { const e = av.etapa; const sem = av.programa[av.semanaActiva - 1]; return `
        <div class="tarjeta etapa-tarjeta" style="--color-etapa:${e.color}">
          <div class="fila entre"><div class="fila"><span class="avatar" style="width:42px;height:42px;font-size:1rem;background:${e.color}">${escapar(m.nombre[0])}</span><div><strong>${escapar(m.nombre)}</strong><br><span class="chico suave">${escapar(edadTexto(m))} · ${e.icono} ${escapar(e.nombre)}</span></div></div>
            ${av.terminado ? '<span class="etiqueta ok">Programa completado</span>' : av.lineaBase ? `<span class="etiqueta aviso">Semana ${av.semanaActiva} activa</span>` : '<span class="etiqueta gris">Falta línea base</span>'}</div>
          ${fueraDeRango(m) ? '<p class="chico" style="color:var(--aviso);margin-top:8px">Ya rebasó los 6 años: fuera del rango del programa.</p>' : ''}
          <div class="progreso" style="margin:14px 0 6px"><span style="width:${av.porcentaje}%"></span></div>
          <div class="fila entre"><p class="chico suave" style="margin:0">${av.completadas} de ${av.total} semanas · ${av.porcentaje}%</p><span class="chico">🏅 ${logros} logros</span></div>
          ${av.terminado ? '<p class="chico" style="margin-top:8px">🎉 Terminaron las 12 semanas de esta etapa.</p>' : av.lineaBase ? `<p class="chico" style="margin-top:8px"><strong>Esta semana:</strong> ${escapar(sem.actividad)}${av.siguiente ? `<br><span class="suave">Sigue: semana ${av.siguiente}, «${escapar(av.programa[av.siguiente - 1].titulo)}»</span>` : ''}</p>` : '<p class="chico" style="margin-top:8px">Completa la línea base (cinco datos) para iniciar la semana 1.</p>'}
          <div class="acciones" style="margin-top:10px"><button class="boton primario chico" data-abrir="${m.id}" type="button">${av.terminado ? 'Ver programa' : av.lineaBase ? 'Continuar semana ' + av.semanaActiva : 'Completar línea base'}</button><button class="boton fantasma chico" data-perfil="${m.id}" type="button">Ver perfil</button></div>
        </div>`; }).join('')}</div>` : estadoVacio('🧒', 'Aún no hay perfiles de menores. Agrega el primero para empezar el programa.', '<button class="boton primario" id="btn-nuevo-menor-2" type="button">Agregar a mi primer menor</button>')}

      <div class="tarjeta" style="margin-top:24px"><h3>Documentos de la familia</h3>${docs.length ? `<ul class="lista compacta">${docs.map((d) => `<li><span class="punto"></span><div class="cuerpo"><strong>${escapar(d.nombre)}</strong><br><span class="chico suave">${escapar(d.tipo)} · ${fechaBonita(d.fecha)}</span></div></li>`).join('')}</ul>` : estadoVacio('📄', 'Sin documentos todavía.')}</div>`;

    $$('[data-abrir]').forEach((b) => b.addEventListener('click', () => pintarMenor(b.dataset.abrir, 'programa')));
    $$('[data-perfil]').forEach((b) => b.addEventListener('click', () => pintarMenor(b.dataset.perfil, 'perfil')));
    $$('[data-retomar]').forEach((b) => b.addEventListener('click', () => pintarMenor(b.dataset.retomar, b.dataset.seccion === 'base' ? 'base' : b.dataset.seccion === 'cierre' ? 'cierre' : b.dataset.seccion === 'reco' ? 'perfil' : 'programa')));
    [$('#btn-nuevo-menor'), $('#btn-nuevo-menor-2')].filter(Boolean).forEach((b) => b.addEventListener('click', nuevoMenor));
    $('#btn-editar-cuenta').addEventListener('click', editarCuenta);
    bienvenida(menores);
  }

  async function editarCuenta() {
    const v = await ventana({ titulo: 'Mi cuenta', html: `<form novalidate>
      <div class="campo"><label for="cu-nombre">Nombre</label><input id="cu-nombre" name="nombre" value="${escapar(perfil.nombre)}"></div>
      <div class="dos-columnas"><div class="campo"><label for="cu-correo">Correo</label><input id="cu-correo" name="correo" value="${escapar(perfil.correo)}"></div><div class="campo"><label for="cu-tel">Teléfono</label><input id="cu-tel" name="telefono" value="${escapar(perfil.telefono || '')}"></div></div>
      <p class="chico suave">Consentimiento aceptado el ${fechaBonita((perfil.consentimiento || {}).fecha) || '—'} (versión ${escapar((perfil.consentimiento || {}).version || 'ejemplo')}). <a href="privacidad.html" target="_blank">Ver aviso</a>.</p></form>`, botones: [{ texto: 'Cancelar', clase: 'secundario', valor: null }, { texto: 'Guardar', clase: 'primario', valor: 'ok' }] });
    if (v !== 'ok') return; const d = ultimaVentana.campos;
    if (!d.nombre) { aviso('El nombre es necesario', 'error'); return; }
    Object.assign(perfil, api.actualizar('perfiles', perfil.id, { nombre: d.nombre, correo: d.correo, telefono: d.telefono }));
    aviso('Cuenta actualizada', 'ok'); pintarPanel();
  }

  // Alta / edición de un menor: nombre, fecha de nacimiento (o fecha probable de parto), objetivo y consentimiento.
  function formularioMenor(m = {}) {
    const enCamino = m.id ? !m.fecha_nacimiento : false;
    return `<form id="form-menor" novalidate>
      <div class="campo"><label for="nm-nombre">Nombre o apodo</label><input id="nm-nombre" name="nombre" required value="${escapar(m.nombre || '')}" placeholder="Como le dicen en casa"></div>
      <div class="campo"><label>¿Ya nació?</label><div class="segmentos" id="seg-nacido">
        <label class="${!enCamino ? 'elegida' : ''}"><input type="radio" name="nacido" value="si" ${!enCamino ? 'checked' : ''}> Sí</label>
        <label class="${enCamino ? 'elegida' : ''}"><input type="radio" name="nacido" value="no" ${enCamino ? 'checked' : ''}> Todavía no (embarazo)</label></div></div>
      <div class="campo" id="campo-fn" ${enCamino ? 'style="display:none"' : ''}><label for="nm-fecha">Fecha de nacimiento</label><input id="nm-fecha" name="fecha_nacimiento" type="date" max="${hoyISO()}" value="${escapar(m.fecha_nacimiento || '')}"><span class="ayuda">Con la fecha calculamos la etapa: 0–6 meses, 6–12 meses, 1–3 años o 3–6 años.</span></div>
      <div class="campo" id="campo-fp" ${enCamino ? '' : 'style="display:none"'}><label for="nm-fpp">Fecha probable de parto</label><input id="nm-fpp" name="fecha_probable_parto" type="date" value="${escapar(m.fecha_probable_parto || '')}"><span class="ayuda">Ruta complementaria de embarazo y preparación familiar.</span></div>
      <div class="campo"><label for="nm-obj">Un objetivo para empezar (opcional)</label><input id="nm-obj" name="objetivo" placeholder="Por ejemplo: que tome agua en lugar de jugo" value=""></div>
      ${m.id ? '' : `<div class="campo casilla"><input id="nm-consent" name="consentimiento" type="checkbox"><label for="nm-consent">Confirmo que soy madre, padre, tutor o tutora de este menor y autorizo el uso de su información dentro del programa (<a href="privacidad.html" target="_blank">aviso de privacidad</a> de ejemplo).</label></div>`}
      <p class="chico suave">No pedimos datos sensibles (diagnósticos, CURP, fotos) en este primer paso.</p>
    </form>`;
  }
  function activarFormularioMenor() {
    const seg = $('#seg-nacido'); if (!seg) return;
    seg.addEventListener('change', () => {
      const no = $('input[value="no"]', seg).checked;
      $$('label', seg).forEach((l) => l.classList.toggle('elegida', l.querySelector('input').checked));
      $('#campo-fn').style.display = no ? 'none' : ''; $('#campo-fp').style.display = no ? '' : 'none';
    });
  }
  function leerMenor(d, esNuevo) {
    if (!d.nombre) return aviso('Escribe el nombre o apodo', 'error');
    const enCamino = d.nacido === 'no';
    if (!enCamino && !d.fecha_nacimiento) return aviso('Escribe la fecha de nacimiento', 'error');
    if (enCamino && !d.fecha_probable_parto) return aviso('Escribe la fecha probable de parto', 'error');
    if (esNuevo && !d.consentimiento) return aviso('Necesitamos tu confirmación como madre, padre o tutor', 'error');
    return { nombre: d.nombre, fecha_nacimiento: enCamino ? null : d.fecha_nacimiento, fecha_probable_parto: enCamino ? d.fecha_probable_parto : null };
  }

  async function nuevoMenor() {
    const abierta = ventana({ titulo: 'Nuevo perfil de menor', html: formularioMenor(), botones: [{ texto: 'Cancelar', clase: 'secundario', valor: null }, { texto: 'Crear perfil', clase: 'primario', valor: 'ok' }] });
    activarFormularioMenor();
    const v = await abierta;
    if (v !== 'ok') return;
    const datos = leerMenor(ultimaVentana.campos, true); if (!datos) return;
    const m = api.insertar('menores', { responsable_id: perfil.id, ...datos, objetivos: ultimaVentana.campos.objetivo ? [ultimaVentana.campos.objetivo] : [], consentimiento: { fecha: hoyISO(), version: 'ejemplo-1' } });
    registrarActividad(perfil.organizacion_id, `${perfil.nombre} agregó el perfil de ${m.nombre}.`);
    const e = etapaDe(m);
    aviso(`Perfil creado · etapa ${e.nombre}`, 'ok');
    pintarMenor(m.id, 'base');
  }

  // ---------- Formulario de indicadores (línea base, check-in y cierre) ----------
  function camposIndicadores(e, valores = {}, prefijo = 'i') {
    return `<div class="dos-columnas">${e.indicadores.map((ind) => `<div class="campo"><label for="${prefijo}-${ind.clave}">${escapar(ind.etiqueta)} <span class="suave">(${escapar(ind.unidad)})</span></label><input id="${prefijo}-${ind.clave}" name="${ind.clave}" type="number" min="${ind.min}" max="${ind.max}" step="${ind.paso}" required value="${valores[ind.clave] ?? ''}" placeholder="${ind.meta.tipo === 'min' ? 'meta: al menos ' : 'meta: máximo '}${ind.meta.valor}"></div>`).join('')}</div>`;
  }
  function leerIndicadores(e, datos) { const v = {}; e.indicadores.forEach((ind) => { v[ind.clave] = Number(datos[ind.clave]); }); return v; }

  // ---------- Perfil del menor + programa ----------
  function pintarMenor(menorId, seccion = 'programa', semanaAbierta = null) {
    const m = api.obtener('menores', menorId);
    if (!m || m.responsable_id !== perfil.id) { aviso('Ese perfil no pertenece a tu familia', 'error'); return pintarPanel(); }
    const av = avanceMenor(m.id);
    const e = av.etapa;
    const programa = av.programa;
    const registros = checkinsDe(m.id);
    const logros = logrosMenor(m.id);
    const recos = api.listar('recomendaciones', { menor_id: m.id, estado: 'validada' });
    const mediciones = api.listar('mediciones', { menor_id: m.id }).sort((a, b) => b.fecha.localeCompare(a.fecha));
    const profesional = (id) => (api.obtener('perfiles', id) || {}).nombre || 'Profesional';
    vistaPanel.classList.add('oculto'); vistaMenor.classList.remove('oculto');
    history.replaceState(null, '', `familia.html#menor=${m.id}`);
    const semana = semanaAbierta || av.semanaActiva;
    const sem = programa[semana - 1];
    const hecha = av.hechas.includes(semana);
    const bloqueada = semana > av.semanaActiva || !av.lineaBase;
    const registro = registros.find((r) => r.semana === semana);

    vistaMenor.innerHTML = `
      <p><a href="#" id="volver-panel">← Volver al panel</a></p>
      <div class="rejilla" style="grid-template-columns:minmax(0,1fr);gap:20px">
        <div class="tarjeta etapa-tarjeta" style="--color-etapa:${e.color}">
          <div class="fila entre">
            <div class="fila"><span class="avatar" style="width:52px;height:52px;font-size:1.3rem;background:${e.color}">${escapar(m.nombre[0])}</span><div><h2 style="margin:0">${escapar(m.nombre)}</h2><span class="chico suave">${escapar(edadTexto(m))} · ${e.icono} ${escapar(e.nombre)}${e.complementaria ? ' (ruta complementaria)' : ''}</span></div></div>
            <div class="acciones"><a class="boton chico secundario" href="reporte.html?menor=${m.id}">Exportar reporte</a><button class="boton chico fantasma" id="btn-editar-menor" type="button">Editar datos</button></div>
          </div>
          <div class="rejilla dos" style="margin-top:16px">
            <div><h4 style="margin-top:0">Objetivos de la familia</h4>${m.objetivos.length ? `<ul class="lista compacta">${m.objetivos.map((o) => `<li><span class="punto"></span><div class="cuerpo chico">${escapar(o)}</div></li>`).join('')}</ul>` : '<p class="chico suave">Sin objetivos escritos todavía.</p>'}<button class="boton chico fantasma" id="btn-objetivo-menor" type="button">+ Agregar objetivo</button></div>
            <div><h4 style="margin-top:0">Progreso en la etapa</h4><div class="progreso acento" style="margin:8px 0"><span style="width:${av.porcentaje}%"></span></div><p class="chico suave">${av.completadas} de ${av.total} semanas (${av.porcentaje}%)${av.terminado ? ' · ¡completo!' : ` · activa: semana ${av.semanaActiva}${av.siguiente ? ` · sigue: ${av.siguiente}` : ''}`}</p>
              <div class="insignias" style="grid-template-columns:repeat(auto-fill,minmax(96px,1fr))">${logros.map((l) => `<div class="insignia ${l.ganada ? 'ganada' : ''}" title="${escapar(l.texto)}"><div class="icono">${l.icono}</div><strong>${escapar(l.nombre)}</strong></div>`).join('')}</div></div>
          </div>
        </div>

        ${recos.length ? `<div class="tarjeta calida" id="sec-reco"><h3>Recomendaciones de tu profesional</h3><p class="chico suave">Validadas por una persona profesional antes de llegar a ti.</p><ul class="lista compacta">${recos.map((r) => `<li><span class="punto pendiente"></span><div class="cuerpo"><strong>${escapar(r.texto)}</strong><br><span class="chico suave">${escapar(r.motivo)} · validada por ${escapar(profesional(r.validada_por))} · ${fechaBonita(r.fecha)}</span></div></li>`).join('')}</ul></div>` : ''}

        <div class="tarjeta" id="sec-base">
          <div class="fila entre"><div><span class="etiqueta ${av.lineaBase ? 'ok' : 'aviso'}">${av.lineaBase ? 'Línea base registrada' : 'Paso 1 · Línea base'}</span><h3 style="margin-top:8px">Evaluación inicial: cómo van hoy</h3></div>${av.lineaBase ? `<span class="etiqueta reportado">Reportado por la familia · ${fechaBonita(av.lineaBase.fecha)}</span>` : ''}</div>
          ${av.lineaBase ? `<p class="chico suave">Es el «antes». Al terminar las 12 semanas registrarán el «después» y verán el cambio.</p>${barras(e.indicadores.map((ind) => ({ etiqueta: ind.etiqueta.split(' (')[0], valor: cumplimiento(ind, av.lineaBase.valores[ind.clave]) * 100, texto: `${av.lineaBase.valores[ind.clave]} ${ind.unidad}` })))}<p class="chico suave" style="margin:10px 0 0">Puntaje inicial: <strong>${puntaje(e, av.lineaBase.valores)}</strong> de 100 (fórmula de ejemplo para la etapa ${escapar(e.corto)}).</p>`
          : `<p class="chico">Cinco datos de una semana normal. No hay respuestas buenas ni malas: es el punto de partida para ver el cambio.</p><form id="form-base" novalidate>${camposIndicadores(e, {}, 'b')}<div class="acciones"><button class="boton primario" type="submit">Guardar línea base e iniciar la semana 1</button></div></form>`}
        </div>

        <div class="tarjeta">
          <div class="fila entre"><h3>Programa ${escapar(e.nombre)} · 12 semanas</h3><span class="etiqueta ejemplo">Contenido de ejemplo</span></div>
          <p class="chico suave">Verde = completada · naranja = activa · gris = aún no disponible. Puedes abrir cualquier semana completada para repasarla o actualizar su check-in.</p>
          <div class="semanas" style="margin-top:12px">${programa.map((s) => { const h = av.hechas.includes(s.numero); const act = s.numero === av.semanaActiva && !h && av.lineaBase; const bl = s.numero > av.semanaActiva || !av.lineaBase; return `
            <button class="semana ${h ? 'hecha' : ''} ${act ? 'activa' : ''} ${bl ? 'bloqueada' : ''} ${s.numero === semana ? 'elegida' : ''}" data-semana="${s.numero}" type="button">
              <small>Semana ${s.numero} ${h ? '✅' : act ? '▶' : bl ? '🔒' : ''}</small><strong>${escapar(s.titulo)}</strong></button>`; }).join('')}</div>
        </div>

        <div class="tarjeta" id="detalle-semana">
          <div class="fila entre"><div><span class="etiqueta ${hecha ? 'ok' : bloqueada ? 'gris' : 'aviso'}">${hecha ? 'Completada' : bloqueada ? (av.lineaBase ? 'Aún no disponible' : 'Primero la línea base') : 'Semana activa'}</span><h3 style="margin-top:8px">Semana ${semana}: ${escapar(sem.titulo)}</h3></div></div>
          <div class="anatomia" style="margin-top:8px">
            <div class="pieza"><strong>🎯 Objetivo</strong><span class="chico">${escapar(sem.objetivo)}</span></div>
            <div class="pieza"><strong>🏠 Actividad en casa</strong><span class="chico">${escapar(sem.actividad)}</span></div>
            <div class="pieza"><strong>🧺 Materiales</strong><span class="chico">${escapar(sem.materiales)}</span></div>
          </div>
          <h4>📖 Microcontenido</h4>
          <p>${escapar(sem.contenido)}</p>
          ${bloqueada ? `<p class="chico suave">${av.lineaBase ? `Completa primero la semana ${av.semanaActiva} para desbloquear esta.` : 'Guarda la línea base para empezar con la semana 1.'}</p>` : `
          <h4 style="margin-top:18px">✅ Check-in de la semana (2–3 minutos)</h4>
          <p class="chico suave">Cómo le fue a ${escapar(m.nombre)} esta semana. Los indicadores y las metas son los de la etapa ${escapar(e.corto)}.</p>
          <form id="form-checkin" novalidate>
            ${camposIndicadores(e, registro ? registro.valores : {}, 'c')}
            <div class="campo"><label>¿Realizaron la actividad de la semana?</label><div class="segmentos" id="seg-act">${[['si', 'Sí'], ['parcial', 'En parte'], ['no', 'No']].map(([v, t]) => `<label class="${(registro ? registro.actividad : 'si') === v ? 'elegida' : ''}"><input type="radio" name="actividad" value="${v}" ${(registro ? registro.actividad : 'si') === v ? 'checked' : ''}> ${t}</label>`).join('')}</div></div>
            <div class="campo"><label for="c-respuesta">${escapar(sem.checkin)}</label><input id="c-respuesta" name="respuesta" value="${escapar(registro ? registro.respuesta || '' : '')}" placeholder="Respuesta breve (opcional)"></div>
            <div class="acciones">
              ${hecha ? `<button class="boton secundario" type="submit">Actualizar check-in</button><span class="chico suave">Semana completada el ${fechaBonita((api.listar('avance_semanal', { menor_id: m.id, semana })[0] || {}).fecha)}</span>` : `<button class="boton primario" type="submit">Guardar check-in y completar semana</button>`}
            </div>
          </form>`}
        </div>

        ${av.terminado ? `<div class="tarjeta ${av.cierre ? '' : 'calida'}" id="sec-cierre">
          <div class="fila entre"><div><span class="etiqueta ${av.cierre ? 'ok' : 'aviso'}">${av.cierre ? 'Cierre registrado' : 'Último paso · Evaluación de cierre'}</span><h3 style="margin-top:8px">Antes y después</h3></div>${av.cierre ? `<span class="etiqueta reportado">Reportado por la familia · ${fechaBonita(av.cierre.fecha)}</span>` : ''}</div>
          ${av.cierre ? antesDespues(e, av.lineaBase, av.cierre) : `<p class="chico">Terminaron las 12 semanas. Registren los mismos cinco datos de hoy para ver el cambio frente a la línea base.</p><form id="form-cierre" novalidate>${camposIndicadores(e, {}, 'z')}<div class="acciones"><button class="boton primario" type="submit">Guardar evaluación de cierre</button></div></form>`}
        </div>` : ''}

        <div class="tarjeta">
          <div class="fila entre"><h3>Mediciones</h3><button class="boton chico secundario" id="btn-medicion" type="button">+ Reportar medición</button></div>
          <p class="chico suave">Las mediciones <span class="etiqueta verificado">verificadas</span> las registra una persona profesional; las <span class="etiqueta reportado">reportadas</span> las captura la familia y no sustituyen una medición profesional.</p>
          ${mediciones.length ? `<div class="tabla-envoltura"><table class="tabla"><thead><tr><th>Fecha</th><th>Medición</th><th>Valor</th><th>Origen</th></tr></thead><tbody>${mediciones.map((x) => `<tr><td>${fechaBonita(x.fecha)}</td><td>${escapar(x.tipo)}</td><td>${x.valor} ${escapar(x.unidad)}</td><td>${x.origen === 'profesional' ? `<span class="etiqueta verificado">Verificada · ${escapar(profesional(x.verificado_por))}</span>` : '<span class="etiqueta reportado">Reportada por la familia</span>'}</td></tr>`).join('')}</tbody></table></div>` : estadoVacio('📏', 'Sin mediciones todavía.')}
        </div>

        <div class="tarjeta">
          <h3>Evolución de hábitos</h3>
          ${registros.length ? grafica(e, registros, av.lineaBase) : estadoVacio('📈', 'La gráfica aparecerá cuando guarden el primer check-in semanal.')}
        </div>
      </div>`;

    $('#volver-panel').addEventListener('click', (ev) => { ev.preventDefault(); pintarPanel(); });
    $$('[data-semana]').forEach((b) => b.addEventListener('click', () => pintarMenor(m.id, 'programa', Number(b.dataset.semana))));
    $('#seg-act')?.addEventListener('change', () => $$('#seg-act label').forEach((l) => l.classList.toggle('elegida', l.querySelector('input').checked)));

    // Línea base
    $('#form-base')?.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (!validar(ev.target)) { aviso('Completa los cinco datos', 'error'); return; }
      const valores = leerIndicadores(e, datosFormulario(ev.target));
      api.insertar('evaluaciones', { menor_id: m.id, tipo: 'inicial', fecha: hoyISO(), valores, origen: 'familia' });
      registrarActividad(perfil.organizacion_id, `${perfil.nombre} registró la línea base de ${m.nombre}.`);
      api.listar('recomendaciones', { menor_id: m.id, estado: 'pendiente' }).filter((r) => /línea base/i.test(r.texto)).forEach((r) => api.actualizar('recomendaciones', r.id, { estado: 'descartada' }));
      await ventana({ titulo: '¡Línea base lista!', html: `${guia(`Ya tienen su punto de partida: <strong>${puntaje(e, valores)} de 100</strong>. Ahora sí, la semana 1 de ${escapar(m.nombre)} está abierta.`)}`, botones: [{ texto: 'Ir a la semana 1', clase: 'primario', valor: true }] });
      pintarMenor(m.id, 'programa', 1);
    });

    // Check-in semanal
    $('#form-checkin')?.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (!validar(ev.target)) { aviso('Completa todos los indicadores del check-in', 'error'); return; }
      const d = datosFormulario(ev.target);
      const fila = { menor_id: m.id, semana, valores: leerIndicadores(e, d), actividad: d.actividad || 'si', respuesta: d.respuesta || '', origen: 'familia', fecha: hoyISO() };
      if (registro) api.actualizar('registros_habitos', registro.id, fila); else api.insertar('registros_habitos', fila);
      if (!hecha) {
        const antes = logrosMenor(m.id).filter((l) => l.ganada).map((l) => l.id);
        api.insertar('avance_semanal', { menor_id: m.id, semana, completada: true, fecha: hoyISO() });
        registrarActividad(perfil.organizacion_id, `${perfil.nombre} completó la semana ${semana} de ${m.nombre}.`);
        const nuevo = avanceMenor(m.id);
        const nuevos = logrosMenor(m.id).filter((l) => l.ganada && !antes.includes(l.id));
        await ventana({ titulo: `¡Semana ${semana} completada!`, html: `<div class="centro"><div class="icono sol" style="margin:0 auto 10px;width:64px;height:64px;font-size:32px">🎉</div><p>${escapar(m.nombre)} lleva <strong>${nuevo.completadas} de ${nuevo.total}</strong> semanas. Puntaje de esta semana: <strong>${puntaje(e, fila.valores)}</strong> de 100.</p><div class="progreso acento"><span style="width:${nuevo.porcentaje}%"></span></div>
          ${nuevos.length ? `<div class="insignias" style="margin-top:14px;grid-template-columns:repeat(auto-fit,minmax(110px,1fr))">${nuevos.map((l) => `<div class="insignia ganada"><div class="icono">${l.icono}</div><strong>${escapar(l.nombre)}</strong><small>${escapar(l.texto)}</small></div>`).join('')}</div>` : ''}
          ${nuevo.terminado ? '<p class="chico" style="margin-top:10px">¡Terminaron el programa de esta etapa! 🏅 Falta la evaluación de cierre para ver el antes y después.</p>' : `<p class="chico suave" style="margin-top:10px">Siguiente: semana ${nuevo.semanaActiva}, «${escapar(programa[nuevo.semanaActiva - 1].titulo)}».</p>`}</div>`, botones: [{ texto: 'Continuar', clase: 'primario', valor: true }] });
        pintarMenor(m.id, nuevo.terminado ? 'cierre' : 'programa');
      } else { aviso('Check-in actualizado', 'ok'); pintarMenor(m.id, 'programa', semana); }
    });

    // Evaluación de cierre
    $('#form-cierre')?.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (!validar(ev.target)) { aviso('Completa los cinco datos', 'error'); return; }
      const valores = leerIndicadores(e, datosFormulario(ev.target));
      api.insertar('evaluaciones', { menor_id: m.id, tipo: 'cierre', fecha: hoyISO(), valores, origen: 'familia' });
      registrarActividad(perfil.organizacion_id, `${perfil.nombre} registró la evaluación de cierre de ${m.nombre}.`);
      aviso('Evaluación de cierre guardada', 'ok'); pintarMenor(m.id, 'cierre');
    });

    $('#btn-objetivo-menor').addEventListener('click', async () => {
      const v = await ventana({ titulo: `Objetivo para ${m.nombre}`, html: `<div class="campo"><label for="om-texto">¿Qué les gustaría lograr?</label><input id="om-texto" placeholder="Por ejemplo: dormir antes de las 9"></div>`, botones: [{ texto: 'Cancelar', clase: 'secundario', valor: null }, { texto: 'Agregar', clase: 'primario', valor: 'ok' }] });
      if (v === 'ok') { const t = (ultimaVentana.campos['om-texto'] || '').trim(); if (!t) { aviso('Escribe el objetivo', 'error'); return; } api.actualizar('menores', m.id, { objetivos: [...m.objetivos, t] }); aviso('Objetivo agregado', 'ok'); pintarMenor(m.id, 'perfil', semana); }
    });
    $('#btn-editar-menor').addEventListener('click', async () => {
      const abierta = ventana({ titulo: 'Editar datos', html: formularioMenor(m), botones: [{ texto: 'Cancelar', clase: 'secundario', valor: null }, { texto: 'Guardar', clase: 'primario', valor: 'ok' }] });
      activarFormularioMenor();
      const v = await abierta;
      if (v !== 'ok') return;
      const datos = leerMenor(ultimaVentana.campos, false); if (!datos) return;
      api.actualizar('menores', m.id, datos);
      const nuevaEtapa = etapaDe(api.obtener('menores', m.id));
      if (nuevaEtapa.id !== e.id) aviso(`Datos guardados · la etapa cambió a ${nuevaEtapa.nombre}`, 'ok'); else aviso('Datos guardados', 'ok');
      pintarMenor(m.id, 'perfil');
    });
    $('#btn-medicion').addEventListener('click', async () => {
      const v = await ventana({ titulo: 'Reportar medición', html: `<p class="chico suave">Se guardará como <strong>reportada por la familia</strong>. Una persona profesional puede registrar la medición verificada en consulta.</p>
        <div class="dos-columnas"><div class="campo"><label for="me-tipo">Medición</label><select id="me-tipo" name="tipo"><option>Peso</option><option>Talla</option><option>Perímetro cefálico</option></select></div><div class="campo"><label for="me-valor">Valor</label><input id="me-valor" name="valor" type="number" step="0.1" min="0"></div></div>
        <div class="campo"><label for="me-fecha">Fecha</label><input id="me-fecha" name="fecha" type="date" value="${hoyISO()}"></div>`, botones: [{ texto: 'Cancelar', clase: 'secundario', valor: null }, { texto: 'Guardar', clase: 'primario', valor: 'ok' }] });
      if (v !== 'ok') return; const d = ultimaVentana.campos;
      if (!d.valor) { aviso('Escribe el valor', 'error'); return; }
      api.insertar('mediciones', { menor_id: m.id, tipo: d.tipo, valor: Number(d.valor), unidad: d.tipo === 'Peso' ? 'kg' : 'cm', fecha: d.fecha || hoyISO(), origen: 'familia', verificado_por: null });
      aviso('Medición reportada', 'ok'); pintarMenor(m.id, 'perfil', semana);
    });

    const destino = { base: '#sec-base', cierre: '#sec-cierre', programa: '#detalle-semana' }[seccion];
    if (destino && $(destino)) $(destino).scrollIntoView({ behavior: 'smooth', block: 'start' }); else window.scrollTo({ top: 0 });
  }

  // Antes / después por indicador
  function antesDespues(e, inicial, final) {
    const pi = puntaje(e, inicial.valores); const pf = puntaje(e, final.valores);
    return `<div class="cifras" style="margin-bottom:14px"><div class="cifra"><strong>${pi}</strong><span>puntaje inicial</span></div><div class="cifra"><strong>${pf}</strong><span>puntaje de cierre</span></div><div class="cifra"><strong style="color:${pf >= pi ? 'var(--ok)' : 'var(--error)'}">${pf >= pi ? '+' : ''}${pf - pi}</strong><span>cambio</span></div></div>
      <div class="barras">${e.indicadores.map((ind) => `<div class="barra doble"><span>${escapar(ind.etiqueta.split(' (')[0])}</span><div class="pista"><span class="antes" style="width:${Math.round(cumplimiento(ind, inicial.valores[ind.clave]) * 100)}%"></span><span class="despues" style="width:${Math.round(cumplimiento(ind, final.valores[ind.clave]) * 100)}%"></span></div><span class="valor chico">${inicial.valores[ind.clave]} → ${final.valores[ind.clave]} ${escapar(ind.unidad)}</span></div>`).join('')}</div>
      <p class="chico suave" style="margin:10px 0 0"><span style="display:inline-block;width:10px;height:10px;background:#C9CFD6;border-radius:3px"></span> antes · <span style="display:inline-block;width:10px;height:10px;background:var(--acento);border-radius:3px"></span> después · las barras muestran el cumplimiento de la meta de cada indicador. Fórmula de ejemplo.</p>`;
  }

  // Gráfica sencilla (SVG) del puntaje por semana, con la línea base como punto 0
  function grafica(e, registros, base) {
    const puntos0 = base ? [{ semana: 0, valores: base.valores, etiqueta: 'Base' }] : [];
    const serie = [...puntos0, ...registros.map((r) => ({ semana: r.semana, valores: r.valores, etiqueta: `Sem ${r.semana}` }))];
    const W = 640, H = 220, izq = 40, der = 16, arr = 20, aba = 36;
    const n = Math.max(serie.length, 2);
    const x = (i) => izq + (i * (W - izq - der)) / (n - 1);
    const y = (v) => arr + (1 - v / 100) * (H - arr - aba);
    const puntos = serie.map((r, i) => [x(i), y(puntaje(e, r.valores)), r]);
    const linea = puntos.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
    return `<svg class="grafica" viewBox="0 0 ${W} ${H}" role="img" aria-label="Puntaje de hábitos por semana">
      ${[0, 25, 50, 75, 100].map((v) => `<line x1="${izq}" x2="${W - der}" y1="${y(v)}" y2="${y(v)}" stroke="#E9E3F3"/><text x="${izq - 6}" y="${y(v) + 4}" font-size="11" text-anchor="end" fill="#6A6480">${v}</text>`).join('')}
      <path d="${linea}" fill="none" stroke="#6B2FBF" stroke-width="3" stroke-linejoin="round"/>
      ${puntos.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="${p[2].semana === 0 ? '#C9CFD6' : '#F28C6B'}" stroke="#fff" stroke-width="2"><title>${p[2].etiqueta}: ${puntaje(e, p[2].valores)} puntos</title></circle><text x="${p[0]}" y="${H - 12}" font-size="12" text-anchor="middle" fill="#2B2440">${p[2].etiqueta}</text><text x="${p[0]}" y="${p[1] - 12}" font-size="12" text-anchor="middle" font-weight="700" fill="#4A1D8C">${puntaje(e, p[2].valores)}</text>`).join('')}
    </svg>
    <p class="chico suave" style="margin:8px 0 0">Puntaje de 0 a 100 según el cumplimiento de las metas de la etapa ${escapar(e.corto)} (${e.indicadores.map((i) => i.etiqueta.split(' (')[0].toLowerCase()).join(', ')}). Fórmula de ejemplo; cada etapa pesa sus indicadores de forma distinta.</p>
    <div class="tabla-envoltura" style="margin-top:12px"><table class="tabla"><thead><tr><th>Semana</th>${e.indicadores.map((i) => `<th>${escapar(i.etiqueta.split(' (')[0])} (${escapar(i.unidad)})</th>`).join('')}<th>Actividad</th><th>Puntaje</th></tr></thead>
    <tbody>${registros.map((r) => `<tr><td>${r.semana}</td>${e.indicadores.map((i) => `<td>${r.valores[i.clave] ?? '—'}</td>`).join('')}<td>${{ si: 'Sí', parcial: 'En parte', no: 'No' }[r.actividad] || '—'}</td><td><strong>${puntaje(e, r.valores)}</strong></td></tr>`).join('')}</tbody></table></div>`;
  }

  // Entrada por URL #menor=
  const h = location.hash.match(/menor=([^&]+)/);
  if (h) pintarMenor(h[1], 'programa'); else pintarPanel();
}
