// Área familiar: panel del responsable, perfil de cada menor y programa Infancia Sana (12 semanas).
import { api, fechaBonita, hoyISO, registrarActividad, avanceMenor } from './api.js';
import { requerir } from './auth.js';
import { $, $$, escapar, montarEncabezado, montarPie, aviso, ventana, ultimaVentana, validar, datosFormulario, estadoVacio } from './ui.js';

const sesion = requerir('familia');
if (sesion) {
  montarEncabezado('espacio');
  montarPie();
  const perfil = sesion.perfil;
  const programa = api.listar('programa_semanas').sort((a, b) => a.numero - b.numero);
  const vistaPanel = $('#vista-panel');
  const vistaMenor = $('#vista-menor');

  // ---------- Panel del responsable ----------
  function pintarPanel() {
    vistaPanel.classList.remove('oculto'); vistaMenor.classList.add('oculto');
    history.replaceState(null, '', 'familia.html');
    const menores = api.listar('menores', { responsable_id: perfil.id });
    const recordatorios = api.listar('recordatorios', { perfil_id: perfil.id });
    const docs = api.listar('documentos', { perfil_id: perfil.id });
    const resumen = menores.map((m) => ({ m, av: avanceMenor(m.id) }));
    const pendientesTotal = resumen.reduce((n, r) => n + (r.av.completadas < r.av.total ? 1 : 0), 0);
    const progresoGeneral = resumen.length ? Math.round(resumen.reduce((n, r) => n + r.av.porcentaje, 0) / resumen.length) : 0;
    vistaPanel.innerHTML = `
      <h1>Hola, ${escapar(perfil.nombre.split(' ')[0])}</h1>
      <p class="suave">Este es el panel de tu familia en el programa <strong>Infancia Sana</strong>. <span class="etiqueta ejemplo">Contenido de ejemplo</span></p>
      <div class="cifras" style="margin:18px 0 24px">
        <div class="cifra"><strong>${menores.length}</strong><span>perfiles de menores</span></div>
        <div class="cifra"><strong>${pendientesTotal}</strong><span>con actividad pendiente esta semana</span></div>
        <div class="cifra"><strong>${progresoGeneral}%</strong><span>progreso general</span></div>
        <div class="cifra"><strong>${programa.length}</strong><span>semanas del programa</span></div>
      </div>
      <div class="fila entre"><h2>Mis hijas e hijos</h2><button class="boton secundario chico" id="btn-nuevo-menor" type="button">+ Agregar perfil</button></div>
      ${menores.length ? `<div class="rejilla dos" style="margin-top:12px">${resumen.map(({ m, av }) => { const sem = programa[av.semanaActiva - 1]; const terminado = av.completadas >= av.total; return `
        <div class="tarjeta">
          <div class="fila entre"><div class="fila"><span class="avatar" style="width:40px;height:40px;font-size:1rem">${escapar(m.nombre[0])}</span><div><strong>${escapar(m.nombre)}</strong><br><span class="chico suave">${m.edad} años · ${escapar(m.etapa)}</span></div></div>
            ${terminado ? '<span class="etiqueta ok">Programa completado</span>' : `<span class="etiqueta aviso">Semana ${av.semanaActiva} activa</span>`}</div>
          <div class="progreso" style="margin:14px 0 6px"><span style="width:${av.porcentaje}%"></span></div>
          <p class="chico suave">${av.completadas} de ${av.total} semanas · ${av.porcentaje}%</p>
          ${terminado ? '<p class="chico">🎉 ¡Terminaron las 12 semanas!</p>' : `<p class="chico"><strong>Pendiente:</strong> ${escapar(sem.actividad)}</p>`}
          <div class="acciones"><button class="boton primario chico" data-abrir="${m.id}" type="button">${terminado ? 'Ver programa' : 'Continuar semana ' + av.semanaActiva}</button><button class="boton fantasma chico" data-perfil="${m.id}" type="button">Ver perfil</button></div>
        </div>`; }).join('')}</div>` : estadoVacio('🧒', 'Aún no hay perfiles de menores. Agrega el primero para empezar el programa.', '<button class="boton primario" id="btn-nuevo-menor-2" type="button">Agregar perfil</button>')}
      <div class="rejilla dos" style="margin-top:24px">
        <div class="tarjeta"><h3>Recordatorios</h3>${recordatorios.length ? `<ul class="lista">${recordatorios.map((r) => `<li><span class="punto"></span><div class="cuerpo"><strong>${escapar(r.texto)}</strong><br><span class="chico suave">${escapar(r.cuando)}</span></div></li>`).join('')}</ul>` : estadoVacio('🔔', 'Sin recordatorios.')}</div>
        <div class="tarjeta"><h3>Documentos de la familia</h3>${docs.length ? `<ul class="lista">${docs.map((d) => `<li><span class="punto"></span><div class="cuerpo"><strong>${escapar(d.nombre)}</strong><br><span class="chico suave">${escapar(d.tipo)} · ${fechaBonita(d.fecha)}</span></div></li>`).join('')}</ul>` : estadoVacio('📄', 'Sin documentos todavía.')}</div>
      </div>`;
    $$('[data-abrir]').forEach((b) => b.addEventListener('click', () => pintarMenor(b.dataset.abrir, 'programa')));
    $$('[data-perfil]').forEach((b) => b.addEventListener('click', () => pintarMenor(b.dataset.perfil, 'perfil')));
    [$('#btn-nuevo-menor'), $('#btn-nuevo-menor-2')].filter(Boolean).forEach((b) => b.addEventListener('click', nuevoMenor));
  }

  async function nuevoMenor() {
    const v = await ventana({ titulo: 'Nuevo perfil de menor', html: `
      <form id="form-menor" novalidate>
        <div class="campo"><label for="nm-nombre">Nombre</label><input id="nm-nombre" name="nombre" required></div>
        <div class="dos-columnas">
          <div class="campo"><label for="nm-edad">Edad</label><input id="nm-edad" name="edad" type="number" min="1" max="17" required></div>
          <div class="campo"><label for="nm-etapa">Etapa</label><select id="nm-etapa" name="etapa"><option>Preescolar</option><option>Primaria baja</option><option>Primaria alta</option><option>Secundaria</option></select></div>
        </div>
      </form>`, botones: [{ texto: 'Cancelar', clase: 'secundario', valor: null }, { texto: 'Crear perfil', clase: 'primario', valor: 'ok' }] });
    if (v !== 'ok') return;
    const datos = ultimaVentana.campos;
    if (!datos || !datos.nombre || !datos.edad) { aviso('Faltan el nombre o la edad', 'error'); return; }
    api.insertar('menores', { responsable_id: perfil.id, nombre: datos.nombre, edad: Number(datos.edad), etapa: datos.etapa, objetivos: [] });
    registrarActividad(perfil.organizacion_id, `${perfil.nombre} agregó el perfil de ${datos.nombre}.`);
    aviso('Perfil creado', 'ok'); pintarPanel();
  }

  // ---------- Perfil del menor + programa ----------
  function pintarMenor(menorId, seccion = 'programa', semanaAbierta = null) {
    const m = api.obtener('menores', menorId);
    if (!m || m.responsable_id !== perfil.id) { aviso('Ese perfil no pertenece a tu familia', 'error'); return pintarPanel(); }
    const av = avanceMenor(m.id);
    const registros = api.listar('registros_habitos', { menor_id: m.id }).sort((a, b) => a.semana - b.semana);
    vistaPanel.classList.add('oculto'); vistaMenor.classList.remove('oculto');
    history.replaceState(null, '', `familia.html#menor=${m.id}`);
    const semana = semanaAbierta || av.semanaActiva;
    const sem = programa[semana - 1];
    const hecha = av.hechas.includes(semana);
    const bloqueada = semana > av.semanaActiva;
    const registro = registros.find((r) => r.semana === semana);

    vistaMenor.innerHTML = `
      <p><a href="#" id="volver-panel">← Volver al panel</a></p>
      <div class="rejilla" style="grid-template-columns:1fr;gap:20px">
        <div class="tarjeta">
          <div class="fila entre">
            <div class="fila"><span class="avatar" style="width:48px;height:48px;font-size:1.2rem">${escapar(m.nombre[0])}</span><div><h2 style="margin:0">${escapar(m.nombre)}</h2><span class="chico suave">${m.edad} años · ${escapar(m.etapa)}</span></div></div>
            <div class="acciones"><button class="boton chico secundario" id="btn-editar-menor" type="button">Editar datos</button></div>
          </div>
          <div class="rejilla dos" style="margin-top:16px">
            <div><h4>Objetivos generales</h4>${m.objetivos.length ? `<ul class="lista">${m.objetivos.map((o) => `<li><span class="punto"></span><div class="cuerpo">${escapar(o)}</div></li>`).join('')}</ul>` : '<p class="chico suave">Sin objetivos escritos todavía.</p>'}<button class="boton chico fantasma" id="btn-objetivo-menor" type="button">+ Agregar objetivo</button></div>
            <div><h4>Progreso en el programa</h4><div class="progreso acento" style="margin:8px 0"><span style="width:${av.porcentaje}%"></span></div><p class="chico suave">${av.completadas} de ${av.total} semanas completadas (${av.porcentaje}%)</p></div>
          </div>
        </div>

        <div class="tarjeta">
          <div class="fila entre"><h3>Programa Infancia Sana · 12 semanas</h3><span class="etiqueta ejemplo">Contenido de ejemplo</span></div>
          <div class="semanas" style="margin-top:12px">${programa.map((s) => { const h = av.hechas.includes(s.numero); const act = s.numero === av.semanaActiva && !h; const bl = s.numero > av.semanaActiva; return `
            <button class="semana ${h ? 'hecha' : ''} ${act ? 'activa' : ''} ${bl ? 'bloqueada' : ''} ${s.numero === semana ? 'elegida' : ''}" data-semana="${s.numero}" type="button" ${s.numero === semana ? 'style="outline:2px solid var(--primario)"' : ''}>
              <small>Semana ${s.numero} ${h ? '✅' : act ? '▶' : bl ? '🔒' : ''}</small><strong>${escapar(s.titulo)}</strong></button>`; }).join('')}</div>
        </div>

        <div class="tarjeta" id="detalle-semana">
          <div class="fila entre"><div><span class="etiqueta ${hecha ? 'ok' : bloqueada ? 'gris' : 'aviso'}">${hecha ? 'Completada' : bloqueada ? 'Aún no disponible' : 'Semana activa'}</span><h3 style="margin-top:8px">Semana ${semana}: ${escapar(sem.titulo)}</h3></div></div>
          <h4>Contenido educativo</h4>
          <p>${escapar(sem.contenido)}</p>
          <h4>Actividad de la semana</h4>
          <p>${escapar(sem.actividad)}</p>
          ${bloqueada ? `<p class="chico suave">Completa primero la semana ${av.semanaActiva} para desbloquear esta.</p>` : ''}
          ${!bloqueada ? `
          <h4 style="margin-top:18px">Registro semanal de hábitos</h4>
          <p class="chico suave">Un registro breve de cómo le fue a ${escapar(m.nombre)} esta semana. Sirve para ver el avance en la gráfica.</p>
          <form id="form-habitos" novalidate>
            <div class="dos-columnas">
              <div class="campo"><label for="h-sueno">Horas de sueño por noche (promedio)</label><input id="h-sueno" name="sueno" type="number" min="0" max="16" step="0.5" required value="${registro ? registro.sueno : ''}" placeholder="9"></div>
              <div class="campo"><label for="h-fv">Porciones de frutas y verduras al día</label><input id="h-fv" name="frutas_verduras" type="number" min="0" max="10" required value="${registro ? registro.frutas_verduras : ''}" placeholder="2"></div>
              <div class="campo"><label for="h-juego">Minutos de juego activo al día</label><input id="h-juego" name="juego_activo" type="number" min="0" max="300" required value="${registro ? registro.juego_activo : ''}" placeholder="30"></div>
              <div class="campo"><label for="h-pant">Horas de pantalla al día</label><input id="h-pant" name="pantallas" type="number" min="0" max="16" step="0.5" required value="${registro ? registro.pantallas : ''}" placeholder="2"></div>
              <div class="campo"><label for="h-agua">Vasos de agua al día</label><input id="h-agua" name="agua" type="number" min="0" max="15" required value="${registro ? registro.agua : ''}" placeholder="4"></div>
            </div>
            <div class="acciones">
              ${hecha ? `<button class="boton secundario" type="submit">Actualizar registro</button><span class="chico suave">Semana completada el ${fechaBonita((api.listar('avance_semanal', { menor_id: m.id, semana })[0] || {}).fecha)}</span>` : `<button class="boton primario" type="submit">Guardar registro y completar semana</button>`}
            </div>
          </form>` : ''}
        </div>

        <div class="tarjeta">
          <h3>Avance de hábitos</h3>
          ${registros.length ? grafica(registros) : estadoVacio('📈', 'La gráfica aparecerá cuando guardes el primer registro semanal.')}
        </div>
      </div>`;

    $('#volver-panel').addEventListener('click', (e) => { e.preventDefault(); pintarPanel(); });
    $$('[data-semana]').forEach((b) => b.addEventListener('click', () => pintarMenor(m.id, 'programa', Number(b.dataset.semana))));
    $('#form-habitos')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validar(e.target)) { aviso('Completa todos los campos del registro', 'error'); return; }
      const datos = datosFormulario(e.target);
      const fila = { menor_id: m.id, semana, sueno: Number(datos.sueno), frutas_verduras: Number(datos.frutas_verduras), juego_activo: Number(datos.juego_activo), pantallas: Number(datos.pantallas), agua: Number(datos.agua), fecha: hoyISO() };
      if (registro) api.actualizar('registros_habitos', registro.id, fila); else api.insertar('registros_habitos', fila);
      if (!hecha) {
        api.insertar('avance_semanal', { menor_id: m.id, semana, completada: true, fecha: hoyISO() });
        registrarActividad(perfil.organizacion_id, `${perfil.nombre} completó la semana ${semana} de ${m.nombre}.`);
        const nuevo = avanceMenor(m.id);
        await ventana({ titulo: `¡Semana ${semana} completada!`, html: `<div class="centro"><div class="icono" style="margin:0 auto 10px;width:64px;height:64px;font-size:32px">🎉</div><p>${escapar(m.nombre)} lleva <strong>${nuevo.completadas} de ${nuevo.total}</strong> semanas.</p><div class="progreso acento"><span style="width:${nuevo.porcentaje}%"></span></div>${nuevo.completadas < nuevo.total ? `<p class="chico suave" style="margin-top:10px">Siguiente: semana ${nuevo.semanaActiva}, «${escapar(programa[nuevo.semanaActiva - 1].titulo)}».</p>` : '<p class="chico" style="margin-top:10px">¡Terminaron el programa completo! 🏅</p>'}</div>`, botones: [{ texto: 'Continuar', clase: 'primario', valor: true }] });
        pintarMenor(m.id, 'programa');
      } else { aviso('Registro actualizado', 'ok'); pintarMenor(m.id, 'programa', semana); }
    });
    $('#btn-objetivo-menor').addEventListener('click', async () => {
      const v = await ventana({ titulo: `Objetivo para ${m.nombre}`, html: `<div class="campo"><label for="om-texto">¿Qué les gustaría lograr?</label><input id="om-texto" placeholder="Por ejemplo: desayunar todos los días"></div>`, botones: [{ texto: 'Cancelar', clase: 'secundario', valor: null }, { texto: 'Agregar', clase: 'primario', valor: 'ok' }] });
      if (v === 'ok') { const t = (ultimaVentana.campos['om-texto'] || '').trim(); if (!t) { aviso('Escribe el objetivo', 'error'); return; } api.actualizar('menores', m.id, { objetivos: [...m.objetivos, t] }); aviso('Objetivo agregado', 'ok'); pintarMenor(m.id, 'programa', semana); }
    });
    $('#btn-editar-menor').addEventListener('click', async () => {
      const v = await ventana({ titulo: 'Editar datos', html: `<form id="form-menor" novalidate>
        <div class="campo"><label for="nm-nombre">Nombre</label><input id="nm-nombre" name="nombre" required value="${escapar(m.nombre)}"></div>
        <div class="dos-columnas"><div class="campo"><label for="nm-edad">Edad</label><input id="nm-edad" name="edad" type="number" min="1" max="17" required value="${m.edad}"></div>
        <div class="campo"><label for="nm-etapa">Etapa</label><select id="nm-etapa" name="etapa">${['Preescolar', 'Primaria baja', 'Primaria alta', 'Secundaria'].map((x) => `<option ${x === m.etapa ? 'selected' : ''}>${x}</option>`).join('')}</select></div></div></form>`, botones: [{ texto: 'Cancelar', clase: 'secundario', valor: null }, { texto: 'Guardar', clase: 'primario', valor: 'ok' }] });
      if (v === 'ok') { const d = ultimaVentana.campos; if (!d.nombre) { aviso('El nombre es necesario', 'error'); return; } api.actualizar('menores', m.id, { nombre: d.nombre, edad: Number(d.edad), etapa: d.etapa }); aviso('Datos guardados', 'ok'); pintarMenor(m.id, 'programa', semana); }
    });
    if (seccion === 'perfil') window.scrollTo({ top: 0 }); else $('#detalle-semana').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Gráfica sencilla (SVG) del puntaje de hábitos por semana: más sueño, frutas, juego y agua suman; pantallas restan.
  function grafica(registros) {
    const puntaje = (r) => Math.max(0, Math.min(100, Math.round((Math.min(r.sueno, 10) / 10) * 25 + (Math.min(r.frutas_verduras, 5) / 5) * 25 + (Math.min(r.juego_activo, 60) / 60) * 25 + (Math.min(r.agua, 6) / 6) * 15 + (1 - Math.min(r.pantallas, 4) / 4) * 10)));
    const W = 640, H = 220, izq = 40, der = 16, arr = 20, aba = 36;
    const n = Math.max(registros.length, 2);
    const x = (i) => izq + (i * (W - izq - der)) / (n - 1);
    const y = (v) => arr + (1 - v / 100) * (H - arr - aba);
    const puntos = registros.map((r, i) => [x(i), y(puntaje(r)), r]);
    const linea = puntos.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
    return `<svg class="grafica" viewBox="0 0 ${W} ${H}" role="img" aria-label="Puntaje de hábitos por semana">
      ${[0, 25, 50, 75, 100].map((v) => `<line x1="${izq}" x2="${W - der}" y1="${y(v)}" y2="${y(v)}" stroke="#E2E8E6"/><text x="${izq - 6}" y="${y(v) + 4}" font-size="11" text-anchor="end" fill="#5B6472">${v}</text>`).join('')}
      <path d="${linea}" fill="none" stroke="#1E7F76" stroke-width="3" stroke-linejoin="round"/>
      ${puntos.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="#F4A261" stroke="#fff" stroke-width="2"><title>Semana ${p[2].semana}: ${puntaje(p[2])} puntos</title></circle><text x="${p[0]}" y="${H - 12}" font-size="12" text-anchor="middle" fill="#1F2937">Sem ${p[2].semana}</text><text x="${p[0]}" y="${p[1] - 12}" font-size="12" text-anchor="middle" font-weight="700" fill="#155F58">${puntaje(p[2])}</text>`).join('')}
    </svg>
    <p class="chico suave" style="margin:8px 0 0">Puntaje de 0 a 100 calculado con el registro semanal (sueño, frutas y verduras, juego activo, agua y pantallas). Fórmula de ejemplo.</p>
    <div class="tabla-envoltura" style="margin-top:12px"><table class="tabla"><thead><tr><th>Semana</th><th>Sueño (h)</th><th>Frutas y verduras</th><th>Juego activo (min)</th><th>Pantallas (h)</th><th>Agua (vasos)</th></tr></thead>
    <tbody>${registros.map((r) => `<tr><td>${r.semana}</td><td>${r.sueno}</td><td>${r.frutas_verduras}</td><td>${r.juego_activo}</td><td>${r.pantallas}</td><td>${r.agua}</td></tr>`).join('')}</tbody></table></div>`;
  }

  // Entrada por URL #menor=
  const h = location.hash.match(/menor=([^&]+)/);
  if (h) pintarMenor(h[1], 'programa'); else pintarPanel();
}
