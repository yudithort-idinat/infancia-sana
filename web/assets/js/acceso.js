// Acceso con perfiles de prueba (demo). Fase 2: Supabase Auth en el formulario.
import { api } from './api.js';
import { entrar, sesionActual, PAGINA_POR_ROL } from './auth.js';
import { $, escapar, montarEncabezado, montarPie, aviso, iniciales } from './ui.js';

montarEncabezado('acceso');
montarPie();

const para = new URLSearchParams(location.search).get('para');
if (para) {
  const av = $('#acceso-aviso');
  av.textContent = 'Para ver esa pantalla entra con un perfil de ese tipo.';
  av.classList.remove('oculto');
}

const perfiles = api.listar('perfiles');
const orgs = api.listar('organizaciones');
const DESCR = {
  usuario: 'Espacio personal: inicio, perfil, servicios y seguimiento.',
  familia: 'Panel del responsable con perfiles de menores y el programa Infancia Sana.',
  profesional: 'Casos asignados, fichas de seguimiento y notas.',
};
const ICONO = { usuario: '🙂', familia: '👨‍👩‍👧', profesional: '🩺' };
const TIPO_ORG = { escuela: 'Escuela', ac: 'Asociación civil', gobierno: 'Gobierno' };
const ICONO_ORG = { escuela: '🏫', ac: '🤝', gobierno: '🏛️' };

function tarjeta(p) {
  return `<button class="tarjeta clic" data-entrar="${p.id}" type="button" style="text-align:left;font:inherit">
    <div class="fila"><span class="avatar">${iniciales(p.nombre)}</span><div><strong>${escapar(p.nombre)}</strong><br><span class="chico suave">${escapar(p.correo)}</span></div></div>
    <p class="chico" style="margin:10px 0 6px">${ICONO[p.rol] || ''} ${escapar(DESCR[p.rol] || '')}</p>
    <span class="etiqueta">${p.rol === 'usuario' ? 'Usuario adulto' : p.rol === 'familia' ? 'Familia' : 'Profesional'}</span>
  </button>`;
}

$('#perfiles-prueba').innerHTML = perfiles.filter((p) => ['usuario', 'familia', 'profesional'].includes(p.rol) && ['u1', 'f1', 'p1'].includes(p.id)).map(tarjeta).join('');

$('#perfiles-org').innerHTML = perfiles.filter((p) => p.rol === 'admin').map((p) => {
  const org = orgs.find((o) => o.id === p.organizacion_id) || {};
  return `<button class="tarjeta clic" data-entrar="${p.id}" type="button" style="text-align:left;font:inherit">
    <div class="icono">${ICONO_ORG[org.tipo] || '🏢'}</div>
    <strong>${escapar(org.nombre || p.nombre)}</strong><br><span class="chico suave">${escapar(p.nombre)}</span>
    <div style="margin-top:8px"><span class="etiqueta">${TIPO_ORG[org.tipo] || 'Organización'}</span></div>
  </button>`;
}).join('');

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-entrar]');
  if (!b) return;
  const p = entrar(b.dataset.entrar);
  aviso(`Bienvenido, ${p.nombre.split(' ')[0]}`, 'ok');
  setTimeout(() => { location.href = PAGINA_POR_ROL[p.rol]; }, 400);
});

// Formulario de correo/contraseña (demo):
// - Con el acceso de la dueña (correo + clave de accesos_demo) se abre el selector de vistas.
// - Con el correo de un perfil de prueba entra directo a su espacio (sin contraseña).
const accesos = api.listar('accesos_demo');
$('#form-acceso').addEventListener('submit', (e) => {
  e.preventDefault();
  const correo = $('#a-correo').value.trim().toLowerCase();
  const clave = $('#a-clave').value;
  if (!correo) { aviso('Escribe tu correo o elige un perfil de prueba', 'error'); return; }
  const duena = accesos.find((a) => a.correo === correo);
  if (duena) {
    if (clave !== duena.clave) { aviso('Contraseña incorrecta', 'error'); $('#a-clave').focus(); return; }
    sessionStorage.setItem('infancia_duena', duena.nombre);
    aviso(`Bienvenida, ${duena.nombre}`, 'ok');
    mostrarSelector(duena.nombre);
    return;
  }
  const p = perfiles.find((x) => x.correo === correo);
  if (!p) { aviso('Ese correo no está en los perfiles de prueba. Elige uno de abajo.', 'error'); return; }
  entrar(p.id);
  location.href = PAGINA_POR_ROL[p.rol];
});

function mostrarSelector(nombre) {
  const av = $('#acceso-aviso');
  av.textContent = `Hola, ${nombre}. Elige qué vista quieres recorrer; puedes volver aquí y cambiar de perfil cuando quieras.`;
  av.classList.remove('oculto');
  $('#form-acceso').reset();
  document.getElementById('perfiles-prueba').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
if (sessionStorage.getItem('infancia_duena') && !sesionActual()) mostrarSelector(sessionStorage.getItem('infancia_duena'));

// Si ya hay sesión, ofrecemos ir directo
const s = sesionActual();
if (s) {
  const av = $('#acceso-aviso');
  av.innerHTML = `Ya estás dentro como ${escapar(s.perfil.nombre)}. <a href="${PAGINA_POR_ROL[s.rol]}">Ir a mi espacio</a>`;
  av.classList.remove('oculto');
}
