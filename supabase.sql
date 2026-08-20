-- ============================================================
--  AirFryer · Estructura en Supabase
--  ------------------------------------------------------------
--  Cópialo entero y ejecútalo en:
--  supabase.com → tu proyecto → SQL Editor → New query → Run
--
--  Crea una sola tabla: una fila por usuario con todos sus datos
--  (favoritos, historial, semana, compra, despensa, notas y logros)
--  guardados como JSON.
-- ============================================================

-- 1. La tabla ------------------------------------------------
create table if not exists public.airfryer_data (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2. Seguridad a nivel de fila (RLS) -------------------------
--    Sin esto, cualquiera con la clave pública podría leer los
--    datos de todos. Con esto, cada usuario solo alcanza SU fila.
alter table public.airfryer_data enable row level security;

drop policy if exists "Cada usuario ve solo lo suyo"      on public.airfryer_data;
drop policy if exists "Cada usuario crea solo lo suyo"    on public.airfryer_data;
drop policy if exists "Cada usuario modifica solo lo suyo" on public.airfryer_data;
drop policy if exists "Cada usuario borra solo lo suyo"   on public.airfryer_data;

create policy "Cada usuario ve solo lo suyo"
  on public.airfryer_data for select
  using (auth.uid() = user_id);

create policy "Cada usuario crea solo lo suyo"
  on public.airfryer_data for insert
  with check (auth.uid() = user_id);

create policy "Cada usuario modifica solo lo suyo"
  on public.airfryer_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Cada usuario borra solo lo suyo"
  on public.airfryer_data for delete
  using (auth.uid() = user_id);

-- 3. Marca de tiempo automática ------------------------------
create or replace function public.airfryer_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists airfryer_touch_trigger on public.airfryer_data;
create trigger airfryer_touch_trigger
  before update on public.airfryer_data
  for each row execute function public.airfryer_touch();

-- ============================================================
--  Comprobación rápida: debe devolver una fila con rowsecurity = true
-- ============================================================
-- select tablename, rowsecurity from pg_tables where tablename = 'airfryer_data';
