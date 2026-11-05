-- 0002 · Etapas (0 a 6 años + embarazo), programa de 12 semanas POR ETAPA, check-in por indicadores,
-- evaluación inicial y de cierre, mediciones (verificadas / reportadas), recomendaciones validadas
-- por profesional, consentimiento y alcance por organización.
-- Corresponde a la versión 2 de la demo (solicitud de mejoras de MYO Genetics, noviembre 2026).
-- Se aplica DESPUÉS de 0001_nucleo.sql. Una migración aplicada no se edita: lo siguiente va en 0003.

begin;

-- ---------- Etapas ----------
create table etapas (
  id text primary key,                       -- 'embarazo' | '0-6m' | '6-12m' | '1-3a' | '3-6a'
  orden int not null default 0,
  nombre text not null,
  corto text,
  icono text,
  color text,
  rango text,
  complementaria boolean not null default false,
  descripcion text,
  indicadores jsonb not null default '[]'::jsonb,   -- [{clave, etiqueta, unidad, min, max, paso, meta:{tipo,valor}, peso}]
  preguntas jsonb not null default '[]'::jsonb      -- recorrido «Descubre tu ruta»
);

-- ---------- Organizaciones: alcance y permisos ----------
alter table organizaciones
  add column alcance text not null default 'propia' check (alcance in ('propia','agregado')),
  add column permisos jsonb not null default '[]'::jsonb,
  add column restricciones jsonb not null default '[]'::jsonb;

-- ---------- Perfiles y menores: consentimiento y fecha de nacimiento ----------
alter table perfiles
  add column consentimiento jsonb,           -- {fecha, version}
  add column relacion text;                  -- madre | padre | tutor | cuidador
alter table menores
  add column fecha_nacimiento date,
  add column fecha_probable_parto date,      -- cuando aún no nace (etapa «embarazo»)
  add column consentimiento jsonb;
alter table menores drop column edad, drop column etapa;   -- ahora la etapa se calcula con la fecha

-- ---------- Programa por etapa ----------
alter table avance_semanal drop constraint if exists avance_semanal_semana_fkey;
alter table registros_habitos drop constraint if exists registros_habitos_semana_fkey;
delete from programa_semanas;                -- las 12 semanas genéricas de la versión 1 (solo catálogo de ejemplo)
alter table programa_semanas drop constraint programa_semanas_pkey;
alter table programa_semanas
  add column etapa_id text not null references etapas(id) on delete cascade,
  add column objetivo text,
  add column materiales text,
  add column checkin text;
alter table programa_semanas add primary key (etapa_id, numero);
alter table programas add column etapa_id text references etapas(id);
alter table recorridos add column etapa_id text references etapas(id);

-- ---------- Check-in semanal por indicadores de la etapa ----------
alter table registros_habitos
  drop column sueno, drop column frutas_verduras, drop column juego_activo, drop column pantallas, drop column agua,
  add column valores jsonb not null default '{}'::jsonb,    -- {clave_indicador: valor}
  add column actividad text check (actividad in ('si','parcial','no')),
  add column respuesta text,
  add column origen text not null default 'familia';

-- ---------- Evaluación inicial (línea base) y de cierre ----------
create table evaluaciones (
  id uuid primary key default gen_random_uuid(),
  menor_id uuid not null references menores(id) on delete cascade,
  tipo text not null check (tipo in ('inicial','cierre')),
  fecha date not null default current_date,
  valores jsonb not null default '{}'::jsonb,
  origen text not null default 'familia',
  unique (menor_id, tipo)
);

-- ---------- Mediciones: verificadas por profesional o reportadas por la familia ----------
create table mediciones (
  id uuid primary key default gen_random_uuid(),
  menor_id uuid not null references menores(id) on delete cascade,
  tipo text not null,
  valor numeric not null,
  unidad text,
  fecha date not null default current_date,
  origen text not null check (origen in ('profesional','familia')),
  verificado_por uuid references perfiles(id)
);

-- ---------- Recomendaciones: las sugiere el sistema, las valida una persona profesional ----------
create table recomendaciones (
  id uuid primary key default gen_random_uuid(),
  menor_id uuid not null references menores(id) on delete cascade,
  texto text not null,
  motivo text,
  origen text not null default 'sistema' check (origen in ('sistema','profesional')),
  estado text not null default 'pendiente' check (estado in ('pendiente','validada','descartada')),
  fecha date not null default current_date,
  validada_por uuid references perfiles(id)
);

-- ---------- Seguridad (RLS) ----------
alter table etapas enable row level security;
alter table evaluaciones enable row level security;
alter table mediciones enable row level security;
alter table recomendaciones enable row level security;

create policy "catalogo lectura" on etapas for select using (true);
create policy "catalogo escritura" on etapas for all using (mi_rol() = 'admin');

-- Evaluaciones: la familia las registra; su profesional las consulta
create policy "evaluaciones de mis menores" on evaluaciones for all
  using (exists (select 1 from menores m where m.id = evaluaciones.menor_id and m.responsable_id = mi_perfil_id()))
  with check (exists (select 1 from menores m where m.id = evaluaciones.menor_id and m.responsable_id = mi_perfil_id()));
create policy "evaluaciones visibles a profesional" on evaluaciones for select
  using (exists (select 1 from casos c where c.profesional_id = mi_perfil_id() and c.menor_id = evaluaciones.menor_id));

-- Mediciones: la familia ve las de sus menores y solo puede REPORTAR (origen 'familia');
-- el profesional asignado registra las VERIFICADAS
create policy "mediciones de mis menores" on mediciones for select
  using (exists (select 1 from menores m where m.id = mediciones.menor_id and m.responsable_id = mi_perfil_id()));
create policy "familia reporta medicion" on mediciones for insert
  with check (origen = 'familia' and verificado_por is null
    and exists (select 1 from menores m where m.id = mediciones.menor_id and m.responsable_id = mi_perfil_id()));
create policy "profesional mediciones de sus casos" on mediciones for all
  using (exists (select 1 from casos c where c.profesional_id = mi_perfil_id() and c.menor_id = mediciones.menor_id))
  with check (origen = 'profesional' and verificado_por = mi_perfil_id()
    and exists (select 1 from casos c where c.profesional_id = mi_perfil_id() and c.menor_id = mediciones.menor_id));

-- Recomendaciones: la familia solo ve las VALIDADAS; el profesional asignado las gestiona
create policy "recomendaciones validadas de mis menores" on recomendaciones for select
  using (estado = 'validada' and exists (select 1 from menores m where m.id = recomendaciones.menor_id and m.responsable_id = mi_perfil_id()));
create policy "profesional recomendaciones de sus casos" on recomendaciones for all
  using (exists (select 1 from casos c where c.profesional_id = mi_perfil_id() and c.menor_id = recomendaciones.menor_id))
  with check (exists (select 1 from casos c where c.profesional_id = mi_perfil_id() and c.menor_id = recomendaciones.menor_id));

-- PENDIENTE para el ingeniero (ver docs/04 § 4):
--   · Organizaciones con alcance 'agregado' (gobierno) NO deben leer filas individuales. Sus cifras deben salir
--     de una función `security definer` (por ejemplo metricas_agregadas()) que devuelva solo conteos.
--   · La coordinación (admin) ve nombre y etapa de los menores de su organización, pero no notas ni mediciones.

commit;
