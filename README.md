# Ruwa Dental Center — website & clinic system

Next.js 15 (App Router, TypeScript) · Tailwind CSS 4 · Postgres with Drizzle ORM · deployed on Vercel.

**Public site:** home page (services, doctors, about, contact with map, feedback), online booking, booking confirmation, booking tracking, privacy notice, SEO (metadata, Dentist structured data, sitemap, robots).

**Admin portal (`/admin`):** dashboard, appointments (confirm, reschedule, assign doctor, clinic note), patients with medical profiles, consultations and prescriptions, doctors with portal logins, services, feedback moderation, Website CMS, account and staff logins.

**Roles:** Administrator (everything) · Doctor (own appointments, patient records, consultations) · Reception (appointments and patients, no clinical notes).

---

## Run it on your computer

Requires Node.js 20 or newer. Nothing else to install: without a `DATABASE_URL`, the app uses a
built-in database (PGlite) saved in the `.data` folder, and creates the tables and starting content itself.

```bash
npm install
npm run dev                 # http://localhost:3000  ·  admin at http://localhost:3000/admin
```

Sign in with `admin@ruwadental.co.zw` / `ChangeMe!2026`, then change the password (Admin → Account).
To start again with a fresh local database, stop the server and delete the `.data` folder.

To use your own Postgres or a Neon database instead, copy `.env.example` to `.env`, fill in
`DATABASE_URL` and `DIRECT_URL`, then run `npm run db:migrate` and `npm run db:seed`.
If anything about the database is wrong, the site shows a "Setup needed" page saying what to fix.

## Deploy to Vercel

1. Put the project on GitHub (GitHub Desktop: File → Add local repository → choose this folder → Publish repository, private).
2. In Vercel: **Add New → Project**, import the repository. Don't deploy yet if it offers; first open **Environment Variables** and add:
   - `AUTH_SECRET` — any random text of 32+ characters
   - `SEED_ADMIN_PASSWORD` — the password for the first admin login
   - `NEXT_PUBLIC_SITE_URL` — e.g. `https://ruwadental.co.zw` (or the `.vercel.app` address for now)
3. Deploy. The first deploy may fail because there's no database yet — that's expected.
4. In the project, open **Storage → Create Database → Neon**, and connect it to the project (all environments).
   This adds `DATABASE_URL` and `DATABASE_URL_UNPOOLED` automatically.
5. **Deployments → ⋯ on the latest → Redeploy.** Each build creates/updates the tables and loads the starting
   content (clinic details, 6 services, Dr Tapiwa Gwenhamo, the admin login). Running it again never duplicates anything.
6. Open `/admin` on the live site, sign in with `admin@ruwadental.co.zw` and your `SEED_ADMIN_PASSWORD`.
   Until you set your own password in Admin → Account, every deploy keeps the admin login matched to
   `SEED_ADMIN_PASSWORD` — so if you change it in Vercel, just redeploy. After you change it in Account, deploys leave it alone.
7. **Settings → Domains:** add `ruwadental.co.zw` and set the DNS records Vercel shows at your domain registrar. HTTPS is automatic.

From then on, every change pushed to GitHub deploys automatically.

## WhatsApp booking alerts

Every booking is saved first. The clinic is then alerted on WhatsApp, and the patient's confirmation page
always has a **Message us on WhatsApp** button with the booking details pre-filled — so nothing is lost
while the automatic alert is being set up.

To switch on automatic alerts (WhatsApp Business Cloud API):

1. Create a Meta Business account and complete business verification.
2. In Meta for Developers, create an app, add **WhatsApp**, and register a sending phone number.
   (The number receiving alerts, `CLINIC_WHATSAPP_TO`, must be different from the sending number.)
3. Create a permanent access token (System User) → `WHATSAPP_TOKEN`; copy the **Phone number ID** → `WHATSAPP_PHONE_NUMBER_ID`.
4. Create a **Utility** message template, e.g. name `new_booking`, language English, body:
   ```
   New appointment request {{1}}
   Name: {{2}}
   Phone: {{3}}
   Service: {{4}}
   Doctor: {{5}}
   Date: {{6}} at {{7}}
   Reason: {{8}}
   ```
   When approved, set `WHATSAPP_TEMPLATE_NAME=new_booking` and redeploy.

Without a template name the system sends plain text, which Meta only delivers within 24 hours of the clinic
number messaging the business number — fine for testing only. Bookings with a delivered alert show
“WhatsApp sent” on the Appointments page.

## Where things live

```
app/(site)/            public pages (home, book-appointment, booking/[code], track-booking, privacy)
app/admin/login        sign-in
app/admin/(portal)/    admin pages
app/actions/           server actions (public forms, admin, auth)
components/            UI components (admin/ for the portal)
db/schema.ts           database tables · db/migrations/ generated SQL
lib/                   sessions, WhatsApp, phone formatting, dates, codes, rate limiting, audit log
scripts/               migrate and seed
public/brand/logo.png  the logo (transparent PNG); app/icon.png and app/favicon.ico are the browser icons
```

Changing the schema: edit `db/schema.ts`, run `npm run db:generate`, commit the new file in `db/migrations`.

## Notes

- Spam protection: hidden honeypot field plus per-IP rate limiting on booking, feedback, tracking and sign-in.
  The limiter is per server instance; for a strict shared limit add Upstash Ratelimit.
- Tracking needs the booking code **and** the phone number used to book.
- Deleting a patient or doctor archives the record; an administrator can restore it.
- Every change to appointments, patients, consultations, doctors, services, feedback and settings is written to the audit log table.
- All dates and times use Africa/Harare.
