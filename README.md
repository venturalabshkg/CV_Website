# Portfolio

A personal developer portfolio with a private admin CMS. Public pages read from the database. Drafts stay private.

The local database is SQLite so the site runs without a separate database server. Production can use PostgreSQL by changing the Prisma datasource and running migrations against `DATABASE_URL`.

## Setup

```bash
npm install
npm run setup
npm run dev
```

Open the site at [http://localhost:3000](http://localhost:3000).

Sign in at [http://localhost:3000/admin](http://localhost:3000/admin). The first administrator is created from `.env`:

- Email: `admin@localhost`
- Password: `ChangeMe-Admin-2026`

Change that password before deploying. There is no public registration.

## Environment

Copy `.env.example` to `.env`.

- `DATABASE_URL` — SQLite file locally, PostgreSQL connection string in production
- `AUTH_SECRET` — long random string used to sign the session cookie
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` — used only when the database has no admin yet
- `GITHUB_TOKEN` — optional token with permission to read contribution data
- `GITHUB_USERNAME` — optional username written into the profile on first setup
- `NEXT_PUBLIC_SITE_URL` — canonical URL for the sitemap and share links

Without `GITHUB_TOKEN`, the contribution section stays intact and explains how to enable it.

Uploaded images are stored in `public/uploads`. For production, keep that directory on persistent disk or move the upload route to Cloudinary or Supabase Storage using the same media records.

## What you can edit

Profile, technologies, experience, projects, blog posts, education, social links, the media library, and website settings — including which homepage sections are visible. Published projects and articles appear on the public site. Drafts do not, except as a preview while you are signed in.

Experience and education start empty on purpose. The six projects and the sample article are placeholders you can edit or delete.
