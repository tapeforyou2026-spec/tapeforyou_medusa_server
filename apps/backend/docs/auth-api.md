# Authentication API — Tapes For You

All auth endpoints are provided by **Medusa v2's built-in auth system**.  
No custom auth implementation is needed — Medusa handles password hashing (bcrypt), JWT generation, cookie sessions, and token rotation.

Base URL: `http://localhost:9000` (dev) | `https://api.tapeforyou.com` (prod)

All requests need the publishable API key header:
```
x-publishable-api-key: pk_...
```

---

## Registration

### Step 1 — Get a registration token

```
POST /auth/store/emailpass/register
```

**Request body**
```json
{
  "email": "pravin@example.com",
  "password": "MySecurePassword123"
}
```

**Response 200**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**
| Status | Reason |
|--------|--------|
| 400 | Missing email or password |
| 409 | Email already registered |

---

### Step 2 — Create the customer profile

Use the token from Step 1 as a Bearer token.

```
POST /store/customers
Authorization: Bearer <token from step 1>
```

**Request body**
```json
{
  "first_name": "Pravin",
  "last_name": "Kumar",
  "email": "pravin@example.com"
}
```

**Response 201**
```json
{
  "customer": {
    "id": "cus_01HXYZ...",
    "email": "pravin@example.com",
    "first_name": "Pravin",
    "last_name": "Kumar",
    "has_account": true,
    "created_at": "2026-05-30T10:00:00.000Z"
  }
}
```

---

## Login

```
POST /auth/store/emailpass
```

**Request body**
```json
{
  "email": "pravin@example.com",
  "password": "MySecurePassword123"
}
```

**Response 200**

Sets an `httpOnly` session cookie automatically. Also returns a token for Bearer auth.

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**
| Status | Reason |
|--------|--------|
| 401 | Invalid credentials |

---

## Get Profile (authenticated)

```
GET /store/customers/me
```

Requires: `Authorization: Bearer <token>` OR valid session cookie.

**Response 200**
```json
{
  "customer": {
    "id": "cus_01HXYZ...",
    "email": "pravin@example.com",
    "first_name": "Pravin",
    "last_name": "Kumar",
    "phone": "+91 9876543210",
    "has_account": true,
    "addresses": [],
    "created_at": "2026-05-30T10:00:00.000Z",
    "updated_at": "2026-05-30T10:00:00.000Z"
  }
}
```

**Errors**
| Status | Reason |
|--------|--------|
| 401 | Not authenticated |

---

## Update Profile (authenticated)

```
POST /store/customers/me
```

Requires auth. Any field is optional — only include what you want to change.

**Request body**
```json
{
  "first_name": "Pravin",
  "last_name": "Bhoyar",
  "phone": "+91 9876543210",
  "password": "NewPassword456"
}
```

**Response 200**
```json
{
  "customer": { ...updated customer object... }
}
```

---

## Logout

```
DELETE /auth/session
```

Clears the session cookie.

**Response 200**
```json
{}
```

---

## Password Reset

### Request reset email

```
POST /auth/store/emailpass/reset-password
```

**Request body**
```json
{ "identifier": "pravin@example.com" }
```

**Response 201** — Sends reset email (requires Resend configured).

---

### Complete reset

```
POST /store/customers/me/password-reset
```

**Request body**
```json
{
  "token": "<reset token from email>",
  "password": "NewSecurePassword789"
}
```

---

## Addresses (authenticated)

### List addresses

```
GET /store/customers/me/addresses
```

**Response 200**
```json
{
  "addresses": [
    {
      "id": "addr_01HXYZ...",
      "first_name": "Pravin",
      "last_name": "Kumar",
      "address_1": "123 Main Street",
      "address_2": "Apt 4B",
      "city": "Mumbai",
      "province": "Maharashtra",
      "postal_code": "400001",
      "country_code": "in",
      "phone": "+91 9876543210"
    }
  ]
}
```

### Add address

```
POST /store/customers/me/addresses
```

**Request body**
```json
{
  "first_name": "Pravin",
  "last_name": "Kumar",
  "address_1": "123 Main Street",
  "city": "Mumbai",
  "province": "Maharashtra",
  "postal_code": "400001",
  "country_code": "in",
  "phone": "+91 9876543210"
}
```

### Delete address

```
DELETE /store/customers/me/addresses/:addressId
```

---

## Orders (authenticated)

### List orders

```
GET /store/orders?limit=20&offset=0
```

**Response 200**
```json
{
  "orders": [
    {
      "id": "order_01HXYZ...",
      "display_id": 42,
      "status": "completed",
      "payment_status": "captured",
      "fulfillment_status": "shipped",
      "total": 25800,
      "subtotal": 24900,
      "shipping_total": 4900,
      "tax_total": 0,
      "discount_total": 4000,
      "email": "pravin@example.com",
      "created_at": "2026-05-30T10:00:00.000Z",
      "items": [...]
    }
  ],
  "count": 1
}
```

> Note: prices are in **paise** (INR × 100). Divide by 100 to display.

### Get single order

```
GET /store/orders/:orderId
```

**Response 200**
```json
{
  "order": {
    "id": "order_01HXYZ...",
    "display_id": 42,
    "status": "completed",
    "items": [
      {
        "id": "item_01HXYZ...",
        "title": "BOPP Packaging Tape",
        "variant_title": "48mm x 65m",
        "thumbnail": "https://media.tapeforyou.com/...",
        "quantity": 2,
        "unit_price": 12900,
        "subtotal": 25800
      }
    ],
    "shipping_address": {
      "first_name": "Pravin",
      "last_name": "Kumar",
      "address_1": "123 Main Street",
      "city": "Mumbai",
      "province": "Maharashtra",
      "postal_code": "400001",
      "phone": "+91 9876543210"
    },
    "total": 25800,
    "subtotal": 25800,
    "shipping_total": 0,
    "tax_total": 0,
    "created_at": "2026-05-30T10:00:00.000Z"
  }
}
```

**Order status values**

| Status | Description |
|--------|-------------|
| `pending` | Just placed |
| `processing` | Being packed |
| `shipped` | With courier |
| `completed` | Delivered |
| `cancelled` | Cancelled |

---

## Custom API Routes

### Submit a product review (authenticated)

```
POST /store/reviews
Authorization: Bearer <token>
```

**Request body**
```json
{
  "product_id": "prod_01HXYZ...",
  "rating": 5,
  "title": "Excellent quality tape",
  "body": "Sticks perfectly and lasts long. Great for packaging."
}
```

**Response 201**
```json
{
  "review": {
    "id": "rev_01HXYZ...",
    "product_id": "prod_01HXYZ...",
    "rating": 5,
    "title": "Excellent quality tape",
    "body": "Sticks perfectly and lasts long.",
    "is_approved": false,
    "created_at": "2026-05-30T10:00:00.000Z"
  }
}
```

### Wishlist (authenticated)

```
GET    /store/wishlist              → list wishlist items
POST   /store/wishlist              → add item { product_id, variant_id? }
DELETE /store/wishlist              → remove item { product_id }
```

---

## Security Notes

- Passwords are **hashed with bcrypt** by Medusa internally — never stored in plain text.
- JWTs are signed with `JWT_SECRET` (set in `.env`).
- Sessions are stored as `httpOnly` cookies signed with `COOKIE_SECRET`.
- Never expose `JWT_SECRET` or `COOKIE_SECRET` in client-side code.
- CORS is restricted to known domains via `STORE_CORS` env var.
- Rate limiting on auth endpoints is handled by Medusa's built-in middleware.
