# Tapes For You — Medusa Backend

Monorepo containing the Medusa v2 backend and a default Next.js storefront.
The production frontend is a **separate** custom Next.js app (`tape_for_you_e_com`).

---

## Project Structure

```
tapesforyou-backend/
├── apps/
│   ├── backend/          ← Medusa v2 API (deploy this to Render)
│   └── storefront/       ← Default Medusa storefront (reference only — not deployed)
├── render.yaml           ← Render deployment config (rootDir: apps/backend)
├── turbo.json
└── package.json          ← npm workspaces + Turborepo
```

---

## Tech Stack

- **Backend**: Medusa v2 (`@medusajs/medusa` 2.15.2)
- **Database**: Supabase PostgreSQL (connection pooler, port 6543)
- **Package manager**: npm 10.9.2 with workspaces
- **Build tool**: Turborepo
- **Node**: ≥ 20 (Render: 20.18.0)
- **Language**: TypeScript (`module: Node16`, compiled to `.medusa/server/`)
- **File storage**: Local disk in dev; Cloudflare R2 in production (currently commented out)
- **Redis**: Not yet configured for production; using in-memory fallback

---

## Custom Modules (5 total)

All live under `apps/backend/src/modules/`. Each has `models/`, `service.ts`, `index.ts`.

| Module key | Table | Purpose |
|---|---|---|
| `review` | `review` | Product reviews with approval flow |
| `coupon` | `coupon` | Percentage/fixed discount codes |
| `blog` | `blog_post` | Blog posts with slug, tags, publish state |
| `analytics` | `analytics_event` | Event tracking (page views, etc.) |
| `wishlist` | `wishlist_item` | Per-customer product wishlist |

Migrations generated with:
```bash
npx medusa db:generate <module-name>
```

---

## Database Setup

Database is Supabase PostgreSQL. `DATABASE_URL` is set in `apps/backend/.env` (not committed).

### Run migrations
```bash
cd apps/backend
npx medusa db:migrate
```

### Seed initial store data (runs automatically on first `db:migrate`)
Located at `apps/backend/src/migration-scripts/initial-data-seed.ts`.
Seeds: Store, Sales Channel, Publishable API Key, Europe region (EUR), tax regions,
stock location, fulfillment sets, Standard/Express shipping, 4 demo products.

### Seed tape product catalog
```bash
npx medusa exec ./src/scripts/seed-tape-products.ts
```
Seeds: India region (INR), 5 tape categories, 7 tape products with INR pricing.
Requires initial-data-seed to have run first (needs sales channel + shipping profile).

---

## API Routes

### Store routes (`apps/backend/src/api/store/`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET/POST | `/store/reviews` | POST requires customer | Product reviews |
| GET/POST | `/store/wishlist` | Required | Customer wishlist |
| GET | `/store/blog` | Public | Blog post list |
| GET | `/store/blog/:slug` | Public | Single blog post |
| POST | `/store/coupons/validate` | Public | Validate coupon code |
| POST | `/store/analytics/event` | Public | Track analytics event |
| POST | `/store/checkout/submit` | Public | Checkout submission |
| POST | `/store/contact` | Public | Contact form |
| GET | `/store/custom` | Public | Custom search/featured/related |
| GET | `/store/custom/search` | Public | Product search |
| GET | `/store/custom/best-sellers` | Public | Best seller products |
| GET | `/store/custom/featured-products` | Public | Featured products |
| GET | `/store/custom/related-products` | Public | Related products |

### Admin routes (`apps/backend/src/api/admin/`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET/POST | `/admin/custom` | Admin | Custom admin endpoint |

---

## Development

```bash
# Run backend only
npm run backend:dev

# Run storefront only
npm run storefront:dev

# Run both
npm run dev
```

Backend runs on `http://localhost:9000`.
Admin panel at `http://localhost:9000/app`.
Default storefront on `http://localhost:8000`.

---

## Render Deployment

Configured via `render.yaml` at the repo root.

| Setting | Value |
|---|---|
| Root Directory | `apps/backend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm run start` |
| Node Version | `20.18.0` |
| Health Check | `/health` |

### Required environment variables (set in Render dashboard — never commit)

```
NODE_ENV=production
DATABASE_URL=postgresql://...supabase.com:6543/postgres
REDIS_URL=rediss://:password@host.upstash.io:6379
JWT_SECRET=<64-char random hex>
COOKIE_SECRET=<64-char random hex>
STORE_CORS=https://your-nextjs-app.vercel.app
ADMIN_CORS=https://tapesforyou-backend.onrender.com
AUTH_CORS=https://your-nextjs-app.vercel.app,https://tapesforyou-backend.onrender.com
DISABLE_MEDUSA_ADMIN=false
```

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### First deploy checklist
1. Push to GitHub (confirm `.env` is gitignored)
2. Create Web Service on Render → connect repo
3. Set all env vars in Render dashboard
4. Deploy → wait for build to complete
5. Open Render Shell → run `npx medusa db:migrate`
6. Run tape seed if needed: `npx medusa exec ./src/scripts/seed-tape-products.ts`

---

## Frontend Integration (Custom Next.js App)

The custom storefront (`tape_for_you_e_com`) connects via Medusa's REST API only.
It must **never** connect directly to PostgreSQL.

```
Next.js App → HTTPS → Render (Medusa :9000) → Supabase PostgreSQL
```

Required env vars in the Next.js app:
```
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://tapesforyou-backend.onrender.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_DEFAULT_REGION=in
```

---

## Bugs Fixed (2026-06-16)

1. **`medusa-config.ts`** — Removed async IIFE DB connection check + `pg` import.
   Was a deployment blocker; Medusa's ORM handles connection errors internally.

2. **Root `package.json`** — `"private": false` → `"private": true`.
   Prevents accidental npm publish of the monorepo root.

3. **Root `package.json`** — `"build": "npm -r build"` → `"build": "turbo build"`.
   `-r` is not a valid npm flag; turbo handles workspace builds correctly.

4. **`apps/backend/.gitignore`** — Added `/static/` and `.env.local`.
   Prevents uploaded binary images and local secrets from being committed.

5. **`apps/storefront/.env.local`** — `NEXT_PUBLIC_DEFAULT_REGION=dk` → `in`.
   Products are priced in INR for India; Denmark region was incorrect.

6. **`render.yaml`** — Created with correct rootDir, build/start commands, Node version.
   Without this file Render cannot deploy the Medusa backend.

7. **`apps/storefront/package.json`** — Removed `pg` and `@types/pg` dependencies.
   A Next.js frontend must never connect directly to PostgreSQL.

8. **`apps/storefront/next.config.js`** — Added `*.supabase.co`, `media.tapeforyou.com`,
   and `placehold.co` to `remotePatterns`. Seed product images were being blocked.

9. **`apps/backend/.env.example`** — Rewritten as a complete production-ready template
   with instructions for every variable and production CORS examples.

---

## Pending (not yet configured)

- **Upstash Redis** — Create free instance at upstash.com, set `REDIS_URL` in Render
- **Cloudflare R2** — Install `@medusajs/file-s3`, uncomment R2 block in `medusa-config.ts`
- **Stripe** — Install `@medusajs/payment-stripe`, uncomment Stripe block in `medusa-config.ts`
- **Resend email** — Wire up `RESEND_API_KEY` in `src/subscribers/order-placed.ts`
- **Rotate Supabase password** — Old password was present in `.env` files; rotate from Supabase dashboard
- **Strong JWT/Cookie secrets** — Replace placeholder values before going live
