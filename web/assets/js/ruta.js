// Recorrido «Descubre tu ruta»: bienvenida → etapa → preguntas por etapa → resultado orientativo → acción final.
import { api, hoyISO } from './api.js';
import { etapasTodas, semanasDe } from './programa.js';
import { $, $$, escapar, montarEncabezado, montarPie, aviso } from './ui.js';

montarEncabezado('ruta');
montarPie();

const etapas = etapasTodas();
const pantalla = $('#ruta-pantalla');
const PASOS = ['Bienvenida', 'Etapa', 'Preguntas', 'Resultado', 'Siguiente paso'];

// Estado del recorrido (sobrevive a recargas dentro de la pestaña)
const CLAVE = 'infancia_ruta';
let estado = cargarEstado();
function cargarEstado() {
  try { return JSON.parse(sessionStorage.getItem(CLAVE)) || nuevoEstado(); } catch (e) { return nuevoEstado(); }
}
function nuevoEstado() { return { paso: 0, etapa: null, pregunta: 0, respuestas: {} }; }
function guardar() { sessionStorage.setItem(CLAVE, JSON.stringify(estado)); }

// Si llega ?etapa=, se brinca la bienvenida y se preselecciona
const param = new URLSearchParams(location.search).get('etapa');
if (param && etapas.some((e) => e.id === param)) {
  estado = { ...nuevoEstado(), paso: 2, etapa: param };
  guardar();
  history.replaceState(null, '', 'ruta.html');
}

function pintarPasos() {
  $('#ruta-etapa').textContent = `Paso ${estado.paso + 1} de ${PASOS.length} · ${PASOS[estado.paso]}`;
  $('#ruta-pasos').innerHTML = PASOS.map((_, i) => `<span class="${i < estado.paso ? 'hecho' : i === estado.paso ? 'actual' : ''}"></span>`).join('');
}

function etapaActual() { return etapas.find((e) => e.id === estado.etapa); }

// Calcula la etapa a partir de una fecha de nacimiento
function etapaPorFecha(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  const h = new Date();
  let meses = (h.getFullYear() - a) * 12 + (h.getMonth() + 1 - m);
  if (h.getDate() < d) meses -= 1;
  if (meses < 0) return 'embarazo';
  if (meses < 6) return '0-6m';
  if (meses < 12) return '6-12m';
  if (meses < 36) return '1-3a';
  if (meses < 72) return '3-6a';
  return null;
}

function render() {
  pintarPasos();
  window.scrollTo({ top: 0 });
  const e = etapaActual();
  switch (estado.paso) {
    case 0:
      pantalla.innerHTML = `
        <div class="icono calido">🧭</div>
        <h2>Descubre tu ruta</h2>
        <p>En menos de dos minutos nos dices la etapa de tu bebé o de tu niña o niño, respondes cuatro preguntas sobre los hábitos de tu casa y recibes un <strong>resultado orientativo</strong>: qué etapa del programa les corresponde y por dónde conviene empezar.</p>
        <p class="chico suave">No necesitas registrarte y no pedimos datos sensibles. Las preguntas y los resultados son de ejemplo; el equipo de MYO Genetics los validará. Este recorrido orienta, no diagnostica.</p>
        <div class="acciones"><button class="boton primario grande" data-ir="1" type="button">Comenzar</button></div>`;
      break;
    case 1:
      pantalla.innerHTML = `
        <h2>¿En qué etapa está tu familia?</h2>
        <p class="suave">Elige la etapa o escribe la fecha de nacimiento y la calculamos.</p>
        <div class="rejilla" id="ruta-etapas" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">${etapas.map((x) => `
          <button class="tarjeta clic etapa-tarjeta ${estado.etapa === x.id ? 'elegida' : ''}" data-etapa="${x.id}" type="button" style="text-align:left;font:inherit;padding:14px;--color-etapa:${x.color}">
            <div class="icono" style="width:36px;height:36px;font-size:18px;margin-bottom:8px">${x.icono}</div><strong style="font-size:.95rem">${escapar(x.nombre)}</strong><br><span class="suave chico">${escapar(x.rango)}</span></button>`).join('')}</div>
        <div class="campo" style="margin-top:18px;max-width:320px"><label for="ruta-fecha">O escribe la fecha de nacimiento</label><input id="ruta-fecha" type="date" max="${hoyISO()}"><span class="ayuda">Si todavía no nace, elige «Embarazo».</span></div>
        <div class="acciones" style="margin-top:12px">
          <button class="boton secundario" data-ir="0" type="button">Anterior</button>
          <button class="boton primario" id="btn-siguiente" type="button" ${estado.etapa ? '' : 'disabled'}>Siguiente</button>
        </div>`;
      const elegir = (id) => {
        if (estado.etapa !== id) { estado.respuestas = {}; estado.pregunta = 0; }
        estado.etapa = id; guardar();
        $$('[data-etapa]').forEach((x) => x.classList.toggle('elegida', x.dataset.etapa === estado.etapa));
        $('#btn-siguiente').disabled = false;
      };
      $('#ruta-etapas').addEventListener('click', (ev) => { const b = ev.target.closest('[data-etapa]'); if (b) elegir(b.dataset.etapa); });
      $('#ruta-fecha').addEventListener('change', (ev) => {
        const id = etapaPorFecha(ev.target.value);
        if (!id) { aviso('El programa cubre de 0 a 6 años. Para mayores, escríbenos en Contacto.', 'error'); return; }
        elegir(id); aviso(`Etapa calculada: ${etapas.find((x) => x.id === id).nombre}`, 'ok');
      });
      $('#btn-siguiente').addEventListener('click', () => ir(2));
      break;
    case 2: {
      if (!e) { ir(1); return; }
      const p = e.preguntas[estado.pregunta];
      const total = e.preguntas.length;
      const elegida = estado.respuestas[p.id];
      pantalla.innerHTML = `
        <div class="fila entre"><span class="etiqueta" style="background:color-mix(in srgb,${e.color} 15%,#fff);color:${e.color}">${e.icono} ${escapar(e.nombre)}</span><span class="chico suave">Pregunta ${estado.pregunta + 1} de ${total}</span></div>
        <div class="progreso" style="margin:12px 0 20px"><span style="width:${Math.round(((estado.pregunta) / total) * 100)}%"></span></div>
        <h2>${escapar(p.texto)}</h2>
        <div class="opciones" id="ruta-opciones">${p.opciones.map((op) => `
          <label class="opcion ${elegida === op.t ? 'elegida' : ''}"><input type="radio" name="resp" value="${escapar(op.t)}" ${elegida === op.t ? 'checked' : ''}> ${escapar(op.t)}</label>`).join('')}</div>
        <p class="mensaje-error chico" id="ruta-error" style="display:none;color:var(--error);margin-top:10px">Elige una opción para continuar.</p>
        <div class="acciones" style="margin-top:20px">
          <button class="boton secundario" id="btn-anterior" type="button">Anterior</button>
          <button class="boton primario" id="btn-siguiente" type="button">${estado.pregunta + 1 === total ? 'Ver mi resultado' : 'Siguiente'}</button>
        </div>`;
      $('#ruta-opciones').addEventListener('change', (ev) => {
        estado.respuestas[p.id] = ev.target.value; guardar();
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
      if (!e) { ir(1); return; }
      const semanas = semanasDe(e.id);
      // Notas de orientación según las opciones elegidas
      const notas = e.preguntas.map((p) => (p.opciones.find((o) => o.t === estado.respuestas[p.id]) || {}).nota).filter(Boolean);
      const unicas = [...new Set(notas)];
      pantalla.innerHTML = `
        <div class="centro"><div class="icono" style="margin:0 auto 10px;width:64px;height:64px;font-size:32px;background:color-mix(in srgb,${e.color} 15%,#fff)">${e.icono}</div>
        <span class="etiqueta ok">Resultado orientativo</span>
        <h2 style="margin-top:10px">Su ruta: ${escapar(e.nombre)}</h2>
        <p class="suave">${escapar(e.descripcion)}</p></div>
        <div class="tarjeta calida" style="margin:18px 0">
          <h3>Por dónde conviene empezar</h3>
          ${unicas.length ? `<ul class="lista compacta">${unicas.map((n) => `<li><span class="punto pendiente"></span><div class="cuerpo">${escapar(n)}</div></li>`).join('')}</ul>` : '<p>Sus hábitos van bien encaminados. El programa les ayudará a mantenerlos y a prepararse para la siguiente etapa.</p>'}
          <p class="chico suave" style="margin:10px 0 0">Esto es una orientación general, no un diagnóstico. Una persona profesional podrá revisar su caso dentro del programa.</p>
        </div>
        <h3>Cómo se ve el programa de esta etapa</h3>
        <p class="chico suave">12 semanas. Cada una con objetivo, microcontenido, actividad en casa, materiales y check-in de 3 minutos. Primeras semanas:</p>
        <div class="rejilla tres">${semanas.slice(0, 3).map((s) => `<div class="tarjeta" style="padding:14px"><small class="suave">Semana ${s.numero}</small><br><strong>${escapar(s.titulo)}</strong><p class="chico suave" style="margin:4px 0 0">${escapar(s.actividad)}</p></div>`).join('')}</div>
        <h3 style="margin-top:18px">Tus respuestas</h3>
        <ul class="lista compacta">${e.preguntas.map((p) => `<li><span class="punto"></span><div class="cuerpo"><span class="chico suave">${escapar(p.texto)}</span><br><strong>${escapar(estado.respuestas[p.id] || '—')}</strong></div></li>`).join('')}</ul>
        <div class="acciones" style="margin-top:20px">
          <button class="boton secundario" id="btn-anterior" type="button">Anterior</button>
          <button class="boton primario" data-ir="4" type="button">Continuar</button>
        </div>`;
      $('#btn-anterior').addEventListener('click', () => { estado.pregunta = e.preguntas.length - 1; ir(2); });
      break;
    }
    case 4: {
      if (!e) { ir(1); return; }
      // Guardamos el recorrido (anónimo) una sola vez
      if (!estado.guardado) {
        api.insertar('recorridos', { fecha: hoyISO(), etapa_id: e.id, respuestas: estado.respuestas });
        estado.guardado = true; guardar();
      }
      pantalla.innerHTML = `
        <h2>¿Qué quieres hacer ahora?</h2>
        <p class="suave">Puedes registrar a tu familia y empezar el programa, pedir orientación o repetir el recorrido con otra etapa.</p>
        <div class="rejilla tres" style="margin-top:16px">
          <a class="tarjeta clic" href="registro.html?etapa=${e.id}" style="text-decoration:none;color:inherit"><div class="icono calido">👨‍👩‍👧</div><h3>Registrar a mi familia</h3><p class="chico suave">Crea tu cuenta de responsable y agrega a tu bebé o a tu niña o niño.</p></a>
          <button class="tarjeta clic" id="btn-orientacion" type="button" style="text-align:left;font:inherit"><div class="icono">💬</div><h3>Solicitar orientación</h3><p class="chico suave">Te llevamos al formulario de contacto con tu etapa ya anotada.</p></button>
          <button class="tarjeta clic" id="btn-reiniciar-ruta" type="button" style="text-align:left;font:inherit"><div class="icono sol">🔄</div><h3>Volver a empezar</h3><p class="chico suave">Explora otra etapa desde cero.</p></button>
        </div>
        <div class="acciones" style="margin-top:20px"><button class="boton secundario" data-ir="3" type="button">Anterior</button><a class="boton fantasma" href="acceso.html">¿Ya tienes cuenta? Ingresa a tu familia</a></div>`;
      $('#btn-orientacion').addEventListener('click', () => {
        sessionStorage.setItem('infancia_contacto_previo', JSON.stringify({ servicio_id: e.id === 'embarazo' ? 's6' : 's3', mensaje: `Hice el recorrido "Descubre tu ruta" en la etapa "${e.nombre}" y me gustaría recibir orientación.` }));
        location.href = 'index.html#contacto';
      });
      $('#btn-reiniciar-ruta').addEventListener('click', () => { estado = nuevoEstado(); guardar(); aviso('Recorrido reiniciado'); render(); });
      break;
    }
  }
  $$('[data-ir]', pantalla).forEach((b) => b.addEventListener('click', () => ir(Number(b.dataset.ir))));
}

function ir(paso) {
  if (paso === 2 && !estado.etapa) { aviso('Primero elige una etapa', 'error'); paso = 1; }
  if (paso === 2 && estado.paso !== 2) estado.pregunta = estado.pregunta || 0;
  estado.paso = paso; guardar(); render();
}

render();
