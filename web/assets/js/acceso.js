// Acceso con perfiles de prueba (demo). Fase 2: Supabase Auth en el formulario.
import { api } from './api.js';
import { entrar, sesionActual, PAGINA_POR_ROL } from './auth.js';
import { etapaDe, edadTexto } from './programa.js';
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
const TIPO_ORG = { escuela: 'Escuela / centro infantil', ac: 'Asociación civil', gobierno: 'Gobierno' };
const ICONO_ORG = { escuela: '🏫', ac: '🤝', gobierno: '🏛️' };

function tarjetaFamilia(p) {
  const menores = api.listar('menores', { responsable_id: p.id });
  return `<button class="tarjeta clic" data-entrar="${p.id}" type="button" style="text-align:left;font:inherit">
    <div class="fila"><span class="avatar">${iniciales(p.nombre)}</span><div><strong>${escapar(p.nombre)}</strong><br><span class="chico suave">${escapar(p.correo)}</span></div></div>
    <ul class="lista compacta" style="margin-top:8px">${menores.map((m) => { const e = etapaDe(m); return `<li><span class="punto-etapa" style="--color-etapa:${e.color};margin-top:7px"></span><div class="cuerpo chico">${escapar(m.nombre)} · ${escapar(edadTexto(m))} <span class="suave">(${escapar(e.corto)})</span></div></li>`; }).join('')}</ul>
    <span class="etiqueta acento">Familia</span>
  </button>`;
}
$('#perfiles-familia').innerHTML = perfiles.filter((p) => p.rol === 'familia' && ['f1', 'f2', 'f3'].includes(p.id)).map(tarjetaFamilia).join('');

$('#perfiles-prof').innerHTML = perfiles.filter((p) => p.rol === 'profesional').map((p) => `<button class="tarjeta clic" data-entrar="${p.id}" type="button" style="text-align:left;font:inherit">
    <div class="fila"><span class="avatar" style="background:var(--primario)">${iniciales(p.nombre)}</span><div><strong>${escapar(p.nombre)}</strong><br><span class="chico suave">${escapar(p.especialidad || '')}</span></div></div>
    <p class="chico" style="margin:10px 0 6px">🩺 ${api.listar('casos', { profesional_id: p.id }).length} familias o casos asignados, alertas y recomendaciones por validar.</p>
    <span class="etiqueta">Profesional</span></button>`).join('');

$('#perfiles-org').innerHTML = perfiles.filter((p) => p.rol === 'admin').map((p) => {
  const org = orgs.find((o) => o.id === p.organizacion_id) || {};
  return `<button class="tarjeta clic" data-entrar="${p.id}" type="button" style="text-align:left;font:inherit">
    <div class="icono sol">${ICONO_ORG[org.tipo] || '🏢'}</div>
    <strong>${escapar(org.nombre || p.nombre)}</strong><br><span class="chico suave">${escapar(p.nombre)}</span>
    <p class="chico suave" style="margin:8px 0 6px">${org.alcance === 'agregado' ? 'Solo cifras agregadas, sin nombres.' : 'Sus familias, avance colectivo y contenidos.'}</p>
    <span class="etiqueta">${TIPO_ORG[org.tipo] || 'Organización'}</span>
  </button>`;
}).join('');

$('#perfiles-usuario').innerHTML = perfiles.filter((p) => p.rol === 'usuario' && p.id === 'u1').map((p) => `<button class="tarjeta clic" data-entrar="${p.id}" type="button" style="text-align:left;font:inherit">
    <div class="fila"><span class="avatar" style="background:var(--tinta-suave)">${iniciales(p.nombre)}</span><div><strong>${escapar(p.nombre)}</strong><br><span class="chico suave">${escapar(p.correo)}</span></div></div>
    <p class="chico" style="margin:10px 0 6px">🙂 Inicio, perfil, servicios y seguimiento del adulto.</p>
    <span class="etiqueta gris">Usuario adulto</span></button>`).join('');

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-entrar]');
  if (!b) return;
  const p = entrar(b.dataset.entrar);
  aviso(`Bienvenido, ${p.nombre.split(' ')[0]}`, 'ok');
  setTimeout(() => { location.href = PAGINA_POR_ROL[p.rol]; }, 400);
});

// Formulario de correo/contraseña (demo):
// - Con el acceso de la dueña (correo + clave de accesos_demo) se abre el selector de vistas.
// - Con el correo de un perfil de prueba o de una familia registrada en la demo entra directo (sin contraseña).
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
  const p = api.listar('perfiles').find((x) => x.correo === correo);
  if (!p) { aviso('Ese correo no está registrado. Elige un perfil de prueba o registra a tu familia.', 'error'); return; }
  entrar(p.id);
  location.href = PAGINA_POR_ROL[p.rol];
});

function mostrarSelector(nombre) {
  const av = $('#acceso-aviso');
  av.textContent = `Hola, ${nombre}. Elige qué vista quieres recorrer; puedes volver aquí y cambiar de perfil cuando quieras.`;
  av.classList.remove('oculto');
  $('#form-acceso').reset();
  document.getElementById('perfiles-familia').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
if (sessionStorage.getItem('infancia_duena') && !sesionActual()) mostrarSelector(sessionStorage.getItem('infancia_duena'));

// Si ya hay sesión, ofrecemos ir directo
const s = sesionActual();
if (s) {
  const av = $('#acceso-aviso');
  av.innerHTML = `Ya estás dentro como ${escapar(s.perfil.nombre)}. <a href="${PAGINA_POR_ROL[s.rol]}">Ir a mi espacio</a>`;
  av.classList.remove('oculto');
}
