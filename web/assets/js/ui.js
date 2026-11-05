// Piezas de interfaz compartidas: encabezado, pie, avisos, ventanas, validación de formularios, guía.
import { sesionActual, salir, PAGINA_POR_ROL } from './auth.js';
import { api } from './api.js';

export const $ = (sel, raiz = document) => raiz.querySelector(sel);
export const $$ = (sel, raiz = document) => Array.from(raiz.querySelectorAll(sel));

export function escapar(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function iniciales(nombre) {
  return String(nombre || '?').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

const NOMBRE_ROL = { usuario: 'Usuario', familia: 'Familia', profesional: 'Profesional', admin: 'Administración' };

// Encabezado común. `activo` marca el enlace actual.
export function montarEncabezado(activo = '') {
  const s = sesionActual();
  const enlacesPublicos = [
    ['index.html#programa', 'El programa', 'programa'],
    ['index.html#etapas', 'Etapas', 'etapas'],
    ['ruta.html', 'Descubre tu ruta', 'ruta'],
    ['index.html#contacto', 'Contacto', 'contacto'],
  ];
  let derecha = '';
  if (s) {
    const destino = PAGINA_POR_ROL[s.rol] || 'index.html';
    derecha = `<span class="sesion">
      <a href="${destino}" class="${activo === 'espacio' ? 'activo' : ''}">${s.rol === 'familia' ? 'Mi familia' : 'Mi espacio'}</a>
      <span class="avatar" title="${escapar(s.perfil.nombre)}">${iniciales(s.perfil.nombre)}</span>
      <span class="chico suave">${escapar(s.perfil.nombre.split(' ')[0])} · ${NOMBRE_ROL[s.rol] || s.rol}</span>
      <button class="boton chico secundario" id="btn-salir" type="button">Salir</button>
    </span>`;
  } else {
    derecha = `<span class="sesion"><a href="acceso.html" class="boton chico primario">Ingresa a tu familia</a></span>`;
  }
  const html = `
  <div class="aviso-demo">Versión 2 de demostración · Todos los datos, textos y contenidos del programa son de ejemplo.</div>
  <header class="encabezado">
    <div class="contenedor">
      <a class="logo" href="index.html"><span class="marca"><img src="assets/img/logo.svg" alt="MYO Genetics"></span><span>Infancia Sana<small>Un programa de MYO Genetics</small></span></a>
      <button class="menu-boton" id="btn-menu" type="button" aria-label="Abrir menú">☰</button>
      <nav class="nav" id="nav-principal">
        ${enlacesPublicos.map(([h, t, k]) => `<a href="${h}" class="${activo === k ? 'activo' : ''}">${t}</a>`).join('')}
        ${derecha}
      </nav>
    </div>
  </header>`;
  const punto = $('#encabezado');
  if (punto) punto.outerHTML = html; else document.body.insertAdjacentHTML('afterbegin', html);
  $('#btn-menu')?.addEventListener('click', () => $('#nav-principal').classList.toggle('abierto'));
  $('#btn-salir')?.addEventListener('click', salir);
}

export function montarPie() {
  const html = `<footer class="pie"><div class="contenedor">
    <span>© ${new Date().getFullYear()} MYO Genetics · Infancia Sana · versión 2 (demo)</span>
    <span class="fila"><a href="index.html">Inicio</a> · <a href="ruta.html">Descubre tu ruta</a> · <a href="privacidad.html">Privacidad</a> · <a href="prueba.html">Recorrido de prueba</a> · <button class="boton chico fantasma" id="btn-reiniciar" type="button">Reiniciar datos de ejemplo</button></span>
  </div></footer>`;
  const punto = $('#pie');
  if (punto) punto.outerHTML = html; else document.body.insertAdjacentHTML('beforeend', html);
  $('#btn-reiniciar')?.addEventListener('click', async () => {
    const ok = await confirmar('Reiniciar datos de ejemplo', 'Se borrarán los cambios hechos en esta demostración y volverán los datos originales. ¿Continuar?');
    if (ok) { api.reiniciar(); sessionStorage.clear(); aviso('Datos de ejemplo restaurados', 'ok'); setTimeout(() => { location.href = 'index.html'; }, 600); }
  });
}

// Guía del programa (personaje PROPUESTO, nombre provisional «Brote»; por validar con MYO Genetics)
export function guia(texto, titulo = 'Brote, tu guía del programa') {
  return `<div class="guia"><div class="cara">🌿</div><div><strong>${escapar(titulo)}</strong><p>${texto}</p></div></div>`;
}

// Aviso emergente breve
let temporizadorAviso;
export function aviso(texto, tipo = '') {
  let el = $('#aviso-flotante');
  if (!el) { el = document.createElement('div'); el.id = 'aviso-flotante'; el.className = 'aviso-flotante'; document.body.appendChild(el); }
  el.className = `aviso-flotante ${tipo}`;
  el.textContent = texto;
  requestAnimationFrame(() => el.classList.add('visible'));
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => el.classList.remove('visible'), 2800);
}

// Lo capturado en la última ventana (inputs por name o id), disponible después de cerrarla
export const ultimaVentana = { campos: {} };

// Ventana emergente. `botones` = [{texto, clase, valor}] ; resuelve con el valor del botón.
export function ventana({ titulo, html, botones = [{ texto: 'Cerrar', clase: 'secundario', valor: null }] }) {
  return new Promise((resolver) => {
    let velo = $('#velo');
    if (!velo) { velo = document.createElement('div'); velo.id = 'velo'; velo.className = 'velo'; document.body.appendChild(velo); }
    velo.innerHTML = `<div class="ventana" role="dialog" aria-modal="true">
      <h3>${escapar(titulo)}</h3>
      <div class="ventana-cuerpo">${html}</div>
      <div class="acciones">${botones.map((b, i) => `<button class="boton ${b.clase || 'secundario'}" data-i="${i}" type="button">${escapar(b.texto)}</button>`).join('')}</div>
    </div>`;
    velo.classList.add('visible');
    const cerrar = (valor) => {
      // Guardamos lo capturado en la ventana antes de cerrarla
      ultimaVentana.campos = {};
      $$('input, select, textarea', velo).forEach((el) => { const k = el.name || el.id; if (!k) return; if (el.type === 'radio') { if (el.checked) ultimaVentana.campos[k] = el.value; return; } ultimaVentana.campos[k] = el.type === 'checkbox' ? el.checked : el.value; });
      velo.classList.remove('visible'); velo.innerHTML = ''; resolver(valor);
    };
    $$('.acciones button', velo).forEach((b) => b.addEventListener('click', () => cerrar(botones[Number(b.dataset.i)].valor)));
    velo.addEventListener('click', (e) => { if (e.target === velo) cerrar(null); }, { once: true });
  });
}

export function confirmar(titulo, texto) {
  return ventana({ titulo, html: `<p>${escapar(texto)}</p>`, botones: [{ texto: 'Cancelar', clase: 'secundario', valor: false }, { texto: 'Sí, continuar', clase: 'primario', valor: true }] });
}

// Valida los campos marcados con `required` dentro de un formulario.
// Marca los incompletos y devuelve true si todo está en orden.
export function validar(form) {
  let ok = true;
  $$('.campo', form).forEach((c) => c.classList.remove('invalido'));
  $$('[required]', form).forEach((input) => {
    const vacio = input.type === 'checkbox' ? !input.checked : !String(input.value || '').trim();
    const malCorreo = input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
    if (vacio || malCorreo) {
      ok = false;
      const campo = input.closest('.campo');
      if (campo) {
        campo.classList.add('invalido');
        let msg = $('.mensaje-error', campo);
        if (!msg) { msg = document.createElement('span'); msg.className = 'mensaje-error'; campo.appendChild(msg); }
        msg.textContent = malCorreo ? 'Escribe un correo válido.' : input.type === 'checkbox' ? 'Necesitamos tu confirmación.' : 'Este campo es necesario.';
      }
    }
  });
  if (!ok) { const primero = $('.campo.invalido', form); primero?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  return ok;
}

export function datosFormulario(form) {
  const datos = {};
  new FormData(form).forEach((v, k) => { datos[k] = typeof v === 'string' ? v.trim() : v; });
  return datos;
}

export function estadoVacio(icono, texto, accionHtml = '') {
  return `<div class="vacio"><div class="icono">${icono}</div><p>${escapar(texto)}</p>${accionHtml}</div>`;
}

// Pestañas simples: botones .pestanas[data-panel] y paneles .panel#id
export function activarPestanas(contenedor, inicial) {
  const botones = $$('.pestanas button', contenedor);
  const mostrar = (id) => {
    botones.forEach((b) => b.classList.toggle('activa', b.dataset.panel === id));
    $$('.panel', contenedor).forEach((p) => p.classList.toggle('activo', p.id === id));
    history.replaceState(null, '', `#${id}`);
    window.scrollTo({ top: 0 });
  };
  botones.forEach((b) => b.addEventListener('click', () => mostrar(b.dataset.panel)));
  const desdeUrl = location.hash.replace('#', '');
  mostrar(botones.some((b) => b.dataset.panel === desdeUrl) ? desdeUrl : inicial || botones[0]?.dataset.panel);
  return mostrar;
}

// Barras horizontales sencillas: filas = [{etiqueta, valor, max, texto}]
export function barras(filas) {
  return `<div class="barras">${filas.map((f) => `<div class="barra"><span>${escapar(f.etiqueta)}</span><div class="pista"><span style="width:${Math.max(0, Math.min(100, (f.valor / (f.max || 100)) * 100))}%"></span></div><span class="valor">${escapar(f.texto ?? f.valor)}</span></div>`).join('')}</div>`;
}
