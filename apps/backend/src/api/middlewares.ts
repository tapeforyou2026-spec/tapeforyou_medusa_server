import { defineMiddlewares, authenticate } from "@medusajs/framework/http"

/**
 * Authentication middleware configuration.
 *
 * Medusa v2 built-in routes that are ALREADY protected at the framework level:
 *   GET/POST  /store/customers/me        — customer profile (requires bearer/session)
 *   GET       /store/orders              — customer order list (requires bearer/session)
 *   GET       /store/orders/:id          — single order (requires bearer/session)
 *   POST      /store/customers/me/addresses — add address (requires bearer/session)
 *
 * Custom routes that need EXPLICIT middleware guards (defined below):
 *   ALL       /store/wishlist            — per-customer wishlist
 *   POST      /store/reviews             — submitting a review
 */
export default defineMiddlewares({
  routes: [
    // Wishlist — all methods require customer authentication
    {
      matcher: "/store/wishlist",
      middlewares: [
        authenticate("customer", ["bearer", "session"]),
      ],
    },

    // Reviews — only POST (submission) requires authentication; GET is public
    {
      matcher: "/store/reviews",
      method: ["POST"],
      middlewares: [
        authenticate("customer", ["bearer", "session"]),
      ],
    },

    // Contact — public route, no auth required
    // Analytics — public route, no auth required
    // Blog — public route, no auth required
    // Coupons validate — public route, no auth required
  ],
})
