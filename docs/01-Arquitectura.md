# 01 · Arquitectura — Infancia Sana (MYO Genetics), versión 1

Documento rector. Se construyó a partir del documento de referencia de MYO Genetics («Documento de referencia para desarrollo de una versión navegable», noviembre 2026), cuyo propósito es **evaluar estructura, pantallas, navegación y experiencia de uso** con información de ejemplo.

## 1. Qué es
Una experiencia web con cuatro capas:
1. **Página pública** con la marca, propuesta de valor, áreas de interés (objetivos), servicios y contacto.
2. **Recorrido «Descubre tu ruta»** para visitantes sin cuenta: objetivo → preguntas → resumen → acción.
3. **Espacio de usuarios registrados** con cuatro tipos de perfil: usuario adulto, familia, profesional y administración (escuela / A.C. / gobierno).
4. **Programa Infancia Sana**: programa educativo de 12 semanas para familias con menores, con registro semanal de hábitos y gráfica de avance.

## 2. Pantallas (archivos en `web/`)
| Archivo | Quién la ve | Qué hace |
|---|---|---|
| `index.html` | Todos | Encabezado, presentación, objetivos (al elegir uno muestra su detalle y «Continuar»), servicios («Conocer más» / «Solicitar orientación»), contacto con confirmación. |
| `ruta.html` | Visitantes | Recorrido de 5 pasos: Bienvenida, Objetivo, Preguntas (una a la vez, con avance y Anterior/Siguiente), Resumen, Acción final (Solicitar orientación / Ver servicios / Volver a empezar). |
| `acceso.html` | Todos | Entrada diferenciada: visitante, usuario registrado (formulario ilustrativo) y perfiles de prueba; sección aparte para escuelas / A.C. / gobierno. |
| `usuario.html` | Usuario adulto | Pestañas Inicio (saludo, objetivo principal, próximos pasos, documentos), Perfil (datos editables, objetivos, historial), Servicios (solicitados y disponibles con estado), Seguimiento (actividades, calendario, progreso, recordatorios). |
| `familia.html` | Familia | Panel del responsable (perfiles de menores, semana activa, pendientes, progreso general) → perfil del menor (edad, etapa, objetivos) → programa de 12 semanas (contenido, actividad, registro semanal, «completar semana» con confirmación) → gráfica de avance. |
| `profesional.html` | Profesional | Lista de casos asignados, ficha de seguimiento (persona, menor, servicios), estado y próxima actividad editables, notas. |
| `admin.html` | Administración | Resumen, usuarios de la organización, catálogo de servicios (activar / desactivar), contenidos y programas, actividad general (incluye recorridos y mensajes de contacto). |

Comportamiento común (sección 6 del documento de referencia): todos los botones conducen a algo; siempre hay forma de volver al inicio o al paso anterior; misma identidad visual; se adapta a celular; muestra estados vacíos, avances completados y mensajes ante campos incompletos.

## 3. Roles y aislamiento
| Rol | Ve | Filtro en datos |
|---|---|---|
| visitante | Página pública y recorrido | ninguno (no guarda datos personales) |
| usuario | Su espacio | `perfil_id = yo` |
| familia | Su panel y sus menores | `responsable_id = yo` |
| profesional | Sus casos | `profesional_id = yo` |
| admin | Su organización | `organizacion_id = la mía` |

En la demo el filtro lo hacen las páginas y `auth.js` (sesión en `sessionStorage`). En la base real lo hace **RLS en Supabase** (ver `supabase/migrations/0001_nucleo.sql`). Un perfil nunca debe poder abrir datos de otro cambiando la URL: `familia.html#menor=…` y `profesional.html#caso=…` verifican la pertenencia.

## 4. Modelo de datos (tablas)
Todas existen en `base-falsa.js` (demo) y en la migración 0001 (real).

- `organizaciones` (id, nombre, tipo: escuela | ac | gobierno)
- `perfiles` (id, rol: usuario | familia | profesional | admin, nombre, correo, teléfono, fecha_nacimiento, ciudad, objetivo_principal, organizacion_id, objetivos[], especialidad)
- `objetivos` — áreas de interés del recorrido (id, icono, nombre, descripción, para_quien, servicios[], preguntas[], orientación)
- `servicios` — catálogo (id, nombre, descripción, para_quien, disponible, ejemplo)
- `solicitudes` — servicios pedidos por un perfil (perfil_id, servicio_id, estado, fecha)
- `actividades` — seguimiento del usuario (perfil_id, título, fecha, estado, tipo: tarea | cita)
- `documentos` (perfil_id, nombre, tipo, fecha)
- `recordatorios` (perfil_id, texto, cuándo)
- `menores` (responsable_id, nombre, edad, etapa, objetivos[])
- `programa_semanas` — las 12 semanas (número, título, contenido, actividad)
- `avance_semanal` (menor_id, semana, completada, fecha)
- `registros_habitos` (menor_id, semana, sueño, frutas_verduras, juego_activo, pantallas, agua, fecha)
- `casos` (profesional_id, perfil_id, menor_id, título, estado, próxima_actividad, próxima_fecha)
- `notas_caso` (caso_id, fecha, texto)
- `contenidos` (organizacion_id, título, tipo, estado)
- `programas` (organizacion_id, nombre, semanas, familias, estado)
- `actividad_general` (organizacion_id, fecha, texto)
- `mensajes_contacto` (nombre, correo, teléfono, asunto, mensaje, fecha, estado)
- `recorridos` (fecha, objetivo_id, respuestas) — anónimos

**Avance del programa:** semanas completadas = filas de `avance_semanal` con `completada = true`; semana activa = completadas + 1; una semana solo se puede completar si es la activa (las posteriores están bloqueadas). **Puntaje de hábitos** (gráfica): fórmula de ejemplo en `familia.js` → `grafica()`; MYO Genetics definirá la real.

## 5. Stack y estructura
- Frontend plano: HTML + CSS (`assets/css/infancia.css`, variables en `:root`) + JS por módulos ES (`assets/js/*.js`). Sin compilación.
- Datos: `api.js` es la única puerta. Fuente actual: `demo/base-falsa.js` (localStorage, semilla con `VER`). Fuente futura: `supabase.js`.
- Sesión: `auth.js` (`sessionStorage`). Futuro: Supabase Auth.
- Publicación: cualquier hosting estático (GitHub Pages desde `main`, carpeta raíz, abriendo `web/index.html`).
- Identidad visual: provisional (verde azulado + durazno, tipografía del sistema). Cuando MYO Genetics entregue logo y colores, se cambian las variables de `:root` y el logotipo del encabezado en `ui.js`.

## 6. Contenido de ejemplo (por validar)
- 4 áreas de interés: Nutrición y hábitos · Infancia sana · Bienestar y energía · Salud familiar, con 3–4 preguntas cada una.
- 5 servicios: Orientación inicial · Perfil de hábitos y nutrición · Programa Infancia Sana (12 semanas) · Acompañamiento a escuelas y organizaciones · Seguimiento profesional.
- 12 semanas del programa (títulos, contenido breve y actividad).
- Personas: Ana Torres (usuario), Carlos Pérez (usuario), Laura Méndez (familia: Sofía 7, Diego 4), Dra. Elena Ruiz (profesional), tres organizaciones.
Todo está marcado con la etiqueta «ejemplo» en pantalla.
