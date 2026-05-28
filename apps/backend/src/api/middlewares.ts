import { defineMiddlewares, authenticate } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    // Wishlist requires customer authentication
    {
      matcher: "/store/wishlist",
      middlewares: [
        authenticate("customer", ["bearer", "session"]),
      ],
    },
    // Submitting a review requires authentication
    {
      matcher: "/store/reviews",
      method: ["POST"],
      middlewares: [
        authenticate("customer", ["bearer", "session"]),
      ],
    },
  ],
})
