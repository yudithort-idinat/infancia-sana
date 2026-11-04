-- 0001 · Núcleo de Infancia Sana (MYO Genetics)
-- Esquema propuesto para la fase 2. Refleja las tablas de web/assets/js/demo/base-falsa.js.
-- Se ejecuta en el SQL Editor del proyecto de Supabase de MYO Genetics. No editar después de aplicada: escribir 0002+.

create extension if not exists pgcrypto;

-- ---------- Organizaciones y perfiles ----------
create table organizaciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null check (tipo in ('escuela','ac','gobierno')),
  creado_en timestamptz not null default now()
);

create table perfiles (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique references auth.users(id) on delete set null,   -- se liga al usuario de Supabase Auth
  rol text not null check (rol in ('usuario','familia','profesional','admin')),
  nombre text not null,
  correo text not null,
  telefono text,
  fecha_nacimiento date,
  ciudad text,
  objetivo_principal text,
  especialidad text,
  organizacion_id uuid references organizaciones(id),
  objetivos jsonb not null default '[]'::jsonb,
  creado_en timestamptz not null default now()
);

-- ---------- Catálogos (lectura pública) ----------
create table objetivos (
  id text primary key,            -- nutricion, infancia, bienestar, familia…
  icono text,
  nombre text not null,
  descripcion text,
  para_quien text,
  servicios jsonb not null default '[]'::jsonb,   -- ids de servicios relacionados
  preguntas jsonb not null default '[]'::jsonb,   -- [{id, texto, opciones[]}]
  orientacion text,
  orden int not null default 0
);

create table servicios (
  id text primary key,
  nombre text not null,
  descripcion text,
  para_quien text,
  disponible boolean not null default true,
  ejemplo boolean not null default true
);

create table programa_semanas (
  numero int primary key check (numero between 1 and 12),
  titulo text not null,
  contenido text,
  actividad text
);

-- ---------- Datos del usuario adulto ----------
create table solicitudes (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfiles(id) on delete cascade,
  servicio_id text not null references servicios(id),
  estado text not null default 'solicitado' check (estado in ('solicitado','en_proceso','activo','completado','cerrado')),
  fecha date not null default current_date
);

create table actividades (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfiles(id) on delete cascade,
  titulo text not null,
  fecha date not null,
  estado text not null default 'pendiente' check (estado in ('pendiente','completada')),
  tipo text not null default 'tarea' check (tipo in ('tarea','cita'))
);

create table documentos (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfiles(id) on delete cascade,
  nombre text not null,
  tipo text,
  ruta_storage text,            -- fase 2: archivo en Supabase Storage
  fecha date not null default current_date
);

create table recordatorios (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfiles(id) on delete cascade,
  texto text not null,
  cuando text
);

-- ---------- Área familiar ----------
create table menores (
  id uuid primary key default gen_random_uuid(),
  responsable_id uuid not null references perfiles(id) on delete cascade,
  nombre text not null,
  edad int,
  etapa text,
  objetivos jsonb not null default '[]'::jsonb,
  creado_en timestamptz not null default now()
);

create table avance_semanal (
  id uuid primary key default gen_random_uuid(),
  menor_id uuid not null references menores(id) on delete cascade,
  semana int not null references programa_semanas(numero),
  completada boolean not null default true,
  fecha date not null default current_date,
  unique (menor_id, semana)
);

create table registros_habitos (
  id uuid primary key default gen_random_uuid(),
  menor_id uuid not null references menores(id) on delete cascade,
  semana int not null references programa_semanas(numero),
  sueno numeric,
  frutas_verduras numeric,
  juego_activo numeric,
  pantallas numeric,
  agua numeric,
  fecha date not null default current_date,
  unique (menor_id, semana)
);

-- ---------- Área profesional ----------
create table casos (
  id uuid primary key default gen_random_uuid(),
  profesional_id uuid not null references perfiles(id),
  perfil_id uuid not null references perfiles(id),
  menor_id uuid references menores(id),
  titulo text not null,
  estado text not null default 'nuevo' check (estado in ('nuevo','activo','pausado','cerrado')),
  proxima_actividad text,
  proxima_fecha date,
  creado_en timestamptz not null default now()
);

create table notas_caso (
  id uuid primary key default gen_random_uuid(),
  caso_id uuid not null references casos(id) on delete cascade,
  fecha date not null default current_date,
  texto text not null
);

-- ---------- Administración ----------
create table contenidos (
  id uuid primary key default gen_random_uuid(),
  organizacion_id uuid not null references organizaciones(id) on delete cascade,
  titulo text not null,
  tipo text,
  estado text not null default 'borrador' check (estado in ('borrador','publicado')),
  ejemplo boolean not null default true
);

create table programas (
  id uuid primary key default gen_random_uuid(),
  organizacion_id uuid not null references organizaciones(id) on delete cascade,
  nombre text not null,
  semanas int not null default 12,
  familias int not null default 0,
  estado text not null default 'por iniciar',
  ejemplo boolean not null default true
);

create table actividad_general (
  id uuid primary key default gen_random_uuid(),
  organizacion_id uuid not null references organizaciones(id) on delete cascade,
  fecha date not null default current_date,
  texto text not null
);

-- ---------- Público ----------
create table mensajes_contacto (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  correo text not null,
  telefono text,
  asunto text,
  mensaje text,
  fecha date not null default current_date,
  estado text not null default 'nuevo'
);

create table recorridos (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date,
  objetivo_id text references objetivos(id),
  respuestas jsonb not null default '{}'::jsonb
);

-- =====================================================================
-- Seguridad por filas (RLS): cada perfil ve solo lo suyo
-- =====================================================================
-- Ayudas: perfil del usuario autenticado y su organización
create or replace function mi_perfil_id() returns uuid language sql stable security definer as $$
  select id from perfiles where auth_id = auth.uid() limit 1
$$;
create or replace function mi_rol() returns text language sql stable security definer as $$
  select rol from perfiles where auth_id = auth.uid() limit 1
$$;
create or replace function mi_organizacion_id() returns uuid language sql stable security definer as $$
  select organizacion_id from perfiles where auth_id = auth.uid() limit 1
$$;

alter table organizaciones   enable row level security;
alter table perfiles         enable row level security;
alter table objetivos        enable row level security;
alter table servicios        enable row level security;
alter table programa_semanas enable row level security;
alter table solicitudes      enable row level security;
alter table actividades      enable row level security;
alter table documentos       enable row level security;
alter table recordatorios    enable row level security;
alter table menores          enable row level security;
alter table avance_semanal   enable row level security;
alter table registros_habitos enable row level security;
alter table casos            enable row level security;
alter table notas_caso       enable row level security;
alter table contenidos       enable row level security;
alter table programas        enable row level security;
alter table actividad_general enable row level security;
alter table mensajes_contacto enable row level security;
alter table recorridos       enable row level security;

-- Catálogos: cualquiera lee; solo administración escribe
create policy "catalogo lectura" on objetivos for select using (true);
create policy "catalogo lectura" on servicios for select using (true);
create policy "catalogo lectura" on programa_semanas for select using (true);
create policy "catalogo escritura" on objetivos for all using (mi_rol() = 'admin');
create policy "catalogo escritura" on servicios for all using (mi_rol() = 'admin');
create policy "catalogo escritura" on programa_semanas for all using (mi_rol() = 'admin');

-- Organizaciones: cada quien ve la suya
create policy "mi organizacion" on organizaciones for select using (id = mi_organizacion_id());

-- Perfiles: el propio; administración ve los de su organización; profesional ve a las personas de sus casos
create policy "mi perfil" on perfiles for select using (auth_id = auth.uid());
create policy "mi perfil editar" on perfiles for update using (auth_id = auth.uid());
create policy "admin ve su organizacion" on perfiles for select using (mi_rol() = 'admin' and organizacion_id = mi_organizacion_id());
create policy "admin invita" on perfiles for insert with check (mi_rol() = 'admin' and organizacion_id = mi_organizacion_id());
create policy "profesional ve sus personas" on perfiles for select using (exists (select 1 from casos c where c.profesional_id = mi_perfil_id() and c.perfil_id = perfiles.id));

-- Datos del usuario adulto
create policy "mias" on solicitudes for all using (perfil_id = mi_perfil_id()) with check (perfil_id = mi_perfil_id());
create policy "mias" on actividades for all using (perfil_id = mi_perfil_id()) with check (perfil_id = mi_perfil_id());
create policy "mias" on documentos for select using (perfil_id = mi_perfil_id());
create policy "mias" on recordatorios for all using (perfil_id = mi_perfil_id()) with check (perfil_id = mi_perfil_id());
create policy "profesional ve solicitudes de sus casos" on solicitudes for select using (exists (select 1 from casos c where c.profesional_id = mi_perfil_id() and c.perfil_id = solicitudes.perfil_id));
create policy "profesional ve actividades de sus casos" on actividades for select using (exists (select 1 from casos c where c.profesional_id = mi_perfil_id() and c.perfil_id = actividades.perfil_id));
create policy "admin ve solicitudes de su org" on solicitudes for select using (mi_rol() = 'admin' and exists (select 1 from perfiles p where p.id = solicitudes.perfil_id and p.organizacion_id = mi_organizacion_id()));

-- Área familiar: la familia responsable; el profesional del caso; administración de la organización
create policy "mis menores" on menores for all using (responsable_id = mi_perfil_id()) with check (responsable_id = mi_perfil_id());
create policy "profesional ve menores de sus casos" on menores for select using (exists (select 1 from casos c where c.profesional_id = mi_perfil_id() and c.menor_id = menores.id));
create policy "admin ve menores de su org" on menores for select using (mi_rol() = 'admin' and exists (select 1 from perfiles p where p.id = menores.responsable_id and p.organizacion_id = mi_organizacion_id()));
create policy "avance de mis menores" on avance_semanal for all using (exists (select 1 from menores m where m.id = avance_semanal.menor_id and m.responsable_id = mi_perfil_id())) with check (exists (select 1 from menores m where m.id = avance_semanal.menor_id and m.responsable_id = mi_perfil_id()));
create policy "avance visible a profesional y admin" on avance_semanal for select using (exists (select 1 from menores m where m.id = avance_semanal.menor_id and (exists (select 1 from casos c where c.profesional_id = mi_perfil_id() and c.menor_id = m.id) or (mi_rol() = 'admin' and exists (select 1 from perfiles p where p.id = m.responsable_id and p.organizacion_id = mi_organizacion_id())))));
create policy "registros de mis menores" on registros_habitos for all using (exists (select 1 from menores m where m.id = registros_habitos.menor_id and m.responsable_id = mi_perfil_id())) with check (exists (select 1 from menores m where m.id = registros_habitos.menor_id and m.responsable_id = mi_perfil_id()));
create policy "registros visibles a profesional" on registros_habitos for select using (exists (select 1 from casos c where c.profesional_id = mi_perfil_id() and c.menor_id = registros_habitos.menor_id));

-- Área profesional
create policy "mis casos" on casos for all using (profesional_id = mi_perfil_id()) with check (profesional_id = mi_perfil_id());
create policy "admin ve casos de su org" on casos for select using (mi_rol() = 'admin' and exists (select 1 from perfiles p where p.id = casos.profesional_id and p.organizacion_id = mi_organizacion_id()));
create policy "notas de mis casos" on notas_caso for all using (exists (select 1 from casos c where c.id = notas_caso.caso_id and c.profesional_id = mi_perfil_id())) with check (exists (select 1 from casos c where c.id = notas_caso.caso_id and c.profesional_id = mi_perfil_id()));

-- Administración: su organización
create policy "admin contenidos" on contenidos for all using (mi_rol() = 'admin' and organizacion_id = mi_organizacion_id()) with check (organizacion_id = mi_organizacion_id());
create policy "contenidos publicados visibles" on contenidos for select using (estado = 'publicado' and organizacion_id = mi_organizacion_id());
create policy "admin programas" on programas for all using (mi_rol() = 'admin' and organizacion_id = mi_organizacion_id()) with check (organizacion_id = mi_organizacion_id());
create policy "admin actividad" on actividad_general for select using (mi_rol() = 'admin' and organizacion_id = mi_organizacion_id());
create policy "miembros registran actividad" on actividad_general for insert with check (organizacion_id = mi_organizacion_id());

-- Público: cualquiera inserta; solo administración lee
create policy "contacto anonimo" on mensajes_contacto for insert with check (true);
create policy "admin lee contacto" on mensajes_contacto for select using (mi_rol() = 'admin');
create policy "recorrido anonimo" on recorridos for insert with check (true);
create policy "admin lee recorridos" on recorridos for select using (mi_rol() = 'admin');
