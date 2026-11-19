-- Sweet Savor Cafe — Supabase setup. Paste ALL of this into Supabase → SQL Editor → Run.
-- Safe to run more than once.

-- ---------- Tables ----------
create table if not exists public.menu_items (
  id text primary key,
  name text not null,
  description text not null default '',
  price numeric(8,2) not null,
  category text not null,
  photo text not null default '',
  badge text,
  sale_label text,
  was_price numeric(8,2),
  sold_out boolean not null default false,
  is_add_on boolean not null default false,
  option_group_ids jsonb not null default '[]',
  pairings jsonb not null default '[]',
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

-- One row of shop-wide settings (name, hours, tax, colors, paused, rewards...).
-- NOTE: PIN codes are NOT stored here (customers can read this table); they stay on the staff phone.
create table if not exists public.app_settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create sequence if not exists public.order_number_seq start 101;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number int not null default nextval('public.order_number_seq'),
  name text not null,
  phone text not null,
  lines jsonb not null,
  subtotal numeric(8,2) not null,
  discount numeric(8,2) not null default 0,
  tax numeric(8,2) not null,
  total numeric(8,2) not null,
  payment text not null check (payment in ('paypal','cash')),
  paid boolean not null default false,
  notify text not null check (notify in ('app','text','both')),
  status text not null default 'received' check (status in ('received','preparing','ready','completed')),
  reward_used boolean not null default false,
  alert_seen boolean not null default false,
  customer_ref text,
  created_at timestamptz not null default now(),
  ready_at timestamptz
);
alter table public.orders add column if not exists push_token text;
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

-- ---------- Staff allow-list ----------
-- Only emails listed here count as staff. Nobody can read or edit this table through the app.
create table if not exists public.staff_emails (email text primary key);
alter table public.staff_emails enable row level security;

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.staff_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
grant execute on function public.is_staff() to anon, authenticated;

-- ---------- Security (Row Level Security) ----------
alter table public.menu_items enable row level security;
alter table public.app_settings enable row level security;
alter table public.orders enable row level security;

-- Everyone can read the menu and public settings; only signed-in staff can change them.
drop policy if exists "menu read" on public.menu_items;
create policy "menu read" on public.menu_items for select to anon, authenticated using (true);
drop policy if exists "menu staff write" on public.menu_items;
create policy "menu staff write" on public.menu_items for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "settings read" on public.app_settings;
create policy "settings read" on public.app_settings for select to anon, authenticated using (true);
drop policy if exists "settings staff write" on public.app_settings;
create policy "settings staff write" on public.app_settings for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Orders contain names and phone numbers: customers cannot read the table at all.
-- Only signed-in staff can see and update orders.
drop policy if exists "orders staff all" on public.orders;
create policy "orders staff all" on public.orders for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---------- Customer functions (customers use these instead of reading the table) ----------
create or replace function public.place_order(p jsonb)
returns table (id uuid, number int)
language plpgsql security definer set search_path = public as $$
begin
  return query
  insert into public.orders (id, name, phone, lines, subtotal, discount, tax, total, payment, paid, notify, reward_used, customer_ref, push_token)
  values (
    coalesce((p->>'id')::uuid, gen_random_uuid()), left(p->>'name', 80), left(p->>'phone', 40), p->'lines',
    (p->>'subtotal')::numeric, coalesce((p->>'discount')::numeric, 0), (p->>'tax')::numeric, (p->>'total')::numeric,
    p->>'payment', coalesce((p->>'paid')::boolean, false), p->>'notify',
    coalesce((p->>'reward_used')::boolean, false), left(p->>'customer_ref', 80), left(p->>'push_token', 200)
  )
  returning orders.id, orders.number;
end $$;

-- A customer can look up ONLY an order whose (unguessable) id they hold.
create or replace function public.get_order(order_id uuid)
returns setof public.orders
language sql security definer set search_path = public as $$
  select * from public.orders where id = order_id;
$$;

create or replace function public.mark_alert_seen(order_id uuid)
returns void
language sql security definer set search_path = public as $$
  update public.orders set alert_seen = true where id = order_id;
$$;

grant execute on function public.place_order(jsonb) to anon, authenticated;
grant execute on function public.get_order(uuid) to anon, authenticated;
grant execute on function public.mark_alert_seen(uuid) to anon, authenticated;

-- ---------- Live updates ----------
do $$ begin
  begin alter publication supabase_realtime add table public.menu_items; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.app_settings; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.orders; exception when duplicate_object then null; end;
end $$;

-- ---------- LAST STEP: tell the database who your staff are ----------
-- Replace with the email of the staff login you created (Authentication → Users), then run this one line:
-- insert into public.staff_emails (email) values ('staff@example.com') on conflict do nothing;
