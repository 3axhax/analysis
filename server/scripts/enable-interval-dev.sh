#!/bin/sh
# Requires explicit user approval: changes local configuration and starts migrations 0055/0056.
set -eu
cd "$(dirname "$0")/../.."
if [ "${INTERVAL_LOCAL_APPROVED:-}" != true ]; then printf 'Explicit local approval required\n' >&2; exit 1; fi
test -f server/.development.env
if [ -e server/.interval.local.env ]; then printf 'Local interval configuration already exists\n' >&2; exit 1; fi
python3 - <<'PY'
from pathlib import Path
import re
if re.search(rb'(?m)^\s*(?:export\s+)?INTERVAL_MODEL_ENABLED\s*=', Path('server/.development.env').read_bytes()):
    raise SystemExit('Interval setting already exists; inspect it before continuing')
PY
umask 077
mkdir -p sqlDump
task_backup="$PWD/sqlDump/0031-before-enable-$(date +%Y%m%d-%H%M%S).dump"
test ! -e "$task_backup"
if ! docker exec postgresAnalysis sh -lc 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$task_backup" 2>/dev/null; then printf 'Backup failed; details omitted\n' >&2; exit 1; fi
test -s "$task_backup"
if ! docker exec -i postgresAnalysis pg_restore -l < "$task_backup" >/dev/null 2>&1; then printf 'Backup verification failed; details omitted\n' >&2; exit 1; fi
# Only aggregate counts leave PostgreSQL; individual records and capability links never do.
preflight=$(docker exec -i postgresAnalysis sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -X -A -t -v ON_ERROR_STOP=1' <<'SQL'
SELECT (SELECT count(*) FROM "analysisResult")||','||(SELECT count(*) FROM "analysisResultPointData")||','||(SELECT count(*) FROM "analysisResultDescription")||','||(SELECT count(*) FROM "analysisResultDescriptionCondition")||','||(SELECT count(*) FROM users)||','||(SELECT count(*) FROM "users-sessions");
SELECT CASE WHEN to_regclass('"analysisPointIntervalValue"') IS NULL AND (SELECT count(*) FROM migrations WHERE name IN ('0055-interval-transition','0056-interval-cutover'))=0 AND (SELECT count(*) FROM migrations WHERE name IN ('0053-pmc-blood-descriptions','0054-pmc-additional-descriptions'))=2 THEN 'READY' ELSE 'NOT_READY' END;
SQL
)
if [ "$(printf '%s\n' "$preflight" | tail -1)" != READY ]; then printf 'Preflight failed; database details omitted\n' >&2; exit 1; fi
before_counts=$(printf '%s\n' "$preflight" | head -1)
printf 'INTERVAL_MODEL_ENABLED=true\n' > server/.interval.local.env
if ! docker compose -f docker-compose.dev.yaml up -d --no-deps --force-recreate server_analysis; then
  printf 'Backend restart failed; no rollback attempted\n' >&2
  exit 1
fi
ready=0
for attempt in $(seq 1 60); do
  if docker exec serverAnalysis node -e "fetch('http://127.0.0.1:5050/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" >/dev/null 2>&1; then ready=1; break; fi
  sleep 1
done
if [ "$ready" != 1 ]; then printf 'Backend did not become ready; no rollback attempted\n' >&2; exit 1; fi
after=$(docker exec -i postgresAnalysis sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -X -A -t -v ON_ERROR_STOP=1' <<'SQL'
SELECT (SELECT count(*) FROM "analysisResult")||','||(SELECT count(*) FROM "analysisResultPointData")||','||(SELECT count(*) FROM "analysisResultDescription")||','||(SELECT count(*) FROM "analysisResultDescriptionCondition")||','||(SELECT count(*) FROM users)||','||(SELECT count(*) FROM "users-sessions");
SELECT CASE WHEN to_regclass('"analysisPointMinValue"') IS NULL AND to_regclass('"analysisPointMaxValue"') IS NULL AND to_regclass('"analysisPointIntervalValue"') IS NOT NULL AND (SELECT count(*) FROM migrations WHERE name IN ('0055-interval-transition','0056-interval-cutover'))=2 AND NOT EXISTS (SELECT 1 FROM "analysisResultDescriptionCondition" c WHERE NOT EXISTS (SELECT 1 FROM "analysisResultIntervalDescriptionCondition" l WHERE l."conditionId"=c.id)) THEN 'READY' ELSE 'NOT_READY' END;
SQL
)
if [ "$(printf '%s\n' "$after" | head -1)" != "$before_counts" ] || [ "$(printf '%s\n' "$after" | tail -1)" != READY ]; then printf 'Post-migration checks failed; no rollback attempted\n' >&2; exit 1; fi
docker exec -i serverAnalysis node <<'NODE'
(async () => {
  const base = 'http://127.0.0.1:5050';
  const get = async (path) => { const r = await fetch(base + path); if (!r.ok) throw Error(); return r.json(); };
  const post = async (path, body) => { const r = await fetch(base + path, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body) }); if (!r.ok) throw Error(); return r.json(); };
  const [points, genders] = await Promise.all([get('/analysisPoint'), get('/gender')]);
  const point = points.find((p) => Array.isArray(p.units) && p.units.length);
  if (!point || !genders[0]?.name) throw Error();
  const saved = await post('/result/save', { ageInDays:10000, gender:genders[0].name, pointData:[{ name:point.name, units:point.units[0], value:'1.125' }] });
  if (!saved.resultId) throw Error();
  const read = await post('/result/get', { resultId:saved.resultId });
  const row = read.result?.analysisResultPointData?.find((item) => item.pointId === point.id);
  if (!row || row.displayValue !== '1.125' || !Array.isArray(row.matchingIntervals)) throw Error();
  const anonymous = await fetch(base + '/admin/intervals/point/1');
  if (![401,403].includes(anonymous.status)) throw Error();
  console.log('Local migration and synthetic HTTP check passed');
})().catch(() => { console.error('Synthetic HTTP check failed; details omitted'); process.exitCode=1; });
NODE
