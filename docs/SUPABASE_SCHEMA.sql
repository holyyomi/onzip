-- ================================================================
-- 온집 Supabase Schema
-- 현재: localStorage 기반 MVP
-- 다음 단계: 이 SQL을 Supabase 프로젝트에 적용하면 멀티 디바이스 공유 가능
--
-- 적용 방법:
--   1. https://supabase.com 에서 새 프로젝트 생성
--   2. SQL Editor에서 아래 SQL 실행
--   3. .env 파일에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 추가
--   4. src/data/repositories/base.ts를 Supabase 클라이언트로 교체
-- ================================================================

-- 확장
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────
-- households (집)
-- ─────────────────────────────────
create table households (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null default '우리집',
  local_alias text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────
-- household_users (Supabase Auth 사용자와 집 연결)
-- ─────────────────────────────────
create table household_users (
  id           uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null default 'member' check (role in ('owner','member')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (household_id, user_id)
);

-- ─────────────────────────────────
-- members (가족 구성원)
-- ─────────────────────────────────
create table members (
  id           uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  name         text not null,
  role         text not null check (role in ('me','spouse','child','parent','family','shared')),
  local_alias  text check (local_alias in ('me','spouse','shared')),
  color        text not null default '#3B82F6',
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (household_id, local_alias)
);

-- ─────────────────────────────────
-- calendar_events (캘린더 이벤트)
-- ─────────────────────────────────
create table calendar_events (
  id           uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  title        text not null,
  event_type   text not null check (event_type in ('schedule','anniversary','fixed_expense','subscription','utility','checklist')),
  start_date   date not null,
  end_date     date,
  time         text,
  amount       integer,
  member_id    uuid references members(id) on delete set null,
  is_done      boolean not null default false,
  repeat_rule  text not null default 'none' check (repeat_rule in ('none','daily','weekly','monthly','yearly')),
  source_type  text,
  source_id    uuid,
  memo         text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─────────────────────────────────
-- ledger_entries (가계부)
-- ─────────────────────────────────
create table ledger_entries (
  id             uuid primary key default uuid_generate_v4(),
  household_id   uuid not null references households(id) on delete cascade,
  entry_type     text not null check (entry_type in ('income','expense')),
  amount         integer not null,
  date           date not null,
  category       text not null,
  payment_method text check (payment_method in ('card','auto_transfer','bank_transfer','manual','simple_pay')),
  member_id      uuid references members(id) on delete set null,
  memo           text not null default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─────────────────────────────────
-- fixed_expenses (고정지출)
-- ─────────────────────────────────
create table fixed_expenses (
  id               uuid primary key default uuid_generate_v4(),
  household_id     uuid not null references households(id) on delete cascade,
  title            text not null,
  amount           integer not null,
  category         text not null,
  payment_day      smallint not null check (payment_day between 1 and 31),
  payment_method   text not null check (payment_method in ('card','auto_transfer','bank_transfer','manual','simple_pay')),
  member_id        uuid references members(id) on delete set null,
  is_active        boolean not null default true,
  calendar_visible boolean not null default true,
  status           text not null default 'pending' check (status in ('pending','done','overdue')),
  memo             text not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─────────────────────────────────
-- incomes (수입)
-- ─────────────────────────────────
create table incomes (
  id           uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  title        text not null,
  amount       integer not null,
  income_day   smallint not null check (income_day between 1 and 31),
  income_type  text not null check (income_type in ('fixed','side','one_time','other')),
  member_id    uuid references members(id) on delete set null,
  repeat_rule  text not null default 'monthly',
  memo         text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─────────────────────────────────
-- subscriptions (구독)
-- ─────────────────────────────────
create table subscriptions (
  id               uuid primary key default uuid_generate_v4(),
  household_id     uuid not null references households(id) on delete cascade,
  title            text not null,
  amount           integer not null,
  payment_day      smallint not null check (payment_day between 1 and 31),
  payment_method   text not null,
  status           text not null default 'active' check (status in ('active','considering_cancel','cancelled')),
  member_id        uuid references members(id) on delete set null,
  calendar_visible boolean not null default true,
  memo             text not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─────────────────────────────────
-- checklists + checklist_items
-- ─────────────────────────────────
create table checklists (
  id               uuid primary key default uuid_generate_v4(),
  household_id     uuid not null references households(id) on delete cascade,
  title            text not null,
  category         text not null default '생활',
  member_id        uuid references members(id) on delete set null,
  due_date         date,
  repeat_rule      text not null default 'none',
  calendar_visible boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table checklist_items (
  id           uuid primary key default uuid_generate_v4(),
  checklist_id uuid not null references checklists(id) on delete cascade,
  content      text not null,
  is_done      boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─────────────────────────────────
-- shopping_items (장보기)
-- ─────────────────────────────────
create table shopping_items (
  id              uuid primary key default uuid_generate_v4(),
  household_id    uuid not null references households(id) on delete cascade,
  name            text not null,
  category        text not null default '식재료',
  expected_amount integer,
  actual_amount   integer,
  store           text not null default '',
  is_done         boolean not null default false,
  is_favorite     boolean not null default false,
  memo            text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─────────────────────────────────
-- household_supplies (생활용품)
-- ─────────────────────────────────
create table household_supplies (
  id                   uuid primary key default uuid_generate_v4(),
  household_id         uuid not null references households(id) on delete cascade,
  name                 text not null,
  category             text not null default '생활용품',
  status               text not null default 'enough' check (status in ('enough','low','need_buy')),
  repurchase_cycle_days integer,
  purchase_link_memo   text not null default '',
  member_id            uuid references members(id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ─────────────────────────────────
-- chores (집안일)
-- ─────────────────────────────────
create table chores (
  id               uuid primary key default uuid_generate_v4(),
  household_id     uuid not null references households(id) on delete cascade,
  title            text not null,
  repeat_rule      text not null default 'weekly',
  member_id        uuid references members(id) on delete set null,
  due_date         date,
  calendar_visible boolean not null default false,
  is_done          boolean not null default false,
  memo             text not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─────────────────────────────────
-- records (생활 기록)
-- ─────────────────────────────────
create table records (
  id               uuid primary key default uuid_generate_v4(),
  household_id     uuid not null references households(id) on delete cascade,
  title            text not null,
  content          text not null default '',
  record_type      text not null check (record_type in ('life','spending_note','family_meeting','anniversary','home')),
  record_date      date not null,
  member_id        uuid references members(id) on delete set null,
  tags             text[] not null default '{}',
  related_amount   integer,
  related_event_id uuid,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─────────────────────────────────
-- templates
-- ─────────────────────────────────
create table templates (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  category    text not null,
  description text not null default '',
  items_json  jsonb not null default '[]',
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─────────────────────────────────
-- app_settings
-- ─────────────────────────────────
create table app_settings (
  id           uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  setting_key  text not null,
  setting_value text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (household_id, setting_key)
);

-- ─────────────────────────────────
-- RLS (Row Level Security) — 멀티 테넌트 보안
-- ─────────────────────────────────
-- 참고: Supabase Auth 연동 후 아래 패턴으로 RLS 정책 추가 필요
-- 핵심 원칙: auth.uid()가 household_users에 연결된 household 데이터만 접근 가능.
--
-- alter table households enable row level security;
-- alter table household_users enable row level security;
-- alter table members enable row level security;
-- alter table calendar_events enable row level security;
-- alter table ledger_entries enable row level security;
-- alter table fixed_expenses enable row level security;
-- alter table incomes enable row level security;
-- alter table subscriptions enable row level security;
-- alter table checklists enable row level security;
-- alter table checklist_items enable row level security;
-- alter table shopping_items enable row level security;
-- alter table household_supplies enable row level security;
-- alter table chores enable row level security;
-- alter table records enable row level security;
-- alter table app_settings enable row level security;
--
-- create policy "households_select_member" on households
--   for select using (
--     exists (
--       select 1 from household_users hu
--       where hu.household_id = households.id
--       and hu.user_id = auth.uid()
--     )
--   );
--
-- 테이블별 CRUD 정책은 Auth 구현 시 실제 사용자 초대/소유자 모델에 맞춰 추가한다.

-- ─────────────────────────────────
-- Indexes
-- ─────────────────────────────────
create index idx_calendar_events_household_date on calendar_events(household_id, start_date);
create index idx_ledger_entries_household_date on ledger_entries(household_id, date);
create index idx_fixed_expenses_household on fixed_expenses(household_id);
create index idx_records_household_date on records(household_id, record_date);
create index idx_shopping_items_household on shopping_items(household_id, is_done);
create index idx_households_local_alias on households(local_alias);
create index idx_household_users_user on household_users(user_id);
create index idx_members_household_alias on members(household_id, local_alias);
