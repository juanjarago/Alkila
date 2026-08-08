create table if not exists reservations (
  id text primary key,
  property_slug text not null,
  property_title text not null,
  date_from date not null,
  date_to date not null,
  guests integer not null,
  guest_name text,
  guest_email text,
  guest_phone text,
  total_cop integer not null,
  pay_mode text not null check (pay_mode in ('deposit', 'full')),
  paid_cop integer not null default 0,
  status text not null check (status in ('pending_payment', 'paid', 'cancelled')),
  source text not null default 'direct',
  external_reference text not null unique,
  payment_provider text,
  payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reservations_property_dates_idx
  on reservations (property_slug, date_from, date_to);

create index if not exists reservations_status_idx
  on reservations (status);

create table if not exists pricing_rules (
  property_slug text primary key,
  base_night_cop integer not null,
  weekend_night_cop integer,
  cleaning_fee_cop integer not null default 0,
  extra_guest_fee_cop integer not null default 0,
  included_guests integer not null default 1,
  min_nights integer not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists manual_blocks (
  id text primary key,
  property_slug text not null,
  date_from date not null,
  date_to date not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists manual_blocks_property_dates_idx
  on manual_blocks (property_slug, date_from, date_to);

create table if not exists seasonal_rates (
  id text primary key,
  property_slug text not null,
  name text not null,
  date_from date not null,
  date_to date not null,
  night_cop integer not null,
  min_nights integer,
  created_at timestamptz not null default now()
);

create index if not exists seasonal_rates_property_dates_idx
  on seasonal_rates (property_slug, date_from, date_to);
