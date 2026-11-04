// Página pública: objetivos, servicios y contacto.
import { api, hoyISO } from './api.js';
import { $, $$, escapar, montarEncabezado, montarPie, aviso, ventana, validar, datosFormulario } from './ui.js';

montarEncabezado('inicio');
montarPie();

const objetivos = api.listar('objetivos');
const servicios = api.listar('servicios');

// ---------- Objetivos ----------
const listaObj = $('#lista-objetivos');
listaObj.innerHTML = objetivos.map((o) => `
  <button class="tarjeta clic" data-objetivo="${o.id}" type="button" style="text-align:left;font:inherit">
    <div class="icono">${o.icono}</div>
    <h3>${escapar(o.nombre)}</h3>
    <p class="suave chico">${escapar(o.descripcion)}</p>
    <span class="chico" style="color:var(--primario-osc);font-weight:700">Elegir →</span>
  </button>`).join('');

const detalle = $('#detalle-objetivo');
function mostrarObjetivo(id) {
  const o = objetivos.find((x) => x.id === id);
  if (!o) return;
  $$('[data-objetivo]', listaObj).forEach((b) => b.classList.toggle('elegida', b.dataset.objetivo === id));
  const relacionados = o.servicios.map((sid) => servicios.find((s) => s.id === sid)).filter(Boolean);
  detalle.classList.remove('oculto');
  detalle.innerHTML = `
    <div class="fila entre">
      <div><span class="etiqueta">Elegiste</span><h3 style="margin-top:8px">${o.icono} ${escapar(o.nombre)}</h3></div>
    </div>
    <p>${escapar(o.descripcion)}</p>
    <p class="chico"><strong>Para quién:</strong> ${escapar(o.para_quien)}</p>
    <h4 style="margin-top:14px">Servicios relacionados</h4>
    <ul class="lista">${relacionados.map((s) => `<li><span class="punto"></span><div class="cuerpo"><strong>${escapar(s.nombre)}</strong><br><span class="chico suave">${escapar(s.descripcion)}</span></div></li>`).join('')}</ul>
    <div class="acciones" style="margin-top:16px">
      <a class="boton primario" href="ruta.html?objetivo=${o.id}">Continuar con este objetivo</a>
      <a class="boton secundario" href="#servicios">Ver todos los servicios</a>
    </div>`;
  detalle.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
listaObj.addEventListener('click', (e) => { const b = e.target.closest('[data-objetivo]'); if (b) mostrarObjetivo(b.dataset.objetivo); });

// ---------- Servicios ----------
$('#lista-servicios').innerHTML = servicios.map((s) => `
  <div class="tarjeta">
    <h3>${escapar(s.nombre)}</h3>
    <p class="suave chico">${escapar(s.descripcion)}</p>
    <p class="chico"><strong>Útil para:</strong> ${escapar(s.para_quien)}</p>
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

// Si venimos del recorrido con un objetivo, se preselecciona
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

// Si la URL trae #objetivos con ?objetivo=, se abre
const param = new URLSearchParams(location.search).get('objetivo');
if (param) mostrarObjetivo(param);
