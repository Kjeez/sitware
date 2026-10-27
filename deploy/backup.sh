#!/bin/sh
# Nightly Postgres backup for the Sitware store.
#   - dumps the database from the running postgres container
#   - keeps BACKUP_RETENTION_DAYS days of dumps in deploy/backups/
#   - uploads each dump to the PRIVATE Oracle bucket BACKUP_BUCKET (S3-compatible API)
#
# Install (as the VM user, from deploy/):
#   chmod +x backup.sh
#   (crontab -l 2>/dev/null; echo "30 2 * * * cd $(pwd) && ./backup.sh >> backups/backup.log 2>&1") | crontab -
#
# Restore a dump (this replaces the current data; stop the backend first):
#   docker compose stop medusa
#   gunzip -c backups/<file>.sql.gz | docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
#   docker compose start medusa
set -eu

cd "$(dirname "$0")"
set -a
. ./.env
set +a

RETENTION="${BACKUP_RETENTION_DAYS:-14}"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
FILE="backups/sitware-${STAMP}.sql.gz"
mkdir -p backups

echo "[$(date -u)] Dumping database to ${FILE}"
docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --clean --if-exists | gzip > "$FILE"

# A dump that failed half way is still a file; refuse to upload or rotate on an empty one.
if [ ! -s "$FILE" ] || ! gunzip -t "$FILE"; then
  echo "[$(date -u)] Backup file is empty or corrupt; keeping older backups untouched" >&2
  exit 1
fi

if [ -n "${BACKUP_BUCKET:-}" ] && [ -n "${S3_ACCESS_KEY_ID:-}" ]; then
  echo "[$(date -u)] Uploading to bucket ${BACKUP_BUCKET}"
  docker run --rm \
    -e AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY_ID" \
    -e AWS_SECRET_ACCESS_KEY="$S3_SECRET_ACCESS_KEY" \
    -e AWS_DEFAULT_REGION="$S3_REGION" \
    -v "$(pwd)/backups:/backups:ro" \
    --entrypoint sh amazon/aws-cli -c \
    "aws configure set default.s3.addressing_style path && aws s3 cp /backups/$(basename "$FILE") s3://${BACKUP_BUCKET}/db/ --endpoint-url ${S3_ENDPOINT}"
else
  echo "[$(date -u)] BACKUP_BUCKET not set; keeping local copy only"
fi

echo "[$(date -u)] Removing local dumps older than ${RETENTION} days"
find backups -name 'sitware-*.sql.gz' -mtime +"$RETENTION" -delete

echo "[$(date -u)] Backup complete"
