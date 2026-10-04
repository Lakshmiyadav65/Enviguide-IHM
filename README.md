# IHM EnviGuide platform

The OceanLedger IHMM compliance platform. Ship owners, managers and admins use it to manage the IHM (Inventory of Hazardous Materials) for their vessels: vessels and decks, hazardous-material mapping, purchase orders, supplier MD/SDoC collection and audits.

| | |
|---|---|
| App | https://ihm-enviguide.vercel.app, also shown at https://www.maricomx.com/login |
| API | https://enviguide.duckdns.org/api/v1 (health check at `/health`) |
| Landing page | https://www.maricomx.com, which lives on the `landing-page` branch under `landing/` until that's merged |
| Task history | [task.md](task.md) |
| Latest work log | [2026-10-05 work log](https://github.com/Lakshmiyadav65/Enviguide-IHM/blob/landing-page/landing/docs/2026-10-05-work-log.md) |

## Repository layout

This is an npm workspaces monorepo.

```
frontend/   React + TypeScript + Vite app (Tailwind, React Router, React Query, Recharts)
  src/pages/  audits, auth, cms, inventory, mapping, public, security, settings, vessels, viewer
backend/    Express + TypeScript API
  src/        config, controller, routes, services, middleware, db, utils
postman/    Postman collection for the API
task.md     checklist of finished work
```

**Backend services:**

- MongoDB as the database
- JWT for authentication
- Multer for uploads, stored in S3-compatible storage when it's configured and on local disk otherwise
- Puppeteer for PDF reports
- Email through Brevo, Resend or SMTP

## Running locally

```bash
npm install          # installs both workspaces
npm run dev          # frontend (http://localhost:5173) and backend (http://localhost:8000) together
npm run lint
```

Per workspace:

```bash
npm run dev -w frontend
npm run build -w frontend      # tsc -b && vite build
npm run dev -w backend         # tsx watch src/server.ts
npm run build -w backend       # tsc
npm run db:seed -w backend
```

Each workspace has its own `.env` file. Git ignores them, so never commit them. The variables are listed below.

### Frontend (`frontend/.env.local`, see `frontend/.env.example`)

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | API base URL. Default `https://enviguide.duckdns.org/api/v1`. Use `http://localhost:8000/api/v1` locally |
| `VITE_USE_MOCK` | `true` uses mock data instead of the API |
| `VITE_APP_NAME`, `VITE_APP_VERSION` | App metadata |
| `VITE_LANDING_URL` | Optional. If set, opening the login page outside the landing page's `/login` frame redirects to this URL. Not set in production |

### Backend (`backend/.env`)

The backend won't start if a required variable is missing ([backend/src/config/env.ts](backend/src/config/env.ts)).

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Signs login tokens |
| `JWT_EXPIRES_IN` | No | Token lifetime. Default `7d` |
| `PORT` | No | Default `8000` |
| `NODE_ENV` | No | `development`, `production` or `test` |
| `CORS_ORIGIN` | No | Allowed frontend origin. Default `http://localhost:5173` |
| `APP_BASE_URL` | No | Public app URL used in links. Default `https://ihm-enviguide.vercel.app` |
| `UPLOAD_DIR`, `MAX_FILE_SIZE_MB` | No | Local upload folder and size limit. Default `./uploads`, `10` |
| `BREVO_API_KEY` | No | Email: Brevo API, preferred when set |
| `RESEND_API_KEY` | No | Email: Resend API, used when Brevo isn't set |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | No | Email: SMTP, used when neither API key is set |
| `EMAIL_FROM` | No | Sender address |
| `EMAIL_TEST_REDIRECT_TO` | No | Dev/staging only: sends every email to this one address instead of the real recipient |
| `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_PUBLIC_BASE_URL`, `S3_FORCE_PATH_STYLE` | No | S3-compatible storage (Supabase, R2, AWS, MinIO). Without these, uploads stay on local disk |
| `LOG_LEVEL` | No | Default `info` in production, `debug` otherwise |

## Deployment

- **Frontend:** Vercel project `enviguide-ihm` (team `lakshmiyadav044-2681s-projects`), connected to this repo.
  - Root directory is `frontend/` and the production branch is `main`.
  - **Every push to `main` deploys to production.** Other branches get preview deployments.
  - Single-page routing comes from [frontend/vercel.json](frontend/vercel.json).
- **Backend:** served at `https://enviguide.duckdns.org`. The landing page forwards `/api/v1/*` there.

## How the landing page fits in

The landing page at maricomx.com is a separate Vercel project (`ihmm-landing-page`):

- **`/login`** shows this app's login (`https://ihm-enviguide.vercel.app/`) inside the page. So the login people see on maricomx.com is whatever this repo's `main` deploys. Make login changes here.
- **App routes** (`/dashboard`, `/vessels/*`, `/administration/*`, `/security/*` and others) are forwarded from maricomx.com to this app, so the product works under one domain.
