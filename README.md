# Sitware

Sitware's ecommerce storefront and commerce backend, built with Next.js and Medusa. The storefront follows the supplied homepage mockups: warm ivory surfaces, walnut workspace photography, editorial serif headlines and the approved “Designed For Better Work.” brand line.

## Stack

- Next.js 15 storefront with product, collection, cart, checkout and account routes
- Medusa 2.21 backend with its admin dashboard and commerce APIs
- PostgreSQL 16 for local development
- pnpm 10.11.1 workspace managed with Turborepo

## Run locally

Requirements: Node.js 22.22 or newer, pnpm 10.11.1, and Docker Desktop (for the local PostgreSQL database).

1. Install dependencies from the project root: `corepack enable` then `pnpm install`.
2. Start PostgreSQL: `pnpm db:up`.
3. Copy `apps/backend/.env.template` to `apps/backend/.env`. Replace both secrets with separate random values and fill in the shipping values (see "Commerce setup" below).
4. Create the database tables: `pnpm --filter @sitware/backend exec medusa db:migrate`.
5. Configure the store for checkout in India: `pnpm --filter @sitware/backend exec medusa exec ./src/scripts/setup-checkout.ts`.
6. In a terminal, start the backend: `pnpm backend:dev`. Medusa runs at `http://localhost:9000` and its admin is at `http://localhost:9000/app`. Create the first admin user in another terminal: `pnpm --filter @sitware/backend exec medusa user -e admin@sitware.local -p choose-a-password`. Add real products, prices, stock and images in the admin when they are finalized.
7. Copy `apps/storefront/.env.template` to `apps/storefront/.env.local`. Print the publishable key with `pnpm --filter @sitware/backend exec medusa exec ./src/scripts/print-storefront-env.ts` and paste it into `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.
8. Start the storefront: `pnpm storefront:dev`. Open `http://localhost:8000`.

The hero visual is an editorial concept image and may not match final production products. The editorial homepage can render while Medusa is stopped. Store, cart, account and checkout data need a running and configured backend. The site intentionally does not invent product prices, stock, shipping promises, policies or customer reviews. The product cards and copy are ready for the confirmed Shift and Shift Pro catalog details.

## Project structure

### Existing Windows setup without Docker

This computer has a separate local Sitware PostgreSQL 18 instance in `.local/postgres`, listening only on localhost port 5433. Its connection URL is in the ignored `apps/backend/.env`. Database data and credentials under `.local/` are also ignored. This instance does not use the other project's PostgreSQL server on port 5432.

Start it with `corepack pnpm db:local:up`, then run `corepack pnpm dev`. Stop it with `corepack pnpm db:local:down` after stopping the apps. These commands manage the already initialized local instance; on a new computer, follow the Docker setup above instead. Use Node.js 22.22 or newer.

The local schema, India region, storefront publishable key and sales channel are configured. To repeat the local storefront connection setup, run `corepack pnpm --filter @sitware/backend exec medusa exec ./src/scripts/configure-local-storefront.ts`, then restart the storefront. The script reuses its existing key and saves it in the ignored `.env.local` file. Run `setup-checkout.ts` (step 5 above) for the rest of the commerce setup. No sample catalog or prices are added.

- `apps/storefront` — Sitware Next.js storefront and all customer-facing flows
- `apps/backend` — Medusa API and admin
- `compose.yaml` — local PostgreSQL
- `apps/storefront/public/images` — optimized hero image and Sitware logo

## Commerce setup

Backend scripts live in `apps/backend/src/scripts` and run with `pnpm --filter @sitware/backend exec medusa exec ./src/scripts/<name>.ts`. Each one is safe to re-run.

- `setup-checkout.ts` — India region (INR, tax-inclusive prices) and tax region, store defaults, sales channel and publishable key, a stock location with manual fulfillment and an India service zone, one "Standard Delivery" option, a "Return Pickup" option, return reasons, and Cash on Delivery plus Razorpay (when its keys are set) on the region. Shipping prices come from `SHIPPING_FLAT_FEE`, `FREE_SHIPPING_THRESHOLD` (blank for no free shipping) and `RETURN_PICKUP_FEE` in `apps/backend/.env`; re-run after changing them. The free-shipping rule is a price rule on the same option, so Medusa enforces it server-side.
- `print-storefront-env.ts` — prints the storefront variables to paste into Vercel. The storefront resolves its region from the country in the URL, so no region or variant IDs are needed.
- `remove-demo-data.ts` — removes the Medusa starter template's sample apparel, categories, Europe region and warehouse if a database was ever seeded with them. Dry run unless `CONFIRM=yes` is set.
- `migrate-product-images.ts` — uploads product images that still point at `localhost` to S3-compatible storage (Oracle Object Storage) and updates the products. Needs `S3_*` to be set.
- `configure-local-storefront.ts` — local only: writes the publishable key into `apps/storefront/.env.local`.

Optional integrations switch on only when their environment variables are set in `apps/backend/.env` (see `.env.template`): Razorpay payments, Google login, Resend email (emails are logged to the console otherwise), Redis and S3-compatible file storage. Restart Medusa after changing them.

## Useful commands

- `pnpm db:up` — start local PostgreSQL
- `pnpm backend:dev` — start Medusa
- `pnpm storefront:dev` — start Next.js
- `pnpm build` — build workspace apps
- `pnpm lint` — lint workspace apps

## Notes

The installed Medusa DTC starter is MIT licensed; see `LICENSE`. The backend needs a Medusa configuration (region, payment provider, shipping, catalog and publishable key) before transactions can be completed. Configure payment providers and real product data in Medusa Admin before opening checkout to customers. The unused upstream sample seed has been removed because it contains European regions and apparel products.
