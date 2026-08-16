-- ============================================================================
-- México Primero / Vivero Chaka — esquema inicial
-- ============================================================================
-- Convenciones:
--   - Todas las tablas de negocio viven en el esquema "public".
--   - Toda la seguridad se aplica con Row Level Security (RLS); el cliente
--     del navegador jamás debe poder saltarse una regla de negocio.
--   - Las funciones "security definer" existen únicamente para romper la
--     recursión de RLS al consultar la propia tabla profiles/system_settings
--     y para operaciones que deben ser atómicas (aprobar cotización).
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
create type public.user_role as enum ('usuario', 'superadmin');
create type public.seed_classification as enum ('recalcitrante', 'intermedia', 'ortodoxa', 'vareta');
create type public.bag_size as enum ('13x20', '25x25', '30x30', '30x40', '40x40');
create type public.plant_height as enum ('20-30', '40-50', '50-60', '60-70', '80-90', '100', '150', '180', '200', '300');
create type public.quotation_product_type as enum ('semillas', 'plantas');
create type public.quotation_status as enum ('pendiente', 'aprobada', 'rechazada', 'facturada');
create type public.discount_type as enum ('none', 'fixed', 'percentage');

-- ----------------------------------------------------------------------------
-- PROFILES  (extiende auth.users; se crea automáticamente al registrar un usuario)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role public.user_role not null default 'usuario',
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- SYSTEM_SETTINGS  (fila única — controla el killswitch)
-- ----------------------------------------------------------------------------
create table public.system_settings (
  id integer primary key default 1 check (id = 1),
  is_active boolean not null default true,
  suspended_reason text,
  suspended_by uuid references public.profiles(id) on delete set null,
  suspended_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.system_settings (id, is_active) values (1, true);

-- ----------------------------------------------------------------------------
-- FUNCIONES DE AUTORIZACIÓN (security definer para evitar recursión de RLS)
-- ----------------------------------------------------------------------------
create function public.is_superadmin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'superadmin'
  );
$$;

create function public.system_is_active()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_active from public.system_settings where id = 1), true);
$$;

-- Acceso a datos de negocio: autenticado Y (sistema activo O superadmin).
-- El superadmin siempre puede entrar, incluso con el killswitch activado,
-- para poder desactivarlo o resolver el problema que motivó el bloqueo.
create function public.can_access()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select auth.uid() is not null and (public.is_superadmin() or public.system_is_active());
$$;

-- ----------------------------------------------------------------------------
-- SECUENCIAS para folios legibles (SEM-0001, PLA-0001, 001/2026...)
-- ----------------------------------------------------------------------------
create sequence public.seed_code_seq;
create sequence public.plant_code_seq;
create sequence public.quotation_folio_seq;

-- ----------------------------------------------------------------------------
-- SEEDS (semillas)
-- ----------------------------------------------------------------------------
create table public.seeds (
  id uuid primary key default gen_random_uuid(),
  code text unique not null default ('SEM-' || lpad(nextval('public.seed_code_seq')::text, 4, '0')),
  common_name text not null,
  scientific_name text not null,
  classification public.seed_classification not null default 'intermedia',
  available_months text,
  seeds_per_kilo integer check (seeds_per_kilo is null or seeds_per_kilo > 0),
  unit_price numeric(12,2) not null default 0 check (unit_price >= 0),
  stock_kg numeric(12,2) not null default 0 check (stock_kg >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index seeds_common_name_idx on public.seeds using gin (to_tsvector('spanish', common_name || ' ' || scientific_name));

-- ----------------------------------------------------------------------------
-- PLANTS (plantas) — catálogo; el precio se fija por cotización, no aquí
-- ----------------------------------------------------------------------------
create table public.plants (
  id uuid primary key default gen_random_uuid(),
  code text unique not null default ('PLA-' || lpad(nextval('public.plant_code_seq')::text, 4, '0')),
  common_name text not null,
  scientific_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index plants_common_name_idx on public.plants using gin (to_tsvector('spanish', common_name || ' ' || scientific_name));

-- ----------------------------------------------------------------------------
-- QUOTATIONS (cotizaciones)
-- ----------------------------------------------------------------------------
create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  folio text unique not null default (
    lpad(nextval('public.quotation_folio_seq')::text, 3, '0') || '/' || extract(year from now())::text
  ),
  product_type public.quotation_product_type not null,
  client_name text not null,
  client_address text,
  quote_date date not null default current_date,
  validity_days integer not null default 10 check (validity_days > 0),
  valid_until date generated always as (quote_date + validity_days) stored,
  quote_city text not null default 'Mérida, Yucatán',
  notes text not null default 'De la manera más atenta y respetuosa pongo a consideración la siguiente cotización:',
  conditions jsonb not null default '[]'::jsonb,
  tax_rate numeric(5,2) not null default 0 check (tax_rate >= 0),
  discount_type public.discount_type not null default 'none',
  discount_value numeric(12,2) not null default 0 check (discount_value >= 0),
  shipping_cost numeric(12,2) not null default 0 check (shipping_cost >= 0),
  subtotal numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  status public.quotation_status not null default 'pendiente',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quotations_status_idx on public.quotations (status);
create index quotations_product_type_idx on public.quotations (product_type);
create index quotations_created_at_idx on public.quotations (created_at desc);

create table public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  seed_id uuid references public.seeds(id) on delete set null,
  plant_id uuid references public.plants(id) on delete set null,
  common_name text not null,
  scientific_name text,
  classification public.seed_classification,
  available_months text,
  seeds_per_kilo integer,
  bag_size public.bag_size,
  height public.plant_height,
  unit_price numeric(12,2) not null default 0,
  quantity numeric(12,2) not null default 1 check (quantity > 0),
  subtotal numeric(12,2) not null,
  sort_order integer not null default 0
);

create index quotation_items_quotation_id_idx on public.quotation_items (quotation_id);

-- ----------------------------------------------------------------------------
-- updated_at automático
-- ----------------------------------------------------------------------------
create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_seeds_touch before update on public.seeds
  for each row execute function public.touch_updated_at();
create trigger trg_plants_touch before update on public.plants
  for each row execute function public.touch_updated_at();
create trigger trg_quotations_touch before update on public.quotations
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- RPC: aprobar cotización (atómico, descuenta stock de semillas con bloqueo de fila)
-- ----------------------------------------------------------------------------
create function public.approve_quotation(p_quotation_id uuid, p_force boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quotation record;
  v_item record;
  v_seed record;
  v_issues jsonb := '[]'::jsonb;
begin
  if not public.can_access() then
    raise exception 'No autorizado';
  end if;

  select * into v_quotation from public.quotations where id = p_quotation_id for update;
  if not found then
    raise exception 'Cotización no encontrada';
  end if;
  if v_quotation.status = 'aprobada' then
    return jsonb_build_object('success', true, 'already_approved', true);
  end if;

  if v_quotation.product_type = 'semillas' then
    for v_item in select * from public.quotation_items where quotation_id = p_quotation_id loop
      if v_item.seed_id is not null then
        select * into v_seed from public.seeds where id = v_item.seed_id for update;
        if v_seed is null then
          v_issues := v_issues || jsonb_build_object('item', v_item.common_name, 'issue', 'producto_no_encontrado');
        elsif v_seed.stock_kg < v_item.quantity then
          v_issues := v_issues || jsonb_build_object(
            'item', v_item.common_name, 'issue', 'stock_insuficiente',
            'disponible', v_seed.stock_kg, 'solicitado', v_item.quantity
          );
        end if;
      end if;
    end loop;

    if jsonb_array_length(v_issues) > 0 and not p_force then
      return jsonb_build_object('success', false, 'issues', v_issues);
    end if;

    update public.seeds s
    set stock_kg = greatest(0, s.stock_kg - qi.quantity)
    from public.quotation_items qi
    where qi.quotation_id = p_quotation_id and qi.seed_id = s.id;
  end if;

  update public.quotations set status = 'aprobada', updated_at = now() where id = p_quotation_id;

  return jsonb_build_object('success', true);
end;
$$;

-- ----------------------------------------------------------------------------
-- RPC: duplicar cotización (nuevo folio, fecha de hoy, estado pendiente)
-- ----------------------------------------------------------------------------
create function public.duplicate_quotation(p_quotation_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_id uuid := gen_random_uuid();
  v_old public.quotations%rowtype;
begin
  if not public.can_access() then
    raise exception 'No autorizado';
  end if;

  select * into v_old from public.quotations where id = p_quotation_id;
  if not found then
    raise exception 'Cotización no encontrada';
  end if;

  insert into public.quotations (
    id, product_type, client_name, client_address, quote_date, validity_days, quote_city, notes, conditions,
    tax_rate, discount_type, discount_value, shipping_cost, subtotal, discount_amount, tax_amount, total,
    status, created_by
  ) values (
    v_new_id, v_old.product_type, v_old.client_name, v_old.client_address, current_date, v_old.validity_days,
    v_old.quote_city, v_old.notes, v_old.conditions,
    v_old.tax_rate, v_old.discount_type, v_old.discount_value, v_old.shipping_cost,
    v_old.subtotal, v_old.discount_amount, v_old.tax_amount, v_old.total,
    'pendiente', auth.uid()
  );

  insert into public.quotation_items (
    quotation_id, seed_id, plant_id, common_name, scientific_name, classification,
    available_months, seeds_per_kilo, bag_size, height, unit_price, quantity, subtotal, sort_order
  )
  select
    v_new_id, seed_id, plant_id, common_name, scientific_name, classification,
    available_months, seeds_per_kilo, bag_size, height, unit_price, quantity, subtotal, sort_order
  from public.quotation_items where quotation_id = p_quotation_id;

  return v_new_id;
end;
$$;

revoke all on function public.approve_quotation(uuid, boolean) from public;
grant execute on function public.approve_quotation(uuid, boolean) to authenticated;
revoke all on function public.duplicate_quotation(uuid) from public;
grant execute on function public.duplicate_quotation(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- RPC: crear cotización + renglones en una sola transacción (evita folios
-- "huérfanos" si fallara la inserción de los renglones a mitad de camino)
-- ----------------------------------------------------------------------------
create function public.create_quotation_with_items(p_quotation jsonb, p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.can_access() then
    raise exception 'No autorizado';
  end if;

  insert into public.quotations (
    product_type, client_name, client_address, quote_date, validity_days, quote_city, notes, conditions,
    tax_rate, discount_type, discount_value, shipping_cost, subtotal, discount_amount, tax_amount, total, created_by
  )
  values (
    (p_quotation->>'product_type')::quotation_product_type,
    p_quotation->>'client_name',
    nullif(p_quotation->>'client_address', ''),
    coalesce((p_quotation->>'quote_date')::date, current_date),
    coalesce((p_quotation->>'validity_days')::int, 10),
    coalesce(p_quotation->>'quote_city', 'Mérida, Yucatán'),
    coalesce(p_quotation->>'notes', ''),
    coalesce(p_quotation->'conditions', '[]'::jsonb),
    coalesce((p_quotation->>'tax_rate')::numeric, 0),
    coalesce((p_quotation->>'discount_type')::discount_type, 'none'),
    coalesce((p_quotation->>'discount_value')::numeric, 0),
    coalesce((p_quotation->>'shipping_cost')::numeric, 0),
    (p_quotation->>'subtotal')::numeric,
    (p_quotation->>'discount_amount')::numeric,
    (p_quotation->>'tax_amount')::numeric,
    (p_quotation->>'total')::numeric,
    auth.uid()
  )
  returning id into v_id;

  insert into public.quotation_items (
    quotation_id, seed_id, plant_id, common_name, scientific_name, classification,
    available_months, seeds_per_kilo, bag_size, height, unit_price, quantity, subtotal, sort_order
  )
  select
    v_id,
    nullif(item->>'seed_id', '')::uuid,
    nullif(item->>'plant_id', '')::uuid,
    item->>'common_name',
    nullif(item->>'scientific_name', ''),
    nullif(item->>'classification', '')::seed_classification,
    nullif(item->>'available_months', ''),
    nullif(item->>'seeds_per_kilo', '')::integer,
    nullif(item->>'bag_size', '')::bag_size,
    nullif(item->>'height', '')::plant_height,
    (item->>'unit_price')::numeric,
    (item->>'quantity')::numeric,
    (item->>'subtotal')::numeric,
    (ord - 1)::integer
  from jsonb_array_elements(p_items) with ordinality as t(item, ord);

  return v_id;
end;
$$;

revoke all on function public.create_quotation_with_items(jsonb, jsonb) from public;
grant execute on function public.create_quotation_with_items(jsonb, jsonb) to authenticated;

-- ----------------------------------------------------------------------------
-- RPC: restaurar un respaldo (solo superadmin). Reemplaza semillas, plantas,
-- cotizaciones y sus renglones dentro de una sola transacción; nunca toca
-- auth.users/profiles ni el estado del killswitch en system_settings.
-- ----------------------------------------------------------------------------
create function public.restore_backup(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_superadmin() then
    raise exception 'Solo un superadmin puede restaurar un respaldo';
  end if;

  delete from public.quotation_items;
  delete from public.quotations;
  delete from public.seeds;
  delete from public.plants;

  insert into public.seeds (
    id, code, common_name, scientific_name, classification, available_months,
    seeds_per_kilo, unit_price, stock_kg, created_at, updated_at
  )
  select
    (r->>'id')::uuid, r->>'code', r->>'common_name', r->>'scientific_name',
    (r->>'classification')::seed_classification, r->>'available_months',
    nullif(r->>'seeds_per_kilo', '')::integer, (r->>'unit_price')::numeric, (r->>'stock_kg')::numeric,
    coalesce((r->>'created_at')::timestamptz, now()), coalesce((r->>'updated_at')::timestamptz, now())
  from jsonb_array_elements(coalesce(p_payload->'seeds', '[]'::jsonb)) r;

  insert into public.plants (id, code, common_name, scientific_name, created_at, updated_at)
  select
    (r->>'id')::uuid, r->>'code', r->>'common_name', r->>'scientific_name',
    coalesce((r->>'created_at')::timestamptz, now()), coalesce((r->>'updated_at')::timestamptz, now())
  from jsonb_array_elements(coalesce(p_payload->'plants', '[]'::jsonb)) r;

  insert into public.quotations (
    id, folio, product_type, client_name, client_address, quote_date, validity_days, quote_city, notes,
    conditions, tax_rate, discount_type, discount_value, shipping_cost, subtotal, discount_amount, tax_amount,
    total, status, created_by, created_at, updated_at
  )
  select
    (r->>'id')::uuid, r->>'folio', (r->>'product_type')::quotation_product_type, r->>'client_name', r->>'client_address',
    (r->>'quote_date')::date, (r->>'validity_days')::integer, r->>'quote_city', r->>'notes',
    coalesce(r->'conditions', '[]'::jsonb), (r->>'tax_rate')::numeric, (r->>'discount_type')::discount_type,
    (r->>'discount_value')::numeric, (r->>'shipping_cost')::numeric, (r->>'subtotal')::numeric,
    (r->>'discount_amount')::numeric, (r->>'tax_amount')::numeric, (r->>'total')::numeric,
    (r->>'status')::quotation_status, nullif(r->>'created_by', '')::uuid,
    coalesce((r->>'created_at')::timestamptz, now()), coalesce((r->>'updated_at')::timestamptz, now())
  from jsonb_array_elements(coalesce(p_payload->'quotations', '[]'::jsonb)) r;

  insert into public.quotation_items (
    id, quotation_id, seed_id, plant_id, common_name, scientific_name, classification,
    available_months, seeds_per_kilo, bag_size, height, unit_price, quantity, subtotal, sort_order
  )
  select
    (r->>'id')::uuid, (r->>'quotation_id')::uuid, nullif(r->>'seed_id', '')::uuid, nullif(r->>'plant_id', '')::uuid,
    r->>'common_name', r->>'scientific_name', nullif(r->>'classification', '')::seed_classification,
    r->>'available_months', nullif(r->>'seeds_per_kilo', '')::integer, nullif(r->>'bag_size', '')::bag_size,
    nullif(r->>'height', '')::plant_height, (r->>'unit_price')::numeric, (r->>'quantity')::numeric,
    (r->>'subtotal')::numeric, coalesce((r->>'sort_order')::integer, 0)
  from jsonb_array_elements(coalesce(p_payload->'quotation_items', '[]'::jsonb)) r;

  -- realinear secuencias para que los próximos folios/códigos no choquen con los restaurados
  perform setval('public.seed_code_seq', greatest(1, (select count(*) from public.seeds)));
  perform setval('public.plant_code_seq', greatest(1, (select count(*) from public.plants)));
  perform setval('public.quotation_folio_seq', greatest(1, (select count(*) from public.quotations)));

  return jsonb_build_object('success', true);
end;
$$;

revoke all on function public.restore_backup(jsonb) from public;
grant execute on function public.restore_backup(jsonb) to authenticated;

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.system_settings enable row level security;
alter table public.seeds enable row level security;
alter table public.plants enable row level security;
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;

-- profiles: cada quien ve su fila; superadmin ve/edita todas.
-- No existe policy de UPDATE para el propio usuario a propósito: así nadie
-- puede auto-promoverse a superadmin editando su propia fila desde el cliente.
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or public.is_superadmin());
create policy "profiles_admin_write" on public.profiles
  for all using (public.is_superadmin()) with check (public.is_superadmin());

-- system_settings: cualquier autenticado puede leer (para saber si está
-- suspendido); solo superadmin puede modificar el killswitch.
create policy "system_settings_select" on public.system_settings
  for select using (auth.uid() is not null);
create policy "system_settings_update" on public.system_settings
  for update using (public.is_superadmin()) with check (public.is_superadmin());

-- datos de negocio: disponibles mientras el sistema esté activo (o para superadmin)
create policy "seeds_access" on public.seeds
  for all using (public.can_access()) with check (public.can_access());
create policy "plants_access" on public.plants
  for all using (public.can_access()) with check (public.can_access());
create policy "quotations_access" on public.quotations
  for all using (public.can_access()) with check (public.can_access());
create policy "quotation_items_access" on public.quotation_items
  for all using (public.can_access()) with check (public.can_access());
