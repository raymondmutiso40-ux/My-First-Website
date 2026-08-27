# Kazi Ready 🇰🇪

**Compliance deadline & document expiry SMS alerts for Kenyan manufacturers.**

Built for the **Africa's Talking Open Hackathon — Manufacturing (Nairobi, Kenya)**.

Manufacturers in Kenya juggle overlapping renewal cycles across **KEBS**
(product standards), **NEMA** (environmental licenses), **KRA** (tax
compliance), **county government** (business permits, fire safety), and
**DOSH** (workplace safety) — with no unified reminder system. Deadlines get
missed because they fall through the cracks between agencies and whoever
happens to be handling compliance that quarter. Kazi Ready fixes that with
one thing every manufacturer already has: a phone that receives SMS.

## How it works

1. A manufacturer (or their admin) registers their licenses/permits with an
   expiry date — one at a time via the API, or in bulk via CSV import.
2. A daily job checks every active compliance item against expiry.
3. At **30, 14, 3, and 0 days** before expiry, an **SMS reminder** goes out
   via the **Africa's Talking SMS API** to the responsible contact.
4. Inside 3 days of expiry, a **secondary contact** (e.g. the
   owner/director) is CC'd automatically — this is the escalation path.
5. The contact can reply **`RENEWED <reference number>`** by SMS to mark the
   item complete and stop future reminders — a lightweight two-way workflow
   using nothing but the same inbound SMS webhook.
6. A web dashboard shows every company's compliance items with a
   traffic-light (green / amber / red) urgency view.

This project intentionally uses **one Africa's Talking API — SMS — used
both outbound (reminders) and inbound (the `RENEWED` command)**, rather than
spreading thin across USSD/voice/payments. That keeps the build tight and
the demo bulletproof.

## Tech stack

- **Next.js 14** (App Router, TypeScript) — frontend dashboard + API routes
- **Supabase** (Postgres) — data storage, view-based urgency calculation
- **Africa's Talking SMS API** — outbound reminders + inbound `RENEWED` command
- **Tailwind CSS** — dashboard styling
- **Vercel Cron** — daily trigger for the reminder job

## Project structure

```
kazi-ready/
├── app/
│   ├── page.tsx                        # dashboard (server component)
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       ├── cron/reminders/route.ts     # daily reminder job (GET, cron-triggered)
│       ├── sms/inbound/route.ts        # AT inbound SMS webhook (POST)
│       ├── companies/route.ts          # create/list companies
│       └── compliance-items/
│           ├── route.ts                # create/list compliance items
│           └── import/route.ts         # CSV bulk import
├── components/
│   ├── ComplianceTable.tsx
│   └── UrgencyBadge.tsx
├── lib/
│   ├── supabase.ts                     # server + browser Supabase clients
│   ├── africastalking.ts               # SMS send wrapper
│   └── compliance.ts                   # thresholds, message copy, urgency logic
├── supabase/
│   ├── migrations/001_init.sql         # full schema, view, RLS
│   └── seed/
│       ├── seed.sql                    # demo companies + compliance items
│       └── sample_import.csv           # CSV import template
├── vercel.json                         # cron schedule
└── .env.example
```

## Setup

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/kazi-ready.git
cd kazi-ready
npm install
```

### 2. Create a Supabase project

- Create a new project at [supabase.com](https://supabase.com).
- In the SQL editor, run `supabase/migrations/001_init.sql`.
- Optionally run `supabase/seed/seed.sql` for demo data (edit the phone
  numbers first so reminders land on a real phone).
- Grab your project URL, anon key, and service role key from
  **Project Settings → API**.

### 3. Get Africa's Talking credentials

- Sign up at [africastalking.com](https://africastalking.com) and create an
  app (use the **Sandbox** app for free testing).
- Grab your **username** and **API key** from the dashboard.
- Under **SMS → SMS Settings**, register a sender ID/shortcode for outbound
  messages, and set your **Callback URL** to
  `https://<your-deployment>/api/sms/inbound` (or use `ngrok` for local
  testing — see below).

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AT_USERNAME=
AT_API_KEY=
AT_SENDER_ID=
CRON_SECRET=
```

### 5. Run locally

```bash
npm run dev
```

Dashboard: [http://localhost:3000](http://localhost:3000)

### 6. Test the inbound webhook locally

Africa's Talking needs a public URL to hit, so use a tunnel:

```bash
npx ngrok http 3000
```

Set the ngrok URL + `/api/sms/inbound` as your AT callback URL, then text
your AT sandbox number `RENEWED <reference>` to test the two-way flow.

### 7. Manually trigger the reminder job

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/reminders
```

On Vercel, this runs automatically every day at 06:00 UTC per
`vercel.json` — Vercel Cron sends the `Authorization: Bearer $CRON_SECRET`
header automatically as long as `CRON_SECRET` is set in your project's
environment variables.

## Bulk-importing existing licenses

```bash
curl -X POST http://localhost:3000/api/compliance-items/import \
  -H "Content-Type: text/csv" \
  --data-binary @supabase/seed/sample_import.csv
```

CSV columns: `company_name,agency,license_type,reference_number,expiry_date`
(`expiry_date` in `YYYY-MM-DD`). Companies must already exist — create them
first via `POST /api/companies`.

## Deploying

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add all the environment variables from `.env.example` in the Vercel
   project settings.
4. Deploy — `vercel.json` will register the daily cron automatically.
5. Update your Africa's Talking callback URL to point at the deployed
   `/api/sms/inbound` endpoint.

## Demo script (hackathon judging)

1. Show the dashboard — a handful of seeded items in green/amber/red states.
2. Trigger the cron endpoint manually.
3. A real SMS lands on a phone: *"Your NEMA EIA License expires in 3 days..."*
4. Reply **`RENEWED NEMA-EIA-2024-8817`** from that phone.
5. Refresh the dashboard — the item flips to green in real time.
6. Close with the pitch: every manufacturer, regardless of sector or size,
   has this exact problem — it isn't a niche tool for one industry segment.

## Roadmap / known limitations

This is a hackathon MVP. Before any real-world use:

- **RLS policies** in `001_init.sql` are permissive (service-role only).
  Add Supabase Auth with per-company scoping before onboarding real
  manufacturers, so one company can never see another's data.
- **Reference-number matching** on inbound SMS is a simple case-insensitive
  match — fine for a demo, but should be scoped per-company (a phone number
  should only be able to renew items belonging to its own company) before
  production use.
- No authentication on the dashboard yet — add Supabase Auth or a simple
  magic-link flow per company.
- Delivery-status webhooks from Africa's Talking (for tracking whether an
  SMS actually landed) aren't wired up yet — `reminder_log.provider_status`
  currently only reflects the initial send response.

## License

MIT — see [LICENSE](./LICENSE).
