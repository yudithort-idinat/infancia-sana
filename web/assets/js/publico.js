// Página pública: programa, etapas, servicios y contacto.
import { api, hoyISO } from './api.js';
import { etapasTodas, semanasDe } from './programa.js';
import { $, $$, escapar, montarEncabezado, montarPie, aviso, ventana, validar, datosFormulario } from './ui.js';

montarEncabezado('inicio');
montarPie();

const etapas = etapasTodas();
const servicios = api.listar('servicios');

// ---------- Semana de ejemplo (programa como protagonista) ----------
const ejemplo = semanasDe('1-3a')[2];
$('#semana-ejemplo').innerHTML = `
  <span class="etiqueta ejemplo">Ejemplo · etapa 1 a 3 años · semana ${ejemplo.numero}</span>
  <h3 style="margin-top:10px">${escapar(ejemplo.titulo)}</h3>
  <p class="chico"><strong>Objetivo:</strong> ${escapar(ejemplo.objetivo)}</p>
  <p class="chico">${escapar(ejemplo.contenido)}</p>
  <p class="chico"><strong>Actividad en casa:</strong> ${escapar(ejemplo.actividad)}</p>
  <p class="chico"><strong>Materiales:</strong> ${escapar(ejemplo.materiales)}</p>
  <p class="chico"><strong>Check-in:</strong> indicadores de la etapa + «${escapar(ejemplo.checkin)}»</p>
  <a class="boton chico primario" href="acceso.html">Ver el programa completo en el área familiar</a>`;

// ---------- Etapas ----------
const listaEt = $('#lista-etapas');
listaEt.innerHTML = etapas.map((e) => `
  <button class="tarjeta clic etapa-tarjeta" data-etapa="${e.id}" type="button" style="text-align:left;font:inherit;--color-etapa:${e.color}">
    <div class="icono">${e.icono}</div>
    <h3 style="font-size:1rem">${escapar(e.nombre)}</h3>
    <p class="suave chico" style="margin:0 0 8px">${escapar(e.rango)}</p>
    ${e.complementaria ? '<span class="etiqueta gris">Ruta complementaria</span>' : '<span class="etiqueta">Programa 12 semanas</span>'}
  </button>`).join('');

const detalle = $('#detalle-etapa');
function mostrarEtapa(id) {
  const e = etapas.find((x) => x.id === id);
  if (!e) return;
  $$('[data-etapa]', listaEt).forEach((b) => b.classList.toggle('elegida', b.dataset.etapa === id));
  const semanas = semanasDe(e.id);
  detalle.classList.remove('oculto');
  detalle.style.setProperty('--color-etapa', e.color);
  detalle.innerHTML = `
    <div class="fila entre">
      <div><span class="etiqueta" style="background:color-mix(in srgb,${e.color} 15%,#fff);color:${e.color}">${e.icono} ${escapar(e.nombre)}</span><h3 style="margin-top:8px">${escapar(e.descripcion)}</h3></div>
    </div>
    <div class="rejilla dos" style="margin-top:12px">
      <div>
        <h4 style="margin-top:0">Las 12 semanas (ejemplo)</h4>
        <ol class="chico" style="margin:0;padding-left:18px;columns:2;column-gap:18px">${semanas.map((s) => `<li style="margin-bottom:3px">${escapar(s.titulo)}</li>`).join('')}</ol>
      </div>
      <div>
        <h4 style="margin-top:0">Qué se registra cada semana</h4>
        <ul class="lista compacta">${e.indicadores.map((i) => `<li><span class="punto-etapa" style="--color-etapa:${e.color};margin-top:8px"></span><div class="cuerpo chico">${escapar(i.etiqueta)} <span class="suave">(${i.meta.tipo === 'min' ? 'meta: al menos' : 'meta: máximo'} ${i.meta.valor} ${escapar(i.unidad)})</span></div></li>`).join('')}</ul>
      </div>
    </div>
    <div class="acciones" style="margin-top:16px">
      <a class="boton primario" href="ruta.html?etapa=${e.id}">Descubre tu ruta en esta etapa</a>
      <a class="boton secundario" href="registro.html?etapa=${e.id}">Registrar a mi familia</a>
    </div>`;
  detalle.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
listaEt.addEventListener('click', (e) => { const b = e.target.closest('[data-etapa]'); if (b) mostrarEtapa(b.dataset.etapa); });

// ---------- Servicios ----------
$('#lista-servicios').innerHTML = servicios.map((s) => `
  <div class="tarjeta">
    <h3>${escapar(s.nombre)}</h3>
    <p class="suave chico">${escapar(s.descripcion)}</p>
    <p class="chico"><strong>Para quién:</strong> ${escapar(s.para_quien)}</p>
    <div class="acciones">
      <button class="boton chico secundario" data-conocer="${s.id}" type="button">Conocer más</button>
      <button class="boton chico primario" data-solicitar="${s.id}" type="button">Solicitar orientación</button>
    </div>
  </div>`).join('');

$('#lista-servicios').addEventListener('click', (e) => {
  const c = e.target.closest('[data-conocer]');
  const s = e.target.closest('[data-solicitar]');
  if (c) {
    const serv = servicios.find((x) => x.id === c.dataset.conocer);
    ventana({ titulo: serv.nombre, html: `<p>${escapar(serv.descripcion)}</p><p class="chico"><strong>Para quién:</strong> ${escapar(serv.para_quien)}</p><p class="chico suave">Descripción de ejemplo. El equipo de MYO Genetics definirá el alcance, duración y costo de cada servicio.</p>`,
      botones: [{ texto: 'Cerrar', clase: 'secundario', valor: null }, { texto: 'Solicitar orientación', clase: 'primario', valor: 'solicitar' }] })
      .then((v) => { if (v === 'solicitar') irAContacto(serv.id); });
  }
  if (s) irAContacto(s.dataset.solicitar);
});

function irAContacto(servicioId) {
  const sel = $('#c-asunto');
  sel.value = servicioId;
  document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => $('#c-nombre').focus(), 500);
}

// ---------- Contacto ----------
const sel = $('#c-asunto');
sel.innerHTML = '<option value="">Elige una opción</option>' + servicios.map((s) => `<option value="${s.id}">${escapar(s.nombre)}</option>`).join('') + '<option value="otro">Otro tema</option>';

// Si venimos del recorrido, se preselecciona
try {
  const previo = JSON.parse(sessionStorage.getItem('infancia_contacto_previo') || 'null');
  if (previo) {
    if (previo.servicio_id) sel.value = previo.servicio_id;
    if (previo.mensaje) $('#c-mensaje').value = previo.mensaje;
    sessionStorage.removeItem('infancia_contacto_previo');
    if (location.hash === '#contacto') setTimeout(() => document.getElementById('contacto').scrollIntoView(), 50);
  }
} catch (e) { /* nada */ }

$('#form-contacto').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  if (!validar(form)) { aviso('Faltan datos por completar', 'error'); return; }
  const datos = datosFormulario(form);
  api.insertar('mensajes_contacto', { ...datos, fecha: hoyISO(), estado: 'nuevo' });
  form.reset();
  await ventana({ titulo: '¡Mensaje enviado!', html: `<p>Gracias, <strong>${escapar(datos.nombre)}</strong>. Recibimos tu mensaje y te responderemos al correo <strong>${escapar(datos.correo)}</strong>.</p><p class="chico suave">En esta demostración el mensaje se guarda localmente; en la versión real llegará al equipo de MYO Genetics.</p>`, botones: [{ texto: 'Entendido', clase: 'primario', valor: true }] });
});

$('#enlace-whatsapp').addEventListener('click', (e) => { e.preventDefault(); aviso('El número de WhatsApp se definirá con MYO Genetics'); });
$('#enlace-agenda').addEventListener('click', (e) => { e.preventDefault(); aviso('La liga de agenda se definirá con MYO Genetics'); });

// Si la URL trae ?etapa=, se abre
const param = new URLSearchParams(location.search).get('etapa');
if (param) mostrarEtapa(param);
