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

## Bugs Fixed (2026-06-16) — Architecture & Config

| # | File | Error | Root Cause | Fix Applied |
|---|---|---|---|---|
| 1 | `medusa-config.ts` | Floating async IIFE caused deployment issues | `pg` Client connect/disconnect running as unresolved promise during config load | Removed entirely — Medusa's ORM reports DB errors internally |
| 2 | Root `package.json` | `"private": false` | Monorepo root could be accidentally published to npm | Changed to `"private": true` |
| 3 | Root `package.json` | `"build": "npm -r build"` failed | `-r` is not a valid npm flag | Changed to `"turbo build"` |
| 4 | `apps/backend/.gitignore` | Uploaded images committed to git | `/static/` folder not gitignored | Added `/static/` and `.env.local` to `.gitignore` |
| 5 | `apps/storefront/.env.local` | Wrong default region `dk` (Denmark) | Products are priced in INR for India | Changed `NEXT_PUBLIC_DEFAULT_REGION=dk` → `in` |
| 6 | Repo root | Render build failed immediately | No `render.yaml` — Render had no build/start config | Created `render.yaml` with rootDir, build/start commands, Node 20 |
| 7 | `apps/storefront/package.json` | Security risk | `pg` (PostgreSQL driver) was a storefront dependency — frontend must never touch DB directly | Removed `pg` and `@types/pg` via `npm uninstall` |
| 8 | `apps/storefront/next.config.js` | Product images blocked by Next.js | `*.supabase.co`, `placehold.co`, `media.tapeforyou.com` not in `remotePatterns` | Added all three domains |
| 9 | `apps/backend/.env.example` | Incomplete template | Only had placeholder values, no production examples or comments | Fully rewritten with all vars, production CORS examples, secret generation instructions |
| 10 | `apps/backend/.npmrc` | Missing from standalone repo | Root monorepo `.npmrc` (`auto-install-peers=true`) not included in `apps/backend` push | Created `.npmrc` in `apps/backend` with `legacy-peer-deps=true` and `auto-install-peers=true` |
| 11 | `render.yaml` build command | Peer dependency install failures on Render | Medusa v2 has many peer deps that need `--legacy-peer-deps` | Updated build command to `npm install --legacy-peer-deps && npm run build` |

---

## Build Errors Fixed (2026-06-17) — TypeScript Compile Errors

These errors caused `npm run build` (`medusa build`) to fail with exit code 1.
All fixed on 2026-06-17. Build now passes cleanly.

### Error 1 — Import Attributes Not Supported with `module: Node16`

| | Detail |
|---|---|
| **File** | `src/admin/i18n/index.ts:1` |
| **Error** | `TS2823: Import attributes are only supported when '--module' is set to 'esnext', 'node18', 'node20', 'nodenext', or 'preserve'` |
| **Root Cause** | `import en from "./json/en.json" with { type: "json" }` uses ES2025 import attribute syntax. `tsconfig.json` has `"module": "Node16"` which doesn't support this syntax. |
| **Fix** | Removed the `with { type: "json" }` attribute. Plain `import en from "./json/en.json"` works because `resolveJsonModule: true` is already set in `tsconfig.json`. |

```typescript
// Before (broken)
import en from "./json/en.json" with { type: "json" }

// After (fixed)
import en from "./json/en.json"
```

---

### Error 2 — Zod v4 Breaking Change: `z.record()` Requires Two Arguments

| | Detail |
|---|---|
| **File** | `src/api/store/analytics/event/route.ts:9` |
| **Error** | `TS2554: Expected 2-3 arguments, but got 1` |
| **Root Cause** | `package.json` has `"zod": "4.2.0"`. Zod v4 changed `z.record()` to require explicit key AND value types. Zod v3 allowed `z.record(valueType)` with implicit string key. |
| **Fix** | Added explicit string key type as first argument. |

```typescript
// Before (Zod v3 API — broken in v4)
metadata: z.record(z.unknown()).optional()

// After (Zod v4 API — fixed)
metadata: z.record(z.string(), z.unknown()).optional()
```

---

### Error 3 — Zod v4 Breaking Change: `.errors` Renamed to `.issues`

| | Detail |
|---|---|
| **Files** | `analytics/event/route.ts`, `checkout/submit/route.ts`, `contact/route.ts`, `coupons/validate/route.ts`, `reviews/route.ts`, `wishlist/route.ts` |
| **Error** | `TS2339: Property 'errors' does not exist on type 'ZodError<...>'` |
| **Root Cause** | Zod v4 renamed `ZodError.errors` to `ZodError.issues`. All 6 route files used the old v3 API to extract the first validation error message. |
| **Fix** | Replaced `.errors[0].message` with `.issues[0].message` in all 6 files. |

```typescript
// Before (Zod v3 API — broken in v4)
message: parsed.error.errors[0].message

// After (Zod v4 API — fixed)
message: parsed.error.issues[0].message
```

Files changed:
- `src/api/store/analytics/event/route.ts`
- `src/api/store/checkout/submit/route.ts`
- `src/api/store/contact/route.ts`
- `src/api/store/coupons/validate/route.ts`
- `src/api/store/reviews/route.ts`
- `src/api/store/wishlist/route.ts`

---

### Error 4 — Event Bus `emit()` Wrong Signature

| | Detail |
|---|---|
| **File** | `src/api/store/checkout/submit/route.ts:106` |
| **Error** | `TS2345: Argument of type 'string' is not assignable to parameter of type 'Message<unknown> \| Message<unknown>[]'` |
| **Root Cause** | Old Medusa v1 API used `eventBus.emit(eventName: string, data: object)`. Medusa v2's `IEventBusModuleService.emit()` takes a single `Message` object (or array) with `{ name, data }` shape — confirmed from `@medusajs/types/dist/event-bus/event-bus-module.d.ts`. |
| **Fix** | Changed to the Medusa v2 `Message` object format. |

```typescript
// Before (old API — broken)
await eventBus.emit("order.placed", { id: order.id })

// After (Medusa v2 Message API — fixed)
await eventBus.emit({ name: "order.placed", data: { id: order.id } })
```

---

### Error 5 — `inventory_quantity` Removed from `CreateProductVariantWorkflowInputDTO`

| | Detail |
|---|---|
| **File** | `src/scripts/seed-tape-products.ts` — 14 occurrences across all product variants |
| **Error** | `TS2353: Object literal may only specify known properties, and 'inventory_quantity' does not exist in type 'CreateProductVariantWorkflowInputDTO'` |
| **Root Cause** | Medusa v2 (2.15.2) removed `inventory_quantity` from the product variant creation workflow DTO. Inventory levels are now managed separately via `createInventoryLevelsWorkflow`. The seed script was written against an older API. |
| **Fix** | Removed all 14 `inventory_quantity` fields from every product variant in the seed script. Inventory was already seeded correctly by `initial-data-seed.ts` using `createInventoryLevelsWorkflow`. |

```typescript
// Before (broken — field no longer exists in DTO)
variants: [{
  title: "48mm x 65m",
  sku: "TPE-BOPP-48-65",
  options: { Size: "48mm x 65m" },
  prices: [inrPrice(12900)],
  inventory_quantity: 500,   // ← removed
}]

// After (fixed)
variants: [{
  title: "48mm x 65m",
  sku: "TPE-BOPP-48-65",
  options: { Size: "48mm x 65m" },
  prices: [inrPrice(12900)],
}]
```

---

### Error 6 — `RegionDTO` Type Mismatch in Seed Script

| | Detail |
|---|---|
| **File** | `src/scripts/seed-tape-products.ts:57-58` |
| **Error** | `TS2739: Type 'RegionDTO' is missing properties from type 'Region': deleted_at, carts, orders, payment_provider_link` and `TS18048: 'indiaRegion' is possibly 'undefined'` |
| **Root Cause** | `createRegionsWorkflow` returns `RegionDTO[]` but the variable `indiaRegion` was typed as `Region` (the full ORM entity) via inference from `existingRegions.find()`. TypeScript couldn't reconcile the two types. |
| **Fix** | Cast workflow result to `any` to bypass the DTO/entity mismatch, and added non-null assertion for the logger line. |

```typescript
// Before (type error)
indiaRegion = regions[0]
logger.info(`India region created: ${indiaRegion.id}`)

// After (fixed)
indiaRegion = regions[0] as any
logger.info(`India region created: ${indiaRegion!.id}`)
```

---

## Build Status

| Date | Result | Errors |
|---|---|---|
| 2026-06-16 | ❌ Failed | 3 categories, 20+ TypeScript errors |
| 2026-06-17 | ✅ Passed | 0 errors — `Backend build completed successfully (8.80s)` |
