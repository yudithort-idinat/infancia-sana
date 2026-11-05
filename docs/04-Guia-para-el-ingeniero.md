# 04 · Guía para el ingeniero que continúe Infancia Sana

Esta guía está pensada para la persona técnica que MYO Genetics contrate para mejorar la plataforma. Explica cómo está hecho, cómo se publica y por dónde conviene seguir.

## 1. Cómo correrlo
```
git clone <repositorio>
cd infancia-sana
python -m http.server 8770
```
Abre `http://localhost:8770/web/index.html`. Cualquier servidor estático sirve (Node `npx serve`, nginx, Live Server). No hay dependencias ni paso de compilación.

## 2. Estructura
```
web/
  index.html  ruta.html  acceso.html  usuario.html  familia.html  profesional.html  admin.html
  assets/css/infancia.css        ← estilos; identidad en :root
  assets/js/api.js               ← ÚNICA puerta a los datos
  assets/js/auth.js              ← sesión (demo: sessionStorage)
  assets/js/ui.js                ← encabezado, pie, avisos, ventanas, validación, pestañas
  registro.html  reporte.html  privacidad.html  prueba.html
  assets/js/programa.js          ← reglas del programa (etapas, avance, puntaje, logros, alertas, métricas)
  assets/js/publico.js ruta.js registro.js acceso.js usuario.js familia.js profesional.js admin.js reporte.js
  assets/img/logo.svg            ← isotipo (aproximación vectorial; sustituir por el original)
  assets/js/demo/base-falsa.js   ← semilla + persistencia en localStorage (demo)
  assets/js/supabase.js          ← pendiente: fuente real
supabase/migrations/0001_nucleo.sql  ← esquema base + RLS
supabase/migrations/0002_etapas_y_seguimiento.sql  ← versión 2: etapas, evaluaciones, mediciones, recomendaciones
supabase/seed/semilla.sql, semilla_v2.sql          ← catálogos de ejemplo
scripts/generar-semilla.mjs          ← regenera semilla_v2.sql desde la demo
docs/                                ← este material
```

## 3. Dónde está publicado (hecho el 3-nov-2026)
- **Repositorio:** `https://github.com/yudithort-idinat/infancia-sana` (cuenta de MYO Genetics). Un `git push` a `main` republica la demo en uno o dos minutos.
- **Demo pública (GitHub Pages):** `https://yudithort-idinat.github.io/infancia-sana/` → redirige a `web/index.html`. Configurado en Settings → Pages: *Deploy from a branch*, rama `main`, carpeta `/ (root)`.
- **Supabase:** proyecto `oraiojohfzfjmdrldlcu` en la organización de MYO Genetics (`https://oraiojohfzfjmdrldlcu.supabase.co`, plan Free, región us-east-2). Tiene aplicadas las migraciones `0001_nucleo.sql` y `0002_etapas_y_seguimiento.sql` con sus semillas (detalle abajo).
- **Versión 2 aplicada el 5-nov-2026:** `0002_etapas_y_seguimiento.sql` y `supabase/seed/semilla_v2.sql` ya corrieron en el proyecto desde el SQL Editor. Estado verificado: 23 tablas en `public`, todas con RLS, 47 políticas, 5 etapas, 60 semanas (12 por etapa), migraciones `0001` y `0002` registradas en `supabase_migrations.schema_migrations`. El catálogo `servicios` conserva los 5 de la versión 1 (la demo muestra 6): actualizarlo cuando MYO Genetics defina los reales.
- ⚠️ El plan Free **pausa el proyecto tras una semana sin uso**; se reanuda desde el tablero con un clic (los datos se conservan). Mientras la demo corra con la base falsa, es normal que esté pausado.

## 4. Conectar la base real (Supabase) — lo que sigue
1. ~~Crear el proyecto~~ Hecho.
2. ~~Ejecutar `0001_nucleo.sql`~~ Hecho. Las migraciones siguientes se numeran 0002, 0003… y **una migración aplicada no se edita**.
3. ~~Cargar `semilla.sql`~~ Hecho.
3b. ~~Aplicar `0002_etapas_y_seguimiento.sql` y `semilla_v2.sql`~~ Hecho el 5-nov-2026. **Pendiente:** una función `security definer` para las cifras agregadas de gobierno (ver comentario al final de la 0002) y probar las políticas RLS con usuarios reales de cada rol.
4. En `web/assets/js/supabase.js` ya está la URL del proyecto. Falta pegar la **llave pública** (Project Settings → API Keys → *anon* o *publishable*). Nunca la llave de servicio (*service_role* / *secret*).
5. Implementar `baseReal` con las mismas cinco funciones que `baseFalsa` (`listar`, `obtener`, `insertar`, `actualizar`, `eliminar`). Hay un ejemplo comentado en el archivo.
6. En `api.js` cambiar `const fuente = baseFalsa` por `baseReal`.
7. **Importante:** la base falsa es síncrona; Supabase es asíncrono. Las páginas llaman `api.listar(...)` sin `await`. Al migrar, convertir esas llamadas a `await` (están concentradas en los siete archivos de página y en `avanceMenor` de `api.js`). Es trabajo mecánico; no cambia la lógica.
8. Acceso de demostración: en `base-falsa.js` → `accesos_demo` está el correo y la clave con los que la dueña entra a la demo y elige vista. Es solo para la demo (no hay cuenta real detrás). Al conectar Auth, eliminarlo.
9. Autenticación: sustituir `auth.js` por Supabase Auth (correo + contraseña o enlace mágico). La tabla `perfiles` lleva `auth_id` para ligar cada perfil a su usuario de Auth; la página de acceso deja de mostrar perfiles de prueba.

## 5. Seguridad que ya está prevista
- RLS activo en todas las tablas de datos personales. Las políticas de la migración 0001 implementan la regla «cada perfil ve solo lo suyo» (ver `docs/01-Arquitectura.md` § 3). Revisarlas y probarlas con usuarios reales antes de abrir la plataforma.
- Los catálogos (`objetivos`, `servicios`, `programa_semanas`) son de lectura pública y escritura solo para administración.
- `mensajes_contacto` y `recorridos` aceptan inserción anónima (formulario público) y lectura solo de administración.
- Son datos de menores y de salud: no copiar datos reales a pruebas ni capturas.

## 6. Por dónde seguir (sugerencias, no compromisos)
- Contenido real: servicios, áreas, preguntas y las 12 semanas (ver `docs/02-Preguntas-abiertas.md`).
- Identidad visual: ya usa los colores del isotipo de MYO Genetics; falta sustituir `web/assets/img/logo.svg` (aproximación) por el logo original.
- Reglas reales del programa (metas por edad, alertas, recomendaciones) en `web/assets/js/programa.js`, validadas por profesionales.
- Consentimiento verificable por correo y aviso de privacidad revisado legalmente (`web/privacidad.html`).
- Correos (invitaciones, recordatorios semanales) con un proveedor como Resend o Postmark, desde Edge Functions.
- Documentos reales en Supabase Storage con políticas por perfil.
- Exportar reportes (PDF / CSV) para la vista de administración.
- Notificaciones push o WhatsApp para recordatorios del programa.

## 7. Qué NO hacer
- No instalar frameworks ni herramientas de compilación sin un motivo de peso: el proyecto es plano a propósito para que sea barato de mantener.
- No poner llaves secretas en el repositorio.
- No tocar producción «para ver si funciona»: primero local, luego la base real.
