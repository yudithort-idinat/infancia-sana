# Infancia Sana · MYO Genetics — versión 1 (demostración navegable)

Plataforma web para que una persona descubra áreas de interés, conozca los servicios de MYO Genetics y entre a un espacio personal de seguimiento. Incluye el área familiar con el programa educativo **Infancia Sana** (12 semanas), una vista profesional y una vista de administración para escuelas, asociaciones civiles o gobierno.

**Estado:** versión 1 de demostración. Toda la información (servicios, áreas, contenido de las 12 semanas, personas y casos) es de ejemplo y se validará con MYO Genetics antes de publicar.

## Cómo verla
Los archivos usan módulos de JavaScript, así que no abren con doble clic. Sirve la carpeta con cualquier servidor estático, por ejemplo:

```
python -m http.server 8770
```

y abre `http://localhost:8770/web/index.html`.

Entra con los perfiles de prueba desde **Entrar** (`web/acceso.html`): usuario adulto, familia, profesional y tres organizaciones (escuela, A.C., gobierno). No hay contraseñas en la demo.

## Qué hay en cada carpeta
- `web/` — el sitio completo (HTML + CSS + JS sin compilación). Se publica tal cual en GitHub Pages o cualquier hosting estático.
- `web/assets/js/demo/base-falsa.js` — datos de ejemplo guardados en el navegador. Es la base de datos de la demo.
- `supabase/migrations/` — esquema propuesto para la base real (fase 2).
- `docs/` — arquitectura, decisiones, preguntas abiertas y guía para el ingeniero que continúe el proyecto.

## Documentación
1. `docs/01-Arquitectura.md` — qué es, pantallas, roles, modelo de datos, stack.
2. `docs/02-Preguntas-abiertas.md` — lo que MYO Genetics aún tiene que definir.
3. `docs/03-Decisiones.md` — bitácora de decisiones.
4. `docs/04-Guia-para-el-ingeniero.md` — cómo continuar: Supabase, GitHub Pages, autenticación, qué cambiar y qué no.
