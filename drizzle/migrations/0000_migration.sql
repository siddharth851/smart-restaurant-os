create type public.app_role as enum ('super_admin','restaurant_owner','restaurant_staff','kitchen_staff');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  slug text not null unique,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.restaurants to authenticated;
grant all on public.restaurants to service_role;
alter table public.restaurants enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "Users read own profile" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'super_admin'));
create policy "Users update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'super_admin'));
create policy "Owners read own restaurant" on public.restaurants for select to authenticated using (owner_id = auth.uid() or public.has_role(auth.uid(),'super_admin'));
create policy "Owners update own restaurant" on public.restaurants for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger restaurants_touch before update on public.restaurants for each row execute function public.touch_updated_at();

-- Signup: create profile; public sign-ups with a restaurant name become restaurant_owner ONLY.
-- Roles are never read from client metadata; super_admin / staff are provisioned server-side.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  _rname text := nullif(trim(new.raw_user_meta_data->>'restaurant_name'), '');
  _base text;
begin
  insert into public.profiles (id, full_name, phone, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.raw_user_meta_data->>'phone', new.email);

  if _rname is not null then
    _base := trim(both '-' from regexp_replace(lower(_rname), '[^a-z0-9]+', '-', 'g'));
    if _base = '' then _base := 'restaurant'; end if;
    insert into public.restaurants (owner_id, name, slug, phone)
    values (new.id, left(_rname, 120), left(_base, 50) || '-' || substr(replace(new.id::text,'-',''),1,6), new.raw_user_meta_data->>'phone');
    insert into public.user_roles (user_id, role) values (new.id, 'restaurant_owner');
  end if;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();