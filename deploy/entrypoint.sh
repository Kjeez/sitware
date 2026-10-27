#!/bin/sh
# Applies pending database migrations (including the wishlist and review modules), then starts
# Medusa.
set -e

echo "Running database migrations..."
npx medusa db:migrate

echo "Starting Medusa..."
exec npx medusa start
