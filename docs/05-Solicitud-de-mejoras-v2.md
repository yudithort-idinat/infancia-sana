# 05 · Solicitud de mejoras de MYO Genetics → qué se hizo en la versión 2

Fuente: documento «Solicitud de mejoras Infancia Sana» (noviembre 2026). Cada punto con su estado en la demo y lo que queda abierto.

## 1. Enfoque y público objetivo
| Pedido | En la demo | Abierto |
|---|---|---|
| Rango de 0 a 6 años | Cinco etapas; la etapa se calcula con la fecha de nacimiento. Se avisa si un menor rebasa los 6 años. | — |
| Dirigido a madres, padres y cuidadores | Portada, registro, acceso y área familiar hablan a la familia. Profesionales e instituciones quedan como acompañantes. El usuario adulto pasa a «espacio complementario». | ¿Se conserva el usuario adulto? |
| Recorridos por etapa: embarazo (complementaria), 0–6 m, 6–12 m, 1–3 a, 3–6 a | Cada etapa tiene sus 12 semanas, indicadores y preguntas. | Contenido real por etapa. |

## 2. Página principal e identidad
| Pedido | En la demo | Abierto |
|---|---|---|
| Propósito visible | Titular y bajada del héroe; lema en el encabezado. | Texto definitivo. |
| Diseño cálido, moderno, jerarquía, móvil, tres llamadas a la acción | Héroe nuevo con «Conoce el programa», «Descubre tu ruta», «Ingresa a tu familia»; secciones con antetítulo; revisado a 375 px sin desbordes. | Fotografías o ilustraciones propias. |
| Protagonismo del programa; MYO Genetics como respaldo | Sección «El programa» con la anatomía de una semana y una semana de ejemplo; «Un programa de MYO Genetics» en encabezado y bloque de respaldo. | — |
| Logo y colores de marca | Paleta púrpura / turquesa del isotipo; `logo.svg` aproximado. | Archivo original del logo. |

## 3. Recorrido inicial y perfiles familiares
| Pedido | En la demo | Abierto |
|---|---|---|
| «Descubre tu ruta» con preguntas por edad, hábitos y acompañamiento; resultado comprensible | Etapa (o fecha) → 4 preguntas → resultado orientativo con «por dónde conviene empezar» y primeras semanas. | Preguntas y textos reales. |
| Cuenta del responsable con varios menores; fecha de nacimiento, etapa, objetivos, avance individual; sin datos sensibles al inicio | `registro.html` + alta de menores con nombre o apodo, fecha (o fecha probable de parto), objetivo opcional y consentimiento. | — |
| Bienvenida que explique qué hacer primero | Ventana de bienvenida + tarjeta permanente «Por dónde empezar» + guía con el siguiente paso. | — |

## 4. Programa de 12 semanas y motivación
| Pedido | En la demo | Abierto |
|---|---|---|
| Calendario y progreso; actividades por etapa | 12 semanas por etapa (sin loncheras para lactantes). | Contenido real. |
| Por semana: objetivo, microcontenido, actividad, materiales, check-in 2–3 min | Detalle de semana con las cinco piezas. | — |
| Recordatorios amables, barra de progreso, logros e insignias, personaje | Recordatorios calculados en el panel, barras, 7 insignias, guía «Brote». | Envío real por correo o WhatsApp; personaje definitivo. |
| Retomar pendientes; semana activa, completadas y qué sigue | Lista de pendientes con «Retomar»; semanas con estado; «sigue: semana N». | — |

## 5. Seguimiento y medición
| Pedido | En la demo | Abierto |
|---|---|---|
| Registro semanal por etapa; indicadores y unidades por edad; puntuación distinta por grupo | Indicadores, metas y pesos por etapa. | Validación clínica de metas. |
| Evaluación inicial y de cierre; antes/después; gráfica de evolución | Línea base obligatoria, cierre al terminar, barras antes/después, gráfica por semana. | — |
| Distinguir datos reportados de mediciones verificadas | Etiquetas «Reportada por la familia» / «Verificada · profesional». | — |
| Exportar reporte de ejemplo | `reporte.html` familiar y agregado, imprimible a PDF, con marca «reporte de ejemplo». | Generación en servidor y formato final. |

## 6. Profesionales e instituciones
| Pedido | En la demo | Abierto |
|---|---|---|
| Qué puede hacer cada institución, permisos, avances colectivos | Pestaña «Permisos» y «Avance colectivo»; gobierno solo agregados sin nombres. | Confirmar permisos. |
| Profesional: familias asignadas, anotaciones, alertas, recomendaciones a validar | Ficha con alertas, recomendaciones (validar / descartar / nueva), mediciones verificadas y notas privadas. | Reglas reales de alertas y recomendaciones. |
| Vista de coordinación con inscripción, participación, avance y conclusión | «Avance colectivo» con seis cifras, columnas por semana, barras por etapa y definiciones. | — |

## 7. Privacidad, operación y siguientes pasos
| Pedido | En la demo | Abierto |
|---|---|---|
| Consentimiento verificable, aviso de privacidad, permisos por rol, seguridad, respaldo, información de salud | Casilla obligatoria con fecha y versión; `privacidad.html` con borrador y lista previa a datos reales; RLS en migraciones 0001 y 0002. | Revisión legal; verificación por correo; respaldos (plan de pago de Supabase). |
| Recorrido corto de prueba | `prueba.html` (8 pasos). | — |

## Lo que NO es esta versión
Sigue siendo una demostración: los datos viven en el navegador, no hay cuentas reales, no se envían correos y el contenido es de ejemplo. Conectar la base real es trabajo del ingeniero (`docs/04-Guia-para-el-ingeniero.md`).
