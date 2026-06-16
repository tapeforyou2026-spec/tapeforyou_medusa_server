import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },

  modules: [
    // ── Custom Modules ──────────────────────────────────────────────────────
    {
      resolve: "./src/modules/review",
    },
    {
      resolve: "./src/modules/coupon",
    },
    {
      resolve: "./src/modules/blog",
    },
    {
      resolve: "./src/modules/analytics",
    },
    {
      resolve: "./src/modules/wishlist",
    },

    // ── Payment: Stripe ─────────────────────────────────────────────────────
    // Uncomment after: npm install @medusajs/payment-stripe
    // {
    //   resolve: "@medusajs/payment-stripe",
    //   options: {
    //     apiKey: process.env.STRIPE_API_KEY,
    //     webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    //   },
    // },

    // ── File Storage: Cloudflare R2 ─────────────────────────────────────────
    // Uncomment after: npm install @medusajs/file-s3
    // {
    //   resolve: "@medusajs/file-s3",
    //   options: {
    //     file_url: process.env.R2_PUBLIC_URL,
    //     access_key_id: process.env.R2_ACCESS_KEY_ID,
    //     secret_access_key: process.env.R2_SECRET_ACCESS_KEY,
    //     region: "auto",
    //     bucket: process.env.R2_BUCKET,
    //     endpoint: process.env.R2_ENDPOINT,
    //   },
    // },
  ],
})
