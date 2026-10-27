# Production image for the Sitware Medusa backend (apps/backend).
# The build context is the repository root, because the pnpm workspace and lockfile live there:
#
#   docker build -f apps/backend/Dockerfile --build-arg MEDUSA_BACKEND_URL=https://api.example.com -t sitware-backend .
#
# deploy/docker-compose.yml builds it this way.

# ---- build: install the backend's workspace deps and compile server + admin dashboard ----
FROM node:22-bookworm-slim AS build
WORKDIR /repo
RUN corepack enable

# Manifests first so dependency installation is cached between code changes. The storefront
# manifest is copied only so the workspace matches the lockfile; its dependencies are skipped.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/backend/package.json apps/backend/
COPY apps/storefront/package.json apps/storefront/
RUN pnpm install --frozen-lockfile --filter sitware-commerce --filter "@sitware/backend..."

COPY eslint.config.ts ./
COPY apps/backend apps/backend

# The admin dashboard is compiled with the public backend URL baked in.
ARG MEDUSA_BACKEND_URL
ENV MEDUSA_BACKEND_URL=${MEDUSA_BACKEND_URL}
WORKDIR /repo/apps/backend
RUN pnpm exec medusa build

# ---- runtime: only the compiled server and its production dependencies ----
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /repo/apps/backend/.medusa/server ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

COPY deploy/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Runs as the unprivileged "node" user that the base image provides.
RUN chown -R node:node /app
USER node

EXPOSE 9000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
