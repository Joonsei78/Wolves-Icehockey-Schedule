-- Wolves Icehockey 스키마: profiles / tournaments / registrations
-- Supabase SQL Editor에서 전체 실행

-- 1) profiles: 회원가입 시 auth.users에 자동 연결되는 프로필
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'member' check (role in ('member', 'admin')),
  phone text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- 신규 가입 시 auth.users -> profiles 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'member')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) tournaments: 대회 일정
create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null,
  age_group text not null,
  start_date date not null,
  end_date date not null,
  deadline date not null,
  slots_total int not null,
  fee_per_person int not null,
  description text,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.tournaments enable row level security;

create policy "tournaments are viewable by everyone"
  on public.tournaments for select
  using (true);

create policy "tournaments are insertable by admins"
  on public.tournaments for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "tournaments are updatable by admins"
  on public.tournaments for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 3) registrations: 대회 참가 신청
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  player_name text not null,
  birth_year text not null,
  jersey_number int,
  height numeric,
  weight numeric,
  position text check (position in ('Forward', 'Defence')),
  hand text check (hand in ('Left', 'Right')),
  phone text,
  paid boolean not null default false,
  submitted_file text,
  created_at timestamptz not null default now(),
  unique (tournament_id, user_id)
);

alter table public.registrations enable row level security;

create policy "registrations are viewable by everyone"
  on public.registrations for select
  using (true);

create policy "registrations are insertable by the registrant"
  on public.registrations for insert
  with check (auth.uid() = user_id);

create policy "registrations are updatable by the registrant"
  on public.registrations for update
  using (auth.uid() = user_id);
