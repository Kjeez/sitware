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
3. Copy `apps/backend/.env.template` to `apps/backend/.env`. Replace both secrets with separate random values.
4. In a terminal, start the backend: `pnpm backend:dev`. Medusa runs at `http://localhost:9000` and its admin is at `http://localhost:9000/app`.
5. Create the first admin user in another terminal: `pnpm --filter @sitware/backend exec medusa user -e admin@sitware.local -p choose-a-password`.
6. In the Medusa admin, set up the India region (country India, currency INR), a sales channel, a stock location, a shipping option and a publishable API key. Add real product prices, stock and images when they are finalized.
7. Copy `apps/storefront/.env.template` to `apps/storefront/.env.local`, then paste the Medusa publishable key into `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.
8. Start the storefront: `pnpm storefront:dev`. Open `http://localhost:8000`.

The hero visual is an editorial concept image and may not match final production products. The editorial homepage can render while Medusa is stopped. Store, cart, account and checkout data need a running and configured backend. The site intentionally does not invent product prices, stock, shipping promises, policies or customer reviews. The product cards and copy are ready for the confirmed Shift and Shift Pro catalog details.

## Project structure

- `apps/storefront` — Sitware Next.js storefront and all customer-facing flows
- `apps/backend` — Medusa API and admin
- `compose.yaml` — local PostgreSQL
- `apps/storefront/public/images` — optimized hero image and Sitware logo

## Useful commands

- `pnpm db:up` — start local PostgreSQL
- `pnpm backend:dev` — start Medusa
- `pnpm storefront:dev` — start Next.js
- `pnpm build` — build workspace apps
- `pnpm lint` — lint workspace apps

## Notes

The installed Medusa DTC starter is MIT licensed; see `LICENSE`. The backend needs a Medusa configuration (region, payment provider, shipping, catalog and publishable key) before transactions can be completed. Configure payment providers and real product data in Medusa Admin before opening checkout to customers. The unused upstream sample seed has been removed because it contains European regions and apparel products.
