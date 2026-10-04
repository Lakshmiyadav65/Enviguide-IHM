# OceanLedger IHMM: landing page

The marketing site for OceanLedger IHMM, live at **https://www.maricomx.com**. It's a React + Vite single-page app with two Vercel serverless functions, and it forwards the platform's app routes so the whole product sits under one domain.

What changed most recently: [docs/2026-10-05-work-log.md](docs/2026-10-05-work-log.md).

## Pages

| Path | Page |
|---|---|
| `/` | Home ([src/pages/home/](src/pages/home/)) |
| `/industries` | Industries ([src/pages/industries/](src/pages/industries/)) |
| `/book-demo` | Book a demo form. Emails each request to our inbox ([src/pages/BookDemoPage.jsx](src/pages/BookDemoPage.jsx)) |
| `/login` | Shows the EnviGuide platform's login inside the page ([src/pages/LoginPage.jsx](src/pages/LoginPage.jsx)) |

The old `.html` addresses (`/book-demo.html` and so on) redirect to these paths. Any other path falls back to `index.html`, and React Router handles it.

## Project layout

```
api/
  contact.js     POST /api/contact: emails demo requests via Resend
  chat.js        POST /api/chat: Gemini proxy (not used by the site at the moment)
public/          images and videos, served as-is
src/
  App.jsx        routes
  components/    Nav, Footer, chat widget (answers from components/chat/knowledge.js)
  pages/         home, industries, book demo, login
  styles/
docs/            work logs
vercel.json      redirects, forwarding to the platform and API, caching headers, function settings
vite.config.mjs  port 3000, build assets in dist/static/
.vercelignore    keeps Enviguide-IHM/ out of deploys
Enviguide-IHM/   copy of the platform repo. Not part of this site's build. Don't edit the platform here (see below)
```

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000 (site only; /api/* isn't available)
vercel dev         # site plus the /api functions, using settings from .env.local
npm run build      # production build into dist/
npm run lint       # oxlint
```

On localhost, `/login` tries the platform's dev server at `http://localhost:5173` first and uses the live platform if that isn't running.

## Contact form (`/api/contact`)

When someone submits `/book-demo`, the form is sent to [api/contact.js](api/contact.js). The function checks the fields and sends one email through [Resend](https://resend.com):

- **To:** oceanledgerofficial@gmail.com
- **Reply-To:** the customer, so you can just hit Reply
- **Subject:** `Demo request: <Name> (<Company>)`

A hidden `website` field catches bots: if it's filled in, the request is dropped without an error.

| Variable | Required | Default |
|---|---|---|
| `RESEND_API_KEY` | Yes | none |
| `CONTACT_TO_EMAIL` | No | `oceanledgerofficial@gmail.com` (separate several with commas) |
| `CONTACT_FROM_EMAIL` | No | `OceanLedger IHMM <onboarding@resend.dev>` |

`onboarding@resend.dev` is Resend's test sender and only delivers to the email the Resend account belongs to. To send from `noreply@maricomx.com`, verify `maricomx.com` in Resend first, then set `CONTACT_FROM_EMAIL`.

For local testing with `vercel dev`, put the variables in `.env.local`. Git ignores that file. Never commit API keys.

## Deployment

| | |
|---|---|
| Vercel project | `ihmm-landing-page` (team `lakshmiyadav044-2681s-projects`) |
| Domains | `www.maricomx.com` (main), `maricomx.com` redirects to `www` with a 308 |
| Fallback URL | https://ihmm-landing-page-two.vercel.app |
| DNS | GoDaddy |
| How | Vercel CLI from this folder, not connected to git yet |

```bash
vercel deploy --prod     # build and publish
vercel env ls            # show settings
vercel env add NAME production
```

A copy of this code is on the `landing-page` branch of [Lakshmiyadav65/Enviguide-IHM](https://github.com/Lakshmiyadav65/Enviguide-IHM) in `landing/`. Once that branch is merged, the Vercel project can be connected to the repo with Root Directory `landing`, so every push deploys.

## How the platform fits in

The EnviGuide platform is a separate app (repo `Lakshmiyadav65/Enviguide-IHM`, Vercel project `enviguide-ihm`, https://ihm-enviguide.vercel.app). This site connects to it in three ways:

- **`/login`** shows `https://ihm-enviguide.vercel.app/` inside the page. Changes to the login screen belong in the platform repo. Editing the `Enviguide-IHM/` copy in this folder changes nothing on the live site.
- **App routes** (`/dashboard`, `/vessels/*`, `/decks`, `/viewer`, `/mapping`, `/materials`, `/purchase-orders`, `/administration/*`, `/security/*`, `/menu/*`, `/master-data/*`, `/inventory/*`, `/upload/*`, `/assets/*`) are forwarded to the platform, so they work on maricomx.com.
- **`/api/v1/*`** is forwarded to the platform API at `https://enviguide.duckdns.org/api/v1`.

Not forwarded yet: `/admin/dashboard`, `/owner/dashboard`, `/fleet`, `/ship`, `/sub-fleet`, `/upload-po`, `/contact`, `/legacy/reports`, `/old/fleet`. Opened directly, these show the landing page. If one of them needs to work from a direct link, add a rewrite in [vercel.json](vercel.json), placed before the final `/((?!api/).*)` fallback.
