# Zayne Mundo — Portfolio

The source for [zairamundo.com](https://www.zairamundo.com): my portfolio site, plus the private admin I use to run it and my freelance work.

I'm a web designer and front-end developer. I designed and built everything here: the public site, the case study system, the admin, and the freelance tools.

## The public site

- **Homepage:** a scroll-driven video hero that moves through three scenes, then Selected Work, an About story with a sticky portrait, Insights and a contact form.
- **Work** (`/work`): case studies written as stories, covering the problem, the work, a before/after table and measured results.
- **Insights** (`/insights`): articles on design, front-end development and running projects.
- **Built for speed and access:** 99–100 on PageSpeed for mobile and desktop, and 100 for accessibility. Pictures are served as small WebP/AVIF copies and load only as they come near the screen, and the motion respects reduced-motion settings.

## The admin

A private, signed-in area for everything behind the site:

- **Website:** the homepage, About (profile, experience, education and skills), case studies, articles, and page settings, with uploads for pictures, video, the CV and the portfolio PDF.
- **Leads:** contact-form enquiries on a board you can drag between stages, with lost leads kept in an archive.
- **Freelance:** clients, contacts, jobs with tasks, documents with share links, income and expenses, quotes and invoices (one-off, hourly or monthly repeating).
- **Analytics:** page views, visitors, sources, countries and top pages. Visits from the signed-in owner and from automated browsers aren't counted.

## Built with

- [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- [Prisma 7](https://www.prisma.io) on [Neon](https://neon.tech) Postgres
- [Vercel](https://vercel.com) for hosting, Blob storage for uploads, and a daily cron for repeating invoices
- [Resend](https://resend.com) for contact-form email
- [Tiptap](https://tiptap.dev) for the article editor, and [Lucide](https://lucide.dev) for icons

## Running it locally

```bash
npm install          # also generates the Prisma client
npm run dev          # http://localhost:3000
```

It needs a `.env.local` with these settings (values not included here):

| Setting | What it's for |
|---|---|
| `DATABASE_URL` | The Postgres database |
| `BLOB_READ_WRITE_TOKEN` | Uploads to Vercel Blob |
| `RESEND_API_KEY`, `EMAIL_FROM` | Sending contact-form email |
| `NEXT_PUBLIC_SITE_URL` | The site's own address, for links and metadata |
| `ANALYTICS_SALT` | Keeps visitor counts anonymous |
| `CRON_SECRET` | Protects the repeating-invoice cron |

Database changes go through `npx prisma db push`.

## Project layout

```
app/(site)/     the public pages
app/(admin)/    the admin; each section is its own top-level path
app/actions/    server actions for every save, upload and delete
app/components/ shared parts of the public site
app/lib/        database access, caching, image and email helpers
prisma/         the database schema
```

## Deploying

Every push to `master` deploys to production on Vercel.

---

© Zayne Mundo. The code is shared to show how the site is built. Its content, pictures and case studies are not licensed for reuse.
