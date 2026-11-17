#!/bin/sh
# Explicit user approval is required: restores sensitive data into an isolated tmpfs container.
set -eu
cd "$(dirname "$0")/../.."
backup=${1:-}
case "$backup" in "$PWD"/sqlDump/*.dump) ;; *) printf 'Invalid backup path\n' >&2; exit 1 ;; esac
test -s "$backup"
docker image inspect postgres:18 analysis-server_analysis >/dev/null
container_id=$(docker run -d --rm --network none --tmpfs /var/lib/postgresql:rw -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_DB=interval_copy_test postgres:18)
cleanup() { docker stop "$container_id" >/dev/null 2>&1 || true; }
trap cleanup EXIT INT TERM
ready=0
for attempt in $(seq 1 30); do
  if docker exec "$container_id" psql -U postgres -d interval_copy_test -Atqc 'SELECT 1' >/dev/null 2>&1; then ready=1; break; fi
  sleep 1
done
test "$ready" = 1
if ! docker exec -i "$container_id" pg_restore --no-owner --no-acl --exit-on-error -U postgres -d interval_copy_test < "$backup" >/dev/null 2>&1; then
  printf 'Copy restore failed; database details omitted\n' >&2
  exit 1
fi
docker run --rm --network "container:$container_id" \
  --mount "type=bind,src=$PWD/server/src,dst=/work/src,readonly" \
  --mount "type=bind,src=$PWD/server/scripts/check-interval-copy.cjs,dst=/work/scripts/check-interval-copy.cjs,readonly" \
  --mount "type=bind,src=$PWD/server/node_modules,dst=/work/node_modules,readonly" \
  --mount "type=bind,src=$PWD/server/tsconfig.json,dst=/work/tsconfig.json,readonly" \
  -w /work -e INTERVAL_COPY_CONFIRM=true -e INTERVAL_COPY_DB_URL=postgres://postgres@127.0.0.1/interval_copy_test \
  analysis-server_analysis node scripts/check-interval-copy.cjs
