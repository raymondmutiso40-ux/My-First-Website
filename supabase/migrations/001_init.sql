-- Kazi Ready — initial schema
-- Compliance deadline & document expiry SMS alerts for Kenyan manufacturers

create extension if not exists "pgcrypto";

-- ============================================================
-- companies
-- ============================================================
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  primary_contact_name text,
  primary_contact_phone text not null,      -- E.164, e.g. +2547XXXXXXXX
  secondary_contact_name text,
  secondary_contact_phone text,              -- escalation contact, optional
  created_at timestamptz default now()
);

comment on table companies is 'Manufacturers using Kazi Ready to track compliance deadlines.';

-- ============================================================
-- compliance_items
-- ============================================================
create table if not exists compliance_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  agency text not null,               -- 'KEBS' | 'NEMA' | 'KRA' | 'County' | 'DOSH' | other
  license_type text not null,         -- e.g. 'Single Business Permit', 'EIA License'
  reference_number text,
  expiry_date date not null,
  status text not null default 'active'
    check (status in ('active', 'renewed', 'lapsed')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table compliance_items is 'Individual licenses/permits/certifications tracked per company, one row per renewal cycle.';

create index if not exists idx_compliance_items_company on compliance_items(company_id);
create index if not exists idx_compliance_items_expiry on compliance_items(expiry_date);
create index if not exists idx_compliance_items_status on compliance_items(status);
-- speeds up the "find active items expiring within N days" cron query
create index if not exists idx_compliance_items_active_expiry
  on compliance_items(expiry_date)
  where status = 'active';

-- ============================================================
-- reminder_log
-- One row per SMS actually sent (or attempted) for a compliance item.
-- Used both to avoid duplicate sends on the same day/threshold and as
-- an audit trail.
-- ============================================================
create table if not exists reminder_log (
  id uuid primary key default gen_random_uuid(),
  compliance_item_id uuid not null references compliance_items(id) on delete cascade,
  days_before_expiry int not null,     -- 30, 14, 3, 0 (0 = due today)
  sent_to text not null,               -- phone number the SMS was sent to
  message text not null,
  provider_message_id text,            -- Africa's Talking messageId, for delivery reconciliation
  provider_status text,                -- 'Success' | 'Sent' | failure reason from AT
  sent_at timestamptz default now()
);

comment on table reminder_log is 'Audit trail of every reminder SMS sent, used to prevent duplicate sends per threshold per day.';

create index if not exists idx_reminder_log_item on reminder_log(compliance_item_id);
-- one send per item per threshold per day
create unique index if not exists uniq_reminder_per_item_threshold_day
  on reminder_log(compliance_item_id, days_before_expiry, (sent_at::date));

-- ============================================================
-- inbound_sms_log
-- Every inbound message hitting the webhook, matched or not.
-- Powers the "RENEWED <ref>" two-way workflow and gives you a raw
-- audit trail if AT's inbound payload ever needs replaying/debugging.
-- ============================================================
create table if not exists inbound_sms_log (
  id uuid primary key default gen_random_uuid(),
  from_phone text not null,
  raw_text text not null,
  parsed_command text,                 -- 'RENEWED' | 'UNKNOWN'
  parsed_reference text,
  matched_compliance_item_id uuid references compliance_items(id),
  result text not null,                -- 'renewed' | 'not_found' | 'ignored'
  received_at timestamptz default now()
);

create index if not exists idx_inbound_sms_from on inbound_sms_log(from_phone);

-- ============================================================
-- updated_at trigger for compliance_items
-- ============================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_compliance_items_updated_at on compliance_items;
create trigger trg_compliance_items_updated_at
  before update on compliance_items
  for each row
  execute function set_updated_at();

-- ============================================================
-- Convenience view: traffic-light status per compliance item
-- Powers the dashboard without recomputing urgency client-side.
-- ============================================================
create or replace view compliance_items_with_urgency as
select
  ci.*,
  c.name as company_name,
  c.primary_contact_phone,
  c.secondary_contact_phone,
  (ci.expiry_date - current_date) as days_remaining,
  case
    when ci.status = 'renewed' then 'green'
    when ci.status = 'lapsed' or ci.expiry_date < current_date then 'red'
    when ci.expiry_date - current_date <= 7 then 'red'
    when ci.expiry_date - current_date <= 30 then 'amber'
    else 'green'
  end as urgency
from compliance_items ci
join companies c on c.id = ci.company_id;

-- ============================================================
-- Row Level Security
-- This starter ships with permissive policies suitable for a hackathon
-- demo using the service-role key from server-side API routes only.
-- Before any real/production use, replace these with per-company auth
-- (e.g. Supabase Auth + a company_id claim) so one manufacturer can't
-- read another's compliance data.
-- ============================================================
alter table companies enable row level security;
alter table compliance_items enable row level security;
alter table reminder_log enable row level security;
alter table inbound_sms_log enable row level security;

create policy "service role full access - companies"
  on companies for all
  using (true)
  with check (true);

create policy "service role full access - compliance_items"
  on compliance_items for all
  using (true)
  with check (true);

create policy "service role full access - reminder_log"
  on reminder_log for all
  using (true)
  with check (true);

create policy "service role full access - inbound_sms_log"
  on inbound_sms_log for all
  using (true)
  with check (true);
