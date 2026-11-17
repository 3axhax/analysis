#!/bin/sh
# Runs only after explicit user approval. Creates and removes a disposable synthetic container.
set -eu
cd "$(dirname "$0")/.."
docker image inspect postgres:18 >/dev/null
container_id=$(docker run -d --rm --tmpfs /var/lib/postgresql:rw --publish 127.0.0.1::5432 -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_DB=interval_synthetic_test postgres:18)
cleanup() { docker stop "$container_id" >/dev/null 2>&1 || true; }
trap cleanup EXIT INT TERM
port=$(docker port "$container_id" 5432/tcp | awk -F: 'NR==1 {print $NF}')
test -n "$port"
ready=0
for attempt in $(seq 1 30); do
  if docker exec "$container_id" psql -U postgres -d interval_synthetic_test -Atqc 'SELECT 1' >/dev/null 2>&1; then ready=1; break; fi
  sleep 1
done
test "$ready" = 1
INTERVAL_SYNTHETIC_CONFIRM=true INTERVAL_SYNTHETIC_DB_URL="postgres://postgres@127.0.0.1:$port/interval_synthetic_test" node scripts/check-interval-migration.cjs
