# Sitware project notes

- This is a pnpm 10.11.1 workspace. Use Node.js 22.22 or newer.
- `apps/storefront` is the Next.js storefront. `apps/backend` is the Medusa 2 backend.
- Keep Sitware's calm, premium visual direction and approved “Designed For Better Work.” tagline.
- Do not invent catalog prices, stock, delivery promises, support contact details, customer reviews, return terms or privacy/legal copy. Ask Umang for the real business details when they are needed.
- Do not commit `.env` or `.env.local` files, database contents, secrets or generated build output.
- Do not add starter apparel samples or prices. The confirmed product direction is Switch and Switch Pro; product specifications and prices are still to be provided.
- Backend business logic belongs in Medusa workflows. Preserve the Medusa ESLint rules.
