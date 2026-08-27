-- Demo seed data for Kazi Ready
-- Run after 001_init.sql. Safe to re-run (uses fixed UUIDs).
--
-- Replace the phone numbers below with real test numbers (E.164 format,
-- e.g. +2547XXXXXXXX) before running your demo so the reminders land on
-- an actual phone.

insert into companies (id, name, primary_contact_name, primary_contact_phone, secondary_contact_name, secondary_contact_phone)
values
  ('11111111-1111-1111-1111-111111111111', 'Jua Metal Fabricators Ltd', 'Wanjiku Kamau', '+254700000001', 'David Otieno', '+254700000002'),
  ('22222222-2222-2222-2222-222222222222', 'Savanna Agro Processors', 'Peter Njoroge', '+254700000003', null, null)
on conflict (id) do nothing;

-- A mix of urgency levels so the dashboard demo shows green/amber/red on load
insert into compliance_items (id, company_id, agency, license_type, reference_number, expiry_date, status)
values
  ('a1111111-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'NEMA', 'EIA License', 'NEMA-EIA-2024-8817', current_date + interval '3 days', 'active'),
  ('a1111111-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'KEBS', 'Product Standardisation Mark', 'KEBS-SM-4521', current_date + interval '14 days', 'active'),
  ('a1111111-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'County', 'Single Business Permit', 'NRB-SBP-2026-0093', current_date + interval '45 days', 'active'),
  ('a1111111-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'DOSH', 'Workplace Safety Certificate', 'DOSH-WSC-2201', current_date - interval '2 days', 'lapsed'),
  ('a2222222-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'KRA', 'Tax Compliance Certificate', 'KRA-TCC-99213', current_date + interval '30 days', 'active'),
  ('a2222222-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'NEMA', 'Effluent Discharge License', 'NEMA-ED-6650', current_date + interval '90 days', 'active')
on conflict (id) do nothing;
