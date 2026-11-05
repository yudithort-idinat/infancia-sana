# 01 · Arquitectura — Infancia Sana (MYO Genetics), versión 2

Documento rector. La versión 1 se construyó a partir del «Documento de referencia para desarrollo de una versión navegable» de MYO Genetics; la versión 2 incorpora su «Solicitud de mejoras» (noviembre 2026, ver `docs/05-Solicitud-de-mejoras-v2.md`). El propósito sigue siendo **evaluar estructura, pantallas, navegación y experiencia de uso** con información de ejemplo.

## 1. Qué es
Una plataforma web de **acompañamiento a familias durante los primeros años de vida (0 a 6 años)** mediante educación, hábitos saludables y seguimiento preventivo. Está dirigida principalmente a **madres, padres y cuidadores**; profesionales e instituciones acompañan.

1. **Página pública**: propósito, el programa de 12 semanas como protagonista, etapas, para quién, servicios y contacto.
2. **Recorrido «Descubre tu ruta»** (sin cuenta): etapa → cuatro preguntas pertinentes a la edad → resultado orientativo → siguiente paso.
3. **Registro de familia**: una cuenta del responsable con varios menores.
4. **Área familiar**: bienvenida con «por dónde empezar», línea base, programa de 12 semanas **por etapa** con check-in, logros, recordatorios, mediciones, evaluación de cierre (antes/después) y reporte exportable.
5. **Vista profesional**: familias asignadas, alertas, recomendaciones por validar, mediciones verificadas, notas.
6. **Vista de coordinación** (escuela / A.C. / gobierno): permisos por tipo, avance colectivo (inscripción, participación, avance, conclusión) y reporte agregado.
7. **Espacio complementario** del usuario adulto (se conserva de la versión 1).

## 2. Etapas
| id | Etapa | Notas |
|---|---|---|
| `embarazo` | Embarazo y preparación familiar | Ruta educativa **complementaria**; el «menor» se registra con fecha probable de parto |
| `0-6m` | 0 a 6 meses | |
| `6-12m` | 6 a 12 meses | |
| `1-3a` | 1 a 3 años | |
| `3-6a` | 3 a 6 años | |

La etapa **se calcula con la fecha de nacimiento** (`programa.js` → `etapaDe`). Cada etapa define:
- sus **12 semanas** (`programa_semanas`: objetivo, microcontenido, actividad en casa, materiales opcionales, pregunta de check-in);
- sus **indicadores** del check-in (clave, etiqueta, unidad, rango, **meta** mínima o máxima y **peso**): por ejemplo lactantes registran tomas, sueño en 24 h, tiempo boca abajo y cero pantallas; 3–6 años registra sueño, frutas y verduras, agua, juego activo y pantallas con tope;
- sus **preguntas** del recorrido «Descubre tu ruta», con notas de orientación por opción.

El **puntaje** (0–100) se calcula por etapa con el cumplimiento de la meta de cada indicador ponderado por su peso (`programa.js` → `puntaje`). No se aplica la misma puntuación a todos los grupos. Las fórmulas son de ejemplo.

## 3. Pantallas (archivos en `web/`)
| Archivo | Quién | Qué hace |
|---|---|---|
| `index.html` | Todos | Héroe con propósito y tres llamadas («Conoce el programa», «Descubre tu ruta», «Ingresa a tu familia»), cómo funciona, anatomía de una semana, etapas (detalle con las 12 semanas e indicadores), para quién, servicios, contacto. |
| `ruta.html` | Visitantes | 5 pasos: bienvenida, etapa (o fecha de nacimiento), 4 preguntas de la etapa, resultado orientativo, siguiente paso. |
| `registro.html` | Visitantes | Cuenta del responsable: nombre, correo, relación, etapa y **consentimiento** obligatorio. No pide datos sensibles. |
| `acceso.html` | Todos | Entrada: nuevo, cuenta existente y perfiles de prueba (familias, profesionales, organizaciones, usuario adulto). |
| `familia.html` | Familia | Panel (guía, primeros pasos, pendientes con «Retomar», recordatorios, menores) → menor (objetivos, progreso, insignias, recomendaciones validadas, línea base, 12 semanas, detalle de semana + check-in, cierre antes/después, mediciones, gráfica de evolución). |
| `profesional.html` | Profesional | Lista con alertas; ficha: alertas, familia y menor, estado y próxima actividad, recomendaciones (validar / descartar / nueva), mediciones verificadas, últimos check-ins, notas privadas. |
| `admin.html` | Coordinación | Resumen, Avance colectivo, Familias, Permisos, Contenidos y programas (plan por etapa), Servicios, Actividad. Gobierno ve todo agregado y sin nombres. |
| `reporte.html` | Familia / profesional / coordinación | `?menor=` progreso familiar; `?org=` indicadores agregados. Imprimible / PDF. Marcado «reporte de ejemplo». |
| `privacidad.html` | Todos | Borrador de consentimiento, datos por rol, seguridad, respaldo y lista previa a datos reales. |
| `prueba.html` | Todos | Recorrido corto de prueba en 8 pasos. |
| `usuario.html` | Usuario adulto | Espacio complementario (sin cambios de fondo). |

## 4. Roles, permisos y aislamiento
| Rol | Ve | Filtro |
|---|---|---|
| visitante | Página pública y recorrido | ninguno (no guarda datos personales) |
| familia | Sus menores; registra línea base, check-ins y mediciones **reportadas**; ve recomendaciones **validadas** | `responsable_id = yo` |
| profesional | Sus familias asignadas; alertas, check-ins; valida recomendaciones; registra mediciones **verificadas**; notas privadas | `profesional_id = yo` (tabla `casos`) |
| coordinación escuela / A.C. | Familias y avance de **su** organización; no ve notas ni mediciones | `organizacion_id = la mía` |
| coordinación gobierno | **Solo cifras agregadas** de todas las organizaciones, sin nombres | `organizaciones.alcance = 'agregado'` |
| usuario adulto | Su espacio | `perfil_id = yo` |

En la demo el filtro lo hacen las páginas y `auth.js`. En la base real lo hace **RLS en Supabase** (migraciones 0001 y 0002). `familia.html#menor=…`, `profesional.html#caso=…` y `reporte.html` verifican la pertenencia.

## 5. Modelo de datos
En `base-falsa.js` (demo) y en las migraciones (real). Nuevo o cambiado en la versión 2 marcado con ★.

- `organizaciones` (id, nombre, tipo, ★alcance: propia | agregado, ★permisos[], ★restricciones[])
- `perfiles` (id, rol, nombre, correo, teléfono, organizacion_id, objetivos[], ★consentimiento {fecha, versión}, ★relación, …)
- ★`etapas` (id, orden, nombre, corto, icono, color, rango, complementaria, descripción, indicadores[], preguntas[])
- `programa_semanas` (★etapa_id, número, título, ★objetivo, contenido, actividad, ★materiales, ★checkin) — clave (etapa_id, número)
- `menores` (responsable_id, nombre, ★fecha_nacimiento, ★fecha_probable_parto, objetivos[], ★consentimiento) — ya no guarda edad ni etapa
- `avance_semanal` (menor_id, semana, completada, fecha)
- `registros_habitos` = check-in semanal (menor_id, semana, ★valores {clave: n}, ★actividad: si | parcial | no, ★respuesta, ★origen, fecha)
- ★`evaluaciones` (menor_id, tipo: inicial | cierre, fecha, valores, origen)
- ★`mediciones` (menor_id, tipo, valor, unidad, fecha, origen: profesional | familia, verificado_por)
- ★`recomendaciones` (menor_id, texto, motivo, origen: sistema | profesional, estado: pendiente | validada | descartada, validada_por)
- `casos`, `notas_caso`, `contenidos`, `programas` (★etapa_id), `actividad_general`, `mensajes_contacto`, `recorridos` (★etapa_id)
- Complementario del adulto: `objetivos`, `servicios`, `solicitudes`, `actividades`, `documentos`, `recordatorios`

**Reglas del programa** (todas en `web/assets/js/programa.js`, de ejemplo):
- Avance: semana activa = completadas + 1; no hay semana 1 sin **línea base**; al completar las 12 se pide la **evaluación de cierre**.
- Logros: punto de partida, primera semana, tres seguidas, mitad del camino, constancia, programa completo, antes y después.
- Pendientes de la familia: línea base → semana activa → cierre → recomendaciones validadas.
- Alertas al profesional: sin línea base, sin check-in en 14 días, indicador lejos de la meta dos check-ins seguidos, menor fuera de rango (más de 6 años).
- Métricas colectivas: inscripción, iniciados, participación (check-in en 14 días), avance promedio, conclusión, cambio promedio antes/después.

## 6. Stack y estructura
- Frontend plano: HTML + CSS (`assets/css/infancia.css`, variables en `:root`) + JS por módulos ES. Sin compilación.
- Datos: `api.js` es la única puerta. Fuente actual: `demo/base-falsa.js` (localStorage, semilla con `VER`). Fuente futura: `supabase.js`.
- Reglas de dominio: `programa.js`. Interfaz compartida: `ui.js`. Sesión: `auth.js` (demo: `sessionStorage`; futuro: Supabase Auth).
- Publicación: GitHub Pages desde `main`.
- **Identidad visual**: colores tomados del isotipo de MYO Genetics (púrpura `#6B2FBF` / `#9B4DE0` y turquesa `#2EC4D6`), tipografía Nunito. El isotipo está en `web/assets/img/logo.svg` como **versión vectorial aproximada**; sustituir por el archivo original cuando MYO Genetics lo entregue (mismo nombre, o cambiar la ruta en `ui.js` → `montarEncabezado`).
- Guía del programa «Brote» (`ui.js` → `guia()`): personaje **propuesto**, nombre e imagen por validar.

## 7. Contenido de ejemplo (por validar)
5 etapas con 12 semanas cada una (60 semanas), indicadores y metas por etapa, 4 preguntas de recorrido por etapa, 6 servicios, 3 familias (Laura: Sofía 1–3 años y Mateo 0–6 meses; Rosa: Valentina 3–6 años con programa concluido y un bebé en camino; Carmen: Iker 6–12 meses), 2 profesionales, 3 organizaciones. Todo marcado como ejemplo en pantalla.
