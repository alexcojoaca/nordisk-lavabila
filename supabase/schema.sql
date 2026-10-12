create table if not exists public.subscribers (
  id text primary key,
  first_name text not null,
  last_name text not null,
  phone text not null,
  phone_key text not null,
  password_hash text not null,
  card_code text not null,
  paid boolean not null default false,
  created_at timestamptz not null default now(),
  constraint subscribers_phone_key_key unique (phone_key),
  constraint subscribers_card_code_key unique (card_code)
);

create table if not exists public.messages (
  id text primary key,
  name text not null,
  contact text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;
alter table public.messages enable row level security;
