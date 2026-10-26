# Bhavik's Interior — Phase 2: Marketing Content Studio

This folder is the **complete cumulative source** for Phases 1 and 2, not just a patch. Keep your own Git repository name. The project uses Next.js 16, React 19, TypeScript, Tailwind CSS 4 and a brand-new Supabase PostgreSQL/Auth/Storage project.

**Important:** Do not use credentials, database URLs, customer records, branding or deployed assets from any legacy project. This repository contains no inherited `.env` file or connection to a previous Supabase instance.

## What Phase 2 adds

- A responsive `/studio` dashboard behind email/password authentication and server-side role authorization (`admin` or `marketing`).
- `/studio/settings`: edit homepage, About, Services, Projects, Contact page banner copy; homepage story, hero and CTA imagery; home section headings, contact details, SEO information.
- `/studio/services`: create/update/delete services, cover imagery, description, detailed copy, features, SEO, draft/published visibility and sort order.
- `/studio/projects`: create/update/delete projects, image gallery, year, description, SEO, visibility and order.
- `/studio/faqs`: create/update/delete questions/answers with draft/publish and ordering.
- `/studio/process`: create/update/delete homepage process steps and their order.
- `/studio/media`: upload *public marketing images* to Supabase Storage; copy URLs for editors; browse and delete uploads. JPEG/PNG/WebP/AVIF, max 5 MB. **Do not store private client records or confidential floorplans in this bucket.**
- Public website fetches **published** services/projects/FAQs/process steps from Supabase, and displays newly editable content across the existing pages.
- Both server-side editor checks and database RLS policies. No service-role key in the website code.

The original public-facing layout and brand-inspired design from Phase 1 remain intact. No imported vendor template source/brand assets are included.

## Requirements

- Node.js 20.9+ (Node 22 recommended)
- Fresh Supabase project (no legacy production data)
- npm

## Setup A: Unconfigured local preview

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Public pages use **concept data for local preview only**. `/studio` editing, asset uploads and inquiry persistence require a *new* Supabase connection.

## Setup B: Fresh Supabase connection

1. Open **your NEW Supabase project** → SQL Editor.
2. Run `supabase/migrations/001_studio_foundation.sql` **only in that new project**. (If Phase 1 migration already ran there, skip this step.)
3. Run `supabase/migrations/002_marketing_cms.sql` in that same new project. This adds content fields, process steps, RLS policies and a public marketing asset bucket. It is designed as an additive migration; **never run it on an old production environment**.
4. Copy `.env.example` to `.env.local` and fill in values from the **new Supabase project**:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-NEW-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_NEW_PUBLISHABLE_OR_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Do **not** add a Supabase `service_role` or secret key to browser-exposed environment variables or commit secrets to Git.

5. Supabase Dashboard → **Authentication → Users** → create your own email/password editor user. Confirm the email. Copy the new user's UUID.
6. In the **new** project's SQL Editor, assign them editor permission (the SQL Editor runs with privileged access):

```sql
insert into public.profiles (id, role, full_name)
values ('YOUR_NEW_AUTH_USER_UUID', 'admin', 'Site owner')
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name;
```

7. Restart `npm run dev`. Sign in at `http://localhost:3000/studio/login`.

### Quick manual test

- Open `/studio`, confirm counts for services/projects/FAQs/process.
- Make a new service as a **draft**. Confirm it is not on `/services`.
- Edit that service, check **Published** and save. Confirm it shows publicly and its detail page loads.
- Change homepage hero copy from `/studio/settings`, save and refresh `/`.
- Upload a nonconfidential image in `/studio/media`; copy its URL into a service or hero image field.
- Sign out and open `/studio/settings`: it should require login. Unprivileged users should not be able to edit even by calling actions directly.

## Development commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Phase 2 boundaries / production TODOs

- The Studio now manages public content represented in the Phase 1 site. It does **not yet** recreate the older, much larger application's client portal, complete quotations, complex calculators, city pages, blog, lead operations or AI integrations. Those are future modules requiring explicit scoping.
- URLs for images are stored in content tables; deleting an image in the media library can break references. Change content URLs before deleting a referenced image.
- Uploaded assets are **public by design**; use a separate private bucket and signed URL policies for private client materials later.
- Contact form currently uses a honeypot but needs rate limiting/CAPTCHA and privacy disclosures before opening to public traffic.
- Illustrative concept photos (from Unsplash) and placeholder project records must be replaced with licensed, accurate content before publishing. No legacy secrets are bundled.
- End-to-end authentication/storage/database test is only possible after configuring your fresh Supabase project. Source parsing was validated, but this packaging environment could not complete `npm install` / `next build`.
