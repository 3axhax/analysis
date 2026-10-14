-- Explicit psql migration: default dry-run; commit with -v apply=true.
-- Reverse with -v apply=true -v reverse=true, only for expected current state.
\if :{?apply}
\else
\set apply false
\endif
\if :{?reverse}
\else
\set reverse false
\endif
BEGIN;
CREATE TEMP TABLE rdw_phrase_change (old_value text, new_value text) ON COMMIT DROP;
INSERT INTO rdw_phrase_change VALUES ('rdw_Распределение эритроцитов по объему', 'rdw_Распределение эритроцитов по объему_Точность ширины распределения эритроцитов');
\if :reverse
UPDATE rdw_phrase_change SET old_value = new_value, new_value = old_value;
\endif
LOCK TABLE "analysisPoint" IN SHARE ROW EXCLUSIVE MODE;
DO $$ BEGIN
IF (SELECT count(*) FROM "analysisPoint" WHERE id = 11 AND name = 'rdw') <> 1
OR EXISTS (SELECT 1 FROM "analysisPoint", rdw_phrase_change WHERE id = 11 AND "translationParsing" IS DISTINCT FROM old_value)
THEN RAISE EXCEPTION 'Catalog precondition failed; no changes applied'; END IF;
END $$;
CREATE TEMP TABLE rdw_preserved_state ON COMMIT DROP AS
SELECT count(*) AS total, md5(jsonb_agg(CASE WHEN p.id = 11 THEN to_jsonb(p) - 'translationParsing' ELSE to_jsonb(p) END ORDER BY p.id)::text) AS checksum FROM "analysisPoint" p;
UPDATE "analysisPoint" SET "translationParsing" = new_value FROM rdw_phrase_change WHERE id = 11;
DO $$ BEGIN
IF (SELECT md5(jsonb_agg(CASE WHEN p.id = 11 THEN to_jsonb(p) - 'translationParsing' ELSE to_jsonb(p) END ORDER BY p.id)::text) FROM "analysisPoint" p) IS DISTINCT FROM (SELECT checksum FROM rdw_preserved_state)
OR (SELECT count(*) FROM "analysisPoint") <> (SELECT total FROM rdw_preserved_state)
THEN RAISE EXCEPTION 'Unrelated catalog state changed; rolling back'; END IF;
END $$;
SELECT count(*) AS verified_rows FROM "analysisPoint", rdw_phrase_change WHERE id = 11 AND "translationParsing" = new_value;
\if :apply
COMMIT;
\else
ROLLBACK;
\endif
