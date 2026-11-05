# CLAUDE.md — Infancia Sana (MYO Genetics)

Eres el ingeniero de cabecera de la plataforma Infancia Sana de MYO Genetics. Este archivo te dice cómo trabajar aquí.

## Antes de cualquier tarea
1. Lee `docs/01-Arquitectura.md` (mapa completo: pantallas, roles, datos, stack).
2. Lee las últimas entradas de `docs/03-Decisiones.md`.
3. Si la tarea toca algo listado en `docs/02-Preguntas-abiertas.md`, usa el supuesto indicado o pregunta; no inventes una respuesta nueva.
4. Si vas a publicar o conectar la base real, lee `docs/04-Guia-para-el-ingeniero.md`.

## Reglas
- **Es una demostración con datos de ejemplo.** Nada aquí es contenido validado por MYO Genetics. No presentes los servicios, las preguntas ni el programa de 12 semanas como definitivos.
- **Plano a propósito.** HTML + CSS + JavaScript por módulos, sin frameworks ni compilación. No instales React, Vite, npm build ni similares.
- **Una sola puerta a los datos:** `web/assets/js/api.js`. Las páginas nunca hablan con la base directamente. Hoy la fuente es `demo/base-falsa.js`; en fase 2 será Supabase (`supabase.js`).
- **Cada perfil ve solo lo suyo.** Las páginas filtran por `perfil_id`, `responsable_id`, `profesional_id` u `organizacion_id`. En la base real esto se refuerza con RLS (ver migración 0001).
- **Todo botón hace algo.** Si una función aún no existe, el botón muestra un aviso claro («se definirá con MYO Genetics»), nunca queda decorativo.
- **Sin secretos en el repo.** Solo URL del proyecto y llave pública (anon) en el frontend.
- **Si cambias la semilla** de `base-falsa.js`, sube la constante `VER` para que los navegadores recarguen los datos y regenera `supabase/seed/semilla_v2.sql` con `node scripts/generar-semilla.mjs`.
- **Las reglas del programa viven en `web/assets/js/programa.js`** (etapa por edad, avance, puntaje por etapa, logros, pendientes, alertas, métricas). No las dupliques en las páginas.
- **Datos de menores y de salud.** Ningún perfil de menor sin consentimiento del responsable; la familia solo ve recomendaciones validadas por un profesional; gobierno solo ve cifras agregadas.

## Cómo correr en local
```
python -m http.server 8770
```
Abre `http://localhost:8770/web/index.html`. Prueba también en ancho de celular (390 px).

## Cómo trabajar
- Cambios chicos: edita, prueba en local, commit con mensaje claro en español.
- Cambios de datos: actualiza `base-falsa.js` (y `VER`), la migración correspondiente en `supabase/migrations/` y `docs/01-Arquitectura.md`. Anota la decisión en `docs/03-Decisiones.md`.
- Al terminar algo que MYO Genetics va a ver, explícalo en lenguaje llano: qué puede hacer y qué no puede hacer todavía.
