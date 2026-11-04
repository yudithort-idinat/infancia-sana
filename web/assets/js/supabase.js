// FASE 2 (pendiente): fuente de datos real.
// Cuando exista el proyecto de Supabase de MYO Genetics, aquí va la conexión y una
// implementación con la misma forma que `baseFalsa` (listar / obtener / insertar /
// actualizar / eliminar). Después, en api.js, se cambia `const fuente = baseFalsa`
// por esta. Las páginas no se tocan.
//
// Solo van aquí la URL del proyecto y la llave pública (anon). Nunca la llave de servicio.
//
// Proyecto de MYO Genetics (montado el 3-nov-2026, migración 0001 y semilla ya aplicadas):
export const SUPABASE_URL = 'https://oraiojohfzfjmdrldlcu.supabase.co';
// La llave pública se copia del tablero de Supabase: Project Settings → API Keys (anon / publishable).
export const SUPABASE_LLAVE_PUBLICA = 'PEGAR-AQUI-LA-LLAVE-PUBLICA';
//
// Ejemplo de forma esperada (no activo todavía):
//
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// const supabase = createClient(SUPABASE_URL, SUPABASE_LLAVE_PUBLICA);
// export const baseReal = {
//   async listar(tabla, filtro = {}) { let q = supabase.from(tabla).select('*'); for (const [k, v] of Object.entries(filtro)) q = q.eq(k, v); const { data, error } = await q; if (error) throw error; return data; },
//   async obtener(tabla, id) { const { data } = await supabase.from(tabla).select('*').eq('id', id).maybeSingle(); return data; },
//   async insertar(tabla, fila) { const { data, error } = await supabase.from(tabla).insert(fila).select().single(); if (error) throw error; return data; },
//   async actualizar(tabla, id, cambios) { const { data, error } = await supabase.from(tabla).update(cambios).eq('id', id).select().single(); if (error) throw error; return data; },
//   async eliminar(tabla, id) { const { error } = await supabase.from(tabla).delete().eq('id', id); if (error) throw error; },
// };
//
// Nota para el ingeniero: la base falsa es síncrona y la real será asíncrona (promesas).
// Al migrar, convertir las llamadas de las páginas a `await` (son pocas y están todas
// concentradas en los archivos de assets/js/*.js que llaman a `api.`).
export const pendiente = true;
