// Sesión de demostración. Fase 2: aquí se conecta Supabase Auth; las páginas no cambian.
import { api } from './api.js';

const CLAVE = 'infancia_sesion';

export const PAGINA_POR_ROL = {
  usuario: 'usuario.html',
  familia: 'familia.html',
  profesional: 'profesional.html',
  admin: 'admin.html',
};

export function sesionActual() {
  try {
    const s = JSON.parse(sessionStorage.getItem(CLAVE) || 'null');
    if (!s) return null;
    const perfil = api.obtener('perfiles', s.perfil_id);
    if (!perfil) return null;
    return { ...s, perfil };
  } catch (e) { return null; }
}

export function entrar(perfil_id) {
  const perfil = api.obtener('perfiles', perfil_id);
  if (!perfil) throw new Error('Perfil no encontrado');
  sessionStorage.setItem(CLAVE, JSON.stringify({ perfil_id, rol: perfil.rol }));
  return perfil;
}

export function salir() {
  sessionStorage.removeItem(CLAVE);
  location.href = 'index.html';
}

// Protege una página: si no hay sesión o el rol no corresponde, manda al acceso.
// Devuelve la sesión (con el perfil completo) cuando todo está en orden.
export function requerir(rol) {
  const s = sesionActual();
  if (!s || (rol && s.rol !== rol)) {
    location.replace(`acceso.html?para=${rol || ''}`);
    return null;
  }
  return s;
}
