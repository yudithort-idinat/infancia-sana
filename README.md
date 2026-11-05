# Infancia Sana · MYO Genetics — versión 2 (demostración navegable)

Plataforma web de acompañamiento a familias durante los primeros años de vida (0 a 6 años, con una ruta complementaria de embarazo): educación, hábitos saludables y seguimiento preventivo. Incluye el recorrido «Descubre tu ruta», el registro de familias con varios menores, el programa **Infancia Sana** de 12 semanas por etapa (línea base, check-in semanal, logros, evaluación de cierre), una vista profesional (alertas, recomendaciones validadas, mediciones verificadas) y una vista de coordinación para escuelas, asociaciones civiles o gobierno con avance colectivo y reportes.

**Estado:** versión 2 de demostración. Toda la información (servicios, etapas, contenido de las semanas, indicadores, personas y casos) es de ejemplo y se validará con MYO Genetics antes de publicar.

## Demo en línea
**https://yudithort-idinat.github.io/infancia-sana/** — se republica sola con cada cambio en la rama `main`.

## Cómo verla en tu computadora
Los archivos usan módulos de JavaScript, así que no abren con doble clic. Sirve la carpeta con cualquier servidor estático, por ejemplo:

```
python -m http.server 8770
```

y abre `http://localhost:8770/web/index.html`.

Entra con los perfiles de prueba desde **Ingresa a tu familia** (`web/acceso.html`): tres familias, dos profesionales, tres organizaciones (escuela, A.C., gobierno) y un usuario adulto. No hay contraseñas en la demo. Para probar en orden, sigue `web/prueba.html`.

## Qué hay en cada carpeta
- `web/` — el sitio completo (HTML + CSS + JS sin compilación). Se publica tal cual en GitHub Pages o cualquier hosting estático.
- `web/assets/js/demo/base-falsa.js` — datos de ejemplo guardados en el navegador. Es la base de datos de la demo.
- `web/assets/js/programa.js` — reglas del programa (etapas, avance, puntaje, logros, alertas, métricas).
- `supabase/migrations/` — esquema propuesto para la base real (0001 núcleo, 0002 etapas y seguimiento).
- `supabase/seed/` — catálogos de ejemplo; `semilla_v2.sql` se genera con `node scripts/generar-semilla.mjs`.
- `docs/` — arquitectura, decisiones, preguntas abiertas y guía para el ingeniero que continúe el proyecto.

## Documentación
1. `docs/01-Arquitectura.md` — qué es, pantallas, roles, modelo de datos, stack.
2. `docs/02-Preguntas-abiertas.md` — lo que MYO Genetics aún tiene que definir.
3. `docs/03-Decisiones.md` — bitácora de decisiones.
4. `docs/04-Guia-para-el-ingeniero.md` — cómo continuar: Supabase, GitHub Pages, autenticación, qué cambiar y qué no.
5. `docs/05-Solicitud-de-mejoras-v2.md` — qué pidió MYO Genetics para la versión 2, qué se hizo y qué queda abierto.
