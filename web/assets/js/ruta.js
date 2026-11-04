// Recorrido «Descubre tu ruta»: bienvenida → objetivo → preguntas → resumen → acción final.
import { api, hoyISO } from './api.js';
import { $, $$, escapar, montarEncabezado, montarPie, aviso } from './ui.js';

montarEncabezado('ruta');
montarPie();

const objetivos = api.listar('objetivos');
const servicios = api.listar('servicios');
const pantalla = $('#ruta-pantalla');
const PASOS = ['Bienvenida', 'Objetivo', 'Preguntas', 'Resumen', 'Acción'];

// Estado del recorrido (sobrevive a recargas dentro de la pestaña)
const CLAVE = 'infancia_ruta';
let estado = cargarEstado();
function cargarEstado() {
  try { return JSON.parse(sessionStorage.getItem(CLAVE)) || nuevoEstado(); } catch (e) { return nuevoEstado(); }
}
function nuevoEstado() { return { paso: 0, objetivo: null, pregunta: 0, respuestas: {} }; }
function guardar() { sessionStorage.setItem(CLAVE, JSON.stringify(estado)); }

// Si llega ?objetivo=, se brinca la bienvenida y se preselecciona
const param = new URLSearchParams(location.search).get('objetivo');
if (param && objetivos.some((o) => o.id === param)) {
  estado = { ...nuevoEstado(), paso: 2, objetivo: param };
  guardar();
  history.replaceState(null, '', 'ruta.html');
}

function pintarPasos() {
  $('#ruta-etapa').textContent = `Paso ${estado.paso + 1} de ${PASOS.length} · ${PASOS[estado.paso]}`;
  $('#ruta-pasos').innerHTML = PASOS.map((_, i) => `<span class="${i < estado.paso ? 'hecho' : i === estado.paso ? 'actual' : ''}"></span>`).join('');
}

function objetivoActual() { return objetivos.find((o) => o.id === estado.objetivo); }

function render() {
  pintarPasos();
  window.scrollTo({ top: 0 });
  const o = objetivoActual();
  switch (estado.paso) {
    case 0:
      pantalla.innerHTML = `
        <div class="icono">🧭</div>
        <h2>Descubre tu ruta</h2>
        <p>En menos de dos minutos vas a elegir un tema, responder unas preguntas cortas y recibir una orientación general. No necesitas registrarte.</p>
        <p class="chico suave">Las preguntas y resultados son ilustrativos; el equipo de MYO Genetics los validará antes de publicar.</p>
        <div class="acciones"><button class="boton primario" data-ir="1" type="button">Comenzar</button></div>`;
      break;
    case 1:
      pantalla.innerHTML = `
        <h2>¿Qué área te interesa?</h2>
        <p class="suave">Elige una para continuar.</p>
        <div class="rejilla dos" id="ruta-objetivos">${objetivos.map((x) => `
          <button class="tarjeta clic ${estado.objetivo === x.id ? 'elegida' : ''}" data-objetivo="${x.id}" type="button" style="text-align:left;font:inherit">
            <div class="icono">${x.icono}</div><h3>${escapar(x.nombre)}</h3><p class="suave chico">${escapar(x.descripcion)}</p></button>`).join('')}</div>
        <div class="acciones" style="margin-top:20px">
          <button class="boton secundario" data-ir="0" type="button">Anterior</button>
          <button class="boton primario" id="btn-siguiente" type="button" ${estado.objetivo ? '' : 'disabled'}>Siguiente</button>
        </div>`;
      $('#ruta-objetivos').addEventListener('click', (e) => {
        const b = e.target.closest('[data-objetivo]');
        if (!b) return;
        if (estado.objetivo !== b.dataset.objetivo) { estado.respuestas = {}; estado.pregunta = 0; }
        estado.objetivo = b.dataset.objetivo; guardar();
        $$('[data-objetivo]').forEach((x) => x.classList.toggle('elegida', x.dataset.objetivo === estado.objetivo));
        $('#btn-siguiente').disabled = false;
      });
      $('#btn-siguiente').addEventListener('click', () => ir(2));
      break;
    case 2: {
      if (!o) { ir(1); return; }
      const p = o.preguntas[estado.pregunta];
      const total = o.preguntas.length;
      const elegida = estado.respuestas[p.id];
      pantalla.innerHTML = `
        <div class="fila entre"><span class="etiqueta">${o.icono} ${escapar(o.nombre)}</span><span class="chico suave">Pregunta ${estado.pregunta + 1} de ${total}</span></div>
        <div class="progreso" style="margin:12px 0 20px"><span style="width:${Math.round(((estado.pregunta) / total) * 100)}%"></span></div>
        <h2>${escapar(p.texto)}</h2>
        <div class="opciones" id="ruta-opciones">${p.opciones.map((op) => `
          <label class="opcion ${elegida === op ? 'elegida' : ''}"><input type="radio" name="resp" value="${escapar(op)}" ${elegida === op ? 'checked' : ''}> ${escapar(op)}</label>`).join('')}</div>
        <p class="mensaje-error chico" id="ruta-error" style="display:none;color:var(--error);margin-top:10px">Elige una opción para continuar.</p>
        <div class="acciones" style="margin-top:20px">
          <button class="boton secundario" id="btn-anterior" type="button">Anterior</button>
          <button class="boton primario" id="btn-siguiente" type="button">${estado.pregunta + 1 === total ? 'Ver mi resumen' : 'Siguiente'}</button>
        </div>`;
      $('#ruta-opciones').addEventListener('change', (e) => {
        estado.respuestas[p.id] = e.target.value; guardar();
        $$('.opcion').forEach((l) => l.classList.toggle('elegida', l.querySelector('input').checked));
        $('#ruta-error').style.display = 'none';
      });
      $('#btn-anterior').addEventListener('click', () => { if (estado.pregunta > 0) { estado.pregunta--; guardar(); render(); } else ir(1); });
      $('#btn-siguiente').addEventListener('click', () => {
        if (!estado.respuestas[p.id]) { $('#ruta-error').style.display = 'block'; return; }
        if (estado.pregunta + 1 < total) { estado.pregunta++; guardar(); render(); } else ir(3);
      });
      break;
    }
    case 3: {
      if (!o) { ir(1); return; }
      const relacionados = o.servicios.map((id) => servicios.find((s) => s.id === id)).filter(Boolean);
      pantalla.innerHTML = `
        <div class="centro"><div class="icono" style="margin:0 auto 10px;width:64px;height:64px;font-size:32px">${o.icono}</div>
        <span class="etiqueta ok">Recorrido completado</span>
        <h2 style="margin-top:10px">Tu objetivo: ${escapar(o.nombre)}</h2></div>
        <div class="tarjeta" style="background:var(--primario-claro);border:0;margin:18px 0">
          <h3>Orientación general</h3>
          <p>${escapar(o.orientacion)}</p>
        </div>
        <h3>Tus respuestas</h3>
        <ul class="lista">${o.preguntas.map((p) => `<li><span class="punto"></span><div class="cuerpo"><span class="chico suave">${escapar(p.texto)}</span><br><strong>${escapar(estado.respuestas[p.id] || '—')}</strong></div></li>`).join('')}</ul>
        <h3 style="margin-top:18px">Servicios que podrían ayudarte</h3>
        <div class="rejilla dos">${relacionados.map((s) => `<div class="tarjeta" style="padding:14px"><strong>${escapar(s.nombre)}</strong><p class="chico suave" style="margin:4px 0 0">${escapar(s.descripcion)}</p></div>`).join('')}</div>
        <div class="acciones" style="margin-top:20px">
          <button class="boton secundario" id="btn-anterior" type="button">Anterior</button>
          <button class="boton primario" data-ir="4" type="button">Continuar</button>
        </div>`;
      $('#btn-anterior').addEventListener('click', () => { estado.pregunta = o.preguntas.length - 1; ir(2); });
      break;
    }
    case 4: {
      if (!o) { ir(1); return; }
      // Guardamos el recorrido (anónimo) una sola vez
      if (!estado.guardado) {
        api.insertar('recorridos', { fecha: hoyISO(), objetivo_id: o.id, respuestas: estado.respuestas });
        estado.guardado = true; guardar();
      }
      pantalla.innerHTML = `
        <h2>¿Qué quieres hacer ahora?</h2>
        <p class="suave">Puedes pedir orientación, conocer los servicios o repetir el recorrido con otro objetivo.</p>
        <div class="rejilla tres" style="margin-top:16px">
          <button class="tarjeta clic" id="btn-orientacion" type="button" style="text-align:left;font:inherit"><div class="icono">💬</div><h3>Solicitar orientación</h3><p class="chico suave">Te llevamos al formulario de contacto con tu objetivo ya anotado.</p></button>
          <a class="tarjeta clic" href="index.html#servicios" style="text-decoration:none;color:inherit"><div class="icono">🗂️</div><h3>Ver servicios</h3><p class="chico suave">Conoce todo lo que ofrece MYO Genetics.</p></a>
          <button class="tarjeta clic" id="btn-reiniciar-ruta" type="button" style="text-align:left;font:inherit"><div class="icono">🔄</div><h3>Volver a empezar</h3><p class="chico suave">Explora otro objetivo desde cero.</p></button>
        </div>
        <div class="acciones" style="margin-top:20px"><button class="boton secundario" data-ir="3" type="button">Anterior</button><a class="boton fantasma" href="acceso.html">¿Ya tienes cuenta? Entrar</a></div>`;
      $('#btn-orientacion').addEventListener('click', () => {
        const principal = relacionadoPrincipal(o);
        sessionStorage.setItem('infancia_contacto_previo', JSON.stringify({ servicio_id: principal, mensaje: `Hice el recorrido "Descubre tu ruta" con el objetivo "${o.nombre}" y me gustaría recibir orientación.` }));
        location.href = 'index.html#contacto';
      });
      $('#btn-reiniciar-ruta').addEventListener('click', () => { estado = nuevoEstado(); guardar(); aviso('Recorrido reiniciado'); render(); });
      break;
    }
  }
  $$('[data-ir]', pantalla).forEach((b) => b.addEventListener('click', () => ir(Number(b.dataset.ir))));
}

function relacionadoPrincipal(o) { return o.servicios[0]; }

function ir(paso) {
  if (paso === 2 && !estado.objetivo) { aviso('Primero elige un objetivo', 'error'); paso = 1; }
  if (paso === 2 && estado.paso !== 2) estado.pregunta = estado.pregunta || 0;
  estado.paso = paso; guardar(); render();
}

render();
