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
  assets/js/publico.js ruta.js acceso.js usuario.js familia.js profesional.js admin.js
  assets/js/demo/base-falsa.js   ← semilla + persistencia en localStorage (demo)
  assets/js/supabase.js          ← pendiente: fuente real
supabase/migrations/0001_nucleo.sql  ← esquema propuesto + RLS
docs/                                ← este material
```

## 3. Dónde está publicado (hecho el 3-nov-2026)
- **Repositorio:** `https://github.com/yudithort-idinat/infancia-sana` (cuenta de MYO Genetics). Un `git push` a `main` republica la demo en uno o dos minutos.
- **Demo pública (GitHub Pages):** `https://yudithort-idinat.github.io/infancia-sana/` → redirige a `web/index.html`. Configurado en Settings → Pages: *Deploy from a branch*, rama `main`, carpeta `/ (root)`.
- **Supabase:** proyecto `oraiojohfzfjmdrldlcu` en la organización de MYO Genetics (`https://oraiojohfzfjmdrldlcu.supabase.co`, plan Free, región us-east-2). Ya tiene aplicadas la migración `0001_nucleo.sql` (19 tablas, RLS con 38 políticas) y la semilla `semilla.sql` (5 servicios, 4 objetivos, 12 semanas). La migración está registrada en `supabase_migrations.schema_migrations`.
- ⚠️ El plan Free **pausa el proyecto tras una semana sin uso**; se reanuda desde el tablero con un clic (los datos se conservan). Mientras la demo corra con la base falsa, es normal que esté pausado.

## 4. Conectar la base real (Supabase) — lo que sigue
1. ~~Crear el proyecto~~ Hecho.
2. ~~Ejecutar `0001_nucleo.sql`~~ Hecho. Las migraciones siguientes se numeran 0002, 0003… y **una migración aplicada no se edita**.
3. ~~Cargar `semilla.sql`~~ Hecho.
4. En `web/assets/js/supabase.js` ya está la URL del proyecto. Falta pegar la **llave pública** (Project Settings → API Keys → *anon* o *publishable*). Nunca la llave de servicio (*service_role* / *secret*).
5. Implementar `baseReal` con las mismas cinco funciones que `baseFalsa` (`listar`, `obtener`, `insertar`, `actualizar`, `eliminar`). Hay un ejemplo comentado en el archivo.
6. En `api.js` cambiar `const fuente = baseFalsa` por `baseReal`.
7. **Importante:** la base falsa es síncrona; Supabase es asíncrono. Las páginas llaman `api.listar(...)` sin `await`. Al migrar, convertir esas llamadas a `await` (están concentradas en los siete archivos de página y en `avanceMenor` de `api.js`). Es trabajo mecánico; no cambia la lógica.
8. Autenticación: sustituir `auth.js` por Supabase Auth (correo + contraseña o enlace mágico). La tabla `perfiles` lleva `auth_id` para ligar cada perfil a su usuario de Auth; la página de acceso deja de mostrar perfiles de prueba.

## 5. Seguridad que ya está prevista
- RLS activo en todas las tablas de datos personales. Las políticas de la migración 0001 implementan la regla «cada perfil ve solo lo suyo» (ver `docs/01-Arquitectura.md` § 3). Revisarlas y probarlas con usuarios reales antes de abrir la plataforma.
- Los catálogos (`objetivos`, `servicios`, `programa_semanas`) son de lectura pública y escritura solo para administración.
- `mensajes_contacto` y `recorridos` aceptan inserción anónima (formulario público) y lectura solo de administración.
- Son datos de menores y de salud: no copiar datos reales a pruebas ni capturas.

## 6. Por dónde seguir (sugerencias, no compromisos)
- Contenido real: servicios, áreas, preguntas y las 12 semanas (ver `docs/02-Preguntas-abiertas.md`).
- Identidad visual: logo y colores en `infancia.css` y `ui.js` (`montarEncabezado`).
- Correos (invitaciones, recordatorios semanales) con un proveedor como Resend o Postmark, desde Edge Functions.
- Documentos reales en Supabase Storage con políticas por perfil.
- Exportar reportes (PDF / CSV) para la vista de administración.
- Notificaciones push o WhatsApp para recordatorios del programa.

## 7. Qué NO hacer
- No instalar frameworks ni herramientas de compilación sin un motivo de peso: el proyecto es plano a propósito para que sea barato de mantener.
- No poner llaves secretas en el repositorio.
- No tocar producción «para ver si funciona»: primero local, luego la base real.
