# Fitness Trainer Portfolio

A modern, single-page marketing site for a personal trainer (demo persona: **Alex Moreno**). The site showcases the trainer's brand, weekly small-group class schedule, bio and credentials, client testimonials, and a final call-to-action — all rendered from a single, typed content file so the trainer's info can be updated in one place.

## What's inside

The landing page is composed of focused sections:

- **Navbar** — sticky top navigation with anchor links to each section
- **Hero** — headline, tagline, primary/secondary CTAs, and a hero image
- **Weekly Schedule** — Monday–Saturday class cards with category, duration, location, and remaining spots
- **About** — coach bio, credentials, and gallery imagery
- **Testimonials** — quotes from clients across different class types
- **Final CTA** — closing prompt to book a session
- **Site Footer** — tagline, email, and social handle

All copy, classes, testimonials, and imagery are driven by `lib/trainer-content.ts`, with shared types in `lib/types.ts`.

## Tech stack

- **[Next.js 16](https://nextjs.org)** — App Router, React Server Components, `next/font`, and `next/image` remote patterns
- **[React 19](https://react.dev)**
- **[TypeScript 5](https://www.typescriptlang.org)** — strict, fully typed content model
- **[Tailwind CSS v4](https://tailwindcss.com)** — via `@tailwindcss/postcss`
- **[Geist + Geist Mono](https://vercel.com/font)** — loaded through `next/font/google`
- **ESLint 9** — using `eslint-config-next`
- **[@supabase/supabase-js](https://supabase.com/docs/reference/javascript/introduction)** + **[@supabase/ssr](https://supabase.com/docs/guides/auth/server-side/nextjs)** — email/password auth, RLS-backed reads
- **Unsplash** — remote images allow-listed in `next.config.ts`

> **Supabase:** SQL migrations live in `supabase/migrations/`. Auth routes: `/login`, `/signup`, `/auth/callback`. Mock dashboards: `/dashboard` (user; admins are redirected to `/admin`), `/admin` (admin only). See **Supabase setup** below.

## Project structure

```
app/
  layout.tsx
  page.tsx
  globals.css
  login/                 # Sign-in + server action
  signup/                # Sign-up + server action
  auth/
    callback/route.ts    # Email confirm / PKCE code exchange
    actions.ts           # Logout
  dashboard/page.tsx    # Mock user dashboard
  admin/page.tsx        # Mock admin dashboard
  unauthorized/page.tsx
components/
  landing/
  auth/                  # AuthCard
lib/
  trainer-content.ts
  types.ts
  supabase/              # Browser + server + middleware + route-handler clients
  auth/role.ts
middleware.ts
supabase/migrations/    # Postgres schema + RLS
public/
next.config.ts
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com) (or use the [Supabase CLI](https://supabase.com/docs/guides/cli) locally).
2. Copy [`.env.example`](./.env.example) to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from **Project Settings → API**.
3. Apply the schema: paste [`supabase/migrations/20260514130000_initial_schema.sql`](./supabase/migrations/20260514130000_initial_schema.sql) into the **SQL Editor** and run it, or use `supabase link` + `supabase db push` with a linked project.
4. Under **Authentication → Providers**, enable **Email**. For local smoke tests you can disable **Confirm email** so sign-up returns a session immediately; otherwise users must confirm via email before signing in.
5. **Grant admin (manual):** in **Authentication → Users**, copy the user’s UUID, then run in the SQL Editor (replace the placeholder UUID):

```sql
update public.user_roles
set role = 'admin'
where user_id = '00000000-0000-0000-0000-000000000000';
```

If no `user_roles` row exists (unlikely after signup), use:

```sql
insert into public.user_roles (user_id, role)
values ('00000000-0000-0000-0000-000000000000', 'admin')
on conflict (user_id) do update set role = excluded.role;
```

6. Run `npm run dev`, register a test user, open `/dashboard` after login. Log in as the admin user and open `/admin`. Non-admins who visit `/admin` are redirected to `/unauthorized`.

## Getting started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site. The page hot-reloads as you edit files.

### Available scripts

| Script          | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the Next.js development server |
| `npm run build` | Create a production build            |
| `npm start`     | Run the production build             |
| `npm run lint`  | Lint the project with ESLint         |

## Customizing the content

To rebrand the site for a different trainer, edit `lib/trainer-content.ts`:

- `trainerName`, `siteTagline` — used across metadata and footer
- `hero`, `heroImage` — top-of-page content
- `sessions` — weekly class list (typed by `Session` in `lib/types.ts`)
- `about` — bio, credentials, gallery images
- `testimonials` — client quotes
- `finalCta`, `footer` — closing CTA and footer details

If you point to images on a new external host, add it to `next.config.ts` under `images.remotePatterns`.

## Deployment

Built to deploy on [Vercel](https://vercel.com/new) with zero configuration. Any platform that supports a standard Next.js production build (`npm run build` + `npm start`) will also work.
