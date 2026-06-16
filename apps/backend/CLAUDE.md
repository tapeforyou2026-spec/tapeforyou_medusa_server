# Tapes For You — Medusa v2 Backend

Standalone Medusa v2 backend for the Tapes For You e-commerce platform.
Deployed on Render. Database on Supabase PostgreSQL. Frontend is a separate Next.js app.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Medusa v2 (`@medusajs/medusa` 2.15.2) |
| Language | TypeScript (compiled to `.medusa/server/`) |
| Database | Supabase PostgreSQL (port 6543, connection pooler) |
| Redis | Upstash (production) / in-memory fallback (dev) |
| File Storage | Cloudflare R2 (production) / local disk (dev) |
| Node | ≥ 20 (Render uses 20.18.0) |
| Package Manager | npm 10.9.2 |

---

## Project Structure

```
apps/backend/
├── medusa-config.ts          ← Main Medusa config (DB, CORS, modules)
├── tsconfig.json             ← TypeScript config (outDir: .medusa/server)
├── package.json              ← Scripts: build, start, dev
├── render.yaml               ← Render deployment config
├── instrumentation.ts        ← OpenTelemetry (commented out)
├── jest.config.js
├── .env.example              ← Template for all environment variables
├── src/
│   ├── modules/              ← 5 custom modules
│   │   ├── review/
│   │   ├── coupon/
│   │   ├── blog/
│   │   ├── analytics/
│   │   └── wishlist/
│   ├── api/
│   │   ├── middlewares.ts    ← Auth guards for wishlist + reviews
│   │   ├── admin/custom/     ← Admin custom route
│   │   └── store/            ← 12 store routes
│   ├── migration-scripts/
│   │   └── initial-data-seed.ts  ← Auto-runs on first db:migrate
│   ├── scripts/
│   │   ├── seed-tape-products.ts ← Run manually after initial seed
│   │   └── delete-demo-products.ts
│   ├── subscribers/
│   │   ├── order-placed.ts
│   │   └── customer-created.ts
│   ├── admin/                ← Admin UI customizations + i18n
│   ├── jobs/
│   ├── links/
│   └── workflows/
└── docs/
    └── auth-api.md
```

---

## Custom Modules

All modules live in `src/modules/`. Each has `models/`, `service.ts`, `index.ts`.
Migrations are in `src/modules/<name>/migrations/` (generated via `medusa db:generate`).

| Module key | Table | Description |
|---|---|---|
| `review` | `review` | Product reviews — approved by admin before display |
| `coupon` | `coupon` | Percentage/fixed discount codes with expiry + usage limits |
| `blog` | `blog_post` | Blog posts with slug, tags, publish state |
| `analytics` | `analytics_event` | Event tracking (product views, add-to-cart, etc.) |
| `wishlist` | `wishlist_item` | Per-customer wishlist (requires customer auth) |

---

## API Routes

### Store routes (`src/api/store/`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/store/reviews` | Public | List approved product reviews |
| POST | `/store/reviews` | Customer required | Submit a review |
| GET POST DELETE | `/store/wishlist` | Customer required | Customer wishlist |
| GET | `/store/blog` | Public | List published blog posts |
| GET | `/store/blog/:slug` | Public | Single blog post |
| POST | `/store/coupons/validate` | Public | Validate a coupon code |
| POST | `/store/analytics/event` | Public | Track analytics event |
| POST | `/store/checkout/submit` | Public | Checkout submission |
| POST | `/store/contact` | Public | Contact form |
| GET | `/store/custom` | Public | General custom endpoint |
| GET | `/store/custom/search` | Public | Product search |
| GET | `/store/custom/best-sellers` | Public | Best seller products |
| GET | `/store/custom/featured-products` | Public | Featured products |
| GET | `/store/custom/related-products` | Public | Related products |

### Admin routes (`src/api/admin/`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET POST | `/admin/custom` | Admin required | Custom admin operations |

### Auth middleware (`src/api/middlewares.ts`)

- `/store/wishlist` — all methods require `authenticate("customer", ["bearer", "session"])`
- `/store/reviews` POST — requires customer auth; GET is public

---

## Development

```bash
npm install
npm run dev        # starts on http://localhost:9000
```

Admin panel: `http://localhost:9000/app`

### Environment variables for local dev

Copy `.env.example` to `.env` and fill in values:
```bash
cp .env.example .env
```

Minimum required locally:
```
DATABASE_URL=postgresql://...
JWT_SECRET=any-32-char-string
COOKIE_SECRET=any-32-char-string
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:9000
AUTH_CORS=http://localhost:3000,http://localhost:9000
```

---

## Database

### Run migrations (creates all tables)
```bash
npx medusa db:migrate
```

### Generate migrations for a custom module (after model changes)
```bash
npx medusa db:generate review
npx medusa db:generate coupon
npx medusa db:generate blog
npx medusa db:generate analytics
npx medusa db:generate wishlist
```

### Seed initial store data
Runs automatically on first `db:migrate`. Seeds:
- Default Store, Sales Channel, Publishable API Key
- Europe region (EUR) + 7 country tax regions
- European Warehouse stock location
- Standard + Express shipping options
- 4 demo products (T-Shirt, Sweatshirt, Sweatpants, Shorts)

### Seed tape product catalog (run manually)
```bash
npx medusa exec ./src/scripts/seed-tape-products.ts
```
Seeds: India region (INR), 5 tape categories, 7 tape products with INR pricing.
**Requires initial-data-seed to have run first.**

Products seeded:
- BOPP Packaging Tape (3 size variants, ₹89–₹189)
- Masking Tape (2 variants, ₹89–₹109)
- Double Sided Tape (2 variants, ₹149–₹229)
- Foam Tape (2 variants, ₹159–₹249)
- Brown Packaging Tape (₹119)
- Cello Tape (2 variants, ₹59–₹79)
- Duct Tape (2 variants, ₹299–₹599)

---

## Build & Deploy

### Build
```bash
npm run build    # runs: medusa build → outputs to .medusa/server/
```

### Start (production)
```bash
npm run start    # runs: medusa start → reads from .medusa/server/
```

---

## Render Deployment

Configured via `render.yaml` in the repo root.

| Setting | Value |
|---|---|
| Build Command | `npm install && npm run build` |
| Start Command | `npm run start` |
| Node Version | `20.18.0` |
| Health Check | `/health` |

### Environment variables (set in Render dashboard — never commit)

```
NODE_ENV=production
DATABASE_URL=postgresql://postgres.[ref]:[password]@[host].pooler.supabase.com:6543/postgres
REDIS_URL=rediss://:password@host.upstash.io:6379
JWT_SECRET=<64-char random hex>
COOKIE_SECRET=<64-char random hex>
STORE_CORS=https://your-nextjs-app.vercel.app
ADMIN_CORS=https://tapesforyou-backend.onrender.com
AUTH_CORS=https://your-nextjs-app.vercel.app,https://tapesforyou-backend.onrender.com
DISABLE_MEDUSA_ADMIN=false
```

Generate strong secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### First deploy checklist
1. Push this repo to GitHub
2. Create Web Service on Render → connect repo
3. Set all env vars in Render dashboard
4. Deploy → wait for build
5. Open Render Shell → `npx medusa db:migrate`
6. Open Render Shell → `npx medusa exec ./src/scripts/seed-tape-products.ts`

---

## Frontend Integration

The custom Next.js storefront (`tape_for_you_e_com`) connects via REST API only.
**Never connect the frontend directly to PostgreSQL.**

```
Next.js App ──HTTPS──► Render (Medusa :9000) ──► Supabase PostgreSQL
                                               ──► Upstash Redis
```

Required env vars in the Next.js app:
```
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://tapesforyou-backend.onrender.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_DEFAULT_REGION=in
```

Key API endpoints the frontend uses:

| Feature | Endpoint |
|---|---|
| Products | `GET /store/products` |
| Product detail | `GET /store/products?handle=<handle>` |
| Categories | `GET /store/product-categories` |
| Cart create | `POST /store/carts` |
| Add to cart | `POST /store/carts/:id/line-items` |
| Customer register | `POST /auth/customer/emailpass/register` |
| Customer login | `POST /auth/customer/emailpass` |
| Customer profile | `GET /store/customers/me` |
| Wishlist | `GET/POST /store/wishlist` |
| Reviews | `GET/POST /store/reviews` |
| Orders | `GET /store/orders` |
| Validate coupon | `POST /store/coupons/validate` |

---

## Pending (not yet configured)

| Feature | Action Required |
|---|---|
| Redis (production) | Create Upstash instance → set `REDIS_URL` in Render |
| File storage (production) | `npm install @medusajs/file-s3` → uncomment R2 block in `medusa-config.ts` → set R2 env vars |
| Stripe payments | `npm install @medusajs/payment-stripe` → uncomment Stripe block in `medusa-config.ts` |
| Email notifications | Set `RESEND_API_KEY` → wire up in `src/subscribers/order-placed.ts` |
| Rotate DB password | Old password was in `.env` — rotate from Supabase dashboard |
| Strong JWT/Cookie secrets | Replace `supersecret` placeholder before going live |

---

## Bugs Fixed (2026-06-16)

| # | What | Why |
|---|---|---|
| 1 | Removed async IIFE DB check from `medusa-config.ts` | Floating promise caused deployment issues; Medusa ORM handles this internally |
| 2 | `"private": false` → `true` in root `package.json` | Prevented accidental npm publish |
| 3 | `"build": "npm -r build"` → `"turbo build"` | `-r` is not a valid npm flag |
| 4 | Added `/static/` to `.gitignore` | Binary uploaded images should not be in git |
| 5 | `NEXT_PUBLIC_DEFAULT_REGION=dk` → `in` | Products are priced in INR for India |
| 6 | Created `render.yaml` | Render had no config — could not deploy |
| 7 | Removed `pg` from storefront `package.json` | Frontend must not connect directly to Postgres |
| 8 | Added image domains to `next.config.js` | Supabase/R2/placeholder images were blocked |
| 9 | Rewrote `.env.example` | Added all variables with production examples |
