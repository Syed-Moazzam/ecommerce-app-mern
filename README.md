# Voltix — MERN + TypeScript E-Commerce

A full-stack consumer-electronics store with a **customer storefront** and an **admin panel** in one app. Users are routed to the right experience automatically based on their login role. Images are stored on **Cloudinary**, payments run through **Stripe Checkout (test mode)**, and the whole thing is ready to deploy on **Render**.

```
ecommerce-app/
├── client/            # React + Vite + TypeScript + Tailwind (storefront + admin UI)
├── server/            # Node + Express + TypeScript + Mongoose (REST API + serves client build)
├── package.json       # root build/start scripts for the single Render service
└── package-lock.json
```

## Features

**Storefront (customer)**
- Home with hero, category grid, and featured products
- Shop with category filter, search, sort, and pagination
- Product detail with image gallery and related products
- Cart (persists in `localStorage`)
- Stripe-hosted checkout, order confirmation, and order history

**Admin panel**
- Dashboard with revenue / orders / catalog stats
- Product CRUD with multi-image Cloudinary upload
- Category CRUD with image upload
- Order management with status updates
- Auto-redirect to `/admin` on login for admin accounts

**Platform**
- JWT auth with role-based route guards (client and server)
- Server-side re-pricing at checkout (never trusts client prices)
- Stripe webhook marks orders paid and decrements stock
- Clean, layered folder structure (config / models / controllers / routes / middleware)
- Responsive down to mobile, accessible focus states, reduced-motion respected

---

## Tech stack

| Layer     | Choices |
|-----------|---------|
| Frontend  | React 18, Vite, TypeScript, Tailwind CSS, React Router, Axios, lucide-react, react-hot-toast |
| Backend   | Node, Express, TypeScript, Mongoose, JWT, Multer, Cloudinary SDK, Stripe SDK |
| Database  | MongoDB |
| Payments  | Stripe Checkout (test mode) |
| Media     | Cloudinary |
| Hosting   | Render |

---

## Prerequisites

- **Node.js 18+** and npm
- **MongoDB** — either a local install (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A **Cloudinary** account (free tier) — [console](https://cloudinary.com/console)
- A **Stripe** account in **test mode** — [API keys](https://dashboard.stripe.com/test/apikeys)
- **Stripe CLI** (optional, for local webhooks) — [install](https://stripe.com/docs/stripe-cli)

---

## Local setup

### 1. Install dependencies

Install each folder:

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure the backend environment

Copy the example and fill in your values:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/mern_ecommerce   # or your Atlas URI
JWT_SECRET=<a long random string>
JWT_EXPIRES_IN=30d

CLOUDINARY_CLOUD_NAME=<from your Cloudinary console>
CLOUDINARY_API_KEY=<from your Cloudinary console>
CLOUDINARY_API_SECRET=<from your Cloudinary console>

STRIPE_SECRET_KEY=sk_test_<your test secret key>
STRIPE_WEBHOOK_SECRET=whsec_<from stripe listen, see below>

CLIENT_URL=http://localhost:5173

SEED_ADMIN_NAME=Store Admin
SEED_ADMIN_EMAIL=admin@voltix.test
SEED_ADMIN_PASSWORD=Admin@12345
```

### 3. Seed the database

This creates the admin user, the 12 electronics categories (AirPods, Camera, Earphones, Mobile, Mouse, Printers, Processor, Refrigerator, Speakers, Trimmers, TV, Watches) and the product catalog (without images — you'll add those from the admin panel):

```bash
cd server && npm run seed
```

> The client needs no `.env` — it calls `/api` on its own origin, which Vite proxies to `http://localhost:5001` in dev and the server handles directly in production.

### 4. Run the app

Run the server and client in two separate terminals:

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm run dev
```

- Storefront → **http://localhost:5173**
- API → **http://localhost:5001/api/health**

### 5. Log in as admin

Go to `/login` and sign in with the seeded admin (`admin@voltix.test` / `Admin@12345`). You'll be redirected to **`/admin`** automatically. Any other account is treated as a customer and lands on the storefront.

### 6. Upload the product images

In the admin panel:

1. **Categories** → edit a category → upload its image (from the matching `ecommerce-products/<category>` folder).
2. **Products → Add product** (or edit a seeded one) → upload one or more images, set price/stock/category → save.

Uploaded files are streamed to your Cloudinary account; the returned URLs are stored on the product/category and served to the storefront.

---

## Testing Stripe locally

Checkout redirects to Stripe's hosted page. To have orders marked **paid** locally, forward webhooks with the Stripe CLI:

```bash
stripe login
stripe listen --forward-to localhost:5001/api/payment/webhook
```

Copy the `whsec_...` value it prints into `STRIPE_WEBHOOK_SECRET` in `server/.env`, then restart the server.

**Test card:** `4242 4242 4242 4242`, any future expiry, any CVC, any postal code.

> Even without the webhook, the order is created and the success page will show it as *Pending*; the webhook is what flips it to *Paid* and reduces stock.

---

## Deploying to Render

The app deploys as a **single Web Service**: the root `build` compiles the client and server, and the server serves the built client alongside the API.

1. Push this repo to GitHub.
2. In Render: **New → Web Service**, select the repo, then set:
   - **Root Directory:** *(leave blank — repo root)*
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
3. Add environment variables:
   ```
   NODE_ENV=production
   MONGO_URI=<your Atlas connection string>
   JWT_SECRET=<a long random string>
   JWT_EXPIRES_IN=30d
   CLOUDINARY_CLOUD_NAME=<...>
   CLOUDINARY_API_KEY=<...>
   CLOUDINARY_API_SECRET=<...>
   STRIPE_SECRET_KEY=sk_test_<...>
   STRIPE_WEBHOOK_SECRET=whsec_<...>
   CLIENT_URL=https://<your-service>.onrender.com
   ```
   Do **not** set `PORT` (Render injects it) or `VITE_API_URL` (the client calls `/api` on its own origin). Set `CLIENT_URL` to the service's own URL once you know it, then redeploy.
4. **Seed the production DB** once from the service **Shell** tab: `cd server && node dist/utils/seed.js`.
5. **Stripe webhook (production):** in the Stripe dashboard add an endpoint `https://<your-service>.onrender.com/api/payment/webhook` for the `checkout.session.completed` event, then put its signing secret into `STRIPE_WEBHOOK_SECRET` and redeploy.

---

## API reference (summary)

| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| POST | `/api/auth/register` | public | Create account |
| POST | `/api/auth/login` | public | Log in |
| GET | `/api/auth/me` | auth | Current user |
| GET | `/api/categories` | public | List categories |
| POST/PUT/DELETE | `/api/categories/:id` | admin | Manage categories |
| GET | `/api/products` | public | List/filter/search products |
| GET | `/api/products/:slug` | public | Product detail |
| POST/PUT/DELETE | `/api/products/:id` | admin | Manage products |
| POST | `/api/upload` | admin | Upload images to Cloudinary |
| POST | `/api/payment/create-checkout-session` | auth | Start Stripe checkout |
| POST | `/api/payment/webhook` | Stripe | Mark order paid |
| GET | `/api/orders/my` | auth | My orders |
| GET | `/api/orders` | admin | All orders |
| PUT | `/api/orders/:id/status` | admin | Update order status |
| GET | `/api/orders/admin/stats` | admin | Dashboard stats |

---

## Scripts

**Root** (used by Render)
- `npm run build` — install + build client, then install + build server
- `npm start` — start the built server (which also serves the client build)

**server/** — `dev` (local dev server), `build` (tsc), `start` (run built server), `seed` (seed the database)
**client/** — `dev` (Vite dev server), `build`, `preview`

---

## Notes on security

- Product prices are **recomputed on the server** at checkout from the database — the client cart is never trusted for pricing.
- All secrets live in `.env` files (git-ignored) and Render env vars — never commit them.
- Stripe events are verified against the webhook signing secret before any order is marked paid.
