-- Semilla de catálogos para la base real (fase 2). Sin personas: los perfiles reales se crean con Supabase Auth.
-- CONTENIDO DE EJEMPLO: sustituir por el que valide MYO Genetics. Debe coincidir con web/assets/js/demo/base-falsa.js.

insert into servicios (id, nombre, descripcion, para_quien, disponible, ejemplo) values
 ('s1','Orientación inicial','Una primera conversación para entender tu situación y proponerte un camino.','Cualquier persona que quiera empezar.',true,true),
 ('s2','Perfil de hábitos y nutrición','Evaluación de hábitos de alimentación con un plan de cambios graduales.','Adultos.',true,true),
 ('s3','Programa Infancia Sana (12 semanas)','Programa educativo estructurado para familias: una actividad por semana y registro de hábitos.','Familias con menores de 3 a 12 años.',true,true),
 ('s4','Acompañamiento a escuelas y organizaciones','Implementación del programa en grupos escolares, asociaciones civiles o programas de gobierno.','Escuelas, A.C. y gobierno.',true,true),
 ('s5','Seguimiento profesional','Citas periódicas con un profesional para revisar avances y ajustar el plan.','Personas que ya tienen un plan en marcha.',true,true);

insert into objetivos (id, icono, nombre, descripcion, para_quien, servicios, preguntas, orientacion, orden) values
 ('nutricion','🥗','Nutrición y hábitos','Entender cómo comes hoy y qué pequeños cambios te acercan a sentirte mejor.','Adultos que quieren ordenar su alimentación sin dietas extremas.','["s1","s2"]',
  '[{"id":"q1","texto":"¿Cuántas veces al día sueles comer?","opciones":["1 o 2","3","4 o más"]},{"id":"q2","texto":"¿Qué tan seguido incluyes frutas y verduras?","opciones":["Casi nunca","Algunos días","Todos los días"]},{"id":"q3","texto":"¿Qué te cuesta más trabajo?","opciones":["Planear mis comidas","Los antojos","Comer fuera de casa","No sé por dónde empezar"]}]',
  'Con base en tus respuestas, un buen punto de partida sería una orientación inicial para revisar tus hábitos actuales y definir dos o tres cambios realistas. (Texto de ejemplo.)',1),
 ('infancia','🧒','Infancia sana','Acompañar a niñas y niños a formar hábitos de alimentación, sueño y movimiento desde casa.','Madres, padres y personas responsables de menores de 3 a 12 años.','["s3","s1"]',
  '[{"id":"q1","texto":"¿Qué edad tiene el menor que te interesa acompañar?","opciones":["3 a 5 años","6 a 9 años","10 a 12 años"]},{"id":"q2","texto":"¿Cuál es tu mayor reto hoy?","opciones":["Que coma verduras","Las pantallas","El sueño","Que se mueva más"]},{"id":"q3","texto":"¿Quién participa en casa en estos hábitos?","opciones":["Solo yo","Ambos padres o tutores","Toda la familia"]},{"id":"q4","texto":"¿Cuánto tiempo a la semana podrían dedicarle?","opciones":["Menos de 1 hora","1 a 2 horas","Más de 2 horas"]}]',
  'Tu familia podría beneficiarse del programa Infancia Sana: 12 semanas con una actividad sencilla por semana y un registro de hábitos para ver el avance. (Texto de ejemplo.)',2),
 ('bienestar','⚡','Bienestar y energía','Dormir mejor, tener más energía y manejar el estrés del día a día.','Personas con jornadas largas que sienten cansancio constante.','["s1","s5"]',
  '[{"id":"q1","texto":"¿Cuántas horas duermes normalmente?","opciones":["Menos de 6","6 a 7","8 o más"]},{"id":"q2","texto":"¿Cómo describes tu energía por las tardes?","opciones":["Muy baja","Regular","Buena"]},{"id":"q3","texto":"¿Haces alguna actividad física a la semana?","opciones":["Ninguna","1 a 2 veces","3 o más veces"]}]',
  'Una orientación inicial ayudaría a identificar qué está pesando más: el sueño, la alimentación o el movimiento, y a elegir un seguimiento adecuado. (Texto de ejemplo.)',3),
 ('familia','👨‍👩‍👧','Salud familiar','Un plan compartido para que toda la familia avance junta.','Familias que quieren cambiar hábitos en conjunto, no una persona a la vez.','["s3","s4"]',
  '[{"id":"q1","texto":"¿Cuántas personas viven en casa?","opciones":["2","3 a 4","5 o más"]},{"id":"q2","texto":"¿Hay menores en casa?","opciones":["No","Sí, uno","Sí, dos o más"]},{"id":"q3","texto":"¿Qué les gustaría lograr primero?","opciones":["Comer mejor","Moverse más","Dormir mejor","Pasar menos tiempo en pantallas"]}]',
  'Podrían empezar por el programa Infancia Sana si hay menores, o por una orientación inicial para toda la familia. (Texto de ejemplo.)',4);

insert into programa_semanas (numero, titulo, contenido, actividad) values
 (1,'Conocemos nuestros hábitos','Esta semana observamos, sin cambiar nada todavía, qué come, cuánto duerme y cuánto se mueve el menor. La idea es tener un punto de partida honesto.','Anotar en una hoja qué desayunó, comió y cenó durante tres días.'),
 (2,'Un desayuno que dé energía','El desayuno marca el ritmo del día. Vemos ejemplos sencillos y económicos de desayunos completos.','Preparar juntos un desayuno con una fruta, un cereal y una proteína.'),
 (3,'Agua primero','Cambiar bebidas azucaradas por agua es uno de los cambios con más efecto. Hablamos de cómo hacerlo sin pleitos.','Tener una botella de agua personal y llenarla cada mañana.'),
 (4,'Frutas y verduras de colores','Mientras más colores en el plato, más variedad de nutrientes. Juego de colores para la semana.','Probar una fruta o verdura nueva y dibujarla.'),
 (5,'Moverse jugando','El movimiento en la infancia es juego, no ejercicio. Ideas para 30 minutos activos al día.','Tres tardes de juego activo en familia (pelota, bailar, escondidas).'),
 (6,'Dormir bien','Rutina para ir a dormir, horarios y por qué el sueño cambia el apetito y el ánimo.','Fijar una hora de dormir y cumplirla cinco noches.'),
 (7,'Pantallas con medida','Acuerdos familiares sobre cuándo sí y cuándo no usar pantallas.','Hacer un cartel de acuerdos de pantallas y pegarlo en casa.'),
 (8,'Emociones y comida','Distinguir hambre de aburrimiento o enojo. Alternativas cuando no es hambre.','Nombrar la emoción antes de pedir algo de comer, durante una semana.'),
 (9,'Comer en familia','Las comidas compartidas, sin pantallas, mejoran lo que se come y la convivencia.','Tres comidas en familia en la mesa, sin pantallas.'),
 (10,'La lonchera','Qué llevar a la escuela: opciones prácticas y cómo involucrar al menor.','Que el menor arme su lonchera dos días con una lista de opciones.'),
 (11,'Hábitos que se quedan','Repasamos qué funcionó y qué no. Elegimos los tres hábitos que la familia quiere conservar.','Escribir los tres hábitos elegidos y ponerlos en el refrigerador.'),
 (12,'Celebramos y seguimos','Cierre del programa: reconocimiento al menor y plan sencillo para los siguientes tres meses.','Celebración familiar y entrega del reconocimiento.');
