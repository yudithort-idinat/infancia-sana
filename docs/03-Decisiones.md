# 03 · Decisiones

Bitácora corta. Lo más reciente arriba.

## 2026-11-05 — Migración 0002 aplicada en Supabase
- Antes de correrla se confirmó con una consulta de solo lectura que las tablas de datos estaban vacías (solo catálogos de ejemplo), así que quitar columnas no perdió información.
- Se aplicaron la 0002 y la semilla v2 desde el SQL Editor y se registró la versión `0002` en el historial. El esquema de la base ya coincide con la versión 2 de la demo.
- La demo sigue corriendo con la base falsa del navegador; conectar el frontend sigue siendo trabajo del ingeniero.

## 2026-11-04 — Versión 2: solicitud de mejoras de MYO Genetics
- El foco pasa a **familias con menores de 0 a 6 años**, con cinco etapas (embarazo como ruta complementaria, 0–6 meses, 6–12 meses, 1–3 años, 3–6 años). La etapa se calcula con la fecha de nacimiento; ya no se captura edad.
- El programa de 12 semanas es **por etapa**: 60 semanas de ejemplo, cada una con objetivo, microcontenido, actividad, materiales y pregunta de check-in. Los indicadores, metas y pesos del puntaje también son por etapa.
- Se agregan **línea base** (obligatoria para abrir la semana 1) y **evaluación de cierre** para el antes/después.
- **Mediciones verificadas** (profesional) separadas de las **reportadas** (familia). **Recomendaciones**: el sistema sugiere, el profesional valida y solo entonces la familia las ve.
- Instituciones con **permisos distintos**; gobierno ve solo cifras agregadas, sin nombres (`organizaciones.alcance = 'agregado'`).
- Reglas del programa concentradas en `web/assets/js/programa.js` para que el ingeniero las ajuste en un solo lugar.
- Identidad: se adoptan los **colores del isotipo de MYO Genetics** (púrpura y turquesa). El logo llegó como imagen pegada en una conversación, no como archivo: `logo.svg` es una aproximación vectorial hasta tener el original.
- Personaje «Brote»: propuesta discreta, por validar.
- Base real: migración `0002_etapas_y_seguimiento.sql` y `supabase/seed/semilla_v2.sql` (generada con `scripts/generar-semilla.mjs`). Estado de aplicación en `docs/04` § 3.
- Detalle punto por punto en `docs/05-Solicitud-de-mejoras-v2.md`.

## 2026-11-03 — Montado en las cuentas de MYO Genetics
- Repositorio público `yudithort-idinat/infancia-sana` con GitHub Pages desde `main` (demo en `https://yudithort-idinat.github.io/infancia-sana/`). Público porque el plan gratuito de GitHub solo publica Pages de repos públicos; no contiene datos personales ni secretos.
- Se reutilizó el proyecto de Supabase que ya existía en su organización (estaba pausado y vacío) en lugar de crear otro: evita una contraseña nueva de base de datos. Migración 0001 y semilla aplicadas desde el SQL Editor.
- La demo sigue corriendo con la base falsa del navegador. Conectarla a Supabase (llave pública, llamadas asíncronas, Supabase Auth) queda para el ingeniero: `docs/04-Guia-para-el-ingeniero.md` § 4.

## 2026-11-03 — Arranque de la versión 1
- El proyecto se llama **Infancia Sana** (nombre dado por MYO Genetics); la marca institucional es MYO Genetics.
- **Entrega final = demo navegable + repositorio documentado para un ingeniero.** MYO Genetics no va a programar ni usar IA; quiere ver la demo y con ella pedir una cotización de mejoras. Por eso toda la documentación está escrita para una persona técnica, no para un asistente.
- Stack plano (HTML/CSS/JS, sin frameworks) y una sola puerta a los datos (`api.js`), para que cualquier ingeniero lo entienda y lo conecte a Supabase sin reescribir las pantallas.
- Primero local con base falsa; después se sube al GitHub y al Supabase de MYO Genetics (fase 2). Las cuentas las abre MYO Genetics y agrega como colaborador a quien construya.
- Todo el contenido es de ejemplo y se marca así en pantalla (etiqueta «ejemplo» y franja superior «Versión 1 de demostración»).
- Identidad visual provisional porque MYO Genetics aún no entrega logo ni colores.
- Para la demo, cada «Entrar» abre un perfil de prueba sin contraseña; el formulario de correo/contraseña es ilustrativo (acepta los correos de los perfiles de prueba).
