-- Default dry-run; apply with -v apply=true; reverse with -v reverse=true.
\if :{?apply}
\else
\set apply false
\endif
\if :{?reverse}
\else
\set reverse false
\endif
BEGIN;
CREATE TEMP TABLE ne_alias_change (old_value text, new_value text) ON COMMIT DROP;
INSERT INTO ne_alias_change VALUES
('neus#_число нейтрофилов_NEU#_NE#_Количество нейтрофилов_Нейтрофилы, абс.', 'neus#_число нейтрофилов_NEU#_NE#_Количество нейтрофилов_Нейтрофилы, абс._NE');
\if :reverse
UPDATE ne_alias_change SET old_value = new_value, new_value = old_value;
\endif
LOCK TABLE "analysisPoint" IN SHARE ROW EXCLUSIVE MODE;
DO $$ BEGIN
IF (SELECT count(*) FROM "analysisPoint" WHERE name = 'neutrophil-count') <> 1
OR EXISTS (SELECT 1 FROM "analysisPoint", ne_alias_change WHERE name = 'neutrophil-count' AND "translationParsing" IS DISTINCT FROM old_value)
THEN RAISE EXCEPTION 'Catalog precondition failed; no changes applied'; END IF;
END $$;
UPDATE "analysisPoint" SET "translationParsing" = new_value FROM ne_alias_change WHERE name = 'neutrophil-count';
SELECT count(*) AS verified_rows FROM "analysisPoint", ne_alias_change WHERE name = 'neutrophil-count' AND "translationParsing" = new_value;
\if :apply
COMMIT;
\else
ROLLBACK;
\endif
