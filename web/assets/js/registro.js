// Registro de una familia (demo): crea el perfil del responsable y entra al área familiar.
// Fase 2: aquí se crea la cuenta en Supabase Auth y el perfil ligado por auth_id.
import { api, hoyISO } from './api.js';
import { entrar } from './auth.js';
import { etapasTodas } from './programa.js';
import { $, escapar, montarEncabezado, montarPie, aviso, validar, datosFormulario } from './ui.js';

montarEncabezado('registro');
montarPie();

const etapas = etapasTodas();
const sel = $('#r-etapa');
sel.innerHTML = '<option value="">Elige una etapa</option>' + etapas.map((e) => `<option value="${e.id}">${e.icono} ${escapar(e.nombre)}</option>`).join('');
const param = new URLSearchParams(location.search).get('etapa');
if (param) sel.value = param;

$('#form-registro').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  if (!validar(form)) { aviso('Revisa los campos marcados', 'error'); return; }
  const d = datosFormulario(form);
  const correo = d.correo.toLowerCase();
  if (api.listar('perfiles').some((p) => p.correo === correo)) { aviso('Ese correo ya está registrado. Entra con «Ya tengo cuenta».', 'error'); return; }
  const perfil = api.insertar('perfiles', { rol: 'familia', nombre: d.nombre, correo, telefono: d.telefono || '', relacion: d.relacion, etapa_preferida: d.etapa_id || null, organizacion_id: null, objetivos: [], consentimiento: { fecha: hoyISO(), version: 'ejemplo-1' } });
  entrar(perfil.id);
  sessionStorage.setItem('infancia_bienvenida', perfil.id);
  sessionStorage.setItem('infancia_etapa_sugerida', d.etapa_id || '');
  aviso(`Bienvenida, ${d.nombre.split(' ')[0]}`, 'ok');
  setTimeout(() => { location.href = 'familia.html'; }, 500);
});
