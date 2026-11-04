# 03 · Decisiones

Bitácora corta. Lo más reciente arriba.

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
